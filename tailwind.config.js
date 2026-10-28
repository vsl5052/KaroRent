/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hearth: {
          canvas: 'var(--bg-surface-0)',
          card: 'var(--bg-surface-1)',
          oat: 'var(--bg-surface-2)',
          parchment: 'var(--bg-surface-3)',
          border: 'var(--border-sandstone)',
          ink: 'var(--text-ink)',
          umber: 'var(--text-umber)',
          taupe: 'var(--text-taupe)',
          terracotta: '#C2410C',
          kiln: '#9A3412',
          clay: '#7C2D12',
          apricot: 'var(--bg-apricot)',
          sage: '#2F5233',
          sageLight: 'var(--bg-sage-tint)',
        },
      },
      fontFamily: {
        serif: ['"Fraunces"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        hearth: '0 12px 32px -4px rgba(28, 25, 23, 0.06), 0 2px 6px -1px rgba(28, 25, 23, 0.04)',
        'hearth-lg': '0 20px 44px -8px rgba(28, 25, 23, 0.12), 0 4px 12px -2px rgba(28, 25, 23, 0.06)',
        'hearth-lift': '0 16px 36px -4px rgba(194, 65, 12, 0.14), 0 4px 10px -2px rgba(28, 25, 23, 0.06)',
      },
      borderRadius: {
        pill: '999px',
        card: '16px',
        sheet: '24px',
      },
    },
  },
  plugins: [],
};
