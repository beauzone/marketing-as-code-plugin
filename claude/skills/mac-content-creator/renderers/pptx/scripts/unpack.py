#!/usr/bin/env python3
"""Unpack and format XML contents of Office files (.docx, .pptx, .xlsx)"""

import random
import stat
import sys
import defusedxml.minidom
import zipfile
from pathlib import Path

# Office files are zips, and the input here is a user-supplied .pptx/.docx/.xlsx
# — realistically "a template someone was sent" (BEA-305). `extractall()`
# sanitises absolute paths and `..` components, so classic traversal is already
# blocked, but it does NOT guard against two things this does:
#
#   * zip symlink members, which on POSIX extract as real symlinks and can point
#     anywhere; a later read of the "extracted" tree then follows them.
#   * decompression bombs — a few KB of archive expanding to gigabytes.
#
# Limits are deliberately generous: a large deck with embedded media is a few
# hundred MB uncompressed at the outside, and Office XML compresses ~10-20x, so
# these bound the pathological case without touching real documents.
MAX_TOTAL_UNCOMPRESSED_BYTES = 1_000_000_000  # 1 GB across the whole archive
MAX_COMPRESSION_RATIO = 300  # per member
# Millions of zero-byte members pass both limits above — each adds 0 bytes and
# has no ratio — while still exhausting inodes on the target filesystem. A
# distinct denial-of-service vector from a decompression bomb (OCR review). Real
# Office files run to hundreds of parts, not tens of thousands.
MAX_MEMBER_COUNT = 100_000


def safe_members(zf: zipfile.ZipFile) -> list[zipfile.ZipInfo]:
    """Every member, or raise on the first unsafe one.

    Raises rather than skips: a document containing a symlink or a bomb is not
    a partially-good document, and silently unpacking the rest would hand the
    caller an incomplete tree it believes is complete.

    The size and ratio checks here read `file_size`/`compress_size` from the zip
    central directory, which is **attacker-declared metadata** — a crafted
    archive can understate `file_size` while the stream decompresses to
    gigabytes. They are a cheap early rejection, not the guarantee. The real
    limit is enforced against bytes actually produced, in `extract_safely()`.
    """
    infolist = zf.infolist()
    if len(infolist) > MAX_MEMBER_COUNT:
        raise ValueError(
            f"Refusing to unpack: archive declares {len(infolist)} members, over the "
            f"{MAX_MEMBER_COUNT} limit — inode exhaustion."
        )

    declared_total = 0
    members = []
    for info in infolist:
        name = info.filename

        mode = info.external_attr >> 16
        if stat.S_ISLNK(mode):
            raise ValueError(f"Refusing to unpack {name!r}: archive contains a symlink member.")

        if name.startswith("/") or ".." in Path(name).parts:
            raise ValueError(f"Refusing to unpack {name!r}: path escapes the output directory.")

        declared_total += info.file_size
        if declared_total > MAX_TOTAL_UNCOMPRESSED_BYTES:
            raise ValueError(
                f"Refusing to unpack: archive declares more than "
                f"{MAX_TOTAL_UNCOMPRESSED_BYTES // 1_000_000} MB uncompressed."
            )
        if info.compress_size > 0:
            ratio = info.file_size / info.compress_size
            if ratio > MAX_COMPRESSION_RATIO:
                raise ValueError(
                    f"Refusing to unpack {name!r}: declared compression ratio "
                    f"{ratio:.1f}x exceeds {MAX_COMPRESSION_RATIO}x — likely a "
                    "decompression bomb."
                )
        members.append(info)
    return members


