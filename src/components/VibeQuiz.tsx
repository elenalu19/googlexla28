import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QuizQuestion, generateQuizQuestion } from '../lib/gemini';
import { Trophy, HelpCircle, CheckCircle2, XCircle, Flame, Clock } from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface VibeQuizProps {
  onReward: (amount: number) => void;
}

export const VibeQuiz: React.FC<VibeQuizProps> = ({ onReward }) => {
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const MAX_DAILY = 15;

  useEffect(() => {
    checkDailyLimit();
  }, []);

  const checkDailyLimit = async () => {
    if (!auth.currentUser) return;
    const today = new Date().toISOString().split('T')[0];
    const quizRef = doc(db, 'user_quiz_stats', `${auth.currentUser.uid}_${today}`);
    const snap = await getDoc(quizRef);
    if (snap.exists()) {
      setDailyCount(snap.data().count || 0);
    } else {
      await setDoc(quizRef, { count: 0 });
    }
    loadNewQuestion();
  };

  const loadNewQuestion = async () => {
    setLoading(true);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setError(null);
    try {
      const q = await generateQuizQuestion();
      setQuestion(q);
    } catch (err: any) {
      setError(err.message || 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (selectedAnswer || !auth.currentUser) return;
    
    const correct = answer === question.correctAnswer;
    setSelectedAnswer(answer);
    setIsCorrect(correct);

    const today = new Date().toISOString().split('T')[0];
    const quizRef = doc(db, 'user_quiz_stats', `${auth.currentUser.uid}_${today}`);
    
    await updateDoc(quizRef, {
      count: increment(1)
    });
    setDailyCount(prev => prev + 1);

    if (correct) {
      onReward(5);
    }
  };

  if (dailyCount >= MAX_DAILY) {
    return (
      <div className="bg-la-card border border-la-border rounded-3xl p-8 text-center">
        <Clock size={48} className="mx-auto mb-4 text-la-bluebell opacity-20" />
        <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2">Limit Reached</h3>
        <p className="text-la-text-dim text-xs leading-relaxed max-w-[200px] mx-auto">
          You've completed your 15 questions for today. Come back tomorrow to earn more Flames!
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-la-card border border-la-border rounded-3xl p-12 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-la-bluebell border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-la-bluebell animate-pulse">Generating USA Stats Quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-la-card border border-la-border rounded-3xl p-8 text-center">
        <p className="text-la-scarlet text-[10px] font-bold uppercase mb-4">{error}</p>
        <button 
          onClick={loadNewQuestion}
          className="bg-la-dark text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-la-card border border-la-border rounded-3xl p-8 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Trophy size={120} />
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="bg-la-bluebell/10 text-la-bluebell px-3 py-1 rounded-full border border-la-bluebell/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
          <HelpCircle size={10} /> Daily Vibe Check
        </div>
        <div className="text-[9px] font-black text-la-text-dim uppercase tracking-widest">
          {dailyCount} / {MAX_DAILY} DAILY
        </div>
      </div>

      <h3 className="text-lg font-black italic uppercase tracking-tight leading-tight mb-8">
        {question.question}
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {question.options.map((opt: string) => (
          <button
            key={opt}
            disabled={!!selectedAnswer}
            onClick={() => handleAnswer(opt)}
            className={`
              p-4 rounded-2xl text-left text-xs font-bold transition-all border-2
              ${selectedAnswer === opt 
                ? (opt === question.correctAnswer ? 'bg-la-sagebrush/10 border-la-sagebrush text-la-sagebrush' : 'bg-la-scarlet/10 border-la-scarlet text-la-scarlet')
                : selectedAnswer && opt === question.correctAnswer
                  ? 'bg-la-sagebrush/10 border-la-sagebrush text-la-sagebrush animate-pulse'
                  : 'bg-white border-la-border hover:border-la-bluebell hover:bg-la-background cursor-pointer'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span>{opt}</span>
              {selectedAnswer === opt && (
                opt === question.correctAnswer ? <CheckCircle2 size={16} /> : <XCircle size={16} />
              )}
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedAnswer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6"
          >
            <div className={`p-4 rounded-2xl border ${isCorrect ? 'bg-la-sagebrush/5 border-la-sagebrush/20' : 'bg-la-scarlet/5 border-la-scarlet/20'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Flame size={14} className={isCorrect ? 'text-la-sagebrush' : 'text-la-scarlet'} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${isCorrect ? 'text-la-sagebrush' : 'text-la-scarlet'}`}>
                  {isCorrect ? '+5 FLAMES EARNED' : 'VIBE CHECK FAILED'}
                </span>
              </div>
              <p className="text-[10px] font-medium leading-relaxed text-la-text-dim">
                {question.explanation}
              </p>
            </div>
            
            <button
              onClick={loadNewQuestion}
              className="mt-6 w-full bg-la-dark text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Next Question
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
