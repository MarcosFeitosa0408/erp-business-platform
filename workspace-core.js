/* Estado normalizado compartilhado entre todas as telas; sem dados de demonstração. */
(function(root){
'use strict';
const VERSION=1,MAX_DATASETS=50,MAX_TOTAL_ROWS=200000;
const textKeys=['order','customer','product','category','brand','store','state','channel'];
function empty(){return {version:VERSION,mode:'demo',datasets:[],filters:{}};}
function validateDataset(d){
 if(!d||typeof d.id!=='string'||!d.id||!Array.isArray(d.rows)||!d.rows.length||d.rows.length>50000)throw Error('Base importada inválida ou acima de 50.000 registros.');
 const rows=d.rows.map(r=>{
  if(!r||!Number.isFinite(r.revenue)||Math.abs(r.revenue)>1e14||!(r.cost===null||Number.isFinite(r.cost))||!(r.quantity===null||Number.isFinite(r.quantity)))throw Error('Registro inválido na base importada.');
  if(r.date!==null&&(!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||root.ImportCore.parseDate(r.date)!==r.date))throw Error('Data inválida na base importada.');
  const row={date:r.date,revenue:r.revenue,cost:r.cost,quantity:r.quantity,sourceLine:Number.isInteger(r.sourceLine)?r.sourceLine:null};for(const k of textKeys)row[k]=String(r[k]??'').slice(0,1000);return row;
 });
 return {id:d.id.slice(0,1000),company:String(d.company||'Empresa importada').slice(0,100),fileName:String(d.fileName||'Arquivo importado').slice(0,255),sheet:String(d.sheet||'CSV').slice(0,100),updatedAt:String(d.updatedAt||new Date().toISOString()),rejected:Number(d.rejected)||0,duplicates:Number(d.duplicates)||0,rows};
}
function validateState(state){
 if(!state||state.version!==VERSION||!['demo','imported'].includes(state.mode)||!Array.isArray(state.datasets))throw Error('Os dados locais não puderam ser lidos. Nenhuma base fictícia foi carregada no lugar deles.');
 const datasets=state.datasets.map(validateDataset);if(new Set(datasets.map(d=>d.id)).size!==datasets.length)throw Error('Identificadores de importação repetidos.');checkLimits(datasets);
 const filters={};for(const key of ['company','dataset','store','category','brand','state','channel','product','start','end','search'])filters[key]=String(state.filters?.[key]||'').slice(0,1000);
 return {version:VERSION,mode:datasets.length?state.mode:'demo',datasets,filters};
}
function checkLimits(datasets){if(datasets.length>MAX_DATASETS||datasets.reduce((s,d)=>s+d.rows.length,0)>MAX_TOTAL_ROWS)throw Error('Limite local: 50 bases e 200.000 registros no total. Remova uma base na Central de Dados antes de continuar.');}
function upsert(state,dataset){const d=validateDataset(dataset);const datasets=state.datasets.filter(x=>x.id!==d.id).concat(d);checkLimits(datasets);return {version:VERSION,mode:'imported',datasets,filters:{}};}
function rows(state){return state.datasets.flatMap(d=>d.rows.map(r=>({...r,company:d.company,datasetId:d.id,fileName:d.fileName,sheet:d.sheet})));}
function filterRows(all,f={}){return all.filter(r=>['company','dataset','store','category','brand','state','channel','product'].every(k=>!f[k]||(k==='dataset'?r.datasetId:(r[k]||'Sem informação'))===f[k])&&(!f.start||r.date&&r.date>=f.start)&&(!f.end||r.date&&r.date<=f.end)&&(!f.search||[r.company,r.fileName,...textKeys.map(k=>r[k])].join(' ').toLocaleLowerCase('pt-BR').includes(f.search.toLocaleLowerCase('pt-BR'))));}
function summarize(all){
 // IDs são únicos por empresa e loja. Bases diferentes da mesma empresa podem conter itens do mesmo pedido.
 const adapted=all.map(r=>({...r,order:r.order?JSON.stringify([r.company||'',r.store||'',r.order]):'',store:'',customer:r.customer?JSON.stringify([r.company||'',r.customer]):''}));
 return root.ImportCore.summarize(adapted);
}
function entities(all){const map=new Map();for(const r of all){const key=JSON.stringify([r.company,r.store||'']);if(!map.has(key))map.set(key,{key,company:r.company,store:r.store||'',rows:[]});map.get(key).rows.push(r);}return [...map.values()];}
function csv(all){const keys=['company','fileName','sheet','date','revenue','cost','quantity',...textKeys,'sourceLine'];return root.ImportCore.csv([['empresa','arquivo_origem','aba','data','receita_liquida','custo_total','quantidade','pedido','cliente','produto','categoria','marca','loja','estado','canal','linha_original'],...all.map(r=>keys.map(k=>typeof r[k]==='number'?String(r[k]).replace('.',','):r[k]))]);}
const api={VERSION,MAX_DATASETS,MAX_TOTAL_ROWS,empty,validateDataset,validateState,upsert,rows,filterRows,summarize,entities,csv};root.WorkspaceCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
