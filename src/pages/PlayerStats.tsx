import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useGame } from '../contexts/GameContext';
import { getPlayerLevel, getProgressToNextLevel, getStreakMultiplier } from '../utils/levelSystem';
import LevelBadge from '../components/LevelBadge';
import { Trophy, Target, TrendingUp, Coins, Calendar, Award, User, Star, Zap, Crown, Shield, Flame, Eye, BarChart3, Activity, Clock, RefreshCw, TrendingDown } from 'lucide-react';

const PlayerStats = () => {
  const { account, isConnected, web3 } = useWeb3();
  const { playerStats, fetchPlayerStats } = useGame();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    if (account) {
      setIsLoading(true);
      fetchPlayerStats(account).finally(() => {
        setIsLoading(false);
        setAnimateStats(true);
      });
    }
  }, [account]);

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-12 max-w-md mx-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer"></div>
          <div className="relative">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-300">Please connect your wallet to view your stats.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!playerStats || isLoading) {
    return (
      <div className="text-center py-20">
        <div className="relative">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/30 rounded-full mx-auto animate-ping"></div>
        </div>
        <p className="text-gray-300 text-lg">Loading your legendary stats...</p>
      </div>
    );
  }

  const totalGames = playerStats.gamesPlayed;
  const winRate = totalGames > 0 ? Math.round((playerStats.wins / totalGames) * 100) : 0;
  
  // CÁLCULO SIMPLIFICADO - SOLO MOSTRAR GANANCIAS TOTALES
  const totalWagered = parseFloat(web3?.utils.fromWei(playerStats.totalWagered, 'ether') || '0');
  const totalWon = parseFloat(web3?.utils.fromWei(playerStats.totalWon, 'ether') || '0');
  const avgBetSize = totalGames > 0 ? (totalWagered / totalGames) : 0;
  
  const referralEarnings = parseFloat(web3?.utils.fromWei(playerStats.referralEarnings || '0', 'ether') || '0');

  // Get player level and progress
  const level = getPlayerLevel(playerStats.monthlyScore);
  const { current, next, progress } = getProgressToNextLevel(playerStats.monthlyScore);
  
  // Mock win streak data (would come from contract in real implementation)
  const winStreak = Math.floor(Math.random() * 8) + 1;
  const streakMultiplier = getStreakMultiplier(winStreak);

  const getPerformanceRating = () => {
    if (winRate >= 70) return { rating: 'Legendary', color: 'text-yellow-400', icon: <Crown className="w-5 h-5" /> };
    if (winRate >= 60) return { rating: 'Elite', color: 'text-purple-400', icon: <Star className="w-5 h-5" /> };
    if (winRate >= 50) return { rating: 'Skilled', color: 'text-blue-400', icon: <Shield className="w-5 h-5" /> };
    if (winRate >= 40) return { rating: 'Developing', color: 'text-green-400', icon: <Target className="w-5 h-5" /> };
    return { rating: 'Rookie', color: 'text-gray-400', icon: <User className="w-5 h-5" /> };
  };

  const performance = getPerformanceRating();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Animated Header */}
      <div className="text-center mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl"></div>
        <div className="relative">
          <div className="flex justify-center items-center space-x-2 mb-2">
            <LevelBadge 
              level={level} 
              score={playerStats.monthlyScore} 
              size="sm" 
              showProgress={false}
              animated={true}
            />
            <div className="text-center">
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-1">
                Player Statistics
              </h1>
              <div className="flex items-center justify-center space-x-2 text-xs">
                <span className={`${performance.color} font-bold flex items-center space-x-2`}>
                  {performance.icon}
                  <span>{performance.rating} Player</span>
                </span>
                    <span className="text-orange-400 font-bold flex items-center space-x-2">
                      <Zap className="w-3 h-3" />
                      <span>{winStreak} Win Streak</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs">
            <span>Level {level.level} • {level.title}</span>
            <span>•</span>
            <span>{playerStats.monthlyScore} Score</span>
            <span>•</span>
            <span>{totalGames} Games Played</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDetailedView(!showDetailedView)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md font-medium transition-all text-xs ${
              showDetailedView ? 'bg-purple-600 text-white' : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Detailed View</span>
          </button>
          
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="bg-slate-800/50 border border-slate-600/50 rounded-md px-2 py-1 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="week">This Week</option>
          </select>
        </div>

        <button
          onClick={() => {
            setIsLoading(true);
            fetchPlayerStats(account!).finally(() => setIsLoading(false));
          }}
          disabled={isLoading}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md font-medium transition-all text-xs"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Level Progress Section */}
      <div className="mb-3 p-3 bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-lg border border-purple-500/30 rounded-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
        <div className="relative">
          <h2 className="text-sm font-bold text-white mb-2 flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>Level Progress & Perks</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-xs">Current Level: {level.title}</span>
                <span className="text-white font-bold text-xs">{playerStats.monthlyScore} points</span>
              </div>
              
              {next && (
                <>
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden mb-1">
                    <div 
                      className={`h-full bg-gradient-to-r ${next.gradient} transition-all duration-1000 ease-out relative`}
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xxs">
                    <span className="text-gray-400">Progress to {next.title}</span>
                    <span className="text-white font-medium">{Math.round(progress)}%</span>
                  </div>
                  <p className="text-gray-400 text-xxs mt-0.5">
                    {next.minScore - playerStats.monthlyScore} points needed
                  </p>
                </>
              )}
            </div>
            
            <div>
              <h3 className="text-xs font-bold text-white mb-2">Current Level Perks</h3>
              <div className="space-y-1">
                {level.perks.map((perk, index) => (
                  <div key={index} className="flex items-center space-x-1 text-xxs">
                    <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">{perk}</span>
                  </div>
                ))}
              </div>
              
              {winStreak >= 3 && (
                <div className="mt-2 p-1 bg-orange-500/20 border border-orange-500/50 rounded-md">
                  <div className="flex items-center space-x-1 text-orange-400">
                    <Flame className="w-3 h-3" />
                    <span className="font-bold text-xs">Hot Streak Bonus!</span>
                  </div>
                  <p className="text-orange-300 text-xxs">
                    {streakMultiplier}x multiplier on next win
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        {/* Win Rate */}
        <div className={`group relative overflow-hidden bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg border border-green-500/30 rounded-md p-2 hover-lift ${animateStats ? 'animate-fadeIn' : ''}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
          <div className="relative">
            <div className="flex items-center space-x-1 mb-1">
              <div className="w-5 h-5 bg-green-500/30 rounded-md flex items-center justify-center">
                <Trophy className="w-3 h-3 text-green-400" />
              </div>
              <div>
                <p className="text-green-400 text-xxs font-medium">Win Rate</p>
                <p className={`text-sm font-bold text-white ${animateStats ? 'animate-bounce-slow' : ''}`}>
                  {winRate}%
                </p>
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-1 rounded-full transition-all duration-2000"
                style={{ width: `${winRate}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Games Played */}
        <div className={`group relative overflow-hidden bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg border border-blue-500/30 rounded-md p-2 hover-lift ${animateStats ? 'animate-fadeIn' : ''}`} style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
          <div className="relative">
            <div className="flex items-center space-x-1">
              <div className="w-5 h-5 bg-blue-500/30 rounded-md flex items-center justify-center">
                <Target className="w-3 h-3 text-blue-400" />
              </div>
              <div>
                <p className="text-blue-400 text-xxs font-medium">Games Played</p>
                <p className={`text-sm font-bold text-white ${animateStats ? 'animate-bounce-slow' : ''}`}>
                  {totalGames}
                </p>
                <p className="text-blue-300" style={{fontSize: '0.5rem'}}>Total battles</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Total Won - SOLO GANANCIAS EN VERDE */}
        <div className={`group relative overflow-hidden bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg border border-green-500/30 rounded-md p-2 hover-lift ${animateStats ? 'animate-fadeIn' : ''}`} style={{ animationDelay: '0.2s' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
          <div className="relative">
            <div className="flex items-center space-x-1">
              <div className="w-5 h-5 bg-green-500/30 rounded-md flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-green-400" />
              </div>
              <div>
                <p className="text-green-400 text-xxs font-medium">Won</p>
                <p className={`text-sm font-bold text-green-400 ${animateStats ? 'animate-bounce-slow' : ''}`}>
                  {totalWon.toFixed(6)}
                </p>
                <p className="text-green-300" style={{fontSize: '0.5rem'}}>CORE</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Monthly Score */}
        <div className={`group relative overflow-hidden bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg border border-purple-500/30 rounded-md p-2 hover-lift ${animateStats ? 'animate-fadeIn' : ''}`} style={{ animationDelay: '0.3s' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
          <div className="relative">
            <div className="flex items-center space-x-1">
              <div className="w-5 h-5 bg-purple-500/30 rounded-md flex items-center justify-center">
                <Award className="w-3 h-3 text-purple-400" />
              </div>
              <div>
                <p className="text-purple-400 text-xxs font-medium">Monthly Score</p>
                <p className={`text-sm font-bold text-white ${animateStats ? 'animate-bounce-slow' : ''}`}>
                  {playerStats.monthlyScore}
                </p>
                <p className="text-purple-300" style={{fontSize: '0.5rem'}}>Ranking points</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid md:grid-cols-2 gap-3 mb-3">
        {/* Game Results */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-lg p-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer"></div>
          <div className="relative">
            <h2 className="text-sm font-bold text-white mb-2 flex items-center space-x-1">
              <BarChart3 className="w-4 h-4 text-yellow-400" />
              <span>Battle Results</span>
            </h2>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between p-1 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-md hover-lift">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-green-500/20 rounded-md flex items-center justify-center">
                    <Trophy className="w-3 h-3 text-green-400" />
                  </div>
                  <div>
                    <span className="text-white font-medium text-xs">Victories</span>
                    <p className="text-green-400 text-xxs">Crushing defeats</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-green-400">{playerStats.wins}</span>
              </div>
              
              <div className="flex items-center justify-between p-1 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-md hover-lift">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-red-500/20 rounded-md flex items-center justify-center">
                    <Target className="w-3 h-3 text-red-400" />
                  </div>
                  <div>
                    <span className="text-white font-medium text-xs">Defeats</span>
                    <p className="text-red-400 text-xxs">Learning experiences</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-red-400">{playerStats.losses}</span>
              </div>
              
              <div className="flex items-center justify-between p-1 bg-gradient-to-r from-gray-500/10 to-gray-600/10 border border-gray-500/30 rounded-md hover-lift">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gray-500/20 rounded-md flex items-center justify-center">
                    <Award className="w-3 h-3 text-gray-400" />
                  </div>
                  <div>
                    <span className="text-white font-medium text-xs">Draws</span>
                    <p className="text-gray-400 text-xxs">Evenly matched</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-400">{playerStats.ties}</span>
              </div>
            </div>
            
            {/* Performance Indicator */}
            <div className="mt-2 p-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {performance.icon}
                  <span className={`font-bold ${performance.color} text-xs`}>{performance.rating} Performance</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-xs">{winRate}%</p>
                  <p className="text-gray-400 text-xxs">Win Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary - SIMPLIFICADO SIN ROI */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-lg p-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer"></div>
          <div className="relative">
            <h2 className="text-sm font-bold text-white mb-2 flex items-center space-x-1">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span>Financial Summary</span>
            </h2>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between p-1 bg-slate-700/30 rounded-md hover-lift">
                <div className="flex items-center space-x-2">
                  <Coins className="w-3 h-3 text-blue-400" />
                  <span className="text-gray-300 text-xs">Total Wagered</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold text-xs">{totalWagered.toFixed(6)}</span>
                  <span className="text-blue-400 text-xxs ml-1">BNB</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-1 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-md hover-lift">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-3 h-3 text-green-400" />
                  <span className="text-gray-300 text-xs">Total Won</span>
                </div>
                <div className="text-right">
                  <span className="text-green-400 font-bold text-sm">{totalWon.toFixed(6)}</span>
                  <span className="text-green-300 text-xxs ml-1">BNB</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-1 bg-slate-700/30 rounded-md hover-lift">
                <div className="flex items-center space-x-2">
                  <Target className="w-3 h-3 text-orange-400" />
                  <span className="text-gray-300 text-xs">Average Bet</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold text-xs">{avgBetSize.toFixed(6)}</span>
                  <span className="text-orange-400 text-xxs ml-1">BNB</span>
                </div>
              </div>
              
              {referralEarnings > 0 && (
                <div className="flex items-center justify-between p-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-md hover-lift">
                  <div className="flex items-center space-x-2">
                    <Star className="w-3 h-3 text-purple-400" />
                    <span className="text-gray-300 text-xs">Referral Earnings</span>
                  </div>
                  <div className="text-right">
                    <span className="text-purple-400 font-bold text-xs">{referralEarnings.toFixed(6)}</span>
                    <span className="text-purple-300 text-xxs ml-1">BNB</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Earnings Explanation */}
            <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded-md">
              <h4 className="text-blue-400 font-bold mb-1 text-xs">💡 How Earnings Work</h4>
              <p className="text-blue-300 text-xxs">
                When you win a game, you receive your bet back plus 80% of your opponent's bet. 
                The "Won" amount shows your total BNB winnings from all victories.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics (Conditional) */}
      {showDetailedView && (
        <div className="grid md:grid-cols-3 gap-2 mb-3">
          {/* Activity Timeline */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-lg p-2">
            <h3 className="text-xs font-bold text-white mb-2 flex items-center space-x-1">
              <Activity className="w-3 h-3 text-blue-400" />
              <span>Activity</span>
            </h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xxs">Last Played</span>
                <span className="text-white text-xxs">
                  {playerStats.lastPlayed > 0 
                    ? new Date(playerStats.lastPlayed * 1000).toLocaleDateString()
                    : 'Never'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xxs">Avg Bet Size</span>
                <span className="text-white text-xxs">{avgBetSize.toFixed(6)} CORE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xxs">Games This Month</span>
                <span className="text-white text-xxs">{totalGames}</span>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-lg p-2">
            <h3 className="text-xs font-bold text-white mb-2 flex items-center space-x-1">
              <Award className="w-3 h-3 text-yellow-400" />
              <span>Achievements</span>
            </h3>
            <div className="space-y-1">
              {totalGames >= 10 && (
                <div className="flex items-center space-x-1 text-xxs">
                  <Trophy className="w-3 h-3 text-yellow-400" />
                  <span className="text-gray-300">Veteran Player</span>
                </div>
              )}
              {winRate >= 60 && (
                <div className="flex items-center space-x-1 text-xxs">
                  <Star className="w-3 h-3 text-purple-400" />
                  <span className="text-gray-300">High Win Rate</span>
                </div>
              )}
              {totalWon > 0 && (
                <div className="flex items-center space-x-1 text-xxs">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-gray-300">Earning Player</span>
                </div>
              )}
              {winStreak >= 5 && (
                <div className="flex items-center space-x-1 text-xxs">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span className="text-gray-300">Hot Streak</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-lg p-2">
            <h3 className="text-xs font-bold text-white mb-2 flex items-center space-x-1">
              <BarChart3 className="w-3 h-3 text-green-400" />
              <span>Quick Stats</span>
            </h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xxs">Best Streak</span>
                <span className="text-orange-400 font-bold text-xs">{winStreak}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xxs">Level Bonus</span>
                <span className="text-purple-400 font-bold text-xs">{(level.level - 1) * 5}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xxs">Rank Position</span>
                <span className="text-blue-400 font-bold text-xs">#{Math.floor(Math.random() * 100) + 1}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg border border-blue-500/30 rounded-lg p-3">
        <h2 className="text-sm font-bold text-white mb-2">Ready for Your Next Battle?</h2>
        <p className="text-gray-300 mb-3 text-xs">
          {winRate >= 60 
            ? "You're on fire! Keep that winning streak going!" 
            : "Every game is a chance to improve and earn more BNB!"
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <a
            href="/create"
            className="group relative overflow-hidden px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-md font-medium transition-all hover:scale-105 shadow-lg text-xs"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
            <div className="relative flex items-center space-x-1">
              <Target className="w-3 h-3" />
              <span>Create New Game</span>
            </div>
          </a>
          <a
            href="/games"
            className="px-3 py-1 bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 hover:text-white rounded-md font-medium transition-all border border-slate-600/50 hover:border-slate-500/50 text-xs"
          >
            Find Opponents
          </a>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;