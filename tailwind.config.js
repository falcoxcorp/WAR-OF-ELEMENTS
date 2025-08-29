/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
        'xxs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Custom breakpoints for better responsiveness
        'mobile': {'max': '479px'},
        'mobile-sm': {'max': '374px'},
        'tablet': {'min': '640px', 'max': '1023px'},
        'desktop': {'min': '1024px'},
        // Height-based breakpoints
        'h-sm': {'raw': '(max-height: 640px)'},
        'h-md': {'raw': '(min-height: 641px) and (max-height: 900px)'},
        'h-lg': {'raw': '(min-height: 901px)'},
        // Ultra-small devices
        'ultra-mobile': {'max': '320px'},
      },
      spacing: {
        '0.25': '0.0625rem', // 1px
        '0.75': '0.1875rem', // 3px
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      fontSize: {
        'xxs': '0.625rem', // 10px
        'xxs': '0.625rem',
        '2xs': '0.6875rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem',
        '9xl': '8rem',
        // Responsive font sizes
        'responsive-xs': ['0.75rem', { lineHeight: '1rem' }],
        'responsive-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'responsive-base': ['1rem', { lineHeight: '1.5rem' }],
        'responsive-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'responsive-xl': ['1.25rem', { lineHeight: '1.75rem' }],
        'responsive-2xl': ['1.5rem', { lineHeight: '2rem' }],
        'responsive-3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        'responsive-4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        'responsive-5xl': ['3rem', { lineHeight: '1' }],
        'responsive-6xl': ['3.75rem', { lineHeight: '1' }],
      },
      maxWidth: {
        'mobile': '100vw',
        'mobile-safe': 'calc(100vw - 1rem)',
      },
      minWidth: {
        'mobile': '320px',
        'mobile-safe': '280px',
      },
      lineHeight: {
        '12': '3rem',
        '14': '3.5rem',
        '16': '4rem',
      },
      maxWidth: {
        'xxs': '16rem',
        '8xl': '88rem',
        '9xl': '96rem',
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
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'fade-in-down': 'fadeInDown 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
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
        'colored': '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      gradientColorStops: {
        'primary': '#3b82f6',
        'secondary': '#8b5cf6',
        'accent': '#f59e0b',
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
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
      },
      transitionDuration: {
        '0': '0ms',
        '2000': '2000ms',
        '3000': '3000ms',
        '4000': '4000ms',
        '5000': '5000ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'bounce-out': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
          xl: '2.5rem',
          '2xl': '3rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
    },
  },
  plugins: [
    // Custom plugin for responsive utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Responsive text utilities
        '.text-responsive': {
          fontSize: theme('fontSize.sm'),
          lineHeight: theme('lineHeight.5'),
          '@media (min-width: 640px)': {
            fontSize: theme('fontSize.base'),
            lineHeight: theme('lineHeight.6'),
          },
          '@media (min-width: 1024px)': {
            fontSize: theme('fontSize.lg'),
            lineHeight: theme('lineHeight.7'),
          },
        },
        '.text-responsive-heading': {
          fontSize: theme('fontSize.xl'),
          lineHeight: theme('lineHeight.7'),
          '@media (min-width: 640px)': {
            fontSize: theme('fontSize.2xl'),
            lineHeight: theme('lineHeight.8'),
          },
          '@media (min-width: 1024px)': {
            fontSize: theme('fontSize.3xl'),
            lineHeight: theme('lineHeight.9'),
          },
        },
        '.text-responsive-title': {
          fontSize: theme('fontSize.2xl'),
          lineHeight: theme('lineHeight.8'),
          '@media (min-width: 640px)': {
            fontSize: theme('fontSize.4xl'),
            lineHeight: theme('lineHeight.10'),
          },
          '@media (min-width: 1024px)': {
            fontSize: theme('fontSize.6xl'),
            lineHeight: theme('lineHeight.none'),
          },
        },
        // Responsive spacing utilities
        '.space-responsive': {
          gap: theme('spacing.2'),
          '@media (min-width: 640px)': {
            gap: theme('spacing.4'),
          },
          '@media (min-width: 1024px)': {
            gap: theme('spacing.6'),
          },
        },
        '.padding-responsive': {
          padding: theme('spacing.4'),
          '@media (min-width: 640px)': {
            padding: theme('spacing.6'),
          },
          '@media (min-width: 1024px)': {
            padding: theme('spacing.8'),
          },
        },
        '.margin-responsive': {
          margin: theme('spacing.2'),
          '@media (min-width: 640px)': {
            margin: theme('spacing.4'),
          },
          '@media (min-width: 1024px)': {
            margin: theme('spacing.6'),
          },
        },
        // Responsive container utilities
        '.container-responsive': {
          width: '100%',
          maxWidth: '100vw',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
          '@media (min-width: 640px)': {
            maxWidth: theme('screens.sm'),
            paddingLeft: theme('spacing.6'),
            paddingRight: theme('spacing.6'),
          },
          '@media (min-width: 768px)': {
            maxWidth: theme('screens.md'),
            paddingLeft: theme('spacing.8'),
            paddingRight: theme('spacing.8'),
          },
          '@media (min-width: 1024px)': {
            maxWidth: theme('screens.lg'),
          },
          '@media (min-width: 1280px)': {
            maxWidth: theme('screens.xl'),
          },
          '@media (min-width: 1536px)': {
            maxWidth: theme('screens.2xl'),
          },
        },
        // Responsive grid utilities
        '.grid-responsive': {
          display: 'grid',
          gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
          gap: theme('spacing.4'),
          '@media (min-width: 640px)': {
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: theme('spacing.6'),
          },
          '@media (min-width: 1024px)': {
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: theme('spacing.8'),
          },
        },
        '.grid-responsive-4': {
          display: 'grid',
          gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
          gap: theme('spacing.4'),
          '@media (min-width: 640px)': {
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          },
          '@media (min-width: 1024px)': {
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          },
        },
        // Responsive flex utilities
        '.flex-responsive': {
          display: 'flex',
          flexDirection: 'column',
          gap: theme('spacing.4'),
          '@media (min-width: 640px)': {
            flexDirection: 'row',
            gap: theme('spacing.6'),
          },
        },
        // Responsive card utilities
        '.card-responsive': {
          padding: theme('spacing.4'),
          borderRadius: theme('borderRadius.lg'),
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          '@media (min-width: 640px)': {
            padding: theme('spacing.6'),
            borderRadius: theme('borderRadius.xl'),
          },
          '@media (min-width: 1024px)': {
            padding: theme('spacing.8'),
            borderRadius: theme('borderRadius.2xl'),
          },
        },
        // Responsive button utilities
        '.btn-responsive': {
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          fontSize: theme('fontSize.sm'),
          borderRadius: theme('borderRadius.md'),
          transition: 'all 0.2s ease',
          '@media (min-width: 640px)': {
            padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
            fontSize: theme('fontSize.base'),
            borderRadius: theme('borderRadius.lg'),
          },
          '@media (min-width: 1024px)': {
            padding: `${theme('spacing.4')} ${theme('spacing.8')}`,
            fontSize: theme('fontSize.lg'),
            borderRadius: theme('borderRadius.xl'),
          },
        },
        // Responsive modal utilities
        '.modal-responsive': {
          position: 'fixed',
          inset: '0',
          zIndex: theme('zIndex.50'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme('spacing.4'),
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
        },
        '.modal-content-responsive': {
          width: '100%',
          maxWidth: theme('maxWidth.md'),
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: theme('borderRadius.xl'),
          padding: theme('spacing.6'),
          '@media (min-width: 640px)': {
            maxWidth: theme('maxWidth.lg'),
            padding: theme('spacing.8'),
          },
          '@media (min-width: 1024px)': {
            maxWidth: theme('maxWidth.2xl'),
            padding: theme('spacing.10'),
          },
        },
        // Responsive overflow utilities
        '.overflow-responsive': {
          overflowX: 'hidden',
          overflowY: 'auto',
        },
        // Responsive width utilities
        '.w-responsive-full': {
          width: '100%',
        },
        '.w-responsive-auto': {
          width: 'auto',
        },
        '.w-responsive-fit': {
          width: 'fit-content',
        },
        // Responsive height utilities
        '.h-responsive-auto': {
          height: 'auto',
        },
        '.h-responsive-full': {
          height: '100%',
        },
        '.h-responsive-screen': {
          height: '100vh',
        },
        // Responsive position utilities
        '.relative-responsive': {
          position: 'relative',
        },
        '.absolute-responsive': {
          position: 'absolute',
        },
        '.fixed-responsive': {
          position: 'fixed',
        },
        // Responsive display utilities
        '.block-responsive': {
          display: 'block',
        },
        '.inline-block-responsive': {
          display: 'inline-block',
        },
        '.inline-responsive': {
          display: 'inline',
        },
        '.flex-responsive-display': {
          display: 'flex',
        },
        '.grid-responsive-display': {
          display: 'grid',
        },
        '.hidden-responsive': {
          display: 'none',
        },
        // Ultra-mobile responsive utilities
        '.ultra-mobile-compact': {
          '@media (max-width: 320px)': {
            padding: theme('spacing.1'),
            margin: theme('spacing.0.5'),
            fontSize: theme('fontSize.xxs'),
            lineHeight: theme('lineHeight.3'),
          },
        },
        '.ultra-mobile-hide': {
          '@media (max-width: 320px)': {
            display: 'none',
          },
        },
        '.mobile-stack': {
          '@media (max-width: 479px)': {
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: theme('spacing.1'),
          },
        },
        '.mobile-full-width': {
          '@media (max-width: 479px)': {
            width: '100%',
          },
        },
      };

      addUtilities(newUtilities);
    },
  ],
};