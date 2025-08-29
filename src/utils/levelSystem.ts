// Level and ranking system utilities

export interface PlayerLevel {
  level: number;
  title: string;
  minScore: number;
  maxScore: number;
  color: string;
  gradient: string;
  icon: string;
  badge: string;
  description: string;
  perks: string[];
}

export const PLAYER_LEVELS: PlayerLevel[] = [
  {
    level: 1,
    title: "Rookie",
    minScore: 0,
    maxScore: 49,
    color: "text-gray-400",
    gradient: "from-gray-500 to-gray-600",
    icon: "🥉",
    badge: "bg-gray-500/20 border-gray-500/50",
    description: "Just starting your journey",
    perks: ["Basic gameplay access"]
  },
  {
    level: 2,
    title: "Apprentice",
    minScore: 50,
    maxScore: 149,
    color: "text-green-400",
    gradient: "from-green-500 to-green-600",
    icon: "🌱",
    badge: "bg-green-500/20 border-green-500/50",
    description: "Learning the ropes",
    perks: ["5% bonus on wins", "Access to tournaments"]
  },
  {
    level: 3,
    title: "Warrior",
    minScore: 150,
    maxScore: 299,
    color: "text-blue-400",
    gradient: "from-blue-500 to-blue-600",
    icon: "⚔️",
    badge: "bg-blue-500/20 border-blue-500/50",
    description: "Battle-tested fighter",
    perks: ["10% bonus on wins", "Priority matchmaking", "Custom emotes"]
  },
  {
    level: 4,
    title: "Champion",
    minScore: 300,
    maxScore: 499,
    color: "text-purple-400",
    gradient: "from-purple-500 to-purple-600",
    icon: "🏆",
    badge: "bg-purple-500/20 border-purple-500/50",
    description: "Proven champion",
    perks: ["15% bonus on wins", "VIP support", "Exclusive tournaments", "Profile customization"]
  },
  {
    level: 5,
    title: "Master",
    minScore: 500,
    maxScore: 799,
    color: "text-orange-400",
    gradient: "from-orange-500 to-orange-600",
    icon: "🔥",
    badge: "bg-orange-500/20 border-orange-500/50",
    description: "Master of the game",
    perks: ["20% bonus on wins", "Beta access", "Mentor program", "Custom titles"]
  },
  {
    level: 6,
    title: "Grandmaster",
    minScore: 800,
    maxScore: 1199,
    color: "text-red-400",
    gradient: "from-red-500 to-red-600",
    icon: "💎",
    badge: "bg-red-500/20 border-red-500/50",
    description: "Elite player",
    perks: ["25% bonus on wins", "Exclusive events", "Direct dev contact", "Hall of fame"]
  },
  {
    level: 7,
    title: "Legend",
    minScore: 1200,
    maxScore: 1999,
    color: "text-yellow-400",
    gradient: "from-yellow-400 to-yellow-600",
    icon: "👑",
    badge: "bg-yellow-500/20 border-yellow-500/50",
    description: "Legendary status",
    perks: ["30% bonus on wins", "Legendary rewards", "Game influence", "Immortal status"]
  },
  {
    level: 8,
    title: "Mythic",
    minScore: 2000,
    maxScore: 9999,
    color: "text-pink-400",
    gradient: "from-pink-400 to-purple-600",
    icon: "🌟",
    badge: "bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/50",
    description: "Beyond mortal limits",
    perks: ["50% bonus on wins", "Mythic rewards", "Game design input", "Eternal glory"]
  }
];

export const getPlayerLevel = (score: number): PlayerLevel => {
  for (let i = PLAYER_LEVELS.length - 1; i >= 0; i--) {
    if (score >= PLAYER_LEVELS[i].minScore) {
      return PLAYER_LEVELS[i];
    }
  }
  return PLAYER_LEVELS[0];
};

export const getProgressToNextLevel = (score: number): { current: PlayerLevel; next: PlayerLevel | null; progress: number } => {
  const current = getPlayerLevel(score);
  const nextLevelIndex = PLAYER_LEVELS.findIndex(level => level.level === current.level) + 1;
  const next = nextLevelIndex < PLAYER_LEVELS.length ? PLAYER_LEVELS[nextLevelIndex] : null;
  
  if (!next) {
    return { current, next: null, progress: 100 };
  }
  
  const progress = Math.min(100, ((score - current.minScore) / (next.minScore - current.minScore)) * 100);
  return { current, next, progress };
};

export const getLevelUpAnimation = (newLevel: PlayerLevel): string => {
  return `animate-pulse bg-gradient-to-r ${newLevel.gradient}`;
};

export const getStreakMultiplier = (winStreak: number): number => {
  if (winStreak >= 10) return 3.0;
  if (winStreak >= 7) return 2.5;
  if (winStreak >= 5) return 2.0;
  if (winStreak >= 3) return 1.5;
  return 1.0;
};

export const calculateLevelBonus = (level: PlayerLevel, baseReward: number): number => {
  const bonusPercentage = (level.level - 1) * 5; // 5% per level above 1
  return baseReward * (1 + bonusPercentage / 100);
};