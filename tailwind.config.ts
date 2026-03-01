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
                background: "#F7F3EE",
                foreground: "#2E2B28",
                // ── Sage (Habitat identity)
                sage: {
                    50: "#F2F4F3",
                    100: "#E5E9E7",
                    200: "#CBD3CF",
                    300: "#B1BDB7",
                    400: "#97A79F",
                    500: "#4A5D4E",
                    600: "#3B4A3E",
                    700: "#2C382F",
                    800: "#1E251F",
                    900: "#0F1310",
                },
                // ── Terracotta (Habitat identity)
                terracotta: {
                    50: "#F9F1ED",
                    100: "#F3E3DB",
                    200: "#E7C7B7",
                    300: "#DBAB93",
                    400: "#CF8F6F",
                    500: "#B67352",
                    600: "#925C42",
                    700: "#6D4531",
                    800: "#492E21",
                    900: "#241710",
                },
                // ── Gold (Mairu accent)
                gold: {
                    DEFAULT: "#C8A96A",
                    light: "#D4B87A",
                    lighter: "#E8D4A8",
                    dark: "#9E7A32",
                    muted: "rgba(200, 169, 106, 0.12)",
                    glow: "rgba(200, 169, 106, 0.18)",
                },
                // ── Cream (Mairu base)
                cream: {
                    DEFAULT: "#F7F3EE",
                    dark: "#EEE8DF",
                    deep: "#E5DED3",
                    border: "rgba(224, 216, 204, 0.7)",
                },
                // ── Charcoal (Mairu text)
                charcoal: {
                    DEFAULT: "#2E2B28",
                    light: "#3D3935",
                    mid: "#524E4A",
                    soft: "#706860",
                    border: "#E5DED3",
                },
                // ── Warm neutrals (Mairu)
                warm: {
                    white: "#F7F3EE",
                    gray: "#706860",
                    muted: "#9A8E84",
                    faint: "#C8BEB4",
                },
            },
            fontFamily: {
                serif: ["var(--font-cormorant)", '"Cormorant Garamond"', "serif"],
                sans: ["var(--font-montserrat)", '"Inter"', "system-ui", "sans-serif"],
                display: ["var(--font-playfair)", '"Playfair Display"', "serif"],
                inter: ["var(--font-inter)", '"Inter"', "system-ui", "sans-serif"],
            },
            fontSize: {
                "2xs": ["0.625rem", { lineHeight: "1rem", letterSpacing: "0.1em" }],
                "display-sm": ["clamp(2.5rem, 5vw, 4rem)", { lineHeight: "1.05" }],
                "display-md": ["clamp(3.5rem, 7vw, 6rem)", { lineHeight: "1.0" }],
                "display-lg": ["clamp(5rem, 10vw, 9rem)", { lineHeight: "0.95" }],
                "display-xl": ["clamp(6rem, 14vw, 12rem)", { lineHeight: "0.9" }],
            },
            spacing: {
                section: "10rem",
                "section-sm": "6.5rem",
                gutter: "1.75rem",
            },
            maxWidth: {
                "prose-luxury": "52ch",
                content: "72rem",
            },
            letterSpacing: {
                "ultra-wide": "0.2em",
                "mega-wide": "0.3em",
                luxury: "0.25em",
                ultra: "0.5em",
                mega: "0.75em",
            },
            transitionTimingFunction: {
                luxury: "cubic-bezier(0.76, 0, 0.24, 1)",
                bistro: "cubic-bezier(0.22, 1, 0.36, 1)",
                "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
                "in-expo": "cubic-bezier(0.7, 0, 0.84, 0)",
                spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
            },
            transitionDuration: {
                "400": "400ms",
                "500": "500ms",
                "600": "600ms",
                "800": "800ms",
                "1000": "1000ms",
                "1200": "1200ms",
            },
            backgroundImage: {
                "gold-gradient":
                    "linear-gradient(135deg, #C8A96A 0%, #DEC08A 50%, #C8A96A 100%)",
                "gold-shimmer-bg":
                    "linear-gradient(90deg, #C8A96A 0%, #DEC08A 25%, #EDD9AE 50%, #DEC08A 75%, #C8A96A 100%)",
                "cream-gradient":
                    "linear-gradient(180deg, #F5F1EB 0%, #EDE7DA 100%)",
                vignette:
                    "radial-gradient(ellipse at center, transparent 30%, rgba(43,43,43,0.12) 100%)",
            },
            animation: {
                shimmer: "shimmer 6s linear infinite",
                float: "float 9s ease-in-out infinite",
                "float-delayed": "float 9s ease-in-out 3s infinite",
                breathe: "breathe 5s ease-in-out infinite",
                "pulse-gold": "pulseGold 4s ease-in-out infinite",
                marquee: "marquee 120s linear infinite",
                "marquee-reverse": "marqueeReverse 80s linear infinite",
            },
            keyframes: {
                shimmer: {
                    "0%": { backgroundPosition: "-260% center" },
                    "100%": { backgroundPosition: "260% center" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-12px)" },
                },
                pulseGold: {
                    "0%, 100%": { boxShadow: "0 0 0 0 rgba(200, 169, 106, 0)" },
                    "50%": { boxShadow: "0 0 24px 8px rgba(200, 169, 106, 0.1)" },
                },
                breathe: {
                    "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
                    "50%": { opacity: "0.8", transform: "scale(1.08)" },
                },
                marquee: {
                    "0%": { transform: "translateX(0)" },
                    "100%": { transform: "translateX(-50%)" },
                },
                marqueeReverse: {
                    "0%": { transform: "translateX(-50%)" },
                    "100%": { transform: "translateX(0%)" },
                },
            },
            backdropBlur: {
                xs: "2px",
                "2xl": "40px",
                "3xl": "64px",
            },
        },
    },
    plugins: [],
};

export default config;
