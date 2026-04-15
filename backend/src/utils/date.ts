// All date helpers use local time (IST via process.env.TZ = 'Asia/Kolkata' in index.ts)

export const toLocalDateStr = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

export const todayIST = (): string => toLocalDateStr(new Date());
