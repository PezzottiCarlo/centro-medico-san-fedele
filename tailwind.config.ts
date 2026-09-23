import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Blu coerente col logo: base R64 G110 B160 (#406EA0), con le
        // stesse tonalità/luminosità della vecchia palette (vedi globals.css).
        primary: '#406EA0',
        'primary-dark': '#2D537B',
        secondary: '#5AAE4B',
        'secondary-dark': '#479A38',
        bg: '#FFFFFF',
        'bg-soft': '#EDF2F8',
        'bg-deep': '#D1DDEA',
        'text-main': '#2A3642',
        'high-contrast': '#1A1A1A',
        accent: '#406EA0',
        muted: '#EDF2F8',
      },
      borderRadius: {
        DEFAULT: '24px',
        sm: '16px',
        lg: '32px',
        xl: '40px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        lexend: ['Lexend', 'sans-serif'],
        dyslexic: ['OpenDyslexic', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.12)',
      },
      animation: {
        scroll: 'scroll 30s linear infinite',
        'scroll-slow': 'scroll 60s linear infinite',
        'dyslexia-shift': 'dyslexiaShift 3s ease-in-out infinite',
        'dyslexia-wobble': 'dyslexiaWobble 4s ease-in-out infinite',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        dyslexiaShift: {
          '0%, 100%': { transform: 'translate(0,0) rotate(0deg)', letterSpacing: '0em' },
          '25%': { transform: 'translate(2px,-3px) rotate(-4deg)', letterSpacing: '0.1em' },
          '50%': { transform: 'translate(-1px,2px) rotate(3deg)', letterSpacing: '-0.05em' },
          '75%': { transform: 'translate(3px,1px) rotate(-2deg)', letterSpacing: '0.15em' },
        },
        dyslexiaWobble: {
          '0%, 100%': { transform: 'scaleY(1) skewX(0deg)' },
          '30%': { transform: 'scaleY(1.4) skewX(-6deg)' },
          '60%': { transform: 'scaleY(0.7) skewX(8deg)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
