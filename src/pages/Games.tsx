import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useGame } from '../contexts/GameContext';
import { Clock, User, Coins, Trophy, Plus, Filter, Search, TrendingUp, Target, Zap, Star, Crown, Flame, Shield, RefreshCw, SortAsc, SortDesc, Grid, List, AlertCircle } from 'lucide-react';
import GameCard from '../components/GameCard';

const Games = () => {
  const { account, isConnected, web3 } = useWeb3();
  const { games, loading, error, fetchGames } = useGame();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 8;

  useEffect(() => {
    fetchGames();
  }, []);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchGames();
      }, 300000); // 5 minutes = 300,000 milliseconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchGames]);

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return 'Open';
      case 1: return 'Completed';
      case 2: return 'Expired';
      case 3: return 'Reveal Phase';
      default: return 'Unknown';
    }
  };

  const getBetTier = (betAmount: string) => {
    const amount = parseFloat(web3?.utils.fromWei(betAmount, 'ether') || '0');
    if (amount >= 10) return 'high';
    if (amount >= 1) return 'medium';
    return 'low';
  };

  const filteredAndSortedGames = games
    .filter(game => {
     // Hide specific games
     if (game.id === 21 || game.id === 22) return false;
     
      // Filter by status
      if (filter === 'open') return game.status === 0;
      if (filter === 'my-games') return game.creator === account || game.opponent === account;
      if (filter === 'completed') return game.status === 1;
      if (filter === 'reveal') return game.status === 3;
      if (filter === 'high-stakes') return parseFloat(web3?.utils.fromWei(game.betAmount, 'ether') || '0') >= 10;
      if (filter === 'medium-stakes') return parseFloat(web3?.utils.fromWei(game.betAmount, 'ether') || '0') >= 1 && parseFloat(web3?.utils.fromWei(game.betAmount, 'ether') || '0') < 10;
      if (filter === 'low-stakes') return parseFloat(web3?.utils.fromWei(game.betAmount, 'ether') || '0') < 1;
      return true;
    })
    .filter(game => {
      // Search filter
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        game.id.toString().includes(searchLower) ||
        game.creator.toLowerCase().includes(searchLower) ||
        game.opponent.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          // First prioritize active games (status 0 and 3), then by creation time
          const aIsActive = a.status === 0 || a.status === 3;
          const bIsActive = b.status === 0 || b.status === 3;
          if (aIsActive && !bIsActive) return -1;
          if (!aIsActive && bIsActive) return 1;
          return b.createdAt - a.createdAt;
        case 'oldest':
          // First prioritize active games, then by creation time (oldest first)
          const aIsActiveOld = a.status === 0 || a.status === 3;
          const bIsActiveOld = b.status === 0 || b.status === 3;
          if (aIsActiveOld && !bIsActiveOld) return -1;
          if (!aIsActiveOld && bIsActiveOld) return 1;
          return a.createdAt - b.createdAt;
        case 'highest-bet':
          // First prioritize active games, then by bet amount
          const aIsActiveBet = a.status === 0 || a.status === 3;
          const bIsActiveBet = b.status === 0 || b.status === 3;
          if (aIsActiveBet && !bIsActiveBet) return -1;
          if (!aIsActiveBet && bIsActiveBet) return 1;
          return parseFloat(web3?.utils.fromWei(b.betAmount, 'ether') || '0') - parseFloat(web3?.utils.fromWei(a.betAmount, 'ether') || '0');
        case 'lowest-bet':
          // First prioritize active games, then by bet amount (lowest first)
          const aIsActiveLow = a.status === 0 || a.status === 3;
          const bIsActiveLow = b.status === 0 || b.status === 3;
          if (aIsActiveLow && !bIsActiveLow) return -1;
          if (!aIsActiveLow && bIsActiveLow) return 1;
          return parseFloat(web3?.utils.fromWei(a.betAmount, 'ether') || '0') - parseFloat(web3?.utils.fromWei(b.betAmount, 'ether') || '0');
        default:
          // Default: prioritize active games, then by ID
          const aIsActiveDefault = a.status === 0 || a.status === 3;
          const bIsActiveDefault = b.status === 0 || b.status === 3;
          if (aIsActiveDefault && !bIsActiveDefault) return -1;
          if (!aIsActiveDefault && bIsActiveDefault) return 1;
          return b.id - a.id;
      }
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedGames.length / gamesPerPage);
  const startIndex = (currentPage - 1) * gamesPerPage;
  const endIndex = startIndex + gamesPerPage;
  const currentGames = filteredAndSortedGames.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, sortBy, searchTerm]);

  const gameStats = {
    total: games.length,
    open: games.filter(g => g.status === 0).length,
    completed: games.filter(g => g.status === 1).length,
    myGames: games.filter(g => g.creator === account || g.opponent === account).length,
    totalVolume: games.reduce((sum, game) => sum + parseFloat(web3?.utils.fromWei(game.betAmount, 'ether') || '0'), 0),
    highStakes: games.filter(g => parseFloat(web3?.utils.fromWei(g.betAmount, 'ether') || '0') >= 10).length,
    averageBet: games.length > 0 ? games.reduce((sum, game) => sum + parseFloat(web3?.utils.fromWei(game.betAmount, 'ether') || '0'), 0) / games.length : 0
  };

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-12 max-w-md mx-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer"></div>
          <div className="relative">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-300">Please connect your wallet to view and join games.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-1 sm:px-2 lg:px-4">
      {/* Animated Header */}
      <div className="text-center mb-8 relative hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-orange-600/20 rounded-3xl blur-3xl"></div>
        <div className="relative">
          <div className="flex justify-center items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              {[...Array(3)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
              ))}
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Battle Arena
          </h1>
          <p className="text-xl text-gray-300 mb-2">Find and join exciting Guerra de Elementos matches</p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
            <div className={`flex items-center space-x-1 ${autoRefresh ? 'text-green-400' : ''}`}>
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <span>Live Updates</span>
            </div>
            <span>•</span>
            <span>{gameStats.total} Total Games</span>
            <span>•</span>
            <span>{gameStats.totalVolume.toFixed(2)} CORE Volume</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <Link
            to="/create"
            className="group relative overflow-hidden flex items-center space-x-1 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all hover:scale-105 shadow-lg hover:shadow-blue-500/25 text-xs sm:text-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
            <div className="relative flex items-center space-x-1">
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Create Game</span>
              <Zap className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
              showFilters ? 'bg-purple-600 text-white' : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50'
            }`}
          >
            <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Filters</span>
          </button>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
              autoRefresh 
                ? 'bg-green-600/20 text-green-400 border border-green-500/50' 
                : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50'
            }`}
          >
            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Live</span>
          </button>

          <button
            onClick={fetchGames}
            disabled={loading}
            className="flex items-center space-x-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 hover:text-white rounded-lg font-medium transition-all text-xs sm:text-sm"
          >
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-6 pr-2 py-1 bg-slate-800/50 border border-slate-600/50 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs w-24 sm:w-32 lg:w-40"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-800/50 rounded-md p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-sm transition-all ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="w-3 h-3" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded-sm transition-all ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mb-4 p-3 sm:p-4 bg-slate-800/30 backdrop-blur-lg border border-slate-700/50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Status Filters */}
            <div>
              <h3 className="text-white font-bold mb-2 flex items-center space-x-1 text-sm">
                <Target className="w-3 h-3" />
                <span>Game Status</span>
              </h3>
              <div className="space-y-1">
                {[
                  { key: 'all', label: 'All Games', icon: Filter, count: gameStats.total },
                  { key: 'open', label: 'Open', icon: Clock, count: gameStats.open },
                  { key: 'reveal', label: 'Reveal Phase', icon: User, count: games.filter(g => g.status === 3).length },
                  { key: 'completed', label: 'Completed', icon: Trophy, count: gameStats.completed },
                  { key: 'my-games', label: 'My Games', icon: User, count: gameStats.myGames }
                ].map(({ key, label, icon: Icon, count }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded-md font-medium transition-all text-xs ${
                      filter === key 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <Icon className="w-3 h-3" />
                      <span>{label}</span>
                    </div>
                    <span className="text-xs opacity-75">{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bet Size Filters */}
            <div>
              <h3 className="text-white font-bold mb-2 flex items-center space-x-1 text-sm">
                <Coins className="w-3 h-3" />
                <span>Bet Tiers</span>
              </h3>
              <div className="space-y-1">
                {[
                  { key: 'high-stakes', label: 'High Stakes (10+ CORE)', icon: Crown, color: 'text-red-400', count: gameStats.highStakes },
                  { key: 'medium-stakes', label: 'Medium (1-10 CORE)', icon: Star, color: 'text-yellow-400', count: games.filter(g => getBetTier(g.betAmount) === 'medium').length },
                  { key: 'low-stakes', label: 'Low Stakes (<1 CORE)', icon: Shield, color: 'text-green-400', count: games.filter(g => getBetTier(g.betAmount) === 'low').length }
                ].map(({ key, label, icon: Icon, color, count }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded-md font-medium transition-all text-xs ${
                      filter === key 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <Icon className={`w-3 h-3 ${color}`} />
                      <span>{label}</span>
                    </div>
                    <span className="text-xs opacity-75">{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <h3 className="text-white font-bold mb-2 flex items-center space-x-1 text-sm">
                <TrendingUp className="w-3 h-3" />
                <span>Sort By</span>
              </h3>
              <div className="space-y-1">
                {[
                  { key: 'newest', label: 'Newest First', icon: SortDesc },
                  { key: 'oldest', label: 'Oldest First', icon: SortAsc },
                  { key: 'highest-bet', label: 'Highest Bet', icon: TrendingUp },
                  { key: 'lowest-bet', label: 'Lowest Bet', icon: Coins }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key)}
                    className={`w-full flex items-center space-x-1 px-2 py-1 rounded-md font-medium transition-all text-xs ${
                      sortBy === key 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-0.5 mb-1">
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg border border-green-500/30 rounded-lg p-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
          <div className="relative">
            <div className="flex items-center space-x-0.5 mb-0">
              <Clock className="w-2 h-2 text-green-400" />
              <span className="text-green-400 text-xxs font-medium">Open</span>
            </div>
            <p className="text-sm font-bold text-white">{gameStats.open}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg border border-blue-500/30 rounded-lg p-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
          <div className="relative">
            <div className="flex items-center space-x-0.5 mb-0">
              <Trophy className="w-2 h-2 text-blue-400" />
              <span className="text-blue-400 text-xxs font-medium">Completed</span>
            </div>
            <p className="text-sm font-bold text-white">{gameStats.completed}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-lg border border-orange-500/30 rounded-lg p-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
          <div className="relative">
            <div className="flex items-center space-x-0.5 mb-0">
              <User className="w-2 h-2 text-orange-400" />
              <span className="text-orange-400 text-xxs font-medium">My Games</span>
            </div>
            <p className="text-sm font-bold text-white">{gameStats.myGames}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg border border-purple-500/30 rounded-lg p-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
          <div className="relative">
            <div className="flex items-center space-x-0.5 mb-0">
              <Coins className="w-2 h-2 text-purple-400" />
              <span className="text-purple-400 text-xxs font-medium">Volume</span>
            </div>
            <p className="text-sm font-bold text-white">{gameStats.totalVolume.toFixed(1)}</p>
            <p className="text-purple-300" style={{fontSize: '0.5rem'}}>CORE</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-lg border border-red-500/30 rounded-lg p-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
          <div className="relative">
            <div className="flex items-center space-x-0.5 mb-0">
              <Crown className="w-2 h-2 text-red-400" />
              <span className="text-red-400 text-xxs font-medium">High Stakes</span>
            </div>
            <p className="text-sm font-bold text-white">{gameStats.highStakes}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-lg border border-yellow-500/30 rounded-lg p-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
          <div className="relative">
            <div className="flex items-center space-x-0.5 mb-0">
              <TrendingUp className="w-2 h-2 text-yellow-400" />
              <span className="text-yellow-400 text-xxs font-medium">Avg Bet</span>
            </div>
            <p className="text-sm font-bold text-white">{gameStats.averageBet.toFixed(2)}</p>
            <p className="text-yellow-300" style={{fontSize: '0.5rem'}}>CORE</p>
          </div>
        </div>
      </div>

      {/* Games Display */}
      {loading ? (
        <div className="text-center py-12">
          <div className="relative">
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/30 rounded-full mx-auto animate-ping"></div>
          </div>
          <p className="text-gray-300 text-lg">Loading epic battles...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 max-w-md mx-auto">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Error Loading Games</h3>
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchGames}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : filteredAndSortedGames.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-12 max-w-md mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer"></div>
            <div className="relative">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">No Games Found</h3>
              <p className="text-gray-300 mb-6">
                {filter === 'open' ? 'No open games available. Be the first to create one!' : 
                 filter === 'my-games' ? "You haven't played any games yet. Start your journey!" :
                 searchTerm ? 'No games match your search criteria.' :
                 'No games match your current filter.'}
              </p>
              <Link
                to="/create"
                className="group relative overflow-hidden inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all hover:scale-105 shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                <div className="relative flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create First Game</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1' : 'space-y-1'}>
            {currentGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-1 flex flex-col sm:flex-row items-center justify-between gap-1">
              <div className="text-gray-400 text-sm">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedGames.length)} of {filteredAndSortedGames.length} games
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white rounded font-medium transition-all disabled:cursor-not-allowed text-xs"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-6 h-6 rounded font-medium transition-all text-xs ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white rounded font-medium transition-all disabled:cursor-not-allowed text-xs"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Games;