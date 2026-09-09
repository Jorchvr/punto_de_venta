export function money(n: number): string {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  return `${sign}$${abs.toFixed(2)}`;
}

export function parseAmount(s: string): number {
  const clean = s.replace(/[^0-9.]/g, "");
  const n = parseFloat(clean);
  return isFinite(n) ? n : 0;
}
