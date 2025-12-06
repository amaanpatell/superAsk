import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SuperAsk - AI-Powered Chat Assistant",
    template: "%s | SuperAsk",
  },
  description:
    "SuperAsk is your intelligent AI chat assistant powered by advanced language models. Get instant answers, creative content, coding help, and more through natural conversations.",
  keywords: [
    "AI chat",
    "chatbot",
    "AI assistant",
    "artificial intelligence",
    "chat application",
    "conversational AI",
    "language model",
    "AI-powered chat",
    "virtual assistant",
    "smart chat",
  ],
  authors: [{ name: "SuperAsk Team" }],
  creator: "SuperAsk",
  publisher: "SuperAsk",
  applicationName: "SuperAsk",
  metadataBase: new URL("https://superask.amaanpatel.space"), // Replace with your actual domain
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://superask.amaanpatel.space", // Replace with your actual domain
    siteName: "SuperAsk",
    title: "SuperAsk - AI-Powered Chat Assistant",
    description:
      "Experience intelligent conversations with SuperAsk. Get instant answers, creative content, and expert assistance through our advanced AI chat platform.",
    images: [
      {
        url: "/superAsk.png", // Create this image (1200x630px recommended)
        width: 1200,
        height: 630,
        alt: "SuperAsk AI Chat Assistant",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
      },
    ],
  },
  manifest: "/site.webmanifest",
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}