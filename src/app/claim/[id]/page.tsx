"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useCurrentAccount, useSignTransaction } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WalletButton } from "@/components/wallet-button";
import { ArrowLeft, CheckCircle2, Loader2, Droplets, AlertCircle, Wallet } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

type ClaimState = "loading" | "ready" | "claiming" | "success" | "error" | "not-found" | "expired";

interface ClaimData {
  id: string;
  senderAddress: string;
  amountSui: string;
  coinType: string;
  note: string | null;
  status: string;
  expiresAt: string;
}

export default function ClaimPage() {
  const params = useParams();
  const claimId = params.id as string;
  const currentAccount = useCurrentAccount();

  const [state, setState] = useState<ClaimState>("loading");
  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch claim data
  useEffect(() => {
    async function fetchClaim() {
      try {
        // In production, fetch from Supabase
        // For MVP demo, simulate a claim
        await new Promise((r) => setTimeout(r, 1000));

        // Mock claim data — in production, query Supabase by claim token
        if (claimId && claimId.length > 0) {
          setClaimData({
            id: claimId,
            senderAddress: "0xabc123def456789012345678901234567890abcdef1234567890abcdef123456",
            amountSui: "1.5",
            coinType: "0x2::sui::SUI",
            note: "Thanks for lunch! 🍜",
            status: "pending",
            expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
          });
          setState("ready");
        } else {
          setState("not-found");
        }
      } catch (err) {
        setState("error");
        setError("Failed to load claim details");
      }
    }

    fetchClaim();
  }, [claimId]);

  const handleClaim = async () => {
    if (!currentAccount) return;

    try {
      setState("claiming");

      // In production: call Supabase edge function to claim
      // The edge function would verify the claim token and execute the transfer
      await new Promise((r) => setTimeout(r, 2000));

      setState("success");
    } catch (err: any) {
      setState("error");
      setError(err?.message || "Failed to claim funds");
    }
  };

  // LOADING
  if (state === "loading") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-droplet-950/20">
        <div className="container mx-auto px-4 py-12 max-w-lg">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-droplet-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading claim details...</p>
          </div>
        </div>
      </main>
    );
  }

  // NOT FOUND
  if (state === "not-found") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-droplet-950/20">
        <div className="container mx-auto px-4 py-12 max-w-lg">
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Droplet
            </Button>
          </Link>
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h2 className="text-xl font-bold mb-2">Claim not found</h2>
              <p className="text-muted-foreground">
                This claim link may be invalid or has already been claimed.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // SUCCESS
  if (state === "success") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-droplet-950/20">
        <div className="container mx-auto px-4 py-12 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="py-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">
                  Claimed! 🎉
                </h2>
                <p className="text-muted-foreground mb-2">
                  {claimData?.amountSui} SUI has been sent to your wallet
                </p>
                {claimData?.note && (
                  <p className="text-sm text-muted-foreground italic mb-6">
                    &quot;{claimData.note}&quot;
                  </p>
                )}
                <Link href="/">
                  <Button>
                    <Droplets className="mr-2 h-4 w-4" />
                    Send a Droplet back
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    );
  }

  // ERROR
  if (state === "error") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-droplet-950/20">
        <div className="container mx-auto px-4 py-12 max-w-lg">
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Droplet
            </Button>
          </Link>
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try again
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // READY / CLAIMING — Main claim UI
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-droplet-950/20">
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Droplet
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-droplet-500/20 shadow-xl shadow-droplet-500/5">
            {/* Header */}
            <div className="bg-gradient-to-r from-droplet-600 to-droplet-700 p-6 text-white rounded-t-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Droplets className="h-6 w-6" />
                <span className="font-semibold">Incoming Droplet</span>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold mb-1">
                  {claimData?.amountSui} SUI
                </p>
                <p className="text-white/70 text-sm">
                  from {claimData?.senderAddress.slice(0, 6)}...
                  {claimData?.senderAddress.slice(-4)}
                </p>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Note */}
              {claimData?.note && (
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <p className="text-sm italic text-muted-foreground">
                    &quot;{claimData.note}&quot;
                  </p>
                </div>
              )}

              {/* Expiry */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Expires{" "}
                  {new Date(claimData?.expiresAt || "").toLocaleDateString()}
                </p>
              </div>

              {/* Claim Button */}
              {!currentAccount ? (
                <div className="space-y-3">
                  <p className="text-sm text-center text-muted-foreground">
                    Connect your wallet to claim this Droplet
                  </p>
                  <div className="flex justify-center">
                    <WalletButton />
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleClaim}
                  disabled={state === "claiming"}
                  className="w-full h-14 text-base"
                  size="lg"
                >
                  {state === "claiming" ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-5 w-5" />
                      Claim {claimData?.amountSui} SUI
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
