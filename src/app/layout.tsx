{/* khalidae - verified write */}
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
  title: "خالد | مطور ومبدع رقمي | Khalid Ae",
  description:
    "Khalid Ae — Full-stack developer and digital creator. Discover innovative projects, smart tools, and creative digital solutions crafted with precision.",
  keywords: [
    "Khalid Ae",
    "developer",
    "خالد",
    "مطور",
    "digital creator",
    "tools",
    "projects",
    "web development",
  ],
  metadataBase: new URL("https://khalidae.com"),
  alternates: {
    canonical: "https://khalidae.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: "خالد | مطور ومبدع رقمي | Khalid Ae",
    description:
      "Khalid Ae — Full-stack developer and digital creator. Discover innovative projects, smart tools, and creative digital solutions crafted with precision.",
    url: "https://khalidae.com",
    siteName: "Khalid Ae",
    images: [
      {
        url: "/opengraph-image",
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
    title: "خالد | مطور ومبدع رقمي | Khalid Ae",
    description:
      "Khalid Ae — Full-stack developer and digital creator. Discover innovative projects, smart tools, and creative digital solutions crafted with precision.",
    images: ["/opengraph-image"],
    site: "@khalidae",
    creator: "@khalidae",
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
