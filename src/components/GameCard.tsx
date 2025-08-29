import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useGame } from '../contexts/GameContext';
import { getMoveText } from '../utils/gameStorage';
import { Clock, User, Trophy, Target, AlertCircle, Zap, Save, Star, Shield, Crown, Timer, Coins, Eye, Play, PartyPopper, Skull, Activity, Award } from 'lucide-react';

interface GameCardProps {
  game: {
    id: number;
    creator: string;
    opponent: string;
    betAmount: string;
    status: number;
    winner: string;
    createdAt: number;
    revealDeadline: number;
  };
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const { web3, account, balance } = useWeb3();
  const { joinGame, cancelGame, claimTimeout, autoRevealMove, hasStoredSecret } = useGame();
  const [selectedMove, setSelectedMove] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isAutoRevealing, setIsAutoRevealing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [hasShownResult, setHasShownResult] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return 'Open';
      case 1: return 'Completed';
      case 2: return 'Expired';
      case 3: return 'Reveal Phase';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'from-emerald-500 to-teal-500';
      case 1: return 'from-blue-500 to-indigo-500';
      case 2: return 'from-slate-500 to-slate-600';
      case 3: return 'from-yellow-500 to-orange-500';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0: return <Play className="w-4 h-4" />;
      case 1: return <Trophy className="w-4 h-4" />;
      case 2: return <Timer className="w-4 h-4" />;
      case 3: return <Eye className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatAddress = (address: string) => {
    if (!address || address === '0x0000000000000000000000000000000000000000') return 'N/A';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 60) return 'Now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const getBetTier = (betAmount: string) => {
    const amount = parseFloat(web3?.utils.fromWei(betAmount, 'ether') || '0');
    if (amount >= 10) return { tier: 'High', color: 'text-red-400', gradient: 'from-red-500 to-pink-500' };
    if (amount >= 1) return { tier: 'Med', color: 'text-yellow-400', gradient: 'from-yellow-500 to-orange-500' };
    return { tier: 'Low', color: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-500' };
  };

  useEffect(() => {
    const isMyGame = game.creator === account || game.opponent === account;
    const isCompleted = game.status === 1;
    const hasWinner = game.winner !== '0x0000000000000000000000000000000000000000';
    const storageKey = `game_result_shown_${game.id}`;
    const hasShownBefore = localStorage.getItem(storageKey);

    if (isMyGame && isCompleted && hasWinner && !hasShownBefore && !hasShownResult) {
      setShowResultModal(true);
      setHasShownResult(true);
      localStorage.setItem(storageKey, 'true');
    }
  }, [game, account, hasShownResult]);

  const checkSufficientBalance = (): boolean => {
    if (!web3 || !balance) return false;
    
    const betAmountEther = parseFloat(web3.utils.fromWei(game.betAmount, 'ether'));
    const userBalance = parseFloat(balance);
    const gasMargin = 0.002; // Increased margin for small bets
    const requiredBalance = betAmountEther + gasMargin;
    
    return userBalance >= requiredBalance;
  };

