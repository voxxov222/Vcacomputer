/**
 * VCA Visual Configuration & Design System Tokens
 * Reference: hover-tilt & pokemon-cards-css architecture adapted for VCA
 */

export interface VCAVisualConfig {
  tilt: boolean;
  tiltFactor: number;
  maxAngle: number;
  scaleFactor: number;
  glare: boolean;
  glareMaxOpacity: number;
  holo: boolean;
  holoIntensity: number;
  parallax: boolean;
  reflection: boolean;
  edgeGlow: boolean;
  reducedMotionSupport: boolean;
}

export const VCA_VISUAL_CONFIG: VCAVisualConfig = {
  tilt: true,
  tiltFactor: 1.5,
  maxAngle: 18,
  scaleFactor: 1.05,
  glare: true,
  glareMaxOpacity: 0.65,
  holo: true,
  holoIntensity: 0.75,
  parallax: true,
  reflection: true,
  edgeGlow: true,
  reducedMotionSupport: true,
};

export type HoloPatternType = 
  | 'none'
  | 'classic'      // Vintage holographic foil
  | 'cosmos'       // Galaxy/Cosmos speckle foil
  | 'secret_rare'  // Textured dynamic diagonal rainbow
  | 'radiant'      // Cross-hatch metallic sheen
  | 'gold'         // Ultra-premium gold leaf specular
  | 'reverse_holo' // Inverted border/art sheen
  | 'hyper_rare';  // Full-card spectral prismatic

export const HOLO_PATTERNS: { id: HoloPatternType; name: string; description: string }[] = [
  { id: 'none', name: 'Standard / Non-Holo', description: 'Matte print finish without reflective coating' },
  { id: 'classic', name: 'Classic Holofoil', description: 'Authentic 90s-era linear rainbow refraction' },
  { id: 'cosmos', name: 'Cosmos / Galaxy Star', description: 'Deep starburst foil with chromatic sparkles' },
  { id: 'secret_rare', name: 'Secret Rare Prismatic', description: 'Dynamic prismatic diffraction with diagonal bands' },
  { id: 'radiant', name: 'Radiant Cross-Hatch', description: 'Subtle criss-cross light-splitting metallic pattern' },
  { id: 'gold', name: 'Gilded Specular Gold', description: 'Rich metallic gold reflection with high-contrast bloom' },
  { id: 'hyper_rare', name: 'Hyper Rare Spectral', description: 'Full-spectrum iridescent color shift across surface' },
];
