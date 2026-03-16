# Tsunami V3 DEX — Agent Skills

Tsunami is a concentrated liquidity DEX on Ink (Uniswap V3 fork) with extended fee tiers.

## Swapping Tokens

**Always get a quote first** before executing any swap.

```
1. tsunami_quote_exact_input(tokenIn, tokenOut, amountIn, fee)
   → amountOut, priceImpact

2. tsunami_swap_exact_input(tokenIn, tokenOut, amountIn, minAmountOut, fee)
   → txHash
```

**Fee tiers:** 100 (0.01%), 500 (0.05%), 3000 (0.3%), 10000 (1%)
Use 3000 for most pairs. Use 10000 for newly launched Sentry tokens.

**Amounts are always in wei** — check decimals with `erc20_balance` first.

### Buying NAMI Token

NAMI has no direct ETH pool on Tsunami with sufficient depth. Use this two-step route:

```
Step 1 — Acquire USDT0 on Ink via Relay (see relay-skills.md):
  relay_get_quote(originChainId=1, destinationChainId=57073,
                  originCurrency=<USDT_mainnet>,
                  destinationCurrency=0x0200C29006150606B650577BBE7B6248F58470c1,
                  amount=..., tradeType="EXACT_INPUT")
  → execute steps, wait for bridge confirmation (~30-60s)

Step 2 — Swap USDT0 → NAMI on Tsunami:
  tsunami_quote_exact_input(
    tokenIn=0x0200C29006150606B650577BBE7B6248F58470c1,   // USDT0
    tokenOut=0x40f297b5a31FB7D28169Ba75666bea38122860c2,  // NAMI
    amountIn=<usdt0_amount_in_wei>,
    fee=10000
  )
  tsunami_swap_exact_input(tokenIn=USDT0, tokenOut=NAMI, ...)
```

## Providing Liquidity

```
1. tsunami_get_pool(token0, token1, fee)      → poolAddress, currentTick
2. tsunami_mint_position(token0, token1, fee,
     tickLower, tickUpper, amount0, amount1)  → tokenId (LP NFT)
3. tsunami_collect_fees(tokenId)              → fees earned
4. tsunami_remove_liquidity(tokenId, percent) → tokens returned
```

**Tick spacing** by fee tier: 100→1, 500→10, 3000→60, 10000→200

## Common Mistakes

- Skipping `minAmountOut` — always set to at least 95% of quoted output
- Wrong fee tier — the pool won't exist if fee tier doesn't match
- Amounts not in wei — confirm token decimals first with `erc20_balance`