  const handleJoinGame = async () => {
    if (!selectedMove || !web3 || isJoining) return;
    
    if (!checkSufficientBalance()) {
      const betAmountEther = parseFloat(web3.utils.fromWei(game.betAmount, 'ether'));
      const userBalance = parseFloat(balance);
      
      const errorMessage = `Insufficient balance. Required: ${betAmountEther.toFixed(4)} CORE + gas fees. Your balance: ${userBalance.toFixed(4)} CORE`;
      
      const toast = (await import('react-hot-toast')).default;
      toast.error(errorMessage, {
        duration: 6000,
        style: {
          maxWidth: '400px',
          fontSize: '14px',
          padding: '16px',
        }
      });
      
      setShowJoinModal(false);
      setSelectedMove('');
      return;
    }
    
    try {
      setIsJoining(true);
      const betAmount = web3.utils.fromWei(game.betAmount, 'ether');
      await joinGame(game.id, parseInt(selectedMove), betAmount);
      setShowJoinModal(false);
      setSelectedMove('');
    } catch (error) {
      console.error('Error joining game:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleAutoReveal = async () => {
    setIsAutoRevealing(true);
    try {
      const success = await autoRevealMove(game.id);
      if (!success) {
        window.location.href = `/game/${game.id}`;
      }
    } catch (error) {
      console.error('Auto reveal error:', error);
    } finally {
      setIsAutoRevealing(false);
    }
  };

  const isMyGame = game.creator === account || game.opponent === account;
  const canJoin = game.status === 0 && 
                  game.creator !== account && 
                  game.opponent === '0x0000000000000000000000000000000000000000' && 
                  account && account !== '';
  
  const canCancel = game.status === 0 && 
                   game.creator === account && 
                   game.opponent === '0x0000000000000000000000000000000000000000';
  
  const canReveal = game.status === 3 && game.creator === account;
  const canClaim = game.status === 3 && game.opponent === account && Date.now() / 1000 > game.revealDeadline;
  const hasSecret = hasStoredSecret(game.id);
  const betTier = getBetTier(game.betAmount);

  const didWin = game.winner === account;
  const didLose = game.winner !== '0x0000000000000000000000000000000000000000' && game.winner !== account && isMyGame;

  const betAmountInEther = parseFloat(web3?.utils.fromWei(game.betAmount, 'ether') || '0');
  const totalWinAmount = betAmountInEther + (betAmountInEther * 0.8);

  return (
    <>
      <div 
        className={`
          relative overflow-hidden rounded-2xl transition-all duration-500 cursor-pointer group w-full
          ${isMyGame 
            ? 'bg-gradient-to-br from-blue-600/15 via-purple-600/10 to-blue-600/15 border border-blue-500/30 shadow-lg shadow-blue-500/10' 
            : 'bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800/50 hover:border-slate-700/50'
          }
          ${isHovered ? 'scale-105 shadow-2xl' : ''}
          ${game.status === 0 ? 'hover:shadow-emerald-500/10' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Sophisticated background effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
          
          {parseFloat(web3?.utils.fromWei(game.betAmount, 'ether') || '0') >= 10 && (
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 animate-pulse"></div>
          )}
        </div>

        {isMyGame && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-blue-500/10"></div>
        )}

        <div className="relative p-6 backdrop-blur-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-bold text-white">
                Game #{game.id}
              </h3>
              
              <div className="flex flex-wrap items-center gap-2">
                {isMyGame && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                    Your Game
                  </span>
                )}
                
                {hasSecret && canReveal && (
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold animate-pulse whitespace-nowrap">
                    Auto-Reveal Ready
                  </span>
                )}
                
                <span className={`px-2 py-1 ${betTier.gradient}/20 ${betTier.color} rounded-full text-xs font-semibold whitespace-nowrap`}>
                  {betTier.tier} Stakes
                </span>
              </div>
            </div>
            
            <div className="text-right flex-shrink-0">
              <span className={`px-3 py-2 bg-gradient-to-r ${getStatusColor(game.status)} text-white rounded-xl font-semibold text-sm flex items-center space-x-2 shadow-lg`}>
                {getStatusIcon(game.status)}
                <span>{getStatusText(game.status)}</span>
              </span>
              <p className="text-slate-500 text-xs mt-1 whitespace-nowrap">{getTimeAgo(game.createdAt)} ago</p>
            </div>
          </div>

          {/* Game Details */}
          <div className="space-y-4 mb-6">
            <div className="space-y-3">
              <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-700/30 min-h-[60px] flex items-center">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Creator</span>
                  </span>
                  <span className="text-white font-semibold text-right ml-2 break-all">
                    {game.creator === account ? (
                      <span className="text-blue-400">You</span>
                    ) : (
                      <span className="font-mono text-sm">{formatAddress(game.creator)}</span>
                    )}
                  </span>
                </div>
              </div>
              
              {game.opponent !== '0x0000000000000000000000000000000000000000' && (
                <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-700/30 min-h-[60px] flex items-center">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>Opponent</span>
                    </span>
                    <span className="text-white font-semibold text-right ml-2 break-all">
                      {game.opponent === account ? (
                        <span className="text-purple-400">You</span>
                      ) : (
                        <span className="font-mono text-sm">{formatAddress(game.opponent)}</span>
                      )}
                    </span>
                  </div>
                </div>
              )}
              
              <div className={`p-3 bg-gradient-to-r ${betTier.gradient}/10 border border-slate-700/30 rounded-xl min-h-[60px] flex items-center`}>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm flex items-center space-x-2">
                    <Coins className="w-4 h-4" />
                    <span>Bet Amount</span>
                  </span>
                  <div className="text-right ml-2">
                    <span className="text-white font-bold text-lg">
                      {parseFloat(web3?.utils.fromWei(game.betAmount, 'ether') || '0').toFixed(4)}
                    </span>
                    <span className={`${betTier.color} ml-1 text-sm font-semibold`}>BNB</span>
                  </div>
                </div>
              </div>
              
              {game.status === 3 && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl min-h-[60px]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-yellow-400 text-sm flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Deadline</span>
                    </span>
                    <span className="text-white text-xs font-mono break-all">
                      {new Date(game.revealDeadline * 1000).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Winner Display */}
          {game.winner !== '0x0000000000000000000000000000000000000000' && (
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-xl">
              <div className="flex items-center justify-center space-x-3">
                <Trophy className="w-6 h-6 text-yellow-400 animate-bounce" />
                <div className="text-center">
                  <p className="text-yellow-400 font-semibold text-sm">Game Winner</p>
                  <p className="text-lg font-bold text-white">
                    {game.winner === account ? '🎉 You Won!' : `${formatAddress(game.winner)} Won!`}
                  </p>
                </div>
                <Award className="w-6 h-6 text-yellow-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {canJoin && (
              <button
                onClick={() => setShowJoinModal(true)}
                className="w-full group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                <div className="relative flex items-center justify-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Join Battle</span>
                  <Zap className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            )}
            
            {canCancel && (
              <button
                onClick={() => cancelGame(game.id)}
                className="w-full group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                <div className="relative flex items-center justify-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>Cancel Game</span>
                </div>
              </button>
            )}
            
            {canReveal && hasSecret && (
              <button
                onClick={handleAutoReveal}
                disabled={isAutoRevealing}
                className="w-full group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-xl font-semibold transition-all hover:scale-105 disabled:cursor-not-allowed shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                <div className="relative flex items-center justify-center space-x-2">
                  {isAutoRevealing ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Auto-Revealing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Auto-Reveal Move</span>
                      <Star className="w-4 h-4 text-yellow-400" />
                    </>
                  )}
                </div>
              </button>
            )}
            
            {canReveal && !hasSecret && (
              <Link
                to={`/game/${game.id}`}
                className="w-full group relative overflow-hidden block px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                <div className="relative flex items-center justify-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Reveal Move</span>
                </div>
              </Link>
            )}
            
            {canClaim && (
              <button
                onClick={() => claimTimeout(game.id)}
                className="w-full group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                <div className="relative flex items-center justify-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Claim Victory</span>
                  <Crown className="w-4 h-4 text-yellow-400" />
                </div>
              </button>
            )}
            
            <Link
              to={`/game/${game.id}`}
              className="w-full group px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl font-semibold transition-all hover:scale-105 border border-slate-700/50 hover:border-slate-600/50 block text-center"
            >
              <div className="flex items-center justify-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>View Details</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Enhanced Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 border border-slate-700/50 rounded-3xl p-8 w-full max-w-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer"></div>
            
            <div className="relative">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Join Battle #{game.id}</h3>
                <p className="text-slate-400">Select your strategy and enter the arena</p>
              </div>
              
              <div className="mb-8 p-4 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-xl">
                <div className="flex items-center justify-center space-x-3 text-emerald-400">
                  <Coins className="w-6 h-6" />
                  <span className="font-semibold">Bet Amount:</span>
                  <span className="text-white font-bold text-lg">
                    {parseFloat(web3?.utils.fromWei(game.betAmount, 'ether') || '0').toFixed(4)} CORE
                  </span>
                </div>
              </div>
              
              <div className="mb-8">
                <label className="block text-slate-300 font-semibold mb-4">
                  Choose Your Strategy:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: '1', emoji: '🔥', name: 'Fire', desc: 'Aggressive' },
                    { value: '2', emoji: '💧', name: 'Water', desc: 'Adaptive' },
                    { value: '3', emoji: '🌿', name: 'Plant', desc: 'Defensive' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedMove(option.value)}
                      className={`group relative overflow-hidden p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                        selectedMove === option.value
                          ? 'border-emerald-500 bg-emerald-500/20 text-white shadow-lg shadow-emerald-500/25'
                          : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                      <div className="relative text-center">
                        <div className="text-3xl mb-2">{option.emoji}</div>
                        <div className="font-bold">{option.name}</div>
                        <div className="text-xs opacity-75">{option.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinGame}
                  disabled={!selectedMove || isJoining}
                  className="flex-1 group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-xl font-semibold transition-all disabled:cursor-not-allowed hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                  <div className="relative flex items-center justify-center space-x-2">
                    {isJoining ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Joining...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>Join Battle!</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Victory/Defeat Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`relative overflow-hidden rounded-3xl p-8 w-full max-w-lg ${
            didWin 
              ? 'bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-yellow-500/20 border-2 border-yellow-500/50' 
              : 'bg-gradient-to-br from-red-500/20 via-purple-500/20 to-red-500/20 border-2 border-red-500/50'
          }`}>
            <div className="absolute inset-0">
              {didWin ? (
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-yellow-400/20 animate-pulse"></div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-purple-500/10 to-red-500/10 animate-pulse"></div>
              )}
            </div>

            <div className="relative text-center">
              {didWin ? (
                <>
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-2xl">
                    <PartyPopper className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
                    🎉 VICTORY! 🎉
                  </h2>
                  <p className="text-xl text-yellow-300 mb-6">
                    Outstanding performance! You dominated the arena!
                  </p>
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-6 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <Coins className="w-6 h-6 text-yellow-400" />
                        <span className="text-yellow-300 font-semibold">Total Prize:</span>
                      </div>
                      <p className="text-white font-bold text-3xl">
                        {totalWinAmount.toFixed(4)} CORE
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <Skull className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-purple-500 bg-clip-text text-transparent mb-4">
                    💀 DEFEAT 💀
                  </h2>
                  <p className="text-xl text-red-300 mb-6">
                    A worthy opponent! Analyze and come back stronger!
                  </p>
                  <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-center space-x-3">
                      <Coins className="w-6 h-6 text-red-400" />
                      <span className="text-red-300 font-semibold">Amount Lost:</span>
                      <span className="text-white font-bold text-xl">
                        {parseFloat(web3?.utils.fromWei(game.betAmount, 'ether') || '0').toFixed(4)} CORE
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => setShowResultModal(false)}
                  className={`w-full px-8 py-4 rounded-xl font-bold text-white transition-all hover:scale-105 text-lg ${
                    didWin 
                      ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700' 
                      : 'bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700'
                  }`}
                >
                  {didWin ? '🎊 Excellent!' : '⚔️ Battle Again!'}
                </button>
                
                <Link
                  to="/games"
                  onClick={() => setShowResultModal(false)}
                  className="block w-full px-8 py-4 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl font-semibold transition-all border border-slate-700/50 hover:border-slate-600/50 text-center"
                >
                  Return to Arena
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GameCard;