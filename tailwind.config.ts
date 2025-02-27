import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        theme: {
          primary: '#7B97A0',    // Steel blue
          secondary: '#B3C8CF',  // Light steel blue
          accent: '#E5E1DA',     // Light gray
          light: '#EEEEEE',      // Off white
        },
      },
    },
  },
  plugins: [],
};

export default config;
