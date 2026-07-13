"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getClaimByToken,
  markClaimed,
  isSupabaseConfigured,
} from "@/lib/supabase";
import { formatAmount, mistToSui, formatAddress } from "@/lib/utils";
import {
  Loader2,
  Check,
  Droplets,
  Clock,
  AlertCircle,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

interface ClaimData {
  claim_token: string;
  sender_address: string;
  recipient_identifier: string;
  recipient_type: string;
  resolved_address: string | null;
  amount_mist: string;
  tx_digest: string | null;
  status: string;
  note: string | null;
  expires_at: string;
  created_at: string;
}

type ClaimPhase = "loading" | "ready" | "claiming" | "success" | "error" | "expired" | "not-found";

export default function ClaimPage() {
  const params = useParams();
  const claimId = params.id as string;
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const [phase, setPhase] = useState<ClaimPhase>("loading");
  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [error, setError] = useState<string>("");

  // Load claim data
  useEffect(() => {
    async function loadClaim() {
      if (!claimId) {
        setPhase("error");
        setError("Invalid claim link");
        return;
      }

      if (!isSupabaseConfigured()) {
        // Demo mode — show mock data
        setClaimData({
          claim_token: claimId,
          sender_address: "0x811c9dc5abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          recipient_identifier: "demo@example.com",
          recipient_type: "email",
          resolved_address: null,
          amount_mist: "1000000000",
          tx_digest: null,
          status: "pending",
          note: "Thanks for lunch!",
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
        });
        setPhase("ready");
        return;
      }

      try {
        const claim = await getClaimByToken(claimId);

        if (!claim) {
          setPhase("not-found");
          return;
        }

        if (claim.status !== "pending") {
          if (claim.status === "claimed") {
            setPhase("success");
          } else {
            setPhase("expired");
          }
          setClaimData(claim);
          return;
        }

        // Check expiry
        if (new Date(claim.expires_at) < new Date()) {
          setPhase("expired");
          setClaimData(claim);
          return;
        }

        setClaimData(claim);
        setPhase("ready");
      } catch (err) {
        console.error("Failed to load claim:", err);
        setPhase("error");
        setError("Failed to load claim details. Please try again.");
      }
    }

    loadClaim();
  }, [claimId]);

  // Handle claiming
  const handleClaim = async () => {
    if (!currentAccount) {
      setError("Please connect your wallet first");
      return;
    }

    if (!claimData) return;

    setPhase("claiming");

    try {
      // If we have a tx_digest, the funds are on-chain
      // For MVP: create a simple transfer PTB
      if (claimData.resolved_address) {
        // Funds already in escrow — claim from vault
        // For demo, we'll just mark as claimed
        await markClaimed(claimData.claim_token, currentAccount.address);
      } else {
        // No resolved address — sender needs to send directly
        // Mark claim and notify sender
        await markClaimed(claimData.claim_token, currentAccount.address);
      }

      setPhase("success");
    } catch (err: any) {
      console.error("Claim failed:", err);
      setPhase("error");
      setError(err?.message || "Claim failed. Please try again.");
    }
  };

  // ─── Loading ───────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-droplet-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading claim...</p>
        </div>
      </main>
    );
  }

  // ─── Not Found ─────────────────────────────────────────────────
  if (phase === "not-found") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">Claim Not Found</h2>
            <p className="text-sm text-muted-foreground mb-4">
              This claim link is invalid or has been removed.
            </p>
            <a href="/" className="text-sm text-droplet-500 hover:underline">
              Go to Droplet →
            </a>
          </CardContent>
        </Card>
      </main>
    );
  }

  // ─── Expired ───────────────────────────────────────────────────
  if (phase === "expired") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Claim Expired</h2>
            <p className="text-sm text-muted-foreground mb-2">
              This Droplet expired on{" "}
              {claimData && new Date(claimData.expires_at).toLocaleDateString()}.
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Funds have been returned to the sender.
            </p>
            <a href="/" className="text-sm text-droplet-500 hover:underline">
              Go to Droplet →
            </a>
          </CardContent>
        </Card>
      </main>
    );
  }

  // ─── Success ───────────────────────────────────────────────────
  if (phase === "success") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-xl font-bold mb-2">Claimed! 💧</h2>
              <p className="text-2xl font-bold text-droplet-500 mb-1">
                {claimData && formatAmount(mistToSui(claimData.amount_mist))} SUI
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                The funds are now in your wallet.
              </p>
              {claimData?.tx_digest && (
                <a
                  href={`https://suiscan.xyz/testnet/tx/${claimData.tx_digest}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-droplet-500 hover:underline"
                >
                  View transaction →
                </a>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────
  if (phase === "error") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Something Went Wrong</h2>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // ─── Ready / Claiming ──────────────────────────────────────────
  const isClaiming = phase === "claiming";

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card className="border-droplet-500/20 shadow-xl shadow-droplet-500/5">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-droplet-600 flex items-center justify-center animate-float">
              <Droplets className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">You&apos;ve Got a Droplet 💧</CardTitle>
            <CardDescription>
              {claimData?.sender_address &&
                `From ${formatAddress(claimData.sender_address)}`}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Amount */}
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-droplet-500">
                {claimData && formatAmount(mistToSui(claimData.amount_mist))} SUI
              </p>
              {claimData?.note && (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  &ldquo;{claimData.note}&rdquo;
                </p>
              )}
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recipient</span>
                <span className="font-mono">{claimData?.recipient_identifier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expires</span>
                <span>
                  {claimData && new Date(claimData.expires_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Claim Button */}
            {!currentAccount ? (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Connect your wallet to claim
                </p>
                <Button disabled className="w-full">
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet First
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleClaim}
                disabled={isClaiming}
                className="w-full h-12 text-base font-semibold bg-droplet-600 hover:bg-droplet-700"
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    Claim {claimData && formatAmount(mistToSui(claimData.amount_mist))} SUI
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            )}

            {/* Back link */}
            <div className="text-center">
              <a href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Powered by Droplet →
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
