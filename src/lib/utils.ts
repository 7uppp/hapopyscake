import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
}

export const pickupTimeZone = "Australia/Brisbane";

function getDateTimeParts(value: Date) {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: pickupTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

export function formatBrisbaneDateTimeLocal(value: Date) {
  const parts = getDateTimeParts(value);

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function getMinimumBrisbanePickupDateTime() {
  const minimumDate = new Date();
  minimumDate.setDate(minimumDate.getDate() + 7);
  minimumDate.setSeconds(0, 0);

  return formatBrisbaneDateTimeLocal(minimumDate);
}

export function parseBrisbaneDateTime(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}:00.000Z`);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatBrisbaneDateTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;

  return `${new Intl.DateTimeFormat("en-AU", {
    timeZone: "UTC",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)} Brisbane time`;
}

export function formatBrisbaneDateTimeInput(value: string) {
  const date = parseBrisbaneDateTime(value);

  return date ? formatBrisbaneDateTime(date) : value;
}

export function formatDateLabel(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("en-AU", {
    timeZone: pickupTimeZone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function toSentenceCase(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
