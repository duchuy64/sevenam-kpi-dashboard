(()=>{
'use strict';
const $=s=>document.querySelector(s), canvas=$('#dashCanvas'), ctx=canvas.getContext('2d');
const BASE_W=2560, BASE_H=1707, OUT_W=2560, OUT_H=1707;
const C={navy:'#071b63',blue:'#0d56c7',green:'#0e8b42',purple:'#6c2baa',orange:'#f08a00',red:'#d20d19',text:'#172033',muted:'#7b8797',line:'#c4ccd8',softBlue:'#f5f8ff',softGreen:'#f4fbf5',softPurple:'#f8f3fc',softGray:'#f4f6f8'};
const state={rows:[],rawRows:[],periods:[],periodRows:{},selectedPeriods:[],comparePrev:[],compareNext:[],tab:'week',issues:[],font:1.04,runDays:0,detectedLabel:'—',weekDates:{from:'2026-08-10',to:'2026-08-16',sum:'2026-08-10'},monthDates:{from:'2026-08-01',to:'2026-08-31',sum:'2026-08-10'}};

const SAMPLE=`STT\tChỉ tiêu\tBộ phận\tĐơn vị\tThực tế\tTarget\t% Đạt\tĐiểm nghẽn + Insight\tAction
1\tDoanh thu Marketing (Tạo đơn)\tMKT\tTr\t3002.87\t3218.5\t93.3\t\t
2\tDoanh thu Marketing (Thành công)\tMKT\tTr\t1838.08\t2300\t63.4\t\t
3\tDoanh thu Ads\tMKT\tTr\t88.04\t337.45\t26.09\tĐóng góp 42%; ROAS thấp 1.4\tTối ưu nhóm sản phẩm và nội dung có ROAS tốt
4\tDoanh thu Livestream\tMKT\tTr\t58.06\t162.5\t35.73\tĐóng góp 27.7%; tiến độ trung bình\tTăng traffic, tỷ lệ chốt và tốc độ xử lý đơn
5\tDoanh thu Shopee\tMKT\tTr\t56.12\t119.05\t47.14\tROAS 13.6; kênh hiệu quả nhất\tƯu tiên sản phẩm sẵn hàng và tồn kho tốt
6\tDoanh thu Website\tMKT\tTr\t7.24\t17.5\t41.36\tDoanh thu thấp; cần tăng chuyển đổi\tĐẩy remarketing và traffic chất lượng
7\tLead\tMKT\tLead\t3057\t\t\t\t
8\tChi phí Ads\tMKT\tTr\t62.89\t\t\tƯớc tính từ doanh thu 88.04 / ROAS 1.4\t
9\tChi phí Livestream\tMKT\tTr\t\t\t\t\t
10\tChi phí Shopee\tMKT\tTr\t4.13\t\t\tƯớc tính từ doanh thu 56.12 / ROAS 13.6\t
11\tChi phí Website\tMKT\tTr\t\t\t\t\t
12\tChi phí Marketing tổng\tMKT\tTr\t87.28\t\t\tƯớc tính từ doanh thu 209.46 / ROAS 2.4\t
13\tROAS\tMKT\tLần\t2.4\t\t\t\t
14\tCP/TC\tMKT\t%\t41.19\t\t\t\t
15\tChiết khấu Ads\tMKT\t%\t39.48\t\t\tGiảm 0.75 điểm % so với T5; giảm 3.82 điểm % so với T4\t
16\tChiết khấu Livestream\tMKT\t%\t49.02\t\t\tGiảm 0.38 điểm % so với T5; giảm 0.95 điểm % so với T4\t
17\tTổng chiết khấu\tMKT\t%\t43.47\t\t\tGiảm 0.77 điểm % so với T5; giảm 2.16 điểm % so với T4\tKiểm soát chiết khấu để bảo đảm biên lợi nhuận
1\tTạo đơn Sale Online\tSale\tTr\t526\t700\t64.9\tChưa đạt KPI tuần\tTăng tốc xử lý và xác nhận đơn
2\tSố đơn tạo\tSale\tĐơn\t\t\t\t\t
3\tThành công Sale Online\tSale\tTr\t223.7\t473.8\t47.2\tTỷ lệ chuyển đổi sau tạo đơn thấp\tTăng xử lý đơn trong ngày
4\tSố đơn thành công\tSale\tĐơn\t\t\t\t\t
5\tGiá trị Chờ xin hàng\tSale\tTr\t37.5\t\t\tĐơn đang chậm xử lý\tPhối hợp kho để xin hàng nhanh
6\tSố đơn chờ xin hàng\tSale\tĐơn\t\t\t\t\t
7\tGiá trị đơn Mới + Xác nhận + Chờ chuyển\tSale\tTr\t2.4\t\t\tCần xác minh lại cách ghi số liệu\tĐẩy nhanh xác nhận và bàn giao
8\tSố đơn Mới + Xác nhận + Chờ chuyển\tSale\tĐơn\t\t\t\t\t
9\tGiá trị Chờ vận chuyển\tSale\tTr\t150.3\t\t\tĐiểm nghẽn lớn nhất trong phễu\tƯu tiên bàn giao đơn cho đơn vị vận chuyển
10\tSố đơn Chờ vận chuyển\tSale\tĐơn\t\t\t\t\t
11\tGiá trị đơn treo\tSale\tTr\t215.7\t\t\tGiá trị đơn treo cao\tRà soát đơn giá trị cao và tồn trên 24 giờ
12\tĐơn treo\tSale\tĐơn\t189\t\t\tBáo cáo có thêm số liệu 119 đơn; cần đối soát\tPhân loại đơn treo theo từng trạng thái
13\tDoanh số Hoàn\tSale\tTr\t74.8\t\t\tChiếm 14.2% doanh thu tạo đơn\tGọi xác nhận và chăm sóc khách trước giao
14\tSố đơn hoàn\tSale\tĐơn\t\t\t\t\t
15\tTổng data Sale\tSale\tData\t\t\t\t\t
16\tCR tạo đơn\tSale\t%\t7.5\t\t\t\t
17\tCR thành công\tSale\t%\t42.5\t\t\tChuyển đổi thành công còn thấp\tTăng tốc xử lý sau chốt
18\tCR hoàn\tSale\t%\t14.2\t\t\tTỷ lệ hoàn ảnh hưởng doanh thu\tKiểm soát tư vấn và kỳ vọng sản phẩm
19\tAOV\tSale\tTr/đơn\t1.12\t\t\t\t
20\tChưa phân loại / trạng thái khác\tSale\tTr\t37.5\t\t\tƯớc tính phần chênh lệch phễu; cần đối soát\tChuẩn hóa trạng thái đơn hàng
1\tKH cần CS\tCSKH\tKH\t2561\t\t\t\t
2\tLượt CS\tCSKH\tLượt\t2873\t\t\t\t
3\tKết nối thành công\tCSKH\tKH\t1376\t\t54\tTỷ lệ kết nối 54%\tTăng tần suất chăm sóc nhóm có hẹn
4\tKH có nhu cầu\tCSKH\tKH\t605\t\t44\tTỷ lệ có nhu cầu còn thấp\tTập trung chốt nhóm đã có nhu cầu
5\tKhách quay lại\tCSKH\tKH\t70\t62\t113\tTỷ lệ quay lại trên tổng kết nối còn thấp\tƯu tiên nhóm VIP và khách mua định kỳ
6\tDoanh thu khách quay lại\tCSKH\tTr\t147.182\t125\t118\tAOV quay lại còn thấp\tTăng upsell khi chăm sóc khách
7\tDoanh thu quay lại lũy kế\tCSKH\tTr\t581.813\t500\t116.4\tĐã vượt target tháng\tDuy trì chăm sóc nhóm khách tiềm năng
8\tDoanh thu CSKH kỳ trước 1\tCSKH\tTr\t\t\t\tCùng kỳ tháng 6 bằng 111% hiện tại; nguồn không có giá trị tuyệt đối\t
9\tDoanh thu CSKH kỳ trước 2\tCSKH\tTr\t\t\t\tCùng kỳ tháng 5 bằng 108% hiện tại; nguồn không có giá trị tuyệt đối\t`;

function norm(s=''){return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9%+/ ]+/g,' ').replace(/\s+/g,' ').trim()}
function num(v){
 if(v==null||v==='')return null;
 let s=String(v).trim().replace(/%/g,'').replace(/\s/g,'');
 if(!s||s==='-'||s==='—')return null;
 if(s.includes(',')&&s.includes('.')){
   if(s.lastIndexOf(',')>s.lastIndexOf('.')) s=s.replace(/\./g,'').replace(',','.');
   else s=s.replace(/,/g,'');
 }else if(s.includes(',')){
   s=s.replace(',','.');
 }else if(/^\d{1,3}(?:\.\d{3})+$/.test(s)){
   s=s.replace(/\./g,'');
 }
 let n=Number(s);
 return Number.isFinite(n)?n:null
}
function daysInclusive(a,b){if(!a||!b)return 0;let x=new Date(a+'T00:00:00'),y=new Date(b+'T00:00:00');return Math.max(0,Math.floor((y-x)/86400000)+1)}
function isoDate(y,m,d){return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
function parseWeekLabel(label,fallbackYear){let m=String(label||'').match(/tuần\s*(\d+).*?\(?\s*(\d{1,2})\s*[-–]\s*(\d{1,2})\s*\/\s*(\d{1,2})(?:\s*\/\s*(\d{2,4}))?/i);if(!m)return null;let y=m[5]?Number(m[5]):fallbackYear;if(y<100)y+=2000;let mo=Number(m[4]);return{key:'week'+m[1],type:'week',index:Number(m[1]),label:`Tuần ${m[1]} (${m[2]}-${m[3]}/${String(mo).padStart(2,'0')})`,from:isoDate(y,mo,Number(m[2])),to:isoDate(y,mo,Number(m[3]))}}
function overlapDays(a1,a2,b1,b2){let s=a1>b1?a1:b1,e=a2<b2?a2:b2;return s<=e?daysInclusive(s,e):0}
function isAdditiveUnit(unit,name=''){let u=norm(unit),n=norm(name);if(u.includes('%')||u.includes('lan')||u.includes('tr don'))return false;if(n==='roas'||n==='cp/tc'||n.startsWith('cr ')||n.includes('chiet khau')||n==='aov')return false;return true}
function parseWide(txt){
 let raw=txt.replace(/\r/g,'').split('\n');
 let rows=raw.map(x=>x.split('\t'));
 let headerIdx=rows.findIndex(a=>norm(a[0]).includes('stt')&&norm(a[1]).includes('chi tieu'));
 if(headerIdx<0)return null;
 let maxCols=Math.max(...rows.map(a=>a.length));
 if(maxCols<12)return null;

 let group=rows[headerIdx-1]||[];
 let fallback=Number((reportDates()?.to||'2026-01-01').slice(0,4))||2026;
 let periods=[{key:'month',type:'month',index:0,label:'TỔNG THÁNG',start:4,actualCol:4,targetCol:5,pctCol:6,insightCol:null,actionCol:null}];
 let canonicalStarts=[7,12,17,22,27,32];
 let labels=group.map((x,i)=>({i,label:String(x||'').trim()})).filter(x=>/tuần\s*\d+/i.test(x.label));

 labels.forEach((x,i)=>{
   let pw=parseWeekLabel(x.label,fallback)||{key:'week'+(i+1),type:'week',index:i+1,label:x.label,from:null,to:null};
   let c=canonicalStarts[i]??x.i;
   Object.assign(pw,{start:c,actualCol:c,targetCol:c+1,pctCol:c+2,insightCol:c+3,actionCol:c+4});
   periods.push(pw)
 });

 if(labels.length===0){
   canonicalStarts.forEach((c,i)=>{
     if(c<maxCols){
       let lab=(group[c]||`Tuần ${i+1}`).trim();
       let pw=parseWeekLabel(lab,fallback)||{key:'week'+(i+1),type:'week',index:i+1,label:lab||`Tuần ${i+1}`,from:null,to:null};
       Object.assign(pw,{start:c,actualCol:c,targetCol:c+1,pctCol:c+2,insightCol:c+3,actionCol:c+4});
       periods.push(pw)
     }
   })
 }

 let dataRows=rows.slice(headerIdx+1).filter(a=>(a[1]||'').trim()).map(a=>({stt:a[0]||'',name:(a[1]||'').trim(),dept:(a[2]||'').trim(),unit:(a[3]||'').trim(),cells:a}));
 let periodRows={};
 periods.forEach(p=>{
   periodRows[p.key]=dataRows.map(r=>({
     stt:r.stt,name:r.name,dept:r.dept,unit:r.unit,
     actual:num(r.cells[p.actualCol]),target:num(r.cells[p.targetCol]),pct:num(r.cells[p.pctCol]),
     insight:p.insightCol==null?'':(r.cells[p.insightCol]||'').trim(),
     action:p.actionCol==null?'':(r.cells[p.actionCol]||'').trim(),
     periodKey:p.key
   })).filter(r=>r.name)
 });

 let weeks=periods.filter(p=>p.type==='week'&&p.from&&p.to);
 if(weeks.length){
   let dt=new Date(weeks[0].from+'T00:00:00'),mo=dt.getMonth()+1,y=dt.getFullYear(),lastDay=new Date(y,mo,0).getDate();
   periods[0].from=isoDate(y,mo,1);periods[0].to=isoDate(y,mo,lastDay);
   periods[0].label=`TỔNG THÁNG ${String(mo).padStart(2,'0')}/${y}`
 }
 return{periods,periodRows,dataRows}
}
function parseLegacy(txt){let lines=txt.replace(/\r/g,'').split('\n').filter(x=>x.trim());if(lines.length<2)return[];let start=norm(lines[0]).includes('chi tieu')?1:0;return lines.slice(start).map(line=>{let a=line.split('\t');return{stt:a[0]||'',name:(a[1]||'').trim(),dept:(a[2]||'').trim(),unit:(a[3]||'').trim(),actual:num(a[4]),target:num(a[5]),pct:num(a[6]),insight:(a[7]||'').trim(),action:(a[8]||'').trim()}}).filter(r=>r.name)}
function rowMap(rows){let m=new Map();rows.forEach(r=>m.set(norm(r.name),r));return m}
function buildSelectedRows(){
 if(!state.periods.length)return;
 let d=reportDates(),sumEnd=d.sum&&d.sum<d.to?d.sum:d.to;

 if(state.tab==='month'){
   let month=state.periods.find(p=>p.type==='month');
   let rows=month?(state.periodRows[month.key]||[]):[];
   state.selectedPeriods=month?[month]:[];
   state.rows=rows.map(r=>({...r}));
   state.comparePrev=[];state.compareNext=[];
   state.runDays=daysInclusive(d.from,sumEnd);
   state.detectedLabel=month?.label||'TỔNG THÁNG';
   updatePeriodUI();
   return
 }

 let periods=state.periods.filter(p=>p.type==='week'&&p.from&&p.to);
 let selected=periods.filter(p=>overlapDays(d.from,sumEnd,p.from,p.to)>0);
 if(!selected.length)selected=periods.sort((a,b)=>Math.abs(new Date(a.from)-new Date(d.from))-Math.abs(new Date(b.from)-new Date(d.from))).slice(0,1);
 state.selectedPeriods=selected;

 let maps=selected.map(p=>({p,map:rowMap(state.periodRows[p.key]||[])}));
 let names=[...new Set(maps.flatMap(x=>[...x.map.keys()]))];
 state.rows=names.map(n=>{
   let source=maps.map(x=>x.map.get(n)).filter(Boolean),first=source[0];
   if(!first)return null;
   let actual=null,target=null,insight='',action='';
   if(source.length===1){
     actual=first.actual;target=first.target;insight=first.insight;action=first.action;
   }else{
     let additive=isAdditiveUnit(first.unit,first.name);
     if(additive){
       actual=source.reduce((s,r)=>s+(r.actual||0),0);
       target=source.some(r=>r.target!=null)?source.reduce((s,r)=>s+(r.target||0),0):null;
     }else{
       let vals=source.filter(r=>r.actual!=null).map(r=>r.actual),tars=source.filter(r=>r.target!=null).map(r=>r.target);
       actual=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
       target=tars.length?tars.reduce((a,b)=>a+b,0)/tars.length:null;
     }
     insight=source.map(r=>r.insight).filter(Boolean).join(' | ');
     action=source.map(r=>r.action).filter(Boolean).join(' | ')
   }
   return{...first,actual,target,pct:source.length===1?first.pct:(actual!=null&&target?actual/target*100:first.pct),insight,action}
 }).filter(Boolean);

 let selectedIdx=periods.indexOf(selected[0]),prev=selectedIdx>0?periods[selectedIdx-1]:null,next=selectedIdx>=0&&selectedIdx<periods.length-1?periods[selectedIdx+1]:null;
 state.comparePrev=prev?(state.periodRows[prev.key]||[]):[];
 state.compareNext=next?(state.periodRows[next.key]||[]):[];
 state.runDays=selected.reduce((s,p)=>s+overlapDays(d.from,sumEnd,p.from,p.to),0);
 state.detectedLabel=selected.map(p=>p.label).join(' + ')||'—';
 updatePeriodUI()
}
function parse(txt){let wide=parseWide(txt);if(wide){state.periods=wide.periods;state.periodRows=wide.periodRows;state.rawRows=wide.dataRows;buildSelectedRows();return state.rows}state.periods=[];state.periodRows={};state.comparePrev=[];state.compareNext=[];state.runDays=daysInclusive(reportDates().from,reportDates().sum&&reportDates().sum<reportDates().to?reportDates().sum:reportDates().to);state.detectedLabel='Dữ liệu 9 cột';updatePeriodUI();return parseLegacy(txt)}
function compareRow(rows,name){let n=norm(name);return rows.find(r=>norm(r.name)===n)||rows.find(r=>norm(r.name).includes(n)||n.includes(norm(r.name)))}
function compareMetric(name){let cur=find(name)?.actual??null,prev=compareRow(state.comparePrev,name)?.actual??null,next=compareRow(state.compareNext,name)?.actual??null;let delta=cur!=null&&prev!=null&&prev!==0?(cur-prev)/Math.abs(prev)*100:null;return{cur,prev,next,delta}}
function updatePeriodUI(){if($('#runDays'))$('#runDays').value=state.runDays?`${state.runDays} ngày`:'—';if($('#periodDetected'))$('#periodDetected').value=state.detectedLabel||'—'}
function find(name){
 let n=norm(name);
 const groups=[
  ['doanh so marketing tao don','doanh thu marketing tao don'],
  ['doanh so tao don','tao don sale online'],
  ['doanh thu thanh cong','thanh cong sale online'],
  ['kh can cham soc','kh can cs'],
  ['luot cham soc','luot cs'],
  ['ti le chot','ty le chot','cr tao don'],
  ['ti le hoan','ty le hoan','cr hoan'],
  ['tong so don treo 5+6+7+8','tong so don treo','don treo']
 ];
 let candidates=[n];
 for(const g of groups){if(g.includes(n)){candidates=[...new Set([...candidates,...g])];break}}
 for(const c of candidates){let r=state.rows.find(x=>norm(x.name)===c);if(r)return r}
 for(const c of candidates){let r=state.rows.find(x=>norm(x.name).includes(c)||c.includes(norm(x.name)));if(r)return r}
}
const val=n=>find(n)?.actual??null, tar=n=>find(n)?.target??null;
function firstVal(...names){for(const n of names){let r=find(n);if(r?.actual!=null)return r.actual}return null}
function firstTar(...names){for(const n of names){let r=find(n);if(r?.target!=null)return r.target}return null}
function fmtNum(v,d=2){if(v==null||!Number.isFinite(v))return'—';return v.toLocaleString('vi-VN',{minimumFractionDigits:d,maximumFractionDigits:d})}
function money(v,force2=true){if(v==null||!Number.isFinite(v))return'—';return `${v.toLocaleString('vi-VN',{minimumFractionDigits:force2?2:0,maximumFractionDigits:2})} tr`}
function signedMoney(v){if(v==null||!Number.isFinite(v))return'—';return `${v>=0?'+':''}${v.toLocaleString('vi-VN',{minimumFractionDigits:2,maximumFractionDigits:2})} tr`}
function fmt(v,unit=''){if(v==null||!Number.isFinite(v))return'—';let u=norm(unit);if(u.includes('%'))return `${fmtNum(v,2)}%`;if(u.includes('lan'))return `${fmtNum(v,2)} lần`;if(u.includes('tr don'))return `≈ ${fmtNum(v,2)} tr/đơn`;if(['don','kh','lead','data','luot'].includes(u))return Math.round(v).toLocaleString('vi-VN');return money(v,true)}
function dateVN(s){if(!s)return'—';let d=new Date(s+'T00:00:00');return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`}
function reportDates(){return state.tab==='week'?state.weekDates:state.monthDates}
function periodText(){let d=reportDates();return `${dateVN(d.from)} – ${dateVN(d.to)}`}
function monthLabel(){let d=reportDates(),x=new Date(d.to+'T00:00:00');return `${String(x.getMonth()+1).padStart(2,'0')}/${x.getFullYear()}`}
function periodWord(){return state.tab==='month'?'tháng':'kỳ báo cáo'}

function scopeDetect(){let channels=[['Ads','Doanh thu Ads'],['Livestream','Doanh thu Livestream'],['Shopee','Doanh thu Shopee'],['Website','Doanh thu Website']].map(([name,key])=>({name,key,v:val(key),t:tar(key)}));let sum=channels.reduce((s,c)=>s+(c.v||0),0),target=channels.reduce((s,c)=>s+(c.t||0),0);return{channels,channelSum:sum,channelTarget:target,mktMixed:false}}
function derived(){
 let scope=scopeDetect();

 // ===== MKT GỐC =====
 let mCreateRaw=firstVal('Doanh số Marketing (Tạo đơn)','Doanh thu Marketing (Tạo đơn)'),
     mCreateTar=firstTar('Doanh số Marketing (Tạo đơn)','Doanh thu Marketing (Tạo đơn)'),
     mSuccRaw=firstVal('Doanh thu Marketing (Thành công)'),
     mSuccTar=firstTar('Doanh thu Marketing (Thành công)'),
     shopee=firstVal('Doanh thu Shopee');

 // ===== SALE GỐC NHẬP =====
 let saleCreateInput=firstVal('Doanh số tạo đơn','Tạo đơn Sale Online'),
     saleCreateTar=firstTar('Doanh số tạo đơn','Tạo đơn Sale Online'),
     saleSuccInput=firstVal('Doanh thu thành công','Thành công Sale Online'),
     saleSuccTar=firstTar('Doanh thu thành công','Thành công Sale Online');

 // Quy ước đối soát MKT ↔ Sale: lấy giá trị lớn hơn làm "tham chiếu tích cực".
 let saleCreateDerived=(mCreateRaw!=null&&shopee!=null)?mCreateRaw-shopee:null,
     saleSuccDerived=(mSuccRaw!=null&&shopee!=null)?mSuccRaw-shopee:null;

 let saleCreatePositive=(saleCreateInput!=null&&saleCreateDerived!=null)
      ?Math.max(saleCreateInput,saleCreateDerived)
      :(saleCreateInput??saleCreateDerived),
     saleSuccPositive=(saleSuccInput!=null&&saleSuccDerived!=null)
      ?Math.max(saleSuccInput,saleSuccDerived)
      :(saleSuccInput??saleSuccDerived);

 // ===== SALE CHI TIẾT – NGUỒN GỐC NỘI BỘ =====
 let createdOrders=firstVal('Số đơn tạo'),
     successOrdersInput=firstVal('Số đơn thành công'),
     dataSale=firstVal('Tổng data Sale');

 // Doanh số Đơn treo bắt buộc tính lại từ 4 trạng thái con.
 let saleNew=firstVal('DS Mới')||0,
     saleWaitStock=firstVal('DS Chờ hàng')||0,
     saleConfirmed=firstVal('DS Đã xác nhận')||0,
     saleWaitTransfer=firstVal('DS Chờ chuyển hàng')||0,
     pending=saleNew+saleWaitStock+saleConfirmed+saleWaitTransfer;

 // Nếu có số đơn từng trạng thái con thì cộng lại; nếu không có thì lấy số tổng đầu tiên đã nhập.
 let cntNew=firstVal('Số đơn Mới','Đơn Mới'),
     cntWaitStock=firstVal('Số đơn Chờ hàng','Đơn Chờ hàng'),
     cntConfirmed=firstVal('Số đơn Đã xác nhận','Đơn Đã xác nhận'),
     cntWaitTransfer=firstVal('Số đơn Chờ chuyển hàng','Đơn Chờ chuyển hàng');
 let childPendingCounts=[cntNew,cntWaitStock,cntConfirmed,cntWaitTransfer].filter(v=>v!=null);
 let pendingOrdersInput=firstVal('Tổng số đơn Treo (5+6+7+8)','Tổng số đơn Treo','Đơn treo');
 let pendingOrders=childPendingCounts.length
      ?childPendingCounts.reduce((a,b)=>a+b,0)
      :pendingOrdersInput;

 // Đang giao: ưu tiên dòng chuẩn đầu tiên; fallback tên cũ.
 let delivering=firstVal('DS Đang giao','Giá trị Chờ vận chuyển')||0,
     deliveringOrders=firstVal('Số đơn Đang giao','Số đơn Chờ vận chuyển');

 // Thành công: ưu tiên số Sale gốc đầu tiên; fallback số đối soát tích cực.
 let saleSuccInternal=saleSuccInput??saleSuccPositive??0,
     successOrders=successOrdersInput;

 // Hoàn: ưu tiên dòng chuẩn đầu tiên; fallback các tên cũ nếu có.
 let refund=firstVal('Doanh số Hoàn','Doanh thu Hoàn','Giá trị Hoàn')||0,
     refundOrders=firstVal('Số đơn hoàn','Đơn hoàn');

 // ===== KHÓA LOGIC PHỄU NỘI BỘ =====
 // Tạo đơn hiển thị trên dashboard = tổng 4 trạng thái nội bộ.
 // Như vậy mọi số trong ảnh luôn khớp tuyệt đối.
 let saleStatusSum=(pending||0)+(delivering||0)+(saleSuccInternal||0)+(refund||0);
 let saleCreate=(saleStatusSum>0)?saleStatusSum:(saleCreatePositive??saleCreateInput??0);
 let saleSucc=saleSuccInternal;

 // Số đơn: nếu đủ 4 trạng thái thì lấy tổng trạng thái; nếu chưa đủ thì giữ số tạo nhập.
 let orderParts=[pendingOrders,deliveringOrders,successOrders,refundOrders];
 let haveAllOrderParts=orderParts.every(v=>v!=null);
 let orderStatusSum=haveAllOrderParts?orderParts.reduce((a,b)=>a+b,0):null;
 let createdOrdersDisplay=orderStatusSum!=null?orderStatusSum:createdOrders;

 // ===== CHỈ SỐ PHỤ: TÍNH TỪ SỐ GỐC TỪNG PHẦN =====
 let crCreate=createdOrders&&dataSale?createdOrders/dataSale*100:firstVal('Tỉ lệ chốt','Tỷ lệ chốt','CR tạo đơn'),
     crSuccess=saleCreateInput&&saleSuccInput?saleSuccInput/saleCreateInput*100:firstVal('CR thành công'),
     crRefund=createdOrders&&refundOrders?refundOrders/createdOrders*100:firstVal('Tỉ lệ hoàn','Tỷ lệ hoàn','CR hoàn'),
     aov=saleCreateInput&&createdOrders?saleCreateInput/createdOrders:firstVal('AOV');

 // Chênh lệch chỉ để cảnh báo, không dùng làm số hiển thị.
 let saleDiffVsInput=saleCreateInput!=null?saleCreate-saleCreateInput:null,
     saleDiffVsPositive=saleCreatePositive!=null?saleCreate-saleCreatePositive:null,
     orderDiffVsInput=(createdOrders!=null&&orderStatusSum!=null)?createdOrdersDisplay-createdOrders:null;

 // ===== CSKH =====
 let cKey='Doanh thu khách quay lại',
     cRev=val(cKey),
     cTar=tar(cKey);

 let channels=scope.channels.map(c=>({...c,p:c.v!=null&&c.t?c.v/c.t*100:null})),
     mcost=val('Chi phí Marketing tổng'),
     roas=mSuccRaw!=null&&mcost?mSuccRaw/mcost:null,
     cp=mSuccRaw!=null&&mcost?mcost/mSuccRaw*100:null;

 let csTouch=firstVal('Lượt Chăm sóc','Lượt CS'),
     csConn=val('Kết nối thành công'),
     csNeed=val('KH có nhu cầu'),
     csRet=val('Khách quay lại'),
     connRate=csTouch&&csConn?csConn/csTouch*100:null,
     needRate=csConn&&csNeed?csNeed/csConn*100:null,
     retRate=csNeed&&csRet?csRet/csNeed*100:null,
     csAov=csRet&&cRev?cRev/csRet:null;

 return{
   scope,
   mCreate:mCreateRaw,mCreateTar,mSucc:mSuccRaw,mSuccTar,
   saleCreate,saleSucc,saleCreateTar,saleSuccTar,
   saleCreateInput,saleSuccInput,saleCreateDerived,saleSuccDerived,
   saleCreatePositive,saleSuccPositive,
   createdOrders,createdOrdersDisplay,successOrders,dataSale,
   saleNew,saleWaitStock,saleConfirmed,saleWaitTransfer,
   pending,pendingOrders,pendingOrdersInput,
   cntNew,cntWaitStock,cntConfirmed,cntWaitTransfer,
   delivering,deliveringOrders,refund,refundOrders,
   crCreate,crSuccess,crRefund,aov,
   saleStatusSum,orderStatusSum,
   saleDiffVsInput,saleDiffVsPositive,orderDiffVsInput,
   cKey,cRev,cTar,channels,channelSum:scope.channelSum,channelUsable:true,
   mcost,roas,cp,csTouch,csConn,csNeed,csRet,connRate,needRate,retRate,csAov
 }
}

function assess(){
 state.issues=[];
 let d=derived();
 state.scope=d.scope;
 if(!state.rows.length){state.issues.push({type:'err',text:'Không đọc được dữ liệu.'});return}

 // % HT source check
 state.rows.forEach(r=>{
   if(r.actual!=null&&r.target){
     let calc=r.actual/r.target*100;
     if(r.pct!=null&&Math.abs(calc-r.pct)>.35){
       state.issues.push({type:'warn',text:`${r.name}: % HT nhập ${fmtNum(r.pct,2)}%, hệ thống tính ${fmtNum(calc,2)}%.`})
     }
   }
 });

 // MKT ↔ Sale: tham chiếu tích cực, nhưng nội bộ Sale phải ưu tiên khớp phễu.
 if(d.saleCreateInput!=null&&d.saleCreateDerived!=null&&Math.abs(d.saleCreateInput-d.saleCreateDerived)>.1){
   state.issues.push({type:'warn',text:`MKT → SALE tạo đơn lệch: Sale nhập ${money(d.saleCreateInput)}, MKT-Shopee ${money(d.saleCreateDerived)}. Tham chiếu tích cực = ${money(d.saleCreatePositive)}; dashboard nội bộ Sale dùng tổng 4 trạng thái = ${money(d.saleCreate)} để bảo đảm phễu khớp.`})
 }
 if(d.saleSuccInput!=null&&d.saleSuccDerived!=null&&Math.abs(d.saleSuccInput-d.saleSuccDerived)>.1){
   state.issues.push({type:'warn',text:`MKT → SALE thành công lệch: Sale nhập ${money(d.saleSuccInput)}, MKT-Shopee ${money(d.saleSuccDerived)}. Tool giữ số thành công Sale gốc đầu tiên = ${money(d.saleSucc)} để đồng nhất phễu nội bộ.`})
 }

 // Đơn treo doanh số luôn được tính từ 4 trạng thái con.
 let pendingInputLegacy=firstVal('Giá trị đơn treo','Doanh số đơn treo','DS Đơn treo');
 if(pendingInputLegacy!=null&&Math.abs(pendingInputLegacy-d.pending)>.1){
   state.issues.push({type:'warn',text:`Đơn treo được tính lại từ Mới + Chờ hàng + Đã xác nhận + Chờ chuyển = ${money(d.pending)}; số tổng nhập ${money(pendingInputLegacy)} không được dùng.`})
 }

 // Nếu có count con thì override tổng số đơn treo.
 if([d.cntNew,d.cntWaitStock,d.cntConfirmed,d.cntWaitTransfer].some(v=>v!=null)){
   if(d.pendingOrdersInput!=null&&d.pendingOrders!=null&&Math.abs(d.pendingOrdersInput-d.pendingOrders)>=1){
     state.issues.push({type:'warn',text:`Tổng số đơn treo được tính lại từ các trạng thái con = ${fmt(d.pendingOrders,'Đơn')} đơn; số tổng nhập ${fmt(d.pendingOrdersInput,'Đơn')} đơn không được dùng.`})
   }
 }else if(d.pendingOrdersInput!=null){
   state.issues.push({type:'warn',text:`Chưa có số đơn chi tiết Mới/Chờ hàng/Đã xác nhận/Chờ chuyển; Tổng số đơn treo tạm lấy số đầu tiên đã nhập = ${fmt(d.pendingOrdersInput,'Đơn')} đơn.`})
 }

 // Tạo đơn nội bộ bắt buộc khớp 4 trạng thái.
 if(d.saleCreateInput!=null&&Math.abs(d.saleDiffVsInput||0)>.1){
   state.issues.push({type:'warn',text:`Sale nội bộ đã tự cân: Treo ${money(d.pending)} + Đang giao ${money(d.delivering)} + Thành công ${money(d.saleSucc)} + Hoàn ${money(d.refund)} = Tạo đơn ${money(d.saleCreate)}. Số tạo đơn nhập ${money(d.saleCreateInput)} lệch ${signedMoney(d.saleDiffVsInput)}.`})
 }

 // Số đơn cũng tự cân nếu đủ dữ liệu 4 trạng thái.
 if(d.orderStatusSum!=null&&d.createdOrders!=null&&Math.abs(d.orderDiffVsInput||0)>=1){
   state.issues.push({type:'warn',text:`Số đơn nội bộ đã tự cân: Treo ${fmt(d.pendingOrders,'Đơn')} + Đang giao ${fmt(d.deliveringOrders,'Đơn')} + Thành công ${fmt(d.successOrders,'Đơn')} + Hoàn ${fmt(d.refundOrders,'Đơn')} = ${fmt(d.createdOrdersDisplay,'Đơn')} đơn; số đơn tạo nhập ${fmt(d.createdOrders,'Đơn')} lệch ${fmt(d.orderDiffVsInput,'Đơn')} đơn.`})
 }

 // Chỉ số phụ luôn kiểm theo số gốc.
 let inputClose=firstVal('Tỉ lệ chốt','Tỷ lệ chốt'),
     inputRefund=firstVal('Tỉ lệ hoàn','Tỷ lệ hoàn'),
     inputAov=firstVal('AOV');

 if(d.createdOrders!=null&&d.dataSale){
   let calc=d.createdOrders/d.dataSale*100;
   if(inputClose!=null&&Math.abs(inputClose-calc)>.35)
     state.issues.push({type:'warn',text:`Tỉ lệ chốt: nhập ${fmtNum(inputClose,2)}%, tính theo Số đơn tạo gốc / Tổng data = ${fmtNum(calc,2)}%. Dashboard dùng số tính.`})
 }
 if(d.createdOrders!=null&&d.refundOrders!=null&&d.createdOrders>0){
   let calc=d.refundOrders/d.createdOrders*100;
   if(inputRefund!=null&&Math.abs(inputRefund-calc)>.35)
     state.issues.push({type:'warn',text:`Tỉ lệ hoàn: nhập ${fmtNum(inputRefund,2)}%, tính theo Số đơn hoàn / Số đơn tạo gốc = ${fmtNum(calc,2)}%. Dashboard dùng số tính.`})
 }
 if(d.saleCreateInput!=null&&d.createdOrders){
   let calc=d.saleCreateInput/d.createdOrders;
   if(inputAov!=null&&Math.abs(inputAov-calc)>.03)
     state.issues.push({type:'warn',text:`AOV: nhập ${fmtNum(inputAov,2)} tr/đơn, tính theo Doanh số tạo đơn gốc / Số đơn tạo gốc = ${fmtNum(calc,2)} tr/đơn. Dashboard dùng số tính.`})
 }

 if(state.tab==='month')
   state.issues.push({type:'ok',text:'BC2 THÁNG: lấy trực tiếp 3 cột Đã đạt / Target / % HT của TỔNG THÁNG.'});
 if(state.periods.length)
   state.issues.push({type:'ok',text:`Đã nhận đúng form TỔNG THÁNG + ${state.periods.filter(p=>p.type==='week').length} tuần; kỳ đang dùng: ${state.detectedLabel}.`});
 if(!state.issues.some(x=>x.type==='err'))
   state.issues.push({type:'ok',text:'Dashboard đã tự đồng bộ logic nội bộ Sale trước khi vẽ ảnh; mọi chênh lệch chỉ cảnh báo vàng.'})
}

function insightList(d){let a=[];let mp=d.mSucc!=null&&d.mSuccTar?d.mSucc/d.mSuccTar*100:null,sp=d.saleCreate!=null&&d.saleCreateTar?d.saleCreate/d.saleCreateTar*100:null,ssp=d.saleSucc!=null&&d.saleSuccTar?d.saleSucc/d.saleSuccTar*100:null,cpct=d.cRev!=null&&d.cTar?d.cRev/d.cTar*100:null;
 if(d.scope.mktMixed&&state.tab==='week')a.push(`Marketing tuần ghi nhận ${money(d.mSucc)} thành công từ 4 kênh, đạt ${mp!=null?fmtNum(mp,2)+'%':'—'} KPI; không dùng số lũy kế cho KPI tuần.`);else if(mp!=null){let cm=compareMetric('Doanh thu Marketing (Thành công)'),cmp=cm.delta!=null?` ${cm.delta>=0?'Tăng':'Giảm'} ${fmtNum(Math.abs(cm.delta),1)}% so kỳ trước.`:'';a.push(`Marketing đạt ${fmtNum(mp,2)}% KPI doanh thu thành công ${periodWord()}.${cmp}`);}
 if(sp!=null&&ssp!=null){let cm=compareMetric('Doanh thu thành công');let cmp=cm.delta!=null?` ${cm.delta>=0?'Tăng':'Giảm'} ${fmtNum(Math.abs(cm.delta),1)}% so kỳ trước.`:'';a.push(`Sale Online đạt ${fmtNum(sp,2)}% KPI tạo đơn và ${fmtNum(ssp,2)}% KPI thành công; tỷ lệ hoàn ${fmt(d.crRefund,'%')}.${cmp}`);}
 if(cpct!=null){let cm=compareMetric('Doanh thu khách quay lại'),cmp=cm.delta!=null?` ${cm.delta>=0?'Tăng':'Giảm'} ${fmtNum(Math.abs(cm.delta),1)}% so kỳ trước.`:'';a.push(`CSKH ${cpct>=100?'vượt':'đạt'} KPI doanh thu, đạt ${fmtNum(cpct,2)}%; tỷ lệ KH có nhu cầu chuyển thành mua lại ${fmt(d.retRate,'%')}.${cmp}`);}return a.slice(0,3)}
function priorities(d){let a=[];if(d.refund&&d.saleCreate)a.push({title:'Tỷ lệ hoàn cao',value:money(d.refund),sub:`${fmt(d.crRefund,'%')} doanh thu tạo đơn`,icon:'refresh'});if(d.pending)a.push({title:'Đơn treo cao',value:money(d.pending),sub:`${fmt(d.pendingOrders,'Đơn')} đơn`,icon:'hourglass'});if(d.saleSucc!=null&&d.saleSuccTar!=null&&d.saleSucc<d.saleSuccTar)a.push({title:'Sale Online thiếu KPI thành công',value:money(d.saleSuccTar-d.saleSucc),sub:'so với target kỳ',icon:'target'});if(d.mSucc!=null&&d.mSuccTar!=null&&d.mSucc<d.mSuccTar)a.push({title:'Marketing thiếu KPI thành công',value:money(d.mSuccTar-d.mSucc),sub:'so với target kỳ',icon:'megaphone'});if(d.retRate!=null)a.push({title:'Tỷ lệ KH có nhu cầu chuyển thành mua lại thấp',value:fmt(d.retRate,'%'),sub:'cần tăng chuyển đổi',icon:'people'});return a.slice(0,5)}
function actions(d){let ads=d.channels.find(c=>c.name==='Ads');return[
 {title:'GIẢM TỶ LỆ HOÀN',icon:'refresh',body:[`Kiểm soát hoàn ${fmt(d.crRefund,'%')} (${money(d.refund)}).`,'Xác nhận nhu cầu trước giao, chăm nhóm có nguy cơ hoàn.']},
 {title:'XỬ LÝ ĐƠN TREO',icon:'truck',body:[`Đơn treo ${money(d.pending)}; chờ vận chuyển ${money(d.delivering)}.`,'Ưu tiên đơn tồn lâu, phối hợp kho và vận hành.']},
 {title:'TỐI ƯU MARKETING',icon:'chart',body:[ads?.p!=null?`Ads đạt ${fmtNum(ads.p,2)}% KPI; giảm nhóm ROAS thấp.`:'Tối ưu ROAS/CP-TC từ số gốc.','Duy trì kênh có tiến độ KPI tốt nhất.']},
 {title:'TĂNG CHUYỂN ĐỔI SALE',icon:'funnel',body:[`CR thành công hiện ${fmt(d.crSuccess,'%')}.`,'Rà soát đơn chưa thành công, rút ngắn xử lý sau chốt.']},
 {title:'TĂNG KHÁCH QUAY LẠI',icon:'people',body:[`Tập trung ${fmt(d.csNeed,'KH')} KH đã có nhu cầu.`,`Tăng tần suất CS nhóm có hẹn; CR mua lại ${fmt(d.retRate,'%')}.`]}
]}
function discountHistory(name){let r=find(name),cur=r?.actual;if(cur==null)return{cur:null,p1:null,p2:null};let p1=compareRow(state.comparePrev,name)?.actual??null,p2=null;if(state.periods.length&&state.selectedPeriods.length){let periods=state.periods.filter(p=>p.type===state.tab),idx=periods.findIndex(p=>p.key===state.selectedPeriods[0].key);if(idx>1)p2=compareRow(state.periodRows[periods[idx-2].key]||[],name)?.actual??null}if(p1!=null||p2!=null)return{cur,p1,p2};let text=r?.insight||'',m=[...text.matchAll(/(giảm|tăng)\s*([0-9]+(?:[.,][0-9]+)?)\s*(?:điểm\s*)?%/gi)];let p=m.map(x=>norm(x[1])==='giam'?cur+num(x[2]):cur-num(x[2]));return{cur,p1:p[0]??null,p2:p[1]??null}}

function setup(){
 canvas.width=OUT_W; canvas.height=OUT_H;
 let maxW=Math.max(760,$('.preview-scroll').clientWidth-36);
 canvas.style.width=Math.min(maxW,OUT_W)+'px'; canvas.style.height='auto';
 state.font=1;
}
function rr(x,y,w,h,r=12,fill='#fff',stroke=null,lw=1.8){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function tx(t,x,y,size=18,color=C.text,bold=false,align='left'){ctx.fillStyle=color;ctx.font=`${bold?700:400} ${Math.max(15,Math.round(size))}px Arial`;ctx.textAlign=align;ctx.textBaseline='top';ctx.fillText(String(t??''),x,y)}
function wrap(t,x,y,w,size=17,color=C.text,bold=false,align='left',lh=1.22,maxLines=3){size=Math.max(15,size);ctx.fillStyle=color;ctx.font=`${bold?700:400} ${Math.round(size)}px Arial`;ctx.textAlign=align;ctx.textBaseline='top';let words=String(t||'').split(/\s+/),line='',lines=[];for(let wd of words){let test=line?line+' '+wd:wd;if(ctx.measureText(test).width>w&&line){lines.push(line);line=wd}else line=test}if(line)lines.push(line);if(lines.length>maxLines){lines=lines.slice(0,maxLines);let last=lines[maxLines-1];while(ctx.measureText(last+'…').width>w&&last.length>3)last=last.slice(0,-1);lines[maxLines-1]=last+'…'}const anchor=align==='center'?x+w/2:align==='right'?x+w:x;lines.forEach((l,i)=>ctx.fillText(l,anchor,y+i*size*lh));return lines.length*size*lh}
function line(x1,y1,x2,y2,color=C.line,lw=1.8){ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function circleText(t,x,y,size,color,bold=true){ctx.save();ctx.fillStyle=color;ctx.font=`${bold?700:400} ${Math.max(15,Math.round(size))}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(t),x,y+.4);ctx.restore()}
function chamferHeaderPath(x,y,w,h,r=13,cut=18){
  // Style theo ảnh mẫu: cạnh trái bo mềm; cạnh phải là một mặt vát nhẹ
  // từ trên xuống dưới, KHÔNG tạo đầu nhọn / mũi tên.
  const rr=Math.min(r,h/2);
  const slope=Math.min(Math.max(cut,14),24);
  ctx.beginPath();
  // mép trên + bo trái trên
  ctx.moveTo(x+rr,y);
  ctx.lineTo(x+w-slope-4,y);
  // bo chuyển nhẹ trước khi vào cạnh vát
  ctx.quadraticCurveTo(x+w-slope+1,y,x+w-slope+4,y+5);
  // cạnh phải vát nhẹ xuống dưới, đáy nhô ra hơn đỉnh
  ctx.lineTo(x+w,y+h-5);
  ctx.quadraticCurveTo(x+w,y+h,x+w-5,y+h);
  // đáy + bo trái dưới
  ctx.lineTo(x+rr,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-rr);
  ctx.lineTo(x,y+rr);
  ctx.quadraticCurveTo(x,y,x+rr,y);
  ctx.closePath();
}
function fullBlockHeaderPath(x,y,w,h,r=14){
  const rr=Math.min(r,h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr,y);
  ctx.lineTo(x+w-rr,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+rr);
  ctx.lineTo(x+w,y+h);
  ctx.lineTo(x,y+h);
  ctx.lineTo(x,y+rr);
  ctx.quadraticCurveTo(x,y,x+rr,y);
  ctx.closePath();
}
function sectionHead(n,title,x,y,w,color,h=44){
  // Mục 2–9: thanh tiêu đề chạy full chiều rộng block, bo 2 góc trên như ảnh mẫu.
  fullBlockHeaderPath(x,y,w,h,14);ctx.fillStyle=color;ctx.fill();
  ctx.save();ctx.globalAlpha=.20;ctx.strokeStyle='#ffffff';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x+14,y+1.2);ctx.lineTo(x+w-14,y+1.2);ctx.stroke();ctx.restore();
  const circleR=h>=50?14:13;
  ctx.beginPath();ctx.arc(x+18+circleR,y+h/2,circleR,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
  circleText(n,x+18+circleR,y+h/2,h>=50?17:16,color,true);
  tx(title,x+18+circleR*2+14,y+(h>=50?10:8),h>=50?24:23,'#fff',true);
  return w;
}
function sectionHeadHero(n,title,x,y,w,color,h=44){
  // Mục 1 vẫn nổi bật hơn bằng gradient và chữ lớn, nhưng thanh chỉ ôm vừa nội dung.
  const fontSize=27,padL=18,circleR=15,gap=14,padR=34,cut=20;
  ctx.save();ctx.font=`700 ${fontSize}px Arial`;
  const titleW=ctx.measureText(String(title)).width;ctx.restore();
  const headW=Math.min(w,Math.max(560,padL+circleR*2+gap+titleW+padR+cut));
  const g=ctx.createLinearGradient(x,y,x+headW,y);g.addColorStop(0,color);g.addColorStop(1,'#10378f');
  chamferHeaderPath(x,y,headW,h,14,cut);ctx.fillStyle=g;ctx.fill();
  ctx.save();ctx.globalAlpha=.24;ctx.strokeStyle='#ffffff';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x+15,y+1.2);ctx.lineTo(x+headW-cut-10,y+1.2);ctx.stroke();ctx.restore();
  ctx.beginPath();ctx.arc(x+padL+circleR,y+h/2,circleR,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
  circleText(n,x+padL+circleR,y+h/2,18,color,true);
  tx(title,x+padL+circleR*2+gap,y+6,fontSize,'#fff',true);
  return headW;
}
function outerBlock(x,y,w,h,borderColor,fill='#fff'){
  rr(x,y,w,h,14,fill,borderColor,2.0);
}
function noteBox(x,y,w,h,fill,border,text,textColor){
  rr(x,y,w,h,10,fill,border,2);
  wrap(text,x+16,y+12,w-32,17,textColor,true,'left',1.2,3);
}
function progress(x,y,w,p,color,h=14){rr(x,y,w,h,h/2,'#e6e9ee');if(p!=null)rr(x,y,Math.max(0,Math.min(w,w*p)),h,h/2,color)}
function donut(cx,cy,r,vals,colors,top,bottom){let total=vals.reduce((a,b)=>a+(b||0),0)||1,start=-Math.PI/2;vals.forEach((v,i)=>{if(!v)return;let ang=v/total*Math.PI*2;ctx.beginPath();ctx.arc(cx,cy,r,start,start+ang);ctx.arc(cx,cy,r*.62,start+ang,start,true);ctx.closePath();ctx.fillStyle=colors[i];ctx.fill();start+=ang});tx(top,cx,cy-26,28,C.navy,true,'center');tx(bottom,cx,cy+14,17,C.navy,true,'center')}
function miniIcon(type,x,y,color=C.navy,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';let circle=(a,b,r)=>{ctx.beginPath();ctx.arc(a,b,r,0,Math.PI*2);ctx.stroke()};
 if(type==='target'){circle(0,0,14);circle(0,0,8);circle(0,0,3);ctx.beginPath();ctx.moveTo(3,-3);ctx.lineTo(17,-17);ctx.lineTo(17,-9);ctx.moveTo(17,-17);ctx.lineTo(9,-17);ctx.stroke()}
 else if(type==='truck'){ctx.strokeRect(-17,-9,22,15);ctx.beginPath();ctx.moveTo(5,-5);ctx.lineTo(13,-5);ctx.lineTo(18,1);ctx.lineTo(18,6);ctx.lineTo(5,6);ctx.closePath();ctx.stroke();circle(-9,10,4);circle(12,10,4)}
 else if(type==='hourglass'){ctx.strokeRect(-12,-15,24,4);ctx.strokeRect(-12,11,24,4);ctx.beginPath();ctx.moveTo(-9,-11);ctx.quadraticCurveTo(-8,-2,0,0);ctx.quadraticCurveTo(8,2,9,11);ctx.moveTo(9,-11);ctx.quadraticCurveTo(8,-2,0,0);ctx.quadraticCurveTo(-8,2,-9,11);ctx.stroke()}
 else if(type==='people'){circle(-8,-7,5);circle(8,-7,5);circle(0,-11,5);ctx.beginPath();ctx.moveTo(-18,13);ctx.quadraticCurveTo(-17,2,-8,1);ctx.moveTo(18,13);ctx.quadraticCurveTo(17,2,8,1);ctx.moveTo(-10,13);ctx.quadraticCurveTo(-9,-2,0,-2);ctx.quadraticCurveTo(9,-2,10,13);ctx.stroke()}
 else if(type==='megaphone'){ctx.beginPath();ctx.moveTo(-16,-6);ctx.lineTo(7,-13);ctx.lineTo(7,13);ctx.lineTo(-16,6);ctx.closePath();ctx.stroke();ctx.strokeRect(-17,-6,4,12)}
 else if(type==='chart'){ctx.beginPath();ctx.moveTo(-15,14);ctx.lineTo(-15,-13);ctx.moveTo(-15,14);ctx.lineTo(16,14);ctx.stroke();ctx.strokeRect(-10,3,5,9);ctx.strokeRect(-2,-4,5,16);ctx.strokeRect(7,-10,5,22)}
 else if(type==='funnel'){ctx.beginPath();ctx.moveTo(-17,-13);ctx.lineTo(17,-13);ctx.lineTo(5,1);ctx.lineTo(5,13);ctx.lineTo(-5,13);ctx.lineTo(-5,1);ctx.closePath();ctx.stroke()}
 else if(type==='refresh'){ctx.beginPath();ctx.arc(0,0,13,-2.7,.55);ctx.stroke();ctx.beginPath();ctx.moveTo(12,-11);ctx.lineTo(16,-4);ctx.lineTo(7,-4);ctx.stroke();ctx.beginPath();ctx.arc(0,0,13,.45,3.7);ctx.stroke()}
 else if(type==='cart'){ctx.beginPath();ctx.moveTo(-17,-10);ctx.lineTo(-12,-10);ctx.lineTo(-7,7);ctx.lineTo(12,7);ctx.lineTo(17,-5);ctx.lineTo(-10,-5);ctx.stroke();circle(-4,13,3);circle(10,13,3)}
 else if(type==='calendar'){ctx.strokeRect(-14,-11,28,24);ctx.beginPath();ctx.moveTo(-8,-15);ctx.lineTo(-8,-7);ctx.moveTo(8,-15);ctx.lineTo(8,-7);ctx.moveTo(-14,-3);ctx.lineTo(14,-3);ctx.stroke()}
 ctx.restore()}
function metricCard(x,y,w,h,title,actual,target,color){
 wrap(title,x+18,y+12,w-36,21,color,true,'center',1.16,2);
 if(actual==null||target==null){tx('Không đủ dữ liệu',x+w/2,y+110,22,C.muted,true,'center');return}
 tx(money(actual),x+w/2,y+88,55,color,true,'center');
 tx(`Target: ${money(target)}`,x+w/2,y+160,25,C.text,true,'center');
 let p=target?actual/target:null;if(p!=null){
   // Progress luôn theo đúng màu của KPI card; % luôn xanh tím để BOD quét nhanh; gap tăng/giảm theo xanh/đỏ.
   progress(x+20,y+h-72,w-40,p,color,15);
   tx(`${fmtNum(p*100,2)}%`,x+20,y+h-42,29,C.navy,true);
   let g=actual-target;tx(`${g>=0?'▲':'▼'} ${signedMoney(g)}`,x+w-20,y+h-37,19,g>=0?C.green:C.red,true,'right')
 }
}
function shortText(t,max=38){t=String(t||'');return t.length<=max?t:t.slice(0,max-1).trim()+'…'}

function draw(){
 setup();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#fff';ctx.fillRect(0,0,OUT_W,OUT_H);let d=derived(),m=monthLabel(),cpct=d.cRev!=null&&d.cTar?d.cRev/d.cTar*100:null;
 const LEFT=20, MAIN_W=1998, SIDE_X=2034, SIDE_W=506;
 // HEADER 20,15,2520,115
 // Không hiển thị logo. Vùng tiêu đề mở rộng từ lề trái đến trước card ngày tổng hợp.
 tx('COMMERCIAL OPERATING DASHBOARD',1070,20,60,C.navy,true,'center');
 tx(`${state.tab==='month'?'THÁNG '+m:'BÁO CÁO TUẦN'} (${periodText()})   |   ${state.tab==='month'?'BÁO CÁO THÁNG':'BÁO CÁO TUẦN'}`,1070,89,30,C.navy,true,'center');
 // CARD NGÀY TỔNG HỢP
 rr(2180,18,360,90,12,'#fff','#c3ccd9',1.8);const dateCx=2360,dateGroupX=2262;miniIcon('calendar',dateGroupX,62,C.navy,1.05);tx('Ngày tổng hợp',2390,31,19,C.navy,true,'center');tx(dateVN(reportDates().sum),2390,60,24,C.navy,true,'center');

 // BLOCK 1
 sectionHeadHero('1',`KPI TỔNG QUAN TOÀN HỆ THỐNG (${state.tab==='month'?'LŨY KẾ THÁNG '+m:'KỲ BÁO CÁO'})`,20,146,1998,C.navy,44);rr(20,190,1998,326,14,'#fbfcff','#023051',2.0);
 const kpis=[
  ['DS TẠO ĐƠN MARKETING',d.mCreate,d.mCreateTar,C.blue],
  ['DS TẠO ĐƠN SALE.ONLINE',d.saleCreate,d.saleCreateTar,C.green],
  ['DOANH THU QUAY LẠI CSKH',d.cRev,d.cTar,C.purple],
  ['DT THÀNH CÔNG SALE.ONLINE',d.saleSucc,d.saleSuccTar,C.green],
  ['DT THÀNH CÔNG MARKETING',d.mSucc,d.mSuccTar,C.blue]
 ];
 const cards=[[32,196,348,310],[390,196,348,310],[748,196,348,310],[1106,196,348,310],[1464,196,348,310]];
 const cardFills=[C.softBlue,C.softGreen,C.softPurple,C.softGreen,C.softBlue];
 kpis.forEach((k,i)=>{let [x,y,w,h]=cards[i];rr(x+4,y+4,w-8,h-8,12,cardFills[i],'#cbd3df',1.6);metricCard(x+4,y+4,w-8,h-8,k[0],k[1],k[2],k[3])});
 // KPI phụ
 rr(1822,196,184,148,10,'#fbfcff','#cfd5de');miniIcon('target',1854,245,C.navy,.9);tx('ROAS',1882,218,16,C.navy,true);tx('MARKETING',1882,240,16,C.navy,true);tx(fmt(d.roas,'Lần'),1882,275,28,C.navy,true);
 rr(1822,354,184,152,10,'#fbfcff','#cfd5de');miniIcon('chart',1854,405,C.navy,.86);tx('CP/TC',1882,377,16,C.navy,true);tx('MARKETING',1882,399,16,C.navy,true);tx(fmt(d.cp,'%'),1882,435,28,C.navy,true);

 // BLOCK 2 INSIGHT
 outerBlock(2034,146,506,450,C.navy,'#fff');sectionHead('2',`INSIGHT CHÍNH ${state.tab==='month'?'THÁNG '+m:'KỲ BÁO CÁO'}`,2034,146,506,C.navy,46);
 let ins=insightList(d);ins.forEach((t,i)=>{let y=207+i*127;miniIcon(i===1?'cart':i===2?'people':'target',2080,y+33,[C.navy,C.green,C.purple][i],1.2);wrap(t,2124,y+5,388,19,C.text,true,'left',1.22,4);if(i<2)line(2052,y+118,2522,y+118,'#cfd5de',1.6)});

 // ENGINE BLOCK 3 MARKETING
 outerBlock(20,532,650,870,C.blue,'#fff');sectionHead('3','MARKETING  (GROWTH ENGINE)',20,532,650,C.blue,50);
 // A KPI head
 const mk=[['LEAD',fmt(val('Lead'),'Lead')],['DOANH THU TẠO ĐƠN',d.mCreate!=null?money(d.mCreate):'—'],['DOANH THU THÀNH CÔNG',money(d.mSucc)]];
 mk.forEach((k,i)=>{let x=32+i*211;if(i)line(x-4,604,x-4,682,'#c9d0dc');wrap(k[0],x,601,203,17,C.navy,true,'center',1.15,2);tx(k[1],x+101.5,651,31,C.navy,true,'center')});
 // B Effectiveness
 tx('HIỆU QUẢ CHUNG',345,710,21,C.navy,true,'center');rr(32,738,626,99,10,'#fbfcfe','#cfd5de');
 [['ROAS',fmt(d.roas,'Lần')],['CP/TC',fmt(d.cp,'%')],['CHI PHÍ MARKETING',money(d.mcost)]].forEach((k,i)=>{let x=32+i*208.7;wrap(k[0],x+10,754,188,16,C.navy,true,'center',1.1,2);tx(k[1],x+104,792,27,C.navy,true,'center')});
 // C Channel donut + legend
 tx('DOANH THU THÀNH CÔNG THEO KÊNH',345,849,20,C.navy,true,'center');let chCols=['#2f65d9','#159347','#f39200','#7437ac'],chVals=d.channels.map(c=>c.v||0);donut(172,1015,112,chVals,chCols,money(d.channelSum),'(100%)');
 d.channels.forEach((c,i)=>{let y=900+i*58;ctx.fillStyle=chCols[i];ctx.beginPath();ctx.arc(330,y+12,8,0,Math.PI*2);ctx.fill();tx(c.name,350,y,20,C.text,true);let sh=d.channelSum&&c.v?c.v/d.channelSum*100:null;tx(money(c.v),545,y,19,C.navy,true,'right');tx(sh!=null?`(${fmtNum(sh,2)}%)`:'—',642,y,18,C.navy,true,'right')});
 line(464,892,464,1122,'#d2d8e2',1.4);
 // D Progress
 tx('TIẾN ĐỘ HOÀN THÀNH KPI THÀNH CÔNG (THEO KÊNH)',345,1181,17,C.navy,true,'center');let sorted=[...d.channels].sort((a,b)=>(b.p??-1)-(a.p??-1));sorted.forEach((c,i)=>{let y=1217+i*25;tx(c.name,42,y,18,C.text,true);progress(165,y+6,340,c.p!=null?c.p/100:null,chCols[d.channels.findIndex(x=>x.name===c.name)],13);tx(c.p!=null?fmtNum(c.p,2)+'%':'—',642,y,18,C.navy,true,'right')});
 // E Note
 let best=[...d.channels].filter(c=>c.p!=null).sort((a,b)=>b.p-a.p)[0]?.name||'—';noteBox(32,1323,626,65,'#dce8ff','#7ea4e8',`Nhận xét: ${best} có tiến độ tốt nhất; Ads cần ưu tiên tối ưu hiệu quả và tiến độ KPI.`,'#203f78');

 // BLOCK 4 SALE
 outerBlock(686,532,700,870,C.green,'#fff');sectionHead('4','SALE ONLINE  (CONVERSION ENGINE)',686,532,700,C.green,50);
 const saleTop=[['TẠO ĐƠN',d.saleCreate,d.saleCreateTar],['THÀNH CÔNG',d.saleSucc,d.saleSuccTar],['TỈ LỆ CHỐT',d.crCreate,null]];
 saleTop.forEach((k,i)=>{let x=698+i*225.3;if(i)line(x-5,606,x-5,706,'#c9d0dc');wrap(k[0],x,602,220,17,C.green,true,'center',1.15,2);tx(i<2?money(k[1]):fmt(k[1],'%'),x+110,650,34,'#0b6f37',true,'center');if(i<2&&k[2]!=null)tx(`Target: ${money(k[2])}`,x+110,690,16,C.text,true,'center')});
 tx('PHỄU DOANH THU',893,737,21,'#235c36',true,'center');let srows=[['Tạo đơn',d.saleCreate,'#dcebd9'],['Đơn treo',d.pending,'#e4efdf'],['Đang giao',d.delivering,'#e4efdf'],['Thành công',d.saleSucc,'#19813d'],['Hoàn hàng',d.refund,'#cb3737']];
 srows.forEach((r,i)=>{let y=790+i*70;rr(698,y,390,58,6,r[2]);let pc=d.saleCreate&&r[1]!=null?r[1]/d.saleCreate*100:null;wrap(r[0],714,y+9,190,18,i===3||i===4?'#fff':C.text,true,'left',1.08,2);tx(money(r[1]),1005,y+7,22,i===3||i===4?'#fff':C.text,true,'right');if(pc!=null)tx(`(${fmtNum(pc,2)}%)`,1072,y+31,16,i===3||i===4?'#fff':'#657064',true,'right')});
 tx('CƠ CẤU ĐƠN TREO',1236,737,20,'#235c36',true,'center');let pvals=[d.saleNew,d.saleWaitStock,d.saleConfirmed,d.saleWaitTransfer],pcols=['#2d67d5','#f08900','#189545','#9aa3b2'],pendingTotal=pvals.reduce((s,v)=>s+(v||0),0);donut(1236,858,92,pvals,pcols,money(pendingTotal),'(100%)');
 ['Mới','Chờ hàng','Đã xác nhận','Chờ chuyển hàng'].forEach((n,i)=>{let y=978+i*42,sv=pvals[i],sh=pendingTotal&&sv?sv/pendingTotal*100:null;ctx.fillStyle=pcols[i];ctx.beginPath();ctx.arc(1115,y+9,7,0,Math.PI*2);ctx.fill();wrap(`${n}: ${money(sv)} ${sh!=null?'('+fmtNum(sh,2)+'%)':''}`,1132,y,232,17,C.text,false,'left',1.12,2)});
 tx('KPI VẬN HÀNH TRỌNG YẾU',1036,1179,20,'#235c36',true,'center');let sm=[['Đơn treo',fmt(d.pendingOrders,'Đơn'),'hourglass'],['Tỉ lệ hoàn',fmt(d.crRefund,'%'),'refresh'],['Tỉ lệ chốt',fmt(d.crCreate,'%'),'target'],['AOV',fmt(d.aov,'Tr/đơn'),'cart'],['Đang giao',fmt(d.deliveringOrders,'Đơn'),'truck']];sm.forEach((mtr,i)=>{let col=i%3,row=Math.floor(i/3),x=704+col*218,y=1212+row*60;miniIcon(mtr[2],x+20,y+28,C.navy,.72);tx(mtr[0],x+48,y+6,17,C.navy,true);tx(mtr[1],x+48,y+31,23,C.navy,true)});
 noteBox(698,1335,676,62,'#dff1e2','#80bd8b',`Nhận xét: Phễu đã tự cân nội bộ. Tạo đơn = Treo + Đang giao + Thành công + Hoàn; chỉ số phụ tính từ số gốc từng phần.`,'#255d35');

 // BLOCK 5 CSKH
 outerBlock(1402,532,616,870,C.purple,'#fff');sectionHead('5','CSKH  (RETENTION ENGINE)',1402,532,616,C.purple,50);
 line(1708,606,1708,706,'#c9d0dc');wrap('DOANH THU QUAY LẠI',1420,604,270,17,C.purple,true,'center',1.15,2);tx(money(d.cRev),1555,650,36,C.purple,true,'center');tx(`Target: ${money(d.cTar)}`,1555,694,17,C.text,true,'center');wrap('TỶ LỆ HOÀN THÀNH',1726,604,270,17,C.purple,true,'center',1.15,2);tx(cpct!=null?fmtNum(cpct,2)+'%':'—',1861,650,36,C.purple,true,'center');if(d.cRev!=null&&d.cTar!=null)tx(`${d.cRev>=d.cTar?'▲':'▼'} ${signedMoney(d.cRev-d.cTar)}`,1861,694,17,d.cRev>=d.cTar?C.green:C.red,true,'center');
 tx('PHỄU CHĂM SÓC KHÁCH HÀNG',1710,737,20,C.purple,true,'center');let cs=[['KH cần CS',firstVal('KH cần Chăm sóc','KH cần CS'),'KH',null],['Lượt CS',firstVal('Lượt Chăm sóc','Lượt CS'),'Lượt',null],['Kết nối thành công',d.csConn,'KH',d.connRate],['KH có nhu cầu',d.csNeed,'KH',d.needRate],['KH quay lại',d.csRet,'KH',d.retRate],['Doanh thu quay lại',d.cRev,'Tr',null]],cWidths=[560,530,500,470,440,410];cs.forEach((r,i)=>{let w=cWidths[i],x=1710-w/2,y=770+i*58,fh=52;ctx.fillStyle=i===5?'#8c46bb':`rgba(113,50,165,${.17+.10*i})`;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w-12,y+fh);ctx.lineTo(x+12,y+fh);ctx.closePath();ctx.fill();let dark=i>=4;tx(r[0],x+22,y+13,19,dark?'#fff':C.text,true);tx(fmt(r[1],r[2]),x+w-22,y+7,23,dark?'#fff':C.purple,true,'right');if(r[3]!=null)tx(`(${fmtNum(r[3],2)}%)`,x+w-22,y+32,16,dark?'#fff':C.purple,true,'right')});
 tx('HIỆU QUẢ KHÁCH QUAY LẠI',1710,1139,20,C.purple,true,'center');rr(1414,1170,288,119,10,C.softPurple);wrap('TỶ LỆ KH QUAY LẠI / KH CÓ NHU CẦU',1430,1185,256,16,C.purple,true,'center',1.15,3);tx(fmt(d.retRate,'%'),1558,1244,31,C.purple,true,'center');rr(1718,1170,288,119,10,C.softPurple);wrap('DOANH THU BÌNH QUÂN / KH QUAY LẠI',1734,1185,256,16,C.purple,true,'center',1.15,3);tx(d.csAov!=null?`≈ ${fmtNum(d.csAov,2)} tr/khách`:'—',1862,1244,28,C.purple,true,'center');
 noteBox(1414,1301,592,87,'#eadcf4','#a77bc4',`Nhận xét: CSKH ${cpct!=null&&cpct>=100?'vượt':'đạt'} KPI; điểm nghẽn là chuyển KH có nhu cầu thành mua lại (${fmt(d.retRate,'%')}).`,'#582476');

 // BLOCK 6 TOP5
 outerBlock(2034,612,506,575,C.red,'#fff');sectionHead('6','TOP 5 VẤN ĐỀ ƯU TIÊN',2034,612,506,C.red,46);priorities(d).forEach((p,i)=>{let y=674+i*102;ctx.beginPath();ctx.arc(2062,y+22,16,0,Math.PI*2);ctx.fillStyle=C.red;ctx.fill();circleText(i+1,2062,y+22,18,'#fff');miniIcon(p.icon,2110,y+26,C.navy,1.05);wrap(p.title,2146,y,368,18,C.text,true,'left',1.15,2);tx(p.value,2146,y+49,25,C.red,true);tx(p.sub,2270,y+53,19,C.red,true);if(i<4)line(2050,y+92,2522,y+92,'#cfd5de',1.6)});

 // BLOCK 7 DISCOUNT
 outerBlock(2034,1203,506,199,C.orange,'#fff');sectionHead('7',`CHIẾT KHẤU LŨY KẾ ${state.tab==='month'?'THÁNG '+m:'KỲ BÁO CÁO'}`,2034,1203,506,C.orange,46);tx('Chỉ số',2052,1262,16,C.text,true);tx('Kỳ này',2270,1262,16,C.text,true,'center');tx('Kỳ trước 1',2375,1262,16,C.text,true,'center');tx('Kỳ trước 2',2484,1262,16,C.text,true,'center');let disc=[['Tổng chiết khấu',discountHistory('Tổng chiết khấu')],['Chiết khấu Ads',discountHistory('Chiết khấu Ads')],['Chiết khấu Livestream',discountHistory('Chiết khấu Livestream')]];disc.forEach((r,i)=>{let y=1297+i*32;tx(r[0],2052,y,15,C.text,true);tx(fmt(r[1].cur,'%'),2270,y,16,C.text,true,'center');tx(fmt(r[1].p1,'%'),2375,y,16,C.text,true,'center');tx(fmt(r[1].p2,'%'),2484,y,16,C.text,true,'center')});

 // FOOTER BLOCK 8
 outerBlock(20,1418,650,269,C.navy,'#fff');sectionHead('8',state.tab==='month'?`KẾT LUẬN THÁNG ${m.split('/')[0]}`:'KẾT LUẬN KỲ BÁO CÁO',20,1418,650,C.navy,46);miniIcon('target',83,1574,C.navy,1.5);ins.forEach((t,i)=>{ctx.fillStyle='#0a4cbd';ctx.beginPath();ctx.arc(156,1506+i*54,7,0,Math.PI*2);ctx.fill();wrap(t,178,1492+i*54,458,18,C.text,true,'left',1.2,2)});

 // FOOTER BLOCK 9
 outerBlock(686,1418,1854,269,C.navy,'#fff');sectionHead('9',state.tab==='month'?'ƯU TIÊN HÀNH ĐỘNG THÁNG TIẾP THEO':'ƯU TIÊN HÀNH ĐỘNG KỲ TIẾP THEO',686,1418,1854,C.navy,46);let ac=actions(d),gap=8,aw=(1830-gap*4)/5;ac.forEach((a,i)=>{let x=698+i*(aw+gap);rr(x,1476,aw,195,10,'#fff');if(i)line(x-4,1490,x-4,1657,'#c9d0dc');tx(`${i+1}. ${a.title}`,x+aw/2,1488,20,C.navy,true,'center');miniIcon(a.icon,x+38,1550,C.navy,1.25);a.body.slice(0,2).forEach((b,j)=>wrap('• '+shortText(b,48),x+74,1527+j*62,aw-90,18,C.text,true,'left',1.2,2))});

 $('#previewMeta').textContent=`2560 × 1707 px • ${state.detectedLabel} • ${state.runDays||'—'} ngày thực chạy • ${state.issues.filter(x=>x.type!=='ok').length} cảnh báo`;
}

