/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        'primary-dark': '#1d4ed8',
        secondary: '#10b981',
        bg: '#f8fafc',
        'card-bg': '#ffffff',
        border: '#e2e8f0',
        'text-main': '#0f172a',
        'text-muted': '#64748b',
        'urgency-high': '#ef4444',
        'urgency-medium': '#f59e0b',
        'urgency-low': '#3b82f6',
      },
    },
  },
  plugins: [],
}