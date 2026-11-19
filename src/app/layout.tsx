import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AuthSyncProvider } from "@/components/auth/AuthSync";
import { ThemeAwareToaster } from "@/components/providers/ThemeAwareToaster";
import { WishlistProvider } from "@/components/providers/WishlistProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const themeScript = `
  try {
    const savedTheme = localStorage.getItem("studiospace-theme");
    if (savedTheme === "studiodark" || savedTheme === "studiolight") {
      document.documentElement.dataset.theme = savedTheme;
    }
  } catch {
    // Keep the default dark theme when browser storage is unavailable.
  }
`;

export const metadata: Metadata = {
  title: "StudioSpace",
  description: "Find and book creative studios for your next production.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="studiodark"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-base-100 font-sans text-base-content antialiased">
        <AuthSyncProvider>
          <WishlistProvider>
            <Suspense fallback={<div className="min-h-16" aria-hidden="true" />}>
              <Navbar />
            </Suspense>
            {children}
            <Footer />
            <ThemeAwareToaster />
          </WishlistProvider>
        </AuthSyncProvider>
      </body>
    </html>
  );
}
