import React from 'react';
import { Flame } from 'lucide-react';
import { motion } from 'motion/react';

interface BalanceProps {
  amount: number;
}

export const Balance: React.FC<BalanceProps> = ({ amount }) => {
  return (
    <div className="flex items-center gap-2 bg-la-poppy/10 border border-la-poppy/20 px-4 py-1.5 rounded-full text-la-poppy">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <Flame className="w-4 h-4 fill-la-poppy" />
      </motion.div>
      <span className="font-bold text-sm tracking-tight">{amount.toLocaleString()} FLAMES</span>
    </div>
  );
};
