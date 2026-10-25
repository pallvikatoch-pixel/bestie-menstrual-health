/** Colours are CSS variables (see src/index.css) so dark mode and high contrast can swap them. */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: v('cream'), blush: v('blush'), lav: v('lav'), peach: v('peach'),
        plum: v('plum'), card: v('card'), soft: v('soft'), accent: v('accent'),
        calm: v('calm'), line: v('line'), mint: v('mint'),
      },
      fontFamily: {
        display: ['"Baloo 2"', 'Nunito', 'system-ui', 'sans-serif'],
        body: ['Nunito', '"Baloo 2"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { blob: '1.75rem' },
      boxShadow: {
        soft: '0 2px 10px rgb(var(--shadow) / 0.08), 0 1px 2px rgb(var(--shadow) / 0.06)',
        lift: '0 10px 30px rgb(var(--shadow) / 0.12)',
      },
    },
  },
  plugins: [],
}
