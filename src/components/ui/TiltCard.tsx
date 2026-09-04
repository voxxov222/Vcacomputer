import React, { useMemo } from 'react';
import { useTilt, UseTiltOptions } from '../effects/TiltEffect';
import { CardGlare, CardFoil, CardReflection } from '../effects/HoloEffect';
import { HoloPatternType } from '../../lib/visualConfig';

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  maxAngle?: number;
  scaleFactor?: number;
  perspective?: number;
  glare?: boolean;
  maxGlare?: number;
  foil?: boolean;
  foilPattern?: HoloPatternType;
  foilIntensity?: number;
  reflection?: boolean;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxAngle = 14,
  scaleFactor = 1.04,
  perspective = 1000,
  glare = true,
  maxGlare = 0.45,
  foil = false,
  foilPattern = 'classic',
  foilIntensity = 0.6,
  reflection = true,
  disabled = false,
  onClick,
  style,
  ...restProps
}) => {
  const tiltOptions: UseTiltOptions = useMemo(
    () => ({
      disabled,
      config: {
        maxAngle,
        scaleFactor,
        perspective,
      },
    }),
    [disabled, maxAngle, scaleFactor, perspective]
  );

  const { cardRef, tilt, handlers } = useTilt(tiltOptions);

  const transformStyle = useMemo(() => {
    if (disabled) return {};
    const scale = tilt.isHovered ? scaleFactor : 1;
    return {
      transformStyle: 'preserve-3d' as const,
      transform: `perspective(${perspective}px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: 'transform 0.15s ease-out',
    };
  }, [disabled, tilt.rotateX, tilt.rotateY, tilt.isHovered, scaleFactor, perspective]);

  return (
    <div
      ref={cardRef}
      {...handlers}
      onClick={onClick}
      style={{
        ...transformStyle,
        ...style,
      }}
      className={`relative select-none ${disabled ? '' : 'cursor-pointer'} ${className}`}
      {...restProps}
    >
      {/* Specular glare layer */}
      {glare && !disabled && (
        <CardGlare
          pointerX={tilt.pointerX}
          pointerY={tilt.pointerY}
          isHovered={tilt.isHovered}
          maxOpacity={maxGlare}
        />
      )}

      {/* Environmental reflection layer */}
      {reflection && !disabled && (
        <CardReflection
          pointerX={tilt.pointerX}
          pointerY={tilt.pointerY}
          isHovered={tilt.isHovered}
        />
      )}

      {/* Foil interference layer */}
      {foil && !disabled && (
        <CardFoil
          pointerX={tilt.pointerX}
          pointerY={tilt.pointerY}
          isHovered={tilt.isHovered}
          pattern={foilPattern}
          intensity={foilIntensity}
        />
      )}

      {/* Children Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default TiltCard;
