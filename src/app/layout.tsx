import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Droplet — Send to Anyone",
  description:
    "The most delightful, frictionless way to send and receive value on Sui. No wallet addresses. No complexity. Just a name, email, or phone.",
  openGraph: {
    title: "Droplet — Send to Anyone",
    description:
      "Send crypto to a username, email, or phone number. Beautiful receipts. Instant transfers.",
    url: "https://droplet.app",
    siteName: "Droplet",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Droplet — Send to Anyone",
    description:
      "Send crypto to a username, email, or phone number. Beautiful receipts. Instant transfers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
