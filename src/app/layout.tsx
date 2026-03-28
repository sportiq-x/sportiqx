import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";

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
  title: "SportIQ | Coming Soon",
  description: "SportIQ early access landing page",
  icons: {
    icon: [
      { url: "/favicon-sportiq.svg?v=2", type: "image/svg+xml", sizes: "any" },
    ],
    shortcut: ["/favicon-sportiq.svg?v=2"],
    apple: ["/favicon-sportiq.svg?v=2"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${bebasNeue.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
