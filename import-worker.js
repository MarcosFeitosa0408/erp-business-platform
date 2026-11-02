'use strict';
importScripts('vendor/xlsx.full.min.js','import-core.js');
let workbook=null,csvGrid=null,csvSkip=0;
self.onmessage=ev=>{
 const {id,type,buffer,extension,delimiter,encoding,sheet}=ev.data;
 try{
  if(type==='load'){
   workbook=null;csvGrid=null;csvSkip=0;
   if(extension==='csv'||extension==='tsv'){
    let text=new TextDecoder(encoding||'utf-8',{fatal:true}).decode(buffer);
    const result=ImportCore.parseCSV(text,delimiter||'auto');csvGrid=result.rows;csvSkip=result.skip;
    self.postMessage({id,sheets:['CSV'],sheet:'CSV',grid:csvGrid,date1904:false,delimiter:result.delimiter,skip:csvSkip});
   }else{
    workbook=XLSX.read(buffer,{type:'array',sheetRows:ImportCore.MAX_ROWS+22,cellHTML:false,cellFormula:false,cellText:false,cellDates:false,dense:true});
    emit(id,workbook.SheetNames.find(name=>workbook.Sheets[name]?.['!ref'])||workbook.SheetNames[0]);
   }
  }else if(type==='sheet')emit(id,sheet);
 }catch(e){self.postMessage({id,error:e.message||'Não foi possível ler a planilha.'});}
};
function emit(id,sheet){
 if(!workbook||!workbook.Sheets[sheet])throw Error('Aba não encontrada.');
 const ws=workbook.Sheets[sheet];if(ws['!fullref']&&XLSX.utils.decode_range(ws['!fullref']).e.r>=ImportCore.MAX_ROWS+21)throw Error('A aba ultrapassa 50.000 registros. Divida a base antes de importar.');
 if(!ws['!ref']){self.postMessage({id,sheets:workbook.SheetNames,sheet,grid:[],date1904:!!workbook.Workbook?.WBProps?.date1904,skip:0});return;}
 const range=XLSX.utils.decode_range(ws['!ref']);if(range.e.c>=ImportCore.MAX_COLUMNS||(range.e.r+1)*(range.e.c+1)>ImportCore.MAX_CELLS)throw Error('A aba excede 200 colunas ou 1 milhão de células.');
 const grid=XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:null,blankrows:true});
 self.postMessage({id,sheets:workbook.SheetNames,sheet,grid,date1904:!!workbook.Workbook?.WBProps?.date1904,skip:0});
}
