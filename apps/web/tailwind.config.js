/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        flowbit: {
          primary: "#1E1B4B",
          secondary: "#4338CA",
          accent: "#EEF2FF",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};
