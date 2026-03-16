import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
  type Hash,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { ink } from './config.js';

// ── Public Client (always available) ──────────────────────────────────
export const publicClient = createPublicClient({
  chain: ink,
  transport: http(),
});

// ── Wallet Client (BYOA: local signing via EVM_PRIVATE_KEY) ───────────
export function getWalletClient() {
  const pk = process.env.EVM_PRIVATE_KEY;
  if (!pk) throw new Error('EVM_PRIVATE_KEY is required for write operations');
  const account = privateKeyToAccount(pk as `0x${string}`);
  return createWalletClient({ account, chain: ink, transport: http() });
}

// ── Agent Account ──────────────────────────────────────────────────────
export async function getAccount(): Promise<Address> {
  // BYOA: derive from local private key
  const pk = process.env.EVM_PRIVATE_KEY;
  if (pk) {
    return privateKeyToAccount(pk as `0x${string}`).address;
  }

  // Legacy: fetch from Molting API
  const base = process.env.SENTRY_API_BASE;
  const key = process.env.MOLTING_API_KEY;
  if (!base || !key) throw new Error('EVM_PRIVATE_KEY or (SENTRY_API_BASE + MOLTING_API_KEY) required');

  const res = await fetch(`${base.replace(/\/$/, '')}/api/molting/agent/me`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to fetch agent account: ${res.status} ${body}`);
  }
  const data = (await res.json()) as { address: string };
  return data.address as Address;
}

// ── Send Transaction ───────────────────────────────────────────────────
export async function sendTx(params: {
  to: Address;
  data: `0x${string}`;
  value?: bigint;
}): Promise<{ hash: Hash }> {
  const pk = process.env.EVM_PRIVATE_KEY;

  if (pk) {
    // BYOA: sign and broadcast locally
    const wc = getWalletClient();
    const hash = await wc.sendTransaction({
      to: params.to,
      data: params.data,
      value: params.value ?? 0n,
    });
    return { hash };
  }

  // Legacy: remote signing via Molting API
  const base = process.env.SENTRY_API_BASE;
  const key = process.env.MOLTING_API_KEY;
  if (!base || !key) throw new Error('EVM_PRIVATE_KEY or (SENTRY_API_BASE + MOLTING_API_KEY) required');

  const res = await fetch(`${base.replace(/\/$/, '')}/api/molting/send-transaction`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: params.to,
      data: params.data,
      value: (params.value ?? 0n).toString(),
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Transaction API error: ${res.status} ${body}`);
  }
  const result = (await res.json()) as { success: boolean; txHash: string };
  if (!result.success) throw new Error('Transaction API returned success: false');
  return { hash: result.txHash as Hash };
}

// ── BigInt serializer ──────────────────────────────────────────────────
export function serializeBigInts(obj: unknown): unknown {
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeBigInts);
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = serializeBigInts(value);
    }
    return result;
  }
  return obj;
}
