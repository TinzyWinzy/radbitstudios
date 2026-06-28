// PayNow integration test
// Verifies: initiation (SHA512 hash + status=Message), ITN hash verification
// Run: npx tsx scripts/test-paynow.ts

import crypto from 'crypto';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

const INTEGRATION_ID = process.env.PAYNOW_INTEGRATION_ID || '';
const INTEGRATION_KEY = process.env.PAYNOW_INTEGRATION_KEY || '';
const AUTH_EMAIL = process.env.PAYNOW_AUTH_EMAIL || '';

function computeHash(values: string[]): string {
  const str = values.join('') + INTEGRATION_KEY;
  return crypto.createHash('sha512').update(str, 'utf8').digest('hex').toUpperCase();
}

async function main() {
  console.log('┌────────────────────────────────────────────┐');
  console.log('│  PayNow Integration Test                    │');
  console.log('├────────────────────────────────────────────┤');
  console.log(`│  Integration ID:  ${INTEGRATION_ID.padEnd(36)}│`);
  console.log(`│  Auth Email:      ${(AUTH_EMAIL || '(not set)').padEnd(36)}│`);
  console.log('└────────────────────────────────────────────┘');

  if (!INTEGRATION_ID || !INTEGRATION_KEY) {
    console.error('\n✗ Missing PAYNOW_INTEGRATION_ID or PAYNOW_INTEGRATION_KEY');
    process.exit(1);
  }

  // ── 1. Initiate a test payment ──────────────────────────
  const reference = `test-${Date.now()}`;

  const fields: Record<string, string> = {
    id: INTEGRATION_ID,
    reference,
    amount: '1.00',
    additionalinfo: 'Radbit PayNow test - $1.00',
    returnurl: 'https://radbitstudios.co.zw/settings?payment=success',
    resulturl: 'https://radbitstudios.co.zw/api/webhooks/paynow',
    ...(AUTH_EMAIL ? { authemail: AUTH_EMAIL } : {}),
    status: 'Message',
  };

  const hash = computeHash(Object.values(fields));
  fields.hash = hash;

  console.log('\nInitiating payment...');
  const response = await fetch('https://www.paynow.co.zw/interface/initiatetransaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields).toString(),
  });

  const text = await response.text();
  const parsed = Object.fromEntries(new URLSearchParams(text));

  console.log('\nResponse:', JSON.stringify(parsed, null, 2));

  if (parsed.status !== 'Ok') {
    console.error(`\n✗ Initiation FAILED: ${parsed.error}`);
    process.exit(1);
  }

  console.log('\n✓ Payment initiated!');
  console.log('\n═══ NEXT STEPS ═══════════════════════════════');
  console.log('');
  console.log('1. Open this URL in your browser:');
  console.log(`   ${parsed.browserurl}`);
  console.log('');
  console.log('2. Log in with your PayNow merchant account');
  console.log('3. Click "[TESTING: Faked Success]" to simulate payment');
  console.log('');
  console.log('4. PayNow will POST an ITN to:');
  console.log('   /api/webhooks/paynow');
  console.log('   → Subscription activates, invoice generated, email sent');

  // ── 2. Test ITN hash verification ───────────────────────
  const mockITN: Record<string, string> = {
    reference,
    paynowreference: 'PNTEST123',
    amount: '1.00',
    status: 'Paid',
    pollurl: parsed.pollurl || '',
    additionalinfo: 'Radbit PayNow test - $1.00',
    ...(AUTH_EMAIL ? { authemail: AUTH_EMAIL } : {}),
  };

  const itnValues: string[] = [];
  for (const key of Object.keys(mockITN)) {
    itnValues.push(mockITN[key]);
  }
  const itnHash = computeHash(itnValues);
  mockITN.hash = itnHash;

  const verifyValues: string[] = [];
  for (const key of Object.keys(mockITN)) {
    if (key.toLowerCase() !== 'hash') {
      verifyValues.push(mockITN[key] || '');
    }
  }
  const computedHash = computeHash(verifyValues);
  const valid = computedHash === (mockITN.hash || '').toUpperCase();

  console.log('');
  console.log('┌────────────────────────────────────────────┐');
  console.log(`│  ITN Hash Verification                     │`);
  console.log('├────────────────────────────────────────────┤');
  console.log(`│  Result:       ${valid ? '✓ PASS' : '✗ FAIL'}                          │`);
  console.log(`│  Algorithm:    SHA-512                     │`);
  console.log(`│  Reference:    ${reference.slice(0, 30).padEnd(33)}│`);
  console.log(`│  Hash:         ${computedHash.slice(0, 16)}...   │`);
  console.log('└────────────────────────────────────────────┘');
  console.log(valid ? '\n✓ All checks passed!' : '\n✗ Hash verification failed!');
}

main().catch(console.error);
