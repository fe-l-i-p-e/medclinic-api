export function toClinicLocalTime(date: Date, timeZone = "America/Sao_Paulo"): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  // Date local "fake" em UTC, só para extrair weekDay/horas no fuso da clínica
  return new Date(
    Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"))
  );
}

export function toMinutesSinceMidnight(localDate: Date): number {
  return localDate.getUTCHours() * 60 + localDate.getUTCMinutes();
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function isValidDateRange(from: string, to: string): boolean {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(from) || !re.test(to)) return false;
  const fromDate = new Date(from);
  const toDate = new Date(to);
  if (fromDate > toDate) return false;
  const diffDays = (toDate.getTime() - fromDate.getTime()) / 86_400_000;
  return diffDays <= 31;
}
