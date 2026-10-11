export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatPrice(price: number, currency: string = "INR"): string {
  const symbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    AED: "AED ",
  };
  const symbol = symbols[currency] ?? currency;
  return `${symbol}${price.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "A";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function truncate(text: string | null | undefined, length: number): string {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + "...";
}

export function isServer(): boolean {
  return typeof window === "undefined";
}
