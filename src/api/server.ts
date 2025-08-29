import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import Web3 from 'web3';

// Types
interface GameData {
  id: number;
  creator: string;
  opponent: string;
  betAmount: string;
  status: number;
  winner: string;
  createdAt: number;
  revealDeadline: number;
  referrer: string;
}

interface PlayerStats {
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
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
  version: string;
}

// Configuration
const CONFIG = {
  PORT: process.env.API_PORT || 3001,
  CORE_RPC: 'https://rpc-core.icecreamswap.com',
  CONTRACT_ADDRESS: '0x3007582C0E80Fc9e381d7A1Eb198c72B0d1C3697',
  API_VERSION: '1.0.0',
  CACHE_TTL: 30000, // 30 seconds
  MAX_REQUESTS_PER_MINUTE: 100,
  MAX_GAMES_LIMIT: 100,
  MAX_PLAYERS_LIMIT: 50
};

// Contract ABI (simplified for API)
const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "_gameId", "type": "uint256"}],
    "name": "getGame",
    "outputs": [{"components": [
      {"internalType": "address", "name": "creator", "type": "address"},
      {"internalType": "bytes32", "name": "creatorMoveHash", "type": "bytes32"},
      {"internalType": "enum RockPaperScissors.Move", "name": "creatorMove", "type": "uint8"},
      {"internalType": "address", "name": "opponent", "type": "address"},
      {"internalType": "enum RockPaperScissors.Move", "name": "opponentMove", "type": "uint8"},
      {"internalType": "uint256", "name": "betAmount", "type": "uint256"},
      {"internalType": "enum RockPaperScissors.GameStatus", "name": "status", "type": "uint8"},
      {"internalType": "address", "name": "winner", "type": "address"},
      {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
      {"internalType": "uint256", "name": "revealDeadline", "type": "uint256"},
      {"internalType": "address", "name": "referrer", "type": "address"}
    ], "internalType": "struct RockPaperScissors.Game", "name": "", "type": "tuple"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "player", "type": "address"}],
    "name": "getPlayerStats",
    "outputs": [{"components": [
      {"internalType": "uint256", "name": "wins", "type": "uint256"},
      {"internalType": "uint256", "name": "losses", "type": "uint256"},
      {"internalType": "uint256", "name": "ties", "type": "uint256"},
      {"internalType": "uint256", "name": "gamesPlayed", "type": "uint256"},
      {"internalType": "uint256", "name": "totalWagered", "type": "uint256"},
      {"internalType": "uint256", "name": "totalWon", "type": "uint256"},
      {"internalType": "uint256", "name": "referralEarnings", "type": "uint256"},
      {"internalType": "uint256", "name": "lastPlayed", "type": "uint256"},
      {"internalType": "uint256", "name": "monthlyScore", "type": "uint256"}
    ], "internalType": "struct RockPaperScissors.PlayerStats", "name": "", "type": "tuple"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "gameCounter",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTopMonthlyPlayers",
    "outputs": [
      {"internalType": "address[]", "name": "", "type": "address[]"},
      {"internalType": "uint256[]", "name": "", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRewardPoolInfo",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalGames",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalPlayers",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Initialize Web3 and Contract
const web3 = new Web3(CONFIG.CORE_RPC);
const contract = new web3.eth.Contract(CONTRACT_ABI, CONFIG.CONTRACT_ADDRESS);

// Cache system
const cache = new Map<string, { data: any; timestamp: number }>();

const getFromCache = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Utility functions
const createResponse = <T>(success: boolean, data?: T, error?: string): ApiResponse<T> => ({
  success,
  data,
  error,
  timestamp: Date.now(),
  version: CONFIG.API_VERSION
});

const validateAddress = (address: string): boolean => {
  return web3.utils.isAddress(address);
};

const formatGameData = (gameData: any, gameId: number): GameData => ({
  id: gameId,
  creator: gameData.creator,
  opponent: gameData.opponent,
  betAmount: gameData.betAmount,
  status: Number(gameData.status),
  winner: gameData.winner,
  createdAt: Number(gameData.createdAt),
  revealDeadline: Number(gameData.revealDeadline),
  referrer: gameData.referrer
});

const formatPlayerStats = (stats: any, address: string): PlayerStats => {
  const totalGames = Number(stats.gamesPlayed);
  const wins = Number(stats.wins);
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  const profit = (BigInt(stats.totalWon) - BigInt(stats.totalWagered)).toString();

  return {
    address,
    wins,
    losses: Number(stats.losses),
    ties: Number(stats.ties),
    gamesPlayed: totalGames,
    totalWagered: stats.totalWagered,
    totalWon: stats.totalWon,
    winRate,
    profit,
    monthlyScore: Number(stats.monthlyScore)
  };
};

// Express app setup
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(compression());

// CORS configuration - UPDATED FOR PRODUCTION
app.use(cors({
  origin: [
    'http://ppt.falcox.net',
    'https://ppt.falcox.net',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: CONFIG.MAX_REQUESTS_PER_MINUTE,
  message: createResponse(false, null, 'Too many requests, please try again later'),
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json(createResponse(true, {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: Date.now(),
    version: CONFIG.API_VERSION,
    network: 'Core Blockchain',
    chainId: 1116,
    baseUrl: `${req.protocol}://${req.get('host')}/api`
  }));
});

// API Documentation endpoint
app.get('/api/docs', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/api`;
  
  const documentation = {
    title: 'Guerra de Elementos Arena API Documentation',
    version: CONFIG.API_VERSION,
    baseUrl,
    description: 'API REST robusta para interactuar con Guerra de Elementos Arena en Core Blockchain',
    endpoints: {
      'GET /health': 'Estado de la API y métricas',
      'GET /games': 'Obtener todos los juegos con filtros opcionales',
      'GET /games/:id': 'Obtener juego específico por ID',
      'GET /games/recent': 'Obtener juegos recientes (últimas 24 horas)',
      'GET /games/active': 'Obtener juegos activos/abiertos',
      'GET /players/:address/stats': 'Obtener estadísticas de jugador',
      'GET /players/leaderboard': 'Obtener ranking de mejores jugadores',
      'GET /contract/stats': 'Obtener estadísticas del contrato',
      'GET /contract/info': 'Obtener información del contrato',
      'POST /webhooks/game-events': 'Webhook para eventos del juego (requiere API key)'
    },
    parameters: {
      'limit': 'Número de resultados a retornar (máx 100)',
      'offset': 'Número de resultados a omitir',
      'status': 'Filtrar juegos por estado (0=abierto, 1=completado, 2=expirado, 3=revelar)',
      'creator': 'Filtrar juegos por dirección del creador',
      'minBet': 'Cantidad mínima de apuesta en CORE',
      'maxBet': 'Cantidad máxima de apuesta en CORE'
    },
    examples: {
      'Obtener juegos abiertos': `${baseUrl}/games?status=0&limit=10`,
      'Obtener estadísticas de jugador': `${baseUrl}/players/0x1234.../stats`,
      'Obtener juegos con apuestas altas': `${baseUrl}/games?minBet=10&limit=20`,
      'Obtener leaderboard': `${baseUrl}/players/leaderboard?limit=10`
    },
    rateLimit: {
      requests: CONFIG.MAX_REQUESTS_PER_MINUTE,
      window: '1 minute'
    },
    contact: {
      website: 'http://ppt.falcox.net',
      telegram: 'https://t.me/Falco_X_CORP',
      twitter: 'https://x.com/FalcoX_Corp/'
    }
  };
  
  res.json(createResponse(true, documentation));
});

// Games endpoints
app.get('/api/games', async (req, res) => {
  try {
    const {
      limit = 20,
      offset = 0,
      status,
      creator,
      minBet,
      maxBet,
      sortBy = 'newest'
    } = req.query;

    const limitNum = Math.min(Number(limit), CONFIG.MAX_GAMES_LIMIT);
    const offsetNum = Number(offset);

    const cacheKey = `games_${JSON.stringify(req.query)}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json(createResponse(true, cached));
    }

    const gameCount = await contract.methods.gameCounter().call();
    const totalGames = Number(gameCount);
    
    const games: GameData[] = [];
    const startId = Math.max(1, totalGames - offsetNum - limitNum + 1);
    const endId = Math.max(1, totalGames - offsetNum);

    for (let i = endId; i >= startId && games.length < limitNum; i--) {
      try {
        const gameData = await contract.methods.getGame(i).call();
        if (gameData.creator !== '0x0000000000000000000000000000000000000000') {
          const game = formatGameData(gameData, i);
          
          // Apply filters
          if (status !== undefined && game.status !== Number(status)) continue;
          if (creator && game.creator.toLowerCase() !== creator.toString().toLowerCase()) continue;
          if (minBet && parseFloat(web3.utils.fromWei(game.betAmount, 'ether')) < Number(minBet)) continue;
          if (maxBet && parseFloat(web3.utils.fromWei(game.betAmount, 'ether')) > Number(maxBet)) continue;
          
          games.push(game);
        }
      } catch (error) {
        console.error(`Error fetching game ${i}:`, error);
      }
    }

    // Sort games
    if (sortBy === 'oldest') {
      games.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sortBy === 'highest-bet') {
      games.sort((a, b) => parseFloat(web3.utils.fromWei(b.betAmount, 'ether')) - parseFloat(web3.utils.fromWei(a.betAmount, 'ether')));
    } else if (sortBy === 'lowest-bet') {
      games.sort((a, b) => parseFloat(web3.utils.fromWei(a.betAmount, 'ether')) - parseFloat(web3.utils.fromWei(b.betAmount, 'ether')));
    }

    const result = {
      games,
      pagination: {
        total: totalGames,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < totalGames
      },
      filters: { status, creator, minBet, maxBet, sortBy }
    };

    setCache(cacheKey, result);
    res.json(createResponse(true, result));
  } catch (error: any) {
    console.error('Error fetching games:', error);
    res.status(500).json(createResponse(false, null, error.message));
  }
});

app.get('/api/games/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = Math.min(Number(limit), 50);
    
    const cacheKey = `recent_games_${limitNum}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json(createResponse(true, cached));
    }

    const gameCount = await contract.methods.gameCounter().call();
    const totalGames = Number(gameCount);
    const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
    
    const recentGames: GameData[] = [];
    
    for (let i = totalGames; i >= 1 && recentGames.length < limitNum; i--) {
      try {
        const gameData = await contract.methods.getGame(i).call();
        if (gameData.creator !== '0x0000000000000000000000000000000000000000') {
          const game = formatGameData(gameData, i);
          if (game.createdAt >= oneDayAgo) {
            recentGames.push(game);
          } else {
            break; // Games are ordered by creation time
          }
        }
      } catch (error) {
        console.error(`Error fetching game ${i}:`, error);
      }
    }

    setCache(cacheKey, recentGames);
    res.json(createResponse(true, recentGames));
  } catch (error: any) {
    console.error('Error fetching recent games:', error);
    res.status(500).json(createResponse(false, null, error.message));
  }
});

app.get('/api/games/active', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const limitNum = Math.min(Number(limit), CONFIG.MAX_GAMES_LIMIT);
    
    const cacheKey = `active_games_${limitNum}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json(createResponse(true, cached));
    }

    const gameCount = await contract.methods.gameCounter().call();
    const totalGames = Number(gameCount);
    
    const activeGames: GameData[] = [];
    
    for (let i = totalGames; i >= 1 && activeGames.length < limitNum; i--) {
      try {
        const gameData = await contract.methods.getGame(i).call();
        if (gameData.creator !== '0x0000000000000000000000000000000000000000') {
          const game = formatGameData(gameData, i);
          if (game.status === 0 || game.status === 3) { // Open or Reveal phase
            activeGames.push(game);
          }
        }
      } catch (error) {
        console.error(`Error fetching game ${i}:`, error);
      }
    }

    setCache(cacheKey, activeGames);
    res.json(createResponse(true, activeGames));
  } catch (error: any) {
    console.error('Error fetching active games:', error);
    res.status(500).json(createResponse(false, null, error.message));
  }
});

app.get('/api/games/:id', async (req, res) => {
  try {
    const gameId = Number(req.params.id);
    
    if (!gameId || gameId < 1) {
      return res.status(400).json(createResponse(false, null, 'Invalid game ID'));
    }

    const cacheKey = `game_${gameId}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json(createResponse(true, cached));
    }

    const gameData = await contract.methods.getGame(gameId).call();
    
    if (gameData.creator === '0x0000000000000000000000000000000000000000') {
      return res.status(404).json(createResponse(false, null, 'Game not found'));
    }

    const game = formatGameData(gameData, gameId);
    
    // Add additional game details
    const gameDetails = {
      ...game,
      betAmountFormatted: web3.utils.fromWei(game.betAmount, 'ether'),
      statusText: ['Open', 'Completed', 'Expired', 'Reveal Phase'][game.status] || 'Unknown',
      isActive: game.status === 0 || game.status === 3,
      timeRemaining: game.status === 3 ? Math.max(0, game.revealDeadline - Math.floor(Date.now() / 1000)) : null
    };

    setCache(cacheKey, gameDetails);
    res.json(createResponse(true, gameDetails));
  } catch (error: any) {
    console.error('Error fetching game:', error);
    res.status(500).json(createResponse(false, null, error.message));
  }
});

// Players endpoints
app.get('/api/players/:address/stats', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!validateAddress(address)) {
      return res.status(400).json(createResponse(false, null, 'Invalid address format'));
    }

    const cacheKey = `player_stats_${address.toLowerCase()}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json(createResponse(true, cached));
    }

    const stats = await contract.methods.getPlayerStats(address).call();
    const playerStats = formatPlayerStats(stats, address);
    
    // Add additional calculated fields
    const enhancedStats = {
      ...playerStats,
      totalWageredFormatted: web3.utils.fromWei(playerStats.totalWagered, 'ether'),
      totalWonFormatted: web3.utils.fromWei(playerStats.totalWon, 'ether'),
      profitFormatted: web3.utils.fromWei(playerStats.profit, 'ether'),
      roi: playerStats.totalWagered !== '0' 
        ? ((parseFloat(web3.utils.fromWei(playerStats.profit, 'ether')) / parseFloat(web3.utils.fromWei(playerStats.totalWagered, 'ether'))) * 100).toFixed(2)
        : '0.00',
      averageBet: playerStats.gamesPlayed > 0 
        ? (parseFloat(web3.utils.fromWei(playerStats.totalWagered, 'ether')) / playerStats.gamesPlayed).toFixed(4)
        : '0.0000'
    };

    setCache(cacheKey, enhancedStats);
    res.json(createResponse(true, enhancedStats));
  } catch (error: any) {
    console.error('Error fetching player stats:', error);
    res.status(500).json(createResponse(false, null, error.message));
  }
});

