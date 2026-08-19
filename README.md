# Private Poker Faucet

Small Next.js app for self-service PPDC test funding.

The faucet lets a connected wallet fund itself with test PPDC, capped at $100 per
refill period. It is intended for local devnode and Arbitrum Sepolia testing of
the Private Poker chip and settlement flows.

## Documentation

- [Overview](docs/overview.md)
- [Funding Flow](docs/funding-flow.md)
- [Operations](docs/operations.md)

## Local Development

```sh
npm install
npm run dev
```

Use `NEXT_PUBLIC_PRIVATE_POKER_CHAIN=devnode` for the local Nitro dev node, or
omit it for Arbitrum Sepolia.

```sh
NEXT_PUBLIC_PRIVATE_POKER_CHAIN=devnode npm run dev
```
