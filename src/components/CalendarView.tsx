import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Trophy, Zap, ChevronRight } from 'lucide-react';
import { OLYMPIC_SCHEDULE, PARALYMPIC_SCHEDULE, formatDayToDate } from '../lib/constants';

interface CalendarViewProps {
  currentDay: number;
  isParaMode: boolean;
  onSelectDay: (day: number, isPara: boolean) => void;
  onSelectSport: (day: number, sport: string, isPara: boolean) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ currentDay, isParaMode, onSelectDay, onSelectSport }) => {
  const [hoveredDayInfo, setHoveredDayInfo] = useState<{ day: number, isJuly: boolean, activities: { sport: string, opponent: string }[], iDay: number } | null>(null);

  const julyDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const augustDays = Array.from({ length: 31 }, (_, i) => i + 1);

  const getOlympicDay = (day: number) => {
    if (day < 12 || day > 30) return null;
    return day - 12; 
  };

  const getParalympicDay = (day: number) => {
    if (day < 13 || day > 27) return null;
    return day - 13; 
  };

  const getDayActivities = (day: number, isJuly: boolean) => {
    const iDay = isJuly ? getOlympicDay(day) : getParalympicDay(day);
    if (iDay === null) return null;
    const schedule = isJuly ? OLYMPIC_SCHEDULE : PARALYMPIC_SCHEDULE;
    return schedule[iDay] || null;
  };

  const renderMonth = (monthName: string, days: number[], startOffset: number, isJuly: boolean) => (
    <div className="bg-white border border-la-border rounded-3xl p-8 mb-8 relative shadow-sm">
      <h3 className="text-2xl font-black uppercase tracking-widest text-la-dark mb-6 italic">
        {monthName} <span className="text-la-bluebell">2028</span>
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
          <div key={d} className="text-[10px] font-black text-la-text-dim text-center py-2">
            {d}
          </div>
        ))}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`offset-${i}`} />
        ))}
        {days.map(day => {
          const activities = getDayActivities(day, isJuly);
          const iDay = isJuly ? getOlympicDay(day) : getParalympicDay(day);
          const isSelected = iDay === currentDay && isParaMode === !isJuly;
          const isEventDay = activities !== null;

          return (
            <div key={day} className="relative group">
              <motion.div
                whileHover={isEventDay ? { scale: 1.1, y: -2, zIndex: 10 } : {}}
                onMouseEnter={() => isEventDay && iDay !== null && setHoveredDayInfo({ day, isJuly, activities, iDay })}
                onMouseLeave={() => setHoveredDayInfo(null)}
                onClick={() => isEventDay && iDay !== null && onSelectDay(iDay, !isJuly)}
                className={`
                  aspect-square rounded-2xl border flex flex-col p-2 cursor-pointer transition-all
                  ${isSelected ? 'bg-la-bluebell border-la-bluebell shadow-[0_0_20px_rgba(67,97,238,0.3)]' : isEventDay ? 'bg-la-border/10 border-la-border hover:bg-la-border/30' : 'bg-transparent border-transparent opacity-10 pointer-events-none'}
                `}
              >
                <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-la-dark'}`}>
                  {day}
                </span>
                
                {isEventDay && !isSelected && (
                  <div className="mt-auto flex gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${isJuly ? 'bg-la-bluebell' : 'bg-la-poppy'}`} />
                    {activities.length > 5 && <div className="w-1.5 h-1.5 rounded-full bg-la-border" />}
                  </div>
                )}
              </motion.div>

              {/* Hover Popup */}
              <AnimatePresence>
                {hoveredDayInfo?.day === day && hoveredDayInfo?.isJuly === isJuly && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    onMouseEnter={() => setHoveredDayInfo({ day, isJuly, activities, iDay: iDay! })}
                    onMouseLeave={() => setHoveredDayInfo(null)}
                    className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-64 bg-white border border-la-border shadow-[0_20px_60px_rgba(0,0,0,0.12)] z-[100] rounded-2xl p-4 pointer-events-auto"
                  >
                    <div className="flex items-center justify-between mb-4 border-b border-la-border pb-2">
                      <span className="text-[10px] font-black uppercase text-la-bluebell tracking-widest leading-none">
                        {formatDayToDate(iDay!, !isJuly)} • {isJuly ? 'Olympics' : 'Paralympics'}
                      </span>
                      <span className="text-[8px] font-bold text-la-text-dim">
                        {isJuly ? 'July' : 'August'} {day}
                      </span>
                    </div>
                    
                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                      {activities?.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (iDay !== null) onSelectSport(iDay, act.sport, !isJuly);
                          }}
                          className="w-full flex items-center justify-between group/row p-2 rounded-xl border border-transparent hover:border-la-bluebell/30 hover:bg-la-bluebell/5 transition-all text-left"
                        >
                          <div>
                            <div className="text-[9px] font-black uppercase tracking-tight text-la-dark group-hover/row:text-la-bluebell transition-colors">
                              {act.sport}
                            </div>
                            <div className="text-[7.5px] font-bold text-la-text-dim uppercase tracking-widest">
                              vs {act.opponent}
                            </div>
                          </div>
                          <ChevronRight size={10} className="text-la-text-dim group-hover/row:text-la-bluebell translate-x-0 group-hover/row:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-la-border flex items-center justify-center">
                      <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-la-text-dim">
                        <Zap size={10} className="text-la-poppy animate-pulse" />
                        Jump to this matchup
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto w-full py-10 px-4 custom-scrollbar overflow-y-auto h-full">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 rounded-2xl bg-la-bluebell/20 flex items-center justify-center text-la-bluebell">
          <CalendarIcon size={24} />
        </div>
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-la-dark">Competition Roadmap</h2>
          <p className="text-la-text-dim font-bold uppercase text-[10px] tracking-[0.3em]">Official LA28 Operational Calendar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
        {renderMonth('July', julyDays, 5, true)} {/* July 1, 2028 is a Saturday (offset 5 assuming Mon start) */}
        {renderMonth('August', augustDays, 1, false)} {/* Aug 1, 2028 is a Tuesday (offset 1) */}
      </div>

      <div className="bg-la-sagebrush/5 border border-la-sagebrush/20 rounded-2xl p-6 mt-8 flex items-start gap-4">
        <Trophy className="text-la-sagebrush shrink-0" size={20} />
        <p className="text-sm text-la-sagebrush/80 font-medium italic">
          Tip: Hover over a date to see the full schedule. Click a sport to jump directly to those lines! 
        </p>
      </div>
    </div>
  );
};
