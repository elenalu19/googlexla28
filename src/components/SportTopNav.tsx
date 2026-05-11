import React, { useState } from 'react';
import { ChevronDown, Trophy, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OLYMPIC_SPORTS, PARALYMPIC_SPORTS, TOP_OLYMPIC, TOP_PARALYMPIC, getScheduleForDay } from '../lib/constants';

interface SportTopNavProps {
  selectedSport: string;
  onSelect: (sport: string, isPara: boolean) => void;
  currentDay: number;
  isParaMode: boolean;
}

export const SportTopNav: React.FC<SportTopNavProps> = ({ selectedSport, onSelect, currentDay, isParaMode }) => {
  const [activeDropdown, setActiveDropdown] = useState<'olympics' | 'paralympics' | null>(null);

  const schedule = getScheduleForDay(currentDay, isParaMode);
  const isPlaying = (sport: string) => schedule.includes(sport);

  const renderDropdown = (title: string, sports: string[], type: 'olympics' | 'paralympics') => {
    const isOpen = activeDropdown === type;
    const isOlympic = type === 'olympics';

    const playingSports = sports.filter(s => isPlaying(s));
    const nonPlayingSports = sports.filter(s => !isPlaying(s));

    return (
      <div className="relative">
        <button
          onClick={() => setActiveDropdown(isOpen ? null : type)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
            isOpen 
              ? (isOlympic ? 'bg-la-bluebell text-white border-la-bluebell shadow-[0_0_15px_rgba(67,97,238,0.3)]' : 'bg-la-poppy text-white border-la-poppy shadow-[0_0_15px_rgba(255,107,0,0.3)]')
              : 'bg-white border-la-border text-la-text-dim hover:text-la-dark hover:border-la-bluebell/30 shadow-sm'
          }`}
        >
          {title} <ChevronDown size={10} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-[calc(100%+12px)] left-0 w-[500px] bg-white border border-la-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 p-6 max-h-[450px] overflow-y-auto custom-scrollbar"
            >
              {/* All Sports List */}
              <div className="pb-3 border-b border-la-border mb-3 flex items-center justify-between">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isOlympic ? 'text-la-bluebell' : 'text-la-poppy'}`}>
                  {isOlympic ? 'Olympic' : 'Paralympic'} Disciplines
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                {sports.map((sport) => (
                  <button
                    key={sport}
                    onClick={() => {
                      onSelect(sport, !isOlympic);
                      setActiveDropdown(null);
                    }}
                    className={`text-left text-[11px] py-1.5 transition-all truncate font-black uppercase tracking-tight ${
                      selectedSport === sport 
                        ? (isOlympic ? 'text-la-bluebell' : 'text-la-poppy') 
                        : 'text-la-dark hover:text-la-bluebell translate-x-0 hover:translate-x-1'
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const currentDaySports = Array.from(new Set(
    getScheduleForDay(currentDay, isParaMode).map(s => 
      s.replace(/^(Men's |Women's )/, '')
    )
  )).sort();

  const primarySports = currentDaySports.slice(0, 6);
  const remainingSports = currentDaySports.slice(6);

  return (
    <nav className="flex items-center gap-2 bg-la-background/90 backdrop-blur-md border-b border-la-border h-14 px-8 shrink-0 relative z-50">
      <div className="flex items-center gap-2 flex-1 overflow-x-auto no-scrollbar py-2">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-la-bluebell mr-2 shrink-0">Available:</div>
        
        {primarySports.map((sport) => {
          const isSelected = selectedSport.includes(sport);
          return (
            <button
              key={sport}
              onClick={() => onSelect(sport, isParaMode)}
              className={`px-4 h-8 rounded-full text-[7.5px] font-black uppercase tracking-tight transition-all flex items-center justify-center gap-1.5 border active:scale-95 shrink-0 ${
                isSelected 
                  ? (isParaMode ? 'bg-la-poppy text-white border-la-poppy' : 'bg-la-bluebell text-white border-la-bluebell') 
                  : 'bg-white border-la-border text-la-text-dim hover:text-la-dark hover:border-la-bluebell/30 shadow-sm'
              }`}
            >
              <Trophy size={10} className="shrink-0" />
              <span className="px-0.5 leading-none">{sport}</span>
            </button>
          );
        })}

        {remainingSports.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'olympics' ? null : 'olympics')}
              className={`px-4 h-8 rounded-full text-[7.5px] font-black uppercase tracking-tight transition-all flex items-center justify-center gap-1.5 border active:scale-95 shrink-0 bg-white border-la-border text-la-text-dim hover:text-la-dark hover:border-la-bluebell/30 shadow-sm`}
            >
              <span>+{remainingSports.length} MORE</span>
              <ChevronDown size={10} className={`transition-transform ${activeDropdown === 'olympics' ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'olympics' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-[calc(100%+12px)] left-0 w-[240px] bg-white border border-la-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 p-4 max-h-[300px] overflow-y-auto custom-scrollbar"
                >
                  <div className="grid grid-cols-1 gap-1">
                    {remainingSports.map((sport) => (
                      <button
                        key={sport}
                        onClick={() => {
                          onSelect(sport, isParaMode);
                          setActiveDropdown(null);
                        }}
                        className={`text-left text-[10px] py-2 px-3 rounded-lg transition-all font-black uppercase tracking-tight ${
                          selectedSport.includes(sport)
                            ? (isParaMode ? 'bg-la-poppy/10 text-la-poppy' : 'bg-la-bluebell/10 text-la-bluebell')
                            : 'text-la-dark hover:bg-la-background'
                        }`}
                      >
                        {sport}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="w-[1px] h-4 bg-la-border mx-2" />

      {/* Manual Selectors preserved but repositioned/cleaned up if needed */}
      <div className="flex items-center gap-2">
        {renderDropdown('All Olympics', OLYMPIC_SPORTS, 'olympics')}
        {renderDropdown('All Paralympics', PARALYMPIC_SPORTS, 'paralympics')}
      </div>

      
      {/* Backdrop for Dropdowns */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </nav>
  );
};
