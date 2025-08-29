import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useGame } from '../contexts/GameContext';
import { Gamepad2, Shield, Zap, ArrowRight, Hash, Save } from 'lucide-react';

const CreateGame = () => {
  const { account, isConnected } = useWeb3();
  const { createGame, generateMoveHash } = useGame();
  const navigate = useNavigate();
  
  const [betAmount, setBetAmount] = useState('');
  const [move, setMove] = useState('');
  const [secret, setSecret] = useState('');
  const [referrer, setReferrer] = useState('');
  const [moveHash, setMoveHash] = useState('');
  const [isHashGenerated, setIsHashGenerated] = useState(false);
  const [step, setStep] = useState(1);

  const generateRandomSecret = () => {
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    const randomSecret = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    setSecret(randomSecret);
  };

  const handleGenerateHash = () => {
    if (!move || !secret) return;
    
    const hash = generateMoveHash(parseInt(move), secret);
    setMoveHash(hash);
    setIsHashGenerated(true);
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isHashGenerated || !betAmount) return;
    
    try {
      // Pass the move and secret to createGame so it can save them with the correct game ID
      await createGame(moveHash, betAmount, referrer || undefined, parseInt(move), secret);
      
      // Reset form and navigate
      resetForm();
      navigate('/games');
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const resetForm = () => {
    setBetAmount('');
    setMove('');
    setSecret('');
    setReferrer('');
    setMoveHash('');
    setIsHashGenerated(false);
    setStep(1);
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6 max-w-md mx-auto">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-gray-300 text-sm">Please connect your wallet to create a game.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto px-2">
      <div className="text-center mb-2">
        <h1 className="text-base sm:text-lg font-bold text-white mb-1">Create New Game</h1>
        <p className="text-gray-300 text-xs">Set up your challenge</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-1">
        <div className="flex items-center space-x-1">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-400'
          }`}>
            1
          </div>
          <ArrowRight className="w-2 h-2 text-gray-400" />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-400'
          }`}>
            2
          </div>
          <ArrowRight className="w-2 h-2 text-gray-400" />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-400'
          }`}>
            3
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-md p-2">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Bet Amount */}
          {step === 1 && (
            <div className="text-center">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-md flex items-center justify-center mx-auto mb-1">
                <Gamepad2 className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-sm font-bold text-white mb-1">Set Your Bet</h2>
              <p className="text-gray-300 text-xs mb-1">Choose CORE amount</p>
              
              <div className="mb-1">
                <label className="block text-gray-300 text-xs font-medium mb-1">
                  Elige tu Elemento:
                </label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-sm px-2 py-1 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xs font-bold"
                  min="0.001"
                  step="0.001"
                  placeholder="0.00"
                  required
                />
                <p className="text-gray-400 text-xxs mt-0.5">Min: 0.001 BNB</p>
              </div>
              
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!betAmount || parseFloat(betAmount) < 0.001}
                className="w-full px-2 py-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-sm font-medium transition-all disabled:cursor-not-allowed text-xs"
              >
                Next: Choose Move
              </button>
            </div>
          )}

          {/* Step 2: Move and Secret */}
          {step === 2 && (
            <div className="text-center">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-md flex items-center justify-center mx-auto mb-1">
                <Shield className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-sm font-bold text-white mb-1">Make Your Move</h2>
              <p className="text-gray-300 text-xs mb-1">Choose move & secret</p>
              
              <div className="space-y-1">
                <div>
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    Your Move
                  </label>
                  <div className="grid grid-cols-3 gap-0.5">
                    {[
                      { value: '1', emoji: '🔥', name: 'Fuego' },
                      { value: '2', emoji: '💧', name: 'Agua' },
                      { value: '3', emoji: '🌿', name: 'Plantas' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setMove(option.value)}
                        className={`p-1 rounded-sm border transition-all ${
                          move === option.value
                            ? 'border-blue-500 bg-blue-500/20 text-white'
                            : 'border-slate-600 bg-slate-700/50 text-gray-300 hover:border-slate-500'
                        }`}
                      >
                        <div className="text-sm mb-0.5">{option.emoji}</div>
                        <div className="font-medium text-xxs">{option.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    Secret Phrase
                  </label>
                  <div className="flex space-x-0.5">
                    <input
                      type="text"
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-sm px-1 py-0.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                      placeholder="Enter secret phrase..."
                      required
                    />
                    <button
                      type="button"
                      onClick={generateRandomSecret}
                      className="px-1 py-0.5 bg-purple-600 hover:bg-purple-700 text-white rounded-sm font-medium transition-all flex items-center space-x-0.5 text-xs"
                      title="Generate Random Secret"
                    >
                      <Zap className="w-2 h-2" />
                      <span>Auto</span>
                    </button>
                  </div>
                  <div className="mt-0.5 p-0.5 bg-green-500/10 border border-green-500/30 rounded-sm">
                    <div className="flex items-center space-x-0.5 text-green-400 text-xxs">
                      <Save className="w-2 h-2" />
                      <span>Auto-saved for reveal</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    Referrer (Optional)
                  </label>
                  <input
                    type="text"
                    value={referrer}
                    onChange={(e) => setReferrer(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-sm px-1 py-0.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                    placeholder="0x..."
                  />
                  <p className="text-gray-400 text-xxs mt-0.5">
                    Earns BNB commission
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-1 mt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-white rounded-sm font-medium transition-all text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleGenerateHash}
                  disabled={!move || !secret}
                  className="flex-1 px-2 py-0.5 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-sm font-medium transition-all disabled:cursor-not-allowed text-xs"
                >
                  Generate
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm and Create */}
          {step === 3 && isHashGenerated && (
            <div className="text-center">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-md flex items-center justify-center mx-auto mb-1">
                <Hash className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-sm font-bold text-white mb-1">Confirm Creation</h2>
              <p className="text-gray-300 text-xs mb-1">Review & create</p>
              
              <div className="bg-slate-700/50 rounded-sm p-1 mb-1 text-left">
                <h3 className="text-xs font-bold text-white mb-1">Summary</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Bet:</span>
                    <span className="text-white font-medium text-xs">{betAmount} CORE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Move:</span>
                    <span className="text-white font-medium text-xs">
                      {move === '1' ? '🔥 Fuego' : move === '2' ? '💧 Agua' : '🌿 Plantas'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Secret:</span>
                    <span className="text-white font-medium text-xs">{'*'.repeat(Math.min(secret.length, 10))}</span>
                  </div>
                  {referrer && (
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs">Referrer:</span>
                      <span className="text-white font-medium text-xxs">
                        {referrer.substring(0, 6)}...{referrer.substring(referrer.length - 4)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-1 p-0.5 bg-slate-800/50 rounded-sm">
                  <p className="text-gray-400 text-xxs mb-0.5">Hash:</p>
                  <p className="text-white text-xxs font-mono break-all">{moveHash}</p>
                </div>
              </div>
              
              <div className="bg-green-500/20 border border-green-500/50 rounded-sm p-1 mb-1">
                <div className="flex items-center space-x-0.5 text-green-400 text-xxs">
                  <Save className="w-2 h-2" />
                  <div className="text-left">
                    <p className="font-medium">Auto-Reveal Ready</p>
                    <p className="text-green-300">Move & secret saved locally</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-white rounded-sm font-medium transition-all text-xs"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="flex-1 px-2 py-0.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-sm font-medium transition-all hover:scale-105 text-xs"
                >
                  Create Game
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateGame;