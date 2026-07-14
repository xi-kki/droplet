"use client";

import { useState, useCallback } from "react";
import { useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RecipientInput } from "@/components/recipient-input";
import { resolveRecipient, ResolutionError } from "@/lib/resolution";
import { createClaim } from "@/lib/supabase";
import { suiToMist, formatAmount, getClaimUrl } from "@/lib/utils";
import {
  Send,
  Loader2,
  Check,
  Copy,
  ExternalLink,
  AlertTriangle,
  Droplets,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ResolvedRecipient, ReceiptData } from "@/types";

interface SendState {
  phase: "idle" | "resolving" | "confirming" | "sending" | "success" | "error";
  recipient?: ResolvedRecipient;
  amount?: string;
  txDigest?: string;
  error?: string;
  claimUrl?: string;
}

export function SendForm() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const [recipientInput, setRecipientInput] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [sendState, setSendState] = useState<SendState>({ phase: "idle" });
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setRecipientInput("");
    setAmount("");
    setNote("");
    setSendState({ phase: "idle" });
  };

  const executeTransaction = useCallback(async (
    recipient: ResolvedRecipient,
    amountMist: bigint,
    amountSui: number
  ) => {
    if (!currentAccount) return;

    setSendState({ phase: "sending", recipient, amount: amount });

    try {
      const tx = new Transaction();

      // Split coins for the payment
      const [coin] = tx.splitCoins(tx.gas, [amountMist]);

      // Transfer to recipient
      tx.transferObjects([coin], recipient.suiAddress);

      // Set gas budget
      tx.setGasBudget(10_000_000);

      // Sign and execute
      const result = await signAndExecute({ transaction: tx });

      const txDigest = result.digest;

      // Store claim in Supabase if email/phone recipient
      let claimUrl: string | undefined;
      if (recipient.type === "email" || recipient.type === "phone") {
        try {
          const claimToken = await createClaim({
            senderAddress: currentAccount.address,
            recipientIdentifier: recipient.input,
            recipientType: recipient.type,
            resolvedAddress: recipient.suiAddress,
            amountMist: amountMist.toString(),
            txDigest,
            note: note || undefined,
          });
          claimUrl = getClaimUrl(claimToken);
        } catch (err) {
          console.warn("Failed to create claim record:", err);
          // Non-blocking — tx still succeeded on-chain
        }
      }

      setSendState({
        phase: "success",
        recipient,
        amount: amount,
        txDigest,
        claimUrl,
      });
    } catch (error: any) {
      const message =
        error?.message?.includes("User rejected")
          ? "Transaction cancelled"
          : error?.message || "Transaction failed. Please try again.";
      setSendState({ phase: "error", error: message });
    }
  }, [currentAccount, signAndExecute, note, amount]);

  const handleSend = useCallback(async () => {
    if (!currentAccount) {
      setSendState({ phase: "error", error: "Please connect your wallet first" });
      return;
    }

    // Validate amount
    const amountSui = parseFloat(amount);
    if (isNaN(amountSui) || amountSui <= 0) {
      setSendState({ phase: "error", error: "Please enter a valid amount" });
      return;
    }

    const amountMist = suiToMist(amountSui);

    // Step 1: Resolve recipient
    setSendState({ phase: "resolving" });
    try {
      const resolved = await resolveRecipient(recipientInput, currentAccount.address);

      // High-value confirmation
      if (amountSui > 50) {
        setSendState({
          phase: "confirming",
          recipient: resolved,
          amount: amount,
        });
        return;
      }

      // Step 2: Execute transaction
      await executeTransaction(resolved, amountMist, amountSui);
    } catch (error) {
      if (error instanceof ResolutionError) {
        setSendState({ phase: "error", error: error.message });
      } else {
        setSendState({ phase: "error", error: "Something went wrong. Please try again." });
      }
    }
  }, [currentAccount, recipientInput, amount, executeTransaction]);

  const confirmHighValue = async () => {
    if (!sendState.recipient || !sendState.amount) return;
    const amountMist = suiToMist(parseFloat(sendState.amount));
    await executeTransaction(sendState.recipient, amountMist, parseFloat(sendState.amount));
  };

  const copyClaimUrl = () => {
    if (sendState.claimUrl) {
      navigator.clipboard.writeText(sendState.claimUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ─── Success State ─────────────────────────────────────────────
  if (sendState.phase === "success") {
    return (
      <CardContent className="pt-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-center py-6"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
            <Check className="h-10 w-10 text-green-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Droplet Sent! 💧</h3>
          <p className="text-2xl font-bold text-droplet-500 mb-1">
            {formatAmount(suiToMist(parseFloat(sendState.amount || "0")))} SUI
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            to {sendState.recipient?.displayName}
          </p>

          {/* Claim link (for email/phone recipients) */}
          {sendState.claimUrl && (
            <div className="mb-4 p-3 rounded-lg bg-droplet-500/5 border border-droplet-500/20">
              <p className="text-xs text-muted-foreground mb-2">Share this claim link:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
                  {sendState.claimUrl}
                </code>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyClaimUrl}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {sendState.txDigest && (
              <a
                href={`https://suiscan.xyz/testnet/tx/${sendState.txDigest}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border text-sm font-medium hover:bg-accent transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                View on Explorer
              </a>
            )}
            <Button variant="outline" onClick={reset} className="flex-1">
              Send Another
            </Button>
          </div>
        </motion.div>
      </CardContent>
    );
  }

  // ─── High-Value Confirmation ───────────────────────────────────
  if (sendState.phase === "confirming") {
    return (
      <CardContent className="pt-6">
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
          <h3 className="text-lg font-bold mb-2">High-Value Transfer</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You&apos;re about to send{" "}
            <span className="font-bold text-foreground">
              {formatAmount(suiToMist(parseFloat(sendState.amount || "0")))} SUI
            </span>{" "}
            to{" "}
            <span className="font-bold text-foreground">
              {sendState.recipient?.displayName}
            </span>
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            This transfer cannot be undone. Please confirm.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={reset} className="flex-1">
              Cancel
            </Button>
            <Button onClick={confirmHighValue} className="flex-1 bg-droplet-600 hover:bg-droplet-700">
              Confirm Send
            </Button>
          </div>
        </div>
      </CardContent>
    );
  }

  // ─── Error State ───────────────────────────────────────────────
  if (sendState.phase === "error") {
    return (
      <CardContent className="pt-6">
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-2xl">😵</span>
          </div>
          <h3 className="text-lg font-bold mb-2">Transaction Failed</h3>
          <p className="text-sm text-muted-foreground mb-6">{sendState.error}</p>
          <Button onClick={reset} className="w-full bg-droplet-600 hover:bg-droplet-700">
            Try Again
          </Button>
        </div>
      </CardContent>
    );
  }

  // ─── Idle / Sending Form ───────────────────────────────────────
  const isSending = sendState.phase === "sending" || sendState.phase === "resolving";

  return (
    <>
      <CardContent className="pt-4 space-y-4">
        {/* Recipient */}
        <div className="space-y-2">
          <label className="text-sm font-medium">To</label>
          <RecipientInput
            value={recipientInput}
            onChange={setRecipientInput}
            disabled={isSending}
          />
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount (SUI)</label>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSending}
              min="0"
              step="0.01"
              className="text-lg font-bold pr-12"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm text-muted-foreground">
              <Droplets className="h-4 w-4" />
              SUI
            </div>
          </div>
          {amount && parseFloat(amount) > 50 && (
            <p className="text-xs text-yellow-500 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              High-value transfer will require confirmation
            </p>
          )}
        </div>

        {/* Note (optional) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Note <span className="text-xs">(optional)</span>
          </label>
          <Input
            placeholder="What's this for?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isSending}
          />
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          onClick={handleSend}
          disabled={isSending || !recipientInput || !amount}
          className="w-full h-12 text-base font-semibold bg-droplet-600 hover:bg-droplet-700"
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {sendState.phase === "resolving" ? "Resolving..." : "Sending..."}
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Send Droplet
            </>
          )}
        </Button>
      </CardFooter>
    </>
  );
}
