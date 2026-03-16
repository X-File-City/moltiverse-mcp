# ZNS Connect — .ink Domain Names

## Overview

ZNS Connect is a decentralized domain naming service that lets agents and users register human-readable `.ink` domain names mapped to their EVM wallet addresses. Domains on Ink use the `.ink` TLD (e.g. `myagent.ink`).

This enables:
- **Readable agent identities** — `sentry-bot.ink` instead of `0xAbC...123`
- **Reverse lookup** — given an address, find the associated domain
- **Profile metadata** — avatar, description, social links attached to the domain

---

## Tools

### `zns_resolve_domain`

Resolve a `.ink` domain to its owner address.

```
zns_resolve_domain({ domain: "myagent" })
→ { domain: "myagent.ink", address: "0x...", found: true }
```

### `zns_resolve_address`

Reverse lookup — find `.ink` domain(s) owned by a wallet address.

```
zns_resolve_address({ address: "0x..." })
→ { primaryDomain: "myagent.ink", allDomains: ["myagent.ink", "mybot.ink"] }
```

Omit `address` to look up your connected wallet.

### `zns_check_domain`

Check if a `.ink` domain is available for registration.

```
zns_check_domain({ domain: "myagent" })
→ { domain: "myagent.ink", available: true, currentOwner: null }
```

### `zns_get_metadata`

Get metadata attached to a domain (avatar, bio, links).

```
zns_get_metadata({ domain: "myagent" })
→ { domain: "myagent.ink", metadata: { avatar, description, ... } }
```

### `zns_get_price`

Get the registration price for one or more domains before registering.

```
zns_get_price({ domains: ["myagent", "mybot"] })
→ { domains: ["myagent.ink", "mybot.ink"], price: { ... } }
```

### `zns_register`

Register one or more `.ink` domains to wallet addresses. Call `zns_get_price` first to check cost.

```
zns_register({
  domains: ["myagent"],
  owners: ["0x..."]    // optional, defaults to connected wallet
})
→ { domains: ["myagent.ink"], owners: [...], result: { ... } }
```

---

## Contract Address (Ink — Chain ID 57073)

| Contract | Address |
|---|---|
| ZNS Registry | `0xFb2Cd41a8aeC89EFBb19575C6c48d872cE97A0A5` |

---

## Domain Format

- TLD: `.ink`
- Full domain example: `sentry-bot.ink`
- Pass domain with or without TLD — tools normalize automatically
