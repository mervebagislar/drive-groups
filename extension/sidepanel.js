import { DEFAULT_RULES, classifyFile, groupFiles, normalizeRules, typeOf } from "./organizer.js";

const $ = id => document.getElementById(id);
let files = [];
let rules = DEFAULT_RULES;
let overrides = {};
let folders = new Map();

function sourceFolder(file) {
  const names = [];
  let parent = file.parents?.[0];
  const seen = new Set();
  while (parent && folders.has(parent) && !seen.has(parent) && names.length < 8) {
    seen.add(parent);
    const folder = folders.get(parent);
    names.unshift(folder.name);
    parent = folder.parents?.[0];
  }
  return names.join(" / ") || "Konum bilinmiyor";
}

function showStatus(message) { $("status").textContent = message; }
function render() {
  const root = $("groups");
  root.replaceChildren();
  const search = $("search").value.trim().toLocaleLowerCase("tr");
  const filtered = search ? files.filter(file => file.name.toLocaleLowerCase("tr").includes(search)) : files;
  for (const group of groupFiles(filtered, rules, $("mode").value, overrides)) {
    const section = document.createElement("section");
    section.className = "group";
    const title = document.createElement("h2");
    title.textContent = `${group.name} `;
    const count = document.createElement("span");
    count.textContent = `(${group.items.length})`;
    title.append(count);
    section.append(title);
    for (const file of group.items.slice(0, 100)) {
      const wrapper = document.createElement("div");
      wrapper.className = "file-row";
      const link = document.createElement("a");
      link.className = "item";
      link.href = file.webViewLink || `https://drive.google.com/open?id=${encodeURIComponent(file.id)}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = file.name;
      const detail = document.createElement("small");
      const explanation = classifyFile(file, rules, overrides).reason;
      detail.textContent = `${typeOf(file)} · ${sourceFolder(file)} · ${explanation}`;
      link.append(detail);
      wrapper.append(link);
      if ($("mode").value === "category") {
        const select = document.createElement("select");
        select.className = "reassign";
        select.setAttribute("aria-label", `${file.name} dosyasının koleksiyonu`);
        for (const name of [...new Set([...rules.map(rule => rule.name), "Diğer dosyalar"])]) {
          const option = document.createElement("option");
          option.value = name;
          option.textContent = name;
          select.append(option);
        }
        select.value = classifyFile(file, rules, overrides).group;
        select.addEventListener("change", async () => {
          overrides[file.id] = select.value;
          await chrome.storage.local.set({ overrides });
          render();
        });
        wrapper.append(select);
      }
      section.append(wrapper);
    }
    if (group.items.length > 100) {
      const notice = document.createElement("p");
      notice.textContent = `İlk 100 dosya gösteriliyor. Arama ile daraltın (${group.items.length} toplam).`;
      section.append(notice);
    }
    root.append(section);
  }
}

async function listFiles(token) {
  let pageToken;
  const result = [];
  do {
    const url = new URL("https://www.googleapis.com/drive/v3/files");
    url.searchParams.set("q", "trashed = false");
    url.searchParams.set("fields", "nextPageToken,incompleteSearch,files(id,name,mimeType,parents,createdTime,modifiedTime,webViewLink,trashed)");
    url.searchParams.set("pageSize", "1000");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (response.status === 401) { await chrome.identity.removeCachedAuthToken({ token }); throw new Error("Oturum süresi doldu. Yeniden bağlanın."); }
    if (!response.ok) throw new Error(`Drive API hatası: ${response.status}`);
    const page = await response.json();
    if (page.incompleteSearch) throw new Error("Drive araması eksik döndü. Lütfen yeniden deneyin.");
    result.push(...page.files);
    pageToken = page.nextPageToken;
    showStatus(`${result.length} dosya tarandı…`);
  } while (pageToken);
  return result;
}

$("connect").addEventListener("click", async () => {
  $("connect").disabled = true;
  showStatus("Google hesabı bağlantısı açılıyor…");
  try {
    const { token } = await chrome.identity.getAuthToken({ interactive: true });
    if (!token) throw new Error("Google erişim belirteci alınamadı.");
    files = await listFiles(token);
    folders = new Map(files.filter(file => file.mimeType === "application/vnd.google-apps.folder").map(file => [file.id, file]));
    showStatus(`${files.length} öğe tarandı. Klasörler hariç sanal gruplar gösteriliyor.`);
    render();
  } catch (error) { showStatus(error.message || String(error)); }
  finally { $("connect").disabled = false; }
});

$("mode").addEventListener("change", render);
$("search").addEventListener("input", render);
$("save-rules").addEventListener("click", async () => {
  const parsed = normalizeRules($("rules").value);
  if (!parsed.length) { showStatus("En az bir geçerli kural yazın."); return; }
  rules = parsed;
  await chrome.storage.local.set({ ruleText: $("rules").value });
  showStatus("Kurallar yalnızca bu tarayıcıda kaydedildi.");
  render();
});

const saved = await chrome.storage.local.get(["ruleText", "overrides"]);
$("rules").value = saved.ruleText || DEFAULT_RULES.map(rule => `${rule.name}: ${rule.terms.join(", ")}`).join("\n");
rules = normalizeRules($("rules").value);
overrides = saved.overrides || {};
