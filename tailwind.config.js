/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
        'xxs': '320px',
        'xxs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
        // Professional breakpoints
        'mobile': {'max': '479px'},
        'tablet': {'min': '640px', 'max': '1023px'},
        'desktop': {'min': '1024px'},
        'ultrawide': {'min': '1920px'},
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
        '192': '48rem',
      },
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '0.875rem' }],
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        '7xl': ['4.5rem', { lineHeight: '1.1' }],
        '8xl': ['6rem', { lineHeight: '1.1' }],
        '9xl': ['8rem', { lineHeight: '1.1' }],
        '10xl': ['10rem', { lineHeight: '1.1' }],
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontWeight: {
        'medium': '500',
        'semibold': '600',
        'bold': '700',
        'extrabold': '800',
        'black': '900',
      },
      lineHeight: {
        '12': '3rem',
        '14': '3.5rem',
        '16': '4rem',
        'tight': '1.1',
        'snug': '1.2',
        'normal': '1.5',
        'relaxed': '1.6',
        'loose': '1.8',
      },
      letterSpacing: {
        'tighter': '-0.05em',
        'tight': '-0.025em',
        'normal': '0',
        'wide': '0.025em',
        'wider': '0.05em',
        'widest': '0.1em',
      },
      maxWidth: {
        'xxs': '16rem',
        '8xl': '88rem',
        '9xl': '96rem',
        '10xl': '104rem',
        'screen-2xl': '1536px',
      },
      minWidth: {
        '0': '0',
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
        'full': '100%',
      },
      maxHeight: {
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
        'screen-1/2': '50vh',
        'screen-3/4': '75vh',
        'screen-9/10': '90vh',
      },
      minHeight: {
        '0': '0',
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
        'full': '100%',
        'screen': '100vh',
        'screen-1/2': '50vh',
        'screen-3/4': '75vh',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'fade-in': 'fadeIn 0.8s ease-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'fade-in-down': 'fadeInDown 0.8s ease-out',
        'slide-in-left': 'slideInLeft 0.8s ease-out',
        'slide-in-right': 'slideInRight 0.8s ease-out',
        'scale-in': 'scaleIn 0.6s ease-out',
        'shimmer': 'shimmer 3s infinite',
        'glow': 'glow 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'elegant-pulse': 'elegantPulse 4s ease-in-out infinite',
        'sophisticated-glow': 'sophisticatedGlow 3s ease-in-out infinite',
        'premium-float': 'premiumFloat 8s ease-in-out infinite',
        'luxury-shimmer': 'luxuryShimmer 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        elegantPulse: {
          '0%, 100%': { 
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': { 
            opacity: '0.8',
            transform: 'scale(1.05)',
          },
        },
        sophisticatedGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)',
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.3)',
          },
        },
        premiumFloat: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-8px) rotate(1deg)' },
          '66%': { transform: 'translateY(-4px) rotate(-1deg)' },
        },
        luxuryShimmer: {
          '0%': { 
            transform: 'translateX(-100%) skewX(-15deg)',
            opacity: '0',
          },
          '50%': { 
            opacity: '1',
          },
          '100%': { 
            transform: 'translateX(200%) skewX(-15deg)',
            opacity: '0',
          },
        },
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
      },
      backdropSaturate: {
        '0': '0',
        '50': '.5',
        '75': '.75',
        '100': '1',
        '125': '1.25',
        '150': '1.5',
        '200': '2',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-lg': '0 0 30px rgba(59, 130, 246, 0.7)',
        'glow-xl': '0 0 40px rgba(59, 130, 246, 0.8)',
        'executive': '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 8px 16px -4px rgba(0, 0, 0, 0.1)',
        'premium': '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        'luxury': '0 4px 16px rgba(0, 0, 0, 0.25)',
        'elegant': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      gradientColorStops: {
        'primary': '#3b82f6',
        'secondary': '#8b5cf6',
        'accent': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'success': '#10b981',
        'info': '#06b6d4',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
        'opacity': 'opacity',
        'shadow': 'box-shadow',
        'transform': 'transform',
        'filter': 'filter',
        'backdrop': 'backdrop-filter',
        'all': 'all',
      },
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
        '2000': '2000ms',
        '3000': '3000ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'bounce-out': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'executive': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'premium': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'luxury': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
        '21/9': '21 / 9',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
          xl: '3rem',
          '2xl': '4rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
      colors: {
        // Professional color palette
        'executive': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        'premium': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        'luxury': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
      },
    },
  },
  plugins: [
    // Professional utility plugin
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Professional text utilities
        '.text-executive': {
          fontSize: theme('fontSize.lg'),
          lineHeight: theme('lineHeight.relaxed'),
          fontWeight: theme('fontWeight.medium'),
          color: theme('colors.slate.300'),
        },
        '.text-premium': {
          fontSize: theme('fontSize.base'),
          lineHeight: theme('lineHeight.normal'),
          fontWeight: theme('fontWeight.normal'),
          color: theme('colors.slate.400'),
        },
        '.text-luxury': {
          fontSize: theme('fontSize.sm'),
          lineHeight: theme('lineHeight.snug'),
          fontWeight: theme('fontWeight.medium'),
          color: theme('colors.slate.500'),
        },
        // Professional spacing utilities
        '.space-executive': {
          gap: theme('spacing.8'),
        },
        '.space-premium': {
          gap: theme('spacing.6'),
        },
        '.space-luxury': {
          gap: theme('spacing.4'),
        },
        // Professional padding utilities
        '.padding-executive': {
          padding: theme('spacing.8'),
          '@media (min-width: 640px)': {
            padding: theme('spacing.12'),
          },
          '@media (min-width: 1024px)': {
            padding: theme('spacing.16'),
          },
        },
        '.padding-premium': {
          padding: theme('spacing.6'),
          '@media (min-width: 640px)': {
            padding: theme('spacing.8'),
          },
          '@media (min-width: 1024px)': {
            padding: theme('spacing.12'),
          },
        },
        '.padding-luxury': {
          padding: theme('spacing.4'),
          '@media (min-width: 640px)': {
            padding: theme('spacing.6'),
          },
          '@media (min-width: 1024px)': {
            padding: theme('spacing.8'),
          },
        },
        // Professional container utilities
        '.container-executive': {
          width: '100%',
          maxWidth: '1400px',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('spacing.6'),
          paddingRight: theme('spacing.6'),
          '@media (min-width: 640px)': {
            paddingLeft: theme('spacing.8'),
            paddingRight: theme('spacing.8'),
          },
          '@media (min-width: 1024px)': {
            paddingLeft: theme('spacing.12'),
            paddingRight: theme('spacing.12'),
          },
          '@media (min-width: 1280px)': {
            paddingLeft: theme('spacing.16'),
            paddingRight: theme('spacing.16'),
          },
        },
        '.container-premium': {
          width: '100%',
          maxWidth: '1200px',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
          '@media (min-width: 640px)': {
            paddingLeft: theme('spacing.6'),
            paddingRight: theme('spacing.6'),
          },
          '@media (min-width: 1024px)': {
            paddingLeft: theme('spacing.8'),
            paddingRight: theme('spacing.8'),
          },
        },
        // Professional grid utilities
        '.grid-executive': {
          display: 'grid',
          gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
          gap: theme('spacing.8'),
          '@media (min-width: 768px)': {
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          },
          '@media (min-width: 1024px)': {
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          },
          '@media (min-width: 1280px)': {
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          },
        },
        '.grid-premium': {
          display: 'grid',
          gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
          gap: theme('spacing.6'),
          '@media (min-width: 640px)': {
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          },
          '@media (min-width: 1024px)': {
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          },
        },
        // Professional flex utilities
        '.flex-executive': {
          display: 'flex',
          flexDirection: 'column',
          gap: theme('spacing.6'),
          '@media (min-width: 768px)': {
            flexDirection: 'row',
            gap: theme('spacing.8'),
          },
        },
        '.flex-premium': {
          display: 'flex',
          flexDirection: 'column',
          gap: theme('spacing.4'),
          '@media (min-width: 640px)': {
            flexDirection: 'row',
            gap: theme('spacing.6'),
          },
        },
        // Professional card utilities
        '.card-executive': {
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6))',
          backdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(148, 163, 184, 0.12)',
          borderRadius: theme('borderRadius.2xl'),
          padding: theme('spacing.8'),
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.card-premium': {
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          borderRadius: theme('borderRadius.xl'),
          padding: theme('spacing.6'),
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.card-luxury': {
          background: 'rgba(51, 65, 85, 0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: theme('borderRadius.lg'),
          padding: theme('spacing.4'),
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          transition: 'all 0.3s ease',
        },
        // Professional button utilities
        '.btn-executive': {
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: theme('borderRadius.xl'),
          padding: `${theme('spacing.4')} ${theme('spacing.8')}`,
          fontSize: theme('fontSize.base'),
          fontWeight: theme('fontWeight.semibold'),
          color: theme('colors.white'),
          boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
        },
        '.btn-premium': {
          background: 'rgba(51, 65, 85, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.25)',
          borderRadius: theme('borderRadius.lg'),
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          fontSize: theme('fontSize.sm'),
          fontWeight: theme('fontWeight.medium'),
          color: theme('colors.slate.300'),
          backdropFilter: 'blur(12px)',
          transition: 'all 0.3s ease',
        },
        // Professional responsive utilities
        '.responsive-executive': {
          fontSize: theme('fontSize.sm'),
          padding: theme('spacing.2'),
          '@media (min-width: 640px)': {
            fontSize: theme('fontSize.base'),
            padding: theme('spacing.4'),
          },
          '@media (min-width: 1024px)': {
            fontSize: theme('fontSize.lg'),
            padding: theme('spacing.6'),
          },
        },
        // Professional modal utilities
        '.modal-executive': {
          position: 'fixed',
          inset: '0',
          zIndex: theme('zIndex.50'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme('spacing.4'),
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(12px)',
        },
        '.modal-content-executive': {
          width: '100%',
          maxWidth: theme('maxWidth.lg'),
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: theme('borderRadius.2xl'),
          padding: theme('spacing.8'),
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        },
      };

      addUtilities(newUtilities);
    },
  ],
};