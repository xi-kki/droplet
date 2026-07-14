import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format Sui address to short display: 0x1234...5678 */
export function formatAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/** Convert MIST to SUI (1 SUI = 1_000_000_000 MIST) */
export function mistToSui(mist: string | number): number {
  return Number(mist) / 1_000_000_000;
}

/** Convert SUI to MIST */
export function suiToMist(sui: number): bigint {
  return BigInt(Math.round(sui * 1_000_000_000));
}

/** Format SUI amount for display */
export function formatAmount(mist: string | number | bigint, decimals = 4): string {
  const sui = Number(mist) / 1_000_000_000;
  return sui.toFixed(decimals);
}

/** Detect recipient type from input */
export function detectRecipientType(
  input: string
): "sui" | "email" | "phone" | "address" {
  const trimmed = input.trim();

  // Sui address (0x...)
  if (/^0x[a-fA-F0-9]{64}$/.test(trimmed)) {
    return "address";
  }

  // .sui name
  if (/^.+\.sui$/.test(trimmed)) {
    return "sui";
  }

  // Email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "email";
  }

  // Phone (digits, +, -, spaces, min 7 digits)
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length >= 7 && digits.length <= 15) {
    return "phone";
  }

  // Default — try as .sui name
  return "sui";
}

/** Validate Sui address */
export function isValidSuiAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(address.trim());
}

/** Generate a claim link */
export function getClaimUrl(claimId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/claim/${claimId}`;
}

/** Generate a receipt share URL */
export function getReceiptUrl(txHash: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/receipt/${txHash}`;
}

/** Time ago from timestamp */
export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
