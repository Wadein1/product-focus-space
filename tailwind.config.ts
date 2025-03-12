
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
        horizon: ["Horizon", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0ca2ed",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#8E9196",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#F7F7F7",
          foreground: "#1A1A1A",
        },
      },
      keyframes: {
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        "topo-shift": {
          "0%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
          "100%": {
            backgroundPosition: "0% 50%",
          },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        float: "float 3s ease-in-out infinite",
        "topo-shift": "topo-shift 15s ease-in-out infinite",
      },
      backgroundImage: {
        'topo-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.343 0L13.857 8.485 15.272 9.9l7.9-7.9h-.83L27.03 0h-4.687zm16.686 0L47.515 8.485 46.1 9.9l-7.9-7.9h.828L33.343 0h5.686zM32 0l8.485 8.485-1.414 1.414L30.586 1.414 30 .828l-.586.586L20.93 9.9l-1.414-1.414L28 0h4zM3.515 0L0 3.515 1.414 4.93 4.93 1.414 3.515 0zM56.485 0L60 3.515 58.586 4.93 55.07 1.414 56.485 0zM4.343 0L0 4.343v2.828l4.343-4.343L4.343 0zm52.029 0L60 4.343v-2.83L56.485 0h-.113zM4.343 5.657L0 10v2.828l4.343-4.343L4.343 5.657zm52.029 0L60 10v-2.83l-3.515-3.513h-.113l-.113-.113L52.03 7.9l1.414 1.414L56.485 5.657zM4.343 11.314L0 15.657v2.828l4.343-4.343L4.343 11.314zm52.029 0L60 15.657v-2.83L52.029 11.314zM4.343 16.97L0 21.314v2.83l4.343-4.343L4.343 16.971zm52.029 0L60 21.314v-2.83L52.029 16.971zM4.343 22.627L0 26.97v2.83l4.343-4.343L4.343 22.627zm52.029 0L60 26.97v-2.83L52.029 22.627zM4.343 28.284L0 32.627v2.83l4.343-4.343L4.343 28.284zm52.029 0L60 32.627v-2.83L52.029 28.284zM4.343 33.941L0 38.284v2.83l4.343-4.343L4.343 33.941zm52.029 0L60 38.284v-2.83L52.029 33.941zM4.343 39.598L0 43.941v2.83l4.343-4.343L4.343 39.598zm52.029 0L60 43.941v-2.83L52.029 39.598zM4.343 45.255L0 49.598v2.83l4.343-4.343L4.343 45.255zm52.029 0L60 49.598v-2.83L52.029 45.255zM4.343 50.912L0 55.255v2.83l4.343-4.343L4.343 50.912zm52.029 0L60 55.255v-2.83L52.029 50.912zM4.343 56.569L0 60.912v-2.83l4.343-4.343L4.343 56.569zm52.029 0L60 60.912v-2.83L52.029 56.569z' fill='%230ca2ed' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
