// Teste de navegação, filtros e downloads em jsdom (não substitui testar em um navegador real).
const { JSDOM } = require("jsdom"), path = require("path"), fs = require("fs");
const { IDBFactory } = require("fake-indexeddb");
const raiz = path.join(__dirname, ".."); let falhas = 0;
const ok = (n, c, d = "") => { console.log((c ? "PASS" : "FAIL") + " | " + n + (c ? "" : " | " + d)); if (!c) falhas++; };
async function abrir(p) {
  const errs = [], d = await JSDOM.fromFile(path.join(raiz, p), { runScripts: "dangerously", resources: "usable", pretendToBeVisual: true, beforeParse(w) { w.indexedDB = new IDBFactory(); w.addEventListener("error", e => errs.push(e.message)); w.HTMLElement.prototype.scrollIntoView = () => {}; } });
  await new Promise(r => d.window.document.readyState === "complete" ? r() : d.window.addEventListener("load", r));
  await d.window.ERPReady;
  return { w: d.window, doc: d.window.document, errs };
}
const ev = (w, el, v) => { el.value = v; el.dispatchEvent(new w.Event("change", { bubbles: true })); };
(async () => {
  for (const p of ["index.html", "empresas.html", "dashboard.html", "dados.html"]) { const { doc, errs } = await abrir(p); ok(p + ": renderiza sem erros", errs.length === 0 && !!doc.querySelector("#c")?.children.length, errs.join()); }
  let { w, doc } = await abrir("dashboard.html"), k0 = doc.querySelector("#kpis").textContent;
  ok("dashboard: 10 KPIs, 6 gráficos e ranking", doc.querySelectorAll("#kpis .card").length === 10 && doc.querySelectorAll(".chart svg").length === 6 && doc.querySelectorAll("#rank tbody tr").length === 10);
  ev(w, doc.querySelector("#f-seg"), "Marketing"); ok("dashboard: filtro por segmento altera KPIs e ranking", doc.querySelector("#kpis").textContent !== k0 && doc.querySelectorAll("#rank tbody tr").length === 10 && [...doc.querySelectorAll("#rank tbody tr")].every(r => r.cells[2].textContent === "Marketing"));
  ev(w, doc.querySelector("#f-seg"), ""); ev(w, doc.querySelector("#f-cid"), "Curitiba"); ok("dashboard: filtro por cidade", doc.querySelectorAll("#rank tbody tr").length === 2);
  ev(w, doc.querySelector("#f-cid"), ""); ev(w, doc.querySelector("#f-ate"), "2025-03"); ok("dashboard: filtro de período (3 meses no gráfico)", doc.querySelectorAll("#g6 circle").length === 3);
  ({ w, doc } = await abrir("empresas.html")); ok("catálogo: 20 cartões", doc.querySelectorAll("#gr .emp").length === 20);
  ev(w, doc.querySelector("#f-seg"), "E-commerce"); ok("catálogo: filtro por segmento", doc.querySelectorAll("#gr .emp").length === 10);
  doc.querySelector("#gr button").click(); ok("catálogo: painel de detalhe abre com gráfico", !doc.querySelector("#det").hidden && !!doc.querySelector("#d1 svg"));
  ({ w, doc } = await abrir("dados.html")); const hs = [...doc.querySelectorAll("a[download]")].map(a => a.getAttribute("href"));
  ok("dados: 44 links de download, todos apontam para arquivos existentes", hs.length === 44 && hs.every(h => fs.existsSync(path.join(raiz, h))), hs.filter(h => !fs.existsSync(path.join(raiz, h))).join());
  process.exit(falhas ? 1 : 0);
})();
