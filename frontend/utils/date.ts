/** Returns a Date as "YYYY-MM-DD" using local (browser) time — avoids UTC shift from toISOString(). */
export const toLocalDateStr = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/** Returns today's date as "YYYY-MM-DD" in local (IST) time. */
export const todayLocal = (): string => toLocalDateStr(new Date());
