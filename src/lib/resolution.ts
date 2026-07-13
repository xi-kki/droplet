import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { normalizeSuiAddress } from "@mysten/sui/utils";
import { detectRecipientType, isValidSuiAddress } from "./utils";
import { lookupResolution } from "./supabase";
import type { ResolvedRecipient } from "@/types";

const client = new SuiClient({ url: getFullnodeUrl("testnet") });

// ─── Error Handling ────────────────────────────────────────────────

export class ResolutionError extends Error {
  constructor(
    message: string,
    public code:
      | "INVALID_INPUT"
      | "NOT_FOUND"
      | "NETWORK_ERROR"
      | "SELF_SEND"
      | "RESOLUTION_FAILED",
    public userInput?: string
  ) {
    super(message);
    this.name = "ResolutionError";
  }
}

function getValidationError(
  type: "address" | "sui" | "email" | "phone",
  input: string
): string | null {
  switch (type) {
    case "address":
      if (!input.startsWith("0x") || input.length < 42) {
        return "Invalid Sui address — should start with 0x and be 42+ characters";
      }
      break;
    case "sui":
      if (!input.includes(".sui")) {
        return "Sui names should end with .sui (e.g., alice.sui)";
      }
      if (input.split(".")[0].length < 1) {
        return "Please enter a valid .sui name";
      }
      break;
    case "email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
        return "Please enter a valid email address";
      }
      break;
    case "phone":
      const digits = input.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) {
        return "Phone number should be 7-15 digits";
      }
      break;
  }
  return null;
}

// ─── Main Resolution Function ──────────────────────────────────────

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
  input: string,
  senderAddress?: string
): Promise<ResolvedRecipient> {
  const trimmed = input.trim();

  // Empty input
  if (!trimmed) {
    throw new ResolutionError(
      "Please enter a recipient",
      "INVALID_INPUT",
      input
    );
  }

  // Determine type
  const type = detectRecipientType(trimmed);

  if (!type) {
    throw new ResolutionError(
      "Could not determine recipient type. Use an email, phone, .sui name, or Sui address.",
      "INVALID_INPUT",
      input
    );
  }

  // Validate format before resolving
  const validationError = getValidationError(type, trimmed);
  if (validationError) {
    throw new ResolutionError(validationError, "INVALID_INPUT", trimmed);
  }

  // Resolve based on type
  try {
    let resolved: ResolvedRecipient;

    switch (type) {
      case "address":
        resolved = resolveAddress(trimmed);
        break;
      case "sui":
        resolved = await resolveSuiName(trimmed);
        break;
      case "email":
        resolved = await resolveEmail(trimmed);
        break;
      case "phone":
        resolved = await resolvePhone(trimmed);
        break;
      default:
        throw new Error("Unknown recipient type");
    }

    // Self-send check
    if (senderAddress && resolved.suiAddress === senderAddress) {
      throw new ResolutionError(
        "You can't send a Droplet to yourself!",
        "SELF_SEND",
        trimmed
      );
    }

    return resolved;
  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof ResolutionError) {
      throw error;
    }
    // Wrap network/unknown errors
    throw new ResolutionError(
      "Network error — please check your connection and try again",
      "NETWORK_ERROR",
      trimmed
    );
  }
}

// ─── Resolution Strategies ─────────────────────────────────────────

/** Validate and normalize a direct Sui address */
function resolveAddress(address: string): ResolvedRecipient {
  const normalized = normalizeSuiAddress(address);

  if (!isValidSuiAddress(normalized)) {
    throw new ResolutionError(
      "Invalid Sui address format",
      "INVALID_INPUT",
      address
    );
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
  // For MVP, generate deterministic address for demo
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
  // Try real Supabase lookup first
  try {
    const realAddress = await lookupResolution(email, "email");
    if (realAddress) {
      return {
        type: "email",
        input: email,
        suiAddress: realAddress,
        displayName: email.split("@")[0],
      };
    }
  } catch (error) {
    console.warn("Supabase lookup failed, using fallback:", error);
  }

  // Fallback: generate deterministic address for demo
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
  const normalized = phone.replace(/[\s\-()]/g, "");

  // Try real Supabase lookup first
  try {
    const realAddress = await lookupResolution(normalized, "phone");
    if (realAddress) {
      return {
        type: "phone",
        input: normalized,
        suiAddress: realAddress,
        displayName: normalized.slice(-4),
      };
    }
  } catch (error) {
    console.warn("Supabase lookup failed, using fallback:", error);
  }

  // Fallback: generate deterministic address for demo
  const mockAddress = generateMockAddress(normalized);
  return {
    type: "phone",
    input: normalized,
    suiAddress: mockAddress,
    displayName: normalized.slice(-4),
  };
}

// ─── Helpers ───────────────────────────────────────────────────────

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
