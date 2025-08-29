import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { Home, Wallet, AlertTriangle, RefreshCw, LogOut, Gamepad2, Menu, X, Shield, BarChart3, User, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { account, connectWallet, isConnected, balance, isCorrectNetwork, switchToCore, reconnectWallet, disconnectWallet, isOwner } = useWeb3();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const isActive = (path: string) => location.pathname === path;

  const navigationLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/games', label: 'Games', icon: Gamepad2 },
    { path: '/statistics', label: 'Statistics', icon: BarChart3 },
    { path: '/stats', label: 'Perfil', icon: User } // Nuevo botón Perfil
  ];

  // Add admin link if user is owner
  if (isOwner) {
    navigationLinks.push({ path: '/admin', label: 'Admin', icon: Shield });
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50 w-full overflow-x-hidden">
        <div className="w-full px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-12 sm:h-14 lg:h-16">
            {/* Logo - Responsive */}
            <Link to="/" className="flex items-center space-x-1 sm:space-x-2 text-white group min-w-0 flex-shrink-0" onClick={closeMobileMenu}>
              <div className="relative">
                <img 
                  src="https://photos.pinksale.finance/file/pinksale-logo-upload/1756454447056-1fba9df7cd0639fc2d1b4bfcbc37a6bb.png" 
                  alt="OMDB Arena Logo" 
                  className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-md sm:rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-md sm:rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="hidden sm:block min-w-0">
                <span className="font-bold text-sm sm:text-base lg:text-lg bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent truncate">
                  OMDB Arena
                </span>
                <div className="text-xs text-gray-400 -mt-1 hidden lg:block">Core Blockchain</div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden xl:flex items-center space-x-1 flex-shrink-0">
              {navigationLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive(path) 
                      ? path === '/admin' 
                        ? 'bg-red-600 text-white shadow-lg' 
                        : path === '/statistics'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : path === '/stats'
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{label}</span>
                  {path === '/admin' && (
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse flex-shrink-0"></div>
                  )}
                  {path === '/statistics' && (
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse flex-shrink-0"></div>
                  )}
                  {path === '/stats' && (
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop Right Section */}
            <div className="hidden lg:flex items-center space-x-1 flex-shrink-0">
              {/* Network Warning */}
              {isConnected && !isCorrectNetwork && (
                <button
                  onClick={switchToCore}
                  className="flex items-center space-x-1 px-2 py-1 bg-red-600/20 border border-red-500/50 text-red-400 rounded-lg text-xs font-medium transition-all hover:bg-red-600/30 animate-pulse"
                >
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">Switch to Core</span>
                  <span className="sm:hidden whitespace-nowrap">Switch</span>
                </button>
              )}

              {/* Wallet Section */}
              {isConnected ? (
                <div className="flex items-center space-x-1">
                  <div className="text-right hidden xl:block">
                    <div className="text-white text-xs font-medium truncate">
                      {parseFloat(balance).toFixed(2)} CORE
                    </div>
                    <div className="text-gray-400 text-xs flex items-center space-x-1">
                      <span className="truncate">{shortenAddress(account!)}</span>
                      {isOwner && (
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <Shield className="w-3 h-3 text-red-400" />
                          <span className="text-red-400 text-xs font-bold">ADMIN</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Wallet Actions */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={reconnectWallet}
                      className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded-md flex items-center justify-center transition-all flex-shrink-0"
                      title="Refresh Connection"
                    >
                      <RefreshCw className="w-3 h-3 text-gray-300" />
                    </button>
                    
                    <button
                      onClick={disconnectWallet}
                      className="w-6 h-6 bg-red-600/20 hover:bg-red-600/30 rounded-md flex items-center justify-center transition-all flex-shrink-0"
                      title="Disconnect Wallet"
                    >
                      <LogOut className="w-3 h-3 text-red-400" />
                    </button>
                    
                    <div className={`w-7 h-7 bg-gradient-to-br ${isOwner ? 'from-red-500 to-red-600' : 'from-blue-500 to-blue-600'} rounded-md flex items-center justify-center relative flex-shrink-0`}>
                      {isOwner ? (
                        <Shield className="w-3 h-3 text-white" />
                      ) : (
                        <Wallet className="w-3 h-3 text-white" />
                      )}
                      {isOwner && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="group relative overflow-hidden flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-md font-medium transition-all hover:scale-105 shadow-lg text-xs"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                  <div className="relative flex items-center space-x-1">
                    <Wallet className="w-3 h-3 flex-shrink-0" />
                    <span className="whitespace-nowrap">Connect</span>
                  </div>
                </button>
              )}
            </div>

            {/* Mobile Menu Button and Wallet */}
            <div className="flex xl:hidden items-center space-x-1 flex-shrink-0">
              {/* Mobile Network Warning */}
              {isConnected && !isCorrectNetwork && (
                <button
                  onClick={switchToCore}
                  className="flex items-center space-x-1 px-1 py-0.5 bg-red-600/20 border border-red-500/50 text-red-400 rounded text-xs font-medium transition-all hover:bg-red-600/30 animate-pulse"
                >
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">Switch</span>
                </button>
              )}

              {/* Mobile Wallet Info */}
              {isConnected ? (
                <div className="flex items-center space-x-1">
                  <div className="text-right">
                    <div className="text-white text-xs font-medium truncate max-w-[50px] sm:max-w-[80px]">
                      {parseFloat(balance).toFixed(1)}
                    </div>
                    <div className="text-gray-400 text-xxs flex items-center space-x-1">
                      <span className="truncate max-w-[50px] sm:max-w-[80px]">{shortenAddress(account!)}</span>
                      {isOwner && <Shield className="w-3 h-3 text-red-400 flex-shrink-0" />}
                    </div>
                  </div>
                  <div className={`w-6 h-6 bg-gradient-to-br ${isOwner ? 'from-red-500 to-red-600' : 'from-blue-500 to-blue-600'} rounded-md flex items-center justify-center relative flex-shrink-0`}>
                    {isOwner ? (
                      <Shield className="w-3 h-3 text-white" />
                    ) : (
                      <Wallet className="w-3 h-3 text-white" />
                    )}
                    {isOwner && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="group relative overflow-hidden flex items-center space-x-1 px-1 py-0.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded text-xs font-medium transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                  <div className="relative flex items-center space-x-1">
                    <Wallet className="w-3 h-3 flex-shrink-0" />
                    <span className="whitespace-nowrap">Connect</span>
                  </div>
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded-md flex items-center justify-center transition-all xl:hidden flex-shrink-0"
              >
                {isMobileMenuOpen ? (
                  <X className="w-4 h-4 text-white" />
                ) : (
                  <Menu className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Network Warning Banner */}
        {isConnected && !isCorrectNetwork && (
          <div className="lg:hidden bg-red-600/20 border-t border-red-500/50 px-2 py-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-400 text-xs">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                <span className="whitespace-nowrap">Wrong Network - Switch to Core Blockchain</span>
              </div>
              <button
                onClick={switchToCore}
                className="px-1 py-0.5 bg-red-600 text-white rounded text-xs font-medium flex-shrink-0"
              >
                Switch
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 xl:hidden" onClick={closeMobileMenu}>
          <div 
            className="fixed top-12 sm:top-14 lg:top-16 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50 shadow-2xl max-h-[calc(100vh-3rem)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full px-2 py-3">
              {/* Mobile Navigation Links */}
              <div className="space-y-1 mb-3">
                {navigationLinks.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-2 px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive(path) 
                        ? path === '/admin' 
                          ? 'bg-red-600 text-white shadow-lg' 
                          : path === '/statistics'
                          ? 'bg-purple-600 text-white shadow-lg'
                          : path === '/stats'
                          ? 'bg-green-600 text-white shadow-lg'
                          : 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">{label}</span>
                    {path === '/admin' && (
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        <span className="text-red-300 text-xs">ADMIN</span>
                      </div>
                    )}
                    {path === '/statistics' && (
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <span className="text-purple-300 text-xs">LIVE</span>
                      </div>
                    )}
                    {path === '/stats' && (
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-300 text-xs">PERFIL</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>

              {/* Mobile Wallet Actions */}
              {isConnected && (
                <div className="border-t border-slate-700/50 pt-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                      <div>
                        <div className="text-white font-medium text-xs">
                          {parseFloat(balance).toFixed(4)} CORE
                        </div>
                        <div className="text-gray-400 text-xxs flex items-center space-x-1">
                          <span className="truncate max-w-[120px]">{shortenAddress(account!)}</span>
                          {isOwner && (
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              <Shield className="w-3 h-3 text-red-400" />
                              <span className="text-red-400 text-xs font-bold">ADMIN</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`w-8 h-8 bg-gradient-to-br ${isOwner ? 'from-red-500 to-red-600' : 'from-blue-500 to-blue-600'} rounded-md flex items-center justify-center relative flex-shrink-0`}>
                        {isOwner ? (
                          <Shield className="w-4 h-4 text-white" />
                        ) : (
                          <Wallet className="w-4 h-4 text-white" />
                        )}
                        {isOwner && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          reconnectWallet();
                          closeMobileMenu();
                        }}
                        className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all text-xs"
                      >
                        <RefreshCw className="w-3 h-3 flex-shrink-0" />
                        <span>Refresh</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          disconnectWallet();
                          closeMobileMenu();
                        }}
                        className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-all text-xs"
                      >
                        <LogOut className="w-3 h-3 flex-shrink-0" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;