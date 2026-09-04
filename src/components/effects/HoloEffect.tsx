import React, { useMemo } from 'react';
import { HoloPatternType } from '../../lib/visualConfig';

export interface HoloProps {
  pointerX: number; // 0 to 1
  pointerY: number; // 0 to 1
  isHovered: boolean;
  pattern?: HoloPatternType;
  intensity?: number; // 0 to 1
  className?: string;
  children?: React.ReactNode;
}

/**
 * 1. CardGlare: Specular light reflection spot tracking pointer coordinates
 */
export const CardGlare: React.FC<{
  pointerX: number;
  pointerY: number;
  isHovered: boolean;
  maxOpacity?: number;
  className?: string;
}> = ({ pointerX, pointerY, isHovered, maxOpacity = 0.65, className = '' }) => {
  const glareStyle = useMemo(() => {
    const x = Math.round(pointerX * 100);
    const y = Math.round(pointerY * 100);
    const opacity = isHovered ? maxOpacity : 0;

    return {
      background: `radial-gradient(
        circle 400px at ${x}% ${y}%,
        rgba(255, 255, 255, 0.8) 0%,
        rgba(255, 255, 255, 0.35) 25%,
        rgba(255, 255, 255, 0.08) 50%,
        transparent 75%
      )`,
      opacity,
      mixBlendMode: 'overlay' as const,
      transition: isHovered ? 'opacity 0.15s ease-out' : 'opacity 0.4s ease-out'
    };
  }, [pointerX, pointerY, isHovered, maxOpacity]);

  return (
    <div 
      className={`absolute inset-0 pointer-events-none rounded-[inherit] z-20 overflow-hidden ${className}`}
      style={glareStyle}
    />
  );
};

/**
 * 2. CardReflection: Environmental lighting sweep across card surface
 */
export const CardReflection: React.FC<{
  pointerX: number;
  pointerY: number;
  isHovered: boolean;
  className?: string;
}> = ({ pointerX, pointerY, isHovered, className = '' }) => {
  const reflectionStyle = useMemo(() => {
    const angle = Math.round(115 + (pointerX - 0.5) * 50 + (pointerY - 0.5) * 40);
    const pos = Math.round((pointerX * 0.6 + pointerY * 0.4) * 100);
    const opacity = isHovered ? 0.35 : 0.08;

    return {
      background: `linear-gradient(
        ${angle}deg,
        transparent ${Math.max(0, pos - 35)}%,
        rgba(255, 255, 255, 0.15) ${pos - 15}%,
        rgba(255, 255, 255, 0.5) ${pos}%,
        rgba(255, 255, 255, 0.15) ${pos + 15}%,
        transparent ${Math.min(100, pos + 35)}%
      )`,
      opacity,
      mixBlendMode: 'color-dodge' as const,
      transition: isHovered ? 'opacity 0.2s ease-out' : 'opacity 0.5s ease-out'
    };
  }, [pointerX, pointerY, isHovered]);

  return (
    <div 
      className={`absolute inset-0 pointer-events-none rounded-[inherit] z-10 overflow-hidden ${className}`}
      style={reflectionStyle}
    />
  );
};

/**
 * 3. CardFoil: Prismatic diffraction grating reproducing pokemon-cards-css visual physics
 */
