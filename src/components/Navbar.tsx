import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useWeb3 } from '../contexts/Web3Context';
import { Home, Wallet, AlertTriangle, RefreshCw, LogOut, Gamepad2, Menu, X, Shield, BarChart3, User, Settings, Crown, Activity, FileText } from 'lucide-react';

const Navbar = () => {
  const { account, connectWallet, isConnected, balance, isCorrectNetwork, switchToCore, reconnectWallet, disconnectWallet, isOwner } = useWeb3();
  const { t, formatAddress, isRTL } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const isActive = (path: string) => location.pathname === path;

  const navigationLinks = [
    { 
      path: '/', 
      label: t('navigation.home'), 
      icon: (props: any) => (
        <svg className={props.className || "w-4 h-4"} viewBox="0 0 16 16" fill="none">
          <path d="M2 14V8L8 2L14 8V14H10V10H6V14H2Z" fill="currentColor" fillOpacity="0.9"/>
          <rect x="6" y="10" width="4" height="4" fill="currentColor" fillOpacity="0.7"/>
          <rect x="7" y="6" width="2" height="2" rx="1" fill="currentColor"/>
        </svg>
      )
    },
    { 
      path: '/games', 
      label: t('navigation.games'), 
      icon: (props: any) => (
        <svg className={props.className || "w-4 h-4"} viewBox="0 0 16 16" fill="none">
          <rect x="2" y="5" width="12" height="8" rx="2" fill="currentColor" fillOpacity="0.8"/>
          <circle cx="6" cy="9" r="1.5" fill="currentColor"/>
          <circle cx="10" cy="9" r="1.5" fill="currentColor"/>
          <rect x="7" y="7" width="2" height="1" rx="0.5" fill="currentColor" fillOpacity="0.9"/>
          <path d="M4 3L6 2H10L12 3" stroke="currentColor" strokeWidth="1"/>
        </svg>
      )
    },
    { 
      path: '/statistics', 
      label: t('navigation.statistics'), 
      icon: (props: any) => (
        <svg className={props.className || "w-4 h-4"} viewBox="0 0 16 16" fill="none">
          <rect x="2" y="10" width="3" height="4" fill="currentColor" fillOpacity="0.8"/>
          <rect x="6" y="7" width="3" height="7" fill="currentColor" fillOpacity="0.9"/>
          <rect x="10" y="4" width="3" height="10" fill="currentColor"/>
          <circle cx="3.5" cy="8" r="0.5" fill="currentColor"/>
          <circle cx="7.5" cy="5" r="0.5" fill="currentColor"/>
          <circle cx="11.5" cy="2" r="0.5" fill="currentColor"/>
        </svg>
      )
    },
    { 
      path: '/stats', 
      label: t('navigation.stats'), 
      icon: (props: any) => (
        <svg className={props.className || "w-4 h-4"} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="5" r="3" fill="currentColor" fillOpacity="0.8"/>
          <path d="M2 14V13C2 10 5 9 8 9S14 10 14 13V14" fill="currentColor" fillOpacity="0.9"/>
          <circle cx="8" cy="5" r="1.5" fill="white" fillOpacity="0.7"/>
          <rect x="6" y="3" width="4" height="1" rx="0.5" fill="currentColor" fillOpacity="0.6"/>
        </svg>
      )
    }
  ];

  if (isOwner) {
    navigationLinks.push({ path: '/admin', label: t('navigation.admin'), icon: Crown });
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50 w-full">
        <div className="w-full px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 text-white group min-w-0 flex-shrink-0" onClick={closeMobileMenu}>
              <div className="relative">
                <img 
                  src="https://photos.pinksale.finance/file/pinksale-logo-upload/1756454447056-1fba9df7cd0639fc2d1b4bfcbc37a6bb.png" 
                  alt="OMDB Arena" 
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="hidden sm:block min-w-0">
                <span className="font-black text-lg lg:text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  OMDB ARENA
                </span>
                <div className="text-xs text-slate-500 -mt-1 hidden lg:block font-medium">Professional Gaming</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center space-x-2 flex-shrink-0">
              {navigationLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive(path) 
                      ? path === '/admin' 
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25' 
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{label}</span>
                  {path === '/admin' && (
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse flex-shrink-0"></div>
                  )}
                </Link>
              ))}
              
              {/* Technical Documentation Link */}
              <Link
                to="/tech-docs"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive('/tech-docs')
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <FileText className="w-5 h-5 flex-shrink-0" />
                <span className="whitespace-nowrap">Tech Docs</span>
              </Link>
            </div>

            {/* Desktop Wallet Section */}
            <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
              {/* Network Warning */}
              {isConnected && !isCorrectNetwork && (
                <button
                  onClick={switchToBSC}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 border border-red-500/50 text-red-400 rounded-xl text-sm font-semibold transition-all hover:bg-red-600/30 animate-pulse"
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{t('wallet.switchNetwork')}</span>
                </button>
              )}

              {/* Wallet Display */}
              {isConnected ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-white text-sm font-bold">
                      {parseFloat(balance).toFixed(3)} {t('currency.bnb')}
                    </div>
                    <div className="text-slate-400 text-xs flex items-center space-x-2">
                      <span>{formatAddress(account!)}</span>
                      {isOwner && (
                        <div className="flex items-center space-x-1">
                          <Crown className="w-3 h-3 text-yellow-400" />
                          <span className="text-yellow-400 text-xs font-bold">{t('navigation.admin').toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={reconnectWallet}
                      className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-all"
                      title="Refresh Connection"
                    >
                      <span>{t('common.refresh')}</span>
                    </button>
                    
                    <button
                      onClick={disconnectWallet}
                      className="w-8 h-8 bg-red-600/20 hover:bg-red-600/30 rounded-lg flex items-center justify-center transition-all"
                      title="Disconnect"
                    >
                      <span>{t('wallet.disconnect')}</span>
                    </button>
                    
                    <div className={`w-10 h-10 bg-gradient-to-br ${isOwner ? 'from-yellow-500 to-orange-600' : 'from-blue-500 to-purple-600'} rounded-xl flex items-center justify-center relative shadow-lg`}>
                      {isOwner ? (
                        <Crown className="w-5 h-5 text-white" />
                      ) : (
                        <Wallet className="w-5 h-5 text-white" />
                      )}
                      {isOwner && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="group relative overflow-hidden flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                  <div className="relative flex items-center space-x-2">
                    <Wallet className="w-4 h-4 flex-shrink-0" />
                    <span>Connect Wallet</span>
                  </div>
                </button>
              )}
            </div>

            {/* Mobile Section */}
            <div className="flex lg:hidden items-center space-x-2 flex-shrink-0">
              {/* Mobile Network Warning */}
              {isConnected && !isCorrectNetwork && (
                <button
                  onClick={switchToBSC}
                  className="flex items-center space-x-1 px-2 py-1 bg-red-600/20 border border-red-500/50 text-red-400 rounded-lg text-xs font-medium transition-all hover:bg-red-600/30 animate-pulse"
                >
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  <span className="hidden sm:inline">Switch</span>
                </button>
              )}

              {/* Mobile Wallet */}
              {isConnected ? (
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-white text-sm font-bold">
                      {parseFloat(balance).toFixed(2)} BNB
                    </div>
                    <div className="text-slate-400 text-xs flex items-center space-x-1">
                      <span>{shortenAddress(account!)}</span>
                      {isOwner && <Crown className="w-3 h-3 text-yellow-400" />}
                    </div>
                  </div>
                  <div className={`w-8 h-8 bg-gradient-to-br ${isOwner ? 'from-yellow-500 to-orange-600' : 'from-blue-500 to-purple-600'} rounded-lg flex items-center justify-center relative`}>
                    {isOwner ? (
                      <Crown className="w-4 h-4 text-white" />
                    ) : (
                      <Wallet className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="group relative overflow-hidden flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-semibold transition-all"
                >
                  <Wallet className="w-4 h-4 flex-shrink-0" />
                  <span>Connect</span>
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-all xl:hidden"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Network Warning Banner */}
        {isConnected && !isCorrectNetwork && (
          <div className="lg:hidden bg-red-600/20 border-t border-red-500/50 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Wrong Network - Switch to BSC</span>
              </div>
              <button
                onClick={switchToBSC}
                className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-medium"
              >
                Switch
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden" onClick={closeMobileMenu}>
          <div 
            className="fixed top-16 lg:top-18 left-0 right-0 bg-slate-950/98 backdrop-blur-xl border-b border-slate-800/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full px-4 py-6">
              {/* Mobile Navigation Links */}
              <div className="space-y-2 mb-6">
                {navigationLinks.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive(path) 
                        ? path === '/admin' 
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg' 
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{label}</span>
                    {path === '/admin' && (
                      <div className="flex items-center space-x-2 ml-auto">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        <span className="text-red-300 text-xs">ADMIN</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>

              {/* Mobile Wallet Actions */}
              {isConnected && (
                <div className="border-t border-slate-800/50 pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                      <div>
                        <div className="text-white font-bold">
                          {parseFloat(balance).toFixed(4)} CORE
                        </div>
                        <div className="text-slate-400 text-sm flex items-center space-x-2">
                          <span>{shortenAddress(account!)}</span>
                          {isOwner && (
                            <div className="flex items-center space-x-1">
                              <Crown className="w-4 h-4 text-yellow-400" />
                              <span className="text-yellow-400 text-xs font-bold">ADMIN</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`w-12 h-12 bg-gradient-to-br ${isOwner ? 'from-yellow-500 to-orange-600' : 'from-blue-500 to-purple-600'} rounded-xl flex items-center justify-center relative shadow-lg`}>
                        {isOwner ? (
                          <Crown className="w-6 h-6 text-white" />
                        ) : (
                          <Wallet className="w-6 h-6 text-white" />
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          reconnectWallet();
                          closeMobileMenu();
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          disconnectWallet();
                          closeMobileMenu();
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl font-semibold transition-all"
                      >
                        <LogOut className="w-4 h-4" />
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