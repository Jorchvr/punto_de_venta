/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["SpaceGrotesk_400Regular"],
        medium: ["SpaceGrotesk_500Medium"],
        semibold: ["SpaceGrotesk_600SemiBold"],
        bold: ["SpaceGrotesk_700Bold"],
      },
      colors: {
        // Neo-brutal comunes
        mamba: {
          yellow: "#F5C518",
          pink: "#FF6B9D",
          green: "#7BC67E",
          blue: "#87CEEB",
          orange: "#F97316",
        },
        // Dark
        dbg: "#0B0B0F",
        dcard: "#1A1A24",
        dsurface: "#24242E",
        dborder: "#2A2A36",
        dtext: "#FFFFFF",
        dmuted: "#B8B8C8",
        // Light
        lbg: "#FBFBFD",
        lcard: "#FFFFFF",
        lsurface: "#F5F5F7",
        lborder: "#E5E5EA",
        ltext: "#0D0D14",
        lmuted: "#6B6B7B",
      },
    },
  },
  plugins: [],
};