export const CardFoil: React.FC<{
  pointerX: number;
  pointerY: number;
  isHovered: boolean;
  pattern?: HoloPatternType;
  intensity?: number;
  className?: string;
}> = ({ pointerX, pointerY, isHovered, pattern = 'classic', intensity = 0.75, className = '' }) => {
  if (pattern === 'none') return null;

  const foilStyle = useMemo(() => {
    const posX = Math.round(pointerX * 100);
    const posY = Math.round(pointerY * 100);
    const angle = Math.round(135 + (pointerX - 0.5) * 90 + (pointerY - 0.5) * 90);
    const shiftX = Math.round((pointerX - 0.5) * 60);
    const shiftY = Math.round((pointerY - 0.5) * 60);

    const baseOpacity = isHovered ? intensity : 0.15;

    switch (pattern) {
      case 'cosmos':
        return {
          background: `
            radial-gradient(circle at ${posX}% ${posY}%, rgba(255,255,255,0.7) 0%, transparent 40%),
            radial-gradient(circle at ${100 - posX}% ${100 - posY}%, rgba(6,182,212,0.4) 0%, transparent 50%),
            repeating-conic-gradient(from ${angle}deg at ${posX}% ${posY}%, 
              rgba(255,0,128,0.25) 0deg 30deg, 
              rgba(0,255,255,0.25) 30deg 60deg, 
              rgba(255,255,0,0.25) 60deg 90deg, 
              rgba(0,255,128,0.25) 90deg 120deg, 
              rgba(255,0,128,0.25) 120deg 150deg
            )
          `,
          backgroundSize: '100% 100%, 120% 120%, 80px 80px',
          backgroundPosition: `${shiftX}px ${shiftY}px, ${-shiftX}px ${-shiftY}px, 0 0`,
          opacity: baseOpacity,
          mixBlendMode: 'color-dodge' as const,
        };

      case 'secret_rare':
        return {
          background: `
            repeating-linear-gradient(
              ${angle}deg,
              rgba(255, 0, 100, 0.45) 0%,
              rgba(255, 200, 0, 0.45) 12%,
              rgba(0, 255, 120, 0.45) 24%,
              rgba(0, 200, 255, 0.45) 36%,
              rgba(180, 0, 255, 0.45) 48%,
              rgba(255, 0, 100, 0.45) 60%
            ),
            linear-gradient(
              ${angle + 90}deg,
              rgba(255,255,255,0.4) 0%,
              transparent 40%,
              rgba(255,255,255,0.6) 50%,
              transparent 60%,
              rgba(255,255,255,0.4) 100%
            )
          `,
          backgroundSize: '250% 250%, 100% 100%',
          backgroundPosition: `${posX * 2}% ${posY * 2}%, center`,
          opacity: baseOpacity * 1.1,
          mixBlendMode: 'color-dodge' as const,
        };

      case 'gold':
        return {
          background: `
            radial-gradient(circle 350px at ${posX}% ${posY}%, rgba(255,230,120,0.85) 0%, rgba(212,160,23,0.4) 40%, transparent 70%),
            linear-gradient(${angle}deg, rgba(255,215,0,0.3) 0%, rgba(255,255,255,0.6) 50%, rgba(218,165,32,0.3) 100%)
          `,
          opacity: baseOpacity * 0.9,
          mixBlendMode: 'color-dodge' as const,
        };

      case 'radiant':
        return {
          background: `
            repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 2px, transparent 2px, transparent 6px),
            repeating-linear-gradient(-45deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 2px, transparent 2px, transparent 6px),
            linear-gradient(${angle}deg, rgba(6,182,212,0.4) 0%, rgba(168,85,247,0.4) 50%, rgba(236,72,153,0.4) 100%)
          `,
          opacity: baseOpacity,
          mixBlendMode: 'overlay' as const,
        };

      case 'hyper_rare':
        return {
          background: `
            conic-gradient(from ${angle}deg at ${posX}% ${posY}%,
              rgba(255, 0, 0, 0.4) 0deg,
              rgba(255, 165, 0, 0.4) 60deg,
              rgba(255, 255, 0, 0.4) 120deg,
              rgba(0, 255, 0, 0.4) 180deg,
              rgba(0, 200, 255, 0.4) 240deg,
              rgba(147, 51, 234, 0.4) 300deg,
              rgba(255, 0, 0, 0.4) 360deg
            )
          `,
          opacity: baseOpacity * 1.15,
          mixBlendMode: 'color-dodge' as const,
        };

      case 'reverse_holo':
        return {
          background: `
            linear-gradient(${angle}deg, 
              rgba(0,255,255,0.2) 0%, 
              rgba(255,255,255,0.5) 45%, 
              rgba(255,0,128,0.2) 100%
            )
          `,
          opacity: baseOpacity * 0.8,
          mixBlendMode: 'screen' as const,
        };

      case 'classic':
      default:
        return {
          background: `
            repeating-linear-gradient(
              ${angle}deg,
              rgba(255, 0, 0, 0.35) 0%,
              rgba(255, 154, 0, 0.35) 8%,
              rgba(208, 222, 33, 0.35) 16%,
              rgba(79, 220, 74, 0.35) 24%,
              rgba(63, 218, 216, 0.35) 32%,
              rgba(47, 201, 226, 0.35) 40%,
              rgba(28, 127, 238, 0.35) 48%,
              rgba(95, 21, 242, 0.35) 56%,
              rgba(186, 12, 248, 0.35) 64%,
              rgba(251, 7, 217, 0.35) 72%,
              rgba(255, 0, 0, 0.35) 80%
            )
          `,
          backgroundSize: '200% 200%',
          backgroundPosition: `${posX}% ${posY}%`,
          opacity: baseOpacity,
          mixBlendMode: 'color-dodge' as const,
        };
    }
  }, [pointerX, pointerY, isHovered, pattern, intensity]);

  return (
    <div 
      className={`absolute inset-0 pointer-events-none rounded-[inherit] z-15 overflow-hidden transition-opacity duration-300 ${className}`}
      style={foilStyle}
    />
  );
};

