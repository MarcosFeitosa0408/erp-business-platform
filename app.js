"use strict";
const ERP = window.ERP, E = ERP.empresas, PAGE = document.body.dataset.page;
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const R = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const N = v => Math.round(v).toLocaleString("pt-BR");
const P = v => isFinite(v) ? (v * 100).toFixed(1).replace(".", ",") + "%" : "–";
const X = v => isFinite(v) ? v.toFixed(2).replace(".", ",") + "x" : "–";
const fm = v => Math.abs(v) >= 1e6 ? (v / 1e6).toFixed(1).replace(".", ",") + " mi" : Math.abs(v) >= 1e3 ? Math.round(v / 1e3) + " mil" : String(Math.round(v));
const MES = E[0].meses.map(m => m.mes), NM = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const lab = m => NM[+m.slice(5) - 1] + "/" + m.slice(2, 4);
const soma = (ms, k) => ms.reduce((a, m) => a + (m[k] || 0), 0);
const card = (t, v, s = "") => `<div class="card"><small>${t}</small><b>${v}</b>${s ? `<em>${s}</em>` : ""}</div>`;

/* ---------- dados e filtros ---------- */
function filtrar(f) {
  return E.filter(e => (!f.seg || e.segmento === f.seg) && (!f.cidade || e.cidade === f.cidade) && e.nome.toLowerCase().includes((f.q || "").toLowerCase()))
    .map(e => ({ e, m: e.meses.filter(m => m.mes >= f.de && m.mes <= f.ate) }));
}
function ind(it) {
  const ec = it.filter(x => x.e.segmento === "E-commerce").flatMap(x => x.m), mk = it.filter(x => x.e.segmento === "Marketing").flatMap(x => x.m), all = it.flatMap(x => x.m);
  const rec = soma(all, "receita"), luc = soma(all, "lucro"), ped = soma(ec, "pedidos"), inv = soma(mk, "investimento"), recM = soma(mk, "receita");
  return { rec, luc, marg: luc / rec, ped, ticket: soma(ec, "receita") / ped, inv, cli: soma(all, "clientes"), conv: soma(mk, "conversoes") / soma(mk, "cliques"), roi: (recM - inv) / inv, roas: recM / inv };
}
function filtros(el, { periodo = true, busca = true } = {}, cb) {
  const cid = [...new Set(E.map(e => e.cidade))].sort(), op = (a, f = x => x) => a.map(x => `<option value="${esc(x)}">${esc(f(x))}</option>`).join("");
  el.innerHTML = (busca ? '<input id="f-q" type="search" placeholder="Buscar empresa…">' : "") +
    `<select id="f-seg"><option value="">Todos os segmentos</option>${op(["E-commerce", "Marketing"])}</select><select id="f-cid"><option value="">Todas as cidades</option>${op(cid)}</select>` +
    (periodo ? `<select id="f-de">${op(MES, lab)}</select><span>até</span><select id="f-ate">${op(MES, lab)}</select>` : "");
  if (periodo) $("#f-ate", el).value = MES[MES.length - 1];
  const get = () => {
    let de = $("#f-de", el)?.value || MES[0], ate = $("#f-ate", el)?.value || MES[MES.length - 1];
    if (de > ate) [de, ate] = [ate, de];
    return { q: $("#f-q", el)?.value || "", seg: $("#f-seg", el).value, cidade: $("#f-cid", el).value, de, ate };
  };
  el.addEventListener("input", () => cb(get())); el.addEventListener("change", () => cb(get()));
  return get;
}

