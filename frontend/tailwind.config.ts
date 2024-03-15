import type { Config } from "tailwindcss";

const colors = require('tailwindcss/colors')

const config: Config = {
  content: [
    "./index.html",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/primereact/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  darkMode: "class",
  theme: {
    // colors: {
    //   'orange1': '#EFAA19',
    //   'orange2': '#F0DDB6',
    //   transparent: 'transparent',
    //   current: 'currentColor',
    //   black: colors.black,
    //   white: colors.white,
    //   emerald: colors.emerald,
    //   indigo: colors.indigo,
    //   yellow: colors.yellow,
    //   stone: colors.warmGray,
    //   sky: colors.lightBlue,
    //   neutral: colors.trueGray,
    //   gray: colors.coolGray,
    //   slate: colors.blueGray,
    // },
    extend: {
      colors: {
        'orange1': '#EFAA19',
        'orange2': '#F0DDB6'
      }
    },
  },
  plugins: [],
};

export default config;
