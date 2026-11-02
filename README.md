# ERP Business Platform

Plataforma ERP de demonstração com **20 empresas fictícias** (10 de Marketing e 10 de E-commerce) em cidades brasileiras. Reúne dashboard executivo, catálogo de empresas e uma **Central de Dados Empresariais** para baixar as bases e analisar no Excel, Power BI, Python e SQL Server.

> Todos os dados são fictícios e gerados por script. Nenhuma informação real de empresas ou pessoas.

## Analisar uma planilha da sua empresa

Abra **Analisar minha planilha** no menu ou na página inicial. Importe CSV, TSV, XLSX ou XLS, escolha a aba e a linha de cabeçalho, confirme o mapeamento e clique em **Gerar análise da empresa**. A tela oferece filtros, indicadores, seis visualizações, tabela paginada, CSV filtrado e impressão/PDF. Baixe o modelo CSV para conferir a estrutura.

Os dados são processados em um Web Worker no navegador, sem envio ao GitHub ou a um servidor. Permanecem apenas na memória da aba; recarregar a página limpa a análise. Limites: 20 MB, 50.000 registros, 200 colunas e 1 milhão de células. CSV aceita UTF-8 ou Windows-1252; números em texto usam o formato escolhido (Brasil ou EUA).

A importação não transforma o site em sistema transacional: não há estoque, faturamento fiscal, login ou banco de dados compartilhado.

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

## Dependência de leitura Excel

SheetJS CE 0.20.3 incluído localmente em `vendor/`, conforme documentação oficial: https://docs.sheetjs.com/docs/getting-started/installation/standalone/. Licença em `vendor/LICENSE-SheetJS.txt`. A página não carrega scripts de terceiros por CDN.

Veja [regras da importação](docs/importacao.md).
