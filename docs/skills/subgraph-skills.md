# Subgraph Analytics — Agent Skills

Indexes all Tsunami V3 activity on Ink: swaps, mints, burns, daily metrics.

## Quick Stats

```
subgraph_protocol_stats()
→ { tvlUSD, volumeUSD, feesUSD, txCount }
```

## Find Pools

```
subgraph_pools(limit=20, orderBy="tvlUSD")
→ [{ poolAddress, token0, token1, feeTier, tvlUSD, volumeUSD24h }]
```

Use before routing a swap — confirm pool has sufficient TVL.

## Track Your Positions

```
subgraph_user_positions(address=<wallet>)
→ [{ tokenId, pool, token0Amount, token1Amount, feesEarned0, feesEarned1 }]

subgraph_user_transactions(address=<wallet>, limit=50)
→ [{ type: "mint"|"burn"|"swap", pool, amount0, amount1, timestamp }]
```

## Market Activity

```
subgraph_recent_swaps(limit=20)      → latest swap events
subgraph_daily_data(days=30)         → { date, tvlUSD, volumeUSD, feesUSD }
```

## Workflow: Evaluate a Pool Before Providing Liquidity

```
1. subgraph_pools()              → find pool, check TVL
2. subgraph_recent_swaps()       → confirm active volume
3. subgraph_daily_data(days=7)   → check fee generation trend
4. tsunami_get_pool_info(pool)   → current tick and price
5. tsunami_mint_position(...)    → provide liquidity
```
