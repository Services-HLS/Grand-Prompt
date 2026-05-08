import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "app-bg": "hsl(var(--app-bg))",
        "prompt-box": "hsl(var(--prompt-box))",
        stage: {
          DEFAULT: "hsl(var(--stage))",
          foreground: "hsl(var(--stage-foreground))",
          1: "hsl(var(--stage-1))",
          "1-foreground": "hsl(var(--stage-1-foreground))",
          2: "hsl(var(--stage-2))",
          "2-foreground": "hsl(var(--stage-2-foreground))",
          3: "hsl(var(--stage-3))",
          "3-foreground": "hsl(var(--stage-3-foreground))",
        },
        steps: {
          DEFAULT: "hsl(var(--steps))",
          foreground: "hsl(var(--steps-foreground))",
          1: "hsl(var(--steps-1))",
          "1-foreground": "hsl(var(--steps-1-foreground))",
          2: "hsl(var(--steps-2))",
          "2-foreground": "hsl(var(--steps-2-foreground))",
          3: "hsl(var(--steps-3))",
          "3-foreground": "hsl(var(--steps-3-foreground))",
        },
        like: {
          DEFAULT: "hsl(var(--like))",
          foreground: "hsl(var(--like-foreground))",
        },
        dislike: {
          DEFAULT: "hsl(var(--dislike))",
          foreground: "hsl(var(--dislike-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gradient-header": "var(--gradient-header)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
