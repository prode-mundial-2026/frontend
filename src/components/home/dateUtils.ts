/** Devuelve YYYY-MM-DD en hora Argentina (UTC-3) */
export function todayArgentina(): string {
  const arg = new Date(Date.now() - 3 * 60 * 60 * 1000);
  return arg.toISOString().slice(0, 10);
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatDateLabel(dateStr: string): string {
  const today = todayArgentina();
  if (dateStr === today) return 'Hoy';
  if (dateStr === addDays(today, -1)) return 'Ayer';
  if (dateStr === addDays(today, 1)) return 'Mañana';
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}
