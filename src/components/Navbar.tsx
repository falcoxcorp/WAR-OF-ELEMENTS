import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSelector from './LanguageSelector';
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
        <div className="w-full px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18 gap-2">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 text-white group min-w-0 flex-shrink-0" onClick={closeMobileMenu}>
              <div className="relative">
                <img 
                  src="https://photos.pinksale.finance/file/pinksale-logo-upload/1756454447056-1fba9df7cd0639fc2d1b4bfcbc37a6bb.png" 
                  alt="OMDB Arena" 
                  className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="hidden xs:block min-w-0">
                <span className="font-black text-sm sm:text-lg lg:text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent truncate">
                  OMDB ARENA
                </span>
                <div className="text-xs text-slate-500 -mt-1 hidden sm:block font-medium truncate">Professional Gaming</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2 flex-shrink-0">
              {navigationLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-1 xl:space-x-2 px-2 xl:px-4 py-2 rounded-lg xl:rounded-xl text-xs xl:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                    isActive(path) 
                      ? path === '/admin' 
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25' 
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4 xl:w-5 xl:h-5 flex-shrink-0" />
                  <span className="hidden xl:inline">{label}</span>
                  {path === '/admin' && (
                    <div className="w-1.5 h-1.5 xl:w-2 xl:h-2 bg-red-400 rounded-full animate-pulse flex-shrink-0"></div>
                  )}
                </Link>
              ))}
              
              {/* Technical Documentation Link */}
              <Link
                to="/tech-docs"
                className={`flex items-center space-x-1 xl:space-x-2 px-2 xl:px-4 py-2 rounded-lg xl:rounded-xl text-xs xl:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                  isActive('/tech-docs')
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <FileText className="w-4 h-4 xl:w-5 xl:h-5 flex-shrink-0" />
                <span className="hidden xl:inline">Tech Docs</span>
              </Link>
              
              {/* Desktop Language Selector */}
              <div className="ml-1 xl:ml-2">
                <LanguageSelector variant="navbar" size="sm" />
              </div>
            </div>

            {/* Desktop Wallet Section */}
            <div className="hidden lg:flex items-center space-x-2 xl:space-x-3 flex-shrink-0 min-w-0">
              {/* Network Warning */}
              {isConnected && !isCorrectNetwork && (
                <button
                  onClick={switchToCore}
                  className="flex items-center space-x-1 xl:space-x-2 px-2 xl:px-4 py-2 bg-red-600/20 border border-red-500/50 text-red-400 rounded-lg xl:rounded-xl text-xs xl:text-sm font-semibold transition-all hover:bg-red-600/30 animate-pulse whitespace-nowrap"
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xl:inline">{t('wallet.switchNetwork')}</span>
                  <span className="xl:hidden">Switch</span>
                </button>
              )}

              {/* Wallet Display */}
              {isConnected ? (
                <div className="flex items-center space-x-2 xl:space-x-3 min-w-0">
                  <div className="text-right min-w-0">
                    <div className="text-white text-xs xl:text-sm font-bold truncate">
                      {parseFloat(balance).toFixed(2)} BNB
                    </div>
                    <div className="text-slate-400 text-xs flex items-center space-x-1 xl:space-x-2">
                      <span className="truncate max-w-20 xl:max-w-none">{shortenAddress(account!)}</span>
                      {isOwner && (
                        <div className="flex items-center space-x-0.5 xl:space-x-1">
                          <Crown className="w-2.5 h-2.5 xl:w-3 xl:h-3 text-yellow-400 flex-shrink-0" />
                          <span className="text-yellow-400 text-xs font-bold hidden xl:inline">ADMIN</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 xl:space-x-2">
                    <button
                      onClick={reconnectWallet}
                      className="w-6 h-6 xl:w-8 xl:h-8 bg-slate-800 hover:bg-slate-700 rounded-md xl:rounded-lg flex items-center justify-center transition-all"
                      title="Refresh Connection"
                    >
                      <RefreshCw className="w-3 h-3 xl:w-4 xl:h-4 text-slate-400" />
                    </button>
                    
                    <button
                      onClick={disconnectWallet}
                      className="w-6 h-6 xl:w-8 xl:h-8 bg-red-600/20 hover:bg-red-600/30 rounded-md xl:rounded-lg flex items-center justify-center transition-all"
                      title="Disconnect"
                    >
                      <LogOut className="w-3 h-3 xl:w-4 xl:h-4 text-red-400" />
                    </button>
                    
                    <div className={`w-8 h-8 xl:w-10 xl:h-10 bg-gradient-to-br ${isOwner ? 'from-yellow-500 to-orange-600' : 'from-blue-500 to-purple-600'} rounded-lg xl:rounded-xl flex items-center justify-center relative shadow-lg flex-shrink-0`}>
                      {isOwner ? (
                        <Crown className="w-4 h-4 xl:w-5 xl:h-5 text-white" />
                      ) : (
                        <Wallet className="w-4 h-4 xl:w-5 xl:h-5 text-white" />
                      )}
                      {isOwner && (
                        <div className="absolute -top-0.5 -right-0.5 xl:-top-1 xl:-right-1 w-2 h-2 xl:w-3 xl:h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="group relative overflow-hidden flex items-center space-x-1 xl:space-x-2 px-3 xl:px-6 py-2 xl:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg xl:rounded-xl font-semibold transition-all hover:scale-105 shadow-lg text-xs xl:text-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                  <div className="relative flex items-center space-x-1 xl:space-x-2">
                    <Wallet className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Connect</span>
                    <span className="xl:hidden sm:hidden">💳</span>
                  </div>
                </button>
              )}
            </div>

            {/* Mobile Section */}
            <div className="flex lg:hidden items-center space-x-1 sm:space-x-2 flex-shrink-0 min-w-0">
              {/* Mobile Language Selector */}
              <div className="flex items-center flex-shrink-0">
                <LanguageSelector variant="navbar" size="sm" />
              </div>
              
              {/* Mobile Network Warning */}
              {isConnected && !isCorrectNetwork && (
                <button
                  onClick={switchToCore}
                  className="flex items-center space-x-1 px-1.5 sm:px-2 py-1 bg-red-600/20 border border-red-500/50 text-red-400 rounded-md sm:rounded-lg text-xs font-medium transition-all hover:bg-red-600/30 animate-pulse flex-shrink-0"
                >
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  <span className="hidden xs:inline text-xs">BSC</span>
                </button>
              )}

              {/* Mobile Wallet */}
              {isConnected ? (
                <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                  <div className="text-right min-w-0">
                    <div className="text-white text-xs sm:text-sm font-bold truncate">
                      {parseFloat(balance).toFixed(1)} BNB
                    </div>
                    <div className="text-slate-400 text-xs flex items-center space-x-0.5 sm:space-x-1">
                      <span className="truncate max-w-16 sm:max-w-20">{shortenAddress(account!)}</span>
                      {isOwner && <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400 flex-shrink-0" />}
                    </div>
                  </div>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br ${isOwner ? 'from-yellow-500 to-orange-600' : 'from-blue-500 to-purple-600'} rounded-lg flex items-center justify-center relative flex-shrink-0`}>
                    {isOwner ? (
                      <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    ) : (
                      <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    )}
                    {isOwner && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="group relative overflow-hidden flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all flex-shrink-0"
                >
                  <Wallet className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden xs:inline">Connect</span>
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-800 hover:bg-slate-700 rounded-md sm:rounded-lg flex items-center justify-center transition-all lg:hidden flex-shrink-0"
              >
                {isMobileMenuOpen ? (
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                ) : (
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Network Warning Banner */}
        {isConnected && !isCorrectNetwork && (
          <div className="lg:hidden bg-red-600/20 border-t border-red-500/50 px-2 sm:px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Wrong Network - Switch to BSC</span>
              </div>
              <button
                onClick={switchToCore}
                className="px-2 sm:px-3 py-1 bg-red-600 text-white rounded-md sm:rounded-lg text-xs sm:text-sm font-medium"
              >
                Switch
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={closeMobileMenu}>
          <div 
            className="fixed top-14 sm:top-16 lg:top-18 left-0 right-0 bg-slate-950/98 backdrop-blur-xl border-b border-slate-800/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full px-3 sm:px-4 py-4 sm:py-6">
              {/* Mobile Navigation Links */}
              <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
                {navigationLinks.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm font-semibold transition-all ${
                      isActive(path) 
                        ? path === '/admin' 
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg' 
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>{label}</span>
                    {path === '/admin' && (
                      <div className="flex items-center space-x-1 sm:space-x-2 ml-auto">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        <span className="text-red-300 text-xs hidden sm:inline">ADMIN</span>
                      </div>
                    )}
                  </Link>
                ))}
                
                {/* Mobile Language Selector in Menu */}
                <div className="px-3 sm:px-4 py-2 sm:py-3">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    <span className="text-white font-semibold">Language / Idioma</span>
                  </div>
                  <LanguageSelector variant="modal" size="md" showNativeName={true} />
                </div>
              </div>

              {/* Mobile Wallet Actions */}
              {isConnected && (
                <div className="border-t border-slate-800/50 pt-3 sm:pt-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-900/50 rounded-lg sm:rounded-xl">
                      <div>
                        <div className="text-white font-bold text-sm sm:text-base">
                          {parseFloat(balance).toFixed(3)} BNB
                        </div>
                        <div className="text-slate-400 text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2">
                          <span>{shortenAddress(account!)}</span>
                          {isOwner && (
                            <div className="flex items-center space-x-0.5 sm:space-x-1">
                              <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                              <span className="text-yellow-400 text-xs font-bold hidden sm:inline">ADMIN</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${isOwner ? 'from-yellow-500 to-orange-600' : 'from-blue-500 to-purple-600'} rounded-lg sm:rounded-xl flex items-center justify-center relative shadow-lg flex-shrink-0`}>
                        {isOwner ? (
                          <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        ) : (
                          <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        )}
                        {isOwner && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 sm:space-x-3">
                      <button
                        onClick={() => {
                          reconnectWallet();
                          closeMobileMenu();
                        }}
                        className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg sm:rounded-xl font-semibold transition-all text-xs sm:text-sm"
                      >
                        <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Refresh</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          disconnectWallet();
                          closeMobileMenu();
                        }}
                        className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg sm:rounded-xl font-semibold transition-all text-xs sm:text-sm"
                      >
                        <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
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