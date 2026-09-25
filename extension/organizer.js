const FOLDER = "application/vnd.google-apps.folder";
const SHORTCUT = "application/vnd.google-apps.shortcut";

export const DEFAULT_RULES = [
  { name: "Finans", terms: ["fatura", "invoice", "receipt", "makbuz", "bütçe", "budget", "vergi"] },
  { name: "Sözleşmeler", terms: ["sözleşme", "contract", "agreement", "nda"] },
  { name: "Toplantılar", terms: ["toplantı", "meeting", "agenda", "minutes", "notlar"] },
  { name: "Sunumlar", terms: ["sunum", "presentation", "pitch", "deck"] }
];

export function typeOf(file) {
  if (file.mimeType === FOLDER) return "Klasör";
  if (file.mimeType === SHORTCUT) return "Kısayol";
  if (file.mimeType?.startsWith("application/vnd.google-apps.")) {
    const type = file.mimeType.split(".").at(-1);
    return ({ document: "Doküman", spreadsheet: "Tablo", presentation: "Sunum", form: "Form" })[type] || "Google dosyası";
  }
  if (file.mimeType === "application/pdf") return "PDF";
  if (file.mimeType?.startsWith("image/")) return "Görsel";
  if (file.mimeType?.startsWith("video/")) return "Video";
  if (file.mimeType?.startsWith("audio/")) return "Ses";
  return "Diğer";
}

export function yearOf(file) {
  const match = String(file.name || "").match(/(?:^|\D)(20\d{2})(?:\D|$)/);
  return match ? match[1] : (file.createdTime || file.modifiedTime || "").slice(0, 4) || "Tarih yok";
}

export function normalizeRules(text) {
  return String(text).split("\n").map(line => {
    const colon = line.indexOf(":");
    if (colon < 1) return null;
    const name = line.slice(0, colon).trim().slice(0, 60);
    const terms = line.slice(colon + 1).split(",").map(x => x.trim().toLocaleLowerCase("tr")).filter(Boolean);
    return name && terms.length ? { name, terms } : null;
  }).filter(Boolean).slice(0, 30);
}

export function classifyFile(file, rules = DEFAULT_RULES, overrides = {}) {
  const selected = overrides[file.id];
  if (selected && (selected === "Diğer dosyalar" || rules.some(rule => rule.name === selected))) {
    return { group: selected, reason: "Elle seçildi" };
  }
  const name = file.name.toLocaleLowerCase("tr");
  for (const rule of rules) {
    const term = rule.terms.find(value => name.includes(value));
    if (term) return { group: rule.name, reason: `Dosya adında “${term}” var` };
  }
  return { group: "Diğer dosyalar", reason: "Henüz eşleşen koleksiyon kuralı yok" };
}

export function groupFiles(files, rules = DEFAULT_RULES, mode = "category", overrides = {}) {
  const groups = new Map();
  for (const file of files) {
    if (!file?.id || !file.name || file.trashed || file.mimeType === FOLDER) continue;
    let group;
    if (mode === "type") group = typeOf(file);
    else if (mode === "year") group = yearOf(file);
    else {
      group = classifyFile(file, rules, overrides).group;
    }
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(file);
  }
  return [...groups.entries()].map(([name, items]) => ({
    name,
    items: items.sort((a, b) => (b.modifiedTime || "").localeCompare(a.modifiedTime || ""))
  })).sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name, "tr"));
}
