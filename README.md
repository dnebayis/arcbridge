# Arc Bridge

Production‑ready minimal bridge UI powered by Circle BridgeKit for Arc Testnet ↔ Ethereum Sepolia.

## Setup

- Copy `.env.example` to `.env` and fill in values:
  - `VITE_WALLETCONNECT_PROJECT_ID=YOUR_WALLETCONNECT_PROJECT_ID`
  - `PRIVATE_KEY=YOUR_PRIVATE_KEY` (only for CLI usage; do not commit)

- Secrets are ignored by Git via `.gitignore` (includes `.env`, `.env.local`, `.vercel/`).

## Scripts

- `npm run build:web` – build web assets
- `npm run preview -- --host` – serve built website locally
- `npm run build` – TypeScript typecheck

## CLI (optional)

Bridge via CLI without a browser wallet:

```
ts-node src/bridge.ts --estimate --from Arc_Testnet --to Ethereum_Sepolia --amount 10.00
ts-node src/bridge.ts --execute  --from Arc_Testnet --to Ethereum_Sepolia --amount 10.00
```

Environment variables used by the CLI come from `.env`.

## Publishing to GitHub

Run the following commands to publish while keeping secrets private:

```
git init
git add .
git commit -m "Initial public release"
# Create GitHub repo and push (requires GitHub CLI auth):
gh repo create arc-bridge --public --source . --remote origin --push
```

If you prefer manual setup without `gh`:

```
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

## Security

- Never commit `.env`, private keys, API tokens, or provider credentials.
- Verify explorer links: Sepolia via `sepolia.etherscan.io`, Arc Testnet via `testnet.arcscan.app`.
- You can try it here: https://arcbridge-psi.vercel.app/
