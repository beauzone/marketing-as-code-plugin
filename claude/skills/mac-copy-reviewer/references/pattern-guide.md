# AI-pattern detection guide

`rubrics/wr-ai-pattern.yaml` names 42 pattern categories but defines detection for
only the vocabulary tiers, and assigns a severity to only 10 of them. This guide
gives every category a one-line test and a severity, so findings and severities are
the same from run to run. Severities marked **(rubric)** come from the rubric's own
`severity` block and must not be changed here; the rest are this skill's defaults.

Cite the category id exactly as written. Apply the content-type tolerance from
`context_profiles` before flagging the frequency-based ones (marked ≈).

| Category | Flag when | Severity |
|---|---|---|
| **content** | | |
| `significance_inflation` | Ordinary facts framed as pivotal, historic, game-changing or "a testament to" | P0 (rubric) |
| `generic_conclusions` | A closing line that could end any piece ("the future is bright", "the possibilities are endless") | P1 (rubric) |
| `hedge_stacking` | Two or more hedges on one claim ("may potentially", "could arguably help") | P1 |
| `vague_attribution` | Claims credited to unnamed authorities ("experts say", "studies show", "many believe") | P1 |
| `filler_context` | Opening context the reader already has ("In today's fast-paced world…") | P2 |
| `false_balance` | A reflexive "on the other hand" that adds no real counterpoint | P2 |
| `unsupported_superlatives` | "best", "most", "leading", "unmatched" with no evidence in the sentence | P1 |
| `empty_enthusiasm` | Exclamation or excitement with no content ("We're thrilled!", "Exciting news!") | P2 |
| **language** | | |
| `tier_1_vocabulary` | Any tier-1 word (company rules override) | P1 (rubric) |
| `tier_2_cluster` | Two or more tier-2 words in one paragraph | P2 (rubric) |
| `tier_3_density` ≈ | A tier-3 word above `tier_3_density_threshold` of the words | P2 |
| `copula_avoidance` | "serves as", "stands as", "acts as" where "is" would do | P1 (rubric) |
| `nominalization` | A verb turned into a noun phrase ("make a decision", "provide an explanation of") | P2 |
| `adverb_overuse` ≈ | Intensifying adverbs on most claims ("truly", "incredibly", "seamlessly") | P2 |
| `passive_overuse` ≈ | Passive voice hides who acts in most sentences of a section | P2 |
| `transition_phrases` | Stock connectors opening sentences ("Moreover", "Furthermore", "Additionally") | P2 (rubric) |
| **structure** | | |
| `uniform_rhythm` ≈ | Most sentences in a section within a few words of the same length | P2 (rubric) |
| `formulaic_challenges` | The "Challenges… However… Despite this…" template, or "not just X, but Y" | P1 (rubric) |
| `listicle_padding` | Bullets that each restate the same point, or a list where prose would do | P2 |
| `rule_of_three_overuse` ≈ | Triplets used reflexively (more than one per section) | P2 |
| `parallel_overstructure` | Every paragraph or bullet built on the same template | P2 |
| `symmetrical_paragraphs` | Paragraphs of near-identical length and shape throughout | P2 |
| `bookend_repetition` | The ending restates the opening almost word for word | P2 |
| `section_label_bloat` | Headings for content too short to need them, or headings in title-case stacks | P2 |
| **communication** | | |
| `chatbot_artifacts` | Assistant residue in the copy ("Sure! Here's…", "Great question", markdown left from a chat) | P0 (rubric) |
| `sycophantic_tone` | Flattering the reader or the subject ("You're absolutely right", "What a brilliant idea") | P0 (rubric) |
| `meta_commentary` | The text describes itself ("This article will explore…", "In this section we'll…") | P1 |
| `apologetic_hedging` | Apologies or disclaimers that weaken the copy ("While I can't be certain…") | P1 |
| `over_explanation` | Explaining what the audience already knows, or the same point twice | P2 |
| `false_collaboration` | "Let's dive in", "Together, we'll…" with no actual collaboration | P2 |
| `permission_seeking` | "If you'd like, I can…", "Let me know if…" in publishable copy | P0 |
| `summary_restatement` | A summary that repeats the body without adding a conclusion | P2 |
| **meta** | | |
| `self_reference` | The writer refers to itself as a model or tool | P0 |
| `capability_disclaimer` | "I don't have access to…", "I can't browse…" | P0 |
| `knowledge_cutoff_mention` | Any mention of a training or knowledge cutoff | P0 |
| `as_an_ai` | "As an AI…" or equivalent | P0 |
| `here_is_what` | "Here is…", "Here's what you need to know" as an opener | P1 |
| `in_conclusion_marker` | "In conclusion", "To sum up", "In summary" | P2 |
| `i_hope_this_helps` | "I hope this helps" or any sign-off to a requester | P0 |
| `certainly_opener` | "Certainly!", "Absolutely!", "Of course!" opening a section | P0 |
| `feel_free` | "Feel free to…" | P1 |
| `rhetorical_question_opener` | Opening with a rhetorical question ("Ever wondered…?") | P2 |

**Assistant residue is P0** (`chatbot_artifacts`, `permission_seeking`, the `meta`
markers addressed to a requester): it proves the copy was pasted from a chat and must
never ship.
