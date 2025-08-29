import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Users, Trophy, Gamepad2, Globe, Book, ExternalLink, Code, Database, Activity, Award, Target, Crown } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = {
    platform: [
      { name: 'Games', href: '/games', internal: true },
      { name: 'Rankings', href: '/ranking', internal: true },
      { name: 'Create Game', href: '/create', internal: true },
      { name: 'Analytics', href: '/statistics', internal: true }
    ],
    resources: [
      { name: 'Documentation', href: '/game-docs', internal: true },
      { name: 'Technical Guide', href: '/tech-docs', internal: true },
      { name: 'API Reference', href: '/api-docs', internal: true },
      { name: 'Security Audit', href: '/audit', internal: true },
      { name: 'Core Blockchain', href: 'https://coredao.org', external: true }
    ],
    company: [
      { name: 'About OMDB', href: 'https://omdb.com', external: true },
      { name: 'Contact', href: 'https://omdb.com/contact', external: true },
      { name: 'Support', href: 'https://omdb.com/support', external: true },
      { name: 'Careers', href: 'https://omdb.com/careers', external: true }
    ],
    legal: [
      { name: 'Terms of Service', href: '#', internal: true },
      { name: 'Privacy Policy', href: '#', internal: true },
      { name: 'Risk Disclosure', href: '#', internal: true },
      { name: 'Compliance', href: '#', internal: true }
    ]
  };

  const platformFeatures = [
    { icon: Shield, text: 'Enterprise Security', color: 'text-blue-400' },
    { icon: Zap, text: 'High Performance', color: 'text-yellow-400' },
    { icon: Users, text: 'Global Community', color: 'text-purple-400' },
    { icon: Trophy, text: 'Competitive Gaming', color: 'text-emerald-400' }
  ];

  const renderLink = (link: any, colorClass: string) => {
    const baseClasses = `text-slate-400 hover:${colorClass} transition-colors duration-300 text-sm hover:underline flex items-center space-x-2 group`;
    
    if (link.internal) {
      return (
        <Link to={link.href} className={baseClasses}>
          <span className="truncate">{link.name}</span>
          <div className={`w-1 h-1 ${colorClass.replace('text-', 'bg-')} rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}></div>
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
          <span className="truncate">{link.name}</span>
          <ExternalLink className="w-3 h-3 opacity-50 flex-shrink-0" />
        </a>
      );
    }
  };

  return (
    <footer className="bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white relative overflow-hidden">
      {/* Sophisticated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M40 40L20 20h40v40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative">
        {/* Main Footer Content */}
        <div className="w-full px-6 lg:px-8 pt-16 pb-8">
          {/* Top Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-5">
              <Link to="/" className="flex items-center space-x-4 text-white group mb-6">
                <div className="relative">
                  <img 
                    src="https://photos.pinksale.finance/file/pinksale-logo-upload/1756454447056-1fba9df7cd0639fc2d1b4bfcbc37a6bb.png" 
                    alt="OMDB Arena" 
                    className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl shadow-xl group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div>
                  <span className="font-black text-2xl lg:text-3xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {t('game.title')}
                  </span>
                  <div className="text-sm text-slate-500 font-medium">{t('game.subtitle')}</div>
                </div>
              </Link>
              
              <p className={`text-slate-300 mb-6 leading-relaxed text-lg max-w-md ${isRTL() ? 'text-right' : 'text-left'}`}>
                {t('game.description')}
              </p>

              {/* Platform Features */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {platformFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm hover:scale-105 transition-transform duration-300">
                    <feature.icon className={`h-4 w-4 ${feature.color} flex-shrink-0`} />
                    <span className="text-slate-300">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Company Links */}
              <div>
                <h4 className={`text-lg font-bold mb-4 text-white ${isRTL() ? 'text-right' : 'text-left'}`}>{t('common.about')} OMDB</h4>
                <div className="flex space-x-4">
                  <a
                    href="https://omdb.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden flex items-center justify-center w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 hover:from-blue-600 hover:to-purple-600 rounded-xl transition-all duration-300 hover:scale-110 shadow-lg"
                    title={t('common.about') + ' OMDB'}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                    <Globe className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors relative z-10" />
                  </a>
                  
                  {/* Language Selector in Footer */}
                  <div className="ml-4">
                    <LanguageSelector variant="footer" size="sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Links Grid */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {/* Platform */}
                <div>
                  <h4 className={`text-lg font-bold mb-4 text-white flex items-center space-x-2 ${isRTL() ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Gamepad2 className="w-5 h-5 text-blue-400" />
                    <span>{t('navigation.games')}</span>
                  </h4>
                  <ul className="space-y-3">
                    {footerSections.platform.map((link, index) => (
                      <li key={index}>
                        {renderLink(link, 'text-blue-400')}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources */}
                <div>
                  <h4 className={`text-lg font-bold mb-4 text-white flex items-center space-x-2 ${isRTL() ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Book className="w-5 h-5 text-emerald-400" />
                    <span>{t('documentation.apiReference')}</span>
                  </h4>
                  <ul className="space-y-3">
                    {footerSections.resources.map((link, index) => (
                      <li key={index}>
                        {renderLink(link, 'text-emerald-400')}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Company */}
                <div>
                  <h4 className={`text-lg font-bold mb-4 text-white flex items-center space-x-2 ${isRTL() ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Globe className="w-5 h-5 text-purple-400" />
                    <span>{t('common.about')}</span>
                  </h4>
                  <ul className="space-y-3">
                    {footerSections.company.map((link, index) => (
                      <li key={index}>
                        {renderLink(link, 'text-purple-400')}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Legal */}
                <div>
                  <h4 className={`text-lg font-bold mb-4 text-white flex items-center space-x-2 ${isRTL() ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Shield className="w-5 h-5 text-orange-400" />
                    <span>{t('common.support')}</span>
                  </h4>
                  <ul className="space-y-3">
                    {footerSections.legal.map((link, index) => (
                      <li key={index}>
                        {renderLink(link, 'text-orange-400')}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mb-8 p-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className={`text-lg font-bold text-white ${isRTL() ? 'text-right' : 'text-left'}`}>{t('features.enterpriseSecurity')}</h4>
                  <p className={`text-slate-400 ${isRTL() ? 'text-right' : 'text-left'}`}>{t('features.securityDesc')}</p>
                </div>
              </div>
              <Link
                to="/audit"
                className="group relative overflow-hidden flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                <div className="relative flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>{t('documentation.securityAudit')}</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-800/50 mb-6"></div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-slate-400">
                © {currentYear} {t('game.title')}. All rights reserved.
              </p>
              <div className="flex items-center space-x-2 text-slate-400">
                <span>{t('technology.bscDesc')}</span>
                <img 
                  src="https://cryptologos.cc/logos/bnb-bnb-logo.png" 
                  alt="BNB" 
                  className="w-4 h-4 rounded-full"
                />
                <span className="font-semibold">{t('technology.bsc')}</span>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-900/50 backdrop-blur-sm px-3 py-2 rounded-full border border-slate-800/50">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-300">{t('wallet.connected')}</span>
              </div>
              
              <div className="flex items-center space-x-2 bg-slate-900/50 backdrop-blur-sm px-3 py-2 rounded-full border border-slate-800/50">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300">Chain ID: 56</span>
              </div>
            </div>
          </div>
        </div>

        {/* Elegant Bottom Border */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"></div>
      </div>
    </footer>
  );
};

export default Footer;