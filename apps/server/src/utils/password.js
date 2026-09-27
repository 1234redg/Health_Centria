import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb);

// Password hashing with zero new dependencies (Node built-in scrypt).
// Stored format: "scrypt$<salt-hex>$<hash-hex>" so params can evolve later.
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${hash.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  try {
    const [algo, salt, hashHex] = String(stored).split('$');
    if (algo !== 'scrypt' || !salt || !hashHex) return false;
    const hash = await scrypt(password, salt, 64);
    const expected = Buffer.from(hashHex, 'hex');
    if (expected.length !== hash.length) return false;
    return timingSafeEqual(expected, hash);
  } catch {
    return false;
  }
}
