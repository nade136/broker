/** Fixed format for SSR/client hydration (avoids locale/timezone mismatches). */
export function formatDateTimeUtc(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const p = (n: number) => String(n).padStart(2, "0");
  const day = d.getUTCDate();
  const mon = months[d.getUTCMonth()];
  const y = d.getUTCFullYear();
  return `${day} ${mon} ${y}, ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`;
}
