const REF_COOKIE = 'radbit_ref';
const COOKIE_DAYS = 90;

export function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

export function setRefCookie(refCode: string): void {
  setCookie(REF_COOKIE, refCode, COOKIE_DAYS);
}

export function getRefCookie(): string | null {
  return getCookie(REF_COOKIE);
}

export function clearRefCookie(): void {
  deleteCookie(REF_COOKIE);
}
