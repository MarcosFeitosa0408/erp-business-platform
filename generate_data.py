"""Gera as bases fictícias do ERP (CSV, JSON, dados.js e ZIP). Uso: python generate_data.py"""
import csv, json, pathlib, random, re, unicodedata, zipfile

random.seed(2026)
RAIZ = pathlib.Path(__file__).parent
DATA = RAIZ / "data"
CIDADES = {"São Paulo": ("SP", "Sudeste"), "Rio de Janeiro": ("RJ", "Sudeste"), "Belo Horizonte": ("MG", "Sudeste"),
           "Curitiba": ("PR", "Sul"), "Porto Alegre": ("RS", "Sul"), "Fortaleza": ("CE", "Nordeste"),
           "Recife": ("PE", "Nordeste"), "Salvador": ("BA", "Nordeste"), "Goiânia": ("GO", "Centro-Oeste"),
           "Brasília": ("DF", "Centro-Oeste")}
EMPRESAS = [
    ("Loja Aurora", "E-commerce", "Decoração e itens para a casa"), ("ModaViva", "E-commerce", "Moda urbana e acessórios"),
    ("TechNova Store", "E-commerce", "Eletrônicos e acessórios"), ("PetMundo", "E-commerce", "Produtos para cães e gatos"),
    ("BelaPele Cosméticos", "E-commerce", "Beleza e cuidados pessoais"), ("SportMax", "E-commerce", "Artigos esportivos"),
    ("Livraria Horizonte", "E-commerce", "Livros e papelaria"), ("Ferramentas Alfa", "E-commerce", "Ferramentas e construção"),
    ("EcoVerde Market", "E-commerce", "Produtos sustentáveis"), ("Casa & Cantinho", "E-commerce", "Utilidades domésticas"),
    ("Pixel Press", "Marketing", "Produção de conteúdo e mídia paga"), ("Agência Órbita", "Marketing", "Marketing digital para varejo"),
    ("Mídia Norte", "Marketing", "Planejamento de mídia online"), ("Criativa 360", "Marketing", "Branding e campanhas integradas"),
    ("Impulso Digital", "Marketing", "Performance e geração de leads"), ("Foco Social", "Marketing", "Gestão de redes sociais"),
    ("Leads Brasil", "Marketing", "Captação de leads B2B"), ("Marca Forte", "Marketing", "Posicionamento de marca"),
    ("Clique Certo", "Marketing", "Anúncios de busca e remarketing"), ("Estúdio Vértice", "Marketing", "Vídeo, design e influenciadores"),
]
PROD = {"Eletrônicos": [("Fone Bluetooth", 189), ("Mouse Sem Fio", 79), ("Carregador Rápido", 99)],
        "Moda": [("Camiseta", 69), ("Tênis Casual", 249), ("Jaqueta", 329)],
        "Casa": [("Jogo de Panelas", 299), ("Luminária", 119), ("Organizador", 59)],
        "Beleza": [("Hidratante", 54), ("Perfume", 219), ("Kit Skincare", 169)],
        "Pet": [("Ração Premium", 139), ("Cama Pet", 109), ("Brinquedo", 39)],
        "Esporte": [("Bola", 89), ("Halter", 129), ("Garrafa Térmica", 59)],
        "Livros": [("Romance", 49), ("Guia de Dados", 89), ("Box Clássicos", 159)],
        "Ferramentas": [("Furadeira", 329), ("Kit Chaves", 79), ("Trena", 29)]}
