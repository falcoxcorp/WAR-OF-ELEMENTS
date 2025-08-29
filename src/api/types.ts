// API Types and Interfaces

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
  version: string;
}

export interface GameData {
  id: number;
  creator: string;
  opponent: string;
  betAmount: string;
  status: number;
  winner: string;
  createdAt: number;
  revealDeadline: number;
  referrer: string;
  // Enhanced fields for API
  betAmountFormatted?: string;
  statusText?: string;
  isActive?: boolean;
  timeRemaining?: number | null;
}

export interface PlayerStats {
  address: string;
  wins: number;
  losses: number;
  ties: number;
  gamesPlayed: number;
  totalWagered: string;
  totalWon: string;
  winRate: number;
  profit: string;
  monthlyScore: number;
  rank?: number;
  // Enhanced fields for API
  totalWageredFormatted?: string;
  totalWonFormatted?: string;
  profitFormatted?: string;
  roi?: string;
  averageBet?: string;
}

export interface ContractStats {
  totalGames: number;
  totalPlayers: number;
  rewardPool: string;
  contractBalance: string;
  network: string;
  chainId: number;
  contractAddress: string;
}

export interface LeaderboardResponse {
  leaderboard: (PlayerStats & { rank: number })[];
  totalPlayers: number;
  lastUpdated: number;
}

export interface GamesResponse {
  games: GameData[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  filters: {
    status?: string;
    creator?: string;
    minBet?: string;
    maxBet?: string;
    sortBy?: string;
  };
}

export interface WebhookEvent {
  event: 'game_created' | 'game_joined' | 'game_completed' | 'game_cancelled';
  gameId: number;
  data: any;
  timestamp: number;
}

export interface ApiConfig {
  PORT: number | string;
  CORE_RPC: string;
  CONTRACT_ADDRESS: string;
  API_VERSION: string;
  CACHE_TTL: number;
  MAX_REQUESTS_PER_MINUTE: number;
  MAX_GAMES_LIMIT: number;
  MAX_PLAYERS_LIMIT: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  timestamp: number;
  version: string;
  network: string;
  chainId: number;
  lastBlockNumber?: number;
  responseTime?: number;
}

export interface ApiDocumentation {
  title: string;
  version: string;
  baseUrl: string;
  endpoints: Record<string, string>;
  parameters: Record<string, string>;
  examples: Record<string, string>;
  authentication?: {
    type: 'api-key' | 'bearer' | 'none';
    description: string;
  };
  rateLimit: {
    requests: number;
    window: string;
  };
}

// Request/Response interfaces for specific endpoints
export interface GetGamesRequest {
  limit?: number;
  offset?: number;
  status?: number;
  creator?: string;
  minBet?: number;
  maxBet?: number;
  sortBy?: 'newest' | 'oldest' | 'highest-bet' | 'lowest-bet';
}

export interface GetPlayerStatsRequest {
  address: string;
}

export interface GetLeaderboardRequest {
  limit?: number;
}

export interface WebhookRequest {
  event: string;
  gameId: number;
  data: any;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export const API_ERROR_CODES = {
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  GAME_NOT_FOUND: 'GAME_NOT_FOUND',
  PLAYER_NOT_FOUND: 'PLAYER_NOT_FOUND',
  INVALID_PARAMETERS: 'INVALID_PARAMETERS',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  CONTRACT_ERROR: 'CONTRACT_ERROR'
} as const;

export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES];