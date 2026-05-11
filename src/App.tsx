import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db, signInWithGoogle, logout, OperationType, handleFirestoreError } from './lib/firebase';
import { 
  Flame, 
  ShoppingBag, 
  RefreshCw,
  Info,
  Award,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
  Sparkles,
  Zap,
  CalendarDays,
  LogIn,
  LogOut
} from 'lucide-react';
import { Balance } from './components/Balance';
import { BetCard } from './components/BetCard';
import { BadgeShop } from './components/BadgeShop';
import { QuizModal } from './components/QuizModal';
import { SportTopNav } from './components/SportTopNav';
import { CalendarView } from './components/CalendarView';
import { MyLineups } from './components/MyLineups';
import { VibeQuiz } from './components/VibeQuiz';
import { 
  INITIAL_FLAMES, 
  STAKE_AMOUNT, 
  MOCK_LINES, 
  PARALYMPIC_SPORTS, 
  getScheduleForDay, 
  getOpponentForSport, 
  OLYMPIC_SCHEDULE, 
  PARALYMPIC_SCHEDULE,
  formatDayToDate
} from './lib/constants';
import { BetLine, Selection } from './lib/types';
import { generateNewLines } from './lib/gemini';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [flames, setFlames] = useState(INITIAL_FLAMES);
  const [ownedBadges, setOwnedBadges] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'picks' | 'shop' | 'calendar' | 'lineups' | 'quiz'>('picks');
  const [selectedSport, setSelectedSport] = useState("Men's Artistic Gymnastics");
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [lines, setLines] = useState<BetLine[]>(MOCK_LINES);
  const [loadingLines, setLoadingLines] = useState(false);
  const [lineError, setLineError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState(0);
  const [isParaMode, setIsParaMode] = useState(false);
  const totalDays = isParaMode ? 14 : 18; // 0 to 18 for Olympics, 0 to 14 for Paralympics

  // Lineup Builder State
  const [lineup, setLineup] = useState<Selection[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  // Auth & Sync Logic
  useEffect(() => {
    // Initial connection test
    const testConnection = async () => {
      try {
        await getDoc(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('offline')) {
          console.error("Firebase connection check failed. Client is offline.");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Ensure user doc exists
        const userRef = doc(db, 'users', user.uid);
        try {
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              flames: INITIAL_FLAMES,
              ownedBadges: [],
              createdAt: serverTimestamp()
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`, user);
        }

        // Subscribe to user changes
        const sub = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setFlames(data.flames);
            setOwnedBadges(data.ownedBadges || []);
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`, user);
        });
        setLoading(false);
        return () => sub();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateFlames = async (newAmount: number) => {
    if (!user) {
      setFlames(newAmount);
      return;
    }
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, { flames: newAmount });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`, user);
    }
  };

  const addBadge = async (badgeId: string, cost: number) => {
    if (!user) {
      setFlames(prev => prev - cost);
      setOwnedBadges(prev => [...prev, badgeId]);
      return;
    }
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, {
        flames: flames - cost,
        ownedBadges: [...ownedBadges, badgeId]
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`, user);
    }
  };

  const isParalympic = (sport: string) => {
    const s = sport.toLowerCase();
    return s.includes('para') || s.includes('wheelchair') || PARALYMPIC_SPORTS.some(ps => s.includes(ps.toLowerCase()));
  };

  const filteredLines = useMemo(() => {
    return lines.filter(l => l.sport.includes(selectedSport) || selectedSport === 'All');
  }, [lines, selectedSport]);

  useEffect(() => {
    setCurrentLineIndex(0);
  }, [selectedSport]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => setShowNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const handleSelectPick = (lineId: string, pick: 'more' | 'less') => {
    const line = lines.find(l => l.id === lineId);
    if (!line) return;

    setLineup(prev => {
      const exists = prev.find(s => s.line.id === lineId);
      if (exists) {
        if (exists.pick === pick) {
          return prev.filter(s => s.line.id !== lineId);
        }
        return prev.map(s => s.line.id === lineId ? { ...s, pick } : s);
      }
      if (prev.length >= 6) {
        setShowNotification("Maximum 6 picks per lineup!");
        return prev;
      }
      return [...prev, { line, pick }];
    });
  };

  const handleRemoveFromLineup = (lineId: string) => {
    setLineup(prev => prev.filter(s => s.line.id !== lineId));
  };

  const handleBuyBadge = (badgeId: string, cost: number) => {
    if (flames >= cost) {
      addBadge(badgeId, cost);
      setShowNotification(`EQUIPPED: New badge added to your collection!`);
    }
  };

  const handleSubmitLineup = async () => {
    if (lineup.length < 2) {
      setShowNotification("Select at least 2 picks to build a lineup!");
      return;
    }
    if (flames < STAKE_AMOUNT) {
      setIsQuizOpen(true);
      return;
    }

    if (user) {
      const lineupId = Math.random().toString(36).substring(7);
      const lineupRef = doc(db, 'lineups', lineupId);
      try {
        const latestDay = Math.max(...lineup.map(s => s.line.day));
          await setDoc(lineupRef, {
            userId: user.uid,
            selections: lineup.map(s => ({
              lineId: s.line.id,
              pick: s.pick,
              sport: s.line.sport,
              metric: s.line.metric,
              line: s.line.line,
              day: s.line.day
            })),
            stake: STAKE_AMOUNT,
            status: 'pending',
            latestDay,
            isPara: isParaMode,
            createdAt: serverTimestamp()
          });
        await updateFlames(flames - STAKE_AMOUNT);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `lineups/${lineupId}`);
      }
    } else {
      setFlames(prev => prev - STAKE_AMOUNT);
    }

    setShowNotification("Lineup Submitted! Syncing with Team USA Datasets...");
    
    // Simulate results
    setTimeout(async () => {
      const wins = lineup.filter(() => Math.random() > 0.45).length;
      const allWon = wins === lineup.length;
      
      if (allWon) {
        const multipliers: Record<number, number> = { 2: 3, 3: 5, 4: 10, 5: 20, 6: 25 };
        const mult = multipliers[lineup.length] || 2;
        const prize = STAKE_AMOUNT * mult;
        await updateFlames(flames - (user ? 0 : STAKE_AMOUNT) + prize); 
        // Note: if user, updateFlames was already called with -STAKE. So we add prize to current flames.
        // Actually, updateFlames(flames + prize) is correct if flames was already updated by the snapshot.
        // But to be safe against race conditions:
        if (user) {
           const userRef = doc(db, 'users', user.uid);
           const currentDoc = await getDoc(userRef);
           const currentFlames = currentDoc.data()?.flames || 0;
           await updateDoc(userRef, { flames: currentFlames + prize });
        } else {
           setFlames(prev => prev + prize);
        }
        setShowNotification(`PERFECT LINEUP! You won ${prize} Flames! 🔥`);
      } else {
        setShowNotification(`Lineup failed. ${wins}/${lineup.length} picks correct.`);
      }
      setLineup([]);
      setActiveTab('lineups');
    }, 2000);
  };

  // Add this helper near other helpers
  const handleSportSelect = (sport: string, isPara: boolean) => {
    // If we're already on a day where this sport is active, just select it
    const currentSchedule = isPara ? PARALYMPIC_SCHEDULE : OLYMPIC_SCHEDULE;
    const isActiveOnCurrentDay = (currentSchedule[currentDay] || []).some(s => s.sport.includes(sport));

    setIsParaMode(isPara);
    setSelectedSport(sport);
    
    if (!isActiveOnCurrentDay) {
      // Find first day this sport is active in the corresponding schedule
      const schedule = isPara ? PARALYMPIC_SCHEDULE : OLYMPIC_SCHEDULE;
      const days = Object.keys(schedule).map(Number).sort((a, b) => a - b);
      for (const day of days) {
        if (schedule[day].some(s => s.sport.includes(sport))) {
          setCurrentDay(day);
          break;
        }
      }
    }
  };

  useEffect(() => {
    refreshLines();
  }, [currentDay, selectedSport, isParaMode]);

  const refreshLines = async () => {
    setLoadingLines(true);
    setLineError(null);
    try {
      const opponent = getOpponentForSport(currentDay, selectedSport, isParaMode);
      const newLinesRaw = await generateNewLines(currentDay, selectedSport, opponent);
      const newLines = newLinesRaw.map((l: any, i: number) => ({
        ...l,
        id: `gen_${selectedSport.replace(/\s+/g, '_')}_${currentDay}_${i}`
      }));
      setLines(newLines);
      setCurrentLineIndex(0);
    } catch (e: any) {
      console.error(e);
      setLineError(e.message || "Failed to generate projections. Team USA datasets are currently busy.");
    } finally {
      setLoadingLines(false);
    }
  };

  const payoutMultiplier = useMemo(() => {
    if (lineup.length < 2) return 0;
    return Number(Math.pow(1.9, lineup.length).toFixed(2));
  }, [lineup.length]);

  return (
    <div className="flex flex-col h-screen overflow-hidden selection:bg-la-poppy selection:text-white bg-la-background text-la-dark">
      {/* Header */}
      <header className="h-[70px] border-b border-la-border px-10 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-6">
            <div className="text-2xl font-black italic tracking-tighter bg-gradient-to-r from-la-poppy to-la-bluebell bg-clip-text text-transparent cursor-pointer" onClick={() => setActiveTab('picks')}>
              LA28 FAN QUEST
            </div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentDay(prev => prev < totalDays ? prev + 1 : 0)}
              className="bg-white border border-la-border px-4 py-1.5 rounded-xl flex flex-col items-center cursor-pointer hover:bg-la-background transition-colors group shadow-sm"
            >
              <div className="text-[8px] font-black uppercase text-la-text-dim tracking-widest leading-none mb-1 group-hover:text-la-bluebell transition-colors">Betting Slate</div>
              <div className="text-sm font-black text-la-dark group-hover:text-la-bluebell transition-colors uppercase">{formatDayToDate(currentDay, isParaMode)} {currentDay === 0 ? '• OPENING' : currentDay === (isParaMode ? 12 : 18) ? '• FINALS' : ''}</div>
            </motion.div>
          </div>
          
          <div className="flex bg-la-border/20 rounded-full p-1 border border-la-border">
            <button
              onClick={() => setActiveTab('picks')}
              className={`px-6 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${
                activeTab === 'picks' ? 'bg-la-bluebell text-white shadow-lg shadow-la-bluebell/20' : 'text-la-text-dim hover:text-white'
              }`}
            >
              Predictions
            </button>
            <button
              onClick={() => setActiveTab('lineups')}
              className={`px-6 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${
                activeTab === 'lineups' ? 'bg-la-sagebrush text-white shadow-lg shadow-la-sagebrush/20' : 'text-la-text-dim hover:text-la-dark'
              }`}
            >
              My Lineups
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-6 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${
                activeTab === 'calendar' ? 'bg-la-dark text-white shadow-lg shadow-la-dark/10' : 'text-la-text-dim hover:text-la-dark'
              }`}
            >
              Roadmap
            </button>
            <button
              onClick={() => setActiveTab('shop')}
              className={`px-6 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${
                activeTab === 'shop' ? 'bg-la-poppy text-white shadow-lg shadow-la-poppy/20' : 'text-la-text-dim hover:text-white'
              }`}
            >
              Vault
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-1">
            <Balance amount={flames} />
            <button 
              onClick={() => setActiveTab('quiz')}
              className="text-[10px] font-black uppercase text-la-bluebell hover:text-la-poppy transition-colors tracking-widest cursor-pointer underline underline-offset-2"
            >
              Get more flames
            </button>
          </div>
          {user ? (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={logout}>
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-la-bluebell">{user.displayName || 'Olympian Expert'}</div>
              </div>
              <img 
                src={user.photoURL || "/avatar.png"} 
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full border-2 border-la-bluebell shadow-[0_0_10px_rgba(67,97,238,0.3)] group-hover:scale-110 transition-transform" 
              />
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="flex items-center gap-2 bg-la-bluebell text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
            >
              <LogIn size={14} /> Join Quest
            </button>
          )}
        </div>
      </header>

      {/* Sport Navigation Sub-header */}
      <SportTopNav 
        selectedSport={selectedSport} 
        onSelect={handleSportSelect} 
        currentDay={currentDay} 
        isParaMode={isParaMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 grid grid-cols-[1fr_380px] overflow-hidden">
        {/* Center Feed: Single Card Carousel */}
        <section className="bg-transparent overflow-y-auto flex flex-col p-10 relative custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'picks' ? (
              <motion.div
                key="picks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full"
              >
                <div className="w-full flex justify-between items-center mb-10 px-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-black uppercase tracking-tight text-la-bluebell">
                        {selectedSport} Spotlight
                      </h2>
                    </div>
                    <p className="text-[10px] text-la-text-dim font-bold uppercase tracking-widest leading-none">
                      Pick {currentLineIndex + 1} of {filteredLines.length || 0} Projections
                    </p>
                  </div>
                  <button 
                    onClick={refreshLines}
                    disabled={loadingLines}
                    className="flex items-center gap-2 text-la-text-dim hover:text-la-dark text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    <RefreshCw size={12} className={loadingLines ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                </div>

                <div className="relative w-full flex items-center gap-6">
                  <button 
                    onClick={() => setCurrentLineIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentLineIndex === 0}
                    className="p-3 rounded-full bg-white border border-la-border hover:bg-la-background disabled:opacity-20 transition-all shrink-0 shadow-sm"
                  >
                    <ChevronLeft size={24} className="text-la-dark" />
                  </button>

                  <div className="flex-1 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {loadingLines ? (
                        <motion.div 
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center p-12 w-full"
                        >
                          <div className="w-16 h-16 border-4 border-la-bluebell/20 border-t-la-bluebell rounded-full animate-spin mx-auto mb-6" />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-la-bluebell animate-pulse">Syncing Team USA Intelligence...</p>
                        </motion.div>
                      ) : lineError ? (
                        <motion.div 
                          key="error"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center p-12 bg-la-scarlet/5 border border-la-scarlet/20 rounded-3xl w-full"
                        >
                          <X size={48} className="text-la-scarlet mx-auto mb-4 opacity-50" />
                          <p className="text-la-scarlet font-bold text-sm mb-4">{lineError}</p>
                          <button 
                            onClick={refreshLines}
                            className="bg-la-scarlet text-white px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                          >
                            Retry Sync
                          </button>
                        </motion.div>
                      ) : filteredLines.length > 0 ? (
                        <motion.div
                          key={filteredLines[currentLineIndex].id}
                          initial={{ opacity: 0, x: 20, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -20, scale: 0.95 }}
                          className="w-full"
                        >
                          <BetCard 
                            line={filteredLines[currentLineIndex]} 
                            onSelect={handleSelectPick}
                            selectedPick={lineup.find(s => s.line.id === filteredLines[currentLineIndex].id)?.pick}
                          />
                        </motion.div>
                      ) : (
                        <div className="text-center p-12 bg-la-card border border-la-border rounded-3xl w-full">
                          <TrendingUp size={48} className="text-la-cyan mx-auto mb-4 opacity-50" />
                          <p className="text-la-text-dim font-bold">No active projections for this category.</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button 
                    onClick={() => setCurrentLineIndex(prev => Math.min(filteredLines.length - 1, prev + 1))}
                    disabled={currentLineIndex === filteredLines.length - 1}
                    className="p-3 rounded-full bg-white border border-la-border hover:bg-la-background disabled:opacity-20 transition-all shrink-0 shadow-sm"
                  >
                    <ChevronRight size={24} className="text-la-dark" />
                  </button>
                </div>

                {/* Space maintained for layout consistency */}
                <div className="mt-12 h-16" />
              </motion.div>
            ) : activeTab === 'quiz' ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-xl mx-auto w-full"
              >
                <div className="mb-8 p-6 bg-la-bluebell border border-la-bluebell/20 rounded-3xl text-white shadow-[0_10px_30px_rgba(67,97,238,0.2)]">
                  <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Vibe Academy</h2>
                  <p className="opacity-80 text-xs font-medium">Earn 5 Flames for every correct answer. Build your knowledge and your bankroll.</p>
                </div>
                
                <VibeQuiz onReward={(amount) => updateFlames(flames + amount)} />
              </motion.div>
            ) : activeTab === 'shop' ? (
              <motion.div
                key="shop"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto w-full overflow-y-auto"
              >
                <div className="mb-12 border-b border-la-border pb-8 text-center pt-10">
                  <h2 className="text-4xl font-black uppercase tracking-tight italic">THE <span className="text-la-poppy">VAULT</span></h2>
                  <p className="text-[12px] text-la-text-dim font-bold uppercase tracking-widest mt-2">Elite Status for Elite Scouts</p>
                </div>
                <BadgeShop ownedBadges={ownedBadges} flames={flames} onBuy={handleBuyBadge} />
              </motion.div>
            ) : activeTab === 'lineups' ? (
              <motion.div
                key="lineups"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto w-full overflow-y-auto pt-10"
              >
                <div className="mb-12 border-b border-la-border pb-8 text-center">
                  <h2 className="text-4xl font-black uppercase tracking-tight italic">YOUR <span className="text-la-sagebrush">SQUAD</span></h2>
                  <p className="text-[12px] text-la-text-dim font-bold uppercase tracking-widest mt-2">Active & Past Lineup History</p>
                </div>
                <MyLineups />
              </motion.div>
            ) : (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 w-full overflow-hidden"
              >
                <CalendarView 
                  currentDay={currentDay} 
                  isParaMode={isParaMode}
                  onSelectDay={(day, isPara) => {
                    setCurrentDay(day);
                    setIsParaMode(isPara);
                    setActiveTab('picks');
                  }} 
                  onSelectSport={(day, sport, isPara) => {
                    setCurrentDay(day);
                    setIsParaMode(isPara);
                    setSelectedSport(sport);
                    setActiveTab('picks');
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Right Panel: Lineup Builder */}
        <section className="bg-la-card border-l border-la-border flex flex-col overflow-hidden">
          <div className="p-8 border-b border-la-border shrink-0 bg-la-bluebell/5">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black italic tracking-tight uppercase">Your Lineup</h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-la-bluebell bg-la-bluebell/10 px-2 py-1 rounded border border-la-bluebell/20">
                {lineup.length} / 6 PICKS
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-4">
            {lineup.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 grayscale">
                <Sparkles size={48} className="mb-4 text-la-text-dim" />
                <p className="text-xs font-bold uppercase tracking-widest text-la-text-dim">Empty Lineup</p>
                <p className="text-[10px] mt-2 leading-relaxed">Browse projections and pick MORE/LESS to start building.</p>
              </div>
            ) : (
              <AnimatePresence>
                {lineup.map((selection) => (
                  <motion.div
                    key={selection.line.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-la-background border border-la-border p-4 rounded-2xl group relative shadow-sm"
                  >
                    <button 
                      onClick={() => handleRemoveFromLineup(selection.line.id)}
                      className="absolute top-2 right-2 text-la-text-dim hover:text-la-scarlet opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-2 h-2 rounded-full ${selection.pick === 'more' ? 'bg-la-poppy' : 'bg-la-bluebell'}`} />
                      <div className="text-[10px] font-black uppercase tracking-widest text-la-text-dim">
                        {selection.line.sport} • {selection.line.metric}
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-xs font-bold text-la-dark leading-none mb-1">Line: {selection.line.line}</div>
                        <div className={`text-sm font-black italic uppercase ${selection.pick === 'more' ? 'text-la-poppy' : 'text-la-bluebell'}`}>
                          {selection.pick}
                        </div>
                      </div>
                      <div className="text-[10px] font-bold text-la-text-dim">1.9x Payout</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          <div className="p-8 bg-white border-t border-la-border space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-la-text-dim">Investment</div>
                <div className="text-lg font-black text-la-dark">50 Flames</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-widest text-la-bluebell">Potential Winnings</div>
                <div className="text-lg font-black text-la-bluebell">
                  {lineup.length >= 2 ? Math.floor(50 * payoutMultiplier) : '0'} Flames
                </div>
              </div>
            </div>

            {lineup.length >= 2 && (
              <div className="flex justify-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-la-sagebrush bg-la-sagebrush/10 px-3 py-1 rounded-full border border-la-sagebrush/30 flex items-center gap-1.5">
                  <Award size={10} /> {payoutMultiplier}X MULTIPLIER
                </span>
              </div>
            )}

            <button
              disabled={lineup.length < 2}
              onClick={handleSubmitLineup}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all ${
                lineup.length >= 2 
                ? 'bg-gradient-to-r from-la-bluebell to-la-sagebrush text-white shadow-[0_10px_30px_rgba(45,106,79,0.2)] hover:scale-[1.02] active:scale-95' 
                : 'bg-la-border/20 border border-la-border text-la-text-dim cursor-not-allowed opacity-50'
              }`}
            >
              Submit Lineup
            </button>
            <p className="text-[9px] text-center text-la-text-dim leading-relaxed font-medium uppercase tracking-widest">
              Submission requires 50 Flames. All picks must be correct to win.
            </p>
          </div>
        </section>
      </main>

      {/* Notifications */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-white border border-la-poppy text-la-dark px-8 py-4 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.15)] text-sm font-black uppercase tracking-widest"
          >
            {showNotification}
          </motion.div>
        )}
      </AnimatePresence>

      <QuizModal 
        isOpen={isQuizOpen} 
        onClose={() => setIsQuizOpen(false)} 
        onReward={(amount) => {
          updateFlames(flames + amount);
          setShowNotification(`IGNITED! +${amount} Flames added!`);
        }} 
      />
    </div>
  );
}
