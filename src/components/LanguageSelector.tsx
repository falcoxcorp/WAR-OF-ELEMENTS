import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { languages, isRTL } from '../i18n';

interface LanguageSelectorProps {
  variant?: 'navbar' | 'footer' | 'modal';
  size?: 'sm' | 'md' | 'lg';
  showFlag?: boolean;
  showNativeName?: boolean;
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'navbar',
  size = 'md',
  showFlag = true,
  showNativeName = true,
  className = ''
}) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'px-2 py-1 text-xs',
      dropdown: 'w-48 text-xs',
      flag: 'text-sm',
      icon: 'w-3 h-3'
    },
    md: {
      button: 'px-3 py-2 text-sm',
      dropdown: 'w-56 text-sm',
      flag: 'text-base',
      icon: 'w-4 h-4'
    },
    lg: {
      button: 'px-4 py-3 text-base',
      dropdown: 'w-64 text-base',
      flag: 'text-lg',
      icon: 'w-5 h-5'
    }
  };

  const config = sizeConfig[size];

  // Variant styles
  const variantStyles = {
    navbar: 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50',
    footer: 'bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800/50 hover:border-slate-700/50',
    modal: 'bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-slate-500/50 w-full'
  };

  // Filter languages based on search
  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle language change
  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      setIsOpen(false);
      setSearchTerm('');
      
      // Update document direction for RTL languages
      const direction = isRTL(languageCode) ? 'rtl' : 'ltr';
      document.documentElement.dir = direction;
      document.documentElement.lang = languageCode;
      
      // Save preference
      localStorage.setItem('preferred-language', languageCode);
      
      // Show success notification
      const selectedLang = languages.find(lang => lang.code === languageCode);
      if (selectedLang) {
        const toast = (await import('react-hot-toast')).default;
        toast.success(`Language changed to ${selectedLang.nativeName}`, {
          icon: selectedLang.flag,
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error changing language:', error);
      const toast = (await import('react-hot-toast')).default;
      toast.error('Failed to change language');
    }
  };

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Language Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`
          ${config.button} ${variantStyles[variant]} 
          flex items-center space-x-1 sm:space-x-2 rounded-lg sm:rounded-xl font-medium transition-all duration-300
          hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:outline-none
          min-w-0 max-w-20 sm:max-w-none
          ${isOpen ? 'ring-2 ring-blue-500' : ''}
        `}
        aria-label={t('common.selectLanguage')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Globe icon for navbar, flag for others */}
        {variant === 'navbar' ? (
          <Globe className={`${config.icon} text-blue-400 flex-shrink-0`} />
        ) : showFlag ? (
          <span className={`${config.flag} flex-shrink-0`}>{currentLanguage.flag}</span>
        ) : (
          <Globe className={`${config.icon} text-blue-400 flex-shrink-0`} />
        )}
        
        {/* Language name */}
        <span className="text-white truncate min-w-0">
          {variant === 'navbar' ? (
            <span className="text-xs">{currentLanguage.code.toUpperCase()}</span>
          ) : showNativeName ? (
            currentLanguage.nativeName
          ) : (
            currentLanguage.name
          )}
        </span>
        
        {/* Dropdown arrow */}
        <ChevronDown className={`${config.icon} text-gray-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        } flex-shrink-0`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`
          absolute ${variant === 'navbar' ? 'top-full right-0 mt-1 sm:mt-2' : variant === 'modal' ? 'top-full left-0 mt-1 sm:mt-2' : 'bottom-full left-0 mb-1 sm:mb-2'}
          ${config.dropdown} max-h-80 bg-slate-900/95 backdrop-blur-xl 
          border border-slate-700/50 rounded-xl sm:rounded-2xl shadow-2xl z-50 overflow-hidden
          animate-fadeIn
        `}>
          {/* Search Input */}
          <div className="p-2 sm:p-3 border-b border-slate-700/50">
            <input
              ref={searchRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('common.searchLanguages')}
              className="w-full bg-slate-800/50 border border-slate-600/50 rounded-md sm:rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-xs sm:text-sm"
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Language List */}
          <div className="max-h-48 sm:max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
            {filteredLanguages.length > 0 ? (
              <div className="p-1 sm:p-2">
                {filteredLanguages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`
                      w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg
                      transition-all duration-200 text-left group
                      ${i18n.language === language.code
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                      }
                    `}
                    role="option"
                    aria-selected={i18n.language === language.code}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      {/* Flag */}
                      <span className="text-sm sm:text-base flex-shrink-0">
                        {language.flag}
                      </span>
                      
                      {/* Language names */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <span className="font-medium truncate text-xs sm:text-sm">
                            {language.nativeName}
                          </span>
                          {language.rtl && (
                            <span className="px-1 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded flex-shrink-0">
                              RTL
                            </span>
                          )}
                        </div>
                        <div className="text-xs opacity-75 truncate hidden sm:block">
                          {language.name}
                        </div>
                      </div>
                    </div>

                    {/* Selected indicator */}
                    {i18n.language === language.code && (
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 sm:p-4 text-center text-gray-400">
                <Globe className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs sm:text-sm">{t('common.noLanguagesFound')}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 sm:p-3 border-t border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{filteredLanguages.length} languages</span>
              <span className="flex items-center space-x-1">
                <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>Global</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;