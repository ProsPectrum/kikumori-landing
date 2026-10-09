export function ofConversionRate(views, exclusiveClicks) {
  const totalViews = Number(views) || 0;
  const ofClicks = Number(exclusiveClicks) || 0;
  if (totalViews <= 0) return null;
  return ofClicks / totalViews;
}

export function formatConversion(rate) {
  if (rate == null || Number.isNaN(rate)) return "—";
  return `${(rate * 100).toFixed(1)}%`;
}

export function daysInclusive(fromDay, toDay) {
  const start = Date.parse(`${fromDay}T00:00:00.000Z`);
  const end = Date.parse(`${toDay}T00:00:00.000Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) return [];
  const days = [];
  for (let stamp = start; stamp <= end; stamp += 86400000) {
    days.push(new Date(stamp).toISOString().slice(0, 10));
  }
  return days;
}

export function shiftUtcDay(day, deltaDays) {
  const stamp = Date.parse(`${day}T00:00:00.000Z`) + deltaDays * 86400000;
  return new Date(stamp).toISOString().slice(0, 10);
}
