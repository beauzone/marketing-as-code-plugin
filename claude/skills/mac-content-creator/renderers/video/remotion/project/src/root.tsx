import React from 'react';
import {Composition} from 'remotion';
import {VideoFromSpec, VIDEO_SCHEMA, DEFAULT_PROPS, calculateVideoMetadata} from './compositions/video-from-spec';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="DocumentCreatorVideo"
        component={VideoFromSpec}
        // These are fallbacks only; calculateMetadata overrides them per-spec.
        durationInFrames={DEFAULT_PROPS.meta.durationInFrames}
        fps={DEFAULT_PROPS.meta.fps}
        width={DEFAULT_PROPS.meta.width}
        height={DEFAULT_PROPS.meta.height}
        defaultProps={DEFAULT_PROPS}
        schema={VIDEO_SCHEMA}
        calculateMetadata={calculateVideoMetadata}
      />
    </>
  );
};
