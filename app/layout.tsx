import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Tech Stack Badge Generator | Create Beautiful GitHub README Badges",
  description: "Generate beautiful, dynamic SVG tech stack badges for your GitHub README profile. Choose from various frames like hexagons and circles, select your skills, and customize themes.",
  keywords: [
    "github readme", 
    "tech stack", 
    "badge generator", 
    "svg badges", 
    "developer profile", 
    "github profile", 
    "skills badge",
    "readme customization"
  ],
  authors: [{ name: "Developer" }],
  creator: "Developer",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Tech Stack Badge Generator",
    description: "Create beautiful, dynamic SVG tech stack badges for your GitHub README.",
    siteName: "Tech Stack Badge Generator",
    url: "https://readme-skill-api.vercel.app/",
    images: [
      {
        url: "/image.png",
        alt: "Tech Stack Badge Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech Stack Badge Generator",
    description: "Create beautiful, dynamic SVG tech stack badges for your GitHub README.",
    images: ["/image.png"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-y-scroll`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
