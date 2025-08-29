import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { Trophy, Crown, Award, Coins, TrendingUp, RefreshCw, Users, Zap, AlertTriangle, Star, Target, Filter, BarChart3, Medal, Flame, Activity, Eye, Shield } from 'lucide-react';

interface StatisticsPlayer {
  address: string;
  wins: number;
  losses: number;
  ties: number;
  gamesPlayed: number;
  totalWagered: string;
  totalWon: string;
  winRate: number;
  monthlyScore: number;
  rank: number;
  isActive: boolean;
  poolPercentage: number;
  poolReward: string;
}

interface ContractStats {
  totalGames: number;
  totalPlayers: number;
  totalVolume: string;
  averageWinRate: number;
  rewardPool: string;
}

const Statistics = () => {
  const { contract, web3, isConnected, isCorrectNetwork, account } = useWeb3();
  const [allPlayers, setAllPlayers] = useState<StatisticsPlayer[]>([]);
  const [contractStats, setContractStats] = useState<ContractStats>({
    totalGames: 0,
    totalPlayers: 0,
    totalVolume: '0',
    averageWinRate: 0,
    rewardPool: '0'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterMinGames, setFilterMinGames] = useState(1);
  const [sortBy, setSortBy] = useState<'wins' | 'winRate' | 'poolReward' | 'games' | 'monthlyScore'>('monthlyScore');
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('compact');
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  // Distribución de recompensas del pozo mensual
  const rewardDistribution = [
    { place: 1, percentage: 40 },
    { place: 2, percentage: 30 },
    { place: 3, percentage: 15 },
    { place: 4, percentage: 10 },
    { place: 5, percentage: 5 }
  ];

  const getPoolPercentage = (rank: number): number => {
    const distribution = rewardDistribution.find(r => r.place === rank);
    return distribution ? distribution.percentage : 0;
  };

  const calculatePoolReward = (rank: number, rewardPool: string): string => {
    const percentage = getPoolPercentage(rank);
    if (percentage === 0) return '0';
    
    const poolAmount = parseFloat(web3?.utils.fromWei(rewardPool, 'ether') || '0');
    const rewardAmount = (poolAmount * percentage) / 100;
    return web3?.utils.toWei(rewardAmount.toString(), 'ether') || '0';
  };

  // Función mejorada para obtener todos los jugadores del contrato
  const fetchAllPlayersFromContract = async () => {
    if (!contract || !isCorrectNetwork || !web3) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching players from contract...');
      
      // Obtener estadísticas generales del contrato y el pozo de recompensas
      const [totalGames, totalPlayers, rewardPool] = await Promise.all([
        contract.methods.totalGames().call(),
        contract.methods.totalPlayers().call(),
        contract.methods.getRewardPoolInfo().call()
      ]);

      console.log(`📊 Contract stats: ${totalGames} games, ${totalPlayers} players, ${web3.utils.fromWei(rewardPool, 'ether')} CORE pool`);

      // Obtener la lista de jugadores registrados
      let playerAddresses: string[] = [];
      
      try {
        // Intentar obtener la lista de jugadores si el método existe
        playerAddresses = await contract.methods.getPlayers().call();
        console.log(`👥 Found ${playerAddresses.length} registered players`);
      } catch (error) {
        console.log('⚠️ getPlayers() method not available, using alternative approach');
        
        // Método alternativo: obtener jugadores desde eventos o iterando juegos
        try {
          const gameCount = await contract.methods.gameCounter().call();
          const uniqueAddresses = new Set<string>();
          
          // Iterar a través de los juegos para encontrar jugadores únicos
          for (let i = 1; i <= Math.min(Number(gameCount), 1000); i++) {
            try {
              const game = await contract.methods.getGame(i).call();
              if (game.creator && game.creator !== '0x0000000000000000000000000000000000000000') {
                uniqueAddresses.add(game.creator.toLowerCase());
              }
              if (game.opponent && game.opponent !== '0x0000000000000000000000000000000000000000') {
                uniqueAddresses.add(game.opponent.toLowerCase());
              }
            } catch (gameError) {
              // Continuar con el siguiente juego si hay error
              continue;
            }
          }
          
          playerAddresses = Array.from(uniqueAddresses);
          console.log(`👥 Found ${playerAddresses.length} unique players from games`);
        } catch (alternativeError) {
          console.error('❌ Alternative method failed:', alternativeError);
          throw new Error('No se pudieron obtener los jugadores del contrato');
        }
      }

      if (playerAddresses.length === 0) {
        console.log('⚠️ No players found');
        setAllPlayers([]);
        setContractStats({
          totalGames: Number(totalGames),
          totalPlayers: Number(totalPlayers),
          totalVolume: '0',
          averageWinRate: 0,
          rewardPool
        });
        setLastUpdate(new Date());
        return;
      }

      // Obtener estadísticas detalladas para cada jugador
      const playersWithStats: StatisticsPlayer[] = [];
      let totalVolumeWei = BigInt(0);
      let totalWinRateSum = 0;
      let activePlayersCount = 0;

      console.log('📈 Fetching detailed stats for each player...');

      for (let i = 0; i < playerAddresses.length; i++) {
        const address = playerAddresses[i];
        
        try {
          console.log(`📊 Fetching stats for player ${i + 1}/${playerAddresses.length}: ${address}`);
          
          const playerStats = await contract.methods.getPlayerStats(address).call();
          
          const gamesPlayed = Number(playerStats.gamesPlayed);
          const wins = Number(playerStats.wins);
          const losses = Number(playerStats.losses);
          const ties = Number(playerStats.ties);
          const totalWagered = playerStats.totalWagered;
          const totalWon = playerStats.totalWon;
          const monthlyScore = Number(playerStats.monthlyScore);
          
          // Calcular win rate
          const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
          
          // Determinar si el jugador está activo (ha jugado al menos 1 juego)
          const isActive = gamesPlayed > 0;
          
          // Solo incluir jugadores que cumplan con el filtro mínimo de juegos
          if (gamesPlayed >= filterMinGames) {
            playersWithStats.push({
              address: web3.utils.toChecksumAddress(address),
              wins,
              losses,
              ties,
              gamesPlayed,
              totalWagered,
              totalWon,
              winRate,
              monthlyScore,
              rank: 0, // Se asignará después del ordenamiento
              isActive,
              poolPercentage: 0, // Se calculará después del ranking
              poolReward: '0' // Se calculará después del ranking
            });

            // Acumular estadísticas para el resumen
            totalVolumeWei += BigInt(totalWagered);
            if (isActive) {
              totalWinRateSum += winRate;
              activePlayersCount++;
            }
          }
        } catch (playerError) {
          console.error(`❌ Error fetching stats for player ${address}:`, playerError);
          // Continuar con el siguiente jugador
          continue;
        }
      }

      console.log(`✅ Successfully fetched stats for ${playersWithStats.length} players`);

      // Ordenar jugadores según el criterio seleccionado
      playersWithStats.sort((a, b) => {
        switch (sortBy) {
          case 'wins':
            if (b.wins !== a.wins) return b.wins - a.wins;
            return b.winRate - a.winRate; // Tiebreaker por win rate
          case 'winRate':
            if (b.winRate !== a.winRate) return b.winRate - a.winRate;
            return b.wins - a.wins; // Tiebreaker por wins
          case 'poolReward':
            // Para pool reward, ordenamos por monthly score que determina el ranking
            return b.monthlyScore - a.monthlyScore;
          case 'games':
            if (b.gamesPlayed !== a.gamesPlayed) return b.gamesPlayed - a.gamesPlayed;
            return b.winRate - a.winRate; // Tiebreaker por win rate
          case 'monthlyScore':
          default:
            return b.monthlyScore - a.monthlyScore;
        }
      });

      // Asignar rankings y calcular porcentajes del pozo
      playersWithStats.forEach((player, index) => {
        player.rank = index + 1;
        player.poolPercentage = getPoolPercentage(player.rank);
        player.poolReward = calculatePoolReward(player.rank, rewardPool);
      });

      // Calcular estadísticas del contrato
      const averageWinRate = activePlayersCount > 0 ? Math.round(totalWinRateSum / activePlayersCount) : 0;

      setAllPlayers(playersWithStats);
      setContractStats({
        totalGames: Number(totalGames),
        totalPlayers: Number(totalPlayers),
        totalVolume: totalVolumeWei.toString(),
        averageWinRate,
        rewardPool
      });
      setLastUpdate(new Date());
      
      console.log('✅ Statistics updated successfully');
      
    } catch (err: any) {
      console.error('❌ Error fetching statistics:', err);
      setError(`Error al obtener estadísticas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (contract && isCorrectNetwork) {
      await fetchAllPlayersFromContract();
    }
  };

  useEffect(() => {
    if (contract && isCorrectNetwork) {
      fetchAllPlayersFromContract();
    }
  }, [contract, isCorrectNetwork, filterMinGames, sortBy]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    if (autoRefresh && contract && isCorrectNetwork) {
      const interval = setInterval(() => {
        fetchAllPlayersFromContract();
      }, 300000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [autoRefresh, contract, isCorrectNetwork, filterMinGames, sortBy]);

  // Filtrar jugadores según las opciones seleccionadas
  const filteredPlayers = allPlayers.filter(player => {
    if (showOnlyActive && !player.isActive) return false;
    return true;
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return { icon: '👑', color: 'text-yellow-400', bg: 'from-yellow-400 to-yellow-600' };
      case 2: return { icon: '🥈', color: 'text-gray-300', bg: 'from-gray-300 to-gray-500' };
      case 3: return { icon: '🥉', color: 'text-orange-400', bg: 'from-orange-400 to-orange-600' };
      case 4: return { icon: '🏆', color: 'text-purple-400', bg: 'from-purple-400 to-purple-600' };
      case 5: return { icon: '⭐', color: 'text-blue-400', bg: 'from-blue-400 to-blue-600' };
      default: return { icon: `#${rank}`, color: 'text-gray-400', bg: 'from-gray-600 to-gray-700' };
    }
  };

  const getPerformanceRating = (winRate: number, wins: number) => {
    if (wins >= 50 && winRate >= 70) return { rating: 'Legendary', color: 'text-yellow-400', icon: <Crown className="w-4 h-4" /> };
    if (wins >= 30 && winRate >= 60) return { rating: 'Elite', color: 'text-purple-400', icon: <Star className="w-4 h-4" /> };
    if (wins >= 20 && winRate >= 50) return { rating: 'Skilled', color: 'text-blue-400', icon: <Medal className="w-4 h-4" /> };
    if (wins >= 10 && winRate >= 40) return { rating: 'Developing', color: 'text-green-400', icon: <Target className="w-4 h-4" /> };
    return { rating: 'Rookie', color: 'text-gray-400', icon: <Users className="w-4 h-4" /> };
  };

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-12 max-w-md mx-auto">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-300">Please connect your wallet to view statistics.</p>
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="text-center py-20">
        <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-12 max-w-md mx-auto">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Wrong Network</h2>
          <p className="text-red-300">Please switch to Core Blockchain to view statistics.</p>
        </div>
      </div>
    );
  }

  const currentUserStats = filteredPlayers.find(player => player.address.toLowerCase() === account?.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}

      {/* Contract Statistics */}



      {/* Your Position */}
      {currentUserStats && (
        <div className="mb-4 p-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-lg border border-blue-500/30 rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
          <div className="relative">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span>Your Position</span>
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {getRankIcon(currentUserStats.rank).icon === '👑' ? (
                    <span className="text-xl">👑</span>
                  ) : getRankIcon(currentUserStats.rank).icon === '🥈' ? (
                    <span className="text-xl">🥈</span>
                  ) : getRankIcon(currentUserStats.rank).icon === '🥉' ? (
                    <span className="text-xl">🥉</span>
                  ) : getRankIcon(currentUserStats.rank).icon === '🏆' ? (
                    <span className="text-xl">🏆</span>
                  ) : getRankIcon(currentUserStats.rank).icon === '⭐' ? (
                    <span className="text-xl">⭐</span>
                  ) : (
                    <div className={`w-8 h-8 bg-gradient-to-br ${getRankIcon(currentUserStats.rank).bg} rounded-lg flex items-center justify-center`}>
                      <span className="text-white font-bold text-xs">#{currentUserStats.rank}</span>
                    </div>
                  )}
                </div>
                <p className="text-white font-bold text-sm">#{currentUserStats.rank}</p>
                <p className="text-gray-400 text-xs">Rank</p>
              </div>
              <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                <Trophy className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-green-400 font-bold text-sm">{currentUserStats.wins}</p>
                <p className="text-gray-400 text-xs">Wins</p>
              </div>
              <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                <Target className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <p className="text-red-400 font-bold text-sm">{currentUserStats.losses}</p>
                <p className="text-gray-400 text-xs">Losses</p>
              </div>
              <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                <Award className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-gray-400 font-bold text-sm">{currentUserStats.ties}</p>
                <p className="text-gray-400 text-xs">Ties</p>
              </div>
              <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-purple-400 font-bold text-sm">{currentUserStats.gamesPlayed}</p>
                <p className="text-gray-400 text-xs">Games</p>
              </div>
              <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-yellow-400 font-bold text-sm">{currentUserStats.poolPercentage}%</p>
                <p className="text-gray-400 text-xs">Pool Share</p>
              </div>
            </div>
            {currentUserStats.poolPercentage > 0 && (
              <div className="mt-3 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-lg">
                <div className="text-center">
                  <p className="text-yellow-300 text-xs mb-1">Monthly Reward Potential</p>
                  <p className="text-yellow-400 font-bold text-lg">
                    {parseFloat(web3?.utils.fromWei(currentUserStats.poolReward, 'ether') || '0').toFixed(4)} CORE
                  </p>
                  <p className="text-yellow-300 text-xs">
                    {currentUserStats.poolPercentage}% of {parseFloat(web3?.utils.fromWei(contractStats.rewardPool, 'ether') || '0').toFixed(4)} CORE pool
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2">
            <Filter className="w-3 h-3 text-gray-400" />
            <label className="text-gray-300 text-xs">Min Games:</label>
            <select
              value={filterMinGames}
              onChange={(e) => setFilterMinGames(Number(e.target.value))}
              className="bg-slate-800/50 border border-slate-600/50 rounded-md px-2 py-1 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={1}>1+</option>
              <option value={5}>5+</option>
              <option value={10}>10+</option>
              <option value={20}>20+</option>
              <option value={50}>50+</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-gray-300 text-xs">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-800/50 border border-slate-600/50 rounded-md px-2 py-1 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="monthlyScore">Monthly Score</option>
              <option value="wins">Wins</option>
              <option value="winRate">Win Rate</option>
              <option value="poolReward">Pool Reward</option>
              <option value="games">Games Played</option>
            </select>
          </div>

          <button
            onClick={() => setShowOnlyActive(!showOnlyActive)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-md font-medium transition-all text-xs ${
              showOnlyActive 
                ? 'bg-green-600/20 text-green-400 border border-green-500/50' 
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>Active Only</span>
          </button>

          <div className="flex items-center space-x-1 bg-slate-800 rounded-md p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2 py-1 rounded-sm font-medium transition-all text-xs ${
                viewMode === 'cards' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-2 py-1 rounded-sm font-medium transition-all text-xs ${
                viewMode === 'compact' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Compact
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md font-medium transition-all text-xs ${
              autoRefresh 
                ? 'bg-green-600/20 text-green-400 border border-green-500/50' 
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Live</span>
          </button>
          
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-md font-medium transition-all text-xs"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-6">
          <div className="relative">
            <div className="animate-spin w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <div className="absolute inset-0 w-12 h-12 border-3 border-blue-500/30 rounded-full mx-auto animate-ping"></div>
          </div>
          <p className="text-gray-300 text-sm">Loading player statistics from contract...</p>
          <p className="text-gray-400 text-xs mt-1">This may take a moment for large datasets</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-6">
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 max-w-md mx-auto">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Error Loading Statistics</h3>
            <p className="text-red-400 mb-3 text-sm">{error}</p>
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Statistics Display */}
      {!loading && !error && (
        <>
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-6">
              <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-8 max-w-md mx-auto">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-3">No Players Found</h3>
                <p className="text-gray-300 mb-4 text-sm">
                  No players found with {filterMinGames}+ games. Try lowering the minimum games filter.
                </p>
              </div>
            </div>
          ) : (
            <div className={`${viewMode === 'cards' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3' : 'bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl overflow-hidden'}`}>
              {viewMode === 'cards' ? (
                filteredPlayers.map((player) => {
                  const rankInfo = getRankIcon(player.rank);
                  const performance = getPerformanceRating(player.winRate, player.wins);
                  const isCurrentUser = player.address.toLowerCase() === account?.toLowerCase();
                  
                  return (
                    <div key={player.address} className={`relative overflow-hidden rounded-lg transition-all duration-300 cursor-pointer group ${
                      isCurrentUser 
                        ? 'bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-blue-600/20 border-2 border-blue-500/50 shadow-lg shadow-blue-500/20' 
                        : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600/50'
                    }`}>
                      {/* Animated background for top 5 */}
                      {player.rank <= 5 && (
                        <div className="absolute inset-0 opacity-20">
                          <div className={`absolute inset-0 bg-gradient-to-r ${rankInfo.bg} animate-pulse`}></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                        </div>
                      )}

                      <div className="relative p-3">
                        {/* Header */}
                        <div className="flex flex-col items-center mb-3">
                          <div className="flex items-center space-x-2 mb-2">
                            {/* Rank Badge */}
                            <div className={`w-8 h-8 bg-gradient-to-br ${rankInfo.bg} rounded-lg flex items-center justify-center relative`}>
                              <span className="text-white font-bold text-xs">
                                {player.rank <= 5 ? rankInfo.icon : `#${player.rank}`}
                              </span>
                              {player.rank <= 5 && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                              )}
                            </div>

                            {/* Player Info */}
                            <div>
                              <div className="flex flex-col items-center">
                                <p className="text-white font-bold text-xs text-center">
                                  {player.address.substring(0, 8)}...{player.address.substring(34)}
                                </p>
                                {isCurrentUser && (
                                  <span className="px-1 py-0.5 bg-blue-500/20 text-blue-400 text-xxs rounded-full mt-1">
                                    You
                                  </span>
                                )}
                                <div className="flex items-center space-x-1 mt-1">
                                  {React.cloneElement(performance.icon, { className: "w-3 h-3" })}
                                  <span className={`${performance.color} font-medium text-xxs`}>
                                    {performance.rating}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Compact Stats */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="text-center p-2 bg-green-500/10 border border-green-500/30 rounded-md">
                            <Trophy className="w-3 h-3 text-green-400 mx-auto mb-1" />
                            <p className="text-green-400 text-xs font-bold">{player.wins}</p>
                            <p className="text-gray-400 text-xxs">Wins</p>
                          </div>
                          <div className="text-center p-2 bg-red-500/10 border border-red-500/30 rounded-md">
                            <Target className="w-3 h-3 text-red-400 mx-auto mb-1" />
                            <p className="text-red-400 text-xs font-bold">{player.losses}</p>
                            <p className="text-gray-400 text-xxs">Losses</p>
                          </div>
                        </div>

                        {/* Win Rate and Score */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="text-center">
                            <p className="text-blue-400 text-sm font-bold">{player.winRate}%</p>
                            <p className="text-gray-400 text-xxs">Win Rate</p>
                          </div>
                          <div className="text-center">
                            <p className="text-purple-400 text-sm font-bold">{player.monthlyScore}</p>
                            <p className="text-gray-400 text-xxs">Score</p>
                          </div>
                        </div>

                        {/* Pool Reward */}
                        <div className={`p-2 rounded-md text-center ${
                          player.poolPercentage > 0 
                            ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50' 
                            : 'bg-slate-700/30'
                        }`}>
                          {player.poolPercentage > 0 ? (
                            <>
                              <p className="text-yellow-400 font-bold text-xs">
                                {player.poolPercentage}%
                              </p>
                              <p className="text-yellow-300 text-xxs">
                                {parseFloat(web3?.utils.fromWei(player.poolReward, 'ether') || '0').toFixed(4)} CORE
                              </p>
                            </>
                          ) : (
                            <p className="text-gray-400 text-xxs">No reward</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="divide-y divide-slate-700/50">
                  {filteredPlayers.map((player) => {
                    const rankInfo = getRankIcon(player.rank);
                    const performance = getPerformanceRating(player.winRate, player.wins);
                    const isCurrentUser = player.address.toLowerCase() === account?.toLowerCase();
                    const isTopFive = player.rank <= 5;
                    
                    return (
                      <div key={player.address} className={`p-3 hover:bg-slate-700/20 transition-all ${isTopFive ? `bg-gradient-to-r ${rankInfo.bg}/5` : ''} ${isCurrentUser ? 'bg-blue-500/10' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <span className={`text-lg font-bold w-6 ${rankInfo.color}`}>
                                {isTopFive ? rankInfo.icon : `#${player.rank}`}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="text-white font-medium text-sm">
                                  {player.address.substring(0, 8)}...{player.address.substring(34)}
                                </p>
                                {isCurrentUser && (
                                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xxs rounded-full">You</span>
                                )}
                                <div className="flex items-center space-x-1">
                                  {React.cloneElement(performance.icon, { className: "w-3 h-3" })}
                                  <span className={`${performance.color} text-xxs font-medium`}>
                                    {performance.rating}
                                  </span>
                                </div>
                                {player.poolPercentage > 0 && (
                                  <span className="px-1 py-0.5 bg-yellow-500/20 text-yellow-400 text-xxs rounded-full font-bold">
                                    {player.poolPercentage}% Pool
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-400 text-xs">
                                <span className="text-green-400 font-medium">{player.wins}W</span> • 
                                <span className="text-red-400 font-medium"> {player.losses}L</span> • 
                                <span className="text-gray-400 font-medium"> {player.ties}T</span> • 
                                <span className="text-blue-400"> {player.winRate}% WR</span> • 
                                <span className="text-purple-400"> {player.monthlyScore} Score</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {player.poolPercentage > 0 ? (
                              <>
                                <p className="text-yellow-400 font-bold text-sm">
                                  {parseFloat(web3?.utils.fromWei(player.poolReward, 'ether') || '0').toFixed(4)} CORE
                                </p>
                                <p className="text-yellow-300 text-xs">{player.poolPercentage}% of pool</p>
                              </>
                            ) : (
                              <>
                                <p className="text-gray-400 font-bold text-sm">No reward</p>
                                <p className="text-gray-500 text-xs">Not in top 5</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Results Summary */}
          {filteredPlayers.length > 0 && (
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                Showing {filteredPlayers.length} of {allPlayers.length} players 
                {filterMinGames > 1 && ` with ${filterMinGames}+ games`}
                {showOnlyActive && ' (active only)'}
                • Sorted by {sortBy}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Top 5 players share the monthly reward pool: 40%, 30%, 15%, 10%, 5%
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Statistics;