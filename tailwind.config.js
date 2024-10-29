import withMT from "@material-tailwind/html/utils/withMT";
module.exports = withMT({
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "zink": {
          50: "#ECECEE",
          100: "#DCDCE0",
          200: "#B6B6BE",
          300: "#93939F",
          400: "#71717F",
          500: "#4F4F59",
          600: "#303036",
          700: "#101012",
          800: "#0A0A0B",
          900: "#050505",
          950: "#020203"
        },
        "primary": {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
          950: 'var(--primary-950)',
        },
      }
    },
  },
  plugins: [],
});