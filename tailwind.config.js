export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#352f2d",
        moss: "#6d7667",
        rose: "#b76f73",
        redi: "#c94437",
        blush: "#f5e8e4",
        paper: "#fffaf5",
        butter: "#f5d98f",
        clay: "#c88f72",
        tide: "#8aa7a1"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ],
        serif: ["Noto Serif SC", "Songti SC", "STSong", "serif"]
      },
      boxShadow: {
        soft: "0 22px 70px rgba(84, 66, 56, 0.14)"
      }
    }
  },
  plugins: []
};
