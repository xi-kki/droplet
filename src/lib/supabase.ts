import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/** Supabase client — null if env vars not configured (demo mode) */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/** Check if Supabase is configured */
export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

// ============================================================
// Resolution Functions
// ============================================================

/**
 * Look up a Sui address by email, phone, or .sui name.
 * Returns null if not found or if Supabase is not configured.
 */
export async function lookupResolution(
  identifier: string,
  type: "email" | "phone" | "sui"
): Promise<string | null> {
  if (!supabase) return null;

  const { data } = await supabase
    .from("resolutions")
    .select("sui_address")
    .eq("identifier", identifier.toLowerCase())
    .eq("identifier_type", type)
    .single();

  return data?.sui_address ?? null;
}

/**
 * Save a new resolution (email/phone → Sui address).
 */
export async function saveResolution(
  identifier: string,
  type: "email" | "phone" | "sui",
  suiAddress: string
): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");

  await supabase.from("resolutions").upsert(
    {
      identifier: identifier.toLowerCase(),
      identifier_type: type,
      sui_address: suiAddress,
    },
    { onConflict: "identifier,identifier_type" }
  );
}

// ============================================================
// Claim Functions
// ============================================================

export interface CreateClaimParams {
  senderAddress: string;
  recipientIdentifier: string;
  recipientType: "email" | "phone" | "sui";
  resolvedAddress: string | null;
  amountMist: string;
  txDigest: string;
  note?: string;
}

/**
 * Create a new pending claim.
 */
export async function createClaim(
  params: CreateClaimParams
): Promise<string> {
  if (!supabase) throw new Error("Supabase not configured");

  const claimToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const { error } = await supabase.from("pending_claims").insert({
    claim_token: claimToken,
    sender_address: params.senderAddress,
    recipient_identifier: params.recipientIdentifier.toLowerCase(),
    recipient_type: params.recipientType,
    resolved_address: params.resolvedAddress,
    amount_mist: params.amountMist,
    tx_digest: params.txDigest,
    note: params.note || null,
    expires_at: expiresAt.toISOString(),
    status: "pending",
  });

  if (error) throw error;
  return claimToken;
}

/**
 * Look up a claim by its token.
 */
export async function getClaimByToken(claimToken: string) {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("pending_claims")
    .select("*")
    .eq("claim_token", claimToken)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark a claim as claimed.
 */
export async function markClaimed(
  claimToken: string,
  claimerAddress: string
): Promise<boolean> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase.rpc("claim_droplet", {
    p_claim_token: claimToken,
    p_claimer_address: claimerAddress,
  });

  if (error) throw error;
  return data as boolean;
}

/**
 * Get all claims for a sender (transaction history).
 */
export async function getSenderClaims(senderAddress: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("pending_claims")
    .select("*")
    .eq("sender_address", senderAddress)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get all claims for a recipient.
 */
export async function getRecipientClaims(recipientAddress: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("pending_claims")
    .select("*")
    .eq("resolved_address", recipientAddress)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
