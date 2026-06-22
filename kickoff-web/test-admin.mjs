// Test using the v12 modular firebase-admin API
import { readFileSync } from 'fs';

// Manually parse .env
const envText = readFileSync('.env', 'utf8');
const env = {};
for (const line of envText.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const k = trimmed.slice(0, eqIdx).trim();
  let v = trimmed.slice(eqIdx + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  env[k] = v;
}

process.env.FIREBASE_PRIVATE_KEY = env['FIREBASE_PRIVATE_KEY'];
process.env.FIREBASE_CLIENT_EMAIL = env['FIREBASE_CLIENT_EMAIL'];
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'];

const { initializeApp, getApps, cert } = await import('firebase-admin/app');
const { getAuth } = await import('firebase-admin/auth');

const rawKey = process.env.FIREBASE_PRIVATE_KEY || '';
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';

const privateKey = rawKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');

console.log('projectId:', projectId);
console.log('clientEmail:', clientEmail);
console.log('key ok:', privateKey.startsWith('-----BEGIN PRIVATE KEY-----'));

try {
  const app = getApps().length > 0 ? getApps()[0] : initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
  console.log('\n✅ Admin SDK initialised OK');

  const link = await getAuth(app).generatePasswordResetLink('owoyeminiyi2@gmail.com');
  console.log('✅ Reset link generated:', link.substring(0, 80) + '...');
} catch (e) {
  console.error('\n❌ ERROR:', e.message);
}
