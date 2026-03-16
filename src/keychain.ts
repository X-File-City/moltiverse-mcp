const SERVICE = 'moltiverse-mcp';
const ACCOUNT = 'evm-private-key';

let _cached: string | null | undefined = undefined;

/**
 * Get the EVM private key. Priority:
 * 1. EVM_PRIVATE_KEY env var (allows override / server deployments)
 * 2. OS keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service)
 */
export async function getPrivateKey(): Promise<string | null> {
  if (_cached !== undefined) return _cached;

  if (process.env.EVM_PRIVATE_KEY) {
    _cached = process.env.EVM_PRIVATE_KEY;
    return _cached;
  }

  try {
    const keytar = await import('keytar');
    _cached = await keytar.getPassword(SERVICE, ACCOUNT);
  } catch {
    _cached = null;
  }

  return _cached;
}

export async function storePrivateKey(key: string): Promise<void> {
  const keytar = await import('keytar');
  await keytar.setPassword(SERVICE, ACCOUNT, key);
}

export async function deletePrivateKey(): Promise<void> {
  const keytar = await import('keytar');
  await keytar.deletePassword(SERVICE, ACCOUNT);
}
