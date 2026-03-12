import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui CSS variable tokens (required for @apply border-border etc.)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        // Brand palette
        brand: {
          50: "hsl(243 50% 98%)",
          100: "hsl(243 60% 95%)",
          500: "hsl(243 65% 68%)",
          600: "hsl(243 75% 59%)",
          700: "hsl(243 75% 49%)",
        },
        gray: {
          50: "hsl(220 15% 98%)",
          100: "hsl(220 12% 95%)",
          200: "hsl(220 10% 90%)",
          400: "hsl(220 8% 65%)",
          500: "hsl(220 8% 52%)",
          600: "hsl(220 10% 40%)",
          800: "hsl(220 14% 20%)",
          950: "hsl(220 20% 10%)",
        },
        success: {
          100: "hsl(152 50% 93%)",
          600: "hsl(152 60% 40%)",
        },
        warning: {
          100: "hsl(38 80% 93%)",
          600: "hsl(38 92% 50%)",
        },
        error: {
          100: "hsl(0 60% 95%)",
          600: "hsl(0 72% 51%)",
        },
        info: {
          100: "hsl(205 60% 94%)",
          600: "hsl(205 78% 50%)",
        },
      },
      fontFamily: {
        heading: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      fontSize: {
        display: ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.025em", fontWeight: "700" }],
        h1: ["1.875rem", { lineHeight: "1.25", letterSpacing: "-0.02em", fontWeight: "700" }],
        h2: ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.015em", fontWeight: "600" }],
        h3: ["1.25rem", { lineHeight: "1.35", letterSpacing: "-0.01em", fontWeight: "600" }],
        h4: ["1.125rem", { lineHeight: "1.4", letterSpacing: "0", fontWeight: "600" }],
        "body-lg": ["1rem", { lineHeight: "1.6", letterSpacing: "0", fontWeight: "400" }],
        body: ["0.875rem", { lineHeight: "1.6", letterSpacing: "0", fontWeight: "400" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" }],
        caption: ["0.75rem", { lineHeight: "1.5", letterSpacing: "0.01em", fontWeight: "500" }],
        overline: ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.06em", fontWeight: "600" }],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        sm: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)",
        focus: "0 0 0 3px hsl(243 65% 68% / 0.3)",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
