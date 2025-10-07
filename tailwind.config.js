/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1193d4',
        'background-light': '#f6f7f8',
        'background-dark': '#101c22',
        'foreground-light': '#101c22',
        'foreground-dark': '#f6f7f8',
        'card-light': '#ffffff',
        'card-dark': '#1a2830',
        'border-light': '#e5e7eb',
        'border-dark': '#374151',
        'text-light': '#6b7280',
        'text-dark': '#9ca3af',
        'success-light': '#10b981',
        'success-dark': '#34d399',
        'danger-light': '#ef4444',
        'danger-dark': '#f87171',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/container-queries')],
};
