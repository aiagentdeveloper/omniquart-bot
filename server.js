const http=require('http'),fs=require('fs'),path=require('path');
const PORT=process.env.PORT||3000;
const DIR=process.env.DATA_DIR||path.join(__dirname,'data');
const FILE=path.join(DIR,'state.json');
const TOKEN=process.env.ADMIN_TOKEN||'';


const SYMS=['BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','DOGEUSDT','ADAUSDT','AVAXUSDT','LINKUSDT','TRXUSDT','DOTUSDT','LTCUSDT','BCHUSDT','NEARUSDT','UNIUSDT','ATOMUSDT','ETCUSDT','APTUSDT','ARBUSDT','OPUSDT','FILUSDT','INJUSDT','SUIUSDT','AAVEUSDT','HBARUSDT','TONUSDT','SEIUSDT','TIAUSDT','RUNEUSDT','ICPUSDT',
'XLMUSDT','ALGOUSDT','VETUSDT','EGLDUSDT','GRTUSDT','LDOUSDT','ENAUSDT','STXUSDT','IMXUSDT','FETUSDT','WLDUSDT','RENDERUSDT','SANDUSDT','MANAUSDT','AXSUSDT','CRVUSDT','1000PEPEUSDT','1000SHIBUSDT','JUPUSDT','ONDOUSDT',
'THETAUSDT','CHZUSDT','GALAUSDT','APEUSDT','FLOWUSDT','KAVAUSDT','ZECUSDT','DASHUSDT','XMRUSDT','EOSUSDT','XTZUSDT','NEOUSDT','IOTAUSDT','ZILUSDT','ENJUSDT','BATUSDT','COMPUSDT','SNXUSDT','MKRUSDT','1INCHUSDT','SUSHIUSDT','YFIUSDT','RVNUSDT','CELOUSDT','ANKRUSDT','MINAUSDT','ROSEUSDT','PENDLEUSDT','DYDXUSDT','BLURUSDT','ORDIUSDT','WIFUSDT','BOMEUSDT','PYTHUSDT','STRKUSDT','ALTUSDT','JASMYUSDT','GMTUSDT','LRCUSDT','QTUMUSDT'];
const LEV=10,START=700,FEE=.0004,TP_USD=1,SL_USD=1.5,MARGIN=20,MAXPOS=30;
const API='https://fapi.binance.com/fapi/v1/';


function fresh(){return{bal:START,pos:{},n:0,w:0,pnl:0,fees:0,log:[],curve:[[Date.now(),START]],paused:false}}
function load(){try{return Object.assign(fresh(),JSON.parse(fs.readFileSync(FILE,'utf8')))}catch(e){return fresh()}}
function save(){try{fs.mkdirSync(DIR,{recursive:true});fs.writeFileSync(FILE+'.tmp',JSON.stringify(S));fs.renameSync(FILE+'.tmp',FILE)}catch(e){console.error('save',e.message)}}
let S=load(),sig={},meta={last:0,ok:0,err:''};


const f=(n,d=2)=>Number(n).toFixed(d);
const log=m=>{S.log.unshift(new Date().toLocaleTimeString('tr-TR',{timeZone:'Europe/Istanbul'})+'  '+m);S.log=S.log.slice(0,100)};


function ema(a,p){const k=2/(p+1);let e=a[0];return a.map(v=>e=v*k+e*(1-k))}
function rsi(c,p=14){let g=0,l=0;for(let i=1;i<=p;i++){const d=c[i]-c[i-1];d>0?g+=d:l-=d}g/=p;l/=p;
 for(let i=p+1;i<c.length;i++){const d=c[i]-c[i-1];g=(g*(p-1)+Math.max(d,0))/p;l=(l*(p-1)+Math.max(-d,0))/p}return l==0?100:100-100/(1+g/l)}
function analyze(k){
 const c=k.map(x=>+x[4]),v=k.map(x=>+x[5]),n=c.length-1;
 const e9=ema(c,9),e21=ema(c,21),m=ema(c,12).map((x,i)=>x-ema(c,26)[i]),sg=ema(m,9),h=m[n]-sg[n],hp=m[n-1]-sg[n-1];
 const r=rsi(c),w=c.slice(-20),mean=w.reduce((a,b)=>a+b)/20,sd=Math.sqrt(w.reduce((a,b)=>a+(b-mean)**2,0)/20),bb=sd?(c[n]-mean)/(2*sd):0;
 const va=v.slice(-21,-1).reduce((a,b)=>a+b)/20,vr=v[n-1]/va;
 let s=0,tr=e9[n]>e21[n]?1:-1;s+=tr;
 s+=h>0?(h>hp?1:.5):(h<hp?-1:-.5);
 s+=r<30?1.5:r>70?-1.5:r>55?.5:r<45?-.5:0;
 s+=bb<-.9?1:bb>.9?-1:0;
 s+=vr>1.5?Math.sign(c[n]-c[n-1])*1:0;
 return{price:c[n],r,tr,h,bb,vr,score:Math.max(-5,Math.min(5,Math.round(s*2)/2))}}


