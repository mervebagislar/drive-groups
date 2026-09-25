import test from "node:test";
import assert from "node:assert/strict";
import { classifyFile, groupFiles, normalizeRules, typeOf, yearOf } from "../extension/organizer.js";

test("konu kuralı ilk eşleşmeye göre atanır ve dosya taşınmaz", () => {
  const file = { id: "1", name: "2025 fatura.pdf", mimeType: "application/pdf", modifiedTime: "2025-04-01" };
  const original = structuredClone(file);
  const groups = groupFiles([file], normalizeRules("Finans: fatura\nArşiv: 2025"));
  assert.equal(groups[0].name, "Finans");
  assert.deepEqual(file, original);
});

test("klasör ve çöp kutusundaki dosyalar dışlanır", () => {
  const groups = groupFiles([
    { id: "a", name: "Klasör", mimeType: "application/vnd.google-apps.folder" },
    { id: "b", name: "Çöp", mimeType: "application/pdf", trashed: true },
    { id: "c", name: "Rapor", mimeType: "application/pdf" }
  ]);
  assert.equal(groups.flatMap(group => group.items).length, 1);
});

test("tür ve yıl görünümleri", () => {
  const file = { id: "x", name: "2023 planı", mimeType: "application/vnd.google-apps.spreadsheet", createdTime: "2024-01-01" };
  assert.equal(typeOf(file), "Tablo");
  assert.equal(yearOf(file), "2023");
  assert.equal(groupFiles([file], [], "type")[0].name, "Tablo");
  assert.equal(groupFiles([file], [], "year")[0].name, "2023");
});

test("geçersiz kural satırları çalışmayı bozmaz", () => {
  assert.deepEqual(normalizeRules("hatalı\nFinans: fatura, "), [{ name: "Finans", terms: ["fatura"] }]);
});

test("proje eşleşmesi açıklanır ve elle düzeltme önceliklidir", () => {
  const file = { id: "f-1", name: "Trypix teklif.pdf", mimeType: "application/pdf" };
  const rules = normalizeRules("Trypix: trypix\nMüşteriler: teklif");
  assert.deepEqual(classifyFile(file, rules), { group: "Trypix", reason: "Dosya adında “trypix” var" });
  assert.deepEqual(classifyFile(file, rules, { "f-1": "Müşteriler" }), { group: "Müşteriler", reason: "Elle seçildi" });
  assert.equal(groupFiles([file], rules, "category", { "f-1": "Müşteriler" })[0].name, "Müşteriler");
});

test("silinmiş bir koleksiyona yapılan eski atama yok sayılır", () => {
  const file = { id: "f-2", name: "Rapor", mimeType: "application/pdf" };
  assert.equal(classifyFile(file, [], { "f-2": "Eski proje" }).group, "Diğer dosyalar");
});
