import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import SmoothScrolling from "@/components/SmoothScrolling";
import "./globals.css";

const siteUrl = "https://sportiqx.xyz";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SportIQX | Sports Venue Booking",
    template: "%s | SportIQX",
  },
  description:
    "SportIQX helps you discover and book turfs, gaming parlours, badminton courts, swimming pools, and more around VIT Vellore.",
  applicationName: "SportIQX",
  keywords: [
    "sports venue booking vellore",
    "sports venue booking vit vellore",
    "sports booking vit",
    "turf booking vellore",
    "badminton court booking vellore",
    "gaming parlour vellore",
    "turf booking app",
    "book turf online",
    "book badminton court",
    "swimming pool booking",
    "gaming parlour booking",
    "cricket net booking",
    "sports academies near me",
    "sports app vellore",
    "SportIQX",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "SportIQX | Sports Venue Booking",
    description:
      "Book turfs, gaming parlours, badminton courts, swimming pools and more with SportIQX in VIT Vellore.",
    siteName: "SportIQX",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "SportIQX | Sports Venue Booking",
    description:
      "Find and book sports venues near VIT Vellore. Join SportIQX early access for launch rewards.",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-sportiqx.svg?v=2", type: "image/svg+xml", sizes: "any" },
    ],
    shortcut: ["/favicon-sportiqx.svg?v=2"],
    apple: ["/favicon-sportiqx.svg?v=2"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${bebasNeue.variable} h-full antialiased`}>
      <body className="min-h-full">
        <SmoothScrolling>{children}</SmoothScrolling>
      </body>
    </html>
  );
}


