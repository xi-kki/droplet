"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReceiptCard } from "@/components/receipt-card";
import { ReceiptDownload } from "@/components/receipt-download";
import { Skeleton } from "@/components/loading-skeleton";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { ReceiptData } from "@/types";

const client = new SuiClient({ url: getFullnodeUrl("testnet") });

export default function ReceiptPage() {
  const params = useParams();
  const txHash = params.txHash as string;

  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReceipt() {
      if (!txHash) {
        setError("Invalid transaction hash");
        setLoading(false);
        return;
      }

      try {
        const txData = await client.getTransactionBlock({
          digest: txHash,
          options: {
            showEffects: true,
            showInput: true,
            showEvents: true,
          },
        });

        if (!txData) {
          setError("Transaction not found");
          setLoading(false);
          return;
        }

        // Extract sender
        const senderAddress =
          txData.transaction?.data?.sender ||
          (txData.effects as any)?.sent ||
          "";

        // Extract recipient and amount from balanceChanges
        let recipientAddress = "";
        let amountMist = "0";
        const balanceChanges = (txData.effects as any)?.balanceChanges || [];

        for (const change of balanceChanges) {
          if (change.coinType === "0x2::sui::SUI") {
            const amount = BigInt(change.amount || "0");
            if (amount > 0n && change.address !== senderAddress) {
              recipientAddress = change.address;
              amountMist = amount.toString();
            }
          }
        }

        const receiptData: ReceiptData = {
          txDigest: txHash,
          senderAddress: senderAddress || "Unknown",
          recipientAddress,
          recipientDisplayName: "",
          amountMist,
          coinType: "0x2::sui::SUI",
          timestamp: txData.timestampMs
            ? parseInt(txData.timestampMs)
            : Date.now(),
          status:
            txData.effects?.status?.status === "success"
              ? "confirmed"
              : "failed",
        };

        setReceipt(receiptData);
      } catch (err) {
        console.error("Failed to fetch transaction:", err);
        setError("Failed to load transaction details");
      } finally {
        setLoading(false);
      }
    }

    fetchReceipt();
  }, [txHash]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-droplet-950/20">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-sm font-medium">Receipt</h1>
          <a
            href={`https://suiscan.xyz/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Explorer
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {/* Error */}
        {error && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Receipt */}
        {receipt && (
          <div className="space-y-4">
            <ReceiptCard receipt={receipt} />

            {/* Download PDF */}
            <div className="flex gap-2">
              <ReceiptDownload receipt={receipt} />
              <a
                href={`https://suiscan.xyz/testnet/tx/${receipt.txDigest}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="outline" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on SuiScan
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
