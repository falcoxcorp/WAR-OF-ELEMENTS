import Web3 from 'web3';
import { GameData, PlayerStats } from './types';

// Web3 utilities
export const web3Utils = {
  isValidAddress: (address: string): boolean => {
    try {
      return Web3.utils.isAddress(address);
    } catch {
      return false;
    }
  },

  formatEther: (wei: string): string => {
    try {
      return Web3.utils.fromWei(wei, 'ether');
    } catch {
      return '0';
    }
  },

  toWei: (ether: string): string => {
    try {
      return Web3.utils.toWei(ether, 'ether');
    } catch {
      return '0';
    }
  },

  checksumAddress: (address: string): string => {
    try {
      return Web3.utils.toChecksumAddress(address);
    } catch {
      return address;
    }
  }
};

// Game utilities
export const gameUtils = {
  getStatusText: (status: number): string => {
    const statusMap = {
      0: 'Open',
      1: 'Completed',
      2: 'Expired',
      3: 'Reveal Phase'
    };
    return statusMap[status as keyof typeof statusMap] || 'Unknown';
  },

  isActive: (game: GameData): boolean => {
    return game.status === 0 || game.status === 3;
  },

  getTimeRemaining: (game: GameData): number | null => {
    if (game.status !== 3) return null;
    return Math.max(0, game.revealDeadline - Math.floor(Date.now() / 1000));
  },

  getBetTier: (betAmount: string): 'low' | 'medium' | 'high' => {
    const amount = parseFloat(web3Utils.formatEther(betAmount));
    if (amount >= 10) return 'high';
    if (amount >= 1) return 'medium';
    return 'low';
  },

  formatGameForApi: (gameData: any, gameId: number): GameData => {
    const betAmountFormatted = web3Utils.formatEther(gameData.betAmount);
    const status = Number(gameData.status);
    
    return {
      id: gameId,
      creator: gameData.creator,
      opponent: gameData.opponent,
      betAmount: gameData.betAmount,
      status,
      winner: gameData.winner,
      createdAt: Number(gameData.createdAt),
      revealDeadline: Number(gameData.revealDeadline),
      referrer: gameData.referrer,
      betAmountFormatted,
      statusText: gameUtils.getStatusText(status),
      isActive: status === 0 || status === 3,
      timeRemaining: status === 3 ? Math.max(0, Number(gameData.revealDeadline) - Math.floor(Date.now() / 1000)) : null
    };
  }
};

// Player utilities
export const playerUtils = {
  calculateWinRate: (wins: number, totalGames: number): number => {
    return totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  },

  calculateProfit: (totalWon: string, totalWagered: string): string => {
    return (BigInt(totalWon) - BigInt(totalWagered)).toString();
  },

  calculateROI: (profit: string, totalWagered: string): string => {
    const profitEther = parseFloat(web3Utils.formatEther(profit));
    const wageredEther = parseFloat(web3Utils.formatEther(totalWagered));
    
    if (wageredEther === 0) return '0.00';
    return ((profitEther / wageredEther) * 100).toFixed(2);
  },

  calculateAverageBet: (totalWagered: string, gamesPlayed: number): string => {
    if (gamesPlayed === 0) return '0.0000';
    const wageredEther = parseFloat(web3Utils.formatEther(totalWagered));
    return (wageredEther / gamesPlayed).toFixed(4);
  },

  formatPlayerForApi: (stats: any, address: string): PlayerStats => {
    const totalGames = Number(stats.gamesPlayed);
    const wins = Number(stats.wins);
    const winRate = playerUtils.calculateWinRate(wins, totalGames);
    const profit = playerUtils.calculateProfit(stats.totalWon, stats.totalWagered);

    return {
      address: web3Utils.checksumAddress(address),
      wins,
      losses: Number(stats.losses),
      ties: Number(stats.ties),
      gamesPlayed: totalGames,
      totalWagered: stats.totalWagered,
      totalWon: stats.totalWon,
      winRate,
      profit,
      monthlyScore: Number(stats.monthlyScore),
      totalWageredFormatted: web3Utils.formatEther(stats.totalWagered),
      totalWonFormatted: web3Utils.formatEther(stats.totalWon),
      profitFormatted: web3Utils.formatEther(profit),
      roi: playerUtils.calculateROI(profit, stats.totalWagered),
      averageBet: playerUtils.calculateAverageBet(stats.totalWagered, totalGames)
    };
  }
};

// Cache utilities
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Rate limiting utilities
export class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier);

    if (!userRequests || now > userRequests.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    if (userRequests.count >= this.maxRequests) {
      return false;
    }

    userRequests.count++;
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const userRequests = this.requests.get(identifier);
    if (!userRequests || Date.now() > userRequests.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - userRequests.count);
  }

  getResetTime(identifier: string): number {
    const userRequests = this.requests.get(identifier);
    if (!userRequests || Date.now() > userRequests.resetTime) {
      return Date.now() + this.windowMs;
    }
    return userRequests.resetTime;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.requests.entries()) {
      if (now > value.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Validation utilities
export const validators = {
  isPositiveInteger: (value: any): boolean => {
    const num = Number(value);
    return Number.isInteger(num) && num > 0;
  },

  isValidLimit: (limit: any, max: number = 100): boolean => {
    const num = Number(limit);
    return Number.isInteger(num) && num > 0 && num <= max;
  },

  isValidOffset: (offset: any): boolean => {
    const num = Number(offset);
    return Number.isInteger(num) && num >= 0;
  },

  isValidGameStatus: (status: any): boolean => {
    const num = Number(status);
    return Number.isInteger(num) && num >= 0 && num <= 3;
  },

  isValidBetAmount: (amount: any): boolean => {
    const num = Number(amount);
    return !isNaN(num) && num >= 0;
  },

  isValidSortBy: (sortBy: any): boolean => {
    const validSorts = ['newest', 'oldest', 'highest-bet', 'lowest-bet'];
    return typeof sortBy === 'string' && validSorts.includes(sortBy);
  }
};

// Response formatting utilities
export const responseFormatter = {
  success: <T>(data: T, version: string = '1.0.0') => ({
    success: true,
    data,
    timestamp: Date.now(),
    version
  }),

  error: (message: string, version: string = '1.0.0') => ({
    success: false,
    error: message,
    timestamp: Date.now(),
    version
  }),

  paginated: <T>(
    items: T[],
    total: number,
    limit: number,
    offset: number,
    version: string = '1.0.0'
  ) => ({
    success: true,
    data: {
      items,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    },
    timestamp: Date.now(),
    version
  })
};

// Performance monitoring utilities
export class PerformanceMonitor {
  private metrics = new Map<string, { count: number; totalTime: number; avgTime: number }>();

  startTimer(operation: string): () => void {
    const start = process.hrtime.bigint();
    
    return () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000; // Convert to milliseconds
      
      const existing = this.metrics.get(operation) || { count: 0, totalTime: 0, avgTime: 0 };
      existing.count++;
      existing.totalTime += duration;
      existing.avgTime = existing.totalTime / existing.count;
      
      this.metrics.set(operation, existing);
    };
  }

  getMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [operation, metrics] of this.metrics.entries()) {
      result[operation] = {
        count: metrics.count,
        avgTime: Math.round(metrics.avgTime * 100) / 100,
        totalTime: Math.round(metrics.totalTime * 100) / 100
      };
    }
    return result;
  }

  reset(): void {
    this.metrics.clear();
  }
}