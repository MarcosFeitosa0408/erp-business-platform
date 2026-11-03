# Importação de CSV e Excel

Abra `importar.html` ou o botão **Analisar minha planilha** na página inicial e no menu.

1. Selecione ou arraste um ou vários CSV, TSV, XLSX ou XLS. Cada arquivo pode ter até 20 MB; uma seleção aceita até 50 arquivos e 100 MB no total. Escolha o arquivo da lista para conferir um de cada vez.
2. Para CSV, escolha o separador e a codificação se a detecção não corresponder ao arquivo.
3. No Excel, escolha uma aba. Informe a linha do cabeçalho (1 a 20).
4. Confira as sugestões de mapeamento. Receita é obrigatória, ou quantidade e preço unitário para calcular o total.
5. Escolha o formato de números em texto (Brasil ou EUA) e datas (dia/mês/ano ou mês/dia/ano).
6. Confirme se a receita já é líquida ou se devem ser subtraídos descontos e devoluções. Frete mapeado é adicionado ao custo, não à receita.
7. Clique em **Adicionar base e atualizar todas as telas** e confira o relatório de qualidade. Cada arquivo/aba confirmado passa a alimentar Visão Geral, Dashboard, Empresas e Central de Dados. Clique em **Próximo arquivo** para conferir o seguinte; no Excel, confirme individualmente cada aba desejada. Linhas com data mapeada inválida ou valores obrigatórios inválidos são rejeitadas e podem ser listadas em CSV por número de linha e motivo.
8. Explore os filtros compartilhados, gráficos, tabela paginada e exportação dos dados filtrados nas quatro telas. A Central de Dados exporta CSV, Excel e backup JSON; nela você também pode remover uma base individual. Impressão/PDF usa o diálogo do navegador.

## Contrato dos valores

Cada linha deve representar um registro financeiro, uma venda ou um item de venda. Receita e custo devem ser **totais por linha**. Se houver apenas custo unitário, calcule antes uma coluna `custo_total = custo_unitario × quantidade` na planilha. Campos com nomes diferentes podem ser associados manualmente. Uma mesma coluna não pode ser usada duas vezes no mapeamento.

Uma coluna em branco não é presumida como receita zero. Valores textuais incompatíveis com o formato numérico selecionado são rejeitados. Descontos, devoluções e frete vazios são considerados zero quando o campo foi mapeado. Custo vazio permanece desconhecido: se houver custos ausentes no filtro, o custo total, resultado e margem ficam indisponíveis. Quantidades são somadas quando disponíveis. Clientes distintos exigem identificação em todas as linhas filtradas. Nas telas compartilhadas, pedidos distintos usam empresa + loja + ID do pedido e exigem ID em todas as linhas filtradas; sem ID, use a contagem de registros.

Resultado = receita líquida − custos informados. Não equivale a lucro líquido contábil, pois outros custos e tributos podem estar ausentes. Margem = resultado / receita. Ticket = receita / pedidos distintos. O valor por registro é receita / linhas válidas. Sem data mapeada, os totais continuam disponíveis e os gráficos mensais mostram uma mensagem explicativa.

IDs de pedido repetidos podem representar itens e não são apagados automaticamente. A opção de remoção aplica-se somente a **linhas exatamente iguais**; a contagem de duplicatas e rejeições aparece antes dos resultados.

Datas ISO, dia/mês/ano, mês/dia/ano e números seriais de Excel são suportados conforme a escolha; o sistema 1904 é lido do arquivo. Datas fora de 1900–2100 e datas impossíveis são rejeitadas. Mês ISO AAAA-MM é interpretado como o primeiro dia do mês, permitindo analisar resumos mensais.

## Privacidade e limites

Não existe upload para servidor: a leitura ocorre em um Web Worker e os registros normalizados validados são gravados em IndexedDB, exclusivamente no navegador. O código não envia a planilha para APIs, GitHub, IA, analytics ou CDN. Recarregar, fechar a aba e navegar entre as quatro telas preserva a base no mesmo navegador e endereço do site. Os arquivos originais permanecem no computador; apenas os registros normalizados e a identificação da origem são guardados no site. Não há autenticação nem sincronização entre computadores/navegadores. Limpar os dados do site no navegador remove a base; faça exportações para backup. O botão **Apagar bases locais** remove as importações após confirmação.

Até 50.000 registros, 200 colunas e 1 milhão de células por aba; no máximo 50 bases e 200.000 registros no armazenamento local. Arquivos maiores devem ser divididos. A leitura tem timeout de 30 segundos. Os CSVs exportados escapam aspas e prefixos de fórmulas; textos de células são escapados antes de aparecer na interface.

A importação habilita análise de dados de empresas. Ela não implementa gestão fiscal, estoque ou outros módulos de um ERP transacional.

## Alternância e reimportação

A faixa no topo identifica **Dados importados da sua empresa** ou **Demonstração · 20 empresas fictícias**. As duas bases nunca são misturadas. **Ver demonstração** mantém suas importações salvas; **Usar meus dados importados** retoma a base local. Filtros de empresa, loja, categoria, marca, estado, canal, arquivo e período acompanham a navegação entre as quatro telas.

Reimportar a mesma combinação de nome de empresa + nome de arquivo + aba substitui essa base, evitando duplicá-la. Outra combinação acrescenta uma base. Mantenha o mesmo nome de empresa para reunir vários arquivos ou abas da mesma organização; identifique a loja na coluna correspondente. Linhas sobrepostas entre arquivos diferentes não são removidas automaticamente.

As importações feitas na versão anterior, que existiam somente na memória da aba, precisam ser importadas e confirmadas uma vez nesta versão para alimentar as quatro telas.
