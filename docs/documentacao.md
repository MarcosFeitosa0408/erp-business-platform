# Documentação técnica

**Arquitetura:** site estático (HTML, CSS e JavaScript puro, gráficos em SVG próprios, sem bibliotecas externas). `generate_data.py` gera CSVs, `data/empresas.json`, `data/dados.js` (usado pelas páginas, funciona também abrindo o arquivo local) e o ZIP.

**Páginas:** `index.html` (visão geral), `dashboard.html` (indicadores e 7 visões), `empresas.html` (catálogo e detalhe), `dados.html` (Central de Dados Empresariais).

**Rodar localmente:** abra `index.html` no navegador. Para regenerar os dados: `python generate_data.py` (usa semente fixa; resultado reproduzível).

**Testes:** `pip install -r requirements.txt && pytest` (dados e arquivos). `npm install && npm test` (navegação e filtros em jsdom).

**Publicar:** GitHub → Settings → Pages → Deploy from a branch → `main` / `(root)`.

**Limitações:** receita de marketing é a *receita atribuída*, não faturamento da agência; "clientes" soma clientes únicos por mês (e-commerce) e conversões (marketing).
