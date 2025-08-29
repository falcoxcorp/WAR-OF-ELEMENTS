import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useGame } from '../contexts/GameContext';
import { getMoveText } from '../utils/gameStorage';
import { Clock, User, Trophy, Target, AlertCircle, Zap, Save, Star, Flame, Shield, Crown, Timer, Coins, Eye, Play, PartyPopper, Skull } from 'lucide-react';

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
      case 0: return 'from-green-500 to-green-600';
      case 1: return 'from-blue-500 to-blue-600';
      case 2: return 'from-gray-500 to-gray-600';
      case 3: return 'from-yellow-500 to-yellow-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0: return <Play className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 1: return <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 2: return <Timer className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 3: return <Eye className="w-3 h-3 sm:w-4 sm:h-4" />;
      default: return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  const formatAddress = (address: string) => {
    if (!address || address === '0x0000000000000000000000000000000000000000') return 'N/A';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
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
    if (amount >= 10) return { tier: 'High', color: 'text-red-400', icon: <Flame className="w-3 h-3 sm:w-4 sm:h-4" /> };
    if (amount >= 1) return { tier: 'Med', color: 'text-yellow-400', icon: <Star className="w-3 h-3 sm:w-4 sm:h-4" /> };
    return { tier: 'Low', color: 'text-green-400', icon: <Shield className="w-3 h-3 sm:w-4 sm:h-4" /> };
  };

  // Check if we should show result modal for completed games
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

  // Función para verificar si el usuario tiene suficiente saldo
  const checkSufficientBalance = (): boolean => {
    if (!web3 || !balance) return false;
    
    const betAmountEther = parseFloat(web3.utils.fromWei(game.betAmount, 'ether'));
    const userBalance = parseFloat(balance);
    
    // Agregar un pequeño margen para gas fees (0.001 CORE)
    const gasMargin = 0.001;
    const requiredBalance = betAmountEther + gasMargin;
    
    return userBalance >= requiredBalance;
  };

  const handleJoinGame = async () => {
    if (!selectedMove || !web3 || isJoining) return;
    
    // Verificar saldo antes de proceder
    if (!checkSufficientBalance()) {
      const betAmountEther = parseFloat(web3.utils.fromWei(game.betAmount, 'ether'));
      const userBalance = parseFloat(balance);
      
      // Mostrar mensaje de error específico
      const errorMessage = `Insufficient balance to join this game. Required: ${betAmountEther.toFixed(4)} CORE + gas fees. Your balance: ${userBalance.toFixed(4)} CORE`;
      
      // Usar toast para mostrar el error
      const toast = (await import('react-hot-toast')).default;
      toast.error(errorMessage, {
        duration: 6000,
        style: {
          maxWidth: '400px',
          fontSize: '14px',
          padding: '16px',
        }
      });
      
      // Cerrar el modal
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

  const handleCancelGame = async () => {
    try {
      await cancelGame(game.id);
    } catch (error) {
      console.error('Error cancelling game:', error);
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
  
  // FIXED: Verificar correctamente si el usuario puede unirse al juego
  const canJoin = game.status === 0 && 
                  game.creator !== account && // El creador NO puede unirse a su propio juego
                  game.opponent === '0x0000000000000000000000000000000000000000' && // No hay oponente aún
                  account && account !== ''; // El usuario está conectado
  
  const canCancel = game.status === 0 && 
                   game.creator === account && 
                   game.opponent === '0x0000000000000000000000000000000000000000';
  
  const canReveal = game.status === 3 && game.creator === account;
  const canClaim = game.status === 3 && game.opponent === account && Date.now() / 1000 > game.revealDeadline;
  const hasSecret = hasStoredSecret(game.id);
  const betTier = getBetTier(game.betAmount);

  // Determine if user won or lost
  const didWin = game.winner === account;
  const didLose = game.winner !== '0x0000000000000000000000000000000000000000' && game.winner !== account && isMyGame;

  // Calculate reward amounts
  const betAmountInEther = parseFloat(web3?.utils.fromWei(game.betAmount, 'ether') || '0');
  const ownBetAmount = betAmountInEther;
  const opponentBetAmount = betAmountInEther;
  const opponentShareAmount = opponentBetAmount * 0.8; // 80% of opponent's bet
  const totalWinAmount = ownBetAmount + opponentShareAmount;

  return (
    <>
      <div 
        className={`
          relative overflow-hidden rounded-xl sm:rounded-2xl transition-all duration-500 cursor-pointer group w-full max-w-full
          ${isMyGame 
            ? 'bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-blue-600/20 border-2 border-blue-500/50 shadow-lg shadow-blue-500/20' 
            : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600/50'
          }
          ${isHovered ? 'scale-105 shadow-2xl' : ''}
          ${game.status === 0 ? 'hover:shadow-green-500/20' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated background effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
          
          {parseFloat(web3?.utils.fromWei(game.betAmount, 'ether') || '0') >= 10 && (
            <div className="particles">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className="particle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 6}s`,
                    animationDuration: `${6 + Math.random() * 4}s`
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>

        {isMyGame && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 animate-pulse"></div>
        )}

        <div className="relative p-2 sm:p-3 backdrop-blur-sm">
          {/* Header with better responsive design */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative">
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center space-x-1">
                  <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent text-xs sm:text-xs md:text-sm">
                    Game #{game.id}
                  </span>
                </h3>
                
                {/* Status badges - better mobile layout */}
                <div className="flex flex-wrap items-center gap-0.5 mt-0.5">
                  {isMyGame && (
                    <span className="px-1 py-0.5 bg-orange-500/20 text-orange-400 rounded-full flex items-center space-x-0.5" style={{fontSize: '0.5rem'}}>
                      <User className="w-2 h-2" />
                      <span>You</span>
                    </span>
                  )}
                  
                  {hasSecret && canReveal && (
                    <span className="px-1 py-0.5 bg-green-500/20 text-green-400 rounded-full flex items-center space-x-0.5 animate-pulse" style={{fontSize: '0.5rem'}}>
                      <Save className="w-2 h-2" />
                      <span>Ready</span>
                    </span>
                  )}
                  
                  <span className="px-1 py-0.5 bg-gray-500/20 text-gray-400 rounded-full flex items-center space-x-0.5" style={{fontSize: '0.5rem'}}>
                    {betTier.icon}
                    <span className={betTier.color}>{betTier.tier}</span>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right sm:text-center">
              <span className={`px-1 py-0.5 bg-gradient-to-r ${getStatusColor(game.status)} text-white rounded-md font-medium flex items-center space-x-0.5 shadow-lg`} style={{fontSize: '0.5rem'}}>
                {getStatusIcon(game.status)}
                <span>{getStatusText(game.status)}</span>
              </span>
              <p className="text-gray-400 mt-0.5" style={{fontSize: '0.5rem'}}>{getTimeAgo(game.createdAt)}</p>
            </div>
          </div>

          {/* Game Info Grid - Better responsive layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mb-1 sm:mb-2">
            <div className="space-y-1">
              <div className="p-1 bg-slate-700/30 rounded-md border border-slate-600/30 hover:bg-slate-600/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center space-x-0.5" style={{fontSize: '0.5rem'}}>
                    <User className="w-2 h-2 sm:w-3 sm:h-3" />
                    <span>Creator</span>
                  </span>
                  <span className="text-white font-medium" style={{fontSize: '0.5rem'}}>
                    {game.creator === account ? (
                      <span className="text-blue-400 font-bold">You</span>
                    ) : (
                      <span className="break-all">{formatAddress(game.creator)}</span>
                    )}
                  </span>
                </div>
              </div>
              
              {game.opponent !== '0x0000000000000000000000000000000000000000' && (
                <div className="p-1 bg-slate-700/30 rounded-md border border-slate-600/30 hover:bg-slate-600/30 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center space-x-0.5" style={{fontSize: '0.5rem'}}>
                      <Target className="w-2 h-2 sm:w-3 sm:h-3" />
                      <span>Opponent</span>
                    </span>
                    <span className="text-white font-medium" style={{fontSize: '0.5rem'}}>
                      {game.opponent === account ? (
                        <span className="text-orange-400 font-bold">You</span>
                      ) : (
                        <span className="break-all">{formatAddress(game.opponent)}</span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="p-1 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-green-300 flex items-center space-x-0.5" style={{fontSize: '0.5rem'}}>
                    <Coins className="w-2 h-2 sm:w-3 sm:h-3" />
                    <span>Bet</span>
                  </span>
                  <div className="text-right">
                    <span className="text-white font-bold break-all" style={{fontSize: '0.5rem'}}>
                      {parseFloat(web3?.utils.fromWei(game.betAmount, 'ether') || '0').toFixed(4)}
                    </span>
                    <span className="text-green-400 ml-0.5" style={{fontSize: '0.5rem'}}>CORE</span>
                  </div>
                </div>
              </div>
              
              {game.status === 3 && (
                <div className="p-1 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-300 flex items-center space-x-0.5" style={{fontSize: '0.5rem'}}>
                      <Clock className="w-2 h-2 sm:w-3 sm:h-3" />
                      <span>Deadline</span>
                    </span>
                    <span className="text-white break-all" style={{fontSize: '0.5rem'}}>
                      {formatDate(game.revealDeadline)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Winner Display */}
          {game.winner !== '0x0000000000000000000000000000000000000000' && (
            <div className="mb-1 p-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-md">
              <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 animate-bounce" />
                <div className="text-center">
                  <p className="text-yellow-400 font-medium" style={{fontSize: '0.5rem'}}>Winner</p>
                  <p className="font-bold text-white break-all" style={{fontSize: '0.5rem'}}>
                    {game.winner === account ? '🎉 You Won!' : `${formatAddress(game.winner)} Won!`}
                  </p>
                </div>
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-0.5">
            {canJoin && (
              <button
                onClick={() => setShowJoinModal(true)}
                className="w-full group relative overflow-hidden px-2 py-0.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-md font-medium transition-all hover:scale-105 shadow-lg hover:shadow-green-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                <div className="relative flex items-center justify-center space-x-0.5">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span style={{fontSize: '0.5rem'}}>Join Battle</span>
                  <Zap className="w-2 h-2 sm:w-3 sm:h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            )}
            
            {canCancel && (
              <button
                onClick={handleCancelGame}
                className="w-full group relative overflow-hidden px-2 py-0.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-md font-medium transition-all hover:scale-105 shadow-lg hover:shadow-red-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                <div className="relative flex items-center justify-center space-x-0.5">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span style={{fontSize: '0.5rem'}}>Cancel Game</span>
                </div>
              </button>
            )}
            
            {canReveal && hasSecret && (
              <button
                onClick={handleAutoReveal}
                disabled={isAutoRevealing}
                className="w-full group relative overflow-hidden px-2 py-0.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-md font-medium transition-all hover:scale-105 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                <div className="relative flex items-center justify-center space-x-0.5">
                  {isAutoRevealing ? (
                    <>
                      <div className="animate-spin w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span style={{fontSize: '0.5rem'}}>Auto-Revealing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span style={{fontSize: '0.5rem'}}>Auto-Reveal Move</span>
                      <Star className="w-2 h-2 sm:w-3 sm:h-3 text-yellow-400" />
                    </>
                  )}
                </div>
              </button>
            )}
            
            {canReveal && !hasSecret && (
              <Link
                to={`/game/${game.id}`}
                className="w-full group relative overflow-hidden block px-2 py-0.5 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-md font-medium transition-all hover:scale-105 shadow-lg hover:shadow-yellow-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                <div className="relative flex items-center justify-center space-x-0.5">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span style={{fontSize: '0.5rem'}}>Reveal Move</span>
                </div>
              </Link>
            )}
            
            {canClaim && (
              <button
                onClick={() => claimTimeout(game.id)}
                className="w-full group relative overflow-hidden px-2 py-0.5 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-md font-medium transition-all hover:scale-105 shadow-lg hover:shadow-orange-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                <div className="relative flex items-center justify-center space-x-0.5">
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span style={{fontSize: '0.5rem'}}>Claim Victory</span>
                  <Crown className="w-2 h-2 sm:w-3 sm:h-3 text-yellow-400" />
                </div>
              </button>
            )}
            
            <Link
              to={`/game/${game.id}`}
              className="w-full group relative overflow-hidden block px-2 py-0.5 bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 hover:text-white rounded-md font-medium transition-all hover:scale-105 border border-slate-600/50 hover:border-slate-500/50"
            >
              <div className="relative flex items-center justify-center space-x-0.5">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                <span style={{fontSize: '0.5rem'}}>View Details</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Enhanced Join Game Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer"></div>
            
            <div className="relative">
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">Join Battle #{game.id}</h3>
                <p className="text-gray-300 text-sm sm:text-base">Choose your weapon and enter the arena!</p>
              </div>
              
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-lg sm:rounded-xl">
                <div className="flex items-center justify-center space-x-2 text-green-400">
                  <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-sm sm:text-base">Bet Amount:</span>
                  <span className="text-white font-bold text-base sm:text-lg break-all">
                    {parseFloat(web3?.utils.fromWei(game.betAmount, 'ether') || '0').toFixed(4)} CORE
                  </span>
                </div>
              </div>
              
              <div className="mb-4 sm:mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2 sm:mb-3">
                  Select Your Move:
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { value: '1', emoji: '🔥', name: 'Fuego', desc: 'Quema Plantas' },
                    { value: '2', emoji: '💧', name: 'Agua', desc: 'Apaga Fuego' },
                    { value: '3', emoji: '🌿', name: 'Plantas', desc: 'Absorbe Agua' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedMove(option.value)}
                      className={`group relative overflow-hidden p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 transition-all hover:scale-105 ${
                        selectedMove === option.value
                          ? 'border-green-500 bg-green-500/20 text-white shadow-lg shadow-green-500/25'
                          : 'border-slate-600 bg-slate-700/50 text-gray-300 hover:border-slate-500 hover:bg-slate-600/50'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                      <div className="relative text-center">
                        <div className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">{option.emoji}</div>
                        <div className="font-bold text-xs sm:text-sm md:text-base">{option.name}</div>
                        <div className="text-xs opacity-75 hidden sm:block">{option.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-2 sm:space-x-3">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-3 py-2 sm:px-4 sm:py-3 md:px-6 bg-slate-700 hover:bg-slate-600 text-white rounded-lg sm:rounded-xl font-medium transition-all text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinGame}
                  disabled={!selectedMove || isJoining}
                  className="flex-1 group relative overflow-hidden px-3 py-2 sm:px-4 sm:py-3 md:px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg sm:rounded-xl font-medium transition-all disabled:cursor-not-allowed hover:scale-105 text-sm sm:text-base"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                  <div className="relative flex items-center justify-center space-x-1 sm:space-x-2">
                    {isJoining ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Joining...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
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

      {/* Victory/Defeat Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-sm sm:max-w-lg ${
            didWin 
              ? 'bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-yellow-500/20 border-2 border-yellow-500/50' 
              : 'bg-gradient-to-br from-red-500/20 via-purple-500/20 to-red-500/20 border-2 border-red-500/50'
          }`}>
            {/* Animated background */}
            <div className="absolute inset-0">
              {didWin ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-yellow-400/20 animate-pulse"></div>
                  <div className="particles">
                    {[...Array(10)].map((_, i) => (
                      <div 
                        key={i} 
                        className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-yellow-400 rounded-full animate-bounce"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 2}s`,
                          animationDuration: `${1 + Math.random()}s`
                        }}
                      ></div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-purple-500/10 to-red-500/10 animate-pulse"></div>
              )}
            </div>

            <div className="relative text-center">
              {didWin ? (
                <>
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-bounce">
                    <PartyPopper className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-3 sm:mb-4">
                    🎉 VICTORY! 🎉
                  </h2>
                  <p className="text-lg sm:text-xl text-yellow-300 mb-4 sm:mb-6">
                    Congratulations! You won the battle!
                  </p>
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center space-x-2 mb-2">
                        <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                        <span className="text-yellow-300 font-medium text-sm sm:text-base">Prize Breakdown:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full text-sm">
                        <div className="bg-yellow-500/10 p-2 rounded-lg">
                          <p className="text-yellow-300">Your bet returned:</p>
                          <p className="text-white font-bold">{ownBetAmount.toFixed(4)} CORE</p>
                        </div>
                        <div className="bg-yellow-500/10 p-2 rounded-lg">
                          <p className="text-yellow-300">80% of opponent's bet:</p>
                          <p className="text-white font-bold">{opponentShareAmount.toFixed(4)} CORE</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-yellow-500/30 w-full">
                        <p className="text-yellow-300">Total Prize:</p>
                        <p className="text-white font-bold text-xl">{totalWinAmount.toFixed(4)} CORE</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Skull className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-red-400 to-purple-500 bg-clip-text text-transparent mb-3 sm:mb-4">
                    💀 DEFEAT 💀
                  </h2>
                  <p className="text-lg sm:text-xl text-red-300 mb-4 sm:mb-6">
                    Better luck next time, warrior!
                  </p>
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                    <div className="flex items-center justify-center space-x-2">
                      <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                      <span className="text-red-300 font-medium text-sm sm:text-base">Amount Lost:</span>
                      <span className="text-white font-bold text-lg sm:text-xl">
                        {parseFloat(web3?.utils.fromWei(game.betAmount, 'ether') || '0').toFixed(4)} CORE
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={() => setShowResultModal(false)}
                  className={`w-full px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-bold text-white transition-all hover:scale-105 text-sm sm:text-base ${
                    didWin 
                      ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700' 
                      : 'bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700'
                  }`}
                >
                  {didWin ? '🎊 Awesome!' : '⚔️ Fight Again!'}
                </button>
                
                <Link
                  to="/games"
                  onClick={() => setShowResultModal(false)}
                  className="block w-full px-4 py-2 sm:px-6 sm:py-3 bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 hover:text-white rounded-lg sm:rounded-xl font-medium transition-all border border-slate-600/50 hover:border-slate-500/50 text-sm sm:text-base"
                >
                  View All Games
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