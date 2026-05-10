import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flame, Sparkles, Brain } from 'lucide-react';
import { generateQuizQuestion } from '../lib/gemini';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: (amount: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, onReward }) => {
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | null>(null);
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const q = await generateQuizQuestion();
      setQuestion(q);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === question.correctAnswer;
    setIsCorrect(correct);
    if (correct) {
      onReward(5);
    }
  };

  const reset = () => {
    setQuestion(null);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-la-dark/40 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-lg border border-la-border rounded-3xl shadow-3xl flex flex-col overflow-hidden"
      >
        <div className="bg-white p-6 flex justify-between items-center border-b border-la-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-la-scarlet/10 rounded-xl flex items-center justify-center text-la-scarlet">
              <Brain className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-xl text-la-dark">Flame Refill</h2>
          </div>
          <button onClick={onClose} className="text-la-text-dim hover:text-la-dark transition-colors p-2 bg-la-border/20 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-10">
          {!question && !loading && (
            <div className="grid gap-4">
              <p className="text-la-text-dim text-sm text-center mb-6 leading-relaxed">
                Ran out of flames? Solve a quiz to reignite your fire. High stakes for the bold!
              </p>
              <button
                onClick={startQuiz}
                className="w-full bg-la-bluebell text-white p-5 rounded-2xl flex justify-between items-center transition-all group shadow-[0_10px_20px_rgba(67,97,238,0.2)]"
              >
                <div className="text-left">
                  <div className="font-bold">Team USA Daily Quiz</div>
                  <div className="text-[10px] opacity-60 uppercase font-bold tracking-widest mt-0.5">Test your knowledge</div>
                </div>
                <div className="flex items-center gap-1.5 font-bold"><Flame size={14} className="fill-white" /> 5</div>
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="w-16 h-16 border-4 border-la-scarlet/20 border-t-la-scarlet rounded-full"
              />
              <p className="font-bold uppercase text-[10px] tracking-[0.4em] text-la-scarlet">Consulting The Oracle</p>
            </div>
          )}

          {question && !loading && (
            <div className="flex flex-col gap-8">
              <div className="bg-la-border/10 p-6 rounded-2xl border border-la-border">
                <p className="text-la-dark text-lg font-bold leading-snug">{question.question}</p>
              </div>
              
              <div className="grid gap-3">
                {question.options.map((option: string) => (
                  <button
                    key={option}
                    disabled={!!selectedAnswer}
                    onClick={() => handleAnswer(option)}
                    className={`p-5 rounded-xl border-2 text-sm font-bold text-left transition-all ${
                      selectedAnswer === option
                        ? isCorrect
                          ? 'bg-la-sagebrush/10 border-la-sagebrush text-la-sagebrush'
                          : 'bg-la-scarlet/10 border-la-scarlet text-la-scarlet'
                        : 'bg-white border-la-border text-la-dark hover:border-la-bluebell/50 hover:bg-la-background/50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {selectedAnswer && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className={`p-6 rounded-2xl border ${isCorrect ? 'bg-la-sagebrush/5 border-la-sagebrush/20 text-la-sagebrush' : 'bg-la-scarlet/5 border-la-scarlet/20 text-la-scarlet'}`}>
                      <div className="flex items-center gap-2 mb-2 font-black uppercase text-xs tracking-widest">
                        {isCorrect ? <Sparkles size={14} /> : <X size={14} />}
                        {isCorrect ? 'Correct!' : 'Almost!'}
                      </div>
                      <p className="text-[13px] leading-relaxed opacity-90">
                        {isCorrect ? `+5 Flames added! ` : `The correct answer was: ${question.correctAnswer}. `}
                        {question.explanation}
                      </p>
                    </div>
                    <button
                      onClick={reset}
                      className="w-full bg-la-dark text-white font-black py-4 rounded-xl uppercase text-xs tracking-widest hover:bg-la-dark/90 transition-all shadow-lg"
                    >
                      Next Challenge
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