CANAIS_VENDA = ["Site próprio", "Marketplace", "App", "Redes sociais"]
PAGTOS = ["Cartão de crédito", "Pix", "Boleto", "Cartão de débito"]
NOMES = ["Ana", "Bruno", "Carla", "Diego", "Elisa", "Felipe", "Gabriela", "Heitor", "Isabela", "João", "Kelly", "Lucas", "Marina", "Nicolas", "Olívia", "Paulo"]
SOBRE = ["Almeida", "Barros", "Cardoso", "Duarte", "Esteves", "Farias", "Guedes", "Henrique", "Ibrahim", "Jardim", "Klein", "Lopes", "Moreira", "Nunes"]
CANAIS_MKT = ["Google Ads", "Meta Ads", "LinkedIn Ads", "E-mail", "SEO", "TikTok Ads", "Influenciadores"]
TEMAS = ["Lançamento", "Black Friday", "Remarketing", "Institucional", "Captação"]
MESES = [f"2025-{m:02d}" for m in range(1, 13)]
r2 = lambda v: round(v, 2)


def slug(t):
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")


RAZOES = {"margem_lucro", "taxa_conversao", "roi", "roas"}


def grava(caminho, linhas):
    """CSV brasileiro: separador ';' e decimais com vírgula (razões com 4 casas)."""
    fmt = lambda k, v: (f"{v:.4f}" if k in RAZOES else f"{v:.2f}").replace(".", ",") if isinstance(v, float) else v
    with open(caminho, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(linhas[0].keys())
        for l in linhas:
            w.writerow([fmt(k, v) for k, v in l.items()])


def gera_ecommerce(cats, porte):
    linhas, n = [], 0
    for k, mes in enumerate(MESES):
        for _ in range(int(random.randint(55, 95) * porte * (1.3 if k >= 10 else 1) * (1 + 0.015 * k))):
            n += 1
            cat = random.choice(cats)
            prod, base = random.choice(PROD[cat])
            preco = r2(base * random.uniform(0.95, 1.1))
            q = random.choices([1, 2, 3, 4], [60, 25, 10, 5])[0]
            bruta = r2(q * preco)
            desc = r2(bruta * random.choice([0, 0, 0.05, 0.1, 0.15]))
            liq = r2(bruta - desc)
            status = random.choices(["Entregue", "Devolvido", "Cancelado"], [88, 7, 5])[0]
            custo, frete = r2(bruta * random.uniform(0.5, 0.7)), r2(random.uniform(9, 32))
            if status == "Cancelado":
                custo = frete = 0.0
            dev = liq if status != "Entregue" else 0.0
            lucro = r2(bruta - desc - custo - frete - dev)
            cidade = random.choice(list(CIDADES))
            linhas.append({"id_pedido": f"PED-{n:05d}", "data_venda": f"{mes}-{random.randint(1, 28):02d}",
                           "cliente": f"{random.choice(NOMES)} {random.choice(SOBRE)}", "produto": prod, "categoria": cat,
                           "quantidade": q, "preco_unitario": preco, "receita_bruta": bruta, "descontos": desc,
                           "custos": custo, "lucro": lucro, "margem_lucro": round(lucro / liq, 4) if liq else 0.0,
                           "canal_venda": random.choice(CANAIS_VENDA), "regiao": CIDADES[cidade][1], "cidade": cidade,
                           "status_pedido": status, "forma_pagamento": random.choice(PAGTOS), "frete": frete, "devolucoes": dev})
    return linhas


def gera_marketing(porte):
    linhas, n = [], 0
    for k, mes in enumerate(MESES):
        for _ in range(5):
            n += 1
            canal, tema = random.choice(CANAIS_MKT), random.choice(TEMAS)
            inv = r2(random.uniform(3000, 18000) * porte * (1 + 0.01 * k))
            ticket, roas_alvo = random.uniform(120, 400), random.uniform(1.4, 4.0)
            conv = max(1, round(inv * roas_alvo / ticket))
            leads = max(conv, round(conv / random.uniform(0.1, 0.3)))
            cliques = max(leads, round(leads / random.uniform(0.06, 0.18)))
            impr = max(cliques, round(cliques / random.uniform(0.012, 0.03)))
            alcance = min(impr, round(impr * random.uniform(0.55, 0.8)))
            rec = r2(conv * ticket)
            linhas.append({"id_campanha": f"CMP-{n:04d}", "campanha": f"{canal} · {tema}", "data": f"{mes}-{random.randint(1, 28):02d}",
                           "canal": canal, "investimento": inv, "impressoes": impr, "alcance": alcance, "cliques": cliques,
                           "leads": leads, "conversoes": conv, "receita_atribuida": rec, "cpc": r2(inv / cliques),
                           "cpl": r2(inv / leads), "cpa": r2(inv / conv), "taxa_conversao": round(conv / cliques, 4),
                           "roi": round((rec - inv) / inv, 4), "roas": round(rec / inv, 4)})
    return linhas


def resumo(seg, linhas):
    out = []
    for mes in MESES:
        L = [l for l in linhas if (l["data_venda"] if seg == "E-commerce" else l["data"]).startswith(mes)]
        z = dict(mes=mes, receita=0.0, custo=0.0, lucro=0.0, pedidos=0, clientes=0, investimento=0.0, leads=0, cliques=0, conversoes=0, cat={})
        if seg == "E-commerce":
            z["receita"] = r2(sum(l["receita_bruta"] - l["descontos"] - l["devolucoes"] for l in L))
            z["custo"] = r2(sum(l["custos"] + l["frete"] for l in L))
            z["pedidos"], z["clientes"] = len(L), len({l["cliente"] for l in L})
            for l in L:
                z["cat"][l["categoria"]] = r2(z["cat"].get(l["categoria"], 0) + l["receita_bruta"] - l["descontos"] - l["devolucoes"])
        else:
            z["receita"], z["custo"] = r2(sum(l["receita_atribuida"] for l in L)), r2(sum(l["investimento"] for l in L))
            z["investimento"] = z["custo"]
            z["leads"], z["cliques"] = sum(l["leads"] for l in L), sum(l["cliques"] for l in L)
            z["conversoes"] = z["pedidos"] = z["clientes"] = sum(l["conversoes"] for l in L)
            for l in L:
                z["cat"][l["canal"]] = r2(z["cat"].get(l["canal"], 0) + l["receita_atribuida"])
        z["lucro"] = r2(z["receita"] - z["custo"])
        out.append(z)
    return out


empresas = []
for i, (nome, seg, desc) in enumerate(EMPRESAS):
    s, cidade = slug(nome), list(CIDADES)[i % 10]
    porte = random.uniform(0.7, 1.6)
    pasta = "ecommerce" if seg == "E-commerce" else "marketing"
    linhas = gera_ecommerce(random.sample(list(PROD), 4), porte) if seg == "E-commerce" else gera_marketing(porte)
    grava(DATA / pasta / f"{s}.csv", linhas)
    meses = resumo(seg, linhas)
    grava(DATA / "planilhas" / f"{s}-resumo-mensal.csv", [{k: v for k, v in m.items() if k != "cat"} for m in meses])
    empresas.append({"id": i + 1, "nome": nome, "slug": s, "segmento": seg, "cidade": cidade, "uf": CIDADES[cidade][0],
                     "descricao": desc, "detalhado": f"data/{pasta}/{s}.csv", "resumo": f"data/planilhas/{s}-resumo-mensal.csv",
                     "linhas": len(linhas), "meses": meses})

payload = {"versao": "1.0", "observacao": "Dados 100% fictícios.", "empresas": empresas}
(DATA / "empresas.json").write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
(DATA / "dados.js").write_text("window.ERP=" + json.dumps(payload, ensure_ascii=False) + ";\n", encoding="utf-8")
with zipfile.ZipFile(DATA / "erp-bases-completas.zip", "w", zipfile.ZIP_DEFLATED) as z:
    for p in sorted(DATA.glob("*/*.csv")):
        z.write(p, p.relative_to(DATA).as_posix())
    z.write(DATA / "empresas.json", "empresas.json")
    if (RAIZ / "docs/dicionario_dados.md").exists():
        z.write(RAIZ / "docs/dicionario_dados.md", "dicionario_dados.md")
print(f"{len(empresas)} empresas geradas")
