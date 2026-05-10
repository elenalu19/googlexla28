import React from 'react';
import { BetLine } from '../lib/types';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BetCardProps {
  line: BetLine;
  onSelect: (id: string, pick: 'more' | 'less') => void;
  selectedPick?: 'more' | 'less' | null;
}

export const BetCard: React.FC<BetCardProps> = ({ line, onSelect, selectedPick }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[line.icon] || Icons.Trophy;

  // Determine which side is "Better" based on category
  const isInverse = line.category === 'Placement' || line.category === 'Ranking';

  const handlePick = (type: 'better' | 'worse') => {
    if (isInverse) {
      onSelect(line.id, type === 'better' ? 'less' : 'more');
    } else {
      onSelect(line.id, type === 'better' ? 'more' : 'less');
    }
  };

  const getActivePick = () => {
    if (!selectedPick) return null;
    if (isInverse) {
      return selectedPick === 'less' ? 'better' : 'worse';
    }
    return selectedPick === 'more' ? 'better' : 'worse';
  };

  const currentPick = getActivePick();
  const isPointsBased = !isInverse;
  const betterLabel = isPointsBased ? 'More' : 'Better';
  const worseLabel = isPointsBased ? 'Less' : 'Worse';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 w-full mx-auto">
      {/* Card 1: Selection UI */}
      <div className="bg-white border border-la-border rounded-3xl p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col">
        {/* Decorative gradient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-la-bluebell/5 blur-[100px] -z-10" />
        
        <div className="flex flex-col items-center text-center mb-6">
          <div className="text-[10px] uppercase font-black tracking-[0.3em] text-la-bluebell mb-1 flex items-center gap-2">
            <IconComponent size={14} />
            {line.sport} • {line.category}
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="text-[11px] font-black text-la-dark px-3 py-1 bg-la-border/30 rounded-lg border border-la-border italic inline-flex items-center gap-1.5 uppercase">
              Team USA
            </span>
            {line.opponent && line.opponent.trim() !== "" && (
              <>
                <span className="text-la-text-dim font-black italic text-[10px]">VS</span>
                <span className="text-[11px] font-black text-la-scarlet px-3 py-1 bg-la-scarlet/10 rounded-lg border border-la-scarlet/10 italic">
                  TEAM {line.opponent.replace(/^USA\s+vs\s+/i, '').replace(/^TEAM\s+/i, '').toUpperCase()}
                </span>
              </>
            )}
          </div>
        </div>
        
        <h3 className="text-la-dark font-black text-2xl md:text-3xl mb-8 tracking-tight text-center">
          {line.metric}
        </h3>

        <div className="flex flex-col items-center gap-8">
            {/* The Projection Wheel */}
          <div className="relative w-44 h-44 md:w-56 md:h-56 flex items-center justify-center shrink-0">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="42%"
                fill="none"
                stroke="#E8E5DF"
                strokeWidth="18"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="42%"
                fill="none"
                stroke="url(#gradient-horizontal)"
                strokeWidth="18"
                strokeDasharray="280"
                initial={{ strokeDashoffset: 280 }}
                animate={{ strokeDashoffset: 280 * 0.25 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient-horizontal" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF6B00" />
                  <stop offset="100%" stopColor="#4361EE" />
                </linearGradient>
              </defs>
            </svg>
            <div className="text-center z-10 px-4 max-w-[85%]">
              <div className={`font-black text-la-dark italic tracking-tighter transition-all leading-none ${
                line.line.toString().length >= 6 ? 'text-3xl md:text-4xl' :
                line.line.toString().length >= 4 ? 'text-4xl md:text-5xl' :
                'text-6xl md:text-7xl'
              }`}>{line.line}</div>
            </div>
          </div>

          {/* Selection Buttons */}
          <div className="flex flex-col w-full max-w-sm gap-3">
            {isInverse && (
              <div className="text-[10px] font-black uppercase tracking-widest text-la-text-dim flex items-center justify-center gap-2 opacity-70 mb-1">
                <Icons.Info size={12} /> Lower numbers = Better Success
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                onClick={() => handlePick('better')}
                className={`flex-1 group relative overflow-hidden flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all ${
                  currentPick === 'better' 
                    ? 'bg-la-poppy border-la-poppy text-white shadow-lg' 
                    : 'bg-la-border/5 border-la-border text-la-dark hover:border-la-poppy'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black italic uppercase">{betterLabel}</span>
                  <Icons.ArrowUpRight size={20} className={currentPick === 'better' ? 'text-white' : 'text-la-poppy group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform'} />
                </div>
              </button>
              
              <button
                onClick={() => handlePick('worse')}
                className={`flex-1 group relative overflow-hidden flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all ${
                  currentPick === 'worse' 
                    ? 'bg-la-bluebell border-la-bluebell text-white shadow-lg' 
                    : 'bg-la-border/5 border-la-border text-la-dark hover:border-la-bluebell'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black italic uppercase">{worseLabel}</span>
                  <Icons.ArrowDownRight size={20} className={currentPick === 'worse' ? 'text-white' : 'text-la-bluebell group-hover:translate-x-1 group-hover:translate-y-1 transition-transform'} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Trends & Information */}
      <div className="flex flex-col space-y-6">
        <div className="bg-white border border-la-border rounded-3xl p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] relative overflow-hidden">
          {/* Decorative gradient background */}
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-la-poppy/5 blur-[100px] -z-10" />
          
          <div className="flex justify-center items-center mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-la-text-dim py-1.5 px-4 bg-la-border/20 rounded-full">
              Historical Data (Last 5 Cycles)
            </span>
            {/* Legend removed per user request */}
          </div>
          
          <div className="space-y-10">
            {/* Trend 1: Team Analysis */}
            <div>
              <div className="flex justify-center items-center mb-4 px-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-la-bluebell flex items-center gap-2">
                  <Icons.History size={14} /> 
                  Team USA MISSION HISTORY
                </span>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {line.history.map((point, i) => {
                  const isBetter = isInverse ? point.value < line.line : point.value > line.line;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div 
                        className={`w-full aspect-square rounded-xl flex items-center justify-center text-sm font-black border-2 transition-all ${
                          isBetter
                            ? 'bg-la-success text-white border-la-success' 
                            : 'bg-la-miss text-white border-la-miss'
                        }`}
                      >
                        {point.value}
                      </div>
                      <div className="text-[9px] font-black text-la-text-dim uppercase tracking-tighter">
                        {point.year}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trend 2: Head to Head */}
            {line.opponent && line.opponent.trim() !== "" && (
              <div>
                <div className="flex justify-center items-center mb-4 px-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-la-scarlet flex items-center gap-2">
                    <Icons.Swords size={14} /> 
                    Team USA vs {line.opponent.replace(/^USA\s+vs\s+/i, '').replace(/^TEAM\s+/i, '').toUpperCase()}
                  </span>
                </div>
                {line.headToHead && line.headToHead.length > 0 ? (
                  <div className="grid grid-cols-5 gap-3">
                    {line.headToHead.map((point, i) => {
                      const isBetter = isInverse ? point.value < line.line : point.value > line.line;
                      return (
                        <div key={i} className="flex flex-col items-center gap-2">
                          <div 
                            className={`w-full aspect-square rounded-xl flex items-center justify-center text-sm font-black border-2 transition-all ${
                              isBetter
                                ? 'bg-la-success text-white border-la-success' 
                                : 'bg-la-miss text-white border-la-miss'
                            }`}
                          >
                            {point.value}
                          </div>
                          <div className="text-[9px] font-black text-la-text-dim uppercase tracking-tighter">
                            {point.year}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-la-dark/5 border border-dashed border-la-border rounded-xl p-4 text-center">
                    <p className="text-[10px] font-bold text-la-text-dim uppercase tracking-widest leading-tight">No head-to-head cycles available for this mission profile</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 bg-la-brief text-white p-5 md:p-6 rounded-3xl border border-la-dark/10 shadow-lg relative overflow-hidden text-center">
           {/* Micro-decorative accent */}
           <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-2xl rounded-full translate-x-12 -translate-y-12" />
           
           <Icons.Search size={20} className="text-la-accent shrink-0" />
           <div className="flex flex-col gap-1 z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-la-accent">Mission Brief</span>
              <p className="text-xs text-white/90 italic leading-relaxed font-medium">
                "{line.vibeInsight}"
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
