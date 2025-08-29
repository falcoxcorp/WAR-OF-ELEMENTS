import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useMemo } from 'react';

// Enhanced translation hook with additional utilities
export const useTranslation = (namespace?: string) => {
  const { t, i18n } = useI18nTranslation(namespace);

  // Memoized utilities for better performance
  const utils = useMemo(() => ({
    // Format currency with proper locale
    formatCurrency: (amount: number, currency: string = 'USD') => {
      return new Intl.NumberFormat(i18n.language, {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: currency.toLowerCase() === 'bnb' ? 6 : 2,
        maximumFractionDigits: currency.toLowerCase() === 'bnb' ? 6 : 2
      }).format(amount);
    },

    // Format numbers with proper locale
    formatNumber: (number: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(i18n.language, options).format(number);
    },

    // Format dates with proper locale
    formatDate: (date: Date | number, options?: Intl.DateTimeFormatOptions) => {
      const dateObj = typeof date === 'number' ? new Date(date * 1000) : date;
      return new Intl.DateTimeFormat(i18n.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options
      }).format(dateObj);
    },

    // Format relative time (e.g., "2 hours ago")
    formatRelativeTime: (timestamp: number) => {
      const now = Date.now() / 1000;
      const diff = now - timestamp;
      
      if (diff < 60) return t('time.now');
      if (diff < 3600) return t('time.minutesAgo', { count: Math.floor(diff / 60) });
      if (diff < 86400) return t('time.hoursAgo', { count: Math.floor(diff / 3600) });
      return t('time.daysAgo', { count: Math.floor(diff / 86400) });
    },

    // Format address for display
    formatAddress: (address: string, length: number = 6) => {
      if (!address || address === '0x0000000000000000000000000000000000000000') {
        return 'N/A';
      }
      return `${address.substring(0, length)}...${address.substring(address.length - 4)}`;
    },

    // Get current language info
    getCurrentLanguage: () => {
      const languages = [
        { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false },
        { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false },
        { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', rtl: false },
        { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', rtl: false },
        { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false },
        { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', rtl: false },
        { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
        { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', rtl: false },
        { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', rtl: false },
        { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', rtl: false },
        { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', rtl: false },
        { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', rtl: false }
      ];
      
      return languages.find(lang => lang.code === i18n.language) || languages[0];
    },

    // Check if current language is RTL
    isRTL: () => {
      const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
      return rtlLanguages.includes(i18n.language);
    },

    // Get game element translation with emoji
    getElementText: (elementId: number) => {
      const elements = {
        1: { name: t('game.elements.fire'), emoji: '🔥' },
        2: { name: t('game.elements.water'), emoji: '💧' },
        3: { name: t('game.elements.plant'), emoji: '🌿' }
      };
      
      const element = elements[elementId as keyof typeof elements];
      return element ? `${element.emoji} ${element.name}` : t('common.unknown');
    },

    // Get status text with proper styling
    getStatusText: (status: number) => {
      const statusMap = {
        0: t('game.status.open'),
        1: t('game.status.completed'),
        2: t('game.status.expired'),
        3: t('game.status.revealPhase')
      };
      return statusMap[status as keyof typeof statusMap] || t('common.unknown');
    },

    // Pluralization helper
    plural: (count: number, key: string) => {
      return t(key, { count });
    }
  }), [t, i18n.language]);

  return {
    t,
    i18n,
    ...utils
  };
};

export default useTranslation;