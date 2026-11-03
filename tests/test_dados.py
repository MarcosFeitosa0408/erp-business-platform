import csv, json, pathlib, re, zipfile
from urllib.parse import urlsplit, unquote

RAIZ = pathlib.Path(__file__).resolve().parent.parent
EMP = json.loads((RAIZ / "data/empresas.json").read_text(encoding="utf-8"))["empresas"]
num = lambda s: float(s.replace(",", "."))


def le(p):
    with open(RAIZ / p, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f, delimiter=";"))


def test_vinte_empresas_doze_meses():
    assert len(EMP) == 20
    assert sum(e["segmento"] == "Marketing" for e in EMP) == 10 and sum(e["segmento"] == "E-commerce" for e in EMP) == 10
    assert len({e["cidade"] for e in EMP}) >= 8
    assert all(len(e["meses"]) == 12 for e in EMP)


def test_arquivos_existem_e_nao_vazios():
    for e in EMP:
        for k in ("detalhado", "resumo"):
            assert (RAIZ / e[k]).stat().st_size > 0, e[k]
        assert len(le(e["detalhado"])) == e["linhas"] > 12


def test_ecommerce_coerente():
    for e in (e for e in EMP if e["segmento"] == "E-commerce"):
        for r in le(e["detalhado"]):
            b, d, c, f, dv, l = (num(r[k]) for k in ("receita_bruta", "descontos", "custos", "frete", "devolucoes", "lucro"))
            assert abs(b - num(r["quantidade"]) * num(r["preco_unitario"])) < 0.02 * num(r["quantidade"])
            assert abs(l - (b - d - c - f - dv)) < 0.011


def test_marketing_coerente():
    for e in (e for e in EMP if e["segmento"] == "Marketing"):
        for r in le(e["detalhado"]):
            inv, rec = num(r["investimento"]), num(r["receita_atribuida"])
            imp, alc, cli, lea, con = (int(r[k]) for k in ("impressoes", "alcance", "cliques", "leads", "conversoes"))
            assert imp >= alc and imp >= cli >= lea >= con >= 1
            assert abs(num(r["cpc"]) - inv / cli) < 0.011 and abs(num(r["cpl"]) - inv / lea) < 0.011 and abs(num(r["cpa"]) - inv / con) < 0.011
            assert abs(num(r["roas"]) - rec / inv) < 0.001 and abs(num(r["roi"]) - (rec - inv) / inv) < 0.001


def test_json_confere_com_csv():
    for e in EMP:
        det, res = le(e["detalhado"]), le(e["resumo"])
        for m, rr in zip(e["meses"], res):
            assert m["mes"] == rr["mes"] and abs(m["receita"] - num(rr["receita"])) < 0.011 and abs(m["lucro"] - (m["receita"] - m["custo"])) < 0.011
        if e["segmento"] == "E-commerce":
            tot = sum(num(r["receita_bruta"]) - num(r["descontos"]) - num(r["devolucoes"]) for r in det)
        else:
            tot = sum(num(r["receita_atribuida"]) for r in det)
        assert abs(sum(m["receita"] for m in e["meses"]) - tot) < 0.5


def test_zip_completo():
    nomes = zipfile.ZipFile(RAIZ / "data/erp-bases-completas.zip").namelist()
    assert len([n for n in nomes if n.endswith(".csv")]) == 40 and "empresas.json" in nomes and "dicionario_dados.md" in nomes


def test_paginas_apontam_para_arquivos_existentes():
    for h in RAIZ.glob("*.html"):
        for ref in re.findall(r'(?:src|href)="([^"#:]+)"', h.read_text(encoding="utf-8")):
            assert (RAIZ / unquote(urlsplit(ref).path)).exists(), f"{h.name}: {ref}"