/**
 * 4. CardEdgeGlow: Ambient specular illumination around physical card rim
 */
export const CardEdgeGlow: React.FC<{
  rotateX: number;
  rotateY: number;
  isHovered: boolean;
  glowColor?: string;
  className?: string;
}> = ({ rotateX, rotateY, isHovered, glowColor = 'rgba(6, 182, 212, 0.45)', className = '' }) => {
  const glowStyle = useMemo(() => {
    if (!isHovered) {
      return {
        boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        transition: 'box-shadow 0.3s ease-out'
      };
    }

    const shadowX = Math.round(-rotateY * 1.2);
    const shadowY = Math.round(rotateX * 1.2);

    return {
      boxShadow: `
        ${shadowX}px ${shadowY}px 32px -4px ${glowColor},
        0 14px 36px -8px rgba(0, 0, 0, 0.85),
        0 0 0 1px rgba(6, 182, 212, 0.45),
        inset 0 0 12px 1px rgba(255, 255, 255, 0.15)
      `,
      transition: 'box-shadow 0.15s ease-out'
    };
  }, [rotateX, rotateY, isHovered, glowColor]);

  return (
    <div 
      className={`absolute inset-0 pointer-events-none rounded-[inherit] z-25 ${className}`}
      style={glowStyle}
    />
  );
};

/**
 * 5. CardDepthLayer: 3D Parallax floating container
 */
export const CardDepthLayer: React.FC<{
  depth?: number; // in px
  className?: string;
  children: React.ReactNode;
}> = ({ depth = 20, className = '', children }) => {
  return (
    <div 
      className={`relative transform-3d ${className}`}
      style={{ transform: `translateZ(${depth}px)` }}
    >
      {children}
    </div>
  );
};

/**
 * 6. HoloOverlay: High-level composite bundle containing Foil + Reflection + Glare
 */
export const HoloOverlay: React.FC<HoloProps> = ({
  pointerX,
  pointerY,
  isHovered,
  pattern = 'classic',
  intensity = 0.75,
  className = ''
}) => {
  return (
    <div className={`absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden z-10 ${className}`}>
      {/* 1. Base environmental specular sheen */}
      <CardReflection pointerX={pointerX} pointerY={pointerY} isHovered={isHovered} />

      {/* 2. Prismatic diffraction grating */}
      <CardFoil 
        pointerX={pointerX} 
        pointerY={pointerY} 
        isHovered={isHovered} 
        pattern={pattern} 
        intensity={intensity} 
      />

      {/* 3. High-intensity light spot glare */}
      <CardGlare pointerX={pointerX} pointerY={pointerY} isHovered={isHovered} />
    </div>
  );
};

/**
 * 7. HoloSurface: Top-level wrapper for card elements that need holographic styling
 */
export const HoloSurface: React.FC<HoloProps> = ({
  pointerX,
  pointerY,
  isHovered,
  pattern = 'classic',
  intensity = 0.75,
  className = '',
  children
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <HoloOverlay
        pointerX={pointerX}
        pointerY={pointerY}
        isHovered={isHovered}
        pattern={pattern}
        intensity={intensity}
      />
    </div>
  );
};
