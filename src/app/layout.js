// app/layout.js
import "./globals.css";
import { Syne, DM_Sans } from "next/font/google";

const syne = Syne({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-syne" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm" });
export const metadata = {
  title: "Spooky Cookie",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
