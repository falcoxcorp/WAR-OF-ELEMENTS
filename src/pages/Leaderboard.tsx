import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { Trophy, Crown, Award, Coins, TrendingUp, RefreshCw, Users, Zap, AlertTriangle, Star, Target, Filter } from 'lucide-react';
import { getPlayerLevel, PLAYER_LEVELS } from '../utils/levelSystem';
import PlayerCard from '../components/PlayerCard';
import LevelBadge from '../components/LevelBadge';

interface LeaderboardPlayer {
  address: string;
  score: number;
  wins: number;
  losses: number;
  ties: number;
  gamesPlayed: number;
  totalWagered: string;
  totalWon: string;
  winRate: number;
  profit: string;
  winStreak?: number;
  rank: number;
}

const Leaderboard = () => {
  const { contract, web3, isConnected, isCorrectNetwork, account } = useWeb3();
  const [topPlayers, setTopPlayers] = useState<LeaderboardPlayer[]>([]);
  const [rewardPool, setRewardPool] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterLevel, setFilterLevel] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');

  // Reward distribution percentages
  const rewardDistribution = [
    { place: 1, percentage: 40, icon: '👑', color: 'from-yellow-400 to-yellow-600', textColor: 'text-yellow-400' },
    { place: 2, percentage: 30, icon: '🥈', color: 'from-gray-300 to-gray-500', textColor: 'text-gray-300' },
    { place: 3, percentage: 15, icon: '🥉', color: 'from-orange-400 to-orange-600', textColor: 'text-orange-400' },
    { place: 4, percentage: 10, icon: '🏆', color: 'from-purple-400 to-purple-600', textColor: 'text-purple-400' },
    { place: 5, percentage: 5, icon: '⭐', color: 'from-blue-400 to-blue-600', textColor: 'text-blue-400' }
  ];

  const calculateRewardAmount = (percentage: number): number => {
    const poolAmount = parseFloat(web3?.utils.fromWei(rewardPool, 'ether') || '0');
    return (poolAmount * percentage) / 100;
  };

  const fetchLeaderboard = async () => {
    if (!contract || !isCorrectNetwork) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get top monthly players
      const result = await contract.methods.getTopMonthlyPlayers().call();
      const addresses = result[0];
      const scores = result[1];
      
      // Fetch detailed stats for each player
      const playersWithDetails: LeaderboardPlayer[] = [];
      
      for (let i = 0; i < addresses.length && i < 50; i++) {
        try {
          const playerStats = await contract.methods.getPlayerStats(addresses[i]).call();
          
          const totalWagered = playerStats.totalWagered;
          const totalWon = playerStats.totalWon;
          const gamesPlayed = Number(playerStats.gamesPlayed);
          const wins = Number(playerStats.wins);
          const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
          const profit = (BigInt(totalWon) - BigInt(totalWagered)).toString();
          
          // Calculate win streak (mock for now - would need contract support)
          const winStreak = Math.floor(Math.random() * 10); // Mock data
          
          playersWithDetails.push({
            address: addresses[i],
            score: Number(scores[i]),
            wins: Number(playerStats.wins),
            losses: Number(playerStats.losses),
            ties: Number(playerStats.ties),
            gamesPlayed,
            totalWagered,
            totalWon,
            winRate,
            profit,
            winStreak,
            rank: i + 1
          });
        } catch (err) {
          console.error(`Error fetching stats for player ${addresses[i]}:`, err);
        }
      }
      
      setTopPlayers(playersWithDetails);
      setLastUpdate(new Date());
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRewardPool = async () => {
    if (!contract || !isCorrectNetwork) return;
    
    try {
      const pool = await contract.methods.getRewardPoolInfo().call();
      setRewardPool(pool);
    } catch (err) {
      console.error('Error fetching reward pool:', err);
    }
  };

  const refreshData = async () => {
    if (contract && isCorrectNetwork) {
      await Promise.all([fetchLeaderboard(), fetchRewardPool()]);
    }
  };

  useEffect(() => {
    if (contract && isCorrectNetwork) {
      refreshData();
    }
  }, [contract, isCorrectNetwork]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (autoRefresh && contract && isCorrectNetwork) {
      const interval = setInterval(() => {
        refreshData();
      }, 300000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [autoRefresh, contract, isCorrectNetwork]);

  // Listen for blockchain events
  useEffect(() => {
    if (contract && isCorrectNetwork) {
      const gameCompletedEvent = contract.events.GameCompleted();
      const gameCreatedEvent = contract.events.GameCreated();

      gameCompletedEvent.on('data', () => {
        console.log('Game completed - refreshing leaderboard');
        setTimeout(refreshData, 2000);
      });

      gameCreatedEvent.on('data', () => {
        console.log('Game created - refreshing reward pool');
        setTimeout(fetchRewardPool, 1000);
      });

      return () => {
        gameCompletedEvent.removeAllListeners();
        gameCreatedEvent.removeAllListeners();
      };
    }
  }, [contract, isCorrectNetwork]);

  const filteredPlayers = filterLevel 
    ? topPlayers.filter(player => getPlayerLevel(player.score).level === filterLevel)
    : topPlayers;

  const levelDistribution = PLAYER_LEVELS.map(level => ({
    ...level,
    count: topPlayers.filter(player => getPlayerLevel(player.score).level === level.level).length
  }));

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-12 max-w-md mx-auto">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-300">Please connect your wallet to view the leaderboard.</p>
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
          <p className="text-red-300">Please switch to Binance Smart Chain to view the leaderboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Animated Header */}
      <div className="text-center mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl"></div>
        <div className="relative">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
            Champions Arena
          </h1>
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className={`w-4 h-4 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-gray-300 text-lg">Live Rankings & Levels</span>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
          {lastUpdate && (
            <p className="text-gray-400">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Enhanced Reward Pool Section */}
      <div className="mb-8 bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20 backdrop-blur-lg border border-yellow-500/30 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
        <div className="relative">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Monthly Reward Pool</h2>
                <p className="text-yellow-300">Top players earn rewards from the prize pool</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-600/30 to-orange-600/30 border border-yellow-500/50 rounded-2xl p-6 mb-6">
              <div className="text-center">
                <p className="text-yellow-300 text-lg font-medium mb-2">Current Pool Amount</p>
                <p className="text-5xl font-bold text-white mb-2">
                  {parseFloat(web3?.utils.fromWei(rewardPool, 'ether') || '0').toFixed(4)} BNB
                </p>
                <p className="text-yellow-300 text-sm mt-2">
                  ≈ ${(parseFloat(web3?.utils.fromWei(rewardPool, 'ether') || '0') * 600).toFixed(2)} USD
                </p>
              </div>
            </div>
          </div>

          {/* Reward Distribution Breakdown */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Prize Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {rewardDistribution.map((reward, index) => {
                const rewardAmount = calculateRewardAmount(reward.percentage);
                return (
                  <div 
                    key={reward.place} 
                    className={`relative overflow-hidden bg-gradient-to-br ${reward.color}/20 backdrop-blur-lg border border-${reward.color.split('-')[1]}-500/30 rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
                    <div className="relative">
                      <div className="text-4xl mb-3">{reward.icon}</div>
                      <div className="mb-3">
                        <p className={`${reward.textColor} font-bold text-lg`}>
                          {reward.place === 1 ? '1st Place' : 
                           reward.place === 2 ? '2nd Place' : 
                           reward.place === 3 ? '3rd Place' : 
                           `${reward.place}th Place`}
                        </p>
                        <p className="text-white text-sm opacity-75">
                          {reward.percentage}% of pool
                        </p>
                      </div>
                      
                      <div className={`bg-gradient-to-r ${reward.color}/30 border border-${reward.color.split('-')[1]}-500/50 rounded-xl p-3 mb-3`}>
                        <p className="text-white font-bold text-xl">
                          {rewardAmount.toFixed(4)} BNB
                        </p>
                      </div>
                      
                      <p className="text-gray-300 text-xs">
                        ≈ ${(rewardAmount * 600).toFixed(2)} USD
                      </p>
                      
                      {/* Show current player if they're in top 5 */}
                      {topPlayers[index] && (
                        <div className="mt-3 pt-3 border-t border-white/20">
                          <p className="text-white text-xs font-medium">
                            {topPlayers[index].address === account ? (
                              <span className="text-yellow-400 font-bold">🎯 YOU!</span>
                            ) : (
                              `${topPlayers[index].address.substring(0, 6)}...${topPlayers[index].address.substring(38)}`
                            )}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {topPlayers[index].score} points
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Additional Info */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 text-center">
                <Crown className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-blue-400 font-bold">Next Distribution</p>
                <p className="text-white text-sm">End of month</p>
              </div>
              
              <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-4 text-center">
                <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-purple-400 font-bold">Eligible Players</p>
                <p className="text-white text-sm">{topPlayers.length} active</p>
              </div>
              
              <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-center">
                <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-bold">Pool Growth</p>
                <p className="text-white text-sm">+5% from fees</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        {/* Level Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterLevel(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterLevel === null 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            All Levels
          </button>
          {PLAYER_LEVELS.slice(0, 6).map(level => (
            <button
              key={level.level}
              onClick={() => setFilterLevel(level.level)}
              className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                filterLevel === level.level 
                  ? `bg-gradient-to-r ${level.gradient} text-white` 
                  : `${level.badge} text-gray-300 hover:bg-opacity-30`
              }`}
            >
              <span>{level.icon}</span>
              <span className="hidden sm:inline">{level.title}</span>
            </button>
          ))}
        </div>

        {/* View Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 rounded-md font-medium transition-all ${
                viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-2 rounded-md font-medium transition-all ${
                viewMode === 'compact' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Compact
            </button>
          </div>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              autoRefresh 
                ? 'bg-green-600/20 text-green-400 border border-green-500/50' 
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Live</span>
          </button>
          
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Active Players */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Players</p>
              <p className="text-2xl font-bold text-white">{topPlayers.length}</p>
            </div>
          </div>
        </div>
        
        {/* Total Volume */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Volume</p>
              <p className="text-2xl font-bold text-white">
                {topPlayers.reduce((sum, player) => 
                  sum + parseFloat(web3?.utils.fromWei(player.totalWagered, 'ether') || '0'), 0
                ).toFixed(2)}
              </p>
              <p className="text-gray-400 text-xs">CORE</p>
            </div>
          </div>
        </div>

        {/* Average Level */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg Level</p>
              <p className="text-2xl font-bold text-white">
                {topPlayers.length > 0 
                  ? (topPlayers.reduce((sum, player) => sum + getPlayerLevel(player.score).level, 0) / topPlayers.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Pool Growth */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Coins className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pool Growth</p>
              <p className="text-2xl font-bold text-white">+5%</p>
              <p className="text-purple-400 text-xs">From game fees</p>
            </div>
          </div>
        </div>
      </div>

      {/* Level Distribution */}
      <div className="bg-slate-800/30 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-400" />
          <span>Level Distribution</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {levelDistribution.map(level => (
            <div key={level.level} className="text-center">
              <LevelBadge level={level} score={level.minScore} size="sm" />
              <p className="text-white font-bold mt-2">{level.count}</p>
              <p className="text-gray-400 text-xs">players</p>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      {error ? (
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Error Loading Data</h3>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all"
          >
            Try Again
          </button>
        </div>
      ) : filteredPlayers.length > 0 ? (
        <div className={`${viewMode === 'cards' ? 'space-y-4' : 'bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl overflow-hidden'}`}>
          {viewMode === 'cards' ? (
            filteredPlayers.map((player) => (
              <PlayerCard 
                key={player.address} 
                player={player} 
                web3={web3}
                isCurrentUser={player.address.toLowerCase() === account?.toLowerCase()}
                showDetails={true}
              />
            ))
          ) : (
            <div className="divide-y divide-slate-700/50">
              {filteredPlayers.map((player) => {
                const level = getPlayerLevel(player.score);
                const isTopFive = player.rank <= 5;
                const rewardInfo = isTopFive ? rewardDistribution[player.rank - 1] : null;
                const potentialReward = rewardInfo ? calculateRewardAmount(rewardInfo.percentage) : 0;
                
                return (
                  <div key={player.address} className={`p-4 hover:bg-slate-700/20 transition-all ${isTopFive ? 'bg-gradient-to-r from-yellow-500/5 to-orange-500/5' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          <span className={`text-2xl font-bold w-8 ${isTopFive ? rewardInfo?.textColor : 'text-gray-400'}`}>
                            {isTopFive ? rewardInfo?.icon : `#${player.rank}`}
                          </span>
                          <LevelBadge level={level} score={player.score} size="sm" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-white font-medium">
                              {player.address.substring(0, 8)}...{player.address.substring(34)}
                            </p>
                            {player.address.toLowerCase() === account?.toLowerCase() && (
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">You</span>
                            )}
                            {isTopFive && (
                              <span className={`px-2 py-1 ${rewardInfo?.color}/20 ${rewardInfo?.textColor} text-xs rounded-full font-bold`}>
                                {rewardInfo?.percentage}% = {potentialReward.toFixed(4)} CORE
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">{player.gamesPlayed} games • {player.winRate}% win rate</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{player.score}</p>
                        <p className="text-gray-400 text-sm">{level.title}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Players Found</h3>
          <p className="text-gray-300">
            {filterLevel ? `No players found at level ${filterLevel}` : 'Be the first to start playing and claim the top spot!'}
          </p>
        </div>
      )}

      {/* Enhanced Rewards Info */}
      <div className="mt-12 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border border-yellow-500/30 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <Crown className="w-6 h-6 text-yellow-400" />
          <span>Championship Rewards</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Monthly Distribution</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center space-x-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span>1st Place: 40% of pool + Legendary status</span>
              </li>
              <li className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-gray-300" />
                <span>2nd Place: 30% of pool + Champion title</span>
              </li>
              <li className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-orange-400" />
                <span>3rd Place: 15% of pool + Master badge</span>
              </li>
              <li className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-purple-400" />
                <span>4th Place: 10% of pool + Elite recognition</span>
              </li>
              <li className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-blue-400" />
                <span>5th Place: 5% of pool + Rising star badge</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Current Pool Value</h3>
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-xl p-4">
              <p className="text-yellow-400 text-sm mb-1">Total Prize Pool</p>
              <p className="text-3xl font-bold text-white">
                {parseFloat(web3?.utils.fromWei(rewardPool, 'ether') || '0').toFixed(4)} BNB
              </p>
              <p className="text-yellow-300 text-sm">
                ≈ ${(parseFloat(web3?.utils.fromWei(rewardPool, 'ether') || '0') * 600).toFixed(2)} USD
              </p>
            </div>
            <ul className="space-y-2 text-gray-300 mt-4">
              <li>• Pool grows with every game played</li>
              <li>• 5% of all game fees go to rewards</li>
              <li>• Monthly distribution to top performers</li>
              <li>• Rankings reset each month</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;