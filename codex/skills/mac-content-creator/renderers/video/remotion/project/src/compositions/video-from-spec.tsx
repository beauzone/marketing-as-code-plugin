import React from 'react';
import {AbsoluteFill, CalculateMetadataFunction, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';

export const VIDEO_SCHEMA = z.object({
  meta: z.object({
    fps: z.number().int().positive(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    durationInFrames: z.number().int().positive()
  }),
  brand: z.object({
    background: z.string().default('#0B0F19'),
    foreground: z.string().default('#FFFFFF'),
    accent: z.string().default('#2D6CDF'),
    fontHeading: z.string().default('Inter'),
    fontBody: z.string().default('Inter')
  }),
  scenes: z.array(
    z.object({
      type: z.enum(['title', 'bullets', 'cta']).default('title'),
      title: z.string().optional(),
      bullets: z.array(z.string()).optional(),
      cta: z.string().optional(),
      startFrame: z.number().int().nonnegative(),
      durationInFrames: z.number().int().positive()
    })
  )
});

export type VideoSpec = z.infer<typeof VIDEO_SCHEMA>;

export const DEFAULT_PROPS: VideoSpec = {
  meta: {fps: 30, width: 1920, height: 1080, durationInFrames: 300},
  brand: {
    background: '#0B0F19',
    foreground: '#FFFFFF',
    accent: '#2D6CDF',
    fontHeading: 'Inter',
    fontBody: 'Inter'
  },
  scenes: [
    {type: 'title', title: 'Document Creator Video', startFrame: 0, durationInFrames: 120},
    {
      type: 'bullets',
      title: 'What this demonstrates',
      bullets: ['Brand-pack driven styling', 'Scene-based composition', 'SSR rendering via @remotion/renderer'],
      startFrame: 120,
      durationInFrames: 150
    },
    {type: 'cta', title: 'Next step', cta: 'Provide a video-spec.json and brand pack', startFrame: 270, durationInFrames: 30}
  ]
};

// Derive the composition's duration/fps/dimensions from the supplied spec
// (inputProps) instead of the hard-coded <Composition> defaults. Without this,
// any non-default spec rendered as the default 300-frame 1920×1080 video.
// Falls back to DEFAULT_PROPS.meta when a spec omits meta entirely.
export const calculateVideoMetadata: CalculateMetadataFunction<VideoSpec> = ({props}) => {
  const meta = props?.meta ?? DEFAULT_PROPS.meta;
  return {
    durationInFrames: meta.durationInFrames,
    fps: meta.fps,
    width: meta.width,
    height: meta.height
  };
};

const TitleScene: React.FC<{title: string; brand: VideoSpec['brand']}> = ({title, brand}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});
  const y = spring({frame, fps, config: {damping: 18, mass: 0.6}}) * 18;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: 120
      }}
    >
      <div
        style={{
          fontFamily: brand.fontHeading,
          fontSize: 86,
          fontWeight: 700,
          letterSpacing: -1,
          lineHeight: 1.05,
          opacity,
          transform: `translateY(${18 - y}px)`,
          maxWidth: 1500
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 24,
          width: 220,
          height: 6,
          borderRadius: 999,
          background: brand.accent,
          opacity
        }}
      />
    </AbsoluteFill>
  );
};

const BulletsScene: React.FC<{title: string; bullets: string[]; brand: VideoSpec['brand']}> = ({title, bullets, brand}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame, fps, config: {damping: 18, mass: 0.7}});

  return (
    <AbsoluteFill style={{padding: 140}}>
      <div style={{fontFamily: brand.fontHeading, fontSize: 64, fontWeight: 700, marginBottom: 34}}>{title}</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 22, fontFamily: brand.fontBody, fontSize: 42}}>
        {bullets.map((b, i) => {
          const local = Math.max(0, frame - i * 10);
          const o = interpolate(local, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
          const x = (1 - spring({frame: local, fps, config: {damping: 22, mass: 0.6}})) * 24;
          return (
            <div key={i} style={{opacity: o, transform: `translateX(${x}px)`}}>
              <span style={{color: brand.accent, marginRight: 14}}>•</span>
              {b}
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: 140,
          height: 3,
          width: `${Math.round(t * 600)}px`,
          background: brand.accent,
          borderRadius: 999
        }}
      />
    </AbsoluteFill>
  );
};

const CtaScene: React.FC<{title: string; cta: string; brand: VideoSpec['brand']}> = ({title, cta, brand}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: 140, justifyContent: 'center'}}>
      <div style={{fontFamily: brand.fontHeading, fontSize: 70, fontWeight: 800, marginBottom: 20, opacity}}>{title}</div>
      <div style={{fontFamily: brand.fontBody, fontSize: 44, opacity}}>{cta}</div>
      <div style={{marginTop: 34, width: 520, height: 8, borderRadius: 999, background: brand.accent, opacity}} />
    </AbsoluteFill>
  );
};

export const VideoFromSpec: React.FC<VideoSpec> = (props) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  const current = props.scenes.find(
    (s) => frame >= s.startFrame && frame < s.startFrame + s.durationInFrames
  ) ?? props.scenes[0];

  const localFrame = frame - current.startFrame;

  return (
    <AbsoluteFill
      style={{
        width,
        height,
        background: props.brand.background,
        color: props.brand.foreground
      }}
    >
      <AbsoluteFill style={{opacity: 1}}>
        {current.type === 'title' && <TitleScene title={current.title ?? ''} brand={props.brand} />}
        {current.type === 'bullets' && (
          <BulletsScene title={current.title ?? ''} bullets={current.bullets ?? []} brand={props.brand} />
        )}
        {current.type === 'cta' && <CtaScene title={current.title ?? ''} cta={current.cta ?? ''} brand={props.brand} />}
      </AbsoluteFill>

      {/* simple progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 22,
          left: 0,
          height: 3,
          width: `${Math.round((frame / props.meta.durationInFrames) * 100)}%`,
          background: props.brand.accent
        }}
      />
    </AbsoluteFill>
  );
};
