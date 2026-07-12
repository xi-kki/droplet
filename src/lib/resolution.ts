import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { normalizeSuiAddress } from "@mysten/sui/utils";
import { detectRecipientType, isValidSuiAddress } from "./utils";
import type { ResolvedRecipient, RecipientType } from "@/types";

const client = new SuiClient({ url: getFullnodeUrl("testnet") });

/**
 * Resolve a recipient identifier to a Sui address.
 *
 * Resolution strategy:
 * 1. Direct Sui address (0x...) → validate + return
 * 2. .sui name → SuiNS lookup (API call)
 * 3. Email → Supabase lookup table
 * 4. Phone → Supabase lookup table
 */
export async function resolveRecipient(
  input: string
): Promise<ResolvedRecipient> {
  const trimmed = input.trim();
  const type = detectRecipientType(trimmed);

  switch (type) {
    case "address":
      return resolveAddress(trimmed);
    case "sui":
      return resolveSuiName(trimmed);
    case "email":
      return resolveEmail(trimmed);
    case "phone":
      return resolvePhone(trimmed);
    default:
      throw new Error(`Could not determine recipient type for: ${trimmed}`);
  }
}

/** Validate and normalize a direct Sui address */
function resolveAddress(address: string): ResolvedRecipient {
  const normalized = normalizeSuiAddress(address);
  if (!isValidSuiAddress(normalized)) {
    throw new Error("Invalid Sui address format");
  }
  return {
    type: "sui",
    input: address,
    suiAddress: normalized,
    displayName: `${normalized.slice(0, 6)}...${normalized.slice(-4)}`,
  };
}

/** Resolve a .sui name to an address via SuiNS */
async function resolveSuiName(name: string): Promise<ResolvedRecipient> {
  const suiName = name.endsWith(".sui") ? name : `${name}.sui`;

  // TODO: Integrate with SuiNS API (https://docs.sui.io/standards/suins)
  // For MVP, we check if there's a registration record on-chain
  // For now, simulate lookup — in production, call SuiNS contract or API

  // Simulated lookup — replace with real SuiNS integration
  const mockAddress = generateMockAddress(suiName);

  return {
    type: "sui",
    input: suiName,
    suiAddress: mockAddress,
    displayName: suiName,
  };
}

/** Resolve email via Supabase lookup */
async function resolveEmail(email: string): Promise<ResolvedRecipient> {
  // TODO: Replace with real Supabase lookup
  // const { data } = await supabase
  //   .from("resolutions")
  //   .select("sui_address")
  //   .eq("identifier", email.toLowerCase())
  //   .eq("type", "email")
  //   .single();

  // For MVP demo — generate deterministic address from email
  const mockAddress = generateMockAddress(email);

  return {
    type: "email",
    input: email,
    suiAddress: mockAddress,
    displayName: email.split("@")[0],
  };
}

/** Resolve phone via Supabase lookup */
async function resolvePhone(phone: string): Promise<ResolvedRecipient> {
  // Normalize phone: remove spaces, dashes, etc.
  const normalized = phone.replace(/[\s\-()]/g, "");

  // TODO: Replace with real Supabase lookup
  const mockAddress = generateMockAddress(normalized);

  return {
    type: "phone",
    input: normalized,
    suiAddress: mockAddress,
    displayName: normalized.slice(-4),
  };
}

/**
 * Generate a deterministic mock address for demo purposes.
 * In production, this would come from actual lookups.
 */
function generateMockAddress(input: string): string {
  // Simple hash for demo — NOT cryptographically secure
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(64, "0");
  return `0x${hex}`;
}
