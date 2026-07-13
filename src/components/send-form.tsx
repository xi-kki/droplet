"use client";

import { useState, useCallback } from "react";
import { useCurrentAccount, useSignTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RecipientInput } from "@/components/recipient-input";
import { resolveRecipient } from "@/lib/resolution";
import { suiToMist, getClaimUrl, detectRecipientType } from "@/lib/utils";
import { DROPLET_PACKAGE_ID, SUI_COIN_TYPE } from "@/lib/sui-networks";
import {
  Send,
  Loader2,
  CheckCircle2,
  Copy,
  ExternalLink,
  Droplets,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const client = new SuiClient({ url: getFullnodeUrl("testnet") });

type SendState =
  | "idle"
  | "resolving"
  | "confirming"
  | "sending"
  | "success"
  | "error";

const HIGH_VALUE_THRESHOLD = 50; // SUI

interface SendResult {
  txDigest: string;
  claimUrl: string;
  recipientName: string;
  amount: string;
}

export function SendForm() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [state, setState] = useState<SendState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SendResult | null>(null);
  const [copied, setCopied] = useState(false);

  const resetForm = () => {
    setRecipient("");
    setAmount("");
    setNote("");
    setState("idle");
    setError(null);
    setResult(null);
  };

  const handleSend = useCallback(async () => {
    if (!currentAccount) {
      setError("Please connect your wallet first");
      setState("error");
      return;
    }

    if (!recipient.trim()) {
      setError("Please enter a recipient");
      setState("error");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount greater than 0");
      setState("error");
      return;
    }

    if (amountNum > 1000) {
      setError("Maximum send is 1,000 SUI per transaction");
      setState("error");
      return;
    }

    // High-value confirmation
    if (amountNum >= HIGH_VALUE_THRESHOLD && state !== "confirming") {
      setState("confirming");
      return;
    }

    try {
      // Step 1: Resolve recipient
      setState("resolving");
      const resolved = await resolveRecipient(recipient);

      // Step 2: Build and sign transaction
      setState("sending");

      const txb = new Transaction();
      const amountMist = suiToMist(amountNum);

      // Split coins from the sender's SUI coins
      const [coin] = txb.splitCoins(txb.gas, [amountMist]);

      // Transfer to resolved address
      txb.transferObjects([coin], resolved.suiAddress);

      // Set gas budget
      txb.setGasBudget("100_000_000");

      // Sign and execute
      const { bytes, signature, digest } = await signTransaction({
        transaction: txb,
        chain: "sui:testnet",
      });

      // Execute on chain
      const txResult = await client.executeTransaction({
        transaction: bytes,
        signature,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      // Step 3: Generate claim URL
      const claimUrl = getClaimUrl(digest);

      // Step 4: Success!
      setState("success");
      setResult({
        txDigest: digest,
        claimUrl,
        recipientName: resolved.displayName,
        amount: amountNum.toFixed(4),
      });
    } catch (err: any) {
      setState("error");
      const msg = err?.message || "";
      if (msg.includes("User rejected") || msg.includes("denied")) {
        setError("Transaction cancelled by user");
      } else if (msg.includes("insufficient")) {
        setError("Insufficient SUI balance for this transaction");
      } else if (msg.includes("timeout") || msg.includes("TIMEOUT")) {
        setError("Transaction timed out — please try again");
      } else {
        setError("Transaction failed. Please try again.");
      }
    }
  }, [currentAccount, recipient, amount, note, signTransaction, state]);

  const copyClaimLink = () => {
    if (result?.claimUrl) {
      navigator.clipboard.writeText(result.claimUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // CONFIRMATION STATE (high-value)
  if (state === "confirming") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 space-y-6"
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Confirm high-value send</h3>
          <p className="text-muted-foreground">
            You&apos;re about to send <strong>{parseFloat(amount).toFixed(4)} SUI</strong> to <strong>{recipient}</strong>
          </p>
          <p className="text-xs text-yellow-500 mt-2">
            This transaction cannot be undone. Please verify the recipient is correct.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setState("idle")}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={() => handleSend()}
          >
            Confirm Send
          </Button>
        </div>
      </motion.div>
    );
  }

  // SUCCESS STATE
  if (state === "success" && result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 space-y-6"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          >
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-xl font-bold mb-2">Droplet sent! 💧</h3>
          <p className="text-muted-foreground">
            {result.amount} SUI → {result.recipientName}
          </p>
        </div>

        {/* Claim Link */}
        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-2">
            Share this claim link with your recipient:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-background rounded-lg px-3 py-2 truncate border">
              {result.claimUrl}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={copyClaimLink}
              className="shrink-0"
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* TX Link */}
        <a
          href={`https://suiscan.xyz/testnet/tx/${result.txDigest}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-droplet-500 hover:underline"
        >
          View on Sui Explorer
          <ExternalLink className="h-3 w-3" />
        </a>

        <Button
          variant="outline"
          className="w-full"
          onClick={resetForm}
        >
          Send another Droplet
        </Button>
      </motion.div>
    );
  }

  // MAIN FORM
  return (
    <div className="p-6 space-y-5">
      {/* Recipient */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Recipient</label>
        <RecipientInput
          value={recipient}
          onChange={setRecipient}
          disabled={state === "resolving" || state === "sending"}
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
            disabled={state === "resolving" || state === "sending"}
            min="0"
            step="0.01"
            className="text-lg font-semibold h-14 pr-12"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="text-sm font-medium text-muted-foreground">
              SUI
            </span>
          </div>
        </div>
        {/* Quick amounts */}
        <div className="flex gap-2">
          {[0.1, 0.5, 1, 5].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(val.toString())}
              disabled={state === "resolving" || state === "sending"}
              className={cn(
                "flex-1 py-1.5 rounded-lg border text-sm font-medium transition-colors",
                amount === val.toString()
                  ? "bg-droplet-600 text-white border-droplet-600"
                  : "bg-muted hover:bg-accent"
              )}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Note (optional) */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Note <span className="text-muted-foreground">(optional)</span>
        </label>
        <Input
          placeholder="What's this for?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={state === "resolving" || state === "sending"}
          maxLength={100}
        />
      </div>

      {/* Error */}
      <AnimatePresence>
        {state === "error" && error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 rounded-lg p-3"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setState("idle")}
              className="text-xs underline hover:no-underline"
            >
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <Button
        onClick={handleSend}
        disabled={
          !currentAccount ||
          !recipient.trim() ||
          !amount ||
          state === "resolving" ||
          state === "sending"
        }
        className="w-full h-14 text-base"
        size="lg"
      >
        {state === "resolving" ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Resolving recipient...
          </>
        ) : state === "sending" ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Sending...
          </>
        ) : !currentAccount ? (
          "Connect wallet to send"
        ) : (
          <>
            <Send className="mr-2 h-5 w-5" />
            Send Droplet
          </>
        )}
      </Button>

      {/* Wallet not connected hint */}
      {!currentAccount && (
        <p className="text-xs text-center text-muted-foreground">
          Connect your Sui wallet in the top right to get started
        </p>
      )}
    </div>
  );
}
