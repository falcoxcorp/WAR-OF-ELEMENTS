import React, { useState } from 'react';
import { Trophy, Target, TrendingUp, Zap, Star, Award } from 'lucide-react';
import { getPlayerLevel, getProgressToNextLevel, getStreakMultiplier } from '../utils/levelSystem';
import LevelBadge from './LevelBadge';

interface PlayerCardProps {
  player: {
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
  };
  web3: any;
  isCurrentUser?: boolean;
  showDetails?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  web3, 
  isCurrentUser = false,
  showDetails = false 
}) => {
  const [expanded, setExpanded] = useState(false);
  const level = getPlayerLevel(player.score);
  const { current, next, progress } = getProgressToNextLevel(player.score);
  const winStreak = player.winStreak || 0;
  const streakMultiplier = getStreakMultiplier(winStreak);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(36)}`;
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-slate-600 to-slate-700';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '👑';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div 
      className={`
        relative overflow-hidden rounded-xl sm:rounded-2xl transition-all duration-300 cursor-pointer w-full
        ${isCurrentUser 
          ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-2 border-blue-500/50' 
          : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50'
        }
        ${expanded ? 'scale-105 z-10' : ''}
      `}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Animated background for top 3 */}
      {player.rank <= 3 && (
        <div className="absolute inset-0 opacity-20">
          <div className={`absolute inset-0 bg-gradient-to-r ${getRankColor(player.rank)} animate-pulse`}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
        </div>
      )}

      {/* Current user glow */}
      {isCurrentUser && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 animate-pulse"></div>
      )}

      <div className="relative p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Rank Badge */}
            <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${getRankColor(player.rank)} rounded-lg sm:rounded-xl flex items-center justify-center relative flex-shrink-0`}>
              <span className="text-white font-bold text-sm sm:text-base">
                {getRankIcon(player.rank)}
              </span>
              {player.rank <= 3 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 rounded-full animate-ping"></div>
              )}
            </div>

            {/* Player Info */}
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <p className="text-white font-bold text-sm sm:text-lg truncate max-w-[120px] sm:max-w-full">{formatAddress(player.address)}</p>
                {isCurrentUser && (
                  <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full flex-shrink-0">
                    You
                  </span>
                )}
                {winStreak >= 3 && (
                  <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full flex items-center space-x-1 flex-shrink-0">
                    <Zap className="w-2 h-2 sm:w-3 sm:h-3" />
                    <span>{winStreak} streak</span>
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-400 flex-wrap">
                <span>Rank #{player.rank}</span>
                <span className="hidden xs:inline">•</span>
                <span>{player.gamesPlayed} games</span>
                <span className="hidden xs:inline">•</span>
                <span className={`${player.winRate >= 60 ? 'text-green-400' : player.winRate >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {player.winRate}% win rate
                </span>
              </div>
            </div>
          </div>

          {/* Level Badge */}
          <div className="hidden sm:block">
            <LevelBadge 
              level={level} 
              score={player.score} 
              size="lg" 
              showProgress={!expanded}
              animated={player.rank <= 3}
            />
          </div>
        </div>

        {/* Mobile Level Badge */}
        <div className="sm:hidden mb-4 flex justify-center">
          <LevelBadge 
            level={level} 
            score={player.score} 
            size="md" 
            showProgress={!expanded}
            animated={player.rank <= 3}
          />
        </div>

        {/* Score and Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <div className="text-center">
            <p className={`text-xl sm:text-2xl font-bold ${
              player.rank === 1 ? 'text-yellow-400' : 
              player.rank === 2 ? 'text-gray-300' : 
              player.rank === 3 ? 'text-orange-400' : 
              'text-white'
            }`}>
              {player.score}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">Score</p>
          </div>
          
          <div className="text-center">
            <p className="text-green-400 text-lg sm:text-xl font-bold">{player.wins}</p>
            <p className="text-gray-400 text-xs sm:text-sm">Wins</p>
          </div>
          
          <div className="text-center">
            <p className="text-red-400 text-lg sm:text-xl font-bold">{player.losses}</p>
            <p className="text-gray-400 text-xs sm:text-sm">Losses</p>
          </div>
          
          <div className="text-center">
            <p className={`text-lg sm:text-xl font-bold ${
              parseFloat(web3?.utils.fromWei(player.profit, 'ether') || '0') >= 0 
                ? 'text-green-400' 
                : 'text-red-400'
            }`}>
              {parseFloat(web3?.utils.fromWei(player.profit, 'ether') || '0') >= 0 ? '+' : ''}
              {parseFloat(web3?.utils.fromWei(player.profit, 'ether') || '0').toFixed(3)}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">Profit (CORE)</p>
          </div>
        </div>

        {/* Level Progress */}
        {next && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1 sm:mb-2">
              <span className="text-gray-400 text-xs sm:text-sm">Progress to {next.title}</span>
              <span className="text-white text-xs sm:text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 sm:h-3 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${next.gradient} transition-all duration-1000 ease-out relative`}
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-1">
              {next.minScore - player.score} points to next level
            </p>
          </div>
        )}

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-700/50 space-y-3 sm:space-y-4 animate-fadeIn">
            {/* Level Perks */}
            <div>
              <h4 className="text-white font-bold mb-2 flex items-center space-x-2 text-sm sm:text-base">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                <span>Level Perks</span>
              </h4>
              <div className="space-y-1">
                {level.perks.map((perk, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs sm:text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></div>
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak Bonus */}
            {winStreak >= 3 && (
              <div className="p-2 sm:p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <div className="flex items-center space-x-2 text-orange-400">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-bold text-sm">Hot Streak!</span>
                </div>
                <p className="text-orange-300 text-xs sm:text-sm">
                  {streakMultiplier}x multiplier on next win
                </p>
              </div>
            )}

            {/* Detailed Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <h5 className="text-white font-medium text-sm sm:text-base">Financial</h5>
                <div className="text-xs sm:text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Wagered:</span>
                    <span className="text-white">{parseFloat(web3?.utils.fromWei(player.totalWagered, 'ether') || '0').toFixed(3)} CORE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Won:</span>
                    <span className="text-white">{parseFloat(web3?.utils.fromWei(player.totalWon, 'ether') || '0').toFixed(3)} CORE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ROI:</span>
                    <span className={`${
                      parseFloat(web3?.utils.fromWei(player.profit, 'ether') || '0') >= 0 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      {player.totalWagered !== '0' 
                        ? ((parseFloat(web3?.utils.fromWei(player.profit, 'ether') || '0') / parseFloat(web3?.utils.fromWei(player.totalWagered, 'ether') || '1')) * 100).toFixed(1)
                        : '0.0'
                      }%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h5 className="text-white font-medium text-sm sm:text-base">Performance</h5>
                <div className="text-xs sm:text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ties:</span>
                    <span className="text-white">{player.ties}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Bet:</span>
                    <span className="text-white">
                      {player.gamesPlayed > 0 
                        ? (parseFloat(web3?.utils.fromWei(player.totalWagered, 'ether') || '0') / player.gamesPlayed).toFixed(4)
                        : '0.0000'
                      } CORE
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Level:</span>
                    <span className={level.color}>{level.title}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;