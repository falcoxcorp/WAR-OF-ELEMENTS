import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useGame } from '../contexts/GameContext';
import { Clock, User, Coins, Trophy, Plus, Filter, Search, TrendingUp, Target, Zap, Star, Crown, RefreshCw, SortAsc, SortDesc, Grid, List, AlertCircle, Activity, BarChart3 } from 'lucide-react';
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
  const gamesPerPage = 12;

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchGames();
      }, 300000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchGames]);

  const getBetTier = (betAmount: string) => {
    const amount = parseFloat(web3?.utils.fromWei(betAmount, 'ether') || '0');
    if (amount >= 10) return 'high';
    if (amount >= 1) return 'medium';
    return 'low';
  };

  const filteredAndSortedGames = games
    .filter(game => {
      if (game.id === 21 || game.id === 22) return false;
      
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
          const aIsActive = a.status === 0 || a.status === 3;
          const bIsActive = b.status === 0 || b.status === 3;
          if (aIsActive && !bIsActive) return -1;
          if (!aIsActive && bIsActive) return 1;
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'highest-bet':
          return parseFloat(web3?.utils.fromWei(b.betAmount, 'ether') || '0') - parseFloat(web3?.utils.fromWei(a.betAmount, 'ether') || '0');
        case 'lowest-bet':
          return parseFloat(web3?.utils.fromWei(a.betAmount, 'ether') || '0') - parseFloat(web3?.utils.fromWei(b.betAmount, 'ether') || '0');
        default:
          return b.id - a.id;
      }
    });

  const totalPages = Math.ceil(filteredAndSortedGames.length / gamesPerPage);
  const startIndex = (currentPage - 1) * gamesPerPage;
  const endIndex = startIndex + gamesPerPage;
  const currentGames = filteredAndSortedGames.slice(startIndex, endIndex);

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
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-16 max-w-lg mx-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer"></div>
          <div className="relative">
            <User className="w-20 h-20 text-slate-500 mx-auto mb-8" />
            <h2 className="text-3xl font-bold text-white mb-6">Connect Your Wallet</h2>
            <p className="text-slate-400 text-lg">Access the gaming platform with your Web3 wallet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Game
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Arena</span>
        </h1>
        <p className="text-xl text-slate-400 mb-6">Discover and join competitive matches</p>
        
        {/* Live Stats Bar */}
        <div className="flex items-center justify-center space-x-6 text-sm text-slate-400">
          <div className={`flex items-center space-x-2 ${autoRefresh ? 'text-emerald-400' : ''}`}>
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></div>
            <span>Live Updates</span>
          </div>
          <span>•</span>
          <span>{gameStats.total} Total Games</span>
          <span>•</span>
          <span>{gameStats.totalVolume.toFixed(2)} CORE Volume</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/create"
            className="group relative overflow-hidden flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
            <div className="relative flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Game</span>
            </div>
          </Link>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold transition-all ${
              showFilters ? 'bg-purple-600 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold transition-all ${
              autoRefresh 
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/50' 
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Live</span>
          </button>

          <button
            onClick={fetchGames}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl font-semibold transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-48"
            />
          </div>

          {/* View Mode */}
          <div className="flex items-center bg-slate-900/50 rounded-xl p-1 border border-slate-700/50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-8">
        {[
          { label: "Open", value: gameStats.open, icon: Clock, color: "from-emerald-500 to-teal-500" },
          { label: "Completed", value: gameStats.completed, icon: Trophy, color: "from-blue-500 to-indigo-500" },
          { label: "My Games", value: gameStats.myGames, icon: User, color: "from-purple-500 to-pink-500" },
          { label: "Volume", value: `${gameStats.totalVolume.toFixed(1)}`, icon: Coins, color: "from-yellow-500 to-orange-500", suffix: "CORE" },
          { label: "High Stakes", value: gameStats.highStakes, icon: Crown, color: "from-red-500 to-pink-500" },
          { label: "Avg Bet", value: `${gameStats.averageBet.toFixed(2)}`, icon: TrendingUp, color: "from-cyan-500 to-blue-500", suffix: "CORE" }
        ].map((stat, index) => (
          <div key={index} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-4 hover:border-slate-700/50 transition-all duration-300 group">
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-white">{stat.value}</p>
            <p className="text-slate-400 text-xs font-medium">{stat.label}</p>
            {stat.suffix && (
              <p className="text-slate-500 text-xs">{stat.suffix}</p>
            )}
          </div>
        ))}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mb-8 p-6 bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status Filters */}
            <div>
              <h3 className="text-white font-bold mb-3 flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Game Status</span>
              </h3>
              <div className="space-y-2">
                {[
                  { key: 'all', label: 'All Games', icon: Filter, count: gameStats.total },
                  { key: 'open', label: 'Open', icon: Clock, count: gameStats.open },
                  { key: 'reveal', label: 'Reveal Phase', icon: Eye, count: games.filter(g => g.status === 3).length },
                  { key: 'completed', label: 'Completed', icon: Trophy, count: gameStats.completed },
                  { key: 'my-games', label: 'My Games', icon: User, count: gameStats.myGames }
                ].map(({ key, label, icon: Icon, count }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`w-full flex items-center justify-between px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === key 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </div>
                    <span className="text-sm opacity-75">{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bet Tiers */}
            <div>
              <h3 className="text-white font-bold mb-3 flex items-center space-x-2">
                <Coins className="w-4 h-4" />
                <span>Bet Tiers</span>
              </h3>
              <div className="space-y-2">
                {[
                  { key: 'high-stakes', label: 'High Stakes (10+ CORE)', icon: Crown, color: 'text-red-400', count: gameStats.highStakes },
                  { key: 'medium-stakes', label: 'Medium (1-10 CORE)', icon: Star, color: 'text-yellow-400', count: games.filter(g => getBetTier(g.betAmount) === 'medium').length },
                  { key: 'low-stakes', label: 'Low Stakes (<1 CORE)', icon: Shield, color: 'text-emerald-400', count: games.filter(g => getBetTier(g.betAmount) === 'low').length }
                ].map(({ key, label, icon: Icon, color, count }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`w-full flex items-center justify-between px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === key 
                        ? 'bg-purple-600 text-white shadow-lg' 
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span>{label}</span>
                    </div>
                    <span className="text-sm opacity-75">{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <h3 className="text-white font-bold mb-3 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Sort By</span>
              </h3>
              <div className="space-y-2">
                {[
                  { key: 'newest', label: 'Newest First', icon: SortDesc },
                  { key: 'oldest', label: 'Oldest First', icon: SortAsc },
                  { key: 'highest-bet', label: 'Highest Bet', icon: TrendingUp },
                  { key: 'lowest-bet', label: 'Lowest Bet', icon: Coins }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key)}
                    className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      sortBy === key 
                        ? 'bg-orange-600 text-white shadow-lg' 
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Games Display */}
      {loading ? (
        <div className="text-center py-20">
          <div className="relative">
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/30 rounded-full mx-auto animate-ping"></div>
          </div>
          <p className="text-slate-400 text-xl">Loading games...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-12 max-w-lg mx-auto">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">Error Loading Games</h3>
            <p className="text-red-400 mb-6">{error}</p>
            <button
              onClick={fetchGames}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : filteredAndSortedGames.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-16 max-w-lg mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer"></div>
            <div className="relative">
              <Clock className="w-20 h-20 text-slate-500 mx-auto mb-8" />
              <h3 className="text-3xl font-bold text-white mb-6">No Games Found</h3>
              <p className="text-slate-400 text-lg mb-8">
                {filter === 'open' ? 'No open games available. Be the first to create one!' : 
                 filter === 'my-games' ? "You haven't played any games yet. Start your journey!" :
                 searchTerm ? 'No games match your search criteria.' :
                 'No games match your current filter.'}
              </p>
              <Link
                to="/create"
                className="group relative overflow-hidden inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                <div className="relative flex items-center space-x-3">
                  <Plus className="w-5 h-5" />
                  <span>Create First Game</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {currentGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-slate-400">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedGames.length)} of {filteredAndSortedGames.length} games
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:opacity-50 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                          currentPage === page
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:opacity-50 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
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