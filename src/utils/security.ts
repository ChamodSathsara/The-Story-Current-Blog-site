import DOMPurify from 'dompurify';

/** Sanitize rich-text HTML before rendering. Mirrors the server-side sanitizer used in production. */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'a', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li',
    'blockquote', 'img', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'code', 'pre', 'span'],

    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'style', 'colspan', 'rowspan', 'width', 'height'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|data:image\/(?:png|jpe?g|webp|gif);|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i
  });
}

/** PBKDF2 password hashing via Web Crypto (same primitive available in Cloudflare Workers). */
export async function hashPassword(password: string, saltHex?: string): Promise<{hash: string;salt: string;}> {
  const enc = new TextEncoder();
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, key, 256);
  return { hash: bytesToHex(new Uint8Array(bits)), salt: bytesToHex(salt) };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const result = await hashPassword(password, salt);
  if (result.hash.length !== hash.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) diff |= result.hash.charCodeAt(i) ^ hash.charCodeAt(i);
  return diff === 0;
}

export function randomToken(bytes = 24): string {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(bytes)));
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

/** Sliding-window rate limiter. Production uses the same logic keyed by IP in a Workers KV / DB table. */
export function checkRateLimit(key: string, max: number, windowMs: number): {ok: boolean;retryInSec: number;} {
  const storageKey = `tsc_rl_${key}`;
  const now = Date.now();
  let hits: number[] = [];
  try {
    hits = JSON.parse(localStorage.getItem(storageKey) || '[]') as number[];
  } catch {
    hits = [];
  }
  hits = hits.filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    return { ok: false, retryInSec: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  localStorage.setItem(storageKey, JSON.stringify(hits));
  return { ok: true, retryInSec: 0 };
}

/** Basic spam heuristics: honeypot, minimum fill time, link flooding. */
export function looksLikeSpam(opts: {honeypot: string;startedAt: number;text: string;}): boolean {
  if (opts.honeypot.trim() !== '') return true;
  if (Date.now() - opts.startedAt < 2500) return true;
  const links = (opts.text.match(/https?:\/\//gi) || []).length;
  return links > 3;
}