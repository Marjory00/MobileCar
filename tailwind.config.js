// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // 🛑 Make sure this content array matches your file locations EXACTLY! 🛑
    './public/**/*.html', // Scan all HTML files in public and sub-folders
    './public/**/*.js',   // Scan all JS files in public and sub-folders
  ],
  darkMode: 'class', 
  theme: {
    extend: {},
  },
  plugins: [],
}