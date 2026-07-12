// ============================================================
// Droplet — Core Types
// ============================================================

/** Recipient identifier — .sui name, email, or phone */
export type RecipientType = "sui" | "email" | "phone";

/** Resolution result — what the engine returns */
export interface ResolvedRecipient {
  type: RecipientType;
  input: string;
  suiAddress: string;
  displayName: string;
}

/** Pending claim — stored in Supabase */
export interface PendingClaim {
  id: string;
  senderAddress: string;
  recipientIdentifier: string;
  recipientType: RecipientType;
  resolvedAddress: string | null;
  amountMist: string; // string because u64
  coinType: string;
  txDigest: string;
  status: "pending" | "claimed" | "expired" | "refunded";
  createdAt: string;
  claimedAt: string | null;
  claimLinkToken: string;
}

/** Receipt data — for display + sharing */
export interface ReceiptData {
  txDigest: string;
  senderAddress: string;
  recipientAddress: string;
  recipientDisplayName: string;
  amountMist: string;
  coinType: string;
  timestamp: number;
  status: "confirmed" | "pending" | "failed";
}

/** Coin metadata */
export interface CoinInfo {
  type: string;
  symbol: string;
  decimals: number;
  iconUrl?: string;
}
