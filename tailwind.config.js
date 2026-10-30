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
          terracotta: '#10B981', // Radiant Jewel Emerald Primary Accent
          kiln: '#059669',       // Deep Jewel Emerald Hover
          clay: '#047857',       // Forest Emerald Dark Accent
          apricot: 'var(--bg-apricot)',
          sage: '#F59E0B',       // Warm Golden-Yellow Secondary Accent
          sageLight: 'var(--bg-sage-tint)',
          gold: '#F59E0B',       // Warm Champagne Gold for Pricing
          goldWarm: '#FBBF24',
          cyan: '#10B981',
          cyanHover: '#059669',
          cyanDark: '#047857',
          slateCard: '#0C231C',  // Deep Emerald Slate Card Fill
          slateBg: '#061712',    // Deep Jewel Emerald Canvas
          slateBorder: '#1E4E40', // Antique Emerald Brass/Slate Border
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
