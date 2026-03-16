# NADO Perps DEX — Agent Skills

NADO is a CLOB DEX on Ink powered by Vertex Protocol. Spot and perps up to 20x leverage.

## Subaccounts

Every position lives in a subaccount: `address + name (12 chars)`.
Default name: `"default"` — use this consistently.

## Check Markets and Prices

```
nado_get_markets()                  → [{ symbol, productId, type }]
nado_get_market_price("ETH-PERP")   → { bid, ask, markPrice }
nado_get_funding_rate("ETH-PERP")   → { fundingRate, annualizedRate }
```

## Place an Order

```
nado_place_order({
  market: "ETH-PERP",
  side: "buy",           // "buy" or "sell"
  price: "2000.50",      // limit price
  size: "0.1",           // base asset units (ETH, not USD)
  orderType: "GTC",      // GTC | IOC | FOK
  subaccountName: "default"
})
```

**Order types:** GTC = resting limit. IOC = fill-or-cancel immediately (use for market orders). FOK = all-or-nothing.
**Market order:** use IOC with price slightly above ask (buy) or below bid (sell).

## Check Positions and Orders

```
nado_get_account(address, "default")      → { portfolioValue, freeMargin }
nado_get_positions(address, "default")    → [{ market, size, entryPrice, unrealizedPnl }]
nado_get_open_orders(address, "default")  → [{ orderId, market, price, size }]
```

## Cancel

```
nado_cancel_order(digest=<orderId>)
nado_cancel_all(address, subaccountName)
```

## Common Mistakes

- `size` in wrong units — always base asset (ETH, not notional USD)
- Not monitoring funding rate for overnight perp positions
- Using FOK on illiquid markets — entire order fails if not fully fillable
