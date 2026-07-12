"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatAddress, formatAmount, timeAgo, getReceiptUrl } from "@/lib/utils";
import { Droplets, Copy, ExternalLink, Check } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import type { ReceiptData } from "@/types";

interface ReceiptCardProps {
  receipt: ReceiptData;
  variant?: "full" | "compact";
}

export function ReceiptCard({ receipt, variant = "full" }: ReceiptCardProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(getReceiptUrl(receipt.txDigest));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (variant === "compact") {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-droplet-500/10 flex items-center justify-center">
                <Droplets className="h-4 w-4 text-droplet-500" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {formatAmount(receipt.amountMist)} SUI
                </p>
                <p className="text-xs text-muted-foreground">
                  to {formatAddress(receipt.recipientAddress)}
                </p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {timeAgo(receipt.timestamp)}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-droplet-600 to-droplet-700 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Droplets className="h-6 w-6" />
              <span className="font-semibold">Droplet Receipt</span>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                receipt.status === "confirmed"
                  ? "bg-green-500/20 text-green-100"
                  : receipt.status === "pending"
                  ? "bg-yellow-500/20 text-yellow-100"
                  : "bg-red-500/20 text-red-100"
              }`}
            >
              {receipt.status}
            </span>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold mb-1">
              {formatAmount(receipt.amountMist)} SUI
            </p>
            <p className="text-white/70 text-sm">
              {new Date(receipt.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Details */}
        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">From</span>
              <span className="text-sm font-mono">
                {formatAddress(receipt.senderAddress)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">To</span>
              <span className="text-sm font-mono">
                {receipt.recipientDisplayName ||
                  formatAddress(receipt.recipientAddress)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Network</span>
              <span className="text-sm">Sui Testnet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">TX Hash</span>
              <span className="text-sm font-mono break-all">
                {formatAddress(receipt.txDigest, 8)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={copyLink}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border text-sm font-medium hover:bg-accent transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </button>
            <a
              href={`https://suiscan.xyz/testnet/tx/${receipt.txDigest}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border text-sm font-medium hover:bg-accent transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View on Explorer
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
