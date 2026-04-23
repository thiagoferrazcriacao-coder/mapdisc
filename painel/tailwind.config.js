export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#6C3AED', light: '#8B5CF6', dark: '#5B21B6', '50': '#F3F0FF' },
        success: '#10B981',
        danger: '#EF4444'
      }
    }
  },
  plugins: []
}