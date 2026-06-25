import { DAY_MS } from "./constants";

export function calendarDay(date: Date): Date {
  return new Date(`${date.toISOString().slice(0, 10)}T00:00:00.000Z`);
}

export function dateKey(day: Date): string {
  return day.toISOString().slice(0, 10);
}

export function daysBefore(day: Date, days: number): Date {
  return new Date(day.getTime() - days * DAY_MS);
}

export function daysBeforeNow(days: number): Date {
  return new Date(Date.now() - days * DAY_MS);
}
