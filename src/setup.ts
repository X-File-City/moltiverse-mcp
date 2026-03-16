#!/usr/bin/env node
import * as process from 'process';
import { storePrivateKey, deletePrivateKey } from './keychain.js';

function readSecret(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(prompt);

    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');

      let input = '';
      const onData = (char: string) => {
        if (char === '\n' || char === '\r' || char === '\u0004') {
          process.stdin.setRawMode!(false);
          process.stdin.pause();
          process.stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(input);
        } else if (char === '\u0003') {
          process.stdout.write('\n');
          process.exit(0);
        } else if (char === '\u007f') {
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else {
          input += char;
          process.stdout.write('*');
        }
      };
      process.stdin.on('data', onData);
    } else {
      // Non-TTY fallback (e.g. piped input)
      let input = '';
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', (chunk: string) => { input += chunk; });
      process.stdin.on('end', () => resolve(input.trim()));
    }
  });
}

async function main() {
  const arg = process.argv[2];

  if (arg === 'delete') {
    await deletePrivateKey();
    console.log('Private key removed from OS keychain.');
    return;
  }

  console.log('=== Moltiverse MCP — Secure Key Setup ===\n');
  console.log('Stores your EVM private key in the OS keychain:');
  console.log('  macOS   → Keychain');
  console.log('  Windows → Credential Manager');
  console.log('  Linux   → Secret Service (libsecret)\n');
  console.log('Once set, remove EVM_PRIVATE_KEY from your MCP config.\n');

  const key = await readSecret('EVM private key (0x...): ');

  if (!key.match(/^0x[0-9a-fA-F]{64}$/)) {
    console.error('\nInvalid key — expected 0x followed by 64 hex characters.');
    process.exit(1);
  }

  try {
    await storePrivateKey(key);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('\nFailed to store key in OS keychain:', msg);
    console.error('On Linux, make sure libsecret is installed: sudo apt install libsecret-1-dev');
    process.exit(1);
  }

  console.log('\n✓ Private key stored securely in OS keychain.');
  console.log('  Run: npx moltiverse-mcp\n');
  console.log('To remove:  npx moltiverse-mcp-setup delete');
}

main().catch((err: unknown) => {
  console.error('Setup error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
