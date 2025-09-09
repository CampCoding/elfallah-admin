/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#00BEEE",
        secondary: "#6c757d",
        success: "#198754",
        danger: "#dc3545",
        warning: "#ffc107",
        info: "#0dcaf0",
        light: "#f8f9fa",
        dark: "#212529",
        white: "#ffffff",
        black: "#000000",
        muted: "#6c757d",
        offWhite: "#edece8",
        lightWarm: "#e9e1d6",
        goldenOrange: "#dd9933",
        softMintGreen: "#599066",
        paleSpringGreen: "#cce7bf",
        sageGreen: "#b4d7af",
        darkgold: "#CA852D",
      },
    },
  },
  plugins: [],
};
