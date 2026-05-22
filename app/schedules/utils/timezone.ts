export const MANILA_TIMEZONE = 'Asia/Manila';

export function getManilaTime(): Date {
  const now = new Date();
  const str = now.toLocaleString('en-US', { timeZone: MANILA_TIMEZONE });
  return new Date(str);
}

export function toManilaTime(date: Date): Date {
  const str = date.toLocaleString('en-US', { timeZone: MANILA_TIMEZONE });
  return new Date(str);
}

export function formatManilaDate(dateStr: string, options: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { ...options, timeZone: MANILA_TIMEZONE });
}

export function formatManilaTime(dateStr: string, options: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { ...options, timeZone: MANILA_TIMEZONE });
}

export function getManilaOffset(dateStr: string): number {
  const date = new Date(dateStr);
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const manila = new Date(utc + 8 * 3600000);
  return manila.getTime() - date.getTime();
}
