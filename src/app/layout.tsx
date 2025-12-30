import type { Metadata, Viewport } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import AuthWrapper from "@/components/AuthWrapper"; // Added import for AuthWrapper
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });
const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre"
});

export const metadata: Metadata = {
  title: "Fitness Tracker",
  description: "Track your daily fitness activities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${libreBaskerville.variable} antialiased`}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <div className="mobile-container">
            {/* Navigation removed from here, pages include TopNav or layouts include it */}
            <AuthWrapper>
              {children}
            </AuthWrapper>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
