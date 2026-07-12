import { getFullnodeUrl } from "@mysten/sui/client";

export const networks = {
  devnet: {
    url: getFullnodeUrl("devnet"),
    wallet: "devnet",
  },
  testnet: {
    url: getFullnodeUrl("testnet"),
    wallet: "testnet",
  },
  mainnet: {
    url: getFullnodeUrl("mainnet"),
    wallet: "mainnet",
  },
} as const;

export const DEFAULT_NETWORK = "testnet" as const;

/** Package ID — replace after deploying contract */
export const DROPLET_PACKAGE_ID =
  process.env.NEXT_PUBLIC_DROPLET_PACKAGE_ID || "0x0";

/** SUI coin type */
export const SUI_COIN_TYPE = "0x2::sui::SUI";
