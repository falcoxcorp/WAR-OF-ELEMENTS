import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useGame } from '../contexts/GameContext';
import { getGameSecret, getMoveText } from '../utils/gameStorage';
import { Clock, User, Trophy, Target, AlertCircle, ArrowLeft, Zap, Save } from 'lucide-react';

const GameDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { web3, account } = useWeb3();
  const { games, revealMove, claimTimeout, cancelGame, autoRevealMove, hasStoredSecret } = useGame();
  const [game, setGame] = useState<any>(null);
  const [move, setMove] = useState('');
  const [secret, setSecret] = useState('');
  const [isAutoRevealing, setIsAutoRevealing] = useState(false);

  useEffect(() => {
    if (games && id) {
      const foundGame = games.find(g => g.id === parseInt(id));
      setGame(foundGame);
      
      // Automatically load stored secret if available
      if (foundGame) {
        const storedSecret = getGameSecret(foundGame.id);
        if (storedSecret) {
          setMove(storedSecret.move.toString());
          setSecret(storedSecret.secret);
        }
      }
    }
  }, [games, id]);

  const handleRevealMove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!move || !secret || !game) return;
    
    await revealMove(game.id, parseInt(move), secret);
    navigate('/games');
  };

  const handleAutoReveal = async () => {
    if (!game) return;
    
    setIsAutoRevealing(true);
    try {
      const success = await autoRevealMove(game.id);
      if (success) {
        navigate('/games');
      }
    } catch (error) {
      console.error('Auto reveal error:', error);
    } finally {
      setIsAutoRevealing(false);
    }
  };

  if (!game) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-300">Loading game details...</p>
      </div>
    );
  }

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
      case 0: return 'bg-green-500';
      case 1: return 'bg-blue-500';
      case 2: return 'bg-gray-500';
      case 3: return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatAddress = (address: string) => {
    if (!address || address === '0x0000000000000000000000000000000000000000') return 'N/A';
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const canReveal = game.status === 3 && game.creator === account;
  const canClaim = game.status === 3 && game.opponent === account && Date.now() / 1000 > game.revealDeadline;
  const canCancel = game.status === 0 && game.creator === account && game.opponent === '0x0000000000000000000000000000000000000000';
  const hasSecret = hasStoredSecret(game.id);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/games')}
        className="flex items-center space-x-2 text-gray-300 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Games</span>
      </button>

      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Game #{game.id}</h1>
            <p className="text-gray-300">Detailed game information and actions</p>
            {hasSecret && canReveal && (
              <div className="flex items-center space-x-2 mt-2 text-green-400 text-sm">
                <Save className="w-4 h-4" />
                <span>Auto-reveal data available</span>
              </div>
            )}
          </div>
          <span className={`px-4 py-2 ${getStatusColor(game.status)} text-white rounded-xl font-medium`}>
            {getStatusText(game.status)}
          </span>
        </div>

        {/* Game Info Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Basic Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Game Information</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                  <span className="text-gray-300">Creator</span>
                  <span className="text-white font-medium">
                    {game.creator === account ? 'You' : formatAddress(game.creator)}
                  </span>
                </div>
                
                {game.opponent !== '0x0000000000000000000000000000000000000000' && (
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                    <span className="text-gray-300">Opponent</span>
                    <span className="text-white font-medium">
                      {game.opponent === account ? 'You' : formatAddress(game.opponent)}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                  <span className="text-gray-300">Bet Amount</span>
                  <span className="text-white font-medium">
                    {web3?.utils.fromWei(game.betAmount, 'ether')} CORE
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                  <span className="text-gray-300">Created</span>
                  <span className="text-white font-medium text-sm">
                    {formatDate(game.createdAt)}
                  </span>
                </div>
                
                {game.status === 3 && (
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                    <span className="text-gray-300">Reveal Deadline</span>
                    <span className="text-white font-medium text-sm">
                      {formatDate(game.revealDeadline)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Moves */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Game Moves</h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Creator's Move</span>
                    {game.creator === account && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                        Your Move
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {game.status === 1 ? getMoveText(game.creatorMove) : 'Hidden'}
                  </div>
                </div>
                
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Opponent's Move</span>
                    {game.opponent === account && (
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                        Your Move
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {game.opponent !== '0x0000000000000000000000000000000000000000'
                      ? getMoveText(game.opponentMove)
                      : 'Waiting for opponent...'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Winner */}
        {game.winner !== '0x0000000000000000000000000000000000000000' && (
          <div className="mb-8 p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl">
            <div className="flex items-center justify-center space-x-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <div className="text-center">
                <p className="text-yellow-400 font-medium">Game Winner</p>
                <p className="text-2xl font-bold text-white">
                  {game.winner === account ? 'You Won!' : `${formatAddress(game.winner)} Won!`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {(canReveal || canClaim || canCancel) && (
          <div className="border-t border-slate-700/50 pt-8">
            {canReveal && (
              <div>
                <h3 className="text-xl font-bold text-white mb-6">Reveal Your Move</h3>
                
                {hasSecret && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Save className="w-6 h-6 text-green-400" />
                        <div>
                          <p className="text-green-400 font-medium">Auto-Reveal Available</p>
                          <p className="text-green-300 text-sm">Your move and secret are saved locally</p>
                        </div>
                      </div>
                      <button
                        onClick={handleAutoReveal}
                        disabled={isAutoRevealing}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-medium transition-all disabled:cursor-not-allowed"
                      >
                        {isAutoRevealing ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            <span>Auto-Revealing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Zap className="w-4 h-4" />
                            <span>Auto-Reveal</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleRevealMove} className="space-y-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Selecciona tu Elemento Original
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: '1', emoji: '🔥', name: 'Fuego' },
                        { value: '2', emoji: '💧', name: 'Agua' },
                        { value: '3', emoji: '🌿', name: 'Plantas' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setMove(option.value)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            move === option.value
                              ? 'border-blue-500 bg-blue-500/20 text-white'
                              : 'border-slate-600 bg-slate-700/50 text-gray-300 hover:border-slate-500'
                          }`}
                        >
                          <div className="text-3xl mb-2">{option.emoji}</div>
                          <div className="font-medium">{option.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Enter Your Secret Phrase
                    </label>
                    <input
                      type="text"
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter the secret phrase you used..."
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!move || !secret}
                    className="w-full px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-medium transition-all disabled:cursor-not-allowed"
                  >
                    Reveal Move Manually
                  </button>
                </form>
              </div>
            )}

            {canClaim && (
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-4">Creator Failed to Reveal</h3>
                <p className="text-gray-300 mb-6">
                  The creator didn't reveal their move in time. You can claim victory!
                </p>
                <button
                  onClick={() => claimTimeout(game.id)}
                  className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl font-medium transition-all hover:scale-105"
                >
                  <Trophy className="w-5 h-5 inline mr-2" />
                  Claim Victory
                </button>
              </div>
            )}

            {canCancel && (
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-4">Cancel Game</h3>
                <p className="text-gray-300 mb-6">
                  No one has joined your game yet. You can cancel it to get your bet back.
                </p>
                <button
                  onClick={() => cancelGame(game.id)}
                  className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium transition-all"
                >
                  <AlertCircle className="w-5 h-5 inline mr-2" />
                  Cancel Game
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetail;