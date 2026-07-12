# Droplet — CLAUDE.md

## 🎯 Overview
- **One-liner:** Send crypto like sending a message — no wallet addresses, just a name/email/phone
- **Type:** Web3 dApp (Sui)
- **Status:** 🟢 Blueprint approved — building

## 🏗️ Tech Stack
- **Language:** TypeScript (strict mode)
- **Frontend:** Next.js 14 (App Router) + Tailwind + shadcn/ui
- **Blockchain:** Sui Testnet (@mysten/sui + @mysten/dapp-kit)
- **Backend:** Supabase (Edge Functions + PostgreSQL)
- **Auth:** Wallet-based (Sui Wallet + zkLogin)
- **Hosting:** Vercel
- **Animations:** Framer Motion

## 📁 Structure
```
src/
├── app/           # Next.js App Router pages
├── components/    # React components (ui/, send-form, receipt, etc.)
├── lib/           # Utilities, Supabase client, Sui config
└── types/         # TypeScript types
contracts/         # Move smart contracts
```

## 🧠 Architecture
- **Data flow:** Sender → Resolution Engine → Sui PTB → Vault Contract → Claim → Recipient
- **Key modules:**
  1. `resolution.ts` — Maps email/phone/.sui → Sui address via Supabase
  2. `vault.move` — On-chain escrow holding pending funds
  3. `send-form.tsx` — The core send UI
  4. `claim/[id]/page.tsx` — Recipient claim flow

## ⚡ Build Order
- Phase 1: Foundation (scaffold, deps, config) ✅
- Phase 2: Core Build (Move contract + Send + Claim)
- Phase 3: Polish (receipts, animations, states)
- Phase 4: Ship (deploy, README, push)

## 🔐 Security (NON-NEGOTIABLE)
1. NEVER commit .env — always use .env.example
2. Validate ALL user inputs (address format, amount > 0)
3. No console.log in production code
4. Handle loading/empty/error states on every page
5. Escrow vault must be audited before mainnet

## ✅ Quality Gates Before Ship
- [ ] Secret scan clean
- [ ] Type check passes (`tsc --noEmit`)
- [ ] Linter clean (`next lint`)
- [ ] Happy path: send → claim → receipt works
- [ ] Error states don't crash app
- [ ] README with setup + demo

## 🚫 What NOT To Do
- Don't chase edge cases before core works
- Don't optimize prematurely
- Don't write custom auth — use zkLogin
- Don't hardcode secrets
- Don't add features outside MVP scope
- Don't deploy to mainnet until audit
