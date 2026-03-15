const FREE_PLAN_LIMIT = 3;
const STORAGE_KEY = "artspark_plan_count";
const PREMIUM_KEY = "artspark_premium";
const OWNER_KEY = "artspark_owner";

/** Get current month's plan count from localStorage */
export function getPlanCount(): number {
  if (typeof window === "undefined") return 0;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return 0;

  try {
    const { count, month } = JSON.parse(data);
    const currentMonth = new Date().toISOString().slice(0, 7); // "2026-03"
    if (month !== currentMonth) return 0; // Reset each month
    return count;
  } catch {
    return 0;
  }
}

/** Increment plan count for current month */
export function incrementPlanCount(): void {
  if (typeof window === "undefined") return;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const current = getPlanCount();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ count: current + 1, month: currentMonth })
  );
}

/** Check if user has hit the free limit */
export function isAtLimit(): boolean {
  return !isPremium() && getPlanCount() >= FREE_PLAN_LIMIT;
}

/** Check if user is owner (never hits limits) */
export function isOwner(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(OWNER_KEY) === "true";
}

/** Activate owner mode (called via secret URL param) */
export function activateOwner(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(OWNER_KEY, "true");
  localStorage.setItem(PREMIUM_KEY, "true");
}

/** Check if user is premium */
export function isPremium(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PREMIUM_KEY) === "true" || isOwner();
}

/** Activate premium (called after successful payment) */
export function activatePremium(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREMIUM_KEY, "true");
}

/** Get remaining free plans */
export function remainingFreePlans(): number {
  if (isPremium()) return Infinity;
  return Math.max(0, FREE_PLAN_LIMIT - getPlanCount());
}

export const FREE_LIMIT = FREE_PLAN_LIMIT;
