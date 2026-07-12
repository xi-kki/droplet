# Droplet — Blueprint

> *Send to anyone — username, email or phone.*

## 1. Executive Summary

| Field | Value |
|-------|-------|
| **Project Name** | Droplet |
| **One-Liner** | Send crypto like sending a message — no wallet addresses, just a name/email/phone |
| **Type** | Web3 dApp (Sui) |
| **Problem** | Sending crypto requires wallet addresses — complex, unforgiving, zero UX |
| **Solution** | Social sending via .sui names, email, or phone with claim flow + beautiful receipts |
| **Target Users** | Sui ecosystem users, crypto-curious friends/family, freelancers, merchants |
| **Timeline** | 3-hour sprint (MVP) |
| **Architecture Style** | Modular monolith (Next.js + Supabase + Sui) |

## 2. Product Requirements

```
MVP (Must Have — Phase 1-2)
├── Wallet connection (Sui Wallet + zkLogin)
├── Send to .sui, email, or phone
├── Smart resolution engine (recipient → Sui address)
├── Claim system with email/SMS notifications
├── Transaction history
├── Beautiful receipts (shareable link + PDF)
└── Loading/empty/error states

Phase 2 (Post-MVP)
├── Conditional escrow templates
├── Multichain deposits (BTC/ETH → Sui)
├── Split payments & requests
└── Recurring/subscriptions

Phase 3 (Future)
├── Merchant tools (QR, invoices)
├── Group wallets
└── AI-assisted sending
```

## 3. User Flow

```
SENDER: Connect Wallet → Enter Recipient → Review + Amount → Confirm → Receipt
                          (.sui/email/phone)

RECIPIENT: Get Notified → Click Claim Link → zkLogin/Wallet → Funds Arrived

POST: View Receipt → Share Link → Download PDF
```

## 4. Tech Stack

| Layer | Choice | Justification |
|-------|--------|---------------|
| **Frontend** | Next.js 14 + TypeScript | SSR for receipts/SEO, type safety |
| **Styling** | Tailwind + shadcn/ui + Framer Motion | Fast, beautiful, animated |
| **Blockchain** | @mysten/sui + @mysten/dapp-kit | Official Sui SDK, wallet adapter |
| **Backend** | Supabase (Edge Functions + DB) | Claims, notifications, resolution lookup |
| **Hosting** | Vercel | Zero-config Next.js deploy |
| **Network** | Sui Testnet → Mainnet | Fast iteration first |

## 5. Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Next.js Frontend                     │
│  ┌─────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Send    │  │ Claim    │  │ Receipt           │  │
│  │ Page    │  │ Page     │  │ Page              │  │
│  └────┬────┘  └────┬─────┘  └─────────┬─────────┘  │
│       │            │                   │             │
│  ┌────▼────────────▼───────────────────▼─────────┐  │
│  │           @mysten/dapp-kit Provider            │  │
│  │         (Wallet + SuiClient + PTBs)            │  │
│  └───────────────────┬───────────────────────────┘  │
├──────────────────────┼──────────────────────────────┤
│                  Sui Testnet                         │
│  ┌───────────────────▼───────────────────────────┐  │
│  │  Move Contract: droplet_vault                  │  │
│  │  - VaultObject (shared): holds pending funds   │  │
│  │  - deposit(): sender adds funds                │  │
│  │  - claim(): recipient withdraws                │  │
│  │  - get_pending(): view pending sends           │  │
│  └───────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│                  Supabase                             │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │
│  │ Resolution  │  │ Claims      │  │ Notifications│ │
│  │ Table       │  │ Table       │  │ (Edge Fn)  │  │
│  │ email→addr  │  │ pending     │  │ email/SMS  │  │
│  │ phone→addr  │  │ claimed     │  │            │  │
│  │ .sui→addr   │  │ expired     │  │            │  │
│  └─────────────┘  └─────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────┘
```

## 6. Project Structure

```
droplet-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout + providers
│   │   ├── page.tsx            # Landing / send page
│   │   ├── globals.css         # Tailwind + custom styles
│   │   ├── send/
│   │   │   └── page.tsx        # Send flow
│   │   ├── claim/
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Claim flow
│   │   └── receipt/
│   │       └── [txHash]/
│   │           └── page.tsx    # Receipt view
│   ├── components/
│   │   ├── ui/                 # shadcn components
│   │   ├── send-form.tsx       # Send form
│   │   ├── recipient-input.tsx # Smart recipient resolver
│   │   ├── receipt-card.tsx    # Receipt display
│   │   ├── wallet-button.tsx   # Wallet connect
│   │   └── providers.tsx       # App providers
│   ├── lib/
│   │   ├── sui-networks.ts     # Network config
│   │   ├── resolution.ts       # Resolve email/phone/.sui → address
│   │   ├── supabase.ts         # Supabase client
│   │   └── utils.ts            # Helpers (cn, formatAddress, etc.)
│   └── types/
│       └── index.ts            # Shared types
├── contracts/
│   └── droplet_vault/
│       ├── Move.toml
│       └── sources/
│           └── vault.move      # Escrow contract
├── .env.example
├── .gitignore
├── CLAUDE.md
├── BLUEPRINT.md
├── TODO.md
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 7. Skills Map

| Phase | Skills |
|-------|--------|
| **Foundation** | `senior-engineer` |
| **Core Build** | `sui` (Move contract + SDK) |
| **Quality** | `security_scan`, `eslint` |
| **Ship** | `fast-deploy`, `capture_webpage` |

## 8. Quality Gates

- [x] Secret scan
- [x] .env.example (no hardcoded secrets)
- [ ] Input validation (all user inputs)
- [ ] TypeScript strict mode
- [ ] Loading/empty/error states
- [ ] Happy path works end-to-end
- [ ] README written
- [ ] Deployed to Vercel

## 9. Implementation Roadmap

```
PHASE 1: Foundation (done)
  [x] Repo created
  [x] Next.js scaffold
  [x] Sui SDK installed
  [x] Providers configured
  [ ] .env.example + .gitignore
  [ ] CLAUDE.md

PHASE 2: Core Build (NOW)
  [ ] Move contract (vault + deposit + claim)
  [ ] Wallet connection UI
  [ ] Send form + resolution engine
  [ ] Send transaction (PTB)
  [ ] Claim page + flow
  [ ] Success state

PHASE 3: Polish
  [ ] Receipt component + share link
  [ ] Transaction history
  [ ] Loading/empty/error states
  [ ] Animations (Framer Motion)
  [ ] Dark/light mode

PHASE 4: Ship
  [ ] Deploy to Vercel
  [ ] README.md
  [ ] Push to GitHub
```
