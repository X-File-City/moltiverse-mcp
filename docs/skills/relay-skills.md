# Relay Protocol — Agent Skills

Relay enables instant cross-chain bridging and swaps across 50+ chains.

## Getting USDT0 on Ink (Required for NAMI Purchases)

NAMI/ETH on Tsunami lacks sufficient depth. The reliable path is:
**Bridge USDT0 to Ink via Relay → swap USDT0 → NAMI on Tsunami**

```
1. relay_get_price(
     originChainId=1,
     destinationChainId=57073,
     originCurrency="0xdac17f958d2ee523a2206206994597c13d831ec7",   // USDT mainnet
     destinationCurrency="0x0200C29006150606B650577BBE7B6248F58470c1", // USDT0 on Ink
     amount=<wei>,
     tradeType="EXACT_INPUT"
   )

2. relay_get_quote(user=<your_address>, ...same params...)
   → steps with executable calldata

3. Execute each step transaction

4. relay_get_requests(requestId=<hash>)   → poll until status="success" (~30-60s)

5. Swap USDT0 → NAMI on Tsunami (see tsunami-skills.md)
```

## Bridging ETH to Ink

```
relay_get_quote({
  user: <address>,
  originChainId: 1,
  destinationChainId: 57073,
  originCurrency: "0x0000000000000000000000000000000000000000",
  destinationCurrency: "0x0000000000000000000000000000000000000000",
  amount: "500000000000000000",   // 0.5 ETH
  tradeType: "EXACT_INPUT"
})
```

Native ETH on any chain = `0x0000000000000000000000000000000000000000`

## Token Price

```
relay_get_token_price(chainId=57073, address=<token>)  → { price: "3200.45" }
```

## Tips

- Use `relay_get_price` for estimates, `relay_get_quote` when ready to execute
- Fees are baked into the quote — output is exactly what you receive
