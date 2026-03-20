// ─── Daily Free Credits System ────────────────────────────────────────────────
// Every user gets 3 free AI generations per day.
// Resets automatically at midnight (local time).
// Paid credits (from Firestore) stack on top.

const DAILY_FREE = 3;
const STORAGE_KEY = "iq_daily";
const PAID_KEY    = "iq_paid_credits";
const UNLIMITED_KEY = "iq_unlimited";

interface DailyUsage {
  date: string;   // e.g. "Fri Mar 21 2026"
  used: number;   // how many free credits used today
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function today(): string {
  return new Date().toDateString();
}

function getDaily(): DailyUsage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: today(), used: 0 };
    const parsed: DailyUsage = JSON.parse(raw);
    // New day → reset
    if (parsed.date !== today()) return { date: today(), used: 0 };
    return parsed;
  } catch {
    return { date: today(), used: 0 };
  }
}

function saveDaily(usage: DailyUsage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** How many free generations remain today (0-3) */
export function getDailyFreeRemaining(): number {
  const usage = getDaily();
  return Math.max(0, DAILY_FREE - usage.used);
}

/** How many paid credits the user has */
export function getPaidCredits(): number {
  return Number(localStorage.getItem(PAID_KEY) || 0);
}

/** Total usable credits = free remaining + paid */
export function getTotalCredits(): number {
  if (isUnlimited()) return Infinity;
  return getDailyFreeRemaining() + getPaidCredits();
}

/** Returns milliseconds until free credits reset (next midnight) */
export function getMsUntilReset(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

/** Human-readable time until reset, e.g. "5h 23m" */
export function getTimeUntilReset(): string {
  const ms = getMsUntilReset();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/**
 * Try to use 1 credit. Returns true if successful, false if no credits left.
 * Uses free daily credits first, then paid credits.
 */
export function useOneCredit(): boolean {
  if (isUnlimited()) return true;

  // Try free first
  const usage = getDaily();
  if (usage.used < DAILY_FREE) {
    usage.used += 1;
    saveDaily(usage);
    return true;
  }

  // Fall back to paid
  const paid = getPaidCredits();
  if (paid > 0) {
    localStorage.setItem(PAID_KEY, String(paid - 1));
    return true;
  }

  return false;
}

/** Add paid credits (e.g. after purchase) */
export function addPaidCredits(amount: number): void {
  const current = getPaidCredits();
  localStorage.setItem(PAID_KEY, String(current + amount));
}

/** Activate unlimited mode (e.g. for admin/testing) */
export function activateUnlimited(): void {
  localStorage.setItem(UNLIMITED_KEY, "true");
}

export function isUnlimited(): boolean {
  return localStorage.getItem(UNLIMITED_KEY) === "true";
}

// ─── Legacy aliases (keeps Toolbar working without changes) ───────────────────
export const getCredits    = getTotalCredits;
export const deductCredit  = useOneCredit;
export const addCredits    = addPaidCredits;
