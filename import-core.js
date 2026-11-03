/* Regras de importação e análise; independentes da interface e de bibliotecas. */
(function(root){
'use strict';
const MAX_ROWS=50000,MAX_COLUMNS=200,MAX_CELLS=1000000;
const fields=[['date','Data da venda / registro'],['revenue','Receita / valor total'],['cost','Custo total'],['quantity','Quantidade'],['unitPrice','Preço unitário'],['discount','Desconto total'],['refund','Devolução / estorno total'],['shipping','Frete como custo'],['order','ID do pedido / transação'],['customer','Cliente / ID do cliente'],['product','Produto / serviço'],['category','Categoria'],['brand','Marca'],['store','Loja / unidade'],['state','Estado / UF'],['channel','Canal']];
const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const aliases={date:['data','data_venda','data da venda','data pedido','date','mes','mês'],revenue:['receita_liquida','receita','receita_bruta','receita_atribuida','vendas','vendas r$','vendas totais','valor total','valor venda','valor de venda','valor da venda','total','faturamento','revenue','sales','valor'],cost:['custo total','custos','custo','cost'],quantity:['quantidade','qtd','unidades','unidades vendidas','quantity'],unitPrice:['preco unitario','valor unitario','preco','unit price'],discount:['descontos','desconto'],refund:['devolucoes','devolucao','estorno'],shipping:['frete','custo frete'],order:['id_pedido','pedido','numero pedido','id venda','order id'],customer:['cliente','id cliente','customer'],product:['produto','nome produto','nome do produto','servico','product'],category:['categoria','categoria do produto','category'],brand:['marca','marca do produto','brand'],store:['loja','unidade','empresa','nome da loja','store'],state:['estado','uf','uf da compra','state'],channel:['canal_venda','canal','channel']};
function suggest(headers){const result={};const used=new Set();for(const [key] of fields){const index=headers.findIndex((h,i)=>!used.has(i)&&aliases[key].some(a=>normalize(a)===normalize(h)));if(index>=0){result[key]=index;used.add(index);}}return result;}
function parseNumber(value,locale='pt-BR'){
 if(typeof value==='number')return Number.isFinite(value)&&Math.abs(value)<=1e14?value:null;
 let s=String(value??'').trim();if(!s)return null;
 const negative=/^\(.*\)$/.test(s);if(negative)s=s.slice(1,-1);
 s=s.replace(/^(?:R\$|US\$|BRL|USD|\$)\s*/i,'').replace(/[\s\u00a0]/g,'');
 const decimal=locale==='en-US'?'.':',',thousands=decimal===','?'.':',';
 if(s.includes(decimal)){
  const parts=s.split(decimal);if(parts.length!==2||!/^\d+$/.test(parts[1]))return null;
  const integer=parts[0],esc=thousands==='.'?'\\.':',';
  if(!new RegExp('^[+-]?(?:\\d+|\\d{1,3}(?:'+esc+'\\d{3})+)$').test(integer))return null;
  s=integer.split(thousands).join('')+'.'+parts[1];
 }else if(s.includes(thousands)){
  const esc=thousands==='.'?'\\.':',';if(!new RegExp('^[+-]?\\d{1,3}(?:'+esc+'\\d{3})+$').test(s))return null;s=s.split(thousands).join('');
 }else if(!/^[+-]?\d+$/.test(s))return null;
 const n=Number(s)*(negative?-1:1);return Number.isFinite(n)&&Math.abs(n)<=1e14?n:null;
}
function parseDate(v,order='DMY',date1904=false){
 let year,month,day;
 if(typeof v==='number'){
  if(!Number.isFinite(v)||v<1||v>73415)return null;
  if(!date1904&&Math.floor(v)===60)return null;
  const serial=Math.floor(v)+(date1904?1462:0);const offset=serial<60?1:0;
  const d=new Date(Date.UTC(1899,11,30)+86400000*(serial+offset));year=d.getUTCFullYear();month=d.getUTCMonth()+1;day=d.getUTCDate();
 }else{
  const s=String(v??'').trim();let m=s.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?(?:[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?Z?)?$/);
  if(m){year=+m[1];month=+m[2];day=+(m[3]||1);}else {m=s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})(?:\s+\d{2}:\d{2}(?::\d{2})?)?$/);if(!m)return null;year=+m[3];month=+(order==='MDY'?m[1]:m[2]);day=+(order==='MDY'?m[2]:m[1]);}
 }
 if(year<1900||year>2100||month<1||month>12||day<1||day>31)return null;
 const d=new Date(Date.UTC(year,month-1,day));if(d.getUTCFullYear()!==year||d.getUTCMonth()+1!==month||d.getUTCDate()!==day)return null;
 return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}
