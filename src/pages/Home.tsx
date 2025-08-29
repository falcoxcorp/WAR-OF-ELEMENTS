import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useGame } from '../contexts/GameContext';
import { Flame, Droplets, Leaf, Shield, Coins, Target, Crown, Star, Sparkles, ChevronRight, Play, TrendingUp, Award, Globe, Lock, Eye, ArrowRight, Gamepad2, BarChart3, Swords, Gem, Zap, Hexagon, Wind, Mountain, Sun, Moon, Trophy } from 'lucide-react';

const Home = () => {
  const { isConnected, account, web3, connectWallet, contract, isCorrectNetwork } = useWeb3();
  const { games, playerStats } = useGame();
  const [currentElement, setCurrentElement] = useState(0);
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

  // Function to get real contract statistics
  const fetchContractStats = async () => {
    if (!contract || !isCorrectNetwork || !web3) return;
    
    try {
      setLoadingStats(true);
      
      const [
        totalGames,
        totalPlayers,
        rewardPool,
        contractBalance
      ] = await Promise.all([
        contract.methods.totalGames().call(),
        contract.methods.totalPlayers().call(),
        contract.methods.getRewardPoolInfo().call(),
        web3.eth.getBalance(contract.options.address)
      ]);

      // Calculate approximate total volume based on contract balance
      const totalVolumeWei = BigInt(contractBalance) + BigInt(rewardPool);

      setContractStats({
        totalGames: Number(totalGames),
        totalPlayers: Number(totalPlayers),
        totalVolume: totalVolumeWei.toString(),
        rewardPool,
        contractBalance
      });
    } catch (error) {
      console.error('Error fetching contract stats:', error);
      // Keep default values in case of error
    } finally {
      setLoadingStats(false);
    }
  };

  // Get contract data on load
  useEffect(() => {
    if (contract && isCorrectNetwork) {
      fetchContractStats();
    }
  }, [contract, isCorrectNetwork]);

  // Update data every 30 seconds
  useEffect(() => {
    if (contract && isCorrectNetwork) {
      const interval = setInterval(fetchContractStats, 300000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [contract, isCorrectNetwork]);

  // Animated counter hook
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

  // Mouse tracking for interactive effects
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

  // Elements data with mystical theme
  const elements = [
    {
      name: "FIRE",
      emoji: "🔥",
      icon: <Flame className="w-20 h-20" />,
      description: "The burning power that consumes everything in its path",
      power: "Incinerates Plants with its scorching heat",
      gradient: "from-red-500 via-orange-500 to-yellow-500",
      bgGradient: "from-red-900/30 via-orange-900/20 to-yellow-900/10",
      particles: "🔥💥⚡",
      mysticalDesc: "Forged in the volcanic depths"
    },
    {
      name: "WATER",
      emoji: "💧",
      icon: <Droplets className="w-20 h-20" />,
      description: "The fluid force that adapts and conquers",
      power: "Extinguishes Fire with its pure essence",
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
      bgGradient: "from-blue-900/30 via-cyan-900/20 to-teal-900/10",
      particles: "💧🌊❄️",
      mysticalDesc: "Born from the primordial oceans"
    },
    {
      name: "PLANTS",
      emoji: "🌿",
      icon: <Leaf className="w-20 h-20" />,
      description: "The ancestral life that absorbs everything",
      power: "Absorbs Water to grow and prosper",
      gradient: "from-green-500 via-emerald-500 to-lime-500",
      bgGradient: "from-green-900/30 via-emerald-900/20 to-lime-900/10",
      particles: "🌿🍃🌱",
      mysticalDesc: "Blessed by mother nature"
    }
  ];

  // Auto-cycle through elements
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentElement((prev) => (prev + 1) % elements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Animated stats using real contract data
  const totalGames = useAnimatedCounter(contractStats.totalGames || 0);
  const totalPlayers = useAnimatedCounter(contractStats.totalPlayers || 0);
  const totalVolumeCore = parseFloat(web3?.utils.fromWei(contractStats.totalVolume, 'ether') || '0');
  const animatedVolume = useAnimatedCounter(Math.floor(totalVolumeCore * 100)) / 100;

  // Mystical features
  const mysticalFeatures = [
    {
      icon: <Flame className="w-8 h-8" />,
      title: "Elemental Combat",
      description: "Master the primordial elements in epic instant battles",
      color: "from-red-500 to-orange-500",
      delay: "0ms",
      element: "🔥"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Protective Magic",
      description: "Audited smart contracts guarantee fair and secure combat",
      color: "from-blue-500 to-cyan-500",
      delay: "200ms",
      element: "🛡️"
    },
    {
      icon: <Crown className="w-8 h-8" />,
      title: "Legendary Treasures",
      description: "Earn real CORE tokens and ascend in mystical rankings",
      color: "from-purple-500 to-pink-500",
      delay: "400ms",
      element: "👑"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Elemental Realm",
      description: "Join warriors from around the world in the Core ecosystem",
      color: "from-green-500 to-emerald-500",
      delay: "600ms",
      element: "🌍"
    }
  ];

  // Battle arenas (game modes)
  const battleArenas = [
    {
      title: "QUICK ARENA",
      description: "Instant elemental duels",
      icon: <Zap className="w-12 h-12" />,
      color: "from-yellow-400 to-orange-500",
      popular: false,
      element: "⚡"
    },
    {
      title: "EPIC COLOSSEUM",
      description: "High-stakes battles with great rewards",
      icon: <Crown className="w-12 h-12" />,
      color: "from-purple-500 to-pink-500",
      popular: true,
      element: "🏛️"
    },
    {
      title: "MASTER TOURNAMENT",
      description: "Monthly competitions for supreme glory",
      icon: <Award className="w-12 h-12" />,
      color: "from-blue-500 to-cyan-500",
      popular: false,
      element: "🏆"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mystical Animated Background */}
      <div className="fixed inset-0 -z-10">
        {/* Base mystical gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900"></div>
        
        {/* Dynamic element-based background */}
        <div className={`absolute inset-0 bg-gradient-to-r ${elements[currentElement].bgGradient} transition-all duration-2000`}></div>
        
        {/* Floating mystical orbs */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large elemental orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-red-500/20 via-orange-500/10 to-transparent rounded-full blur-3xl animate-float" style={{ animationDuration: '8s' }}></div>
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-radial from-blue-500/20 via-cyan-500/10 to-transparent rounded-full blur-3xl animate-float" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-radial from-green-500/20 via-emerald-500/10 to-transparent rounded-full blur-3xl animate-float" style={{ animationDuration: '10s', animationDelay: '4s' }}></div>
          
          {/* Mystical energy lines */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/40 to-transparent animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-green-500/40 to-transparent animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-purple-500/40 to-transparent animate-pulse" style={{ animationDelay: '3s' }}></div>
          
          {/* Rotating elemental symbols */}
          <div className="absolute top-1/3 right-1/3 w-32 h-32 border-2 border-red-500/30 rounded-full animate-spin" style={{ animationDuration: '20s' }}>
            <div className="absolute inset-4 border border-orange-500/20 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">🔥</div>
          </div>
          <div className="absolute bottom-1/3 left-1/3 w-24 h-24 border-2 border-blue-500/30 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
            <div className="absolute inset-3 border border-cyan-500/20 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl">💧</div>
          </div>
          <div className="absolute top-2/3 left-1/2 w-28 h-28 border-2 border-green-500/30 rounded-full animate-spin" style={{ animationDuration: '18s' }}>
            <div className="absolute inset-4 border border-emerald-500/20 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl">🌿</div>
          </div>
          
          {/* Mystical particles */}
          <div className="absolute inset-0">
            {[...Array(100)].map((_, i) => {
              const elementIndex = i % 3;
              const elementEmojis = ['🔥', '💧', '🌿'];
              const colors = ['text-red-400/40', 'text-blue-400/40', 'text-green-400/40'];
              
              return (
                <div
                  key={i}
                  className={`absolute text-lg ${colors[elementIndex]} animate-pulse pointer-events-none`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${3 + Math.random() * 4}s`,
                    transform: `translateY(${scrollY * 0.1}px)`
                  }}
                >
                  {elementEmojis[elementIndex]}
                </div>
              );
            })}
          </div>
          
          {/* Elemental energy waves */}
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <div
                key={`wave-${i}`}
                className="absolute w-full h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-60"
                style={{
                  top: `${20 + i * 20}%`,
                  animation: `wave-motion 4s ease-in-out infinite`,
                  animationDelay: `${i * 0.8}s`
                }}
              />
            ))}
          </div>

          {/* Interactive cursor elemental aura */}
          <div 
            className={`absolute w-96 h-96 bg-gradient-radial ${elements[currentElement].bgGradient} rounded-full pointer-events-none transition-all duration-1000 animate-pulse opacity-30`}
            style={{
              left: mousePosition.x - 192,
              top: mousePosition.y - 192,
            }}
          />
        </div>
      </div>

      {/* Hero Section with Elemental Theme */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            
            {/* Mystical Element Display */}
            <div className="mb-12 flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl mx-auto">
              {/* Left Side - Elemental Showcase */}
              <div className="flex-1 lg:pr-12 text-center lg:text-left">
                {/* Dynamic Element Display */}
                <div className="mb-8 relative">
                  <div className={`relative p-8 rounded-3xl bg-gradient-to-br ${elements[currentElement].gradient} shadow-2xl transform transition-all duration-1000 hover:scale-105`}>
                    <div className="text-white text-6xl mb-4 animate-bounce">
                      {elements[currentElement].emoji}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                    <div className="absolute -inset-4 bg-gradient-to-br from-white/10 to-transparent rounded-3xl blur-xl"></div>
                    
                    {/* Elemental particles around the icon */}
                    <div className="absolute inset-0">
                      {elements[currentElement].particles.split('').map((particle, i) => (
                        <div
                          key={i}
                          className="absolute text-2xl animate-ping opacity-60"
                          style={{
                            left: `${20 + i * 30}%`,
                            top: `${10 + i * 25}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: '2s'
                          }}
                        >
                          {particle}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dynamic Title */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-none">
                  <span className="block text-white mb-2">WAR OF</span>
                  <span className={`block bg-gradient-to-r ${elements[currentElement].gradient} bg-clip-text text-transparent animate-pulse`}>
                    ELEMENTS
                  </span>
                </h1>

                {/* Dynamic Subtitle */}
                <div className="mb-8 min-h-[120px] flex flex-col justify-center">
                  <p className="text-2xl md:text-3xl font-bold text-white/90 mb-3">
                    {elements[currentElement].name} • {elements[currentElement].mysticalDesc}
                  </p>
                  <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-2">
                    {elements[currentElement].description}
                  </p>
                  <p className="text-base md:text-lg text-gray-400 italic">
                    "{elements[currentElement].power}"
                  </p>
                </div>
              </div>

              {/* Right Side - Mystical Logo */}
              <div className="flex-shrink-0 lg:ml-12 mb-8 lg:mb-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 relative">
                    <img 
                      src="https://photos.pinksale.finance/file/pinksale-logo-upload/1756454447056-1fba9df7cd0639fc2d1b4bfcbc37a6bb.png"
                      alt="Elements Warfare Arena Logo"
                      className="w-full h-full object-contain rounded-3xl shadow-2xl"
                    />
                    {/* Elemental aura around logo */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${elements[currentElement].gradient}/30 rounded-3xl blur-xl animate-pulse`}></div>
                    {/* Mystical border */}
                    <div className={`absolute inset-0 border-4 border-gradient-to-r ${elements[currentElement].gradient} rounded-3xl`}></div>
                    
                    {/* Floating element symbols around logo */}
                    <div className="absolute -inset-8">
                      {elements.map((element, index) => (
                        <div
                          key={index}
                          className={`absolute text-4xl transition-all duration-1000 ${
                            index === currentElement ? 'scale-125 opacity-100' : 'scale-75 opacity-40'
                          }`}
                          style={{
                            left: `${30 + index * 40}%`,
                            top: `${20 + Math.sin(index * 2) * 30}%`,
                            animation: `float 3s ease-in-out infinite`,
                            animationDelay: `${index * 0.5}s`
                          }}
                        >
                          {element.emoji}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Element Selector */}
            <div className="flex justify-center space-x-4 mb-8">
              {elements.map((element, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentElement(index)}
                  className={`group relative overflow-hidden p-4 rounded-2xl border-2 transition-all duration-500 ${
                    index === currentElement 
                      ? `border-gradient-to-r ${element.gradient} bg-gradient-to-br ${element.gradient}/20 scale-110` 
                      : 'border-white/20 bg-white/5 hover:bg-white/10 hover:scale-105'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                  <div className="relative text-center">
                    <div className="text-3xl mb-2">{element.emoji}</div>
                    <div className={`font-bold text-sm ${index === currentElement ? 'text-white' : 'text-gray-300'}`}>
                      {element.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              {isConnected ? (
                <>
                  <Link
                    to="/create"
                    className="group relative overflow-hidden px-12 py-6 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-700 hover:via-orange-700 hover:to-yellow-700 text-white rounded-2xl font-black text-xl transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-red-500/50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                    <div className="relative flex items-center space-x-3">
                      <Flame className="w-6 h-6" />
                      <span>FORGE BATTLE</span>
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                  <Link
                    to="/games"
                    className="group px-12 py-6 bg-white/10 hover:bg-white/20 backdrop-blur-lg border-2 border-white/20 hover:border-white/40 text-white rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center space-x-3">
                      <Swords className="w-6 h-6" />
                      <span>ENTER COLOSSEUM</span>
                    </div>
                  </Link>
                </>
              ) : (
                <button
                  onClick={connectWallet}
                  className="group relative overflow-hidden px-16 py-8 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white rounded-2xl font-black text-2xl transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-purple-500/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                  <div className="relative flex items-center space-x-4">
                    <Sparkles className="w-8 h-8" />
                    <span>AWAKEN POWER</span>
                    <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Elemental Stats Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              <span className="bg-gradient-to-r from-red-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
                ELEMENTAL POWER
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Real-time statistics from the elemental realm
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                label: "EPIC BATTLES", 
                value: totalGames, 
                suffix: "+", 
                icon: <Swords className="w-8 h-8" />, 
                color: "from-red-500 to-orange-500",
                element: "🔥",
                loading: loadingStats
              },
              { 
                label: "ACTIVE WARRIORS", 
                value: totalPlayers, 
                suffix: "+", 
                icon: <Crown className="w-8 h-8" />, 
                color: "from-blue-500 to-cyan-500",
                element: "💧",
                loading: loadingStats
              },
              { 
                label: "TREASURE AT STAKE", 
                value: animatedVolume, 
                suffix: "", 
                icon: <Gem className="w-8 h-8" />, 
                color: "from-green-500 to-emerald-500",
                element: "🌿",
                loading: loadingStats,
                isDecimal: true
              }
            ].map((stat, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden p-8 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border-2 border-white/10 rounded-3xl hover:border-white/30 transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Elemental background effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color}/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Floating element */}
                <div className="absolute top-4 right-4 text-3xl opacity-20 group-hover:opacity-60 transition-opacity duration-500 animate-float">
                  {stat.element}
                </div>
                
                <div className="relative text-center">
                  <div className={`inline-flex p-6 rounded-3xl bg-gradient-to-br ${stat.color} mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white relative">
                      {stat.loading ? (
                        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        stat.icon
                      )}
                      {/* Elemental glow */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-full blur-lg opacity-50 animate-pulse`}></div>
                    </div>
                  </div>
                  
                  <h3 className="text-4xl md:text-5xl font-black text-white mb-3">
                    {stat.loading ? (
                      <div className="animate-pulse bg-gray-600 h-12 w-32 mx-auto rounded"></div>
                    ) : (
                      <>
                        {stat.isDecimal ? stat.value.toFixed(2) : stat.value.toLocaleString()}{stat.suffix}
                      </>
                    )}
                  </h3>
                  
                  <p className="text-gray-300 font-bold text-lg tracking-wider mb-4">
                    {stat.label}
                  </p>
                  
                  {/* Live indicator with elemental theme */}
                  {!stat.loading && (
                    <div className="flex items-center justify-center space-x-2">
                      <div className={`w-3 h-3 bg-gradient-to-r ${stat.color} rounded-full animate-pulse`}></div>
                      <span className="text-green-400 text-sm font-medium">LIVE ENERGY</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Reward Pool Display */}
          {contractStats.rewardPool !== '0' && (
            <div className="mt-12 text-center">
              <div className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border-2 border-yellow-500/50 rounded-3xl backdrop-blur-lg">
                <div className="text-3xl animate-bounce">👑</div>
                <div>
                  <span className="text-yellow-300 font-medium text-lg">
                    Realm Treasury: 
                  </span>
                  <span className="text-yellow-400 font-bold text-xl ml-2">
                    {parseFloat(web3?.utils.fromWei(contractStats.rewardPool, 'ether') || '0').toFixed(4)} CORE
                  </span>
                </div>
                <div className="text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>💎</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mystical Features Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                MYSTICAL POWERS
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of elemental gaming with blockchain technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {mysticalFeatures.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden p-8 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border-2 border-white/10 rounded-3xl hover:border-white/30 transition-all duration-500 hover:scale-105 hover:-translate-y-4"
                style={{ animationDelay: feature.delay }}
              >
                {/* Mystical background glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color}/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Floating element */}
                <div className="absolute top-4 right-4 text-2xl opacity-30 group-hover:opacity-80 transition-opacity duration-500 animate-pulse">
                  {feature.element}
                </div>
                
                <div className="relative">
                  <div className={`inline-flex p-6 rounded-3xl bg-gradient-to-br ${feature.color} mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300 relative`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                    {/* Mystical aura */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-3xl blur-lg opacity-40 animate-pulse`}></div>
                  </div>
                  
                  <h3 className="text-2xl font-black text-white mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Battle Arenas Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              <span className="bg-gradient-to-r from-orange-400 via-red-400 to-purple-400 bg-clip-text text-transparent">
                BATTLE ARENAS
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose your battlefield and prove your elemental mastery
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {battleArenas.map((arena, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden p-8 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border-2 rounded-3xl transition-all duration-500 hover:scale-105 hover:-translate-y-4 ${
                  arena.popular 
                    ? 'border-yellow-400/50 shadow-2xl shadow-yellow-500/20' 
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                {arena.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black text-sm rounded-full shadow-lg flex items-center space-x-2">
                      <span>🔥</span>
                      <span>MOST POPULAR</span>
                      <span>🔥</span>
                    </div>
                  </div>
                )}

                {/* Arena background effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${arena.color}/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Floating arena element */}
                <div className="absolute top-6 right-6 text-3xl opacity-20 group-hover:opacity-60 transition-opacity duration-500 animate-float">
                  {arena.element}
                </div>
                
                <div className="relative text-center">
                  <div className={`inline-flex p-8 rounded-3xl bg-gradient-to-br ${arena.color} mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300 relative`}>
                    <div className="text-white">
                      {arena.icon}
                    </div>
                    {/* Arena energy aura */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${arena.color} rounded-3xl blur-xl opacity-50 animate-pulse`}></div>
                  </div>
                  
                  <h3 className="text-2xl font-black text-white mb-4">
                    {arena.title}
                  </h3>
                  
                  <p className="text-gray-300 mb-8 leading-relaxed">
                    {arena.description}
                  </p>

                  <Link
                    to="/games"
                    className={`group/btn inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r ${arena.color} hover:scale-105 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover/btn:animate-shimmer"></div>
                    <div className="relative flex items-center space-x-3">
                      <Play className="w-5 h-5" />
                      <span>BATTLE NOW</span>
                      <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Player Legacy Section (if connected) */}
      {isConnected && playerStats && (
        <section className="relative py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-cyan-600/20 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl relative overflow-hidden">
              {/* Mystical background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer"></div>
              
              <div className="relative">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-white mb-2">
                        <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                          YOUR ELEMENTAL LEGACY
                        </span>
                      </h2>
                      <p className="text-purple-300">Chronicles of your arena mastery</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: "VICTORIES", value: playerStats.wins, icon: <Trophy className="w-6 h-6" />, color: "text-yellow-400", element: "🏆" },
                    { label: "BATTLES", value: playerStats.gamesPlayed, icon: <Target className="w-6 h-6" />, color: "text-blue-400", element: "⚔️" },
                    { label: "MASTERY", value: `${playerStats.winRate || 0}%`, icon: <TrendingUp className="w-6 h-6" />, color: "text-green-400", element: "📈" },
                    { label: "GLORY", value: playerStats.monthlyScore, icon: <Star className="w-6 h-6" />, color: "text-purple-400", element: "✨" }
                  ].map((stat, index) => (
                    <div key={index} className="text-center p-6 bg-slate-800/60 rounded-2xl backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all duration-300 group">
                      <div className="absolute top-2 right-2 text-lg opacity-30 group-hover:opacity-70 transition-opacity">
                        {stat.element}
                      </div>
                      <div className={`${stat.color} mb-3 flex justify-center relative`}>
                        {stat.icon}
                        <div className={`absolute inset-0 ${stat.color.replace('text-', 'bg-').replace('-400', '-400/20')} rounded-full blur-lg animate-pulse`}></div>
                      </div>
                      <p className="text-2xl font-black text-white mb-1">{stat.value}</p>
                      <p className="text-gray-400 text-sm font-bold">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-8">
                  <Link
                    to="/stats"
                    className="group inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-lg relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                    <div className="relative flex items-center space-x-3">
                      <BarChart3 className="w-5 h-5" />
                      <span>VIEW FULL PROFILE</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Final Call to Action */}
      <section className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-purple-600/20 to-blue-600/20 rounded-3xl blur-3xl"></div>
            <div className="relative p-12 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border-2 border-white/20 rounded-3xl overflow-hidden">
              {/* Mystical energy waves */}
              <div className="absolute inset-0">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 border-2 border-white/10 rounded-3xl"
                    style={{
                      animation: `pulse-ring 3s ease-in-out infinite`,
                      animationDelay: `${i * 1}s`
                    }}
                  />
                ))}
              </div>
              
              <div className="relative">
                <div className="mb-8">
                  <div className="inline-flex p-8 rounded-3xl bg-gradient-to-br from-red-500 via-purple-500 to-blue-500 mb-6 shadow-2xl relative">
                    <Hexagon className="w-12 h-12 text-white" />
                    {/* Mystical aura */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                  </div>
                  
                  <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
                    <span className="bg-gradient-to-r from-red-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                      READY FOR GLORY?
                    </span>
                  </h2>
                  
                  <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Join thousands of elemental warriors in the most epic blockchain arena. 
                    Your legend begins with a single battle.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  {isConnected ? (
                    <>
                      <Link
                        to="/create"
                        className="group relative overflow-hidden px-12 py-6 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-700 hover:via-orange-700 hover:to-yellow-700 text-white rounded-2xl font-black text-xl transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-red-500/50"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                        <div className="relative flex items-center space-x-3">
                          <Flame className="w-6 h-6" />
                          <span>START COMBAT</span>
                        </div>
                      </Link>
                      <Link
                        to="/ranking"
                        className="group px-12 py-6 bg-white/10 hover:bg-white/20 backdrop-blur-lg border-2 border-white/20 hover:border-white/40 text-white rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105"
                      >
                        <div className="flex items-center space-x-3">
                          <Crown className="w-6 h-6" />
                          <span>VIEW RANKINGS</span>
                        </div>
                      </Link>
                    </>
                  ) : (
                    <button
                      onClick={connectWallet}
                      className="group relative overflow-hidden px-16 py-8 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white rounded-2xl font-black text-2xl transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-purple-500/50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                      <div className="relative flex items-center space-x-4">
                        <Sparkles className="w-8 h-8" />
                        <span>ENTER THE REALM</span>
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

      {/* Custom CSS for wave animation */}
      <style jsx>{`
        @keyframes wave-motion {
          0%, 100% { transform: translateX(-100%) skewX(-15deg); }
          50% { transform: translateX(100%) skewX(15deg); }
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
};

export default Home;