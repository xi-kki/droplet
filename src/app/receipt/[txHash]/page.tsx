"use client";

import { useParams } from "next/navigation";
import { ReceiptCard } from "@/components/receipt-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ReceiptData } from "@/types";

export default function ReceiptPage() {
  const params = useParams();
  const txHash = params.txHash as string;

  // Mock receipt data — in production, fetch from chain or Supabase
  const mockReceipt: ReceiptData = {
    txDigest: txHash,
    senderAddress: "0xabc123def456789012345678901234567890abcdef1234567890abcdef123456",
    recipientAddress: "0xdef7890123456789012345678901234567890abcdef1234567890abcdef123456",
    recipientDisplayName: "alice.sui",
    amountMist: "1500000000",
    coinType: "0x2::sui::SUI",
    timestamp: Date.now() - 300000, // 5 min ago
    status: "confirmed",
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-droplet-950/20">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Droplet
            </Button>
          </Link>

          <ReceiptCard receipt={mockReceipt} />

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Receipt verified on Sui Testnet
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
