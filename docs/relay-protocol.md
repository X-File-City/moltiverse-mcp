# Relay Protocol

## Overview

Relay is a cross-chain bridging and swapping protocol that enables instant token transfers across 50+ EVM and non-EVM chains. The Moltiverse MCP integrates Relay to give agents the ability to move assets between chains — bridging ETH from Ethereum to Ink, swapping tokens across chains in a single step, and checking USD prices for any token on any supported chain.

Relay uses an intent-based architecture where users sign quotes and relayers execute cross-chain fills, providing fast finality without waiting for consensus across both chains.

---

## Tools

### `relay_get_chains`

List all chains supported by Relay with their chain IDs, names, and currency info.

```
relay_get_chains()
→ { chains: [{ id, name, nativeCurrency, ... }] }
```

No parameters required.

---

### `relay_get_currencies`

Search for tokens across all supported chains by symbol or name.

```
relay_get_currencies({ term: "ETH", chainId?: 57073 })
→ { currencies: [{ symbol, name, address, chainId, decimals }] }
```

| Parameter | Required | Description |
|---|---|---|
| `term` | Yes | Token symbol or name to search |
| `chainId` | No | Filter to a specific chain |

---

### `relay_get_price`

Fast price estimate for a bridge or swap route. Returns an estimated output amount without generating an executable quote. Use this for display/planning — use `relay_get_quote` when you need to actually execute.

```
relay_get_price({
  originChainId: 1,
  destinationChainId: 57073,
  originCurrency: "0x0000000000000000000000000000000000000000",
  destinationCurrency: "0x0000000000000000000000000000000000000000",
  amount: "1000000000000000000",
  tradeType: "EXACT_INPUT"
})
→ { price, gasCost, relayerFee }
```

| Parameter | Required | Description |
|---|---|---|
| `originChainId` | Yes | Source chain ID |
| `destinationChainId` | Yes | Destination chain ID |
| `originCurrency` | Yes | Token address on source chain (use `0x000...000` for native) |
| `destinationCurrency` | Yes | Token address on destination chain |
| `amount` | Yes | Amount in wei |
| `tradeType` | Yes | `EXACT_INPUT` or `EXACT_OUTPUT` |

---

### `relay_get_quote`

Get a fully executable cross-chain quote with step-by-step transaction data. The returned quote includes all calldata needed to initiate the bridge/swap on the origin chain.

```
relay_get_quote({
  user: "0x...",
  originChainId: 1,
  destinationChainId: 57073,
  originCurrency: "0x0000000000000000000000000000000000000000",
  destinationCurrency: "0x0000000000000000000000000000000000000000",
  amount: "1000000000000000000",
  tradeType: "EXACT_INPUT"
})
→ { steps: [{ action, description, tx }], fees, timeEstimate }
```

Same parameters as `relay_get_price`, plus `user` (the wallet address initiating the bridge).

---

### `relay_get_token_price`

Get the current USD price of any token on any supported chain.

```
relay_get_token_price({
  chainId: 57073,
  address: "0x4200000000000000000000000000000000000006"
})
→ { price: "3200.45" }
```

| Parameter | Required | Description |
|---|---|---|
| `chainId` | Yes | Chain the token is on |
| `address` | Yes | Token contract address (use `0x000...000` for native) |

---

### `relay_get_requests`

Check the status of a bridge or swap request by its transaction hash or request ID.

```
relay_get_requests({ requestId: "0x..." })
→ { status, originTx, destinationTx, fillTime }
```

---

## Common Use Cases

### Bridge ETH from Ethereum to Ink

```
1. relay_get_quote({
     user: "0x<your-address>",
     originChainId: 1,
     destinationChainId: 57073,
     originCurrency: "0x0000000000000000000000000000000000000000",
     destinationCurrency: "0x0000000000000000000000000000000000000000",
     amount: "500000000000000000",  // 0.5 ETH
     tradeType: "EXACT_INPUT"
   })
2. Execute the returned step transactions with your EVM wallet
3. relay_get_requests({ requestId }) to monitor status
```

### Check Token Price on Ink

```
relay_get_token_price({
  chainId: 57073,
  address: "0x4200000000000000000000000000000000000006"  // WETH on Ink
})
```

---

## Supported Chains (50+)

Relay supports all major EVM chains and several non-EVM chains. Key chains relevant to Moltiverse:

| Chain | Chain ID |
|---|---|
| Ethereum | 1 |
| Ink | 57073 |
| Base | 8453 |
| Optimism | 10 |
| Arbitrum | 42161 |
| Polygon | 137 |
| Solana | (non-EVM) |

Use `relay_get_chains` to get the full current list with native currency details.

---

## Notes

- Native ETH is represented by `0x0000000000000000000000000000000000000000`
- All amounts are in wei (18 decimals for ETH)
- Relay fees are included in the quote — what you see is what you get
- Cross-chain transfers typically complete in 30-60 seconds
