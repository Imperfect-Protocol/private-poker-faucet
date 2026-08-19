# Operations

## Running Locally

Install dependencies and start the app:

```sh
npm install
npm run dev
```

Run against the local Nitro dev node:

```sh
NEXT_PUBLIC_PRIVATE_POKER_CHAIN=devnode npm run dev
```

Run against Arbitrum Sepolia:

```sh
NEXT_PUBLIC_PRIVATE_POKER_CHAIN=sepolia npm run dev
```

If `NEXT_PUBLIC_PRIVATE_POKER_CHAIN` is omitted, the app uses Sepolia.

## Build

```sh
npm run build
```

The build script uses Webpack explicitly:

```text
next build --webpack
```

This avoids optional dependency resolution issues seen with the wallet stack in
this project.

## Configuration

Chain configuration lives in `lib/chain`.

| Chain | File | Purpose |
| --- | --- | --- |
| `devnode` | `lib/chain/devnode.js` | Local Nitro dev node testing |
| `sepolia` | `lib/chain/sepolia.js` | Arbitrum Sepolia testing |

Each chain config defines:

- chain key
- chain ID
- RPC URL
- PPDC contract address
- polling interval
- query stale time
- optional faucet transaction fee overrides

## Local RPC Proxy

When devnode mode is selected, `next.config.mjs` rewrites `/local-rpc` to the
Nitro dev node RPC endpoint. The default target is:

```text
http://localhost:8547
```

The target can be overridden with:

```sh
PRIVATE_POKER_DEVNODE_RPC_URL=http://localhost:8547
```

The rewrite is disabled when the selected chain is not `devnode`.

## Devnode Gas Fees

The local Nitro dev node may reject a faucet transaction when the wallet submits
a `maxFeePerGas` below the current block base fee. The devnode chain config sets
explicit faucet transaction fee overrides:

```text
maxFeePerGas = 1 gwei
maxPriorityFeePerGas = 0.01 gwei
```

Sepolia leaves this override empty so the connected wallet and RPC provider can
estimate fees normally.

## Wallet Configuration

Wallet connection is configured in `components/Providers.jsx` with:

- Reown AppKit
- Wagmi
- Viem HTTP transport
- React Query

The Reown project ID matches the Private Poker Vite app so the same wallet setup
can be used across the development tools.

## Troubleshooting

### Wallet Connects But Funding Is Disabled

Check that:

- the wallet is connected
- the selected chain matches the configured network
- `PPDC_CONTRACT_ADDRESS` is valid for the selected chain
- the allowance read has completed
- the requested amount is greater than zero
- the effective remaining allowance is greater than zero

### Remaining Allowance Shows Zero On A New Account

The app computes an effective allowance from `next_refill`. If `next_refill` is
in the past, the screen should show the monthly maximum even if the raw stored
contract value is zero.

If it still shows zero, verify that the app can read `faucetNextRefill()` and
that the connected wallet is on the selected chain.

### Devnode RPC Does Not Respond

Start or restart the Nitro dev node and confirm it is listening on port `8547`.
If it uses another port, set `PRIVATE_POKER_DEVNODE_RPC_URL`.

### Reown Or Wallet Package Build Errors

This app includes small compatibility choices for the current wallet dependency
tree:

- `next build --webpack` is used for production builds.
- the `accounts` module is aliased to `lib/stubs/accounts.js`.

Keep those in place unless the wallet dependency tree no longer requires them.
