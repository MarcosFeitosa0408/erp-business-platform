# Dicionário de dados

Todos os dados são **fictícios**. CSV em UTF-8, separador `;`, decimais com vírgula. Python: `pd.read_csv(arq, sep=";", decimal=",")`. Excel: Dados → De Texto/CSV. Power BI: Obter Dados → Texto/CSV.

## E-commerce (`data/ecommerce/<empresa>.csv`)
| Coluna | Descrição |
|---|---|
| id_pedido, data_venda, cliente | Identificador, data (AAAA-MM-DD) e cliente fictício |
| produto, categoria, quantidade, preco_unitario | Item vendido |
| receita_bruta | quantidade × preço unitário |
| descontos | Desconto concedido no pedido |
| custos | Custo dos produtos (zero se cancelado) |
| frete | Custo de frete (zero se cancelado) |
| devolucoes | Valor devolvido: (receita bruta − descontos) se status for Devolvido ou Cancelado |
| lucro | receita_bruta − descontos − custos − frete − devolucoes |
| margem_lucro | lucro ÷ (receita_bruta − descontos) |
| canal_venda, regiao, cidade, status_pedido, forma_pagamento | Atributos do pedido |

## Marketing (`data/marketing/<empresa>.csv`)
| Coluna | Descrição |
|---|---|
| id_campanha, campanha, data, canal | Identificação da campanha |
| investimento | Valor investido (R$) |
| impressoes ≥ alcance; impressoes ≥ cliques ≥ leads ≥ conversoes | Funil de mídia |
| receita_atribuida | Receita atribuída à campanha |
| cpc, cpl, cpa | investimento ÷ cliques, ÷ leads, ÷ conversões |
| taxa_conversao | conversões ÷ cliques |
| roi | (receita_atribuida − investimento) ÷ investimento |
| roas | receita_atribuida ÷ investimento |

## Resumo mensal (`data/planilhas/<empresa>-resumo-mensal.csv`)
mes, receita, custo, lucro (= receita − custo), pedidos, clientes, investimento, leads, cliques, conversoes. No e-commerce, receita = bruta − descontos − devoluções e custo = custos + frete. No marketing, receita = receita atribuída e custo = investimento.
