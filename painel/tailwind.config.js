export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#7C3AED', light: '#9F67FF', dark: '#5B21B6', '50': '#F5F0FF' },
        success: '#10B981',
        danger: '#EF4444'
      }
    }
  },
  plugins: []
}