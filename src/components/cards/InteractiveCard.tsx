import React, { useState, useMemo } from 'react';
import { useTilt, UseTiltOptions } from '../effects/TiltEffect';
import { CardGlare, CardFoil, CardReflection, CardEdgeGlow, CardDepthLayer } from '../effects/HoloEffect';
import { HoloPatternType } from '../../lib/visualConfig';

export interface InteractiveCardProps {
  frontImage: string;
  backImage?: string;
  name?: string;
  set?: string;
  cardNumber?: string;
  variant?: string;
  holoPattern?: HoloPatternType;
  holoIntensity?: number;
  isFlipped?: boolean;
  onFlip?: (flipped: boolean) => void;
  onClick?: () => void;
  width?: string | number;
  aspectRatio?: string;
  className?: string;
  showBadges?: boolean;
  disabledTilt?: boolean;
  tiltOptions?: UseTiltOptions;
  children?: React.ReactNode;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  frontImage,
  backImage = 'https://images.pokemontcg.io/base1/back.png',
  name = 'Collectible Card',
  set,
  cardNumber,
  variant,
  holoPattern = 'classic',
  holoIntensity = 0.75,
  isFlipped: controlledFlipped,
  onFlip,
  onClick,
  width = '100%',
  aspectRatio = '2.5 / 3.5',
  className = '',
  showBadges = false,
  disabledTilt = false,
  tiltOptions,
  children
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const flipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  const { cardRef, tilt, handlers, config } = useTilt({
    disabled: disabledTilt,
    ...tiltOptions
  });

  const handleCardClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }
  };

  // Determine active holographic pattern based on variant if not specified
  const effectiveHoloPattern: HoloPatternType = useMemo(() => {
    if (holoPattern) return holoPattern;
    if (!variant) return 'classic';
    const v = variant.toLowerCase();
    if (v.includes('cosmos') || v.includes('galaxy')) return 'cosmos';
    if (v.includes('secret') || v.includes('rainbow')) return 'secret_rare';
    if (v.includes('gold') || v.includes('gilded')) return 'gold';
    if (v.includes('radiant')) return 'radiant';
    if (v.includes('reverse')) return 'reverse_holo';
    if (v.includes('hyper') || v.includes('alt')) return 'hyper_rare';
    if (v.includes('holo')) return 'classic';
    return 'none';
  }, [holoPattern, variant]);

  // Transform calculation
  const cardTransform = useMemo(() => {
    const scale = tilt.isHovered ? config.scaleFactor : 1;
    const baseRotationY = flipped ? 180 : 0;
    
    // We combine hover tilt rotation with the 180deg flip
    const finalRotY = tilt.rotateY + baseRotationY;
    const finalRotX = tilt.rotateX;

    return `perspective(1000px) rotateX(${finalRotX}deg) rotateY(${finalRotY}deg) scale3d(${scale}, ${scale}, ${scale})`;
  }, [tilt.isHovered, tilt.rotateX, tilt.rotateY, flipped, config.scaleFactor]);

  return (
    <div
      ref={cardRef}
      {...handlers}
      onClick={handleCardClick}
      className={`relative select-none cursor-pointer transition-transform duration-200 ease-out group ${className}`}
      style={{
        width,
        aspectRatio,
        transformStyle: 'preserve-3d',
        transform: cardTransform,
      }}
    >
      {/* Dynamic 3D Card Edge Glow */}
      <CardEdgeGlow
        rotateX={tilt.rotateX}
        rotateY={tilt.rotateY}
        isHovered={tilt.isHovered}
        className="rounded-2xl"
      />

      {/* FRONT FACE */}
      <div
        className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/80 shadow-2xl backface-hidden"
        style={{
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(0deg) translateZ(1px)',
        }}
      >
        {/* Real Front Image */}
        <img
          src={frontImage}
          alt={name}
          className="w-full h-full object-cover rounded-2xl pointer-events-none"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.pokemontcg.io/base1/4_hires.png";
          }}
        />

        {/* Holographic Prismatic Foil Layer */}
        {!flipped && (
          <CardFoil
            pointerX={tilt.pointerX}
            pointerY={tilt.pointerY}
            isHovered={tilt.isHovered}
            pattern={effectiveHoloPattern}
            intensity={holoIntensity}
          />
        )}

        {/* Environmental Reflection */}
        {!flipped && (
          <CardReflection
            pointerX={tilt.pointerX}
            pointerY={tilt.pointerY}
            isHovered={tilt.isHovered}
          />
        )}

        {/* High-Contrast Light Glare */}
        {!flipped && (
          <CardGlare
            pointerX={tilt.pointerX}
            pointerY={tilt.pointerY}
            isHovered={tilt.isHovered}
            maxOpacity={config.glareMaxOpacity}
          />
        )}

        {/* Optional 3D Parallax Badges */}
        {showBadges && (
          <CardDepthLayer depth={25} className="absolute inset-0 pointer-events-none p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              {variant && (
                <span className="px-2 py-0.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-cyan-400/60 text-cyan-300 font-mono text-[9px] font-bold shadow-lg">
                  {variant}
                </span>
              )}
              {effectiveHoloPattern !== 'none' && (
                <span className="px-1.5 py-0.5 rounded bg-violet-950/80 border border-violet-500/50 text-violet-300 font-mono text-[8px] font-bold">
                  HOLO FOIL
                </span>
              )}
            </div>

            {(set || cardNumber) && (
              <div className="self-start px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm border border-slate-700/80 text-slate-300 font-mono text-[9px]">
                {set} {cardNumber ? `• #${cardNumber}` : ''}
              </div>
            )}
          </CardDepthLayer>
        )}

        {/* Injected custom overlay children (e.g. centering lines, defect pins) */}
        {children}
      </div>

      {/* BACK FACE */}
      <div
        className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/80 shadow-2xl backface-hidden"
        style={{
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg) translateZ(1px)',
        }}
      >
        {/* Real Back Image */}
        <img
          src={backImage}
          alt={`${name} Back`}
          className="w-full h-full object-cover rounded-2xl pointer-events-none"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.pokemontcg.io/base1/back.png";
          }}
        />

        {/* Subtle Matte Specular Sheen for card back */}
        {flipped && (
          <CardGlare
            pointerX={tilt.pointerX}
            pointerY={tilt.pointerY}
            isHovered={tilt.isHovered}
            maxOpacity={0.4}
          />
        )}
      </div>
    </div>
  );
};