function renderValidation(){let b=$('#validation');if(!state.rows.length){b.innerHTML='<div class="warn">Chưa có dữ liệu.</div>';return}let e=state.issues.filter(x=>x.type==='err'),w=state.issues.filter(x=>x.type==='warn'),o=state.issues.filter(x=>x.type==='ok');b.innerHTML=`<div class="head">${e.length} lỗi • ${w.length} cảnh báo</div>`+[...e,...w,...o].map(i=>`<div class="${i.type}">${i.type==='err'?'✕':i.type==='warn'?'⚠':'✓'} ${i.text}</div>`).join('')}
function toast(t){let e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1600)}
function syncDatesToUI(){let d=reportDates();$('#dateFrom').value=d.from;$('#dateTo').value=d.to;$('#dateSummary').value=d.sum;updatePeriodUI()}
function syncDatesFromUI(){let d={from:$('#dateFrom').value,to:$('#dateTo').value,sum:$('#dateSummary').value};if(state.tab==='week')state.weekDates=d;else state.monthDates=d}
function save(){localStorage.setItem('sevenam-commercial-dashboard-grid2560-bod-v6-fullblock-note',JSON.stringify({data:$('#dataInput').value,weekDates:state.weekDates,monthDates:state.monthDates}))}
function load(){try{let s=JSON.parse(localStorage.getItem('sevenam-commercial-dashboard-grid2560-bod-v6-fullblock-note')||'{}');$('#dataInput').value=s.data||SAMPLE;state.weekDates=s.weekDates||state.weekDates;state.monthDates=s.monthDates||state.monthDates}catch(e){$('#dataInput').value=SAMPLE}}
function run(msg=true){state.rows=parse($('#dataInput').value);if(state.periods.length)buildSelectedRows();assess();renderValidation();draw();save();if(msg)toast('Đã tự nhận kỳ & dựng Dashboard')}
load();syncDatesToUI();$('#parseBtn').onclick=()=>run();$('#sampleBtn').onclick=()=>{$('#dataInput').value=SAMPLE;run()};document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{syncDatesFromUI();document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.tab=b.dataset.tab;syncDatesToUI();run(false)});['dateFrom','dateTo','dateSummary'].forEach(id=>$('#'+id).onchange=()=>{syncDatesFromUI();if(state.periods.length)buildSelectedRows();else state.rows=parse($('#dataInput').value);assess();renderValidation();draw();save()});$('#exportBtn').onclick=()=>{let a=document.createElement('a');a.download=`SEVENAM_${state.tab==='week'?'BC_TUAN':'BC_THANG'}_2560x1707.png`;a.href=canvas.toDataURL('image/png');a.click()};$('#copyBtn').onclick=async()=>{try{let blob=await new Promise(r=>canvas.toBlob(r,'image/png'));await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);toast('Đã copy ảnh')}catch(e){toast('Trình duyệt không cho phép copy ảnh')}};window.addEventListener('resize',draw);run(false);
})();
