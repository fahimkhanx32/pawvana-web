const c = (v) => `rgb(var(--${v}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    // `xs` exists so very small phones (320px, e.g. Galaxy S Duos 2) and
    // regular phones (380px+) can be tuned separately.
    screens: { xs: '380px', sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
    extend: {
      colors: {
        bg: c('bg'), surface: c('surface'), surface2: c('surface-2'), ink: c('ink'),
        muted: c('muted'), line: c('line'), brand: c('brand'), 'brand-ink': c('brand-ink'),
        'brand-soft': c('brand-soft'), accent: c('accent'), danger: c('danger'),
      },
      fontFamily: {
        sans: ['"Outfit Variable"', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque Variable"', '"Outfit Variable"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--shadow) / .06), 0 10px 28px -12px rgb(var(--shadow) / .16)',
        lift: '0 2px 4px rgb(var(--shadow) / .08), 0 30px 60px -20px rgb(var(--shadow) / .35)',
      },
      borderRadius: { '4xl': '2rem', '5xl': '2.5rem' },
      keyframes: {
        rise: { from: { opacity: 0, transform: 'translateY(48px)' }, to: { opacity: 1, transform: 'none' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        pop: { from: { opacity: 0, transform: 'translateY(8px) scale(.98)' }, to: { opacity: 1, transform: 'none' } },
        slideIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'none' } },
        slideInL: { from: { transform: 'translateX(-100%)' }, to: { transform: 'none' } },
        sheetUp: { from: { transform: 'translateY(100%)' }, to: { transform: 'none' } },
        fade: { from: { opacity: 0 }, to: { opacity: 1 } },
      },
      animation: {
        rise: 'rise .9s cubic-bezier(.2,.8,.2,1) both',
        pop: 'pop .25s ease-out both',
        slideIn: 'slideIn .3s cubic-bezier(.2,.8,.2,1) both',
        slideInL: 'slideInL .3s cubic-bezier(.2,.8,.2,1) both',
        sheetUp: 'sheetUp .3s cubic-bezier(.2,.8,.2,1) both',
        fade: 'fade .2s ease-out both',
      },
    },
  },
  plugins: [],
};
