# Droplet — Design Inspiration

## 🎯 Logo Concept: Water Drop Splash

**The Vision:** A single water drop hitting a calm surface, creating a beautiful splash with concentric ripples radiating outward.

**Visual Elements:**
- Central teardrop/droplet shape (the "D" in Droplet)
- Splash crown at the point of impact
- Ripple circles expanding outward (representing payment reaching others)
- Clean, minimal, modern aesthetic

**Color Palette:**
- Primary: `#00D4FF` (Electric Blue) — trust, technology, water
- Secondary: `#7C3AED` (Purple) — premium, Sui brand alignment
- Accent: `#10B981` (Emerald) — success, money
- Background: Dark mode `#0F172A` / Light mode `#FFFFFF`

---

## 📱 Similar Apps for UI Inspiration

### 1. **Venmo** — The Social Payment King
**What to steal:**
- Activity feed with friends' transactions (social proof)
- Emoji reactions on payments
- Clean amount input with prominent "$" 
- Recipient avatars front and center
- Dark mode with vibrant green accents

**Landing page ideas:**
- Hero: Phone mockup showing a payment in progress
- Tagline: "Send money like texting"
- Social proof: "100M+ users trust Venmo"

**Droplet adaptation:**
- Show resolution (email → wallet) as the magic moment
- "Send to anyone. Seriously. Just their email."

---

### 2. **Cash App** — The Clean Minimalist
**What to steal:**
- Green-on-black aesthetic (bold, confident)
- Huge "$" button as primary CTA
- Cashtag as identity (@username)
- Bitcoin/stock integration UI
- Round numbers, big typography

**Landing page ideas:**
- Single color hero (deep green)
- Animated payment flow
- "Pay. Get Paid. Save. Invest."

**Droplet adaptation:**
- Sui-branded version of Cashtag (.sui names)
- "Your Sui identity. Share it everywhere."

---

### 3. **Zelle** — The Bank-Integrated One
**What to steal:**
- Email/phone as primary identifiers
- Bank trust signals (FDIC, security badges)
- Simple two-field form (Who + Amount)
- Transaction confirmation screens
- Integration with existing banking UI

**Landing page ideas:**
- Partner bank logos for trust
- "Send money directly between bank accounts"
- Security-first messaging

**Droplet adaptation:**
- "Works with any Sui wallet"
- "No wallet? No problem. Claim with email."

---

### 4. **Wise (TransferWise)** — The Global One
**What to steal:**
- Currency conversion UI (visual, clear)
- Fee transparency
- Multi-currency account display
- Transfer progress tracking
- Professional, trustworthy design

**Landing page ideas:**
- Calculator widget showing real rates
- "Send abroad. Spend abroad."
- Comparison table vs banks

**Droplet adaptation:**
- "Cross-chain? Coming soon."
- Show SUI price, network fees upfront

---

### 5. **Revolut** — The Premium Fintech
**What to steal:**
- Card visualization (3D tilt effect)
- Spending analytics charts
- Dark mode with gradient accents
- Vault/savings features
- Crypto + fiat in one place

**Landing page ideas:**
- Card reveal animation
- "One app. All your money."
- Feature comparison vs traditional banks

**Droplet adaptation:**
- Show SUI balance with USD equivalent
- "Crypto payments. Fintech UX."

---

### 6. **Strike** — The Bitcoin Lightning One
**What to steal:**
- Bitcoin-first branding
- Lightning Network speed emphasis
- Simple, fast, global messaging
- Employer/payroll integration
- Price: "Send anywhere. Instantly. For free."

**Landing page ideas:**
- Speed animation (instant settlement)
- "Global payments. Local speed."
- Merchant acceptance map

**Droplet adaptation:**
- "Sui Speed. Global Reach."
- Show transaction time: "< 2 seconds"

---

## 🎨 Landing Page Structure (Best Practices)

### Hero Section
```
┌─────────────────────────────────────────────────┐
│  [Logo]                    [Connect Wallet]     │
│                                                 │
│     Send SUI to Anyone.                         │
│     Email. Phone. Username.                     │
│                                                 │
│     [  Enter Amount  ]                          │
│     [  Recipient      ]                         │
│     [  Send Now →  ]                            │
│                                                 │
│     ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│     │ <2s     │  │ 0%      │  │ No      │      │
│     │ Speed   │  │ Fees    │  │ Wallet  │      │
│     └─────────┘  └─────────┘  └─────────┘      │
│                                                 │
│     [Phone Mockup with Send Animation]          │
└─────────────────────────────────────────────────┘
```

### Features Section
```
┌─────────────────────────────────────────────────┐
│  How Droplet Works                              │
│                                                 │
│  1️⃣  Enter recipient email/phone/username       │
│  2️⃣  Enter amount                               │
│  3️⃣  Confirm — done!                            │
│                                                 │
│  [Animated flow diagram]                        │
└─────────────────────────────────────────────────┘
```

### Trust Section
```
┌─────────────────────────────────────────────────┐
│  Built on Sui. Secured by you.                  │
│                                                 │
│  🔒 Non-custodial                               │
│  ⚡ Instant settlement                          │
│  🌍 Send anywhere                               │
│  💰 Low fees                                    │
└─────────────────────────────────────────────────┘
```

### Social Proof
```
┌─────────────────────────────────────────────────┐
│  Join the Droplet                               │
│                                                 │
│  [Avatar] [Avatar] [Avatar] [Avatar] [Avatar]   │
│  "10,000+ payments sent"                        │
│                                                 │
│  ⭐⭐⭐⭐⭐ "Finally, crypto payments that       │
│  don't require a CS degree" — @user             │
└─────────────────────────────────────────────────┘
```

---

## 🖼️ Key UI Components to Build

### 1. Send Form (Primary CTA)
- Large amount input (auto-format with decimals)
- Recipient input with resolution status
- "Resolving..." → "alice@email.com → 0x7a3f..."
- Send button with loading state

### 2. Claim Card (For Recipients)
- "You've received X SUI!"
- One-click claim button
- "Create wallet" or "Connect existing"

### 3. Receipt Card
- Transaction hash (truncated)
- Amount + USD equivalent
- Sender → Recipient
- Timestamp
- Share button

### 4. Transaction History
- List view with avatars
- Amount + recipient
- Status (pending/success/failed)
- Click to view receipt

---

## 🎬 Animations to Implement

### Framer Motion Examples:
1. **Drop splash** — Logo animation on load
2. **Amount counter** — Numbers animate when typing
3. **Resolution pulse** — Glowing effect when resolving
4. **Success confetti** — After payment sent
5. **Card tilt** — 3D effect on hover
6. **Ripple effect** — On button click

---

## 📐 Typography

**Headers:** Inter or Plus Jakarta Sans (bold, modern)
**Body:** Inter (clean, readable)
**Mono:** JetBrains Mono (addresses, amounts)

---

## 🔗 Quick Reference Links

- Dribbble: Search "payment app" "fintech UI"
- Behance: Search "mobile banking" "crypto wallet"
- Mobbin: Search "Venmo" "Cash App" for mobile patterns
- Stripe: checkout.stripe.com for payment flow inspiration