/* ---------- gráficos SVG ---------- */
const svg = (w, h, s) => `<svg viewBox="0 0 ${w} ${h}" role="img">${s}</svg>`;
const legend = s => `<div class="lg">${s.map((x, k) => `<span><i style="background:var(--c${k + 1})"></i>${esc(x.n)}</span>`).join("")}</div>`;
const grade = (max, W, H, l, b, t) => Array.from({ length: 5 }, (_, i) => { const y = t + (H - b - t) * i / 4; return `<line x1="${l}" x2="${W}" y1="${y}" y2="${y}" class="g"/><text x="${l - 6}" y="${y + 4}" class="ax" text-anchor="end">${fm(max * (4 - i) / 4)}</text>`; }).join("");
function line(el, labels, series, area) {
  const W = 640, H = 240, l = 50, b = 28, t = 10, n = labels.length, max = Math.max(1, ...series.flatMap(s => s.d)), x = i => l + (W - l - 10) * (n > 1 ? i / (n - 1) : .5), y = v => t + (H - b - t) * (1 - Math.max(0, v) / max);
  let s = grade(max, W, H, l, b, t);
  series.forEach((se, k) => {
    const pts = se.d.map((v, i) => `${x(i)},${y(v)}`).join(" ");
    if (area) s += `<polygon points="${l},${H - b} ${pts} ${x(n - 1)},${H - b}" style="fill:var(--c${k + 1});opacity:.2"/>`;
    s += `<polyline points="${pts}" class="ln" style="stroke:var(--c${k + 1})"/>` + se.d.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3" style="fill:var(--c${k + 1})"><title>${esc(se.n)} · ${labels[i]}: ${R(v)}</title></circle>`).join("");
  });
  s += labels.map((m, i) => i % Math.ceil(n / 8) === 0 ? `<text x="${x(i)}" y="${H - 8}" class="ax" text-anchor="middle">${m}</text>` : "").join("");
  el.innerHTML = svg(W, H, s) + legend(series);
}
function cols(el, labels, series) {
  const W = 640, H = 240, l = 50, b = 34, t = 10, n = labels.length || 1, max = Math.max(1, ...series.flatMap(s => s.d)), bw = (W - l - 10) / n, g = bw * .75 / series.length;
  let s = grade(max, W, H, l, b, t);
  labels.forEach((m, i) => {
    series.forEach((se, k) => { const h = (H - b - t) * Math.max(0, se.d[i]) / max; s += `<rect x="${l + i * bw + bw * .125 + k * g}" y="${H - b - h}" width="${g - 1}" height="${h}" rx="2" style="fill:var(--c${k + 1})"><title>${esc(m)} · ${esc(se.n)}: ${R(se.d[i])}</title></rect>`; });
    s += `<text x="${l + i * bw + bw / 2}" y="${H - 14}" class="ax" text-anchor="middle">${esc(m.slice(0, 9))}</text>`;
  });
  el.innerHTML = svg(W, H, s) + (series.length > 1 ? legend(series) : "");
}
function hbars(el, items) {
  const W = 640, rh = 28, max = Math.max(1, ...items.map(i => i.v)), w = W - 260;
  el.innerHTML = svg(W, items.length * rh + 8, items.map((it, i) => `<text x="0" y="${i * rh + 19}" class="ax">${esc(it.l.slice(0, 24))}</text><rect x="160" y="${i * rh + 5}" width="${w * it.v / max}" height="17" rx="4" style="fill:var(--c1)"><title>${esc(it.l)}: ${R(it.v)}</title></rect><text x="${166 + w * it.v / max}" y="${i * rh + 19}" class="ax">${fm(it.v)}</text>`).join(""));
}
function donut(el, items) {
  const tot = items.reduce((a, i) => a + i.v, 0) || 1, r = 70, c = 2 * Math.PI * r; let off = 0;
  const arcs = items.map((it, k) => { const f = it.v / tot, s = `<circle cx="100" cy="100" r="${r}" fill="none" stroke-width="28" stroke-dasharray="${f * c} ${c}" stroke-dashoffset="${-off * c}" transform="rotate(-90 100 100)" style="stroke:var(--c${k + 1})"><title>${esc(it.l)}: ${R(it.v)} (${P(f)})</title></circle>`; off += f; return s; }).join("");
  el.innerHTML = `<div class="donut">${svg(200, 200, arcs + `<text x="100" y="106" text-anchor="middle" class="big">${fm(tot)}</text>`)}${legend(items.map(i => ({ n: `${i.l} ${P(i.v / tot)}` })))}</div>`;
}

