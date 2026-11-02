# ERP Business Platform

Plataforma ERP de demonstração com **20 empresas fictícias** (10 de Marketing e 10 de E-commerce) em cidades brasileiras. Reúne dashboard executivo, catálogo de empresas e uma **Central de Dados Empresariais** para baixar as bases e analisar no Excel, Power BI, Python e SQL Server.

> Todos os dados são fictícios e gerados por script. Nenhuma informação real de empresas ou pessoas.

## Funcionalidades
- **Dashboard:** 10 indicadores (receita, lucro, margem, pedidos, ticket médio, investimento, clientes, conversão, ROI e ROAS), 6 gráficos em SVG e ranking de lucro, tudo reagindo aos filtros de segmento, cidade e período.
- **Catálogo:** cartões por empresa com indicadores do período, detalhe com histórico mensal e download do CSV.
- **Central de Dados:** CSV detalhado e resumo mensal por empresa, catálogo JSON, **ZIP com todas as bases**, dicionário de dados e documentação.
- **Dados coerentes:** lucro, margens, CPC, CPL, CPA, ROI e ROAS são calculados a partir das colunas, e os testes conferem as contas.

## Como usar
```bash
git clone https://github.com/MarcosFeitosa0408/erp-business-platform.git
cd erp-business-platform
# abra index.html no navegador
python generate_data.py   # opcional: regenera os dados (semente fixa, resultado reproduzível)
```

## Testes
```bash
pip install -r requirements.txt && pytest   # dados, contas, arquivos, ZIP e links das páginas
npm install && npm test                     # navegação, filtros e downloads (jsdom)
```

## Estrutura
```
index.html · dashboard.html · empresas.html · dados.html
style.css · app.js · dashboard.js
generate_data.py · requirements.txt · package.json
data/        empresas.json, dados.js, ecommerce/, marketing/, planilhas/, erp-bases-completas.zip
docs/        dicionario_dados.md, documentacao.md
tests/       test_dados.py, smoke.js
```

## Publicação
O workflow `.github/workflows/pages.yml` valida o projeto e publica os arquivos estáticos no GitHub Pages. Se a habilitação automática falhar por falta de permissão, selecione **Settings → Pages → Source → GitHub Actions** e execute novamente o workflow em Actions.

Endereço esperado após a conclusão do deploy: https://marcosfeitosa0408.github.io/erp-business-platform/.

## Autor
**Marcos Feitosa** · [GitHub](https://github.com/MarcosFeitosa0408)
