# 💧 Droplet

> Send crypto like sending a message — no wallet addresses, just a name, email, or phone.

![Droplet](https://img.shields.io/badge/Built_on-Sui-6FBCF0?style=flat-square&logo=sui)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)

## What is Droplet?

Droplet eliminates the friction of sending crypto. Instead of copying long wallet addresses, you send to a **.sui name**, **email**, or **phone number**. The recipient gets a beautiful claim link and can receive funds in seconds.

### Features

- 🔗 **Send to anyone** — .sui name, email, or phone number
- ⚡ **Instant transfers** — Sui's 2-second finality
- 🎨 **Beautiful receipts** — shareable links with transaction details
- 🔐 **On-chain escrow** — funds held safely until claimed
- 🌙 **Dark/Light mode** — easy on the eyes, day or night
- 📱 **Mobile-first** — works beautifully on any device

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| UI | shadcn/ui, Framer Motion |
| Blockchain | Sui Testnet (@mysten/sui, @mysten/dapp-kit) |
| Backend | Supabase (Edge Functions + PostgreSQL) |
| Hosting | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- A Sui wallet (Sui Wallet or Suiet)
- Supabase project (optional — works without it in demo mode)

### Setup

```bash
# Clone the repo
git clone https://github.com/xi-kki/droplet.git
cd droplet

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
# Supabase (optional — app works in demo mode without these)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Sui Network
NEXT_PUBLIC_SUI_NETWORK=testnet

# App URL (for shareable links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Supabase Setup

Run the SQL in `supabase/schema.sql` in your Supabase SQL Editor to create the required tables:

1. `resolutions` — maps email/phone/.sui → Sui address
2. `pending_claims` — tracks sent but unclaimed droplets
3. `notifications` — tracks sent notifications
4. RLS policies for secure access
5. RPC functions: `claim_droplet()`, `is_claim_valid()`

## How It Works

```
SENDER                              RECIPIENT
  │                                    │
  ├── Connect Wallet                   │
  ├── Enter recipient (.sui/email)     │
  ├── Set amount + note                │
  ├── Sign transaction                 │
  │                                    │
  │   ┌─────────────────────────┐      │
  │   │  Sui Blockchain         │      │
  │   │  Vault holds funds      │      │
  │   └─────────────────────────┘      │
  │                                    │
  │                         Gets claim link
  │                         Connects wallet
  │                         Claims funds
  │                                    │
  ├── Receipt generated ◄─────────────┘
```

## Project Structure

```
droplet/
├── src/
│   ├── app/              # Next.js pages
│   │   ├── page.tsx      # Home + send form
│   │   ├── claim/        # Claim flow
│   │   └── receipt/      # Receipt view
│   ├── components/       # React components
│   ├── lib/              # Utilities & config
│   └── types/            # TypeScript types
├── contracts/
│   └── droplet_vault/    # Move smart contract
├── supabase/
│   └── schema.sql        # Database schema
└── public/               # Static assets
```

## Smart Contract

The Move contract (`contracts/droplet_vault/`) implements:

- **deposit()** — Sender registers a pending transfer
- **claim()** — Recipient marks funds as claimed
- **refund()** — Sender reclaims expired, unclaimed funds

Events are emitted for indexing and tracking.

## Roadmap

- [x] Wallet connection
- [x] Send form with recipient resolution
- [x] Claim flow
- [x] Receipt component + shareable links
- [x] Transaction history
- [x] Dark/Light mode
- [x] Loading/error states
- [x] Supabase backend (claims, resolution)
- [x] Move contract (escrow tracking)
- [ ] zkLogin for walletless recipients
- [ ] PDF receipt download
- [ ] Email/SMS notifications
- [ ] Mainnet deployment
- [ ] Merchant tools

## Contributing

1. Fork the repo
2. Create your branch (`git checkout -b feat/amazing`)
3. Commit (`git commit -m 'feat: amazing thing'`)
4. Push (`git push origin feat/amazing`)
5. Open a Pull Request

## License

MIT © 2026
