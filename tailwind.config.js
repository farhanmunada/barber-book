/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#121316",
        surface: "#1A1D21",
        "surface-hover": "#22262B",
        border: "#2D3139",
        "border-light": "#3F4450",
        primary: {
          DEFAULT: "#F59E0B", // Brass Amber
          hover: "#D97706",
          foreground: "#000000",
        },
        muted: {
          DEFAULT: "#262A30",
          foreground: "#9CA3AF",
        },
        status: {
          waiting: "#F59E0B",
          progress: "#10B981",
          completed: "#6B7280",
          cancelled: "#EF4444",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
