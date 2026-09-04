import React from 'react';
import { InteractiveCard, InteractiveCardProps } from './InteractiveCard';
import { HoloPatternType, HOLO_PATTERNS } from '../../lib/visualConfig';

export interface HoloCardProps extends Omit<InteractiveCardProps, 'holoPattern'> {
  pattern?: HoloPatternType;
  showPatternBadge?: boolean;
}

export const HoloCard: React.FC<HoloCardProps> = ({
  pattern = 'classic',
  showPatternBadge = true,
  variant,
  ...props
}) => {
  const currentPatternMeta = HOLO_PATTERNS.find((p) => p.id === pattern) || HOLO_PATTERNS[1];

  return (
    <div className="relative group">
      <InteractiveCard
        {...props}
        variant={variant || currentPatternMeta.name}
        holoPattern={pattern}
        showBadges={false}
      >
        {showPatternBadge && pattern !== 'none' && (
          <div className="absolute top-2.5 right-2.5 z-30 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-400/50 text-[9px] font-mono font-bold text-cyan-300 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              {currentPatternMeta.name.split(' ')[0]}
            </span>
          </div>
        )}
      </InteractiveCard>
    </div>
  );
};
