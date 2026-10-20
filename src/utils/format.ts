const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/** ₹1,00,000 — Indian digit grouping. */
export function inr(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

/** ₹68K / ₹1L style used on performance cards. */
export function inrShort(amount: number): string {
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `₹${Number.isInteger(lakhs) ? lakhs : lakhs.toFixed(1)}L`;
  }
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}K`;
  return inr(amount);
}

export function parseDate(iso: string): Date {
  return new Date(iso);
}

const pad = (n: number) => String(n).padStart(2, '0');

/** 08 Sep 2026 */
export function dateLong(d: Date): string {
  return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** 08 Sep */
export function dateShort(d: Date): string {
  return `${pad(d.getDate())} ${MONTHS[d.getMonth()]}`;
}

/** TUE, 08 SEP */
export function dateBanner(d: Date): string {
  return `${DAYS[d.getDay()]}, ${pad(d.getDate())} ${MONTHS[d.getMonth()].toUpperCase()}`;
}

/** 10:42 AM */
export function time(d: Date): string {
  const h = d.getHours();
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${pad(h12)}:${pad(d.getMinutes())} ${h < 12 ? 'AM' : 'PM'}`;
}

/** 08 Sep 2026, 10:42 AM */
export function dateTime(d: Date): string {
  return `${dateLong(d)}, ${time(d)}`;
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** 0:38 */
export function duration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${pad(s % 60)}`;
}

export function initials(name: string): string {
  return name
    .replace(/\./g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
