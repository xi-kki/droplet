"use client";

import { useWalletClient } from "@mysten/dapp-kit";
import { ConnectButton } from "@mysten/dapp-kit";
import { formatAddress } from "@/lib/utils";

export function WalletButton() {
  return (
    <ConnectButton
      style={{
        backgroundColor: "hsl(217, 91%, 60%)",
        color: "white",
        borderRadius: "12px",
        padding: "8px 16px",
        fontSize: "14px",
        fontWeight: "500",
        border: "none",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    />
  );
}
