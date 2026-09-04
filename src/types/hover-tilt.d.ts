export interface HoverTiltOptions {
  max?: number;
  perspective?: number;
  scale?: number;
  speed?: number;
  axis?: 'x' | 'y' | 'both';
  reset?: boolean;
  easing?: string;
  glare?: boolean;
  maxGlare?: number;
  glarePrerender?: boolean;
}

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  options?: HoverTiltOptions;
  glare?: boolean;
  foil?: boolean;
  foilPattern?: string;
  holoIntensity?: number;
  disabled?: boolean;
}