const pnl=(p,px)=>(px-p.entry)*p.qty*p.dir;
const netPnl=(p,px)=>pnl(p,px)-p.fee-px*p.qty*FEE;
function closePos(s,why){const p=S.pos[s];if(!p)return;const px=sig[s]?sig[s].price:p.entry;
 const g=pnl(p,px),cf=px*p.qty*FEE,net=g-p.fee-cf;
 S.bal+=p.margin+g-cf;S.fees+=cf;S.n++;if(net>0)S.w++;S.pnl+=net;delete S.pos[s];
 log(`KAPAT ${p.dir>0?'LONG':'SHORT'} ${s} @${f(px,4)} · ${why} · brüt ${g>=0?'+':''}${f(g)} · fee ${f(p.fee+cf,3)} · net ${net>=0?'+':''}${f(net)} USDT`)}
function open(s,dir){if(S.bal<MARGIN*(1+LEV*FEE)+.01)return;
 const px=sig[s].price,not=MARGIN*LEV,qty=not/px,fee=not*FEE;
 S.bal-=MARGIN+fee;S.fees+=fee;S.pos[s]={dir,entry:px,qty,margin:MARGIN,fee,t:Date.now()};
 log(`AÇ ${dir>0?'LONG':'SHORT'} ${s} @${f(px,4)} · marjin ${f(MARGIN)} · ${LEV}x · fee ${f(fee,3)} · skor ${sig[s].score}`)}
function equity(){let e=S.bal;for(const s in S.pos){const p=S.pos[s];e+=p.margin+(sig[s]?pnl(p,sig[s].price):0)}return e}
function trade(){
 for(const s of Object.keys(S.pos)){if(!sig[s])continue;const p=S.pos[s],px=sig[s].price,roe=pnl(p,px)/p.margin,n=netPnl(p,px);
  if(roe<=-.9)closePos(s,'TASFİYE');else if(n>=TP_USD)closePos(s,'kâr al');else if(n<=-SL_USD)closePos(s,'zarar kes')}
 const cand=SYMS.filter(s=>sig[s]&&!S.pos[s]&&Math.abs(sig[s].score)>=3).sort((a,b)=>Math.abs(sig[b].score)-Math.abs(sig[a].score));
 for(const s of cand){if(Object.keys(S.pos).length>=MAXPOS)break;open(s,sig[s].score>0?1:-1)}
 S.curve.push([Date.now(),equity()]);S.curve=S.curve.slice(-600);save()}


let running=false;
async function tick(){
 if(S.paused||running)return;running=true;
 try{
  const ks=await Promise.all(SYMS.map(s=>fetch(`${API}klines?symbol=${s}&interval=5m&limit=100`,{signal:AbortSignal.timeout(10000)}).then(r=>r.ok?r.json():null).catch(()=>null)));
  let ok=0;SYMS.forEach((s,i)=>{try{if(ks[i]&&ks[i].length>30){sig[s]=analyze(ks[i]);ok++}}catch(e){}});
  meta.last=Date.now();meta.ok=ok;meta.err=ok?'':'Binance verisi alınamadı (bölge engeli olabilir, Frankfurt/Singapore bölgesi kullan)';
  if(ok)trade();
 }catch(e){meta.err=e.message}
 running=false}
setInterval(tick,15000);tick();


function view(){
 const pos=Object.keys(S.pos).map(s=>{const p=S.pos[s],px=sig[s]?sig[s].price:p.entry;return{s,dir:p.dir,entry:p.entry,px,margin:p.margin,net:netPnl(p,px)}});
 const upl=pos.reduce((a,x)=>a+x.net,0);
 return{START,MAXPOS,total:SYMS.length,paused:S.paused,last:meta.last,ok:meta.ok,err:meta.err,
  eq:equity(),bal:S.bal,upl,n:S.n,w:S.w,pnl:S.pnl,fees:S.fees,pos,log:S.log,curve:S.curve,
  sig:SYMS.filter(s=>sig[s]).map(s=>({s,...sig[s]}))}}


http.createServer((req,res)=>{
 const send=(c,t,b)=>{res.writeHead(c,{'content-type':t,'cache-control':'no-store'});res.end(b)};
 if(req.method==='GET'){
  if(req.url==='/api/state')return send(200,'application/json',JSON.stringify(view()));
  if(req.url==='/healthz')return send(200,'text/plain','ok');
  return fs.readFile(path.join(__dirname,'public','index.html'),(e,d)=>e?send(500,'text/plain','index yok'):send(200,'text/html; charset=utf-8',d));
 }
 if(req.method==='POST'){
  if(TOKEN&&req.headers['x-token']!==TOKEN)return send(401,'application/json','{"error":"yetkisiz"}');
  let b='';req.on('data',c=>{b+=c;if(b.length>1e4)req.destroy()});
  req.on('end',()=>{let j={};try{j=JSON.parse(b||'{}')}catch(e){}
   if(req.url==='/api/close'){closePos(j.sym,'manuel');save()}
   else if(req.url==='/api/pause'){S.paused=!S.paused;save()}
   else if(req.url==='/api/reset'){S=fresh();save()}
   else return send(404,'application/json','{}');
   send(200,'application/json',JSON.stringify(view()))});
  return}
 send(405,'text/plain','')
}).listen(PORT,()=>console.log('Omniquart sunucu '+PORT));