app.get('/api/players/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = Math.min(Number(limit), CONFIG.MAX_PLAYERS_LIMIT);
    
    const cacheKey = `leaderboard_${limitNum}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json(createResponse(true, cached));
    }

    const topPlayersData = await contract.methods.getTopMonthlyPlayers().call();
    const addresses = topPlayersData[0];
    const scores = topPlayersData[1];
    
    const leaderboard: (PlayerStats & { rank: number })[] = [];
    
    for (let i = 0; i < Math.min(addresses.length, limitNum); i++) {
      try {
        const stats = await contract.methods.getPlayerStats(addresses[i]).call();
        const playerStats = formatPlayerStats(stats, addresses[i]);
        
        leaderboard.push({
          ...playerStats,
          rank: i + 1,
          monthlyScore: Number(scores[i])
        });
      } catch (error) {
        console.error(`Error fetching stats for player ${addresses[i]}:`, error);
      }
    }

    const result = {
      leaderboard,
      totalPlayers: addresses.length,
      lastUpdated: Date.now()
    };

    setCache(cacheKey, result);
    res.json(createResponse(true, result));
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json(createResponse(false, null, error.message));
  }
});

// Contract endpoints
app.get('/api/contract/stats', async (req, res) => {
  try {
    const cacheKey = 'contract_stats';
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json(createResponse(true, cached));
    }

    const [
      totalGames,
      totalPlayers,
      rewardPool,
      contractBalance
    ] = await Promise.all([
      contract.methods.totalGames().call(),
      contract.methods.totalPlayers().call(),
      contract.methods.getRewardPoolInfo().call(),
      web3.eth.getBalance(CONFIG.CONTRACT_ADDRESS)
    ]);

    const stats = {
      totalGames: Number(totalGames),
      totalPlayers: Number(totalPlayers),
      rewardPool: web3.utils.fromWei(rewardPool, 'ether'),
      contractBalance: web3.utils.fromWei(contractBalance, 'ether'),
      network: 'Core Blockchain',
      chainId: 1116,
      contractAddress: CONFIG.CONTRACT_ADDRESS
    };

    setCache(cacheKey, stats);
    res.json(createResponse(true, stats));
  } catch (error: any) {
    console.error('Error fetching contract stats:', error);
    res.status(500).json(createResponse(false, null, error.message));
  }
});

app.get('/api/contract/info', async (req, res) => {
  try {
    const info = {
      address: CONFIG.CONTRACT_ADDRESS,
      network: 'Core Blockchain',
      chainId: 1116,
      explorer: `https://scan.coredao.org/address/${CONFIG.CONTRACT_ADDRESS}`,
      version: '1.0.0',
      website: 'http://ppt.falcox.net',
      features: [
        'Commit-Reveal Scheme',
        'Automated Rewards',
        'Monthly Leaderboards',
        'Referral System',
        'Gas Optimized'
      ],
      security: {
        audited: false,
        auditScheduled: 'Q1 2025',
        verified: true,
        immutable: true
      },
      contact: {
        telegram: 'https://t.me/Falco_X_CORP',
        twitter: 'https://x.com/FalcoX_Corp/'
      }
    };

    res.json(createResponse(true, info));
  } catch (error: any) {
    console.error('Error fetching contract info:', error);
    res.status(500).json(createResponse(false, null, error.message));
  }
});

