# Tydro Lending Protocol

## Overview

Tydro is an Aave V3 whitelabel lending protocol deployed on Ink (chain ID 57073). It supports 12 live reserves and provides agents with the ability to earn yield by supplying assets, borrow against collateral, and manage positions — all via on-chain calls signed with `EVM_PRIVATE_KEY`.

All write operations auto-approve token spending before the main transaction, so no separate approval step is needed.

---

## Contracts (Ink Mainnet)

| Contract | Address |
|---|---|
| Pool | `0x2816cf15F6d2A220E789aA011D5EE4eB6c47FEbA` |
| PoolDataProvider | `0x96086C25d13943C80Ff9a19791a40Df6aFC08328` |
| UIPoolDataProvider | `0x39bc1bfDa2130d6Bb6DBEfd366939b4c7aa7C697` |
| Oracle | `0x4758213271BFdC72224A7a8742dC865fC97756e1` |
| WETHGateway | `0xDe090EfCD6ef4b86792e2D84E55a5fa8d49D25D2` |

---

## Supported Assets

| Symbol | Token Address | Decimals |
|---|---|---|
| WETH | `0x4200000000000000000000000000000000000006` | 18 |
| kBTC | `0x73e0c0d45e048d25fc26fa3159b0aa04bfa4db98` | 8 |
| USDT0 | `0x0200C29006150606B650577BBE7B6248F58470c1` | 6 |
| USDG | `0xe343167631d89b6ffc58b88d6b7fb0228795491d` | 6 |
| GHO | `0xfc421ad3c883bf9e7c4f42de845c4e4405799e73` | 18 |
| USDC | `0x2d270e6886d130d724215a266106e6832161eaed` | 6 |
| weETH | `0xa3d68b74bf0528fdd07263c60d6488749044914b` | 18 |
| wrsETH | `0x9f0a74a92287e323eb95c1cd9ecdbeb0e397cae4` | 18 |
| ezETH | `0x2416092f143378750bb29b79ed961ab195cceea5` | 18 |
| sUSDe | `0x211cc4dd073734da055fbf44a2b4667d5e5fe5d2` | 18 |
| USDe | `0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34` | 18 |
| SolvBTC | `0xae4efbc7736f963982aacb17efa37fcbab924cb3` | 18 |

Assets can be specified by symbol (e.g. `"WETH"`, `"USDC"`) or by token address.

---

## Tools

### `tydro_get_reserve_data`

Get market data for a reserve: supply APY, variable borrow APY, total supplied, total debt, available liquidity, and utilization rate.

```
tydro_get_reserve_data({ asset: "WETH" })
-> {
     supplyAPY: "2.4500%",
     variableBorrowAPY: "4.1200%",
     totalSupplied: "...",
     totalDebt: "...",
     availableLiquidity: "...",
     utilizationRate: "48.20%"
   }
```

| Parameter | Required | Description |
|---|---|---|
| `asset` | Yes | Asset symbol or token address |

---

### `tydro_get_user_account`

Get a wallet's overall account health on Tydro: total collateral, total debt, available to borrow, health factor, LTV, and liquidation risk.

```
tydro_get_user_account({ address?: "0x..." })
-> {
     totalCollateral: "$10,000.00",
     totalDebt: "$4,000.00",
     availableToBorrow: "$3,500.00",
     healthFactor: "2.1250",
     ltv: "80.00%",
     liquidationRisk: "safe"
   }
```

| Parameter | Required | Description |
|---|---|---|
| `address` | No | Wallet address (defaults to `EVM_PRIVATE_KEY` address) |

Health factor below 1.0 triggers liquidation. Below 1.1 is flagged as high risk.

---

### `tydro_get_user_reserve`

Get a wallet's position in a specific reserve: supplied balance, variable debt, stable debt, and collateral flag.

```
tydro_get_user_reserve({ asset: "USDC", address?: "0x..." })
-> {
     supplied: "5000.000000",
     variableDebt: "0.000000",
     stableDebt: "0.000000",
     usageAsCollateral: true,
     supplyAPY: "3.2100%"
   }
```

| Parameter | Required | Description |
|---|---|---|
| `asset` | Yes | Asset symbol or address |
| `address` | No | Wallet address (defaults to `EVM_PRIVATE_KEY` address) |

---

### `tydro_supply`

Supply (deposit) an asset to earn interest. Auto-approves spending before the supply transaction.

```
tydro_supply({ asset: "USDC", amount: "1000" })
-> { hash, status, asset, amount }
```

| Parameter | Required | Description |
|---|---|---|
| `asset` | Yes | Asset symbol or address |
| `amount` | Yes | Amount to supply (human-readable, e.g. `"1.5"` for 1.5 WETH) |

Requires `EVM_PRIVATE_KEY`.

---

### `tydro_borrow`

Borrow an asset at variable interest rate. Requires sufficient collateral already supplied.

```
tydro_borrow({ asset: "USDC", amount: "500" })
-> { hash, status, asset, amount }
```

| Parameter | Required | Description |
|---|---|---|
| `asset` | Yes | Asset symbol or address |
| `amount` | Yes | Amount to borrow |

Only variable rate borrowing is supported (stable rate is deprecated in Aave V3). Requires `EVM_PRIVATE_KEY`.

---

### `tydro_repay`

Repay borrowed assets. Use `"max"` to repay the full outstanding debt (auto-approves MaxUint256).

```
tydro_repay({ asset: "USDC", amount: "max" })
-> { hash, status, asset, amount }
```

| Parameter | Required | Description |
|---|---|---|
| `asset` | Yes | Asset symbol or address |
| `amount` | Yes | Amount to repay, or `"max"` for full repayment |

Requires `EVM_PRIVATE_KEY`.

---

### `tydro_withdraw`

Withdraw supplied assets. Use `"max"` to withdraw the full balance.

```
tydro_withdraw({ asset: "WETH", amount: "0.5" })
-> { hash, status, asset, amount }
```

| Parameter | Required | Description |
|---|---|---|
| `asset` | Yes | Asset symbol or address |
| `amount` | Yes | Amount to withdraw, or `"max"` for full withdrawal |

Requires `EVM_PRIVATE_KEY`.

---

## Common Use Cases

### Earn yield on stablecoins

```
1. tydro_get_reserve_data({ asset: "USDC" })     // check current APY
2. tydro_supply({ asset: "USDC", amount: "5000" })
3. tydro_get_user_reserve({ asset: "USDC" })     // verify position
```

### Borrow against ETH collateral

```
1. tydro_supply({ asset: "WETH", amount: "1.0" })
2. tydro_get_user_account()                       // check health factor
3. tydro_borrow({ asset: "USDC", amount: "1500" })
```

### Full exit

```
1. tydro_repay({ asset: "USDC", amount: "max" })
2. tydro_withdraw({ asset: "WETH", amount: "max" })
```

---

## Notes

- APY values use Aave's ray (27-decimal) fixed-point math, converted to annualized percentage
- USD values from the oracle use 8-decimal fixed-point (Chainlink standard)
- Health factor of `"infinite (no debt)"` means no borrows are open
- All amounts are in human-readable form (e.g. `"1.5"` not `"1500000000000000000"`)
