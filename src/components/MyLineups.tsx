import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Clock, XCircle, CheckCircle2, Flame } from 'lucide-react';
import { formatDayToDate } from '../lib/constants';

interface Lineup {
  id: string;
  userId: string;
  stake: number;
  status: 'pending' | 'won' | 'lost';
  latestDay?: number;
  isPara?: boolean;
  createdAt: any;
  selections: {
    lineId: string;
    pick: 'more' | 'less';
    sport: string;
    metric: string;
    line: number;
  }[];
}

export const MyLineups: React.FC = () => {
  const [lineups, setLineups] = useState<Lineup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'lineups'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lineup[];
      setLineups(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'lineups');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-la-bluebell border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!auth.currentUser) {
    return (
      <div className="text-center p-12 bg-la-card border border-la-border rounded-3xl">
        <Flame size={48} className="mx-auto mb-4 text-la-text-dim opacity-20" />
        <p className="text-la-text-dim font-bold">Sign in to view your submitted lineups.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full pb-20">
      <AnimatePresence mode="popLayout">
        {lineups.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-12 border-2 border-dashed border-la-border rounded-3xl"
          >
            <p className="text-la-text-dim font-bold italic">No lineups found. Start scouting and pick some winners!</p>
          </motion.div>
        ) : (
          lineups.map((lineup) => (
            <motion.div
              key={lineup.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-la-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6 bg-la-border/10 border-b border-la-border flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`
                    p-2 rounded-xl border
                    ${lineup.status === 'won' ? 'bg-la-sagebrush/20 border-la-sagebrush text-la-sagebrush shadow-[0_0_15px_rgba(45,106,79,0.1)]' : 
                      lineup.status === 'lost' ? 'bg-la-scarlet/20 border-la-scarlet text-la-scarlet shadow-[0_0_15px_rgba(230,57,70,0.1)]' : 
                      'bg-la-bluebell/20 border-la-bluebell text-la-bluebell shadow-[0_0_15px_rgba(67,97,238,0.1)]'}
                  `}>
                    {lineup.status === 'won' ? <CheckCircle2 size={18} /> : 
                     lineup.status === 'lost' ? <XCircle size={18} /> : 
                     <Clock size={18} />}
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-la-bluebell tracking-widest leading-none mb-1">
                      {lineup.status === 'pending' && lineup.latestDay !== undefined 
                        ? `Pending Until ${formatDayToDate(lineup.latestDay, !!lineup.isPara)}` 
                        : `Status: ${lineup.status}`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase text-la-text-dim tracking-widest leading-none mb-1">Potential Winnings</div>
                  <div className="text-lg font-black text-la-bluebell">
                    {Math.floor(50 * Math.pow(1.9, lineup.selections.length))} <span className="text-[10px]">🔥</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {lineup.selections.map((sel, idx) => (
                  <div key={idx} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-8 rounded-full ${sel.pick === 'more' ? 'bg-la-poppy' : 'bg-la-bluebell'}`} />
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-tight text-la-text-dim">
                          {sel.sport} • {sel.metric}
                        </div>
                        <div className="text-xs font-bold text-la-dark uppercase italic">
                          Projection: {sel.line}
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm font-black italic uppercase ${sel.pick === 'more' ? 'text-la-poppy' : 'text-la-bluebell'}`}>
                      {sel.pick}
                    </div>
                  </div>
                ))}
              </div>

              {lineup.status === 'won' && (
                <div className="p-4 bg-la-sagebrush/10 border-t border-la-sagebrush/20 flex items-center justify-center gap-2">
                  <Trophy size={16} className="text-la-sagebrush" />
                  <span className="text-[10px] font-black uppercase text-la-sagebrush tracking-widest">Perfect Lineup Prize Awarded</span>
                </div>
              )}
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
};
