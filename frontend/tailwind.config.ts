import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#FFFFFF",
          900: "#F8FAFC", // Main Crisp Light Background (slate-50)
          800: "#FFFFFF", // Card / Panel White Background
          700: "#E2E8F0", // Border (slate-200)
          600: "#CBD5E1", // Secondary border (slate-300)
        },
        gold: {
          400: "#3B82F6",
          500: "#2563EB", // Primary Accent: Vivid Royal Blue
          600: "#1D4ED8",
        },
        teal: {
          300: "#99F6E4",
          400: "#0D9488",
          500: "#0F766E",
        },
        mist: {
          100: "#0F172A", // Primary Dark Heading & Title Text (slate-900)
          200: "#1E293B", // Body Text (slate-800)
          400: "#475569", // Subtitle & Nav Text (slate-600)
          500: "#64748B", // Muted & Label Text (slate-500)
          700: "#94A3B8", // Subtle Borders & Icons
        },
      },
      fontFamily: {
        display: ["\"Source Serif 4\"", "Georgia", "serif"],
        body: ["\"Inter\"", "system-ui", "sans-serif"],
        mono: ["\"IBM Plex Mono\"", "monospace"],
      },
      backgroundImage: {
        "grid-fade": "linear-gradient(to bottom, rgba(37,99,235,0.06), transparent 60%)",
      },
      boxShadow: {
        glow: "0 0 30px rgba(37, 99, 235, 0.15)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
