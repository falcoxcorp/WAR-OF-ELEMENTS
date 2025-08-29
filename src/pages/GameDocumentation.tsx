import React, { useState } from 'react';
import { Book, Shield, Zap, Trophy, Target, Users, Crown, Star, Coins, Clock, Eye, Play, ArrowRight, CheckCircle, AlertTriangle, Info, Code, Database, Globe, ExternalLink } from 'lucide-react';

const GameDocumentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Detectar si estamos en desarrollo o producción
  const isDevelopment = window.location.hostname === 'localhost';
  const apiBaseUrl = isDevelopment 
    ? 'http://localhost:3001/api' 
    : `${window.location.protocol}//${window.location.hostname}:3001/api`;

  const tabs = [
    { id: 'overview', label: 'Game Overview', icon: Book },
    { id: 'rules', label: 'How to Play', icon: Play },
    { id: 'blockchain', label: 'Blockchain Tech', icon: Shield },
    { id: 'rewards', label: 'Rewards & Levels', icon: Trophy },
    { id: 'api', label: 'Developer API', icon: Code }
  ];

  const gameRules = [
    { emoji: '🔥', rule: 'Fuego quema 🌿 Plantas', beats: 'Plantas', color: 'from-red-500 to-red-600' },
    { emoji: '💧', rule: 'Agua apaga 🔥 Fuego', beats: 'Fuego', color: 'from-blue-500 to-blue-600' },
    { emoji: '🌿', rule: 'Plantas absorbe 💧 Agua', beats: 'Agua', color: 'from-green-500 to-green-600' }
  ];

  const blockchainFeatures = [
    {
      icon: Shield,
      title: 'Commit-Reveal Scheme',
      description: 'Your move is cryptographically hidden until both players have committed, ensuring fair play.',
      technical: 'SHA3 (keccak256) hashing with salt'
    },
    {
      icon: Zap,
      title: 'Smart Contract Automation',
      description: 'Automatic winner determination and prize distribution without human intervention.',
      technical: 'Solidity 0.8+ with gas optimization'
    },
    {
      icon: Crown,
      title: 'Transparent Rewards',
      description: 'All transactions and rewards are publicly verifiable on Core Blockchain.',
      technical: 'Event-driven distribution logic'
    },
    {
      icon: Target,
      title: 'Decentralized Gaming',
      description: 'No central authority can manipulate game outcomes or withhold winnings.',
      technical: 'Immutable smart contract'
    }
  ];

  const levelSystem = [
    { level: 1, title: 'Rookie', minScore: 0, icon: '🥉', color: 'text-gray-400', perks: ['Basic gameplay access'] },
    { level: 2, title: 'Apprentice', minScore: 50, icon: '🌱', color: 'text-green-400', perks: ['5% bonus on wins', 'Tournament access'] },
    { level: 3, title: 'Warrior', minScore: 150, icon: '⚔️', color: 'text-blue-400', perks: ['10% bonus', 'Priority matching', 'Custom emotes'] },
    { level: 4, title: 'Champion', minScore: 300, icon: '🏆', color: 'text-purple-400', perks: ['15% bonus', 'VIP support', 'Exclusive tournaments'] },
    { level: 5, title: 'Master', minScore: 500, icon: '🔥', color: 'text-orange-400', perks: ['20% bonus', 'Beta access', 'Mentor program'] },
    { level: 6, title: 'Grandmaster', minScore: 800, icon: '💎', color: 'text-red-400', perks: ['25% bonus', 'Exclusive events', 'Hall of fame'] },
    { level: 7, title: 'Legend', minScore: 1200, icon: '👑', color: 'text-yellow-400', perks: ['30% bonus', 'Legendary rewards', 'Game influence'] },
    { level: 8, title: 'Mythic', minScore: 2000, icon: '🌟', color: 'text-pink-400', perks: ['50% bonus', 'Mythic rewards', 'Eternal glory'] }
  ];

  const apiEndpoints = [
    {
      method: 'GET',
      path: '/api/games',
      description: 'Get all games with optional filters',
      example: `${apiBaseUrl}/games?status=0&limit=10`
    },
    {
      method: 'GET',
      path: '/api/players/:address/stats',
      description: 'Get player statistics and performance data',
      example: `${apiBaseUrl}/players/0x1234.../stats`
    },
    {
      method: 'GET',
      path: '/api/players/leaderboard',
      description: 'Get top players ranking',
      example: `${apiBaseUrl}/players/leaderboard?limit=10`
    },
    {
      method: 'GET',
      path: '/api/contract/stats',
      description: 'Get contract statistics and metrics',
      example: `${apiBaseUrl}/contract/stats`
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 rounded-3xl blur-3xl"></div>
        <div className="relative">
          <div className="flex justify-center items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Book className="w-10 h-10 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            Complete Game Guide
          </h1>
          <p className="text-xl text-gray-300 mb-6">Everything you need to know about Guerra de Elementos Arena</p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Secure & Fair</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>Lightning Fast</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-purple-400" />
              <span>Real Rewards</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Game Overview */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-2">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <span>What is RPS Arena?</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  <strong className="text-white">Guerra de Elementos Arena</strong> is the world's first 
                  decentralized Guerra de Elementos gaming platform built on Core Blockchain. We combine 
                  the classic game everyone knows with cutting-edge blockchain technology to create a 
                  completely fair, transparent, and rewarding gaming experience.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-medium">Provably Fair</h4>
                      <p className="text-gray-400 text-sm">Advanced cryptography ensures no cheating is possible</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-medium">Real Rewards</h4>
                      <p className="text-gray-400 text-sm">Win CORE tokens and climb monthly leaderboards</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-medium">Community Driven</h4>
                      <p className="text-gray-400 text-sm">Join a growing community of competitive players</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl">
                  <h4 className="text-xl font-bold text-white mb-4">Key Features</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Secure commit-reveal gameplay</li>
                    <li>• Instant CORE token payouts</li>
                    <li>• Monthly reward pools</li>
                    <li>• Player level progression</li>
                    <li>• Referral earning system</li>
                    <li>• Professional security audit</li>
                  </ul>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl">
                  <h4 className="text-xl font-bold text-white mb-4">Network Info</h4>
                  <div className="space-y-2 text-gray-300">
                    <div className="flex justify-between">
                      <span>Blockchain:</span>
                      <span className="text-white">Core Mainnet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chain ID:</span>
                      <span className="text-white">1116</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Currency:</span>
                      <span className="text-white">CORE</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contract:</span>
                      <span className="text-white text-xs">Verified ✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-8">
          {/* Game Rules */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-2">
              <Play className="w-8 h-8 text-green-400" />
              <span>How to Play</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Classic Rules</h3>
                <div className="space-y-4">
                  {gameRules.map((rule, index) => (
                    <div key={index} className={`p-4 bg-gradient-to-r ${rule.color}/10 border border-${rule.color.split('-')[1]}-500/30 rounded-xl`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${rule.color} rounded-xl flex items-center justify-center text-2xl`}>
                          {rule.emoji}
                        </div>
                        <div>
                          <p className="text-white font-medium">{rule.rule}</p>
                          <p className="text-gray-400 text-sm">Beats: {rule.beats}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="p-4 bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                        🤝
                      </div>
                      <div>
                        <p className="text-white font-medium">Same moves = Tie (bet returned)</p>
                        <p className="text-gray-400 text-sm">Equal skill, equal outcome</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Game Process</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                    <div>
                      <h4 className="text-white font-medium">Create Game</h4>
                      <p className="text-gray-400 text-sm">Set your bet amount and secretly choose your move</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                    <div>
                      <h4 className="text-white font-medium">Wait for Opponent</h4>
                      <p className="text-gray-400 text-sm">Another player joins by matching your bet</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                    <div>
                      <h4 className="text-white font-medium">Reveal Move</h4>
                      <p className="text-gray-400 text-sm">Prove your original move to determine winner</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                    <div>
                      <h4 className="text-white font-medium">Get Rewards</h4>
                      <p className="text-gray-400 text-sm">Winner receives the pot automatically</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-xl">
                  <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="font-bold">Time Limits</span>
                  </div>
                  <p className="text-yellow-300 text-sm">
                    You have 24 hours to reveal your move after an opponent joins. 
                    If you don't reveal in time, your opponent can claim victory.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'blockchain' && (
        <div className="space-y-8">
          {/* Blockchain Technology */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-400" />
              <span>Blockchain Technology</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {blockchainFeatures.map((feature, index) => (
                <div key={index} className="p-6 bg-slate-700/30 rounded-xl hover:bg-slate-600/30 transition-all">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                  </div>
                  <p className="text-gray-300 mb-3">{feature.description}</p>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                    {feature.technical}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-4">Why Blockchain Gaming?</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h4 className="text-white font-medium">Trustless</h4>
                  <p className="text-gray-400 text-sm">No need to trust the platform</p>
                </div>
                <div className="text-center">
                  <Eye className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h4 className="text-white font-medium">Transparent</h4>
                  <p className="text-gray-400 text-sm">All transactions are public</p>
                </div>
                <div className="text-center">
                  <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <h4 className="text-white font-medium">Ownership</h4>
                  <p className="text-gray-400 text-sm">You control your assets</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="space-y-8">
          {/* Rewards and Levels */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-2">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <span>Rewards & Level System</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Monthly Rewards</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Crown className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-medium">1st Place</span>
                    </div>
                    <span className="text-yellow-400 font-bold">50% of pool</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-500/20 border border-gray-500/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-gray-300" />
                      <span className="text-white font-medium">2nd Place</span>
                    </div>
                    <span className="text-gray-300 font-bold">30% of pool</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-500/20 border border-orange-500/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-orange-400" />
                      <span className="text-white font-medium">3rd Place</span>
                    </div>
                    <span className="text-orange-400 font-bold">15% of pool</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-500/20 border border-purple-500/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-medium">4th-10th</span>
                    </div>
                    <span className="text-purple-400 font-bold">Share 5%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-4">How to Earn Points</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                    <Trophy className="w-5 h-5 text-green-400" />
                    <div>
                      <span className="text-white font-medium">Win a game: </span>
                      <span className="text-green-400">+10 points</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                    <Target className="w-5 h-5 text-blue-400" />
                    <div>
                      <span className="text-white font-medium">Play a game: </span>
                      <span className="text-blue-400">+2 points</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <div>
                      <span className="text-white font-medium">Win streak: </span>
                      <span className="text-yellow-400">Bonus multiplier</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                    <Users className="w-5 h-5 text-purple-400" />
                    <div>
                      <span className="text-white font-medium">Referrals: </span>
                      <span className="text-purple-400">+5 points each</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-6">Player Levels</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {levelSystem.map((level, index) => (
                <div key={index} className="p-4 bg-slate-700/30 rounded-xl text-center hover:bg-slate-600/30 transition-all">
                  <div className="text-3xl mb-2">{level.icon}</div>
                  <h4 className={`font-bold ${level.color} mb-1`}>{level.title}</h4>
                  <p className="text-gray-400 text-sm mb-3">{level.minScore}+ points</p>
                  <div className="space-y-1">
                    {level.perks.map((perk, i) => (
                      <p key={i} className="text-xs text-gray-400">• {perk}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'api' && (
        <div className="space-y-8">
          {/* Developer API */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-2">
              <Code className="w-8 h-8 text-blue-400" />
              <span>Developer API</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">API Overview</h3>
                <p className="text-gray-300 mb-6">
                  Our robust REST API allows developers to integrate with RPS Arena data. 
                  Build bots, analytics dashboards, mobile apps, and more!
                </p>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-xl">
                    <h4 className="text-blue-400 font-bold mb-2">Base URL</h4>
                    <code className="text-white bg-slate-900 px-3 py-1 rounded text-sm break-all">
                      {apiBaseUrl}
                    </code>
                  </div>
                  
                  <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl">
                    <h4 className="text-green-400 font-bold mb-2">Rate Limit</h4>
                    <p className="text-green-300 text-sm">100 requests per minute per IP</p>
                  </div>
                  
                  <div className="p-4 bg-purple-500/20 border border-purple-500/50 rounded-xl">
                    <h4 className="text-purple-400 font-bold mb-2">Response Format</h4>
                    <p className="text-purple-300 text-sm">JSON with success/error indicators</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Quick Start</h3>
                <div className="bg-slate-900 rounded-xl p-4 mb-4">
                  <pre className="text-green-400 text-sm overflow-x-auto">
{`// Get open games
const response = await fetch(
  '${apiBaseUrl}/games?status=0'
);
const data = await response.json();

if (data.success) {
  console.log('Open games:', data.data.games);
}`}
                  </pre>
                </div>
                
                <div className="space-y-2">
                  <a 
                    href={`${apiBaseUrl}/docs`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    <Database className="w-4 h-4" />
                    <span>Full API Documentation</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a 
                    href={`${apiBaseUrl}/health`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-green-400 hover:text-green-300 text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>API Health Check</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a 
                    href="/api-docs"
                    className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 text-sm"
                  >
                    <Code className="w-4 h-4" />
                    <span>Interactive API Explorer</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-6">Main Endpoints</h3>
            <div className="space-y-4">
              {apiEndpoints.map((endpoint, index) => (
                <div key={index} className="p-4 bg-slate-700/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 bg-green-600 text-white rounded text-sm font-bold">
                        {endpoint.method}
                      </span>
                      <code className="text-blue-400">{endpoint.path}</code>
                    </div>
                    <a 
                      href={endpoint.example}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white text-sm flex items-center space-x-1"
                    >
                      <span>Try it</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-gray-300 text-sm">{endpoint.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl">
              <h4 className="text-xl font-bold text-white mb-4">Use Cases</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-orange-400 font-medium mb-2">🤖 Trading Bots</h5>
                  <p className="text-gray-300 text-sm">Monitor high-stakes games and join automatically</p>
                </div>
                <div>
                  <h5 className="text-blue-400 font-medium mb-2">📱 Mobile Apps</h5>
                  <p className="text-gray-300 text-sm">Build native apps with real-time game data</p>
                </div>
                <div>
                  <h5 className="text-purple-400 font-medium mb-2">📊 Analytics</h5>
                  <p className="text-gray-300 text-sm">Create dashboards and performance tracking</p>
                </div>
                <div>
                  <h5 className="text-green-400 font-medium mb-2">🔗 Integrations</h5>
                  <p className="text-gray-300 text-sm">Connect with Discord, Telegram, and more</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg border border-blue-500/30 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Playing?</h2>
        <p className="text-gray-300 mb-6 text-lg">
          Join thousands of players in the ultimate blockchain Guerra de Elementos experience!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/create"
            className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
            <div className="relative flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Start Playing Now</span>
            </div>
          </a>
          <a
            href={`${apiBaseUrl}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 hover:text-white rounded-xl font-bold text-lg transition-all border border-slate-600/50 hover:border-slate-500/50 flex items-center space-x-2"
          >
            <Code className="w-5 h-5" />
            <span>Explore API</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default GameDocumentation;