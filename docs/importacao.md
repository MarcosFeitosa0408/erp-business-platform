# Importação de CSV e Excel

Abra `importar.html` ou o botão **Analisar minha planilha** na página inicial e no menu.

1. Selecione ou arraste CSV, TSV, XLSX ou XLS, até 20 MB.
2. Para CSV, escolha o separador e a codificação se a detecção não corresponder ao arquivo.
3. No Excel, escolha uma aba. Informe a linha do cabeçalho (1 a 20).
4. Confira as sugestões de mapeamento. Receita é obrigatória, ou quantidade e preço unitário para calcular o total.
5. Escolha o formato de números em texto (Brasil ou EUA) e datas (dia/mês/ano ou mês/dia/ano).
6. Confirme se a receita já é líquida ou se devem ser subtraídos descontos e devoluções. Frete mapeado é adicionado ao custo, não à receita.
7. Gere a análise e confira o relatório de qualidade. Linhas com data mapeada inválida ou valores obrigatórios inválidos são rejeitadas e podem ser listadas em CSV por número de linha e motivo.
8. Explore os filtros, gráficos, tabela paginada e exportação dos dados filtrados. Impressão/PDF usa o diálogo do navegador.

## Contrato dos valores

Cada linha deve representar um registro financeiro, uma venda ou um item de venda. Receita e custo devem ser **totais por linha**. Se houver apenas custo unitário, calcule antes uma coluna `custo_total = custo_unitario × quantidade` na planilha. Campos com nomes diferentes podem ser associados manualmente. Uma mesma coluna não pode ser usada duas vezes no mapeamento.

Uma coluna em branco não é presumida como receita zero. Valores textuais incompatíveis com o formato numérico selecionado são rejeitados. Descontos, devoluções e frete vazios são considerados zero quando o campo foi mapeado. Custo vazio permanece desconhecido: se houver custos ausentes no filtro, o custo total, resultado e margem ficam indisponíveis. Quantidades são somadas quando disponíveis. Clientes distintos exigem identificação em todas as linhas filtradas. Pedidos distintos usam o par loja + ID do pedido e exigem ID em todas as linhas filtradas; sem ID, use a contagem de registros.

Resultado = receita líquida − custos informados. Não equivale a lucro líquido contábil, pois outros custos e tributos podem estar ausentes. Margem = resultado / receita. Ticket = receita / pedidos distintos. O valor por registro é receita / linhas válidas. Sem data mapeada, os totais continuam disponíveis e os gráficos mensais mostram uma mensagem explicativa.

IDs de pedido repetidos podem representar itens e não são apagados automaticamente. A opção de remoção aplica-se somente a **linhas exatamente iguais**; a contagem de duplicatas e rejeições aparece antes dos resultados.

Datas ISO, dia/mês/ano, mês/dia/ano e números seriais de Excel são suportados conforme a escolha; o sistema 1904 é lido do arquivo. Datas fora de 1900–2100 e datas impossíveis são rejeitadas. Mês ISO AAAA-MM é interpretado como o primeiro dia do mês, permitindo analisar resumos mensais.

## Privacidade e limites

Não existe upload para servidor: a leitura ocorre em um Web Worker e a análise na memória do navegador. O código não envia a planilha para APIs, GitHub, IA, analytics ou CDN. Fechar ou recarregar a aba elimina a análise; o arquivo original permanece no computador. Não há autenticação, armazenamento compartilhado ou histórico persistente.

Até 50.000 registros, 200 colunas e 1 milhão de células por aba. Arquivos maiores devem ser divididos. A leitura tem timeout de 30 segundos. Os CSVs exportados escapam aspas e prefixos de fórmulas; textos de células são escapados antes de aparecer na interface.

A importação habilita análise de dados de empresas. Ela não implementa gestão fiscal, estoque ou outros módulos de um ERP transacional.
