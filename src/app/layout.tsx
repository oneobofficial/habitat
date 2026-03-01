import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat, Playfair_Display, Inter } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import "./globals.css";

const cormorant = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    style: ["normal", "italic"],
    variable: "--font-cormorant",
});

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["200", "300", "400", "500", "600"],
    variable: "--font-montserrat",
});

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    style: ["normal", "italic"],
    variable: "--font-playfair",
});

const inter = Inter({
    subsets: ["latin"],
    weight: ["200", "300", "400", "500"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Habitat — Urban Sanctuary Cafe",
    description: "A premium cafe experience in Banjara Hills, Hyderabad. Your urban sanctuary.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="lenis no-scrollbar">
            <body
                className={`${cormorant.variable} ${montserrat.variable} ${playfair.variable} ${inter.variable} no-scrollbar`}
            >
                <SmoothScroll />
                <CustomCursor />
                {children}
            </body>
        </html>
    );
}
