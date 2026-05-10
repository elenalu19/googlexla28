import React from 'react';
import { Badge } from '../lib/types';
import { BADGES } from '../lib/constants';
import { Award, Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface BadgeShopProps {
  ownedBadges: string[];
  flames: number;
  onBuy: (badgeId: string, cost: number) => void;
}

export const BadgeShop: React.FC<BadgeShopProps> = ({ ownedBadges, flames, onBuy }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
      {BADGES.map((badge) => {
        const isOwned = ownedBadges.includes(badge.id);
        const canAfford = flames >= badge.cost;

        return (
          <div
            key={badge.id}
            className={`prof-card flex flex-col gap-5 relative overflow-hidden ${
              isOwned ? 'opacity-60 grayscale-[0.5]' : ''
            }`}
          >
            {isOwned && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 text-la-bluebell bg-la-bluebell/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-la-bluebell/20">
                <CheckCircle2 size={10} />
                Collected
              </div>
            )}

            <div
              className="w-14 h-14 flex items-center justify-center rounded-2xl border shadow-md"
              style={{ backgroundColor: `${badge.color}15`, borderColor: `${badge.color}40` }}
            >
              <Award style={{ color: badge.color }} className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-bold text-xl leading-none text-la-dark">{badge.name}</h3>
              <p className="text-[10px] uppercase font-black text-la-text-dim mt-2 tracking-widest">{badge.tier} Tier Status</p>
            </div>

            <p className="text-[13px] text-la-text-dim font-medium leading-relaxed">
              {badge.description}
            </p>

            <button
              disabled={isOwned || !canAfford}
              onClick={() => onBuy(badge.id, badge.cost)}
              className={`mt-4 w-full py-3.5 rounded-xl font-bold uppercase transition-all text-sm tracking-widest border-2 ${
                isOwned
                  ? 'bg-la-border/10 border-la-border text-la-text-dim cursor-not-allowed'
                  : canAfford
                  ? 'bg-la-bluebell border-la-bluebell text-white hover:bg-la-bluebell/90 shadow-[0_4px_15px_rgba(67,97,238,0.2)]'
                  : 'bg-transparent border-la-border text-la-text-dim cursor-not-allowed'
              }`}
            >
              {isOwned ? 'Equipped' : `${badge.cost.toLocaleString()} Flames`}
            </button>
          </div>
        );
      })}
    </div>
  );
};
