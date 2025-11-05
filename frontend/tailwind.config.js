/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        '1': '0.5rem',  // 8px
        '2': '1rem',    // 16px
        '3': '1.5rem',  // 24px
        '4': '2rem',    // 32px
        '5': '2.5rem',  // 40px
        '6': '3rem',    // 48px
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