// Webhook endpoint for external integrations
app.post('/api/webhooks/game-events', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.WEBHOOK_API_KEY) {
    return res.status(401).json(createResponse(false, null, 'Invalid API key'));
  }

  const { event, gameId, data } = req.body;
  
  // Here you would process the webhook event
  // For example: notify Discord, update external databases, etc.
  
  console.log('Webhook received:', { event, gameId, data });
  
  res.json(createResponse(true, { received: true, event, gameId }));
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', error);
  res.status(500).json(createResponse(false, null, 'Internal server error'));
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json(createResponse(false, null, 'Endpoint not found'));
});

// Start server
const startServer = () => {
  app.listen(CONFIG.PORT, () => {
    console.log(`🚀 Guerra de Elementos Arena API Server running on port ${CONFIG.PORT}`);
    console.log(`📊 API Documentation: http://ppt.falcox.net:${CONFIG.PORT}/api/docs`);
    console.log(`🔗 Health Check: http://ppt.falcox.net:${CONFIG.PORT}/api/health`);
    console.log(`⛓️  Connected to Core Blockchain: ${CONFIG.CORE_RPC}`);
    console.log(`📝 Contract Address: ${CONFIG.CONTRACT_ADDRESS}`);
  });
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 API Server shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 API Server shutting down gracefully...');
  process.exit(0);
});

export { app, startServer };

// Auto-start if this file is run directly
if (require.main === module) {
  startServer();
}