def extract_safely(zf: zipfile.ZipFile, output_path: Path) -> None:
    """Extract every validated member, counting bytes as they are produced.

    `extractall()` cannot be used for the size limit, because it trusts the
    declared `file_size` and does not stop when the decompressed stream exceeds
    it. Streaming each member through a bounded read enforces the cap against
    what the archive *actually* produces rather than what it claims — the
    difference between a check and an assertion.
    """
    total = 0
    # Resolved once — invariant across the loop, and three syscalls per member
    # otherwise. Also removes the chance of two iterations disagreeing if a
    # parent symlink changes mid-extraction (OCR review).
    resolved_root = output_path.resolve()
    # Everything this call creates — files AND directories — so a failure can
    # leave nothing behind. Tracking only files was not enough: a mid-stream
    # rejection still left the whole directory skeleton standing, which
    # contradicted this function's own "leave nothing behind" claim and was
    # invisible to a test that only counted files (OCR review).
    written: list[Path] = []
    created_dirs: list[Path] = []

    def _mkdirs(directory: Path) -> None:
        """mkdir -p, recording only the levels that did not already exist."""
        missing = []
        probe = directory
        # `probe.resolve()`, not `probe` (OCR review). `output_path` may be a
        # relative string from argv, in which case `probe` is relative and can
        # never equal the always-absolute `resolved_root` — the stop-at-the-root
        # guard was silently inert. The loop still terminated via the exists()
        # and filesystem-root conditions, but the invariant it was written to
        # hold did not.
        while (
            not probe.exists()
            and probe.resolve() != resolved_root
            and probe != probe.parent
        ):
            missing.append(probe)
            probe = probe.parent
        # Recorded BEFORE the mkdir (OCR review): `mkdir(parents=True)` can
        # create several levels and then fail on a later one — a permission
        # error partway down — and anything created before that point would
        # otherwise never be recorded, so cleanup would leave it behind. Levels
        # that were never created just make `rmdir` raise OSError during
        # cleanup, which is already swallowed.
        created_dirs.extend(missing)
        directory.mkdir(parents=True, exist_ok=True)

    try:
        for info in safe_members(zf):
            destination = output_path / info.filename
            # Belt-and-braces on the traversal check already done in safe_members().
            resolved = destination.resolve()
            if resolved != resolved_root and resolved_root not in resolved.parents:
                raise ValueError(
                    f"Refusing to unpack {info.filename!r}: escapes the output directory."
                )

            if info.is_dir():
                _mkdirs(destination)
                continue

            _mkdirs(destination.parent)
            written.append(destination)
            with zf.open(info) as source, open(destination, "wb") as target:
                while True:
                    chunk = source.read(65536)
                    if not chunk:
                        break
                    total += len(chunk)
                    if total > MAX_TOTAL_UNCOMPRESSED_BYTES:
                        raise ValueError(
                            f"Refusing to unpack: archive expanded past "
                            f"{MAX_TOTAL_UNCOMPRESSED_BYTES // 1_000_000} MB of real "
                            "output — decompression bomb."
                        )
                    target.write(chunk)
    except BaseException:
        # `BaseException`, not `Exception` (OCR review): a Ctrl+C mid-stream
        # raises `KeyboardInterrupt`, which is not an `Exception` — so the
        # cleanup was skipped in exactly the case most likely to happen to a
        # human running this by hand, leaving the partial tree this block exists
        # to prevent.
        #
        # Leave nothing behind. The bomb limit fires *mid-stream*, so without
        # this a rejected archive still deposits a partial tree — a truncated
        # file plus the directory skeleton — which is exactly the "incomplete
        # tree the caller believes is complete" that `safe_members()`'s own
        # docstring says this design refuses to produce.
        #
        # `output_path` itself is never removed: the caller created it, and it
        # may have held content before this call.
        for path in written:
            try:
                path.unlink()
            except OSError:
                pass
        # Sorted deepest-first at cleanup time, not relying on insertion order:
        # a parent recorded while processing an early member is otherwise
        # attempted before a sibling directory created later, fails because it
        # is non-empty, and survives.
        for path in sorted(created_dirs, key=lambda d: len(d.parts), reverse=True):
            try:
                path.rmdir()
            except OSError:
                pass
        raise


# Get command line arguments
assert len(sys.argv) == 3, "Usage: python unpack.py <office_file> <output_dir>"
input_file, output_dir = sys.argv[1], sys.argv[2]

# Extract and format
output_path = Path(output_dir)
output_path.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(input_file) as zf:
    extract_safely(zf, output_path)

# Pretty print all XML files
xml_files = list(output_path.rglob("*.xml")) + list(output_path.rglob("*.rels"))
for xml_file in xml_files:
    content = xml_file.read_text(encoding="utf-8")
    dom = defusedxml.minidom.parseString(content)
    xml_file.write_bytes(dom.toprettyxml(indent="  ", encoding="ascii"))

# For .docx files, suggest an RSID for tracked changes
if input_file.endswith(".docx"):
    suggested_rsid = "".join(random.choices("0123456789ABCDEF", k=8))
    print(f"Suggested RSID for edit session: {suggested_rsid}")
