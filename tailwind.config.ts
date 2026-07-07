import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1e3a5f", // navy blue
          dark:    "#152b47",
          light:   "#e8f0fb",
        },
        accent: {
          DEFAULT: "#f59e0b", // amber gold
          dark:    "#d97706",
          light:   "#fef3c7",
        },
      },
    },
  },
  plugins: [],
};

export default config;
