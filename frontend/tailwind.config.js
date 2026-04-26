module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 🔷 Primary (keep as-is)
        primary: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6fe',
          300: '#a4b8fc',
          400: '#7d93f8',
          500: '#5b6ef2',
          600: '#3d4de6',
          700: '#2f3bd1',
          800: '#2832aa',
          900: '#252d87',
          950: '#171a50',
        },

        // 🧠 Brand (NEW - use this for logo / identity)
        brand: {
          light: '#eef2ff',
          DEFAULT: '#4f46e5',
          dark: '#3730a3',
        },

        // 🌈 Gradient helper (NEW)
        gradient: {
          start: '#5b6ef2',
          end: '#14b8a6',
        },

        // ⚪ Slate (unchanged)
        slate: {
          50:  '#f8fafc',
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

        // 🟢 Accent (teal)
        accent: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',   // added for smoother scale
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        },

        // ✅ Success
        success: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',   // added
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },

        // ⚠️ Warning
        warning: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',   // added
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },

        // ❌ Danger
        danger: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',   // added
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
        },
      },

      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      boxShadow: {
        soft:   '0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.06)',
        card:   '0 4px 6px -1px rgba(15,23,42,0.07), 0 2px 4px -2px rgba(15,23,42,0.05)',
        lifted: '0 10px 15px -3px rgba(15,23,42,0.08), 0 4px 6px -4px rgba(15,23,42,0.05)',
        focus:  '0 0 0 3px rgba(91,110,242,0.25)',
      },

      borderRadius: {
        xl:  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },

      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};