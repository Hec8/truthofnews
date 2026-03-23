import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isValid } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type TimestampLike = {
  toDate?: () => Date;
  seconds?: number;
  nanoseconds?: number;
};

function toSafeDate(value: Date | string | number | TimestampLike | null | undefined): Date | null {
  if (value == null) return null;

  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return isValid(date) ? date : null;
  }

  if (typeof value === "object") {
    if (typeof value.toDate === "function") {
      const date = value.toDate();
      return isValid(date) ? date : null;
    }

    if (typeof value.seconds === "number") {
      const millis = value.seconds * 1000 + Math.floor((value.nanoseconds ?? 0) / 1_000_000);
      const date = new Date(millis);
      return isValid(date) ? date : null;
    }
  }

  return null;
}

export function formatDate(date: Date | string | number | TimestampLike | null | undefined): string {
  const d = toSafeDate(date);
  if (!d) return "-";
  return format(d, "d MMMM yyyy", { locale: fr });
}

export function formatDateShort(date: Date | string | number | TimestampLike | null | undefined): string {
  const d = toSafeDate(date);
  if (!d) return "-";
  return format(d, "dd/MM/yyyy", { locale: fr });
}

export function formatRelativeDate(date: Date | string | number | TimestampLike | null | undefined): string {
  const d = toSafeDate(date);
  if (!d) return "-";
  return formatDistanceToNow(d, { addSuffix: true, locale: fr });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

export function getReadingTime(content: string): number {
  const words = content.replace(/<[^>]+>/g, "").split(/\s+/).length;
  return Math.ceil(words / 200);
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

export function generateExcerpt(content: string, maxLength = 160): string {
  const text = stripHtml(content);
  return truncateText(text, maxLength);
}
