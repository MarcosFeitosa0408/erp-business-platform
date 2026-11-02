"use strict";
if (PAGE === "dashboard") {
  const c = shell("Dashboard executivo", "Indicadores e gráficos respondem aos filtros");
  const bloco = (id, t) => `<section class="card"><h3>${t}</h3><div class="chart" id="${id}"></div></section>`;
  c.innerHTML = `<div class="filtros" id="fl"></div><div class="kpis" id="kpis"></div><div class="charts">
    ${bloco("g1", "Evolução mensal da receita")}${bloco("g2", "Receita por empresa (top 10)")}${bloco("g3", "Desempenho por categoria e canal")}${bloco("g4", "Receita por segmento")}${bloco("g5", "Custos versus receitas")}${bloco("g6", "Evolução do lucro")}</div>
    <section class="panel"><h3>Ranking: melhores lucros</h3><div class="tabela"><table id="rank"><thead><tr><th>#</th><th>Empresa</th><th>Segmento</th><th>Receita</th><th>Lucro</th><th>Margem</th></tr></thead><tbody></tbody></table></div></section>`;
  const draw = f => {
    const it = filtrar(f), ms = MES.filter(m => m >= f.de && m <= f.ate), L = ms.map(lab), i = ind(it);
    const mm = (k, seg) => ms.map(m => it.reduce((a, x) => a + (!seg || x.e.segmento === seg ? (x.m.find(y => y.mes === m)?.[k] || 0) : 0), 0));
    $("#kpis").innerHTML = [["Receita total", R(i.rec)], ["Lucro líquido", R(i.luc)], ["Margem de lucro", P(i.marg)], ["Total de pedidos", N(i.ped)], ["Ticket médio", isFinite(i.ticket) ? R(i.ticket) : "–"], ["Investimento em marketing", R(i.inv)], ["Clientes", N(i.cli)], ["Taxa de conversão", P(i.conv)], ["ROI", P(i.roi)], ["ROAS", X(i.roas)]].map(([t, v]) => card(t, v)).join("");
    line($("#g1"), L, [{ n: "E-commerce", d: mm("receita", "E-commerce") }, { n: "Marketing (receita atribuída)", d: mm("receita", "Marketing") }]);
    const top = it.map(x => ({ e: x.e, r: soma(x.m, "receita"), l: soma(x.m, "lucro") })).sort((a, b) => b.l - a.l);
    const porRec = [...top].sort((a, b) => b.r - a.r).slice(0, 10);
    cols($("#g2"), porRec.map(x => x.e.nome), [{ n: "Receita", d: porRec.map(x => x.r) }]);
    const cat = {}; it.forEach(x => x.m.forEach(m => Object.entries(m.cat || {}).forEach(([k, v]) => cat[k] = (cat[k] || 0) + v)));
    hbars($("#g3"), Object.entries(cat).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([l, v]) => ({ l, v })));
    donut($("#g4"), ["E-commerce", "Marketing"].map(s => ({ l: s, v: it.filter(x => x.e.segmento === s).reduce((a, x) => a + soma(x.m, "receita"), 0) })).filter(x => x.v > 0));
    cols($("#g5"), L, [{ n: "Receitas", d: mm("receita") }, { n: "Custos", d: mm("custo") }]);
    line($("#g6"), L, [{ n: "Lucro", d: mm("lucro") }], true);
    $("#rank tbody").innerHTML = top.slice(0, 10).map((x, k) => `<tr><td>${k + 1}</td><td><a href="empresas.html#${x.e.slug}">${esc(x.e.nome)}</a></td><td>${esc(x.e.segmento)}</td><td>${R(x.r)}</td><td>${R(x.l)}</td><td>${P(x.l / x.r)}</td></tr>`).join("") || '<tr><td colspan="6">Sem dados para o filtro.</td></tr>';
  };
  draw(filtros($("#fl"), { busca: false }, draw)());
}
