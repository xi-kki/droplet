# Droplet — Build Phases

## Phase 1: Foundation ✅ DONE
- [x] Create GitHub repo
- [x] Scaffold Next.js + TypeScript + Tailwind
- [x] Install Sui SDK (@mysten/sui, @mysten/dapp-kit)
- [x] Set up providers (SuiClient, Wallet, Theme)
- [x] Configure .env.local + .env.example
- [x] Create CLAUDE.md (AI rules file)
- [x] Base layout + global styles
- [x] BLUEPRINT.md
- [x] setup.sh + deploy.sh

## Phase 2: Core Send Flow ✅ DONE
- [x] Wallet connection UI (Sui wallet selector) → `wallet-button.tsx`
- [x] Send form — recipient input (.sui / email / phone) → `send-form.tsx`
- [x] Smart resolution engine → `resolution.ts`
- [x] Send transaction (PTB with splitCoins + transferObjects) → `send-form.tsx`
- [x] Success state + celebration animation → `send-form.tsx` (Framer Motion)
- [x] Basic transaction history (read from chain) → `transaction-history.tsx`

## Phase 3: Claim System ⚠️ PARTIAL
- [x] Claim page — `/claim/[id]` → `claim/[id]/page.tsx`
- [ ] zkLogin integration for walletless recipients ← **POST-MVP**
- [x] Claim flow — guided setup + claim funds (mock)
- [ ] Notification system (Supabase edge functions) ← **POST-MVP**

## Phase 4: Receipts & Polish ✅ DONE
- [x] Beautiful receipt component → `receipt-card.tsx`
- [x] Shareable receipt link → `/receipt/[txHash]`
- [ ] PDF download of receipt ← **POST-MVP**
- [x] Dark/light mode toggle → `theme-toggle.tsx` + `next-themes`
- [x] Loading/empty/error states → `loading-skeleton.tsx`
- [x] Micro-interactions (Framer Motion)

## Phase 5: Edge Cases & Hardening ❌ NOT DONE
- [ ] Wrong recipient error handling ← **NEEDS DOING**
- [ ] Transaction failure → auto-refund flow ← **NEEDS DOING**
- [ ] High-value transfer confirmation (2FA optional)
- [ ] Claim link expiration + grace period
- [ ] Multiple claim attempts → only one succeeds

## Phase 6: Ship ✅ DONE
- [x] Install deps → Vercel handles on deploy
- [ ] Deploy to Vercel ← `bash deploy.sh`
- [x] README.md
- [x] Push to GitHub → https://github.com/xi-kki/droplet-app
- [ ] Demo video / screenshots

---

## 🎯 WHAT TO DO NEXT (Priority Order)

1. **`npm install`** — Run in terminal, deps not installed yet
2. **README.md** — Setup + demo instructions
3. **Transaction history** — Show past sends on home page
4. **Loading/error states** — Per CLAUDE.md quality gate
5. **Dark/light mode** — Toggle in navbar
6. **Push to GitHub** — `git add . && git commit -m "feat: MVP" && git push`
7. **Deploy** — `bash deploy.sh`

---

## Future Phases (Post-MVP)
- **Phase 7:** Conditional escrow (pay when delivered, split on outcome)
- **Phase 8:** Multichain receiving (BTC/ETH → Sui via bridges)
- **Phase 9:** Split payments & requests
- **Phase 10:** Recurring/subscriptions
- **Phase 11:** Merchant tools (QR, invoices)
- **Phase 12:** Group wallets
