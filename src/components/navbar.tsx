"use client";

import Link from "next/link";
import { WalletButton } from "@/components/wallet-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Droplets } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-droplet-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Droplets className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">Droplet</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
          >
            Send
          </Link>
          <ThemeToggle />
          <WalletButton />
        </div>
      </div>
    </nav>
  );
}
