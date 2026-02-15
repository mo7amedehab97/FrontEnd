/** @type {import('tailwindcss').Config} */

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        sans: ['Montserrat', 'sans-serif'],
        arabic: ['Cairo', 'sans-serif'],
      },
      colors: {
        primary: '#115740',
        secondary: '#42dc56',
        gem: {
          DEFAULT: '#7D00B8',
          dark: '#282d37',
          green: '#19802A',
        },
        brand: {
          green: '#489E46',
          greenHover: '#3a8039',
          purple: '#7E22CE',
          dark: '#050505',
          surface: '#0F1115',
          card: '#18181b',
        },
      },
      backgroundImage: {
        'gem-gradient': 'linear-gradient(162deg, #7D00B8 31%, #19802A 87%)',
        'gem-gradient-animated': 'linear-gradient(162deg, #7D00B8 31%, #19802A 47%, #7D00B8 87%)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in-up-lg': {
          from: {
            opacity: '0',
            transform: 'translateY(1.25rem)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'dropdown-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-8px) scale(0.96)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
        'gradient-shift': {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        },
        'border-sheen': {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
        'aura-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' },
        },
        'success-pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'error-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        'overlay-show': {
          from: {
            opacity: '0',
          },
          to: {
            opacity: '1',
          },
        },
        'overlay-hide': {
          from: {
            opacity: '1',
          },
          to: {
            opacity: '0',
          },
        },
        'content-show': {
          from: {
            opacity: '0',
            transform: 'translate(-50%, -48%) scale(0.96)',
          },
          to: {
            opacity: '1',
            transform: 'translate(-50%, -50%) scale(1)',
          },
        },
        'content-hide': {
          from: {
            opacity: '1',
            transform: 'translate(-50%, -50%) scale(1)',
          },
          to: {
            opacity: '0',
            transform: 'translate(-50%, -48%) scale(0.96)',
          },
        },
        spin: {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '100%': {
            transform: 'rotate(360deg)',
          },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out',
        'fade-in-up-lg': 'fade-in-up-lg 0.8s ease-out',
        'dropdown-in': 'dropdown-in 0.2s ease-out',
        'gradient-shift': 'gradient-shift 60s ease infinite',
        'border-sheen-slow': 'border-sheen 9s ease-in-out infinite',
        'border-sheen-fast': 'border-sheen 7s ease-in-out infinite',
        'aura-pulse': 'aura-pulse 8s ease-in-out infinite',
        'aura-pulse-slow': 'aura-pulse 9s ease-in-out infinite',
        'success-pulse': 'success-pulse 0.6s ease-in-out',
        'error-shake': 'error-shake 0.5s ease-in-out',
        'overlay-show': 'overlay-show 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        'overlay-hide': 'overlay-hide 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        'content-show': 'content-show 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        'content-hide': 'content-hide 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        spin: 'spin 1s linear infinite',
      },
      backgroundSize: {
        '200%': '200%',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    function ({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
        },
        '.scrollbar-thumb-gray-300': {
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#d1d5db',
            borderRadius: '3px',
          },
        },
        '.scrollbar-track-transparent': {
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
        },
        '.scrollbar-landing': {
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#050505',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#333',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: '#489E46',
            },
          },
        },
        /* Custom slider thumb styling */
        '.slider-thumb-primary': {
          '-webkit-appearance': 'none',
          appearance: 'none',
          height: '8px',
          borderRadius: '4px',
          outline: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scaleY(1.2)',
          },
          '&:focus': {
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(17, 87, 64, 0.1)',
          },
          '&::-webkit-slider-thumb': {
            '-webkit-appearance': 'none',
            appearance: 'none',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#115740',
            cursor: 'pointer',
            border: '2px solid #ffffff',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease-in-out',
          },
          '&::-webkit-slider-thumb:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 4px 8px rgba(17, 87, 64, 0.3)',
          },
          '&::-moz-range-thumb': {
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#115740',
            cursor: 'pointer',
            border: '2px solid #ffffff',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease-in-out',
          },
          '&::-moz-range-thumb:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 4px 8px rgba(17, 87, 64, 0.3)',
          },
        },
        /* Custom scrollbar for forms */
        '.scrollbar-form': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#9ca3af #f3f4f6',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f3f4f6',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#9ca3af',
            borderRadius: '4px',
            border: '1px solid #f3f4f6',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#6b7280',
          },
        },
        /* Pricing card pseudo-element overlays */
        '.pricing-card-basic-glow': {
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '-0.0625rem',
            borderRadius: '1.1rem',
            padding: '0.125rem',
            background: 'linear-gradient(110deg, rgba(72, 158, 70, 0.7), rgba(17, 87, 64, 0.45), rgba(72, 158, 70, 0.7))',
            backgroundSize: '200% 200%',
            '-webkit-mask': 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            '-webkit-mask-composite': 'xor',
            'mask-composite': 'exclude',
            pointerEvents: 'none',
            opacity: '0.45',
            animation: 'border-sheen 9s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: '0',
            borderRadius: '1rem',
            boxShadow: '0 0 2rem rgba(72, 158, 70, 0.16)',
            pointerEvents: 'none',
            opacity: '0.4',
          },
        },
        '.pricing-card-standard-glow': {
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '-0.0625rem',
            borderRadius: '1.1rem',
            padding: '0.125rem',
            background: 'linear-gradient(115deg, rgba(125, 0, 184, 0.65), rgba(72, 158, 70, 0.55), rgba(125, 0, 184, 0.65))',
            backgroundSize: '200% 200%',
            '-webkit-mask': 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            '-webkit-mask-composite': 'xor',
            'mask-composite': 'exclude',
            pointerEvents: 'none',
            opacity: '0.6',
            animation: 'border-sheen 7s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: '0',
            borderRadius: '1rem',
            boxShadow: '0 0 2.25rem rgba(125, 0, 184, 0.18)',
            pointerEvents: 'none',
            opacity: '0.55',
          },
        },
        '.pricing-card-featured-glow': {
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '-0.0938rem',
            borderRadius: '1.1rem',
            padding: '0.125rem',
            background: 'linear-gradient(162deg, #7d00b8 31%, #19802a 47%, #7d00b8 87%)',
            backgroundSize: '200% 200%',
            '-webkit-mask': 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            '-webkit-mask-composite': 'xor',
            'mask-composite': 'exclude',
            pointerEvents: 'none',
            opacity: '0.85',
            animation: 'gradient-shift 60s ease infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: '0',
            borderRadius: '1rem',
            boxShadow: '0 0 2.8rem rgba(125, 0, 184, 0.2)',
            pointerEvents: 'none',
            opacity: '0.6',
          },
        },
        /* Featured card aura effects */
        '.featured-header-aura': {
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            right: '-30%',
            top: '-30%',
            width: '12rem',
            height: '12rem',
            background: 'radial-gradient(circle, rgba(125, 0, 184, 0.18), transparent 60%)',
            filter: 'blur(0.2rem)',
            opacity: '0.8',
            animation: 'aura-pulse 8s ease-in-out infinite',
            pointerEvents: 'none',
          },
        },
        '.featured-price-aura': {
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            left: '-10%',
            top: '10%',
            width: '9rem',
            height: '9rem',
            background: 'radial-gradient(circle, rgba(66, 220, 86, 0.16), transparent 60%)',
            filter: 'blur(0.2rem)',
            opacity: '0.7',
            animation: 'aura-pulse 9s ease-in-out infinite',
            pointerEvents: 'none',
          },
        },
        /* CTA button shimmer effect */
        '.cta-shimmer': {
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
            transition: 'left 0.5s ease',
          },
          '&:hover::before': {
            left: '100%',
          },
        },
        /* Location card "Already Claimed" pseudo text */
        '.used-pill-text': {
          '&::after': {
            content: "' - Already Claimed'",
          },
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
};
