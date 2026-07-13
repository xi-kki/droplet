"use client";

import { useState, useEffect, useCallback } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Card, CardContent } from "@/components/ui/card";
import { ReceiptCard } from "@/components/receipt-card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Loader2,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TransactionSkeleton, ErrorState } from "@/components/loading-skeleton";
import type { ReceiptData } from "@/types";

const client = new SuiClient({ url: getFullnodeUrl("testnet") });

export function TransactionHistory() {
  const currentAccount = useCurrentAccount();
  const [transactions, setTransactions] = useState<ReceiptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!currentAccount) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch recent transactions from the chain
      const response = await client.queryTransactionBlocks({
        sender: currentAccount.address,
        limit: 20,
        order: "descending",
      });

      const txs: ReceiptData[] = response.data.map((tx) => {
        // Parse transaction effects to extract transfer details
        let recipientAddress = "";
        let amountMist = "0";

        if (tx.effects) {
          // Try to extract from balanceChanges
          const balanceChanges = (tx.effects as any).balanceChanges || [];
          for (const change of balanceChanges) {
            if (
              change.coinType === "0x2::sui::SUI" &&
              change.address !== currentAccount.address
            ) {
              recipientAddress = change.address;
              // Positive balance change for recipient = amount sent
              const amount = BigInt(change.amount || "0");
              if (amount > 0n) {
                amountMist = amount.toString();
              }
            }
          }

          // Fallback: try to parse from transactionBlock if available
          if (!recipientAddress && (tx as any).transactionBlock) {
            const tb = (tx as any).transactionBlock;
            if (tb.transactions) {
              for (const t of tb.transactions) {
                if (t.TransferObjects && t.TransferObjects[0]) {
                  recipientAddress = t.TransferObjects[1] || "";
                }
              }
            }
          }
        }

        return {
          txDigest: tx.digest,
          senderAddress: currentAccount.address,
          recipientAddress,
          recipientDisplayName: "",
          amountMist: amountMist || "0",
          coinType: "0x2::sui::SUI",
          timestamp: tx.timestampMs
            ? parseInt(tx.timestampMs)
            : Date.now(),
          status: tx.effects?.status?.status === "success" ? "confirmed" : "pending",
        };
      });

      setTransactions(txs);
    } catch {
      setError("Failed to load transaction history. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentAccount]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  if (!currentAccount) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            Connect your wallet to see transaction history
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Loader2 className="h-4 w-4 animate-spin text-droplet-500" />
        </div>
        <TransactionSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <ErrorState message={error} onRetry={fetchTransactions} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {transactions.length} transactions
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={fetchTransactions}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {transactions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Send your first Droplet above
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, i) => (
              <motion.div
                key={tx.txDigest}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ReceiptCard receipt={tx} variant="compact" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
