# Arc Bridge

A cross-chain USDC bridge between **Arc Testnet** and **Ethereum Sepolia** using [Circle CCTP V2](https://developers.circle.com/stablecoins/cctp-getting-started). Native USDC transfers — no wrapped tokens.

**Live demo:** [arcbridge-liard.vercel.app](https://arcbridge-liard.vercel.app/)

---

## Features

- Bridge USDC between Arc Testnet and Ethereum Sepolia
- Circle CCTP V2 fast mode (sub-minute finality)
- Transaction history with live status tracking
- Shareable bridge receipt as downloadable PNG
- Share on X with one click
- Responsive UI with wallet connect (RainbowKit + wagmi)

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, Edge Runtime)
- [wagmi](https://wagmi.sh) + [RainbowKit](https://rainbowkit.com) — wallet connection
- [Circle CCTP V2](https://developers.circle.com) — cross-chain USDC
- [next/og](https://nextjs.org/docs/app/api-reference/functions/image-response) — receipt image generation
- Tailwind CSS v4 + shadcn/ui

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/arc-bridge.git
cd arc-bridge
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in the values in `.env.local`:

| Variable | Description | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Project ID | [cloud.walletconnect.com](https://cloud.walletconnect.com) |
| `NEXT_PUBLIC_ETHERSCAN_API_KEY` | Etherscan API key (for tx history) | [etherscan.io/myapikey](https://etherscan.io/myapikey) |

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/arc-bridge)

1. Connect your GitHub repo on [vercel.com](https://vercel.com)
2. Add the environment variables in Vercel project settings:
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - `NEXT_PUBLIC_ETHERSCAN_API_KEY`
3. Deploy — `VERCEL_URL` is set automatically by Vercel

## Testnet Resources

- [USDC Faucet](https://faucet.circle.com) — get testnet USDC
- [Arc Explorer](https://testnet.arcscan.app) — Arc Testnet block explorer
- [Sepolia Etherscan](https://sepolia.etherscan.io) — Sepolia block explorer

## Built by

[siyabald.vercel.app](https://siyabald.vercel.app) · [@siyabaldacc](https://x.com/siyabaldacc)
