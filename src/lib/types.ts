export type SportType = 'Set-Based' | 'Continuous' | 'Judged' | 'Timed' | 'Innings' | 'Combat' | 'Placement' | 'Medals' | 'Ranking' | 'Points';

export interface GameResult {
  score: number;
  isOver: boolean;
}

export interface HistoryPoint {
  year: number;
  value: number;
}

export interface BetLine {
  id: string;
  day: number;
  sport: string;
  opponent?: string;
  category: SportType;
  metric: string;
  line: number;
  history: HistoryPoint[];
  headToHead?: HistoryPoint[];
  vibeInsight: string;
  icon: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  cost: number;
  color: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Legendary';
}

export interface Selection {
  line: BetLine;
  pick: 'more' | 'less';
}

export interface UserState {
  flames: number;
  badges: string[];
  activeBets: string[];
}
