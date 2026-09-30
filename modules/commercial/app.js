(()=>{'use strict';
const $=s=>document.querySelector(s),canvas=$('#dashCanvas'),ctx=canvas.getContext('2d'),W=2560,H=1707;
const C={navy:'#071b63',blue:'#145dcc',green:'#138447',purple:'#6b32a8',orange:'#ed8a00',red:'#c91d2e',text:'#172033',muted:'#566273',line:'#c9d1dc',soft:'#f7f9fc',softB:'#eef5ff',softG:'#eef9f1',softP:'#f7f0fb',softO:'#fff7e8',grey:'#e7ebf0'};
// V27 FIX • SOURCE MONEY PARSER • LOWER DATE CARD + CENTERED REPORT DATE typography tokens: preserve V20/V21 hierarchy and ribbons; rebalance B3 subpanels and refine B4 CR spacing.
const FS={dashboard:60,subtitle:30,section:25,subsection:23,kpiHero:60,kpi:32,table:23,label:21,secondary:18,small:16};
const state={tab:'week',rows:[],reportDate:null,period:{daysInMonth:30,daysRun:16,daysLeft:14},dates:{week:{from:'2026-09-01',to:'2026-09-16',sum:'2026-09-17'},month:{from:'2026-09-01',to:'2026-09-16',sum:'2026-09-17'}}};
const SAMPLE=`17/09/2026	Target TC	Target Tạo đơn	Tạo đơn (tr)	Thành công (tr)	Chi phí (tr)	Data	Số đơn tạo	% Chiết khấu	% Tổng Chiết khấu
TARGET tổng	2.300	3.294
Facebook Ads	1.250	1.790	598	307	141	6549	591	61,39%	63,65%
Livestream	750	1.075	566	272	60	975	622	65.95%
Shopee	100	143	-	-	-	-	-	-
Website	100	143	126	46	9.5	9.575	162	66.07%
Zalo	100	143	47,9	32	0	65	63	64,3

Trạng thái	Số đơn	Giá trị (tr)
Mới	7	11,69
Chờ hàng	122	121,395
Đã xác nhận	54	45.048
Chờ chuyển hàng	70	66,041
Đang giao	374	322,013
Thành công	429	406,822
Hoàn	92	9,53%

Chỉ tiêu	Bộ phận	Đơn vị	Đã đạt	Target
KH cần Chăm sóc	CSKH	KH	7.027	10.000
Lượt Chăm sóc	CSKH	Lượt	7.121	8.000
Kết nối thành công	CSKH	KH	5.466	4.000
KH có nhu cầu	CSKH	KH	1.355	2.000
Khách quay lại	CSKH	KH	139	250
Doanh thu khách quay lại	CSKH	Tr	229.874	600.000`;

function cleanCell(v){
 return String(v??'')
   .replace(/<br\s*\/?>/gi,' ')
   .replace(/\*\*/g,'')
   .replace(/__/g,'')
   .replace(/`/g,'')
   .trim();
}
function splitInputRow(line){
 let x=String(line||'').trim();
 if(x.includes('|')){
   let a=x.split('|');
   if(a.length&&a[0].trim()==='')a.shift();
   if(a.length&&a[a.length-1].trim()==='')a.pop();
   return a.map(cleanCell);
 }
 return x.split('\t').map(cleanCell);
}
function isMarkdownSeparatorRow(a){
 return a.length>1 && a.every(v=>{
   let x=String(v||'').trim();
   return !x || /^:?-{3,}:?$/.test(x);
 });
}
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9]+/g,' ').trim();
function rawNum(v){
 if(v==null||v==='')return null;
 let s=String(v).trim().replace(/\s/g,'');
 if(!s||s==='-'||s==='—')return null;
 const isPct=s.includes('%'); s=s.replace(/%/g,'');
 if(s.includes(',')&&s.includes('.')){
   if(s.lastIndexOf(',')>s.lastIndexOf('.'))s=s.replace(/\./g,'').replace(',','.');
   else s=s.replace(/,/g,'');
 }else if(s.includes(',')) s=s.replace(',','.');
 let n=Number(s);return Number.isFinite(n)?n:null
}
function numCount(v){
 if(v==null)return null;let s=String(v).trim().replace(/%/g,'').replace(/\s/g,'');
 if(!s||s==='-'||s==='—')return null;
 if(/^\d{1,3}(?:\.\d{3})+$/.test(s))s=s.replace(/\./g,'');
 else if(s.includes(',')&&s.includes('.')){if(s.lastIndexOf(',')>s.lastIndexOf('.'))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(/,/g,'')}
 else if(s.includes(','))s=s.replace(',','.');
 let n=Number(s);return Number.isFinite(n)?n:null
}
function numMoney(v){
 if(v==null)return null;let s=String(v).trim().replace(/\s/g,'');
 if(!s||s==='-'||s==='—'||s.includes('%'))return null;
 // Money in Tr: comma is decimal. A single dot with exactly 3 trailing digits is also decimal
 // for status/value rows (45.048 = 45.048tr), while monthly targets use numTarget().
 if(s.includes(',')&&s.includes('.')){if(s.lastIndexOf(',')>s.lastIndexOf('.'))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(/,/g,'')}
 else if(s.includes(','))s=s.replace(',','.');
 let n=Number(s);return Number.isFinite(n)?n:null
}
function numSourceMoney(v){
 if(v==null)return null;let s=String(v).trim().replace(/\s/g,'');
 if(!s||s==='-'||s==='—'||s.includes('%'))return null;
 // SOURCE table parser (Tạo đơn / Thành công / Chi phí), unit = Tr.
 // Vietnamese input convention in this table:
 //   1.182  => 1,182 Tr (thousands grouping)
 //   11.245 => 11,245 Tr
 //   45,048 => 45.048 Tr (decimal comma)
 //   1.182,5 => 1,182.5 Tr
 // This parser is intentionally separate from numMoney(), because ORDER/status
 // values may legitimately use a dot as a decimal separator (e.g. 45.048 Tr).
 if(s.includes(',')&&s.includes('.')){
   if(s.lastIndexOf(',')>s.lastIndexOf('.')) s=s.replace(/\./g,'').replace(',','.');
   else s=s.replace(/,/g,'');
 }else if(/^[-+]?\d{1,3}(?:\.\d{3})+$/.test(s)){
   s=s.replace(/\./g,'');
 }else if(s.includes(',')){
   s=s.replace(',','.');
 }
 let n=Number(s);return Number.isFinite(n)?n:null
}
function numTarget(v){
 if(v==null)return null;let s=String(v).trim().replace(/%/g,'').replace(/\s/g,'');
 if(!s||s==='-'||s==='—')return null;
 // Monthly targets / counts: 2.300 = 2300; 3.294 = 3294.
 if(/^\d{1,3}(?:\.\d{3})+$/.test(s))s=s.replace(/\./g,'');
 else if(s.includes(',')&&s.includes('.')){if(s.lastIndexOf(',')>s.lastIndexOf('.'))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(/,/g,'')}
 else if(s.includes(','))s=s.replace(',','.');
 let n=Number(s);return Number.isFinite(n)?n:null
}
function numPct(v){if(v==null||cleanCell(v)===''||cleanCell(v)==='-'||cleanCell(v)==='—')return null;return rawNum(cleanCell(v))}
function parseDateCell(v){let m=cleanCell(v).match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);if(!m)return null;return `${m[3]}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`}
function prevDay(iso){let d=new Date(iso+'T00:00:00');d.setDate(d.getDate()-1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function monthStart(iso){return iso.slice(0,8)+'01'}
function periodMeta(reportDate){
 let rd=new Date(reportDate+'T00:00:00'),to=new Date(rd);to.setDate(to.getDate()-1);
 let y=to.getFullYear(),m=to.getMonth(),daysInMonth=new Date(y,m+1,0).getDate(),daysRun=to.getDate();
 return{daysInMonth,daysRun,daysLeft:Math.max(0,daysInMonth-daysRun)}
}
function canonicalSource(v){v=cleanCell(v);let n=norm(v);if(n.includes('facebook')||n==='ads'||n.includes('facebook ads'))return'Ads';if(n.includes('livestream')||n==='live')return'Livestream';if(n.includes('shopee'))return'Shopee';if(n.includes('website')||n==='web')return'Website';if(n.includes('zalo'))return'Zalo';return String(v||'').trim()}
function canonicalCS(v){
 v=cleanCell(v);let n=norm(v);
 // Specific revenue rows MUST be checked before generic "khách quay lại".
 if(n.includes('doanh thu khach quay lai')||n.includes('doanh thu quay lai'))return'Doanh thu quay lại';
 if(n.includes('doanh thu cskh')&&n.includes('ky truoc 1')||n.includes('ky truoc 1'))return'Doanh thu CSKH kỳ trước 1';
 if(n.includes('doanh thu cskh')&&n.includes('ky truoc 2')||n.includes('ky truoc 2'))return'Doanh thu CSKH kỳ trước 2';
 if(n.includes('kh can')&&n.includes('cham soc'))return'KH cần CS';
 if(n.includes('luot')&&n.includes('cham soc'))return'Lượt CS';
 if(n.includes('ket noi'))return'Kết nối';
 if(n.includes('co nhu cau')||n.includes('kh co nhu cau'))return'Có nhu cầu';
 if(n.includes('khach quay lai')||n==='quay lai')return'Quay lại';
 return String(v||'').trim()
}
function headerMap(a){
 let m={};a.forEach((v,i)=>{let n=norm(v);
   if(i===0&&parseDateCell(v))m.date=i;
   if(n.includes('target tc')||n.includes('target thanh cong')||n.includes('kpi tc'))m.targetSuccess=i;
   else if(n.includes('target tao don')||n.includes('kpi tao don'))m.targetCreate=i;
   else if(n.includes('tao don')&&!n.includes('target')&&!n.includes('so don'))m.create=i;
   else if((n.includes('thanh cong')||n.includes('doanh thu thanh cong'))&&!n.includes('target'))m.success=i;
   else if(n.includes('chi phi'))m.cost=i;
   else if(n==='data'||n.includes('tong data'))m.data=i;
   else if(n.includes('so don tao')||n.includes('don tao'))m.orders=i;
   else if(n.includes('tong chiet khau'))m.totalDiscount=i;
   else if(n.includes('chiet khau'))m.discount=i;
 });return m
}
function parse(t){
 let lines=String(t||'').replace(/\r/g,'').split('\n').map(x=>x.trimEnd()).filter(x=>x.trim());
 if(!lines.length)return[];
 let rows=[],mode='',reportDate=null,totalDiscount=null,hmap=null,totalTargets={success:null,create:null};
 for(let li=0;li<lines.length;li++){
   let a=splitInputRow(lines[li]);
   if(isMarkdownSeparatorRow(a))continue;
   let first=cleanCell(a[0]||''),n0=norm(first);
   if(!reportDate){
     let rd=parseDateCell(first);
     if(rd){
       reportDate=rd;state.reportDate=rd;state.period=periodMeta(rd);
       let to=prevDay(rd),from=monthStart(to);
       state.dates.week={from,to,sum:rd};state.dates.month={from,to,sum:rd};
       hmap=headerMap(a);mode='source';continue
     }
   }
   if(n0==='trang thai'||n0.includes('trang thai')){mode='order';continue}
   if(n0==='chi tieu'||n0.includes('chi tieu')){mode='cskh';continue}
   if(n0.includes('target tong')){
      totalTargets.success=numTarget(a[hmap?.targetSuccess??1]);
      totalTargets.create=numTarget(a[hmap?.targetCreate??2]);
      if(hmap?.totalDiscount!=null)totalDiscount=numPct(a[hmap.totalDiscount]);
      continue
   }
   if(mode==='source'){
      let src=canonicalSource(first);if(!['Ads','Livestream','Shopee','Website','Zalo'].includes(src))continue;
      const ix=(k,fallback)=>hmap&&hmap[k]!=null?hmap[k]:fallback;
      let successTarget=numTarget(a[ix('targetSuccess',1)]),createTarget=numTarget(a[ix('targetCreate',2)]);
      let create=numSourceMoney(a[ix('create',3)]),success=numSourceMoney(a[ix('success',4)]),cost=numSourceMoney(a[ix('cost',5)]);
      let data=numCount(a[ix('data',6)]),orders=numCount(a[ix('orders',7)]);
      let disc=numPct(a[ix('discount',8)]),totalDisc=numPct(a[ix('totalDiscount',9)]);
      rows.push({group:'SOURCE',metric:'Tạo đơn',source:src,unit:'Tr',actual:create,target:createTarget,data,orders,insight:'',action:''});
      rows.push({group:'SOURCE',metric:'Thành công',source:src,unit:'Tr',actual:success,target:successTarget,data:null,orders:null,insight:'',action:''});
      rows.push({group:'SOURCE',metric:'Chi phí',source:src,unit:'Tr',actual:cost,target:null,data:null,orders:null,insight:'',action:''});
      if(disc!=null)rows.push({group:'SOURCE',metric:'Chiết khấu',source:src,unit:'%',actual:disc,target:null,data:null,orders:null,insight:'',action:''});
      if(totalDisc!=null)totalDiscount=totalDisc;
      continue
   }
   if(mode==='order'){
      let metric=first;if(!metric)continue;
      let rawVal=a[2],actual=String(rawVal||'').includes('%')?null:numMoney(rawVal);
      rows.push({group:'ORDER',metric,source:'Online',unit:'Tr',actual,target:null,data:null,orders:numCount(a[1]),insight:'',action:'',rawValue:rawVal});
      continue
   }
   if(mode==='cskh'){
      let metric=canonicalCS(first);if(!metric)continue;
      let unit=a[2]||'',isMoney=norm(unit)==='tr';
      rows.push({group:'CSKH',metric,source:'CSKH',unit,actual:isMoney?numMoney(a[3]):numCount(a[3]),target:isMoney?numMoney(a[4]):numCount(a[4]),data:null,orders:null,insight:'',action:''})
   }
 }
 // Store official monthly total targets as dedicated ONLINE rows. B1 always prefers these.
 if(totalTargets.create!=null)rows.push({group:'ONLINE',metric:'Target Tạo đơn',source:'ONLINE',unit:'Tr',actual:null,target:totalTargets.create});
 if(totalTargets.success!=null)rows.push({group:'ONLINE',metric:'Target Thành công',source:'ONLINE',unit:'Tr',actual:null,target:totalTargets.success});
 if(totalDiscount!=null)rows.push({group:'ONLINE',metric:'Tổng chiết khấu',source:'ONLINE',unit:'%',actual:totalDiscount,target:null,data:null,orders:null,insight:'',action:''});
 return rows
}
function row(group,metric,source){return state.rows.find(r=>(!group||norm(r.group)===norm(group))&&norm(r.metric)===norm(metric)&&(!source||norm(r.source)===norm(source)))}
const money=v=>v==null?'—':`${v.toLocaleString('vi-VN',{maximumFractionDigits:1})} tr`;
const pct=v=>v==null?'—':`${v.toLocaleString('vi-VN',{minimumFractionDigits:1,maximumFractionDigits:1})}%`;
const integer=v=>v==null?'—':Math.round(v).toLocaleString('vi-VN');
const noDot=s=>String(s||'').trim().replace(/[.。]+$/,'');
function calc(){
 let names=['Ads','Livestream','Shopee','Website','Zalo'];
 let src=names.map(name=>{let cr=row('SOURCE','Tạo đơn',name),su=row('SOURCE','Thành công',name),cost=row('SOURCE','Chi phí',name),disc=row('SOURCE','Chiết khấu',name);let create=cr?.actual||0,success=su?.actual||0,c=cost?.actual||0,data=cr?.data||0,orders=cr?.orders||0;return{name,create,createTarget:cr?.target||0,success,successTarget:su?.target||0,shipping:0,cost:c,costTarget:0,data,orders,successOrders:0,discount:disc?.actual??null,cr:data?orders/data*100:null,roas:c?success/c:null}});
 let total=k=>src.reduce((a,x)=>a+(x[k]||0),0),create=total('create'),success=total('success'),cost=total('cost');
 let officialCreate=row('ONLINE','Target Tạo đơn','ONLINE')?.target,officialSuccess=row('ONLINE','Target Thành công','ONLINE')?.target;
 let createTarget=officialCreate??total('createTarget'),successTarget=officialSuccess??total('successTarget');
 let o={};['Mới','Chờ hàng','Đã xác nhận','Chờ chuyển hàng','Đang giao','Thành công','Hoàn'].forEach(n=>o[n]=row('ORDER',n,'Online')||{});
 let hangingNames=['Mới','Chờ hàng','Đã xác nhận','Chờ chuyển hàng'];
 let hangingOrders=hangingNames.reduce((a,n)=>a+(o[n].orders||0),0),hangingValue=hangingNames.reduce((a,n)=>a+(o[n].actual||0),0);
 o['Treo']={group:'ORDER',metric:'Treo',source:'Online',unit:'Tr',actual:hangingValue,orders:hangingOrders};
 let shipping=o['Đang giao'].actual||0;
 let shippingOrders=o['Đang giao'].orders||0,successOrders=o['Thành công'].orders||0,refundOrders=o['Hoàn'].orders||0;
 let sentOrders=shippingOrders+successOrders+refundOrders;
 // Value sent uses status values only; never substitutes 5-source success into the order-status denominator.
 let hasRefundValue=o['Hoàn'].actual!=null,hasSuccessStatusValue=o['Thành công'].actual!=null;
 let sentValue=(o['Đang giao'].actual||0)+(o['Thành công'].actual||0)+(o['Hoàn'].actual||0);
 let totalData=total('data'),totalOrders=total('orders'),forecast=success+shipping*.7;
 let roas=cost?forecast/cost:null,cptc=forecast?cost/forecast*100:null,costLimit=forecast*.209;
 return{src,create,success,shipping,cost,createTarget,successTarget,forecast,roas,cptc,costLimit,o,sentOrders,sentValue,
 refundOrderRate:sentOrders?refundOrders/sentOrders*100:null,
 refundValueRate:(hasRefundValue&&sentValue)?(o['Hoàn'].actual||0)/sentValue*100:null,
 totalData,totalOrders,crTotal:totalData?totalOrders/totalData*100:null,aov:totalOrders?create/totalOrders:null,
 period:state.period,
 timeProgress:state.period?.daysInMonth?state.period.daysRun/state.period.daysInMonth*100:null}
}
function setup(){canvas.width=W;canvas.height=H;let max=Math.max(760,$('.preview').clientWidth-36);canvas.style.width=Math.min(max,W)+'px';canvas.style.height='auto'}
function rr(x,y,w,h,r=14,fill='#fff',stroke=null,lw=1.5){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function tx(t,x,y,s=18,color=C.text,bold=false,align='left'){ctx.fillStyle=color;ctx.font=`${bold?700:400} ${s}px Arial`;ctx.textAlign=align;ctx.textBaseline='top';ctx.fillText(String(t??''),x,y)}
function wrap(t,x,y,w,s=17,color=C.text,bold=false,max=3){ctx.fillStyle=color;ctx.font=`${bold?700:400} ${s}px Arial`;ctx.textAlign='left';ctx.textBaseline='top';let words=String(t||'').split(/\s+/),line='',lines=[];for(let z of words){let test=line?line+' '+z:z;if(ctx.measureText(test).width>w&&line){lines.push(line);line=z}else line=test}if(line)lines.push(line);lines=lines.slice(0,max);lines.forEach((l,i)=>ctx.fillText(l,x,y+i*s*1.2));return lines.length*s*1.2}
function line(x1,y1,x2,y2,col=C.line,lw=1.4){ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function head(n,title,x,y,w,color){
 const h=50,bevel=30,curve=8,r=14,rightPad=38;
 // V20: ribbon is at least 50% of its block. If the title needs more room,
 // extend the ribbon dynamically; never shrink the section-title font.
 ctx.save();
 ctx.font=`700 ${FS.section}px Arial`;
 const titleW=ctx.measureText(String(title)).width;
 ctx.restore();
 const minTabW=w*.50;
 const neededW=58+titleW+rightPad+bevel;
 const tabW=Math.min(w-2,Math.max(minTabW,neededW));

 // Soft slanted tail: the diagonal remains visible, but both transitions are rounded.
 ctx.beginPath();
 ctx.moveTo(x+r,y);
 ctx.lineTo(x+tabW-bevel-curve,y);
 ctx.quadraticCurveTo(
   x+tabW-bevel,y,
   x+tabW-bevel+curve*.55,y+curve*.60
 );
 ctx.lineTo(x+tabW-curve*.55,y+h-curve*.60);
 ctx.quadraticCurveTo(
   x+tabW,y+h,
   x+tabW-curve,y+h
 );
 ctx.lineTo(x+r,y+h);
 ctx.quadraticCurveTo(x,y+h,x,y+h-r);
 ctx.lineTo(x,y+r);
 ctx.quadraticCurveTo(x,y,x+r,y);
 ctx.closePath();
 ctx.fillStyle=color;ctx.fill();

 // Keep the badge vertically centered. Block titles remain LEFT-aligned at x+58.
 ctx.beginPath();ctx.arc(x+29,y+h/2,15,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
 ctx.save();
 ctx.textBaseline='middle';ctx.textAlign='center';ctx.fillStyle=color;ctx.font='700 19px Arial';
 ctx.fillText(String(n),x+29,y+h/2);
 ctx.textAlign='left';ctx.fillStyle='#fff';ctx.font=`700 ${FS.section}px Arial`;
 ctx.fillText(String(title),x+58,y+h/2);
 ctx.restore();
}
function progress(x,y,w,p,color,h=16){rr(x,y,w,h,h/2,'#e5e9ef');rr(x,y,Math.max(0,Math.min(w,w*(p||0))),h,h/2,color)}
function statusColor(p,inverse=false){if(p==null)return C.muted;if(inverse){if(p<=.95)return C.green;if(p<=1)return C.orange;return C.red}if(p>=1)return C.green;if(p>=.95)return C.orange;return C.red}
function arrow(p,inverse=false){if(p==null)return['•',C.muted];let col=statusColor(p,inverse);if(inverse)return[p<=1?'↓':'↑',col];return[p>=1?'↑':'↓',col]}
function vkpi(x,y,w,h,t,v,sub,p,c,fill,inverse=false){rr(x,y,w,h,12,fill,'#ccd4df',1.5);tx(t,x+w/2,y+14,17,c,true,'center');tx(v,x+w/2,y+45,39,c,true,'center');tx(sub,x+w/2,y+94,16,C.muted,true,'center');if(p!=null){let a=arrow(p,inverse),col=a[1];tx(a[0],x+24,y+125,22,col,true);tx(pct(p*100),x+50,y+128,16,col,true);progress(x+24,y+h-27,w-48,Math.min(1,p),col)}}
function miniIcon(type,x,y,color=C.navy,s=1,alpha=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2.8;ctx.lineCap='round';ctx.lineJoin='round';let circ=(a,b,r)=>{ctx.beginPath();ctx.arc(a,b,r,0,Math.PI*2);ctx.stroke()};
 if(type==='calendar'){ctx.strokeRect(-14,-11,28,24);ctx.beginPath();ctx.moveTo(-8,-15);ctx.lineTo(-8,-7);ctx.moveTo(8,-15);ctx.lineTo(8,-7);ctx.moveTo(-14,-3);ctx.lineTo(14,-3);ctx.stroke()}
 else if(type==='money'){circ(0,0,14);ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(0,9);ctx.moveTo(-5,-5);ctx.quadraticCurveTo(7,-10,7,-3);ctx.quadraticCurveTo(7,2,-5,2);ctx.quadraticCurveTo(-9,7,5,8);ctx.stroke()}
 else if(type==='chart'){ctx.beginPath();ctx.moveTo(-15,12);ctx.lineTo(-15,-12);ctx.moveTo(-15,12);ctx.lineTo(15,12);ctx.moveTo(-10,6);ctx.lineTo(-2,-2);ctx.lineTo(4,3);ctx.lineTo(13,-9);ctx.stroke()}
 else if(type==='target'){circ(0,0,14);circ(0,0,8);circ(0,0,3);ctx.beginPath();ctx.moveTo(4,-4);ctx.lineTo(17,-17);ctx.lineTo(17,-9);ctx.moveTo(17,-17);ctx.lineTo(9,-17);ctx.stroke()}
 else if(type==='package'){ctx.strokeRect(-13,-11,26,23);ctx.beginPath();ctx.moveTo(-13,-3);ctx.lineTo(0,4);ctx.lineTo(13,-3);ctx.moveTo(0,4);ctx.lineTo(0,12);ctx.moveTo(-7,-14);ctx.lineTo(7,-14);ctx.stroke()}
 else if(type==='funnel'){ctx.beginPath();ctx.moveTo(-16,-12);ctx.lineTo(16,-12);ctx.lineTo(5,1);ctx.lineTo(5,13);ctx.lineTo(-5,13);ctx.lineTo(-5,1);ctx.closePath();ctx.stroke()}
 else if(type==='people'){circ(-6,-6,5);circ(7,-6,5);ctx.beginPath();ctx.moveTo(-16,13);ctx.quadraticCurveTo(-15,1,-6,1);ctx.quadraticCurveTo(3,1,4,13);ctx.moveTo(1,13);ctx.quadraticCurveTo(2,1,7,1);ctx.quadraticCurveTo(15,1,16,13);ctx.stroke()}
 else if(type==='bulb'){circ(0,-3,10);ctx.beginPath();ctx.moveTo(-5,7);ctx.lineTo(-3,13);ctx.lineTo(3,13);ctx.lineTo(5,7);ctx.moveTo(-4,17);ctx.lineTo(4,17);ctx.stroke()}
 else if(type==='check'){circ(0,0,14);ctx.beginPath();ctx.moveTo(-7,0);ctx.lineTo(-1,6);ctx.lineTo(9,-7);ctx.stroke()}
 else if(type==='percent'){circ(-7,-7,4);circ(7,7,4);ctx.beginPath();ctx.moveTo(-11,11);ctx.lineTo(11,-11);ctx.stroke()}
 ctx.restore()}
function donut(cx,cy,r,vals,colors,center,sub='',centerSize=24,subSize=14){let total=vals.reduce((a,b)=>a+(b||0),0),a=-Math.PI/2;vals.forEach((v,i)=>{if(!v||!total)return;let e=a+Math.PI*2*v/total;ctx.beginPath();ctx.arc(cx,cy,r,a,e);ctx.arc(cx,cy,r*.62,e,a,true);ctx.closePath();ctx.fillStyle=colors[i];ctx.fill();a=e});ctx.beginPath();ctx.arc(cx,cy,r*.57,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();tx(center,cx,cy-centerSize*.58,centerSize,C.navy,true,'center');if(sub)tx(sub,cx,cy+centerSize*.38,subSize,C.muted,true,'center')}
function gauge(cx,cy,r,color,value){const fixedProgress=.72;ctx.lineCap='round';ctx.lineWidth=18;ctx.strokeStyle='#e5e9ef';ctx.beginPath();ctx.arc(cx,cy,r,-Math.PI*.85,Math.PI*.85);ctx.stroke();ctx.strokeStyle=color;ctx.beginPath();ctx.arc(cx,cy,r,-Math.PI*.85,-Math.PI*.85+Math.PI*1.7*fixedProgress);ctx.stroke();ctx.lineCap='butt';const valueX=cx-r*.28,valueY=cy-12;tx(value,valueX,valueY,34,color,true,'center')}
function kpiCard(x,y,w,h,title,value,sub,p,color,fill,inverse=false){rr(x,y,w,h,12,fill,'#ccd4df',1.5);tx(title,x+w/2,y+15,16,color,true,'center');tx(value,x+w/2,y+48,34,color,true,'center');tx(sub,x+w/2,y+91,14,C.muted,true,'center');let pp=inverse&&p!=null?Math.max(0,Math.min(1,1-p)):p;progress(x+24,y+h-29,w-48,pp,statusColor(pp));if(p!=null)tx(pct(p*100),x+w-24,y+h-49,13,statusColor(pp),true,'right')}
function dateVN(s){let d=new Date(s+'T00:00:00');return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`}
function draw(){
 setup();ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);let d=calc(),ds=state.dates[state.tab];

 // V7 percentage grid: B2 40% | B3 38% | B4 remainder (~22% after gutters)
 const M=W*.008,G=W*.008,contentW=W-2*M;
 const c2=contentW*.40,c3=contentW*.38,c4=contentW-c2-c3-2*G;
 const x2=M,x3=x2+c2+G,x4=x3+c3+G;
 const b1Y=120,b1H=280,mainY=420,mainH=790,bottomY=1230,bottomH=455;

 tx('ONLINE PERFORMANCE DASHBOARD',W*.41,10,FS.dashboard,C.navy,true,'center');
 ctx.font=`800 ${FS.subtitle+3}px Arial`;
 let periodLabel='KỲ BÁO CÁO',periodDates=`${dateVN(ds.from)} – ${dateVN(ds.to)}`,timePct=d.timeProgress;
 const hy=73,sepGap=30;
 const leftText=`${periodLabel}:  ${periodDates}`;
 const rightText=`TIẾN ĐỘ THỜI GIAN:  ${pct(timePct)}  •  ${d.period.daysRun}/${d.period.daysInMonth} NGÀY`;
 ctx.font=`800 ${FS.subtitle+3}px Arial`;
 const lw=ctx.measureText(leftText).width,rw=ctx.measureText(rightText).width;
 const totalW=lw+rw+sepGap*2+2;
 let hx=W*.47-totalW/2;
 tx(`${periodLabel}:`,hx,hy,FS.subtitle+3,C.blue,true,'left');
 let lpw=ctx.measureText(`${periodLabel}:`).width;
 tx(periodDates,hx+lpw+12,hy-1,FS.subtitle+5,C.blue,true,'left');
 let sepX=hx+lw+sepGap;
 line(sepX,hy-4,sepX,hy+24,'#AAB5C6',2);
 tx('TIẾN ĐỘ THỜI GIAN:',sepX+sepGap,hy,FS.subtitle+2,C.muted,true,'left');
 ctx.font=`800 ${FS.subtitle+2}px Arial`;
 let tw=ctx.measureText('TIẾN ĐỘ THỜI GIAN:').width;
 tx(`${pct(timePct)} • ${d.period.daysRun}/${d.period.daysInMonth} NGÀY`,sepX+sepGap+tw+12,hy-1,FS.subtitle+4,C.blue,true,'left');
 // V26 FIX: restore report-date card at top-right; blue border + blue date.
 const dateCardW=W*.135,dateCardH=82,dateCardX=W-M-dateCardW,dateCardY=18;
 // ==============================
// CARD NGÀY TỔNG HỢP
// ==============================
rr(
  dateCardX,
  dateCardY,
  dateCardW,
  dateCardH,
  12,
  '#F4F8FF',
  C.blue,
  2.4
);


// ==============================
// ICON LỊCH
// ==============================
const iconW = 40;
const iconH = 37;

const icx = dateCardX + 28;

// kéo icon lên thêm 2px
const icy = dateCardY + (dateCardH - iconH) / 2 - 2;

rr(
  icx,
  icy,
  iconW,
  iconH,
  4,
  '#fff',
  C.blue,
  2
);

// đường ngang trong icon
line(
  icx,
  icy + 8,
  icx + iconW,
  icy + 8,
  C.blue,
  2
);

// móc lịch trái
line(
  icx + 8,
  icy - 3,
  icx + 8,
  icy + 5,
  C.blue,
  2.5
);

// móc lịch phải
line(
  icx + 22,
  icy - 3,
  icx + 22,
  icy + 5,
  C.blue,
  2.5
);


// ==============================
// CĂN VÙNG CHỮ
// ==============================
const textLeft = dateCardX + 55;
const textRight = dateCardX + dateCardW - 7;

const textCenterX =
  (textLeft + textRight) / 2;

const centerY =
  dateCardY + dateCardH / 2;


// ==============================
// DÒNG 1: NGÀY TỔNG HỢP
// ==============================
tx(
  'NGÀY BÁO CÁO',
  textCenterX,
  centerY - 27,
  20,
  C.navy,
  true,
  'center'
);


// ==============================
// DÒNG 2: NGÀY THÁNG NĂM
// ==============================
tx(
  dateVN(ds.sum),
  textCenterX,
  centerY + 0,
  29,
  C.blue,
  true,
  'center'
);

 // B1 - V18: slightly larger hero numbers, same card geometry
 head('1','KPI TỔNG QUAN ONLINE',M,b1Y,contentW,C.navy);rr(M,b1Y+48,contentW,b1H-48,14,'#fbfcff','#aeb9c8',1.8);
 const cg=contentW*.007,cw=(contentW-cg*5-contentW*.018)/6,cx0=M+contentW*.009;
 let costTarget=d.costLimit;
 let cards=[
 ['DOANH SỐ TẠO ĐƠN',money(d.create),`Target ${money(d.createTarget)}`,d.createTarget?d.create/d.createTarget:null,C.blue,C.softB,false],
 ['DOANH THU ĐÃ VỀ',money(d.success),`Target ${money(d.successTarget)}`,d.successTarget?d.success/d.successTarget:null,C.purple,C.softP,false],
 ['DỰ BÁO THÀNH CÔNG',money(d.forecast),'Đã về + 70% đang giao',d.successTarget?d.forecast/d.successTarget:null,C.green,C.softG,false],
 ['TỔNG CHI PHÍ',money(d.cost),`Tối đa ${money(costTarget)} = 20,9% x Dự báo TC`,costTarget?d.cost/costTarget:null,C.orange,C.softO,true],
 ['ROAS',d.roas?d.roas.toFixed(2)+'x':'—','Dự báo TC / Chi phí',d.roas?d.roas/4:null,C.navy,C.softB,false],
 ['CP/TC',pct(d.cptc),'Chi phí / Dự báo TC',d.cptc!=null?d.cptc/20.9:null,C.red,'#fff1f2',true]
 ];
 cards.forEach((a,i)=>{
   let x=cx0+i*(cw+cg),y=b1Y+66,h=b1H-86,p=a[3],inverse=a[6];
   rr(x,y,cw,h,12,a[5],'#cbd4df',1.5);
   tx(a[0],x+cw/2,y+12,21,a[4],true,'center');
   tx(a[1],x+cw/2,y+43,FS.kpiHero,a[4],true,'center');
   tx(a[2],x+cw/2,y+106,21,C.muted,true,'center');
   if(p!=null){
     let barX=x+22,barW=cw-44,barY=y+h-27,labelY=barY-31;
     // V10 / V0 logic: bar + left % use the KPI's own identity color.
     tx(pct(p*100),barX,labelY,23,a[4],true,'left');
     let target=null,actual=null,unit='tr';
     if(i===0){actual=d.create;target=d.createTarget}
     else if(i===1){actual=d.success;target=d.successTarget}
     else if(i===2){actual=d.forecast;target=d.successTarget}
     else if(i===3){actual=d.cost;target=costTarget}
     else if(i===4){actual=d.roas;target=4;unit='x'}
     else if(i===5){actual=d.cptc;target=20.9;unit='%'}
     if(target!=null&&target!==0&&actual!=null){
       if((i===0||i===2)&&d.timeProgress!=null){
         const kpiPct=p*100,gapPct=kpiPct-d.timeProgress;
         const gapVal=Math.abs(gapPct)/100*target;
         const col=gapPct>=0?C.green:C.red;
         tx(`${gapPct>=0?'▲':'▼'} ${pct(Math.abs(gapPct))} = ${money(gapVal)}`,barX+barW,labelY,18,col,true,'right');
       }else{
         let delta=actual-target,good=inverse?delta<=0:delta>=0;
         let tri=delta>=0?'▲':'▼',col=good?C.green:C.red,abs=Math.abs(delta);
         let val=unit==='tr'?money(abs):(unit==='x'?abs.toFixed(2)+'x':pct(abs));
         tx(`${tri} ${delta>=0?'+':'-'}${val}`,barX+barW,labelY,20,col,true,'right');
       }
     }
     progress(barX,barY,barW,Math.min(1,p),a[4],16);
   }
 });

 // B2 - six-column source efficiency table + CREATE composition
 head('2','HIỆU QUẢ 5 NGUỒN ONLINE',x2,mainY,c2,C.blue);rr(x2,mainY+48,c2,mainH-48,14,'#fff',C.blue,1.8);
 const l2=x2+c2*.025,r2=x2+c2*.975;
 const sx=[l2,x2+c2*.245,x2+c2*.405,x2+c2*.575,x2+c2*.745,x2+c2*.91];
 ['NGUỒN','TẠO ĐƠN','THÀNH CÔNG','CHI PHÍ','CP/DS','CP/TC'].forEach((q,i)=>tx(q,sx[i],mainY+69,22,C.navy,true,i?'center':'left'));
 line(l2,mainY+106,r2,mainY+106);
 d.src.forEach((r,i)=>{
   let yy=mainY+120+i*59,cpds=r.create?r.cost/r.create*100:null,cptc=r.success?r.cost/r.success*100:null;
   tx(r.name,l2,yy+6,24,C.text,true);
   tx(money(r.create),sx[1],yy+4,28,C.blue,true,'center');
   tx(money(r.success),sx[2],yy+4,28,C.green,true,'center');
   tx(money(r.cost),sx[3],yy+5,27,C.red,true,'center');
   tx(pct(cpds),sx[4],yy+5,26,C.navy,true,'center');
   tx(pct(cptc),sx[5],yy+5,26,C.text,true,'center');
   line(l2,yy+50,r2,yy+50,'#d9e0e9',1.25);
 });
 let cols=[C.blue,C.purple,C.orange,C.green,'#7c8ca3'],createVals=d.src.map(r=>r.create);
 // V10: lower B2 is a true 43/57 split. Title is centered over the TABLE region only.
 const b2DonutL=x2+c2*.025,b2DonutW=c2*.43,b2TableL=x2+c2*.455,b2TableW=c2*.52;
 tx('CƠ CẤU DOANH SỐ TẠO ĐƠN',b2TableL+b2TableW/2,mainY+438,FS.subsection,C.navy,true,'center');
 donut(b2DonutL+b2DonutW*.50,mainY+610,c2*.150,createVals,cols,money(d.create),'Tổng tạo đơn',34,18);
 d.src.forEach((r,i)=>{
   let yy=mainY+500+i*51,share=d.create?r.create/d.create*100:0;
   ctx.beginPath();ctx.arc(b2TableL+8,yy+11,8,0,Math.PI*2);ctx.fillStyle=cols[i];ctx.fill();
   tx(r.name,b2TableL+28,yy+1,24,C.text,true);
   tx(money(r.create),b2TableL+b2TableW*.66,yy-1,27,C.blue,true,'right');
   tx(pct(share),b2TableL+b2TableW*.98,yy,26,C.navy,true,'right');
   let bx=b2TableL+28,by=yy+31,bw=b2TableW-38;rr(bx,by,bw,9,4,'#eef1f5');rr(bx,by,bw*Math.min(1,share/100),9,4,cols[i]);
 });

 // B3 - V22: balance both subpanels. The left funnel is larger, lower, and centered; the hanging-order donut is smaller/lower with a larger legend.
 head('3','VẬN HÀNH ĐƠN HÀNG',x3,mainY,c3,C.green);rr(x3,mainY+48,c3,mainH-48,14,'#fff',C.green,1.8);
 const innerL=x3+c3*.03, splitX=x3+c3*.59;
 const funnelTitleX=(x3+splitX)/2;
 tx('PHỄU DOANH SỐ',funnelTitleX,mainY+70,22,C.green,true,'center');
 line(splitX,mainY+88,splitX,mainY+545,'#edf0f4',1.0);

 let f=[['Tạo đơn',d.create,C.blue],['Đơn treo',d.o['Treo'].actual||0,C.orange],['Đang giao',d.o['Đang giao'].actual||d.shipping,C.purple],['Thành công',d.success,C.green],['Hoàn',d.o['Hoàn'].actual||0,C.red]];
 // V22: treat label + track + value as one visual group and center that group in the left pane.
 // Slightly larger labels/values/tracks improve scanability without changing the data ratios.
 const labelX=x3+c3*.045,barX=x3+c3*.205,barMax=c3*.230,valueX=x3+c3*.452;
 f.forEach((r,i)=>{
   const funnelTop=mainY+156,funnelStep=72;
   let yy=funnelTop+i*funnelStep;
   let ratio=d.create?Math.max(0,Math.min(1,r[1]/d.create)):0;
   tx(r[0],labelX,yy,25,C.text,true);
   rr(barX,yy+1,barMax,27,6,'#f1f4f8','#dce3eb',1.0);
   if(ratio>0)rr(barX,yy+1,Math.max(9,barMax*ratio),27,6,r[2]);
   tx(money(r[1]),valueX,yy-3,30,C.text,true,'left');
 });

 let pn=['Mới','Chờ hàng','Đã xác nhận','Chờ chuyển hàng'],pv=pn.map(n=>d.o[n].orders||0),pc=[C.blue,C.orange,C.green,C.purple],pt=pv.reduce((a,b)=>a+b,0);
 const donutCX=x3+c3*.795;
 tx('CƠ CẤU ĐƠN TREO',donutCX,mainY+70,22,C.navy,true,'center');
 // V22: slightly smaller donut and a lower center create breathing room below the title.
 donut(donutCX,mainY+232,c3*.121,pv,pc,integer(pt),'đơn treo',38,19);
 // V22: enlarge the four-state legend and use the available width of the right pane.
 pn.forEach((n,i)=>{
   let yy=mainY+367+i*44,sh=pt?pv[i]/pt*100:0;
   ctx.beginPath();ctx.arc(x3+c3*.62,yy+10,7,0,Math.PI*2);ctx.fillStyle=pc[i];ctx.fill();
   tx(n,x3+c3*.637,yy,19,C.text,true);
   tx(integer(pv[i]),x3+c3*.88,yy,19,C.navy,true,'right');
   tx(pct(sh),x3+c3*.968,yy,18,C.muted,true,'right');
 });

 // five order cards, including completed return count
 let oc=d.totalOrders||1,returnedOrders=d.o['Hoàn'].orders||0;
 let oms=[
 ['ĐƠN TẠO',d.totalOrders,'100,0%',C.blue],
 ['ĐƠN TREO',d.o['Treo'].orders||pt,pct((d.o['Treo'].orders||pt)/oc*100),C.orange],
 ['ĐANG GIAO',d.o['Đang giao'].orders||0,pct((d.o['Đang giao'].orders||0)/oc*100),C.purple],
 ['THÀNH CÔNG',d.o['Thành công'].orders||0,pct((d.o['Thành công'].orders||0)/oc*100),C.green],
 ['ĐƠN HOÀN',returnedOrders,`${pct(d.refundOrderRate)} đơn đã gửi`,C.red]
 ];
 const og=c3*.009,ow=(c3*.94-og*4)/5,ox=x3+c3*.03;
 oms.forEach((m,i)=>{let xx=ox+i*(ow+og),yy=mainY+605;rr(xx,yy,ow,120,9,'#f7f9fc','#cbd4df',1.4);tx(m[0],xx+ow/2,yy+10,22,C.text,true,'center');tx(integer(m[1]),xx+ow/2,yy+38,34,C.navy,true,'center');
   if(m[0]==='ĐƠN HOÀN'){
     let mm=String(m[2]||'').match(/^([^ ]+)\s*(.*)$/),rate=mm?mm[1]:m[2];
     tx(rate,xx+ow/2,yy+80,26,m[3],true,'center');
     tx('đơn đã gửi',xx+ow/2,yy+126,16,C.text,true,'center');
   }else{
     tx(m[2],xx+ow/2,yy+80,26,m[3],true,'center');
   }
 });

 // B4 - V22: keep the V20/V21 fixed-geometry gauges; lift the arcs, shift % values farther left, and separate the CR labels from the arc feet.
 head('4','CHUYỂN ĐỔI & HIỆU QUẢ',x4,mainY,c4,C.purple);rr(x4,mainY+48,c4,mainH-48,14,'#fff',C.purple,1.8);
 let ads=d.src[0],live=d.src[1],zalo=d.src.find(s=>String(s.name||'').toLowerCase().includes('zalo'))||d.src[4]||{};
 tx('TỈ LỆ CHỐT',x4+c4/2,mainY+72,19,C.text,true,'center');

 // CR total is a clean rounded rectangle, not another gauge.
 let crCardX=x4+c4*.13,crCardY=mainY+105,crCardW=c4*.74,crCardH=92;
 rr(crCardX,crCardY,crCardW,crCardH,13,'#f7f4fb','#c9b7dd',1.5);
 tx('CR TỔNG',crCardX+crCardW/2,crCardY+14,18,C.text,true,'center');
 tx(pct(d.crTotal),crCardX+crCardW/2,crCardY+39,38,C.purple,true,'center');

 // Three source CR gauges on one row.
 // V22: preserve radius and fixed arc length. Lift the arcs by 10px, move the % values farther toward the left-side gap,
 // and decouple label Y from the arc center so the CR labels sit lower with a clearer gap below each arc.
 let crY=mainY+306,crR=c4*.109;
 const crX=[x4+c4*.18,x4+c4*.50,x4+c4*.82],crLabelY=crY+crR+26;
 gauge(crX[0],crY,crR,C.blue,ads.cr!=null?pct(ads.cr):'—');
 gauge(crX[1],crY,crR,C.purple,live.cr!=null?pct(live.cr):'—');
 gauge(crX[2],crY,crR,C.orange,zalo.cr!=null?pct(zalo.cr):'—');
 tx('CR ADS',crX[0],crLabelY,19,C.text,true,'center');
 tx('CR LIVE',crX[1],crLabelY,19,C.text,true,'center');
 tx('CR ZALO',crX[2],crLabelY,19,C.text,true,'center');

 line(x4+c4*.05,mainY+430,x4+c4*.95,mainY+430,'#cbd4df',1.5);
 tx('CÁC CHỈ SỐ KHÁC',x4+c4/2,mainY+442,19,C.text,true,'center');

 const kg=c4*.02,kx=x4+c4*.04,kw=(c4*.92-kg*2)/3;
 [['AOV',d.aov?money(d.aov):'—',C.navy],['HOÀN ĐƠN',pct(d.refundOrderRate),C.red],['HOÀN GIÁ TRỊ',pct(d.refundValueRate),C.red]].forEach((a,i)=>{let xx=kx+i*(kw+kg),yy=mainY+480;rr(xx,yy,kw,105,8,'#f7f9fc','#cbd4df',1.35);tx(a[0],xx+kw/2,yy+12,18,C.text,true,'center');tx(a[1],xx+kw/2,yy+45,33,a[2],true,'center');});

 let totalDiscountRow=
   row('MKT','Tổng chiết khấu','MKT')||
   row('ONLINE','Tổng chiết khấu','ONLINE')||
   row('MKT','Tổng chiết khấu','')||
   row('ONLINE','Tổng chiết khấu','')||
   row('MKT','Chiết khấu tổng','MKT')||
   row('ONLINE','Chiết khấu tổng','ONLINE');
 let totalDiscount=totalDiscountRow?.actual;
 if(totalDiscount==null && Number.isFinite(ads.discount) && Number.isFinite(live.discount)){
   const wA=Number(ads.success)||Number(ads.create)||0;
   const wL=Number(live.success)||Number(live.create)||0;
   if(wA+wL>0) totalDiscount=(ads.discount*wA+live.discount*wL)/(wA+wL);
 }
 let dkg=c4*.018,dkw=(c4*.90-dkg*2)/3,dkx=x4+c4*.05;
 [['CHIẾT KHẤU ADS',pct(ads.discount),C.blue],['CHIẾT KHẤU LIVE',pct(live.discount),C.purple],['TỔNG CHIẾT KHẤU',pct(totalDiscount),C.orange]].forEach((a,i)=>{let xx=dkx+i*(dkw+dkg),yy=mainY+615;rr(xx,yy,dkw,110,9,C.softP,'#d8cce6',1.3);tx(a[0],xx+dkw/2,yy+13,16,C.text,true,'center');tx(a[1],xx+dkw/2,yy+47,32,a[2],true,'center');});

 // B5 - two-part layout: funnel 61% | breathing gap | 3 stacked KPI cards 31%
 head('5','CSKH • RETENTION',x2,bottomY,c2,C.purple);rr(x2,bottomY+48,c2,bottomH-48,14,'#fff',C.purple,1.8);
 const b5LeftX=x2+c2*.03,b5LeftW=c2*.58,b5RightX=x2+c2*.67,b5RightW=c2*.30;
 tx('PHỄU CHĂM SÓC KHÁCH HÀNG',b5LeftX,bottomY+70,19,C.purple,true);
 let cn=['KH cần CS','Lượt CS','Kết nối','Có nhu cầu','Quay lại'],fa=b5LeftW,fx=b5LeftX;
 cn.forEach((n,i)=>{let r=row('CSKH',n,'CSKH'),ww=fa-i*c2*.055,yy=bottomY+105+i*46,xx=fx+(fa-ww)/2;rr(xx,yy,ww,36,6,`rgba(107,50,168,${.16+i*.10})`,'#d7cbe6',1);tx(n,xx+14,yy+7,19,C.text,true);tx(integer(r?.actual),xx+ww-14,yy+2,26,C.purple,true,'right');});
 let touch=row('CSKH','Lượt CS','CSKH')?.actual||0,conn=row('CSKH','Kết nối','CSKH')?.actual||0,need=row('CSKH','Có nhu cầu','CSKH')?.actual||0,ret=row('CSKH','Quay lại','CSKH')?.actual||0,rev=row('CSKH','Doanh thu quay lại','CSKH');
 let kr=[['KẾT NỐI / CS',touch?conn/touch*100:null,C.blue],['NHU CẦU / KẾT NỐI',conn?need/conn*100:null,C.purple],['QUAY LẠI / NHU CẦU',need?ret/need*100:null,C.green]],krg=c2*.012,krw=(b5LeftW-krg*2)/3;
 kr.forEach((a,i)=>{let xx=fx+i*(krw+krg),yy=bottomY+350;rr(xx,yy,krw,70,8,'#f7f9fc','#d3dae5',1.2);tx(pct(a[1]),xx+krw/2,yy+5,32,a[2],true,'center');tx(a[0],xx+krw/2,yy+43,14,C.text,true,'center');});

 // Right column: 3 compact cards stacked vertically.
 let rp=rev?.target?rev.actual/rev.target:null;
 let avgRet=ret?((rev?.actual||0)/ret):null;
 let cardGap=25,cardH=102,cardY1=bottomY+70,cardY2=cardY1+cardH+cardGap,cardY3=cardY2+cardH+cardGap;

 rr(b5RightX,cardY1,b5RightW,cardH,10,C.softP,'#d8cce6',1.4);
 tx('DOANH THU KHÁCH QUAY LẠI',b5RightX+b5RightW/2,cardY1+12,15,C.purple,true,'center');
 tx(money(rev?.actual),b5RightX+b5RightW/2,cardY1+36,35,C.purple,true,'center');
 tx(`Target ${money(rev?.target)}`,b5RightX+b5RightW/2,cardY1+78,14,C.text,true,'center');

 rr(b5RightX,cardY2,b5RightW,cardH,10,'#f7f9fc','#d3dae5',1.4);
 tx('TỶ LỆ HOÀN THÀNH',b5RightX+b5RightW/2,cardY2+12,16,C.text,true,'center');
 if(rp!=null){
   let delta=(rev.actual||0)-(rev.target||0),good=delta>=0,col=good?C.green:C.red,tri=delta>=0?'▲':'▼';
   tx(pct(rp*100),b5RightX+b5RightW/2,cardY2+35,34,col,true,'center');
   tx(`${tri} ${delta>=0?'+':'-'}${money(Math.abs(delta))}`,b5RightX+b5RightW/2,cardY2+76,16,col,true,'center');
 }

 rr(b5RightX,cardY3,b5RightW,cardH,10,'#f7f9fc','#d3dae5',1.4);
 tx('DT BÌNH QUÂN / KH QUAY LẠI',b5RightX+b5RightW/2,cardY3+12,15,C.text,true,'center');
 tx(avgRet!=null?money(avgRet):'—',b5RightX+b5RightW/2,cardY3+38,34,C.navy,true,'center');
 tx('Doanh thu quay lại / Số KH quay lại',b5RightX+b5RightW/2,cardY3+80,12,'#5F6B7A',true,'center');

 // B6 - aligned with B3, conclusion pulled closer
 head('6','INSIGHT CHÍNH',x3,bottomY,c3,C.orange);rr(x3,bottomY+48,c3,bottomH-48,14,'#fff',C.orange,1.8);
 let ranked=[...d.src].filter(x=>x.successTarget).sort((a,b)=>b.success/b.successTarget-a.success/a.successTarget),best=ranked[0],worst=ranked.at(-1);
 let ins=[['01',best?.name||'NGUỒN TỐT',best?`${pct(best.success/best.successTarget*100)} KPI thành công`:'—','Vượt/đạt tiến độ',C.green],['02',worst?.name||'NGUỒN CẦN CẢI THIỆN',worst?`${pct(worst.success/worst.successTarget*100)} KPI thành công`:'—','Nguồn hụt chính',C.red],['03','ĐANG GIAO',money(d.shipping),'Cần chuyển sang thành công',C.purple],['04','HOÀN HÀNG',`${pct(d.refundOrderRate)} đơn • ${pct(d.refundValueRate)} giá trị`,'Theo dõi nguyên nhân hoàn',C.orange]];
 ins.forEach((a,i)=>{
   const innerTop=bottomY+72,innerBottom=bottomY+bottomH-26,rowH=68,gap=(innerBottom-innerTop-rowH*4)/3;
   let yy=innerTop+i*(rowH+gap);rr(x3+c3*.03,yy,c3*.94,rowH,9,i===1?'#fff2f3':'#f8fafc','#d3dae5',1.25);
   tx(a[0],x3+c3*.055,yy+17,21,a[4],true);
   // V18 hierarchy: object label stays compact; numeric/result value is larger for faster scanning.
   const headlineX=x3+c3*.12,name=a[1].toUpperCase();
   tx(name,headlineX,yy+12,22,a[4],true);
   ctx.font='700 22px Arial';
   const nameW=ctx.measureText(name).width;
   tx(` · ${a[2]}`,headlineX+nameW+6,yy+7,28,a[4],true);
   tx(noDot(a[3]),headlineX,yy+42,18,C.text,true);
 });

 // B7 - aligned with B4; compact task rows
 head('7','ƯU TIÊN HÀNH ĐỘNG',x4,bottomY,c4,C.red);rr(x4,bottomY+48,c4,bottomH-48,14,'#fff',C.red,1.8);
 let acts=[['01','ADS','TỐI ƯU NHÓM CP CAO','Ưu tiên SKU có doanh thu thành công tốt'],['02','ĐANG GIAO',`ĐẨY ${money(d.shipping)} SANG TC`,'Ưu tiên đơn tồn lâu'],['03','CONVERSION','NÂNG CR NGUỒN THẤP','Coaching theo CR thực tế'],['04','CSKH','FOLLOW KH CÓ NHU CẦU','Tăng khách quay lại']];
 acts.forEach((a,i)=>{
   const innerTop=bottomY+72,innerBottom=bottomY+bottomH-26,rowH=68,gap=(innerBottom-innerTop-rowH*4)/3;
   let yy=innerTop+i*(rowH+gap);
   rr(x4+c4*.04,yy,c4*.92,rowH,9,i===0?'#fff1f2':'#f8fafc','#d3dae5',1.2);
   tx(a[0],x4+c4*.07,yy+13,21,C.red,true);
   tx(a[1],x4+c4*.17,yy+6,17,C.navy,true);
   tx(noDot(a[2]),x4+c4*.17,yy+27,20,C.text,true);
   tx(noDot(a[3]),x4+c4*.17,yy+50,17,C.red,true);
 });

 $('#meta').textContent=`${state.rows.length} dòng • V26 FIX2 • LOWER DATE CARD + CENTERED REPORT DATE • AUTO DATE + DERIVED KPI • V20 Adaptive Ribbons + Larger/Centered B3 Funnel + Smaller Hanging-Order Donut + Enlarged Legend + Refined Fixed B4 CR Gauges • B2 40% / B3 38% / B4 22%`;
}
function validate(){
 let d=calc(),a=[],ds=state.dates[state.tab];
 if(!state.rows.length)a.push(['warn','Chưa có dữ liệu']);
 else{
   a.push(['ok',`Ngày báo cáo ${dateVN(ds.sum)} → dữ liệu chốt ${dateVN(ds.from)} – ${dateVN(ds.to)} • ${d.period.daysRun}/${d.period.daysInMonth} ngày • còn ${d.period.daysLeft} ngày`]);
   a.push(['ok',`Tổng tạo đơn 5 nguồn = ${money(d.create)} • Tổng thành công 5 nguồn = ${money(d.success)} • Tổng chi phí = ${money(d.cost)}`]);
   a.push(['ok',`Dự báo TC = ${money(d.success)} + 70% × ${money(d.shipping)} = ${money(d.forecast)}`]);
   a.push(['ok',`Đơn đã gửi = ${integer(d.o['Đang giao'].orders||0)} + ${integer(d.o['Thành công'].orders||0)} + ${integer(d.o['Hoàn'].orders||0)} = ${integer(d.sentOrders)} đơn`]);
   a.push(['ok',`CP/Dự báo TC = ${pct(d.cptc)} • ngưỡng tối đa 21,9% • mốc chi phí ${money(d.costLimit)}`]);
   a.push(['ok',`Hoàn đơn = ${integer(d.o['Hoàn'].orders)} / ${integer(d.sentOrders)} = ${pct(d.refundOrderRate)}`]);
   if(d.refundValueRate==null)a.push(['warn','Giá trị Hoàn đang là % hoặc để trống → không dùng làm tiền; Tỷ lệ hoàn giá trị hiển thị —']);
   else a.push(['ok',`Hoàn giá trị = ${money(d.o['Hoàn'].actual)} / ${money(d.sentValue)} = ${pct(d.refundValueRate)}`])
 }
 $('#validation').innerHTML=a.map(x=>`<div class="${x[0]}">• ${x[1]}</div>`).join('')
}
function sync(){let d=state.dates[state.tab];$('#from').value=d.from;$('#to').value=d.to;$('#sum').value=d.sum}
function readDates(){let d=state.dates[state.tab];d.from=$('#from').value;d.to=$('#to').value;d.sum=$('#sum').value}
function run(){state.rows=parse($('#dataInput').value);sync();validate();draw()}
function toast(t){let e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1600)}
$('#sampleBtn').onclick=()=>{$('#dataInput').value=SAMPLE;run()};$('#parseBtn').onclick=run;
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{readDates();document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.tab=b.dataset.tab;sync();draw()});
['from','to','sum'].forEach(id=>$('#'+id).onchange=()=>{readDates();draw()});
$('#exportBtn').onclick=()=>{let a=document.createElement('a');a.download='SEVENAM_ONLINE_DASHBOARD_V26_FIX_2560x1707.png';a.href=canvas.toDataURL('image/png');a.click()};
$('#copyBtn').onclick=async()=>{try{let blob=await new Promise(r=>canvas.toBlob(r,'image/png'));await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);toast('Đã copy ảnh')}catch(e){toast('Không thể copy trên trình duyệt này')}};
window.addEventListener('resize',draw);$('#dataInput').value=SAMPLE;sync();run();
})();