import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitHub README Asset Generator | Badges & Streaks",
  description: "Create beautiful, dynamic SVG tech stack badges and contribution streaks for your GitHub README profile. Customize themes, borders, and layouts instantly.",
  keywords: [
    "github readme", 
    "tech stack", 
    "badge generator", 
    "github streaks",
    "contribution streaks",
    "github stats",
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
    title: "GitHub README Asset Generator | Badges & Streaks",
    description: "Create beautiful, dynamic SVG tech stack badges and contribution streaks for your GitHub README profile.",
    siteName: "GitHub README Asset Generator",
    url: "https://readme-skill-api.vercel.app/",
    images: [
      {
        url: "/image.png",
        alt: "GitHub README Asset Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub README Asset Generator | Badges & Streaks",
    description: "Create beautiful, dynamic SVG tech stack badges and contribution streaks for your GitHub README profile.",
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
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased overflow-y-scroll`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
