import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AnimatedAppIcon from '../components/AnimatedAppIcon';
import { useWeb3 } from '../contexts/Web3Context';
import { useGame } from '../contexts/GameContext';
import { Shield, Zap, Users, Trophy, Target, Crown, Star, ChevronRight, Play, TrendingUp, Award, Globe, Lock, Eye, ArrowRight, Gamepad2, BarChart3, Swords, Gem, Hexagon, Wind, Mountain, Sun, Moon, Activity, Layers, Code, Database } from 'lucide-react';

const Home = () => {
  const { isConnected, account, web3, connectWallet, contract, isCorrectNetwork } = useWeb3();
  const { games, playerStats } = useGame();
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  
  // States for real contract data
  const [contractStats, setContractStats] = useState({
    totalGames: 0,
    totalPlayers: 0,
    totalVolume: '0',
    rewardPool: '0',
    contractBalance: '0'
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState<Date | null>(null);

  // Function to get real contract statistics
  const fetchContractStats = async () => {
    if (!contract || !isCorrectNetwork || !web3) {
      console.log('⚠️ Contract stats fetch skipped - missing dependencies');
      return;
    }
    
    try {
      setLoadingStats(true);
      console.log('🔍 Fetching contract stats...');
      
      // Enhanced RPC call with multiple fallbacks and retry logic
      const fetchWithRetry = async (operation: () => Promise<any>, name: string, maxRetries = 3) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            console.log(`📡 Attempting ${name} (${attempt}/${maxRetries})`);
            const result = await Promise.race([
              operation(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 10000)
              )
            ]);
            console.log(`✅ ${name} successful`);
            return result;
          } catch (error: any) {
            console.warn(`⚠️ ${name} attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) {
              throw error;
            }
            
            // Progressive delay with jitter
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000) + Math.random() * 1000;
            console.log(`⏳ Waiting ${Math.round(delay)}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      };

      // Fetch data with individual error handling
      const results = await Promise.allSettled([
        fetchWithRetry(() => contract.methods.totalGames().call(), 'totalGames'),
        fetchWithRetry(() => contract.methods.totalPlayers().call(), 'totalPlayers'),
        fetchWithRetry(() => contract.methods.getRewardPoolInfo().call(), 'rewardPool'),
        fetchWithRetry(() => web3.eth.getBalance(contract.options.address), 'contractBalance')
      ]);

      // Process results with fallbacks
      const [totalGamesResult, totalPlayersResult, rewardPoolResult, contractBalanceResult] = results;
      
      const totalGames = totalGamesResult.status === 'fulfilled' ? Number(totalGamesResult.value) : contractStats.totalGames;
      const totalPlayers = totalPlayersResult.status === 'fulfilled' ? Number(totalPlayersResult.value) : contractStats.totalPlayers;
      const rewardPool = rewardPoolResult.status === 'fulfilled' ? rewardPoolResult.value : contractStats.rewardPool;
      const contractBalance = contractBalanceResult.status === 'fulfilled' ? contractBalanceResult.value : contractStats.contractBalance;
      
      // Log any failed requests
      results.forEach((result, index) => {
        const names = ['totalGames', 'totalPlayers', 'rewardPool', 'contractBalance'];
        if (result.status === 'rejected') {
          console.error(`❌ Failed to fetch ${names[index]}:`, result.reason.message);
        }
      });

      const totalVolumeWei = BigInt(contractBalance) + BigInt(rewardPool);

      setContractStats({
        totalGames: Number(totalGames),
        totalPlayers: Number(totalPlayers),
        totalVolume: totalVolumeWei.toString(),
        rewardPool,
        contractBalance
      });
      
      setRetryCount(0); // Reset retry count on success
      setLastSuccessfulFetch(new Date());
      console.log('✅ Contract stats updated successfully');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error fetching contract stats:', errorMessage);
      
      setRetryCount(prev => prev + 1);
      
      // Enhanced error handling with user-friendly messages
      if (errorMessage.includes('Internal JSON-RPC error')) {
        console.log('🔄 BSC RPC overloaded, will retry automatically...');
        // Don't show error toast for RPC overload - it's temporary
      } else if (errorMessage.includes('timeout')) {
        console.log('⏰ Request timeout, will retry with longer timeout...');
      } else if (errorMessage.includes('rate limit')) {
        console.log('🚦 Rate limited, will retry after delay...');
      } else {
        console.error('🚨 Unexpected error:', errorMessage);
      }
      
      // Only show error to user if it's been failing for a while
      if (retryCount >= 3) {
        const toast = (await import('react-hot-toast')).default;
        toast.error('BSC network is experiencing high load. Stats will update automatically when available.', {
          duration: 5000,
          id: 'contract-stats-error' // Prevent duplicate toasts
        });
      }
    } finally {
      setLoadingStats(false);
    }
      console.log('🚀 Initial contract stats fetch...');
  };

  useEffect(() => {
    if (contract && isCorrectNetwork) {
      fetchContractStats();
    }
  }, [contract, isCorrectNetwork]);

  useEffect(() => {
    if (contract && isCorrectNetwork && web3) {
      console.log('⏰ Setting up auto-refresh interval (5 minutes)...');
      
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing contract stats...');
        fetchContractStats();
      }, 300000); // 5 minutes
      
      return () => clearInterval(interval);
    }
  }, [contract, isCorrectNetwork, web3]);

  const useAnimatedCounter = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, [end, duration]);
    
    return count;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const totalGames = useAnimatedCounter(contractStats.totalGames || 0);
  const totalPlayers = useAnimatedCounter(contractStats.totalPlayers || 0);
  const totalVolumeCore = parseFloat(web3?.utils.fromWei(contractStats.totalVolume, 'ether') || '0');
  const animatedVolume = useAnimatedCounter(Math.floor(totalVolumeCore * 100)) / 100;

  const coreFeatures = [
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
          <path d="M16 2L6 8V14C6 21 10.5 27.5 16 30C21.5 27.5 26 21 26 14V8L16 2Z" fill="currentColor" fillOpacity="0.9"/>
          <path d="M16 4L8 9V14C8 19.8 11.6 25.2 16 27.5C20.4 25.2 24 19.8 24 14V9L16 4Z" fill="currentColor" fillOpacity="0.6"/>
          <circle cx="16" cy="15" r="4" fill="currentColor" fillOpacity="0.8"/>
        </svg>
      ),
      title: t('features.enterpriseSecurity'),
      description: t('features.securityDesc'),
      color: "from-blue-500 to-cyan-500",
      delay: "0ms",
      accent: "🛡️"
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
          <path d="M18 2L8 16H14L12 30L22 16H16L18 2Z" fill="currentColor" fillOpacity="0.9"/>
          <path d="M16.5 4L9.5 15H13.5L12.5 26L20.5 15H16.5L16.5 4Z" fill="currentColor" fillOpacity="0.7"/>
          <circle cx="16" cy="8" r="2" fill="currentColor"/>
          <circle cx="16" cy="24" r="2" fill="currentColor"/>
        </svg>
      ),
      title: t('features.lightningPerformance'),
      description: t('features.performanceDesc'),
      color: "from-yellow-500 to-orange-500",
      delay: "200ms",
      accent: "⚡"
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
          <path d="M16 2L20 10H28L22 16L24 26H16L8 26L10 16L4 10H12L16 2Z" fill="currentColor" fillOpacity="0.9"/>
          <path d="M16 4L19 11H25L20.5 15.5L22 24H16L10 24L11.5 15.5L7 11H13L16 4Z" fill="currentColor" fillOpacity="0.7"/>
          <circle cx="16" cy="14" r="3" fill="currentColor"/>
          <rect x="14" y="20" width="4" height="6" fill="currentColor" fillOpacity="0.8"/>
        </svg>
      ),
      title: t('features.competitiveRewards'),
      description: t('features.rewardsDesc'),
      color: "from-purple-500 to-pink-500",
      delay: "400ms",
      accent: "🏆"
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.8"/>
          <path d="M2 16H30M16 2C20 6 22 11 22 16S20 26 16 30M16 2C12 6 10 11 10 16S12 26 16 30" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.9"/>
          <circle cx="8" cy="10" r="1.5" fill="currentColor" fillOpacity="0.7"/>
          <circle cx="24" cy="10" r="1.5" fill="currentColor" fillOpacity="0.7"/>
          <circle cx="8" cy="22" r="1.5" fill="currentColor" fillOpacity="0.7"/>
          <circle cx="24" cy="22" r="1.5" fill="currentColor" fillOpacity="0.7"/>
        </svg>
      ),
      title: t('features.globalNetwork'),
      description: t('features.networkDesc'),
      color: "from-green-500 to-emerald-500",
      delay: "600ms",
      accent: "🌐"
    }
  ];

  const gameElements = [
    {
      name: t('game.elements.fire').toUpperCase(),
      symbol: "🔥",
      description: t('game.elements.fireDesc'),
      strength: t('game.elements.fireStrength'),
      gradient: "from-red-600 via-orange-500 to-yellow-500",
      bgPattern: "from-red-900/20 via-orange-900/10 to-yellow-900/5"
    },
    {
      name: t('game.elements.water').toUpperCase(),
      symbol: "💧",
      description: t('game.elements.waterDesc'),
      strength: t('game.elements.waterStrength'),
      gradient: "from-blue-600 via-cyan-500 to-teal-500",
      bgPattern: "from-blue-900/20 via-cyan-900/10 to-teal-900/5"
    },
    {
      name: t('game.elements.plant').toUpperCase(),
      symbol: "🌿",
      description: t('game.elements.plantDesc'),
      strength: t('game.elements.plantStrength'),
      gradient: "from-green-600 via-emerald-500 to-lime-500",
      bgPattern: "from-green-900/20 via-emerald-900/10 to-lime-900/5"
    }
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 ${isRTL() ? 'rtl' : 'ltr'}`}>
      {/* Sophisticated Background */}
      <div className="fixed inset-0 -z-10">
        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpolygon points='50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px'
          }} />
        </div>
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-transparent to-purple-950/30"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-cyan-950/20 via-transparent to-emerald-950/20"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-1/4 left-1/6 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-emerald-500/8 to-teal-500/4 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }}></div>
        
        {/* Subtle grid lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            
            {/* Main Hero Content */}
            <div className="text-center mb-16">
              {/* Logo and Brand */}
              <div className="flex items-center justify-center space-x-6 mb-12">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <img 
                    src="https://photos.pinksale.finance/file/pinksale-logo-upload/1756454447056-1fba9df7cd0639fc2d1b4bfcbc37a6bb.png"
                    alt="OMDB Arena"
                    className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="text-left">
                  <h1 className={`text-4xl sm:text-6xl lg:text-8xl font-black leading-none ${isRTL() ? 'text-right' : 'text-left'}`}>
                    <span className="block text-white mb-2">{t('game.title').split(' ')[0]}</span>
                    <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                      {t('game.title').split(' ')[1] || 'ARENA'}
                    </span>
                  </h1>
                  <p className={`text-lg sm:text-xl text-slate-400 font-medium mt-4 ${isRTL() ? 'text-right' : 'text-left'}`}>
                    {t('game.subtitle')}
                  </p>
                </div>
              </div>

              {/* Tagline */}
              <div className="max-w-4xl mx-auto mb-12">
                <h2 className={`text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight ${isRTL() ? 'text-right' : 'text-center'}`}>
                  {t('game.tagline').split(' ').slice(0, -2).join(' ')}
                  <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    {t('game.tagline').split(' ').slice(-2).join(' ')}
                  </span>
                </h2>
                <p className={`text-lg sm:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto ${isRTL() ? 'text-right' : 'text-center'}`}>
                  {t('game.description')}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                {isConnected ? (
                  <>
                    <Link
                      to="/create"
                      className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-blue-500/25"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                      <div className="relative flex items-center space-x-3">
                        <Play className="w-6 h-6" />
                        <span>{t('game.actions.startPlaying')}</span>
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                    <Link
                      to="/games"
                      className="group px-8 py-4 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-lg border-2 border-slate-700/50 hover:border-slate-600/50 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center space-x-3">
                        <Swords className="w-6 h-6" />
                        <span>{t('navigation.games')}</span>
                      </div>
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={connectWallet}
                    className="group relative overflow-hidden px-12 py-6 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 hover:from-emerald-700 hover:via-blue-700 hover:to-purple-700 text-white rounded-2xl font-black text-xl transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-emerald-500/25"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                    <div className="relative flex items-center space-x-4">
                      <Shield className="w-8 h-8" />
                      <span>{t('wallet.connect')}</span>
                      <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
              Platform
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Analytics</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Real-time metrics from our decentralized gaming ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                label: t('leaderboard.activePlayers').toUpperCase(), 
                value: totalGames, 
                suffix: "", 
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                    <rect x="4" y="8" width="24" height="16" rx="3" fill="currentColor" fillOpacity="0.8"/>
                    <rect x="6" y="10" width="20" height="12" rx="2" fill="currentColor" fillOpacity="0.6"/>
                    <circle cx="12" cy="16" r="2" fill="currentColor"/>
                    <circle cx="20" cy="16" r="2" fill="currentColor"/>
                    <rect x="14" y="18" width="4" height="2" rx="1" fill="currentColor" fillOpacity="0.9"/>
                    <path d="M8 6L10 4H22L24 6" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                ), 
                color: "from-emerald-500 to-teal-500",
                accent: "💎",
                loading: loadingStats
              },
              { 
                label: t('admin.totalPlayers').toUpperCase(), 
                value: totalPlayers, 
                suffix: "", 
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                    <circle cx="12" cy="10" r="4" fill="currentColor" fillOpacity="0.8"/>
                    <circle cx="20" cy="12" r="3" fill="currentColor" fillOpacity="0.7"/>
                    <path d="M4 26V24C4 20 8 18 12 18C16 18 20 20 20 24V26" fill="currentColor" fillOpacity="0.9"/>
                    <path d="M20 26V25C20 22 22 21 24 21C26 21 28 22 28 25V26" fill="currentColor" fillOpacity="0.8"/>
                    <rect x="10" y="8" width="4" height="2" rx="1" fill="currentColor" fillOpacity="0.6"/>
                    <rect x="18" y="10" width="4" height="2" rx="1" fill="currentColor" fillOpacity="0.6"/>
                  </svg>
                ), 
                color: "from-blue-500 to-indigo-500",
                accent: "👥",
                loading: loadingStats
              },
              { 
                label: t('leaderboard.totalVolume').toUpperCase(), 
                value: animatedVolume, 
                suffix: ` ${t('currency.core')}`, 
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                    <ellipse cx="16" cy="8" rx="12" ry="4" fill="currentColor" fillOpacity="0.8"/>
                    <path d="M4 8V16C4 18 8 20 16 20S28 18 28 16V8" fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.9"/>
                    <path d="M4 16V24C4 26 8 28 16 28S28 26 28 24V16" fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.9"/>
                    <ellipse cx="16" cy="16" rx="8" ry="2" fill="currentColor" fillOpacity="0.6"/>
                    <ellipse cx="16" cy="24" rx="8" ry="2" fill="currentColor" fillOpacity="0.7"/>
                    <circle cx="20" cy="12" r="1" fill="currentColor"/>
                    <circle cx="24" cy="20" r="1" fill="currentColor"/>
                  </svg>
                ), 
                color: "from-purple-500 to-pink-500",
                accent: "📊",
                loading: loadingStats,
                isDecimal: true
              }
            ].map((stat, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden p-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl hover:border-slate-700/50 transition-all duration-500 hover:scale-105"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative text-center">
                  <div className={`inline-flex p-6 rounded-2xl bg-gradient-to-br ${stat.color} mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white relative">
                      {stat.loading ? (
                        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        stat.icon
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-3xl sm:text-4xl font-black text-white mb-3">
                    {stat.loading ? (
                      <div className="animate-pulse bg-slate-700 h-10 w-24 mx-auto rounded"></div>
                    ) : (
                      <>
                        {stat.isDecimal ? formatNumber(stat.value, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : formatNumber(stat.value)}{stat.suffix}
                      </>
                    )}
                  </h3>
                  
                  <p className="text-slate-400 font-semibold text-sm tracking-wider mb-4">
                    {stat.label}
                  </p>
                  
                  {!stat.loading && (
                    <div className="flex items-center justify-center space-x-2">
                      <div className={`w-2 h-2 bg-gradient-to-r ${stat.color} rounded-full animate-pulse`}></div>
                      <span className="text-emerald-400 text-xs font-medium">{t('common.loading').replace('...', '').toUpperCase()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-5xl font-bold text-white mb-6 ${isRTL() ? 'text-right' : 'text-center'}`}>
              {t('features.enterpriseSecurity').split(' ')[0]}
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent"> {t('common.features', 'Features')}</span>
            </h2>
            <p className={`text-xl text-slate-400 max-w-3xl mx-auto ${isRTL() ? 'text-right' : 'text-center'}`}>
              {t('game.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreFeatures.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden p-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl hover:border-slate-700/50 transition-all duration-500 hover:scale-105"
                style={{ animationDelay: feature.delay }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative">
                  <div className={`inline-flex p-6 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Elements Strategy */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-5xl font-bold text-white mb-6 ${isRTL() ? 'text-right' : 'text-center'}`}>
              {t('game.tagline').split(' ')[0]}
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent"> {t('game.elements.fire').split('')[0]}{t('game.elements.water').split('')[0]}{t('game.elements.plant').split('')[0]}</span>
            </h2>
            <p className={`text-xl text-slate-400 max-w-3xl mx-auto ${isRTL() ? 'text-right' : 'text-center'}`}>
              {t('game.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {gameElements.map((element, index) => (
              <div
                key={index}
                className="group relative overflow-hidden p-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl hover:border-slate-700/50 transition-all duration-500 hover:scale-105"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${element.bgPattern} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className="relative text-center">
                  <div className={`inline-flex p-8 rounded-2xl bg-gradient-to-br ${element.gradient} mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-4xl">{element.symbol}</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {element.name}
                  </h3>
                  
                  <p className="text-slate-400 mb-4 leading-relaxed">
                    {element.description}
                  </p>

                  <div className={`p-4 bg-gradient-to-r ${element.gradient}/10 border border-slate-700/50 rounded-xl`}>
                    <p className="text-white font-semibold text-sm">
                      {element.strength}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Player Dashboard (if connected) */}
      {isConnected && playerStats && (
        <section className="relative py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="p-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
              
              <div className="relative">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-3xl font-bold text-white mb-2 ${isRTL() ? 'text-right' : 'text-left'}`}>
                        {t('stats.title')}
                      </h2>
                      <p className={`text-slate-400 ${isRTL() ? 'text-right' : 'text-left'}`}>{t('stats.performance')}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: t('stats.wins').toUpperCase(), value: playerStats.wins, icon: <Trophy className="w-6 h-6" />, color: "text-emerald-400", gradient: "from-emerald-500 to-teal-500" },
                    { label: t('stats.gamesPlayed').toUpperCase(), value: playerStats.gamesPlayed, icon: <Target className="w-6 h-6" />, color: "text-blue-400", gradient: "from-blue-500 to-indigo-500" },
                    { label: t('stats.winRate').toUpperCase(), value: `${playerStats.winRate || 0}%`, icon: <TrendingUp className="w-6 h-6" />, color: "text-purple-400", gradient: "from-purple-500 to-pink-500" },
                    { label: t('stats.monthlyScore').toUpperCase(), value: playerStats.monthlyScore, icon: <Star className="w-6 h-6" />, color: "text-yellow-400", gradient: "from-yellow-500 to-orange-500" }
                  ].map((stat, index) => (
                    <div key={index} className="text-center p-6 bg-slate-800/40 rounded-2xl backdrop-blur-lg border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300 group">
                      <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${stat.gradient} mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <div className="text-white">
                          {stat.icon}
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-white mb-2">{stat.value}</p>
                      <p className="text-slate-400 text-sm font-semibold tracking-wider">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-8">
                  <Link
                    to="/stats"
                    className="group inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105 border border-slate-600/50"
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span>{t('navigation.statistics')}</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Technology Stack */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-5xl font-bold text-white mb-6 ${isRTL() ? 'text-right' : 'text-center'}`}>
              {t('technology.bsc').split(' ')[0]}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> {t('features.enterpriseSecurity').split(' ')[1]}</span>
            </h2>
            <p className={`text-xl text-slate-400 max-w-3xl mx-auto ${isRTL() ? 'text-right' : 'text-center'}`}>
              {t('technology.bscDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                name: t('technology.bsc'), 
                desc: t('technology.bscDesc'), 
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                    <rect x="4" y="4" width="24" height="24" rx="4" fill="currentColor" fillOpacity="0.8"/>
                    <rect x="6" y="6" width="20" height="20" rx="3" fill="currentColor" fillOpacity="0.6"/>
                    <rect x="8" y="8" width="16" height="16" rx="2" fill="currentColor" fillOpacity="0.4"/>
                    <circle cx="16" cy="12" r="2" fill="currentColor"/>
                    <circle cx="12" cy="16" r="1.5" fill="currentColor" fillOpacity="0.9"/>
                    <circle cx="20" cy="16" r="1.5" fill="currentColor" fillOpacity="0.9"/>
                    <rect x="14" y="18" width="4" height="2" rx="1" fill="currentColor"/>
                  </svg>
                ), 
                color: "from-yellow-500 to-orange-500" 
              },
              { 
                name: t('technology.smartContracts'), 
                desc: t('technology.contractsDesc'), 
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                    <rect x="6" y="4" width="20" height="24" rx="2" fill="currentColor" fillOpacity="0.8"/>
                    <rect x="8" y="6" width="16" height="20" rx="1" fill="currentColor" fillOpacity="0.6"/>
                    <path d="M10 10H22M10 14H20M10 18H18M10 22H16" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.9"/>
                    <circle cx="26" cy="8" r="3" fill="currentColor" fillOpacity="0.9"/>
                    <path d="M24 8L25 9L28 6" stroke="white" strokeWidth="1" fill="none"/>
                  </svg>
                ), 
                color: "from-purple-500 to-pink-500" 
              },
              { 
                name: t('technology.web3Integration'), 
                desc: t('technology.web3Desc'), 
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                    <rect x="4" y="10" width="24" height="14" rx="3" fill="currentColor" fillOpacity="0.8"/>
                    <rect x="6" y="12" width="20" height="10" rx="2" fill="currentColor" fillOpacity="0.6"/>
                    <circle cx="12" cy="17" r="2" fill="currentColor"/>
                    <circle cx="20" cy="17" r="2" fill="currentColor"/>
                    <path d="M8 8L10 6H22L24 8" stroke="currentColor" strokeWidth="2" strokeOpacity="0.9"/>
                    <circle cx="26" cy="6" r="2" fill="currentColor" fillOpacity="0.9"/>
                    <path d="M24 4L26 2L28 4" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                ), 
                color: "from-emerald-500 to-teal-500" 
              },
              { 
                name: t('technology.realtimeApi'), 
                desc: t('technology.apiDesc'), 
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                    <rect x="2" y="6" width="28" height="20" rx="3" fill="currentColor" fillOpacity="0.8"/>
                    <rect x="4" y="8" width="24" height="16" rx="2" fill="currentColor" fillOpacity="0.6"/>
                    <rect x="6" y="10" width="8" height="2" rx="1" fill="currentColor"/>
                    <rect x="6" y="14" width="12" height="2" rx="1" fill="currentColor"/>
                    <rect x="6" y="18" width="6" height="2" rx="1" fill="currentColor"/>
                    <circle cx="24" cy="14" r="3" fill="currentColor" fillOpacity="0.9"/>
                    <circle cx="24" cy="14" r="1.5" fill="white" fillOpacity="0.8"/>
                    <path d="M20 10L22 8L24 10" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                ), 
                color: "from-orange-500 to-red-500" 
              }
            ].map((tech, index) => (
              <div key={index} className="group p-6 bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl hover:border-slate-700/50 transition-all duration-300 hover:scale-105">
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${tech.color} mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {tech.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{tech.name}</h3>
                <p className="text-slate-400 text-sm">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 rounded-3xl blur-3xl"></div>
            <div className="relative p-12 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
              
              <div className="relative">
                <div className="mb-8">
                  <div className="inline-flex p-8 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 mb-6 shadow-2xl">
                    <Hexagon className="w-12 h-12 text-white" />
                  </div>
                  
                  <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                    {t('modals.congratulations')}
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> {t('game.actions.startPlaying')}?</span>
                  </h2>
                  
                  <p className={`text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed ${isRTL() ? 'text-right' : 'text-center'}`}>
                    {t('game.description')}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  {isConnected ? (
                    <>
                      <Link
                        to="/create"
                        className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-110 shadow-2xl"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                        <div className="relative flex items-center space-x-3">
                          <Play className="w-6 h-6" />
                          <span>{t('game.actions.startPlaying')}</span>
                        </div>
                      </Link>
                      <Link
                        to="/ranking"
                        className="group px-8 py-4 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-lg border border-slate-700/50 hover:border-slate-600/50 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                      >
                        <div className="flex items-center space-x-3">
                          <Crown className="w-6 h-6" />
                          <span>{t('navigation.ranking')}</span>
                        </div>
                      </Link>
                    </>
                  ) : (
                    <button
                      onClick={connectWallet}
                      className="group relative overflow-hidden px-12 py-6 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 hover:from-emerald-700 hover:via-blue-700 hover:to-purple-700 text-white rounded-2xl font-black text-xl transition-all duration-300 hover:scale-110 shadow-2xl"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                      <div className="relative flex items-center space-x-4">
                        <Shield className="w-8 h-8" />
                        <span>{t('game.actions.enterPlatform')}</span>
                        <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;