/* ---------- layout ---------- */
const NAV = [["importar", "Analisar minha planilha", "M12 3v12m-5-5l5-5 5 5M4 21h16"], ["index", "Visão geral", "M3 11l9-8 9 8v9H3z"], ["dashboard", "Dashboard", "M4 20V10M10 20V4M16 20v-8M22 20H2"], ["empresas", "Empresas", "M4 21V5l8-2v18M12 9h8v12"], ["dados", "Central de Dados", "M12 3v12m-5-5l5 5 5-5M4 21h16"]];
function shell(t, s) {
  document.title = t + " · ERP Business Platform";
  document.body.innerHTML = `<aside><div class="brand"><b>ERP</b>Business Platform</div><nav>${NAV.map(([p, n, d]) => `<a href="${p}.html"${p === PAGE ? ' class="on"' : ""}><svg viewBox="0 0 24 24"><path d="${d}"/></svg><span>${n}</span></a>`).join("")}</nav><small>${PAGE === "importar" ? "Planilha local · análise privada" : "Dados 100% fictícios"}</small></aside><main><header><h1>${t}</h1><p>${s}</p></header><div id="c"></div></main>`;
  return $("#c");
}

/* ---------- páginas ---------- */
function pgIndex() {
  const c = shell("ERP Business Platform", "Ambiente de demonstração com empresas fictícias de Marketing e E-commerce");
  const i = ind(E.map(e => ({ e, m: e.meses })));
  c.innerHTML = `<div class="kpis">${card("Empresas", E.length, "10 Marketing · 10 E-commerce")}${card("Período", "12 meses", lab(MES[0]) + " a " + lab(MES[11]))}${card("Receita consolidada", R(i.rec))}${card("Lucro consolidado", R(i.luc))}</div>
  <div class="panel"><h2>Analise os dados da sua empresa</h2><p>Importe CSV ou Excel, confira as colunas e explore indicadores e gráficos. O arquivo é processado apenas no seu navegador.</p><a class="btn" href="importar.html">Analisar minha planilha →</a></div>
  <div class="grid3" style="margin-top:16px">${NAV.filter(([p]) => p !== "index" && p !== "importar").map(([p, n]) => `<a class="card dl" href="${p}.html"><b>${n}</b><small>${{ dashboard: "Indicadores e gráficos com filtros", empresas: "Catálogo e histórico de cada empresa", dados: "Baixe planilhas CSV, JSON e ZIP" }[p]}</small></a>`).join("")}</div>
  <div class="panel"><h2>Sobre o projeto</h2><p>Plataforma de estudo e portfólio: dados fictícios gerados em Python, painel em HTML, CSS e JavaScript, sem dependências externas. Veja a <a href="docs/documentacao.md">documentação</a> e o <a href="docs/dicionario_dados.md">dicionário de dados</a>.</p></div>`;
}
function pgEmpresas() {
  const c = shell("Catálogo de empresas", "20 empresas fictícias · os indicadores seguem o período filtrado");
  c.innerHTML = '<div class="filtros" id="fl"></div><div id="gr" class="grid"></div><section id="det" class="panel" hidden></section>';
  const draw = f => {
    $("#gr").innerHTML = filtrar(f).map(({ e, m }) => { const i = ind([{ e, m }]); return `<article class="card emp"><div><span class="tag">${esc(e.segmento)}</span><h3>${esc(e.nome)}</h3><small>${esc(e.cidade)}/${e.uf}</small><p>${esc(e.descricao)}</p></div><div class="mini"><span>Receita<b>${R(i.rec)}</b></span><span>Lucro<b>${R(i.luc)}</b></span><span>Margem<b>${P(i.marg)}</b></span></div><div class="acoes"><button data-s="${e.slug}">Ver dados</button><a class="btn sec" href="${esc(e.detalhado)}" download>Baixar CSV</a></div></article>`; }).join("") || "<p>Nenhuma empresa encontrada.</p>";
  };
  const get = filtros($("#fl"), {}, draw); draw(get());
  const abre = slug => {
    const e = E.find(x => x.slug === slug); if (!e) return;
    const f = get(), m = e.meses.filter(x => x.mes >= f.de && x.mes <= f.ate), i = ind([{ e, m }]), p = $("#det"), mk = e.segmento === "Marketing";
    p.hidden = false;
    p.innerHTML = `<h2>${esc(e.nome)}</h2><small>${esc(e.segmento)} · ${esc(e.cidade)}/${e.uf} · ${e.linhas} registros</small><div class="kpis" style="margin-top:12px">${card("Receita", R(i.rec))}${card("Lucro", R(i.luc))}${card("Margem", P(i.marg))}${mk ? card("ROAS", X(i.roas)) + card("Conversão", P(i.conv)) : card("Pedidos", N(i.ped)) + card("Ticket médio", R(i.ticket))}</div><div class="chart" id="d1"></div><p><a class="btn" href="${esc(e.detalhado)}" download>CSV detalhado</a> <a class="btn sec" href="${esc(e.resumo)}" download>Resumo mensal</a></p>`;
    line($("#d1"), m.map(x => lab(x.mes)), [{ n: "Receita", d: m.map(x => x.receita) }, { n: "Lucro", d: m.map(x => x.lucro) }]);
    p.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  $("#gr").addEventListener("click", ev => { const b = ev.target.closest("button[data-s]"); if (b) { location.hash = b.dataset.s; abre(b.dataset.s); } });
  if (location.hash) abre(location.hash.slice(1));
}
function pgDados() {
  const c = shell("Central de Dados Empresariais", "Bases para Excel, Power BI, Python e SQL Server");
  c.innerHTML = `<div class="grid3">${[["Pacote ZIP completo", "40 planilhas CSV, JSON e dicionário", "data/erp-bases-completas.zip"], ["Catálogo em JSON", "20 empresas com histórico mensal", "data/empresas.json"], ["Dicionário de dados", "Colunas, fórmulas e formatos", "docs/dicionario_dados.md"], ["Documentação técnica", "Arquitetura, uso e publicação", "docs/documentacao.md"]].map(([t, d, h]) => `<a class="card dl" href="${h}" download><b>${t}</b><small>${d}</small></a>`).join("")}</div>
  <div class="filtros" id="fl"></div><div class="tabela"><table><thead><tr><th>Empresa</th><th>Segmento</th><th>Cidade</th><th>Registros</th><th>Arquivos</th></tr></thead><tbody id="tb"></tbody></table></div>
  <div class="panel"><h3>Como abrir</h3><p>CSV em UTF-8 com separador <code>;</code> e decimais com vírgula. Python: <code>pd.read_csv(arq, sep=";", decimal=",")</code>. Excel e Power BI: importar de Texto/CSV com delimitador ponto e vírgula.</p></div>`;
  const draw = f => { $("#tb").innerHTML = filtrar({ ...f, de: MES[0], ate: MES[11] }).map(({ e }) => `<tr><td><b>${esc(e.nome)}</b></td><td>${esc(e.segmento)}</td><td>${esc(e.cidade)}/${e.uf}</td><td>${N(e.linhas)}</td><td><a class="btn" href="${esc(e.detalhado)}" download>CSV detalhado</a> <a class="btn sec" href="${esc(e.resumo)}" download>Resumo mensal</a></td></tr>`).join(""); };
  draw(filtros($("#fl"), { periodo: false }, draw)());
}
({ index: pgIndex, empresas: pgEmpresas, dados: pgDados })[PAGE]?.();
