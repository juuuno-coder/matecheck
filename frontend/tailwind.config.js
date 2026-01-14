/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF7F50', // Coral
          light: '#FFAB91',
          dark: '#E64A19',
        },
        secondary: {
          DEFAULT: '#4DB6AC', // Soft Teal
        },
        vote: '#5C6BC0', // Indigo
      }
    },
  },
  plugins: [],
}
