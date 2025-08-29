import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Zap, Users, Trophy, Gamepad2, MessageCircle, Twitter, FileCheck, ExternalLink, Globe, Book } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: 'Games', href: '/games', internal: true },
      { name: 'Ranking', href: '/ranking', internal: true },
      { name: 'Create Game', href: '/create', internal: true },
      { name: 'Player Stats', href: '/stats', internal: true }
    ],
    community: [
      { 
        name: 'Telegram', 
        href: 'https://t.me/Falco_X_CORP', 
        external: true,
        icon: MessageCircle
      },
      { 
        name: 'Twitter', 
        href: 'https://x.com/FalcoX_Corp/', 
        external: true,
        icon: Twitter
      }
    ],
    resources: [
      { name: 'Game Documentation', href: '/game-docs', internal: true },
      { name: 'Core Blockchain', href: 'https://coredao.org', external: true },
      { name: 'Block Explorer', href: 'https://scan.coredao.org', external: true },
      { name: 'Security Audit', href: '/audit', internal: true }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#', internal: true },
      { name: 'Terms of Service', href: '#', internal: true },
      { name: 'Cookie Policy', href: '#', internal: true },
      { name: 'Disclaimer', href: '#', internal: true }
    ]
  };

  const features = [
    { icon: Shield, text: 'Secure & Decentralized' },
    { icon: Zap, text: 'Lightning Fast' },
    { icon: Users, text: 'Community Driven' },
    { icon: Trophy, text: 'Competitive Gaming' }
  ];

  const renderLink = (link: any, colorClass: string) => {
    const baseClasses = `text-gray-400 hover:${colorClass} transition-colors duration-200 text-xs sm:text-sm hover:underline flex items-center space-x-1 sm:space-x-2 group`;
    const dotClass = `w-1 h-1 ${colorClass.replace('text-', 'bg-')} rounded-full opacity-0 group-hover:opacity-100 transition-opacity`;
    
    if (link.internal) {
      return (
        <Link to={link.href} className={baseClasses}>
          <span className={dotClass}></span>
          <span className="truncate">{link.name}</span>
        </Link>
      );
    } else {
      return (
        <a 
          href={link.href}
          className={baseClasses}
          target="_blank" 
          rel="noopener noreferrer"
        >
          <span className={dotClass}></span>
          <span className="truncate">{link.name}</span>
          <ExternalLink className="w-3 h-3 opacity-50 flex-shrink-0" />
        </a>
      );
    }
  };

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative">
        {/* Main Footer Content */}
        <div className="w-full px-2 sm:px-4 lg:px-6 pt-6 sm:pt-8 lg:pt-12 pb-3 sm:pb-4 lg:pb-6">
          {/* Top Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
            {/* Brand Section */}
            <div className="lg:col-span-4">
              <Link to="/" className="flex items-center space-x-1 sm:space-x-2 text-white group" onClick={() => {}}>
                <div className="relative">
                  <img 
                    src="https://photos.pinksale.finance/file/pinksale-logo-upload/1754331659815-8a6a69a354540d190c6907808067d1f2.png" 
                    alt="RPS Arena Logo" 
                    className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-md sm:rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-md sm:rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div>
                  <span className="font-bold text-sm sm:text-base lg:text-lg bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                    War of Elements
                  </span>
                  <div className="text-xs text-gray-400 -mt-1 hidden lg:block">Powered by Core Blockchain</div>
                </div>
              </Link>
              
              <p className="text-gray-300 mb-2 sm:mb-4 leading-relaxed text-xs sm:text-sm mt-2">
                The ultimate War of Elements gaming platform built on Core blockchain. 
                Create, play, and compete in a secure, transparent gaming ecosystem with real CORE token rewards.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-1 sm:gap-2 mb-2 sm:mb-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-1 text-xs text-gray-300 hover:text-white transition-colors">
                    <feature.icon className="h-3 w-3 text-orange-400 flex-shrink-0" />
                    <span className="truncate">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Social Media Links */}
              <div>
                <h4 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 text-white">Join Our Community</h4>
                <div className="flex space-x-2 sm:space-x-3">
                  {footerLinks.community.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-orange-500 hover:to-orange-600 rounded-md sm:rounded-lg transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-orange-500/25"
                      title={`Follow us on ${social.name}`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                      <social.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-white transition-colors relative z-10" />
                    </a>
                  ))}
                </div>
                <p className="text-gray-400 text-xs mt-1 sm:mt-2">
                  Follow us for updates, tournaments, and community events!
                </p>
              </div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {/* Platform Links */}
                <div>
                  <h4 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 text-white flex items-center space-x-1">
                    <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
                    <span>Platform</span>
                  </h4>
                  <ul className="space-y-1 sm:space-y-2">
                    {footerLinks.platform.map((link, index) => (
                      <li key={index}>
                        {renderLink(link, 'text-orange-400')}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources Links */}
                <div>
                  <h4 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 text-white flex items-center space-x-1">
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                    <span>Resources</span>
                  </h4>
                  <ul className="space-y-1 sm:space-y-2">
                    {footerLinks.resources.map((link, index) => (
                      <li key={index}>
                        {renderLink(link, 'text-green-400')}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Legal Links */}
                <div>
                  <h4 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 text-white flex items-center space-x-1">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                    <span>Legal</span>
                  </h4>
                  <ul className="space-y-1 sm:space-y-2">
                    {footerLinks.legal.map((link, index) => (
                      <li key={index}>
                        {renderLink(link, 'text-purple-400')}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Documentation Button */}
          <div className="mb-4 sm:mb-6 lg:mb-8 p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg sm:rounded-xl">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2 md:mb-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md sm:rounded-lg flex items-center justify-center">
                  <Book className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">Game Documentation</h4>
                  <p className="text-gray-300 text-xs">Learn everything about Guerra de Elementos Arena</p>
                </div>
              </div>
              <Link
                to="/game-docs"
                className="group relative overflow-hidden flex items-center space-x-1 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-md sm:rounded-lg font-medium transition-all hover:scale-105 shadow-lg text-xs sm:text-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                <div className="relative flex items-center space-x-1">
                  <Book className="w-3 h-3 flex-shrink-0" />
                  <span>View Documentation</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Security & Audit Section */}
          <div className="mb-4 sm:mb-6 lg:mb-8 p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg sm:rounded-xl">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2 md:mb-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-md sm:rounded-lg flex items-center justify-center">
                  <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">Professional Security Audit</h4>
                  <p className="text-gray-300 text-xs">Audited and verified for your safety</p>
                </div>
              </div>
              <Link
                to="/audit"
                className="group relative overflow-hidden flex items-center space-x-1 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-md sm:rounded-lg font-medium transition-all hover:scale-105 shadow-lg text-xs sm:text-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                <div className="relative flex items-center space-x-1">
                  <Shield className="w-3 h-3 flex-shrink-0" />
                  <span>View Audit Report</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gradient-to-r from-transparent via-slate-700 to-transparent mb-3 sm:mb-4"></div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 sm:space-x-6">
              <p className="text-gray-400 text-xs">
                © {currentYear} War of Elements Arena. All rights reserved.
              </p>
              <div className="flex items-center space-x-1 text-gray-400 text-xs">
                <span>Made with</span>
                <Heart className="h-3 w-3 text-red-500 fill-current animate-pulse" />
                <span>for the Core gaming community</span>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center space-x-1 bg-slate-800/50 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full border border-slate-700/50">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-300 whitespace-nowrap">Core Network Active</span>
              </div>
              
              <div className="flex items-center space-x-1 bg-slate-800/50 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full border border-slate-700/50">
                <img 
                  src="https://photos.pinksale.finance/file/pinksale-logo-upload/1754331659815-8a6a69a354540d190c6907808067d1f2.png" 
                  alt="CORE" 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                />
                <span className="text-xs text-gray-300 whitespace-nowrap">Chain ID: 1116</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gradient Border */}
        <div className="h-1 bg-gradient-to-r from-orange-500 via-red-500 to-purple-500"></div>
      </div>
    </footer>
  );
};

export default Footer;