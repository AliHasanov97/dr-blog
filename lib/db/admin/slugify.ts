export function slugify(text: string): string {
  const map: Record<string, string> = {
    ə: "e", Ə: "E", ı: "i", İ: "I", ö: "o", Ö: "O",
    ü: "u", Ü: "U", ş: "s", Ş: "S", ç: "c", Ç: "C",
    ğ: "g", Ğ: "G",
  };
  return text
    .split("")
    .map((c) => map[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
