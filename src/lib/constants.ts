import { Badge, BetLine } from './types';

/**
 * Official LA28 Olympic Schedule Matrix (Ground Truth)
 * Day 0 = July 12, Day 18 = July 30
 */
const OLYMPIC_MATRIX: Record<string, number[]> = {
  "3x3 Basketball": [4, 5, 6, 7, 8, 9, 10],
  "Archery": [7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  "Artistic Gymnastics": [3, 4, 5, 6, 7, 8, 10, 11, 12, 13],
  "Artistic Swimming": [13, 14, 15, 16, 17],
  "Athletics (Track/Field)": [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  "Athletics (Marathon)": [17, 18],
  "Athletics (Race Walk)": [15],
  "Badminton": [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  "Baseball": [1, 3, 4, 5, 6, 7],
  "Basketball": [0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  "Beach Volleyball": [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
  "BMX Freestyle": [14, 17],
  "BMX Racing": [3, 4],
  "Boxing": [3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 16, 17, 18],
  "Canoe Slalom": [2, 3, 4, 5, 6, 7, 8, 9, 10],
  "Canoe Sprint": [13, 14, 15, 16, 17],
  "Climbing": [12, 13, 14, 15, 16, 17],
  "Cricket": [0, 1, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17],
  "Cycling Road": [7, 10, 11],
  "Cycling Track": [13, 14, 15, 16, 17, 18],
  "Diving": [4, 5, 6, 7, 8, 9, 10, 13, 14, 15, 16],
  "Equestrian": [3, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17],
  "Fencing": [3, 4, 5, 6, 7, 8, 9, 10, 11],
  "Flag Football": [3, 4, 5, 6, 7, 8, 9, 10],
  "Football (Soccer)": [0, 1, 2, 4, 5, 8, 9, 12, 13, 15, 16, 17],
  "Golf": [7, 8, 9, 10, 11, 12, 14, 15, 16, 17],
  "Handball": [0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  "Hockey": [0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
  "Judo": [3, 4, 5, 6, 7, 8, 9, 10],
  "Lacrosse": [12, 13, 14, 15, 16, 17],
  "Modern Pentathlon": [3, 4, 5, 6],
  "Mountain Bike": [5, 6],
  "Open Water Swimming": [5, 6],
  "Rhythmic Gymnastics": [15, 16, 17],
  "Rowing": [3, 4, 5, 6, 7, 8, 9, 10],
  "Rowing Coastal": [12, 13],
  "Rugby Sevens": [0, 1, 3, 4, 5, 6],
  "Shooting (Rifle & Pistol)": [3, 4, 5, 7, 8, 10, 11],
  "Shooting (Shotgun)": [5, 6, 9, 10, 12],
  "Skateboarding": [6, 7, 8, 13, 14, 15],
  "Softball": [10, 11, 12, 13, 14, 15, 16, 17],
  "Squash": [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  "Surfing": [3, 4, 5, 6],
  "Swimming": [10, 11, 12, 13, 14, 15, 16, 17, 18],
  "Table Tennis": [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
  "Taekwondo": [14, 15, 16, 17],
  "Tennis": [15, 16],
  "Trampoline Gymnastics": [10],
  "Triathlon": [3, 4, 9],
  "Volleyball": [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
  "Water Polo": [6, 7, 8, 9, 10, 11, 12],
  "Weightlifting": [10, 11, 12, 13, 14, 15],
  "Wrestling": [12, 13, 14, 15, 16, 17],
};

/**
 * Official LA28 Paralympic Schedule Matrix (Ground Truth)
 * Day 0 = Aug 13, Day 14 = Aug 27
 */
const PARALYMPIC_MATRIX: Record<string, number[]> = {
  "Blind Football (Soccer)": [7, 8, 9, 11, 13, 14],
  "Boccia": [1, 3, 4, 5, 6, 7, 8, 9],
  "Goalball": [5, 6, 7, 8, 9, 10, 11, 12],
  "Para Archery": [7, 8, 9, 10, 11, 12, 13],
  "Para Athletics": [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14],
  "Para Badminton": [9, 10, 11, 12, 13, 14],
  "Para Canoe": [11, 12, 13],
  "Para Climbing": [11, 12, 13, 14],
  "Para Cycling Road": [9, 10, 11, 12, 13],
  "Para Cycling Track": [3, 4, 5, 6],
  "Para Equestrian": [3, 4, 5, 6, 8],
  "Para Judo": [11, 12, 13],
  "Para Powerlifting": [9, 10, 11, 12, 13, 14],
  "Para Rowing": [5, 6, 7],
  "Para Swimming": [5, 6, 7, 8, 9, 10, 11, 12, 13],
  "Para Table Tennis": [3, 4, 5, 6, 8, 9, 10, 11, 12, 13],
  "Para Taekwondo": [10, 11, 12],
  "Para Triathlon": [5, 6],
  "Shooting Para Sport": [3, 4, 5, 6, 7, 8, 9, 10, 11],
  "Sitting Volleyball": [5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  "Wheelchair Basketball": [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  "Wheelchair Fencing": [3, 4, 5, 6, 7],
  "Wheelchair Rugby": [0, 1, 3, 4, 5, 6],
  "Wheelchair Tennis": [5, 6, 7, 8, 9, 10, 11, 12, 13],
  "Ceremonies": [2, 14],
};

const generateOlympicSports = () => {
  const sports = new Set<string>();
  Object.keys(OLYMPIC_MATRIX).forEach(baseSport => {
    sports.add(`Men's ${baseSport}`);
    sports.add(`Women's ${baseSport}`);
  });
  return Array.from(sports).sort();
};

export const OLYMPIC_SPORTS = generateOlympicSports();

export const PARALYMPIC_SPORTS = [
  'Blind Football (Soccer)', 'Boccia', 'Goalball', 'Para Archery', "Men's Para Athletics", "Women's Para Athletics", 'Para Badminton', 
  'Para Canoe', 'Para Climbing', 'Para Cycling Road', 'Para Cycling Track', 'Para Equestrian', 
  'Para Judo', 'Para Powerlifting', 'Para Rowing', 'Para Shooting', 
  "Men's Para Swimming", "Women's Para Swimming", 'Para Table Tennis', 'Para Taekwondo', 'Para Triathlon', 
  'Sitting Volleyball', 'Wheelchair Basketball', 
  'Wheelchair Fencing', 'Wheelchair Rugby', 'Wheelchair Tennis'
].sort();

export const TOP_OLYMPIC = [
  "Men's Artistic Gymnastics", "Women's Artistic Gymnastics", 
  "Men's Swimming", "Women's Swimming", 
  "Men's Athletics (Track/Field)", "Women's Athletics (Track/Field)"
];

export const TOP_PARALYMPIC = [
  "Wheelchair Rugby", 
  "Men's Para Swimming", "Women's Para Swimming", 
  "Men's Para Athletics", "Women's Para Athletics"
];

/**
 * Formats a competition day into an actual LA28 date string
 * @param day Competition day (relative to mode start)
 * @param isPara Whether to use Paralympic dates (Starts August 13)
 * @returns Formatted date string (e.g., 07/12/2028 or 08/13/2028)
 */
export const formatDayToDate = (day: number, isPara: boolean = false): string => {
  if (isPara) {
    const date = 13 + day;
    return `08/${date}/2028`;
  }
  const date = 12 + day;
  return `07/${date}/2028`;
};

const generateOlympicSchedule = () => {
  const schedule: Record<number, { sport: string; opponent: string }[]> = {};
  
  // Initialize all days
  for (let i = 0; i <= 18; i++) {
    schedule[i] = [];
  }

  // Populate from matrix
  Object.entries(OLYMPIC_MATRIX).forEach(([baseSport, days]) => {
    days.forEach(day => {
      // Add Men's and Women's variants for every active sport
      ["Men's", "Women's"].forEach(gender => {
        const fullSport = `${gender} ${baseSport}`;
        schedule[day].push({ 
          sport: fullSport, 
          opponent: `TBD ${gender} Event` 
        });
      });
    });
  });

  return schedule;
};

export const OLYMPIC_SCHEDULE = generateOlympicSchedule();

const generateParalympicSchedule = () => {
  const schedule: Record<number, { sport: string; opponent: string }[]> = {};
  
  // Initialize all days (0-14)
  for (let i = 0; i <= 14; i++) {
    schedule[i] = [];
  }

  // Populate from matrix
  Object.entries(PARALYMPIC_MATRIX).forEach(([baseSport, days]) => {
    days.forEach(day => {
      if (baseSport === "Ceremonies") {
        schedule[day].push({ 
          sport: day === 2 ? "Opening Ceremony" : "Closing Ceremony", 
          opponent: day === 2 ? "LA28 Inglewood" : "Grand Finale" 
        });
      } else if (baseSport === "Para Athletics" || baseSport === "Para Swimming") {
        // Handle gender variants for athletics and swimming
        ["Men's", "Women's"].forEach(gender => {
          const fullSport = `${gender} ${baseSport}`;
          schedule[day].push({ 
            sport: fullSport, 
            opponent: `Medal Quest: ${gender}` 
          });
        });
      } else {
        schedule[day].push({ 
          sport: baseSport, 
          opponent: `Team USA Action` 
        });
      }
    });
  });

  return schedule;
};

export const PARALYMPIC_SCHEDULE = generateParalympicSchedule();

export const getScheduleForDay = (day: number, isParalympic: boolean = false): string[] => {
  const schedule = isParalympic ? PARALYMPIC_SCHEDULE : OLYMPIC_SCHEDULE;
  return (schedule[day] || []).map(item => item.sport);
};

export const getOpponentForSport = (day: number, sport: string, isParalympic: boolean = false): string => {
  const schedule = isParalympic ? PARALYMPIC_SCHEDULE : OLYMPIC_SCHEDULE;
  const match = (schedule[day] || []).find(item => item.sport === sport);
  return match?.opponent || 'TBD';
};

export const INITIAL_FLAMES = 500;
export const STAKE_AMOUNT = 50;

export const BADGES: Badge[] = [
  {
    id: 'rookie',
    name: 'Rookie Enthusiast',
    description: 'A fan just starting their LA28 journey.',
    cost: 1000,
    color: '#CD7F32',
    tier: 'Bronze'
  },
  {
    id: 'basketball_superfan',
    name: 'Basketball Superfan',
    description: 'You know your buckets.',
    cost: 2500,
    color: '#C0C0C0',
    tier: 'Silver'
  },
  {
    id: 'specialist_analyst',
    name: 'Elite Analyst',
    description: 'Master of Olympic metrics.',
    cost: 10000,
    color: '#FFD700',
    tier: 'Gold'
  },
  {
    id: 'para_pro',
    name: 'Paralympic Historian',
    description: 'Expert on the inspirational greats.',
    cost: 25000,
    color: '#FF00BD',
    tier: 'Legendary'
  },
  {
    id: 'la28_visionary',
    name: 'LA28 Visionary',
    description: 'The ultimate Olympic oracle.',
    cost: 100000,
    color: '#00F0FF',
    tier: 'Legendary'
  }
];

export const MOCK_LINES: BetLine[] = [
  // --- BASKETBALL ---
  {
    id: 'b1',
    day: 3,
    sport: "Men's Basketball",
    opponent: "Serbia",
    category: 'Continuous',
    metric: "Total Defensive Blocks (USA)",
    line: 8.5,
    history: [{ year: 2024, value: 9 }, { year: 2020, value: 7 }, { year: 2016, value: 10 }, { year: 2012, value: 8 }, { year: 2008, value: 9 }],
    headToHead: [{ year: 2024, value: 6 }, { year: 2016, value: 7 }],
    vibeInsight: "Rim protection remains the primary mission goal against aggressive European interior play.",
    icon: 'Dribbble'
  },
  {
    id: 'b2',
    day: 3,
    sport: "Men's Basketball",
    opponent: "Serbia",
    category: 'Points',
    metric: "Free Throw Attempts (USA)",
    line: 22.5,
    history: [{ year: 2024, value: 24 }, { year: 2020, value: 19 }, { year: 2016, value: 21 }, { year: 2012, value: 26 }, { year: 2008, value: 20 }],
    vibeInsight: "Expect physical play under the rim. USA's drive-first strategy should draw early fouls.",
    icon: 'Dribbble'
  },
  {
    id: 'b3',
    day: 4,
    sport: "Women's Basketball",
    opponent: "Australia",
    category: 'Points',
    metric: "Total USA Points Scored",
    line: 88.5,
    history: [{ year: 2024, value: 92 }, { year: 2020, value: 87 }, { year: 2016, value: 95 }, { year: 2012, value: 90 }, { year: 2008, value: 94 }],
    vibeInsight: "Offensive depth is unmatched. Second-unit efficiency projects a high-scoring transition game.",
    icon: 'Dribbble'
  },
  {
    id: 'b4',
    day: 4,
    sport: "Women's Basketball",
    opponent: "Australia",
    category: 'Continuous',
    metric: "Team 3-Pointers Made",
    line: 11.5,
    history: [{ year: 2024, value: 12 }, { year: 2020, value: 9 }, { year: 2016, value: 13 }, { year: 2012, value: 10 }, { year: 2008, value: 11 }],
    vibeInsight: "Perimeter spacing has been a focus in training. Projected volume from the wings is high.",
    icon: 'Dribbble'
  },

  // --- SWIMMING ---
  {
    id: 's1',
    day: 5,
    sport: "Women's Swimming",
    opponent: "",
    category: 'Placement',
    metric: "4x100m Relay Final Rank",
    line: 1.5,
    history: [{ year: 2024, value: 1 }, { year: 2020, value: 2 }, { year: 2016, value: 1 }, { year: 2012, value: 1 }, { year: 2008, value: 2 }],
    vibeInsight: "Team USA relay chemistry is peak. Aiming for consistent podium dominance.",
    icon: 'Waves'
  },
  {
    id: 's2',
    day: 5,
    sport: "Women's Swimming",
    opponent: "",
    category: 'Timed',
    metric: "100m Breaststroke Final (sec)",
    line: 64.5,
    history: [{ year: 2024, value: 64.2 }, { year: 2020, value: 64.7 }, { year: 2016, value: 64.1 }, { year: 2012, value: 64.9 }, { year: 2008, value: 65.1 }],
    vibeInsight: "Split-times from qualifying suggest a record-breaking final pace.",
    icon: 'Waves'
  },
  {
    id: 's3',
    day: 5,
    sport: "Men's Swimming",
    opponent: "",
    category: 'Placement',
    metric: "100m Fly Finish Rank",
    line: 2.5,
    history: [{ year: 2024, value: 3 }, { year: 2020, value: 1 }, { year: 2016, value: 2 }, { year: 2012, value: 4 }, { year: 2008, value: 1 }],
    vibeInsight: "Late-surge capability gives Team USA a strong podium probability (Rank 2 or better).",
    icon: 'Waves'
  },
  {
    id: 's4',
    day: 5,
    sport: "Men's Swimming",
    opponent: "",
    category: 'Timed',
    metric: "200m Free Relay Split (sec)",
    line: 47.5,
    history: [{ year: 2024, value: 47.1 }, { year: 2020, value: 47.4 }, { year: 2016, value: 47.2 }, { year: 2012, value: 47.8 }, { year: 2008, value: 47.0 }],
    vibeInsight: "Anchor-leg velocity is the key metric. Fresh rotation should yield elite splits.",
    icon: 'Waves'
  },

  // --- ATHLETICS ---
  {
    id: 'a1',
    day: 12,
    sport: "Men's Athletics",
    opponent: "",
    category: 'Placement',
    metric: "100m Dash Final Rank",
    line: 1.5,
    history: [{ year: 2024, value: 1 }, { year: 2020, value: 2 }, { year: 2016, value: 1 }, { year: 2012, value: 3 }, { year: 2008, value: 1 }],
    vibeInsight: "Top-tier sprint mechanics. Projecting a Gold medal mission success.",
    icon: 'Zap'
  },
  {
    id: 'a2',
    day: 12,
    sport: "Men's Athletics",
    opponent: "",
    category: 'Timed',
    metric: "4x400m Finish Time (min)",
    line: 2.95,
    history: [{ year: 2024, value: 2.92 }, { year: 2020, value: 2.97 }, { year: 2016, value: 2.93 }, { year: 2012, value: 2.98 }, { year: 2008, value: 2.91 }],
    vibeInsight: "Clean handoffs in the qualifying heats set the stage for a record-breaking final.",
    icon: 'Zap'
  },
  {
    id: 'a3',
    day: 13,
    sport: "Women's Athletics",
    opponent: "",
    category: 'Timed',
    metric: "200m Final Sprint Time (sec)",
    line: 21.8,
    history: [{ year: 2024, value: 21.7 }, { year: 2020, value: 21.9 }, { year: 2016, value: 21.6 }, { year: 2012, value: 22.0 }, { year: 2008, value: 21.5 }],
    vibeInsight: "Elite curve-running is the advantage here. Expect a strong exit into the straightaway.",
    icon: 'Zap'
  },
  {
    id: 'a4',
    day: 13,
    sport: "Women's Athletics",
    opponent: "",
    category: 'Placement',
    metric: "High Jump Podium Finish rank",
    line: 2.5,
    history: [{ year: 2024, value: 2 }, { year: 2020, value: 4 }, { year: 2016, value: 3 }, { year: 2012, value: 1 }, { year: 2008, value: 2 }],
    vibeInsight: "Vertical clearance data projects a podium rank (Top 2) mission outcome.",
    icon: 'Zap'
  },

  // --- OTHERS ---
  {
    id: '7',
    day: 1,
    sport: "Men's Baseball",
    opponent: "South Korea",
    category: 'Innings',
    metric: "Total Runs Scored (USA)",
    line: 5.5,
    history: [{ year: 2021, value: 4 }, { year: 2008, value: 8 }, { year: 2000, value: 6 }, { year: 1996, value: 5 }, { year: 1992, value: 7 }],
    headToHead: [{ year: 2021, value: 5 }, { year: 2008, value: 4 }],
    vibeInsight: "Tactical, high-pressure innings expected. USA bats historically heat up late.",
    icon: 'Baseball'
  },
  {
    id: '10',
    day: 6,
    sport: "Men's Skateboarding",
    opponent: "",
    category: 'Judged',
    metric: "Best Trick Score",
    line: 92.5,
    history: [{ year: 2024, value: 94 }, { year: 2021, value: 91 }, { year: 2016, value: 89 }, { year: 2012, value: 90 }, { year: 2008, value: 92 }],
    vibeInsight: "Street course manual tricks are the focus of this cycle's judging criteria.",
    icon: 'Activity'
  }
];
