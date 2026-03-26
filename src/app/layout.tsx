import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Khalid Ae | Developer & Creator",
  description: "Khalid Ae — Developer and digital creator. Explore my projects, tools, and creative work built with passion and precision.",
  metadataBase: new URL("https://khalidae.com"),
  alternates: {
    canonical: "https://khalidae.com",
  },
  openGraph: {
    title: "Khalid Ae | Developer & Creator",
    description: "Khalid Ae — Developer and digital creator. Explore my projects, tools, and creative work built with passion and precision.",
    url: "https://khalidae.com",
    siteName: "Khalid Ae",
    images: [
      {
        url: "https://khalidae.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Khalid Ae - Developer & Creator",
      },
    ],
    type: "website",
    locale: "ar_SA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Khalid Ae | Developer & Creator",
    description: "Khalid Ae — Developer and digital creator. Explore my projects, tools, and creative work built with passion and precision.",
    images: ["https://khalidae.com/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <LocaleProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
