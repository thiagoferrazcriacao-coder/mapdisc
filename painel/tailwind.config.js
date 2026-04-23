export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0057FF', light: '#3380FF', dark: '#003FCC', '50': '#EEF4FF' },
        success: '#10B981',
        danger: '#EF4444'
      }
    }
  },
  plugins: []
}