function parseCSV(text,delimiter='auto'){
 text=text.replace(/^\ufeff/,'');let skip=0;const sep=text.match(/^sep=([;,\t|])\r?\n/i);if(sep){delimiter=sep[1];text=text.slice(sep[0].length);skip=1;}
 if(delimiter==='auto'){
  let line='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){i++;continue;}quoted=!quoted;}if((c==='\n'||c==='\r')&&!quoted)break;line+=quoted?'':c;}
  delimiter=[';',',','\t','|'].sort((a,b)=>line.split(b).length-line.split(a).length)[0];
 }
 const rows=[];let row=[],cell='',quoted=false,afterQuote=false;
 function pushCell(){row.push(cell);cell='';afterQuote=false;}
 function pushRow(){pushCell();rows.push(row);row=[];if(rows.length>MAX_ROWS+21)throw Error('Limite de 50.000 registros por arquivo. Divida a base antes de importar.');}
 for(let i=0;i<text.length;i++){
  const c=text[i];if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;afterQuote=true;}}else cell+=c;continue;}
  if(c==='"'){if(cell.trim()!=='')throw Error('CSV com aspas fora do início de uma célula.');cell='';quoted=true;}
  else if(c===delimiter){pushCell();if(row.length>MAX_COLUMNS)throw Error('Máximo de 200 colunas.');}
  else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;pushRow();}
  else if(afterQuote){if(!/\s/.test(c))throw Error('CSV contém texto após o fechamento de aspas.');}
  else cell+=c;
 }
 if(quoted)throw Error('CSV com aspas não fechadas.');if(cell.length||row.length)pushRow();
 if(rows.reduce((s,r)=>s+r.length,0)>MAX_CELLS)throw Error('Máximo de 1 milhão de células por arquivo.');return {rows,delimiter,skip};
}
function prepare(grid,headerIndex=0){
 if(!grid[headerIndex])throw Error('Linha de cabeçalho não encontrada.');
 const width=grid.slice(headerIndex).reduce((max,r)=>Math.max(max,r.length),0);if(width>MAX_COLUMNS)throw Error('Máximo de 200 colunas.');
 const headers=Array.from({length:width},(_,i)=>String(grid[headerIndex][i]??'').trim()||'Coluna '+(i+1));
 const seen=new Map();headers.forEach((h,i)=>{const n=(seen.get(h)||0)+1;seen.set(h,n);if(n>1)headers[i]=h+' ('+n+')';});
 const data=[],rowNumbers=[];grid.slice(headerIndex+1).forEach((r,i)=>{if(r.some(c=>c!==null&&c!==undefined&&String(c).trim()!=='')){data.push(r);rowNumbers.push(headerIndex+i+2);}});
 if(!data.length)throw Error('A planilha não contém registros abaixo do cabeçalho.');if(data.length>MAX_ROWS)throw Error('Máximo de 50.000 registros.');return {headers,data,rowNumbers};
}
function convert(data,map,options={}){
 const has=k=>Number.isInteger(map[k])&&map[k]>=0;
 if(!has('revenue')&&!(has('quantity')&&has('unitPrice')))throw Error('Selecione a receita total ou selecione quantidade e preço unitário.');
 const indexes=Object.values(map).filter(v=>Number.isInteger(v)&&v>=0);if(new Set(indexes).size!==indexes.length)throw Error('Uma coluna não pode ocupar dois campos. Confira o mapeamento.');
 const valid=[],errors=[],seen=new Set();let duplicates=0,removed=0,missingCosts=0;
 for(let i=0;i<data.length;i++){
  const raw=data[i];const reasons=[];const get=k=>has(k)?raw[map[k]]:null;
  const numeric={};for(const k of ['revenue','cost','quantity','unitPrice','discount','refund','shipping']){
   const value=get(k),blank=value===null||value===undefined||String(value).trim()==='';numeric[k]=has(k)?parseNumber(value,options.locale):null;
   if(has(k)&&!blank&&numeric[k]===null)reasons.push(k+': número inválido');
  }
  let date=has('date')?parseDate(get('date'),options.dateOrder,options.date1904):null;
  if(has('date')&&!date)reasons.push('Data vazia ou inválida (use dia/mês/ano ou AAAA-MM-DD).');
  let revenue=numeric.revenue;
  if(has('revenue')&&revenue===null)reasons.push('Receita vazia ou inválida.');
  if(!has('revenue')){if(numeric.quantity===null||numeric.unitPrice===null)reasons.push('Quantidade ou preço unitário vazio.');else revenue=numeric.quantity*numeric.unitPrice;}
  if(options.revenueMode==='gross')revenue=revenue===null?null:revenue-(numeric.discount||0)-(numeric.refund||0);
  if(!Number.isFinite(revenue)||Math.abs(revenue)>1e14)reasons.push('Receita fora do limite.');
  if(reasons.length){errors.push({line:options.sourceLines?.[i]??i+(options.headerIndex||0)+2,reasons:reasons.join(' ')});continue;}
  const fingerprint=JSON.stringify(raw);if(seen.has(fingerprint)){duplicates++;if(options.removeDuplicates){removed++;continue;}}else seen.add(fingerprint);
  const r={date,revenue,cost:numeric.cost===null?null:numeric.cost+(numeric.shipping||0),quantity:numeric.quantity,sourceLine:options.sourceLines?.[i]??i+(options.headerIndex||0)+2};
  for(const k of ['order','customer','product','category','brand','store','state','channel'])r[k]=String(get(k)??'').trim();
  if(r.cost===null)missingCosts++;valid.push(r);
 }
 return {valid,errors,duplicates,removed,missingCosts,total:data.length};
}
function summarize(rows){
 const sum=k=>rows.reduce((s,r)=>s+(r[k]??0),0);const revenue=sum('revenue'),knownCosts=rows.filter(r=>r.cost!==null).length,allCosts=rows.length>0&&knownCosts===rows.length;
 const orderSet=new Set(rows.filter(r=>r.order).map(r=>r.store+'\u0000'+r.order));const completeOrders=rows.length>0&&rows.every(r=>r.order);const orders=completeOrders?orderSet.size:null;
 const customers=new Set(rows.filter(r=>r.customer).map(r=>r.customer));const completeCustomers=rows.length>0&&rows.every(r=>r.customer);
 const cost=allCosts?sum('cost'):null,profit=cost===null?null:revenue-cost;
 return {count:rows.length,revenue,cost,knownCost:sum('cost'),knownCosts,profit,margin:profit===null||revenue===0?null:profit/revenue,orders,customers:completeCustomers?customers.size:null,quantity:rows.some(r=>r.quantity!==null)?sum('quantity'):null,ticket:orders?revenue/orders:null,average:rows.length?revenue/rows.length:null};
}
function group(rows,key,metric='revenue'){const map=new Map();for(const r of rows){const label=r[key]||'Sem informação';map.set(label,(map.get(label)||0)+(r[metric]??0));}return [...map].map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value);}
function csv(rows){return '\ufeff'+rows.map(row=>row.map(v=>{let s=String(v??'');if(/^[=+@\-\t\r]/.test(s)&&!/^[-+]?\d+(?:[.,]\d+)?$/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}).join(';')).join('\r\n');}
const api={fields,suggest,parseNumber,parseDate,parseCSV,prepare,convert,summarize,group,csv,MAX_ROWS,MAX_COLUMNS,MAX_CELLS};root.ImportCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
