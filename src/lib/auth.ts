import crypto from 'crypto';

const DEV_FALLBACK_SECRET = 'dev-insecure-secret-change-me-in-production';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

export const SESSION_COOKIE = 'evo_admin_session';
export const SESSION_MAX_AGE = SESSION_MAX_AGE_SECONDS;

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET obrigatório (mínimo 16 chars) em produção.');
  }
  return DEV_FALLBACK_SECRET;
}

function hmac(value: string): string {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function signSession(): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const payload = String(exp);
  return `${payload}.${hmac(payload)}`;
}

export function verifySession(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [expStr, sig] = parts;
  if (!expStr || !sig) return false;
  const expected = hmac(expStr);
  if (!timingSafeEqualStr(sig, expected)) return false;
  const exp = parseInt(expStr, 10);
  if (!Number.isFinite(exp)) return false;
  return Math.floor(Date.now() / 1000) < exp;
}

export function instanceToken(name: string): string {
  // Token determinístico: mesmo nome + mesmo segredo → mesmo token.
  // Não precisa de banco; só quem tem SESSION_SECRET gera tokens válidos.
  return hmac(`instance:${name}`).slice(0, 24);
}

export function verifyInstanceToken(name: string, token: string | undefined): boolean {
  if (!token || !name) return false;
  const expected = instanceToken(name);
  return timingSafeEqualStr(token, expected);
}

export function timingSafePasswordEqual(input: string, stored: string): boolean {
  return timingSafeEqualStr(input, stored);
}
