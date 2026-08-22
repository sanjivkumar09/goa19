/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: '#0F172A',
        bgSec: '#111827',
        gamePanel: '#1E293B',
        tileDefault: '#334155',
        tileHover: '#475569',
        safeGreen: '#22C55E',
        mineRed: '#EF4444',
        accentPrimary: '#8B5CF6',
        accentSecondary: '#06B6D4',
        textMain: '#F8FAFC',
        textSec: '#94A3B8',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.4)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.4)',
        'glow-red': '0 0 25px rgba(239, 68, 68, 0.6)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.4)',
        'tile-shadow': '0 6px 0 #1e293b, 0 10px 15px rgba(0,0,0,0.5)',
        'tile-pressed': '0 2px 0 #1e293b, 0 4px 6px rgba(0,0,0,0.3)',
      },
      animation: {
        'shake': 'shake 0.4s ease-in-out',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-8px)' },
          '40%, 80%': { transform: 'translateX(8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 25px rgba(6, 182, 212, 0.7)' },
        }
      }
    },
  },
  plugins: [],
}
