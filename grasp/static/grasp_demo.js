/* ── GRASP STRUCTDEBATE Explorer ─────────────────────────────────── */

// ─── State ────────────────────────────────────────────────────────
let INDEX     = null;
let AGG       = null;     // aggregate.json
let DATA      = null;
let RAWSS     = null;     // rawss/{debate_id}.json — per-judge RAW+SS rankings
let activeDebate = null;
let activeJudge  = null;
let activeTab    = 'graph';
let TAU          = 0.5;
let dynFilter    = 'volatile';
let selectedArg  = null;  // index of clicked arg
let rkJudge      = null;  // selected judge in rankings tab

const PALETTE = ['#2563eb','#dc2626','#16a34a','#ca8a04','#9333ea','#0891b2','#db2777','#d97706'];
const ANGLE_ABBR = {Economic:'E',Legal:'L',Moral:'M',Political:'P',Social:'S',Technological:'T'};

// Model identity — real brand SVG logos from Simple Icons
const JUDGE_META = {
  // OpenAI
  'GPT-5.2': {
    pip: '#10a37f', abbr: 'GPT', name: 'GPT-5.2',
    logo: `<svg width="16" height="16" viewBox="0 0 24 24" fill="#10a37f" xmlns="http://www.w3.org/2000/svg"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/></svg>`
  },
  // Anthropic
  'Claude Haiku 4.5': {
    pip: '#d97757', abbr: 'CL', name: 'Claude H.',
    logo: `<svg width="16" height="16" viewBox="0 0 24 24" fill="#d97757" xmlns="http://www.w3.org/2000/svg"><path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z"/></svg>`
  },
  // Google
  'Gemini 3 Flash': {
    pip: '#4285f4', abbr: 'GM', name: 'Gemini 3',
    logo: `<svg width="16" height="16" viewBox="0 0 24 24" fill="#4285F4" xmlns="http://www.w3.org/2000/svg"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>`
  },
  // Meta
  'LLaMA 4 Scout': {
    pip: '#0467DF', abbr: 'LL', name: 'LLaMA 4',
    logo: `<svg width="16" height="16" viewBox="0 0 24 24" fill="#0467DF" xmlns="http://www.w3.org/2000/svg"><path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"/></svg>`
  },
  // DeepSeek
  'Deepseek V3.2': {
    pip: '#5786FE', abbr: 'DS', name: 'DeepSeek',
    logo: `<svg width="16" height="16" viewBox="0 0 24 24" fill="#5786FE" xmlns="http://www.w3.org/2000/svg"><path d="M23.748 4.651c-.254-.124-.364.113-.512.233-.051.04-.094.09-.137.137-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.155-.708-.311-.955-.65-.172-.24-.219-.509-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.094.172.187.129.323-.082.28-.18.553-.266.833-.055.179-.137.218-.328.14a5.5 5.5 0 0 1-1.737-1.179c-.857-.828-1.631-1.743-2.597-2.46a12 12 0 0 0-.689-.47c-.985-.957.13-1.743.387-1.836.27-.098.094-.433-.778-.428-.872.003-1.67.295-2.687.685a3 3 0 0 1-.465.136 9.6 9.6 0 0 0-2.883-.101c-1.885.21-3.39 1.1-4.497 2.622C.082 8.776-.231 10.854.152 13.02c.403 2.284 1.568 4.175 3.36 5.653 1.857 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.132-.284 4.994-1.86.47.234.962.328 1.78.398.629.058 1.235-.031 1.705-.129.735-.155.684-.836.418-.961-2.155-1.004-1.682-.595-2.112-.926 1.095-1.295 2.768-3.598 3.284-6.733.05-.346.115-.834.108-1.114-.004-.171.035-.238.23-.257a4.2 4.2 0 0 0 1.545-.475c1.397-.763 1.96-2.016 2.093-3.517.02-.23-.004-.467-.247-.588M11.58 18.168c-2.088-1.642-3.101-2.183-3.52-2.16-.39.024-.32.472-.234.763.09.288.207.487.371.74.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.168-1.361-.801-2.5-1.86-3.301-3.306-.775-1.393-1.225-2.888-1.299-4.482-.02-.385.094-.522.477-.592a4.7 4.7 0 0 1 1.53-.038c2.131.311 3.946 1.264 5.467 2.774.868.86 1.525 1.887 2.202 2.89.72 1.066 1.494 2.082 2.48 2.915.348.291.626.513.892.677-.802.09-2.14.109-3.055-.615zm1.001-6.44a.306.306 0 0 1 .415-.287.3.3 0 0 1 .113.074.3.3 0 0 1 .086.214c0 .17-.136.307-.308.307a.303.303 0 0 1-.306-.307m3.11 1.596c-.2.081-.4.151-.591.16a1.25 1.25 0 0 1-.798-.254c-.274-.23-.47-.358-.551-.758a1.7 1.7 0 0 1 .015-.588c.07-.327-.007-.537-.238-.727-.188-.156-.426-.199-.689-.199a.6.6 0 0 1-.254-.078.253.253 0 0 1-.114-.358 1 1 0 0 1 .192-.21c.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.392.451.462.576.685.915.176.264.336.536.446.848.066.194-.02.353-.25.45"/></svg>`
  },
  // Xiaomi
  'Mimo V2 Flash': {
    pip: '#FF6900', abbr: 'MM', name: 'Mimo V2',
    logo: `<svg width="16" height="16" viewBox="0 0 24 24" fill="#FF6900" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C8.016 0 4.756.255 2.493 2.516.23 4.776 0 8.033 0 12.012c0 3.98.23 7.235 2.494 9.497C4.757 23.77 8.017 24 12 24c3.983 0 7.243-.23 9.506-2.491C23.77 19.247 24 15.99 24 12.012c0-3.984-.233-7.243-2.502-9.504C19.234.252 15.978 0 12 0zM4.906 7.405h5.624c1.47 0 3.007.068 3.764.827.746.746.827 2.233.83 3.676v4.54a.15.15 0 0 1-.152.147h-1.947a.15.15 0 0 1-.152-.148V11.83c-.002-.806-.048-1.634-.464-2.051-.358-.36-1.026-.441-1.72-.458H7.158a.15.15 0 0 0-.151.147v6.98a.15.15 0 0 1-.152.148H4.906a.15.15 0 0 1-.15-.148V7.554a.15.15 0 0 1 .15-.149zm12.131 0h1.949a.15.15 0 0 1 .15.15v8.892a.15.15 0 0 1-.15.148h-1.949a.15.15 0 0 1-.151-.148V7.554a.15.15 0 0 1 .151-.149zM8.92 10.948h2.046c.083 0 .15.066.15.147v5.352a.15.15 0 0 1-.15.148H8.92a.15.15 0 0 1-.152-.148v-5.352a.15.15 0 0 1 .152-.147Z"/></svg>`
  },
};

function judgeMeta(name) {
  return JUDGE_META[name] || { pip:'#888', abbr:name.slice(0,2).toUpperCase(),
    logo:`<svg width="16" height="16" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="#888" opacity=".2"/><text x="16" y="21" text-anchor="middle" font-size="10" fill="#888">${name.slice(0,2)}</text></svg>` };
}

// ─── Dark mode ────────────────────────────────────────────────────
function toggleDark() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  document.documentElement.dataset.theme = isDark ? '' : 'dark';
  localStorage.setItem('grasp-theme', isDark ? '' : 'dark');
  redrawAll();
}
function initTheme() {
  document.documentElement.dataset.theme = localStorage.getItem('grasp-theme') || '';
}
function isDark() { return document.documentElement.dataset.theme === 'dark'; }
function canvasBg() { return isDark() ? '#13131e' : '#f8f7f5'; }
function textClr()  { return isDark() ? '#e8e8f2' : '#0d0d14'; }
function mutedClr() { return isDark() ? 'rgba(232,232,242,0.38)' : 'rgba(13,13,20,0.44)'; }
function borderClr(){ return isDark() ? 'rgba(232,232,242,0.10)' : 'rgba(13,13,20,0.10)'; }
function proClr()   { return isDark() ? 'rgba(96,165,250,0.88)' : 'rgba(29,78,216,0.88)'; }
function conClr()   { return isDark() ? 'rgba(248,113,113,0.88)' : 'rgba(185,28,28,0.88)'; }

function redrawAll() {
  if (activeTab==='graph')     drawGraph();
  if (activeTab==='agreement') drawPearson();
  if (activeTab==='dynamics')  drawDynamics();
  drawAggPearson();
  drawScatter('scatter-canvas','scatter-tooltip');
  drawScatter('scatter2-canvas','scatter2-tooltip');
  drawDensityIters();
  drawMiniGraphs();
  updateToy();
}

// ─── Seeded RNG ────────────────────────────────────────────────────
function seededRng(seed) {
  let s=seed>>>0;
  return ()=>{ s|=0; s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
}

// ─── Force layout ─────────────────────────────────────────────────
function forceLayout(n, edges, {seed=42,iters=280,W_area=1}={}) {
  const rng=seededRng(seed);
  let px=Array.from({length:n},()=>(rng()-0.5)*2);
  let py=Array.from({length:n},()=>(rng()-0.5)*2);
  const k=Math.sqrt(W_area*W_area/Math.max(n,1));
  for (let t=0;t<iters;t++) {
    const cool=1-t/iters;
    const dx=Array(n).fill(0),dy=Array(n).fill(0);
    for (let i=0;i<n;i++) for (let j=i+1;j<n;j++) {
      const ex=px[i]-px[j],ey=py[i]-py[j],d=Math.sqrt(ex*ex+ey*ey)||0.01;
      const f=k*k/d; dx[i]+=f*ex/d; dy[i]+=f*ey/d; dx[j]-=f*ex/d; dy[j]-=f*ey/d;
    }
    for (const [i,j,w] of edges) {
      const ex=px[j]-px[i],ey=py[j]-py[i],d=Math.sqrt(ex*ex+ey*ey)||0.01;
      const f=d*d/k*(0.5+0.5*w); dx[i]+=f*ex/d; dy[i]+=f*ey/d; dx[j]-=f*ex/d; dy[j]-=f*ey/d;
    }
    for (let i=0;i<n;i++) {
      const disp=Math.sqrt(dx[i]*dx[i]+dy[i]*dy[i])||1;
      const cap=Math.min(disp,cool*0.12);
      px[i]+=dx[i]/disp*cap; py[i]+=dy[i]/disp*cap;
    }
  }
  return {x:px,y:py};
}

// ─── JS GRASP (for toy + live recompute) ──────────────────────────
function runGRASP(W, {alpha=0.15,beta=0.6,gamma=0.9,maxIter=60,tol=1e-8}={}) {
  const n=W.length;
  const D=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>W[i].reduce((s,_,k)=>s+W[i][k]*W[k][j],0)));
  let s=Array(n).fill(1.0); const history=[s.slice()];
  for (let t=0;t<maxIter;t++) {
    const sn=Array(n);
    for (let j=0;j<n;j++) {
      let num=1,den=1;
      for (let k=0;k<n;k++) num+=beta*D[k][j]*s[k];
      for (let i=0;i<n;i++) den+=alpha*W[i][j]*s[i];
      sn[j]=(1-gamma)*s[j]+gamma*(num/den);
    }
    history.push(sn.slice());
    if (Math.max(...sn.map((v,i)=>Math.abs(v-s[i])))<tol){s=sn;break;}
    s=sn;
  }
  return {scores:s,history};
}

// ─── Heat colour (for Pearson heatmap) ────────────────────────────
function heatRGB(v) {
  if (isDark()) {
    const r=Math.round(20+v*40),g=Math.round(20+v*60),b=Math.round(60+v*160);
    return [r,g,b];
  }
  const r=Math.round(255-v*210),g=Math.round(255-v*225),b=Math.round(255-v*60);
  return [r,g,b];
}

// ─── Tooltip ──────────────────────────────────────────────────────
function tip(el,html,e) {
  if (!el) return; el.innerHTML=html; el.style.display='block';
  const x=e.clientX+14,y=e.clientY-10;
  el.style.left=(x+330>innerWidth?x-350:x)+'px';
  el.style.top=(y+140>innerHeight?y-150:y)+'px';
}
function hideTip(el){if(el)el.style.display='none';}

// ─── Canvas width helper — avoids clientWidth=0 before layout ─────
function getCanvasAvailWidth(canvas, fallback) {
  let w = canvas.getBoundingClientRect().width;
  if (w > 10) return w;
  let el = canvas.parentElement;
  while (el) {
    w = el.getBoundingClientRect().width;
    if (w > 20) return Math.min(w, 900);
    el = el.parentElement;
  }
  return fallback;
}

// ─── Canvas setup helper ──────────────────────────────────────────
function setupCanvas(canvas, w, h) {
  const dpr=window.devicePixelRatio||1;
  canvas.width=w*dpr; canvas.height=h*dpr;
  canvas.style.width=w+'px'; canvas.style.height=h+'px';
  const ctx=canvas.getContext('2d');
  ctx.scale(dpr,dpr);
  ctx.fillStyle=canvasBg(); ctx.fillRect(0,0,w,h);
  return ctx;
}

// ─── Arrow helper ─────────────────────────────────────────────────
function drawArrow(ctx,x1,y1,x2,y2,nodeR,color,lw,as=4) {
  ctx.strokeStyle=color; ctx.lineWidth=lw;
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy)||1;
  const ax=x2-dx/len*nodeR,ay=y2-dy/len*nodeR;
  const nx=-dy/len,ny=dx/len;
  ctx.fillStyle=color;
  ctx.beginPath();
  ctx.moveTo(ax+nx*as,ay+ny*as);
  ctx.lineTo(ax-nx*as,ay-ny*as);
  ctx.lineTo(x2-dx/len*(nodeR+as*1.5),y2-dy/len*(nodeR+as*1.5));
  ctx.closePath(); ctx.fill();
}

// ─── TAB SWITCH ───────────────────────────────────────────────────
function switchTab(name) {
  activeTab=name;
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('hidden',p.id!==`tab-${name}`));
  if (name==='graph')     setTimeout(drawGraph,40);
  if (name==='rankings')  renderRankings();
  if (name==='agreement') setTimeout(drawPearson,40);
  if (name==='dynamics')  setTimeout(drawDynamics,40);
}

// ─── JUDGE BUTTONS ────────────────────────────────────────────────
function initJudgeBtns() {
  if (!DATA) return;
  const judges=Object.keys(DATA.judges);
  if (!activeJudge||!judges.includes(activeJudge)) activeJudge=judges[0];
  document.querySelectorAll('.judge-selector').forEach(el=>{
    el.innerHTML=judges.map(j=>{
      const m=judgeMeta(j); const on=j===activeJudge;
      const style=on?`style="background:${m.pip};border-color:${m.pip}"`:'';
      return `<button class="judge-badge${on?' active':''}" data-judge="${j}"
        onclick="setJudge('${j}',this)" ${style}>
        ${m.logo}<span>${m.abbr}</span></button>`;
    }).join('');
  });
  updateStats();
}

function setJudge(name,btn) {
  activeJudge=name;
  document.querySelectorAll('.judge-selector .judge-badge').forEach(b=>{
    const j=b.dataset.judge,m=judgeMeta(j),on=j===name;
    b.classList.toggle('active',on);
    b.style.background=on?m.pip:''; b.style.borderColor=on?m.pip:'';
  });
  updateStats();
  if (activeTab==='graph')    drawGraph();
  if (activeTab==='rankings') renderRankings();
  if (activeTab==='dynamics') drawDynamics();
}

function updateStats() {
  if (!DATA||!activeJudge) return;
  const s=DATA.stats?.[activeJudge]||{};
  const g=DATA.grasp?.[activeJudge]||{};
  const el=document.getElementById('graph-stats');
  if (el) el.textContent=`density = ${(s.density||0).toFixed(3)}  ·  mean W = ${(s.mean||0).toFixed(3)}  ·  τ cutoff = ${TAU.toFixed(2)}  ·  n = ${DATA.args.length}  ·  iters = ${g.iters||'—'}`;
}

// ─── TAU slider ───────────────────────────────────────────────────
function onTauChange(v) {
  TAU=parseFloat(v);
  document.getElementById('tau-val').textContent=TAU.toFixed(2);
  updateStats();
  if (activeTab==='graph') drawGraph();
}

// ─── MOTION SELECTOR ──────────────────────────────────────────────
function buildMotionSelector(filter='all') {
  if (!INDEX) return;
  const sel=document.getElementById('motion-select'); if (!sel) return;
  const entries=filter==='all'?INDEX:INDEX.filter(e=>e.setting===filter);
  sel.innerHTML=entries.map(e=>{
    const label=e.id+' — '+e.motion.replace(/^This House (would|believes that) /i,'').slice(0,65);
    return `<option value="${e.id}">${label}</option>`;
  }).join('');
  if (activeDebate&&entries.find(e=>e.id===activeDebate)) sel.value=activeDebate;
}

function filterSetting(btn,val) {
  btn.parentElement.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  buildMotionSelector(val);
  const sel=document.getElementById('motion-select');
  if (sel&&sel.options.length) loadDebate(sel.value);
}

async function loadDebate(id) {
  activeDebate=id; selectedArg=null; rkJudge=null;
  closeArgDetail();
  const loadEl=document.getElementById('debate-loading');
  const motEl=document.getElementById('explorer-motion-text');
  if (loadEl) loadEl.style.display='block';
  if (motEl) motEl.textContent='Loading…';
  try {
    [DATA, RAWSS] = await Promise.all([
      fetch(`static/debates/${id}.json`).then(r=>r.json()),
      fetch(`static/rawss/${id}.json`).then(r=>r.json()).catch(()=>null),
    ]);
    activeJudge=Object.keys(DATA.judges)[0];
  } catch(e) {
    console.error('Failed to load',id,e);
    if (motEl) motEl.textContent='Failed to load debate data.';
    if (loadEl) loadEl.style.display='none';
    return;
  }
  if (loadEl) loadEl.style.display='none';
  if (motEl) motEl.textContent=`"${DATA.motion}"`;
  const sel=document.getElementById('motion-select');
  if (sel&&sel.value!==id) sel.value=id;
  initJudgeBtns();
  switchTab(activeTab);
}

// ─── ATTACK GRAPH ─────────────────────────────────────────────────
let graphLayout=null, graphLayoutKey='';

function drawGraph() {
  if (!DATA||!activeJudge) return;
  const canvas=document.getElementById('graph-canvas'); if (!canvas) return;
  const W=DATA.judges[activeJudge];
  const n=W.length, args=DATA.args;
  const gd=DATA.grasp[activeJudge];
  const GRASP_scores=gd?.scores||Array(n).fill(1);
  const maxS=Math.max(...GRASP_scores),minS=Math.min(...GRASP_scores);

  // Thresholded edges
  const edges=[];
  for (let i=0;i<n;i++) for (let j=0;j<n;j++)
    if (i!==j&&W[i][j]>TAU) edges.push([i,j,W[i][j]]);

  // Layout (cache per debate+judge, independent of TAU)
  const lkey=`${activeDebate}|${activeJudge}`;
  if (lkey!==graphLayoutKey||!graphLayout) {
    const le=[];
    for (let i=0;i<n;i++) for (let j=i+1;j<n;j++) {
      const w=Math.max(W[i][j],W[j][i]);
      if (w>0.3) le.push([i,j,w]);
    }
    graphLayout=forceLayout(n,le,{seed:42,iters:300,W_area:2});
    graphLayoutKey=lkey;
  }
  const {x,y}=graphLayout;

  const dpr=window.devicePixelRatio||1;
  const cw=getCanvasAvailWidth(canvas,700);
  const ch=Math.min(cw*0.68,500);
  canvas.width=cw*dpr; canvas.height=ch*dpr;
  canvas.style.width=cw+'px'; canvas.style.height=ch+'px';
  const ctx=canvas.getContext('2d');
  ctx.scale(dpr,dpr);

  const PAD=44,gw=cw-PAD*2,gh=ch-PAD*2;
  const xmin=Math.min(...x),xmax=Math.max(...x),ymin=Math.min(...y),ymax=Math.max(...y);
  const xr=xmax-xmin||1,yr=ymax-ymin||1;
  const cx_=i=>PAD+(x[i]-xmin)/xr*gw;
  const cy_=i=>PAD+(y[i]-ymin)/yr*gh;
  const nodeR=i=>5+(GRASP_scores[i]-minS)/(maxS-minS||1)*9;

  ctx.fillStyle=canvasBg(); ctx.fillRect(0,0,cw,ch);

  // Selected arg highlight ring
  if (selectedArg!==null) {
    ctx.beginPath(); ctx.arc(cx_(selectedArg),cy_(selectedArg),nodeR(selectedArg)+5,0,Math.PI*2);
    ctx.strokeStyle=isDark()?'rgba(255,255,180,0.7)':'rgba(26,26,255,0.5)';
    ctx.lineWidth=2; ctx.stroke();
  }

  // Edges — red gradient attack arrows
  for (const [i,j,w] of edges) {
    const t=(w-TAU)/(1-TAU+0.001);
    const alpha=0.12+t*0.65;
    const g=Math.round(30+(1-t)*80),b=Math.round(20+(1-t)*40);
    const col=`rgba(210,${g},${b},${alpha})`;
    drawArrow(ctx,cx_(i),cy_(i),cx_(j),cy_(j),nodeR(j)+2,col,0.6+t*2,3+t*2.5);
  }

  // Nodes
  for (let i=0;i<n;i++) {
    const r=nodeR(i);
    ctx.beginPath(); ctx.arc(cx_(i),cy_(i),r,0,Math.PI*2);
    ctx.fillStyle=args[i].side==='Pro'?proClr():conClr();
    ctx.fill();
    if (i===selectedArg) {
      ctx.strokeStyle=isDark()?'#fff':'#1a1aff'; ctx.lineWidth=2;
    } else {
      ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.lineWidth=1;
    }
    ctx.stroke();
  }

  // Click → arg detail
  canvas.onclick=e=>{
    const rect=canvas.getBoundingClientRect();
    const mx=e.clientX-rect.left,my=e.clientY-rect.top;
    let hit=-1;
    for (let i=0;i<n;i++) {
      const r=nodeR(i)+4;
      if ((mx-cx_(i))**2+(my-cy_(i))**2<r*r){hit=i;break;}
    }
    if (hit>=0) { selectedArg=hit; drawGraph(); showArgDetail(hit); }
    else { selectedArg=null; drawGraph(); closeArgDetail(); }
  };

  // Hover tooltip
  const tip_el=document.getElementById('cell-tooltip');
  canvas.onmousemove=e=>{
    const rect=canvas.getBoundingClientRect();
    const mx=e.clientX-rect.left,my=e.clientY-rect.top;
    let hit=-1;
    for (let i=0;i<n;i++) {
      const r=nodeR(i)+3;
      if ((mx-cx_(i))**2+(my-cy_(i))**2<r*r){hit=i;break;}
    }
    if (hit<0){hideTip(tip_el);return;}
    const a=args[hit];
    const rank=gd.ranking.indexOf(hit)+1;
    const rawList=DATA.raw?.[activeJudge];
    const rawRank=rawList?rawList.indexOf(hit)+1:null;
    const attackers=W.map((row,i)=>i!==hit&&row[hit]>TAU?i:-1).filter(x=>x>=0);
    const attacked=W[hit].map((v,j)=>j!==hit&&v>TAU?j:-1).filter(x=>x>=0);
    const sc=GRASP_scores[hit];
    tip(tip_el,
      `<strong>${a.side} · ${a.angle}</strong>&emsp;<span style="opacity:.55">GRASP #${rank}${rawRank?` · RAW #${rawRank}`:''} · score ${sc.toFixed(3)}</span><br/>
${a.text.slice(0,140)}…<br/>
<span style="opacity:.45;font-size:.8em">Attacks ${attacked.length} · Attacked by ${attackers.length} · click for detail</span>`,e);
  };
  canvas.onmouseleave=()=>hideTip(tip_el);

  // Legend
  const leg=document.getElementById('graph-legend');
  if(leg) leg.innerHTML=`
    <div class="leg-item"><span class="leg-dot" style="background:${proClr()}"></span>Pro</div>
    <div class="leg-item"><span class="leg-dot" style="background:${conClr()}"></span>Con</div>
    <div class="leg-item" style="opacity:.6;font-size:.76em">Node size ∝ GRASP score · Edge red intensity ∝ attack strength · click node for detail</div>`;

  updateTopK(W,n,args,GRASP_scores);
}

// ─── PER-ARG DETAIL PANEL ─────────────────────────────────────────
function showArgDetail(idx) {
  if (!DATA||!activeJudge) return;
  const panel=document.getElementById('arg-detail-panel'); if (!panel) return;
  const a=DATA.args[idx];
  const W=DATA.judges[activeJudge];
  const n=W.length;

  // Header
  const m=judgeMeta(activeJudge);
  document.getElementById('arg-detail-badge').innerHTML=
    `<span class="rk-badge ${a.side.toLowerCase()}" style="font-size:.8rem;padding:.18rem .55rem">${a.side} · ${a.angle}</span>`;
  document.getElementById('arg-detail-title').textContent=`Argument ${idx} — ${m.abbr}`;

  // Full text
  document.getElementById('arg-detail-text').textContent=a.text;

  // Ranks across all judges
  const judges=Object.keys(DATA.grasp);
  const rawDiv=document.getElementById('arg-detail-ranks');
  rawDiv.innerHTML=judges.map(j=>{
    const jm=judgeMeta(j);
    const gRank=(DATA.grasp[j]?.ranking||[]).indexOf(idx)+1;
    const raw=DATA.raw?.[j]||[];
    const rRank=raw.indexOf(idx)+1;
    return `<div class="arg-rank-chip">
      <span class="judge-pip" style="background:${jm.pip}"></span>
      <span class="chip-model">${jm.abbr}</span>
      <span class="chip-grasp">#${gRank||'—'}</span>
      ${rRank?`<span class="chip-raw">raw #${rRank}</span>`:''}
    </div>`;
  }).join('');

  // Attackers and attacked
  const attackedBy=W.map((row,i)=>({i,w:row[idx]})).filter(x=>x.i!==idx&&x.w>0).sort((a,b)=>b.w-a.w).slice(0,8);
  const attacks=W[idx].map((w,j)=>({j,w})).filter(x=>x.j!==idx&&x.w>0).sort((a,b)=>b.w-a.w).slice(0,8);

  function connItem(argIdx,w,dir) {
    const arg=DATA.args[argIdx];
    return `<div class="conn-item" onclick="selectedArg=${argIdx};drawGraph();showArgDetail(${argIdx})">
      <div class="conn-item-head">
        <span class="rk-badge ${arg.side.toLowerCase()}" style="font-size:.62rem;padding:.07rem .3rem">${arg.side[0]}·${arg.angle[0]}</span>
        <span class="conn-w">${w.toFixed(2)}</span>
      </div>
      <div class="conn-item-text">${arg.text}</div>
    </div>`;
  }

  document.getElementById('arg-detail-connections').innerHTML=`
    <div class="conn-section">
      <div class="conn-head">Attacked by (${attackedBy.length})</div>
      ${attackedBy.length?attackedBy.map(x=>connItem(x.i,x.w,'in')).join(''):'<div style="font-size:.78rem;color:var(--muted)">None</div>'}
    </div>
    <div class="conn-section">
      <div class="conn-head">Attacks (${attacks.length})</div>
      ${attacks.length?attacks.map(x=>connItem(x.j,x.w,'out')).join(''):'<div style="font-size:.78rem;color:var(--muted)">None</div>'}
    </div>`;

  panel.classList.remove('hidden');
  panel.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function closeArgDetail() {
  const p=document.getElementById('arg-detail-panel');
  if (p) p.classList.add('hidden');
}

// ─── TOP-K INSIGHTS ───────────────────────────────────────────────
function updateTopK(W,n,args,scores) {
  const el=document.getElementById('graph-insights'); if (!el||!DATA) return;
  const raw=DATA.raw?.[activeJudge]||[];
  const graspRanking=DATA.grasp[activeJudge]?.ranking||[];
  const rawRankOf={},graspRankOf={};
  raw.forEach((li,pos)=>{rawRankOf[li]=pos+1;});
  graspRanking.forEach((li,pos)=>{graspRankOf[li]=pos+1;});

  // Strongest attackers
  const outgoing=Array.from({length:n},(_,i)=>W[i].reduce((s,v,j)=>j===i?s:s+v,0));
  const topAtk=Array.from({length:n},(_,i)=>i).sort((a,b)=>outgoing[b]-outgoing[a]).slice(0,3);

  // Most targeted
  const incoming=Array.from({length:n},(_,j)=>W.reduce((s,row,i)=>i===j?s:s+row[j],0));
  const topTarget=Array.from({length:n},(_,i)=>i).sort((a,b)=>incoming[b]-incoming[a]).slice(0,3);

  // GRASP vs RAW biggest movers (absolute delta)
  const movers=graspRanking.filter(i=>rawRankOf[i])
    .map(i=>({i,graspR:graspRankOf[i],rawR:rawRankOf[i],delta:rawRankOf[i]-graspRankOf[i]}))
    .sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta)).slice(0,3);

  function argRow(i,metaHtml) {
    const a=args[i];
    return `<div class="insight-row" onclick="selectedArg=${i};drawGraph();showArgDetail(${i})">
      <span class="rk-badge ${a.side.toLowerCase()}" style="font-size:.6rem;padding:.06rem .28rem">${a.side[0]}</span>
      <span class="insight-text" title="${a.text}">${a.text.slice(0,48)}…</span>
      <span class="insight-meta">${metaHtml}</span>
    </div>`;
  }

  el.innerHTML=`
    <div class="insight-card">
      <div class="insight-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M18 8H6"/><path d="M18 12H6"/><path d="M12 16H6"/></svg>Top Attackers</div>
      <div class="insight-items">
        ${topAtk.map(i=>argRow(i,`<span style="font-family:var(--font-mono);font-size:.65rem">${outgoing[i].toFixed(1)}</span>`)).join('')}
      </div>
    </div>
    <div class="insight-card">
      <div class="insight-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Most Targeted</div>
      <div class="insight-items">
        ${topTarget.map(i=>argRow(i,`<span style="font-family:var(--font-mono);font-size:.65rem">${incoming[i].toFixed(1)}</span>`)).join('')}
      </div>
    </div>
    <div class="insight-card">
      <div class="insight-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>GRASP vs RAW Movers</div>
      <div class="insight-items">
        ${movers.length?movers.map(({i,graspR,rawR,delta})=>{
          const cls=delta>0?'insight-delta-pos':'insight-delta-neg';
          const sign=delta>0?'↑':'↓';
          return argRow(i,`<span style="font-family:var(--font-mono);font-size:.65rem;opacity:.7">#${graspR}&#8592;#${rawR}</span><span class="${cls}">${sign}${Math.abs(delta)}</span>`);
        }).join('') : '<div class="insight-row" style="opacity:.5;grid-column:1/-1">No RAW data</div>'}
      </div>
    </div>`;
}

// ─── RANKINGS TAB ─────────────────────────────────────────────────
function renderRankings() {
  if (!DATA) return;
  const judges=Object.keys(DATA.grasp);
  if (!rkJudge||!judges.includes(rkJudge)) rkJudge=judges[0];

  // Judge toggle bar
  const bar=document.getElementById('rk-judge-bar');
  if (bar) bar.innerHTML=judges.map(j=>{
    const m=judgeMeta(j);
    return `<button class="judge-pill${j===rkJudge?' active':''}" onclick="rkJudge='${j}';renderRankings()">
      ${m.logo}<span>${m.name||m.abbr}</span>
    </button>`;
  }).join('');

  // Build rank lookups for selected judge
  const {scores,ranking}=DATA.grasp[rkJudge];
  const rawList=DATA.raw?.[rkJudge]||null;
  const rawRankOf={};
  if (rawList) rawList.forEach((li,pos)=>{rawRankOf[li]=pos+1;});
  const rawssList=RAWSS?.[rkJudge]||null;
  const rawssRankOf={};
  if (rawssList) rawssList.forEach((li,pos)=>{rawssRankOf[li]=pos+1;});

  const hasRaw=rawList&&rawList.length>0;
  const hasRawSS=rawssList&&rawssList.length>0;

  const tbody=document.getElementById('rk-tbody'); if (!tbody) return;

  // Update header cells
  const thRaw=document.getElementById('rk-th-raw');
  const thRawSS=document.getElementById('rk-th-rawss');
  if (thRaw) thRaw.style.display=hasRaw?'':'none';
  if (thRawSS) thRawSS.style.display=hasRawSS?'':'none';

  tbody.innerHTML=ranking.map((idx,rank)=>{
    const a=DATA.args[idx];
    const s=scores[idx];
    const nc=rank<3?` r${rank+1}`:'';
    const ang=ANGLE_ABBR[a.angle]||a.angle[0];
    const rawRank=rawRankOf[idx];
    const rawssRank=rawssRankOf[idx];
    const rawCell=hasRaw
      ?(rawRank!=null?`<span class="rk-rank-num">#${rawRank}</span>`:`<span class="rk-na">—</span>`)
      :'';
    const rawssCell=hasRawSS
      ?(rawssRank!=null?`<span class="rk-rank-num">#${rawssRank}</span>`:`<span class="rk-na">—</span>`)
      :'';
    const escapedText=a.text.replace(/"/g,'&quot;');
    return `<tr class="rk-row" title="${escapedText}" onclick="selectedArg=${idx};switchTab('graph');showArgDetail(${idx})">
      <td><span class="rk-num${nc}">#${rank+1}</span></td>
      ${hasRaw?`<td>${rawCell}</td>`:''}
      ${hasRawSS?`<td>${rawssCell}</td>`:''}
      <td><span class="rk-badge ${a.side.toLowerCase()}">${a.side[0]}</span></td>
      <td><span class="rk-angle">${ang}</span></td>
      <td class="rk-text-cell">${a.text.length>80?a.text.slice(0,80)+'…':a.text}</td>
      <td class="rk-score-cell">${s.toFixed(3)}</td>
    </tr>`;
  }).join('');
}

// ─── PEARSON AGREEMENT TAB ────────────────────────────────────────
function kendallTau(a,b) {
  const n=a.length; let con=0,dis=0;
  for(let i=0;i<n;i++) for(let j=i+1;j<n;j++){
    const da=a[i]-a[j],db=b[i]-b[j];
    if(da*db>0)con++; else if(da*db<0)dis++;
  }
  const tot=n*(n-1)/2; return tot?((con-dis)/tot):0;
}

function drawPearson() {
  if (!DATA) return;
  const canvas=document.getElementById('pearson-canvas'); if (!canvas) return;
  _drawPearsonMatrix(canvas,'pearson-tooltip',DATA.pearson.judges,DATA.pearson.matrix,'Pearson r');

  // RAW Kendall τ matrix
  const canvasRaw=document.getElementById('pearson-raw-canvas'); if (!canvasRaw) return;
  const judges=DATA.pearson.judges;
  const J=judges.length;
  const rawM=Array.from({length:J},()=>Array(J).fill(null));
  for(let i=0;i<J;i++) for(let k=0;k<J;k++){
    if(i===k){rawM[i][k]=1;continue;}
    const a=DATA.raw?.[judges[i]], b=DATA.raw?.[judges[k]];
    if(a&&b) rawM[i][k]=parseFloat(kendallTau(a,b).toFixed(4));
  }
  _drawPearsonMatrix(canvasRaw,'pearson-raw-tooltip',judges,rawM,'Kendall τ');

  // RAW+SS Kendall τ matrix
  const canvasRawSS=document.getElementById('pearson-rawss-canvas'); if (!canvasRawSS) return;
  const rawssM=Array.from({length:J},()=>Array(J).fill(null));
  for(let i=0;i<J;i++) for(let k=0;k<J;k++){
    if(i===k){rawssM[i][k]=1;continue;}
    const a=RAWSS?.[judges[i]], b=RAWSS?.[judges[k]];
    if(a&&b) rawssM[i][k]=parseFloat(kendallTau(a,b).toFixed(4));
  }
  _drawPearsonMatrix(canvasRawSS,'pearson-rawss-tooltip',judges,rawssM,'Kendall τ');
}

// Logo image cache for canvas drawing
const LOGO_IMG_CACHE={};
function getLogoImg(judgeName) {
  const m=judgeMeta(judgeName);
  if (LOGO_IMG_CACHE[judgeName]) return LOGO_IMG_CACHE[judgeName];
  const svg=m.logo.replace(/width="\d+"/, 'width="18"').replace(/height="\d+"/, 'height="18"');
  const img=new Image(18,18);
  img.src='data:image/svg+xml,'+encodeURIComponent(svg);
  LOGO_IMG_CACHE[judgeName]=img;
  return img;
}

function _drawPearsonMatrix(canvas,tipId,judges,matrix,labelOverride) {
  const J=judges.length;
  const dpr=window.devicePixelRatio||1;
  const avail=getCanvasAvailWidth(canvas,400);
  const CELL=Math.max(50,Math.floor((avail-70)/J));
  const PAD=38; // left/top padding for labels (logos)
  const total=PAD+CELL*J+6;
  canvas.width=total*dpr; canvas.height=total*dpr;
  canvas.style.width=total+'px'; canvas.style.height=total+'px';
  const ctx=canvas.getContext('2d');
  ctx.scale(dpr,dpr);
  ctx.fillStyle=canvasBg(); ctx.fillRect(0,0,total,total);

  // Draw lower-triangular cells (i >= k)
  for (let i=0;i<J;i++) for (let k=0;k<J;k++) {
    if (k>i) continue; // upper triangle — leave blank
    const v=matrix[i][k];
    const isDiag=i===k;
    const isNull=v==null&&!isDiag;
    let [r,g,b]=isDiag?(isDark()?[35,35,55]:[210,210,210]):isNull?(isDark()?[28,28,40]:[235,235,235]):heatRGB(v);
    ctx.fillStyle=`rgb(${r},${g},${b})`;
    ctx.fillRect(PAD+k*CELL,PAD+i*CELL,CELL-2,CELL-2);
    const lum=r*0.299+g*0.587+b*0.114;
    ctx.fillStyle=isNull?(isDark()?'#444':'#aaa'):(lum>100?'#0d0d14':'#e8e8f2');
    ctx.font='bold '+(CELL>58?'12':'10')+'px Inter,sans-serif'; ctx.textAlign='center';
    ctx.fillText(isDiag?'—':isNull?'N/A':v.toFixed(2),PAD+k*CELL+CELL/2,PAD+i*CELL+CELL/2+4);
  }

  // Row + column logos
  judges.forEach((j,i)=>{
    const img=getLogoImg(j);
    const m=judgeMeta(j);
    // Row label (left): logo centered vertically in row
    const ry=PAD+i*CELL+CELL/2-9;
    if (img.complete && img.naturalWidth>0) ctx.drawImage(img,PAD-32,ry,18,18);
    else { // fallback pip
      ctx.fillStyle=m.pip; ctx.beginPath();
      ctx.arc(PAD-22,PAD+i*CELL+CELL/2,5,0,Math.PI*2); ctx.fill();
    }
    // Col label (top): logo, only for columns that appear in lower triangle (col i has i+1 rows)
    const cx=PAD+i*CELL+CELL/2-9;
    if (img.complete && img.naturalWidth>0) ctx.drawImage(img,cx,PAD-32,18,18);
    else {
      ctx.fillStyle=m.pip; ctx.beginPath();
      ctx.arc(PAD+i*CELL+CELL/2,PAD-22,5,0,Math.PI*2); ctx.fill();
    }
  });

  const tip_el=document.getElementById(tipId);
  const lbl=labelOverride||'Pearson r';
  canvas.onmousemove=e=>{
    const rect=canvas.getBoundingClientRect();
    const ci=Math.floor((e.clientY-rect.top-PAD)/CELL);
    const cj=Math.floor((e.clientX-rect.left-PAD)/CELL);
    if(ci<0||cj<0||ci>=J||cj>=J||cj>ci){hideTip(tip_el);return;}
    tip(tip_el,`<strong>${judges[ci]}</strong> vs <strong>${judges[cj]}</strong><br/>${lbl} = ${matrix[ci][cj]!=null?matrix[ci][cj].toFixed(4):'—'}`,e);
  };
  canvas.onmouseleave=()=>hideTip(tip_el);

  // Redraw after logos load (they may be async)
  judges.forEach(j=>{
    const img=getLogoImg(j);
    if (!img.complete) img.onload=()=>_drawPearsonMatrix(canvas,tipId,judges,matrix,labelOverride);
  });
}

// ─── RANK DYNAMICS TAB ────────────────────────────────────────────
function drawDynamics() {
  if (!DATA||!activeJudge) return;
  const canvas=document.getElementById('dynamics-canvas'); if (!canvas) return;
  const res=DATA.grasp[activeJudge];
  if (!res||!res.history) return;
  const {history,ranking}=res;
  const n=DATA.args.length,T=Math.min(history.length,11);

  const rankMat=history.map(snap=>{
    const sorted=snap.map((s,i)=>({i,s})).sort((a,b)=>b.s-a.s);
    const r=Array(n); sorted.forEach(({i},pos)=>{r[i]=pos+1;}); return r;
  });

  let showIdxs;
  if (dynFilter==='volatile') {
    const sw=Array.from({length:n},(_,i)=>Math.abs(rankMat[T-1][i]-rankMat[0][i]));
    showIdxs=sw.map((_,i)=>i).sort((a,b)=>sw[b]-sw[a]).slice(0,8);
  } else if (dynFilter==='top5') showIdxs=ranking.slice(0,8);
  else if (dynFilter==='pro') showIdxs=ranking.filter(i=>DATA.args[i].side==='Pro').slice(0,8);
  else showIdxs=ranking.filter(i=>DATA.args[i].side==='Con').slice(0,8);

  const dpr=window.devicePixelRatio||1;
  const cw=getCanvasAvailWidth(canvas,800),ch=300;
  canvas.width=cw*dpr; canvas.height=ch*dpr;
  canvas.style.height=ch+'px';
  const ctx=canvas.getContext('2d');
  ctx.scale(dpr,dpr);
  const PAD={top:18,right:26,bottom:36,left:40};
  const gw=cw-PAD.left-PAD.right,gh=ch-PAD.top-PAD.bottom;
  ctx.fillStyle=canvasBg(); ctx.fillRect(0,0,cw,ch);
  ctx.strokeStyle=borderClr(); ctx.lineWidth=1;
  for (let t=1;t<=4;t++) {
    const yy=PAD.top+gh*t/4;
    ctx.beginPath();ctx.moveTo(PAD.left,yy);ctx.lineTo(PAD.left+gw,yy);ctx.stroke();
  }
  ctx.fillStyle=mutedClr();
  ctx.font='10px JetBrains Mono,monospace'; ctx.textAlign='right';
  for (const tick of [1,Math.round(n/4),Math.round(n/2),Math.round(3*n/4),n]) {
    const yy=PAD.top+(tick-1)/(n-1)*gh;
    ctx.fillText(tick,PAD.left-4,yy+4);
  }
  ctx.font='11px Inter,sans-serif'; ctx.textAlign='center';
  ctx.fillText('Iteration',PAD.left+gw/2,ch-4);
  ctx.save();ctx.translate(10,PAD.top+gh/2);ctx.rotate(-Math.PI/2);
  ctx.fillText('Rank (1 = best)',0,0);ctx.restore();

  showIdxs.forEach((argIdx,ci)=>{
    const color=PALETTE[ci%PALETTE.length];
    ctx.beginPath(); ctx.strokeStyle=color; ctx.lineWidth=2;
    ctx.setLineDash(DATA.args[argIdx].side==='Con'?[5,3]:[]);
    for (let t=0;t<T;t++) {
      const px=PAD.left+(t/(T-1))*gw;
      const py=PAD.top+(rankMat[t][argIdx]-1)/(n-1)*gh;
      t===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke(); ctx.setLineDash([]);
  });

  const legEl=document.getElementById('dynamics-legend');
  if (legEl) legEl.innerHTML=showIdxs.map((argIdx,ci)=>{
    const a=DATA.args[argIdx],color=PALETTE[ci%PALETTE.length];
    const dRank=rankMat[0][argIdx]-rankMat[T-1][argIdx];
    const dStr=(dRank>0?'+':'')+dRank;
    return `<div class="dyn-legend-item">
      <div class="dyn-legend-swatch" style="background:${color}"></div>
      <span><strong>${a.side[0]}·${ANGLE_ABBR[a.angle]||a.angle[0]}</strong> Δ${dStr}→#${rankMat[T-1][argIdx]}: ${a.text.slice(0,50)}…</span>
    </div>`;
  }).join('');
}

function filterDynamics(btn,val) {
  btn.parentElement.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); dynFilter=val; setTimeout(drawDynamics,20);
}

// ─── AGGREGATE PEARSON (Figure 1 teaser) ─────────────────────────
function drawAggPearson() {
  if (!AGG) return;
  const canvas=document.getElementById('agg-pearson-canvas'); if (!canvas) return;
  _drawPearsonMatrix(canvas,'agg-pearson-tooltip',AGG.judges,AGG.pearson_pool,'Pearson r');

  // Populate logo legend below figure
  const leg=document.getElementById('pearson-logo-legend'); if (!leg) return;
  const JUDGE_FULL={'GPT-5.2':'GPT-5.2 (OpenAI)','Claude Haiku 4.5':'Claude Haiku 4.5 (Anthropic)',
    'Gemini 3 Flash':'Gemini 3 Flash (Google)','LLaMA 4 Scout':'LLaMA 4 Scout (Meta)',
    'Deepseek V3.2':'DeepSeek V3.2','Mimo V2 Flash':'Mimo V2 Flash (Xiaomi)'};
  leg.innerHTML=AGG.judges.map(j=>{
    const m=judgeMeta(j);
    return `<span class="pearson-logo-legend-item">${m.logo}<span>${JUDGE_FULL[j]||j}</span></span>`;
  }).join('');
}

// ─── SCATTER PLOT (Figures 2 & 4) ────────────────────────────────
function drawScatter(canvasId,tipId) {
  if (!AGG) return;
  const canvas=document.getElementById(canvasId); if (!canvas) return;
  const dpr=window.devicePixelRatio||1;
  const pw=getCanvasAvailWidth(canvas,380);
  const ph=Math.round(pw*0.72);
  canvas.width=pw*dpr; canvas.height=ph*dpr;
  canvas.style.width=pw+'px'; canvas.style.height=ph+'px';
  const ctx=canvas.getContext('2d');
  ctx.scale(dpr,dpr);
  ctx.fillStyle=canvasBg(); ctx.fillRect(0,0,pw,ph);

  const PAD={top:18,right:18,bottom:46,left:48};
  const gw=pw-PAD.left-PAD.right,gh=ph-PAD.top-PAD.bottom;

  const pts_grasp=AGG.scatter;

  // X range
  const allX=pts_grasp.map(p=>p.mean_pearson);
  const xMin=Math.min(...allX)-0.02,xMax=Math.max(...allX)+0.02;
  const yMin=0,yMax=0.85;
  const xS=v=>PAD.left+(v-xMin)/(xMax-xMin)*gw;
  const yS=v=>PAD.top+gh-(v-yMin)/(yMax-yMin)*gh;

  // Grid
  ctx.strokeStyle=borderClr(); ctx.lineWidth=1;
  for (let t=0;t<=4;t++) {
    const yy=PAD.top+gh*t/4;
    ctx.beginPath();ctx.moveTo(PAD.left,yy);ctx.lineTo(PAD.left+gw,yy);ctx.stroke();
    const v=(yMax*(4-t)/4).toFixed(2);
    ctx.fillStyle=mutedClr(); ctx.font='9px JetBrains Mono,monospace'; ctx.textAlign='right';
    ctx.fillText(v,PAD.left-3,yy+3);
  }
  for (let t=0;t<=4;t++) {
    const xx=PAD.left+gw*t/4;
    ctx.beginPath();ctx.moveTo(xx,PAD.top);ctx.lineTo(xx,PAD.top+gh);ctx.stroke();
    const v=(xMin+(xMax-xMin)*t/4).toFixed(2);
    ctx.fillStyle=mutedClr(); ctx.font='9px JetBrains Mono,monospace'; ctx.textAlign='center';
    ctx.fillText(v,xx,PAD.top+gh+12);
  }

  // Axis labels
  ctx.fillStyle=mutedClr(); ctx.font='10px Inter,sans-serif'; ctx.textAlign='center';
  ctx.fillText('Mean Pearson r (W matrices)',PAD.left+gw/2,ph-4);
  ctx.save();ctx.translate(11,PAD.top+gh/2);ctx.rotate(-Math.PI/2);
  ctx.fillText('Mean Kendall τ (GRASP)',0,0);ctx.restore();

  // Regression line for GRASP
  const gN=pts_grasp.length;
  const gXm=pts_grasp.reduce((s,p)=>s+p.mean_pearson,0)/gN;
  const gYm=pts_grasp.reduce((s,p)=>s+p.mean_tau_grasp,0)/gN;
  const gNum=pts_grasp.reduce((s,p)=>s+(p.mean_pearson-gXm)*(p.mean_tau_grasp-gYm),0);
  const gDen=pts_grasp.reduce((s,p)=>s+(p.mean_pearson-gXm)**2,0);
  const gSlope=gDen?gNum/gDen:0,gIntercept=gYm-gSlope*gXm;
  ctx.beginPath();
  ctx.moveTo(xS(xMin),yS(gSlope*xMin+gIntercept));
  ctx.lineTo(xS(xMax),yS(gSlope*xMax+gIntercept));
  ctx.strokeStyle='rgba(37,99,235,0.35)'; ctx.lineWidth=1.5; ctx.setLineDash([4,3]);
  ctx.stroke(); ctx.setLineDash([]);

  // Points: GRASP (blue)
  pts_grasp.forEach(p=>{
    ctx.beginPath(); ctx.arc(xS(p.mean_pearson),yS(p.mean_tau_grasp),4.5,0,Math.PI*2);
    ctx.fillStyle='rgba(37,99,235,0.72)'; ctx.fill();
  });

  // Hover
  const tip_el=document.getElementById(tipId);
  canvas.onmousemove=e=>{
    const rect=canvas.getBoundingClientRect();
    const mx=e.clientX-rect.left,my=e.clientY-rect.top;
    let closest=null,minD=Infinity;
    pts_grasp.forEach(p=>{
      const d=Math.hypot(mx-xS(p.mean_pearson),my-yS(p.mean_tau_grasp));
      if (d<minD){minD=d;closest=p;}
    });
    if (closest&&minD<15)
      tip(tip_el,`<strong>${closest.id}</strong><br/>Pearson r = ${closest.mean_pearson.toFixed(3)}<br/>GRASP τ = ${closest.mean_tau_grasp.toFixed(3)}`,e);
    else hideTip(tip_el);
  };
  canvas.onmouseleave=()=>hideTip(tip_el);
}

// ─── DENSITY vs ITERS SCATTER (Convergence Figure) ───────────────
function drawDensityIters() {
  if (!AGG||!AGG.density_iters) return;
  const canvas=document.getElementById('density-iters-canvas'); if (!canvas) return;
  const dpr=window.devicePixelRatio||1;
  const pw=getCanvasAvailWidth(canvas,380);
  const ph=Math.round(pw*0.68);
  canvas.width=pw*dpr; canvas.height=ph*dpr;
  canvas.style.width=pw+'px'; canvas.style.height=ph+'px';
  const ctx=canvas.getContext('2d');
  ctx.scale(dpr,dpr);
  ctx.fillStyle=canvasBg(); ctx.fillRect(0,0,pw,ph);

  const data=AGG.density_iters;
  const judges=AGG.judges;
  const PAD={top:18,right:80,bottom:46,left:44};
  const gw=pw-PAD.left-PAD.right,gh=ph-PAD.top-PAD.bottom;

  const allX=data.map(d=>d.density);
  const allY=data.map(d=>d.iters);
  const xMin=Math.max(0,Math.min(...allX)-0.03),xMax=Math.min(1,Math.max(...allX)+0.03);
  const yMin=Math.max(0,Math.min(...allY)-1),yMax=Math.max(...allY)+1;
  const xS=v=>PAD.left+(v-xMin)/(xMax-xMin)*gw;
  const yS=v=>PAD.top+gh-(v-yMin)/(yMax-yMin)*gh;

  // Grid
  ctx.strokeStyle=borderClr(); ctx.lineWidth=1;
  for (let t=0;t<=4;t++) {
    const yy=PAD.top+gh*t/4;
    ctx.beginPath();ctx.moveTo(PAD.left,yy);ctx.lineTo(PAD.left+gw,yy);ctx.stroke();
    const v=Math.round(yMax-(yMax-yMin)*t/4);
    ctx.fillStyle=mutedClr(); ctx.font='9px JetBrains Mono,monospace'; ctx.textAlign='right';
    ctx.fillText(v,PAD.left-3,yy+3);
  }
  for (let t=0;t<=4;t++) {
    const xx=PAD.left+gw*t/4;
    ctx.beginPath();ctx.moveTo(xx,PAD.top);ctx.lineTo(xx,PAD.top+gh);ctx.stroke();
    const v=(xMin+(xMax-xMin)*t/4).toFixed(2);
    ctx.fillStyle=mutedClr(); ctx.font='9px JetBrains Mono,monospace'; ctx.textAlign='center';
    ctx.fillText(v,xx,PAD.top+gh+12);
  }

  // Axis labels
  ctx.fillStyle=mutedClr(); ctx.font='10px Inter,sans-serif'; ctx.textAlign='center';
  ctx.fillText('W matrix density',PAD.left+gw/2,ph-4);
  ctx.save();ctx.translate(11,PAD.top+gh/2);ctx.rotate(-Math.PI/2);
  ctx.fillText('Iterations to converge',0,0);ctx.restore();

  // Points + regression per judge
  judges.forEach((j,ji)=>{
    const m=judgeMeta(j);
    const pts=data.filter(d=>d.judge===j);
    // Regression
    const n=pts.length;
    if (n<2) return;
    const mx=pts.reduce((s,p)=>s+p.density,0)/n;
    const my=pts.reduce((s,p)=>s+p.iters,0)/n;
    const num=pts.reduce((s,p)=>s+(p.density-mx)*(p.iters-my),0);
    const den=pts.reduce((s,p)=>s+(p.density-mx)**2,0);
    const slope=den?num/den:0,intercept=my-slope*mx;
    ctx.beginPath();
    ctx.moveTo(xS(xMin),yS(slope*xMin+intercept));
    ctx.lineTo(xS(xMax),yS(slope*xMax+intercept));
    ctx.strokeStyle=m.pip; ctx.lineWidth=1; ctx.setLineDash([3,2]); ctx.stroke();
    ctx.setLineDash([]);
    // Points
    pts.forEach(p=>{
      ctx.beginPath(); ctx.arc(xS(p.density),yS(p.iters),3.5,0,Math.PI*2);
      ctx.fillStyle=m.pip+'cc'; ctx.fill();
    });
  });

  // Legend (right side) — brand logos
  judges.forEach((j,ji)=>{
    const m=judgeMeta(j);
    const lx=PAD.left+gw+4,ly=PAD.top+ji*20+2;
    const img=getLogoImg(j);
    if (img.complete && img.naturalWidth>0) {
      ctx.drawImage(img,lx,ly,14,14);
    } else {
      ctx.fillStyle=m.pip; ctx.beginPath();
      ctx.arc(lx+7,ly+7,4,0,Math.PI*2); ctx.fill();
      img.onload=()=>drawDensityIters();
    }
  });

  // Tooltip
  const tip_el=document.getElementById('density-iters-tooltip');
  canvas.onmousemove=e=>{
    const rect=canvas.getBoundingClientRect();
    const mx=e.clientX-rect.left,my=e.clientY-rect.top;
    let closest=null,minD=Infinity;
    data.forEach(p=>{
      const d=Math.hypot(mx-xS(p.density),my-yS(p.iters));
      if (d<minD){minD=d;closest=p;}
    });
    if (closest&&minD<14) {
      const m=judgeMeta(closest.judge);
      tip(tip_el,`<strong>${closest.id}</strong> · ${closest.judge}<br/>Density = ${closest.density.toFixed(3)}<br/>Iters = ${closest.iters}<br/>α_eff = ${closest.alpha.toFixed(4)}`,e);
    } else hideTip(tip_el);
  };
  canvas.onmouseleave=()=>hideTip(tip_el);
}

// ─── MINI GRAPHS (Figure 3) ───────────────────────────────────────
const MINI_DEBATES=['pool_000','pool_001','pool_002','pool_003'];
const miniDataCache={};

async function drawMiniGraphs() {
  for (let k=0;k<4;k++) {
    const id=MINI_DEBATES[k];
    if (!miniDataCache[id]) {
      try { miniDataCache[id]=await fetch(`static/debates/${id}.json`).then(r=>r.json()); }
      catch(e) { continue; }
    }
    drawMiniGraph(k,miniDataCache[id]);
  }
}

let miniLayouts={};
function drawMiniGraph(k,d) {
  const canvas=document.getElementById(`mg${k}`); if (!canvas) return;
  const labelEl=document.getElementById(`mg${k}-label`);
  const judge='GPT-5.2';
  const W=d.judges[judge];
  if (!W){return;}
  const n=W.length;
  const TAU_MINI=0.6;
  const pw=getCanvasAvailWidth(canvas,160);
  const ph=Math.round(pw*0.75);

  const dpr=window.devicePixelRatio||1;
  canvas.width=pw*dpr; canvas.height=ph*dpr;
  canvas.style.width=pw+'px'; canvas.style.height=ph+'px';
  const ctx=canvas.getContext('2d');
  ctx.scale(dpr,dpr);
  ctx.fillStyle=canvasBg(); ctx.fillRect(0,0,pw,ph);

  if (!miniLayouts[d.debate_id]) {
    const le=[];
    for (let i=0;i<n;i++) for (let j=i+1;j<n;j++) {
      const w=Math.max(W[i][j],W[j][i]);
      if (w>0.3) le.push([i,j,w]);
    }
    miniLayouts[d.debate_id]=forceLayout(n,le,{seed:42,iters:200,W_area:1.5});
  }
  const {x,y}=miniLayouts[d.debate_id];
  const scores=d.grasp[judge]?.scores||Array(n).fill(1);
  const maxS=Math.max(...scores),minS=Math.min(...scores);

  const PAD=10,gw=pw-PAD*2,gh=ph-PAD*2;
  const xmin=Math.min(...x),xmax=Math.max(...x),ymin=Math.min(...y),ymax=Math.max(...y);
  const xr=xmax-xmin||1,yr=ymax-ymin||1;
  const cx_=i=>PAD+(x[i]-xmin)/xr*gw;
  const cy_=i=>PAD+(y[i]-ymin)/yr*gh;
  const nr=i=>2+(scores[i]-minS)/(maxS-minS||1)*4;

  // Edges
  for (let i=0;i<n;i++) for (let j=0;j<n;j++) {
    if (i===j||W[i][j]<=TAU_MINI) continue;
    const t=(W[i][j]-TAU_MINI)/(1-TAU_MINI+0.001);
    const alpha=0.10+t*0.45;
    const g=Math.round(40+(1-t)*70);
    ctx.strokeStyle=`rgba(200,${g},20,${alpha})`;
    ctx.lineWidth=0.5+t*1;
    ctx.beginPath();ctx.moveTo(cx_(i),cy_(i));ctx.lineTo(cx_(j),cy_(j));ctx.stroke();
  }

  // Nodes
  for (let i=0;i<n;i++) {
    const r=nr(i);
    ctx.beginPath();ctx.arc(cx_(i),cy_(i),r,0,Math.PI*2);
    ctx.fillStyle=d.args[i].side==='Pro'?proClr():conClr();
    ctx.fill();
  }

  if (labelEl) {
    const short=d.motion.replace(/^This House (would|believes that) /i,'').slice(0,35);
    labelEl.textContent=d.debate_id+': '+short+'…';
  }
}

// ─── TOY GRASP DIAGRAM — fully interactive ────────────────────────
const NODE_SUBS=['₁','₂','₃','₄','₅','₆','₇','₈','₉','₁₀'];

let toyNodes=[
  {label:'a₁',side:'Pro',x:0.25,y:0.28},
  {label:'a₂',side:'Con',x:0.75,y:0.28},
  {label:'a₃',side:'Pro',x:0.75,y:0.72},
  {label:'a₄',side:'Con',x:0.25,y:0.72},
];
let toyEdges=[
  {from:1,to:0,w:0.75},
  {from:1,to:2,w:0.60},
  {from:2,to:3,w:0.80},
  {from:2,to:0,w:0.40},
];
let toySelected=null;
let toyDrag=null;        // {fromIdx, curX, curY, moved}
let toyNodeCounter=5;

function toyBuildW() {
  const n=toyNodes.length;
  const W=Array.from({length:n},()=>Array(n).fill(0));
  toyEdges.forEach(e=>{if(e.from<n&&e.to<n)W[e.from][e.to]=e.w;});
  return W;
}

function toyNodeRadius(scores,i) {
  const maxS=Math.max(...scores,1),minS=Math.min(...scores,1);
  return 15+(scores[i]-minS)/(maxS-minS||1)*9;
}

function toyCanvasCoord(canvas,node) {
  const rect=canvas.getBoundingClientRect();
  const pw=rect.width||340,ph=rect.height||270;
  const PAD=28;
  return {cx:PAD+node.x*(pw-PAD*2),cy:PAD+node.y*(ph-PAD*2)};
}

function toyHitNode(mx,my,canvas,scores) {
  const rect=canvas.getBoundingClientRect();
  const pw=rect.width||340,ph=rect.height||270;
  const PAD=28;
  for(let i=0;i<toyNodes.length;i++){
    const cx=PAD+toyNodes[i].x*(pw-PAD*2);
    const cy=PAD+toyNodes[i].y*(ph-PAD*2);
    const r=scores?toyNodeRadius(scores,i):16;
    if(Math.hypot(mx-cx,my-cy)<r+5) return i;
  }
  return -1;
}

function updateToy() {
  const taEl=document.getElementById('talpha');
  const tvEl=document.getElementById('tvalpha');
  if(taEl&&tvEl) tvEl.textContent=parseFloat(taEl.value).toFixed(2);
  const ewEl=document.getElementById('toy-edge-w');
  const ewvEl=document.getElementById('toy-edge-w-val');
  if(ewEl&&ewvEl) ewvEl.textContent=parseFloat(ewEl.value).toFixed(2);
  drawToyGRASP();
}

function drawToyGRASP() {
  const canvas=document.getElementById('toy-canvas'); if(!canvas) return;
  const n=toyNodes.length;
  if(n===0){
    const ctx=canvas.getContext('2d');
    ctx.fillStyle=canvasBg(); ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle=mutedClr(); ctx.font='13px Inter,sans-serif'; ctx.textAlign='center';
    ctx.fillText('Click canvas to add arguments',canvas.width/2/(window.devicePixelRatio||1),canvas.height/2/(window.devicePixelRatio||1));
    return;
  }
  const W=toyBuildW();
  const alpha=parseFloat(document.getElementById('talpha')?.value||0.15);
  const {scores,history}=runGRASP(W,{alpha,beta:0.6,gamma:0.9,maxIter:10});

  const dpr=window.devicePixelRatio||1;
  const pw=getCanvasAvailWidth(canvas,340);
  const ph=270;
  canvas.width=pw*dpr; canvas.height=ph*dpr;
  canvas.style.width=pw+'px'; canvas.style.height=ph+'px';
  const ctx=canvas.getContext('2d');
  ctx.scale(dpr,dpr);
  ctx.fillStyle=canvasBg(); ctx.fillRect(0,0,pw,ph);

  const PAD=28,gw=pw-PAD*2,gh=ph-PAD*2;
  const cx_=i=>PAD+toyNodes[i].x*gw;
  const cy_=i=>PAD+toyNodes[i].y*gh;
  const nr=i=>toyNodeRadius(scores,i);

  // Defense edges (blue dashed, D=W²)
  const D=W.map((row,i)=>W.map((_,j)=>W[i].reduce((s,_,k)=>s+W[i][k]*W[k][j],0)));
  ctx.setLineDash([5,4]);
  for(let k=0;k<n;k++) for(let j=0;j<n;j++){
    if(k===j||D[k][j]<=0.06) continue;
    const offX=(cy_(j)-cy_(k))*0.07,offY=(cx_(k)-cx_(j))*0.07;
    ctx.strokeStyle=`rgba(37,99,235,${0.08+D[k][j]*0.45})`;
    ctx.lineWidth=0.8+D[k][j]*1.2;
    ctx.beginPath(); ctx.moveTo(cx_(k)+offX,cy_(k)+offY);
    ctx.lineTo(cx_(j)+offX,cy_(j)+offY); ctx.stroke();
  }
  ctx.setLineDash([]);

  // Attack edges (red)
  for(let i=0;i<n;i++) for(let j=0;j<n;j++){
    if(W[i][j]<=0) continue;
    drawArrow(ctx,cx_(i),cy_(i),cx_(j),cy_(j),nr(j)+2,
      `rgba(210,38,28,${0.18+W[i][j]*0.72})`,0.8+W[i][j]*2.2,4+W[i][j]*2);
  }

  // Drag-edge preview
  if(toyDrag&&toyDrag.moved){
    ctx.setLineDash([6,4]);
    ctx.strokeStyle='rgba(120,120,200,0.6)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(cx_(toyDrag.fromIdx),cy_(toyDrag.fromIdx));
    ctx.lineTo(toyDrag.curX,toyDrag.curY); ctx.stroke();
    ctx.setLineDash([]);
  }

  // Nodes
  for(let i=0;i<n;i++){
    const r=nr(i);
    ctx.beginPath(); ctx.arc(cx_(i),cy_(i),r,0,Math.PI*2);
    ctx.fillStyle=toyNodes[i].side==='Pro'?proClr():conClr();
    ctx.fill();
    if(i===toySelected){
      ctx.strokeStyle=isDark()?'rgba(255,255,180,.9)':'rgba(26,26,200,.8)';
      ctx.lineWidth=2.5;
    } else {
      ctx.strokeStyle='rgba(255,255,255,0.75)'; ctx.lineWidth=1.5;
    }
    ctx.stroke();
    ctx.fillStyle=textClr(); ctx.font=`bold 11px Inter,sans-serif`; ctx.textAlign='center';
    ctx.fillText(toyNodes[i].label,cx_(i),cy_(i)+4);
    ctx.font='8.5px JetBrains Mono,monospace'; ctx.fillStyle=mutedClr();
    ctx.fillText(scores[i].toFixed(3),cx_(i),cy_(i)+r+11);
  }

  // Ranking readout
  const ranking=[...Array(n).keys()].sort((a,b)=>scores[b]-scores[a]);
  ctx.font='bold 9.5px Inter,sans-serif'; ctx.textAlign='left'; ctx.fillStyle=mutedClr();
  ctx.fillText('Rank: '+ranking.map((i,r)=>`#${r+1}=${toyNodes[i].label}`).join(' '),6,ph-6);

  drawConvChart(history,n);
}

function drawConvChart(history,n) {
  const canvas=document.getElementById('conv-canvas'); if(!canvas||!history.length||n<2) return;
  const pw=getCanvasAvailWidth(canvas,340),ph=140;
  const dpr=window.devicePixelRatio||1;
  canvas.width=pw*dpr; canvas.height=ph*dpr;
  canvas.style.width=pw+'px'; canvas.style.height=ph+'px';
  const ctx=canvas.getContext('2d');
  ctx.scale(dpr,dpr);
  ctx.fillStyle=canvasBg(); ctx.fillRect(0,0,pw,ph);
  const PAD={top:12,right:28,bottom:28,left:36};
  const gw=pw-PAD.left-PAD.right,gh=ph-PAD.top-PAD.bottom;
  const T=history.length;

  const rankMat=history.map(snap=>{
    const s=snap.map((v,i)=>({i,v})).sort((a,b)=>b.v-a.v);
    const r=Array(n); s.forEach(({i},pos)=>{r[i]=pos+1;}); return r;
  });

  ctx.strokeStyle=borderClr();ctx.lineWidth=1;
  for(let t=0;t<n;t++){
    const yy=PAD.top+gh*t/(n-1||1);
    ctx.beginPath();ctx.moveTo(PAD.left,yy);ctx.lineTo(PAD.left+gw,yy);ctx.stroke();
    ctx.fillStyle=mutedClr();ctx.font='9px JetBrains Mono,monospace';ctx.textAlign='right';
    ctx.fillText('#'+(t+1),PAD.left-3,yy+3);
  }
  ctx.fillStyle=mutedClr();ctx.font='9.5px Inter,sans-serif';ctx.textAlign='center';
  ctx.fillText('Iteration',PAD.left+gw/2,ph-4);

  const colors=[proClr(),conClr(),'rgba(22,163,74,.85)','rgba(202,138,4,.9)','rgba(147,51,234,.85)','rgba(8,145,178,.85)','rgba(219,39,119,.85)','rgba(217,119,6,.85)'];
  for(let i=0;i<n;i++){
    ctx.beginPath();ctx.strokeStyle=colors[i%colors.length];ctx.lineWidth=1.8;
    for(let t=0;t<T;t++){
      const px=PAD.left+(t/(T-1||1))*gw;
      const py=PAD.top+(rankMat[t][i]-1)/(n-1||1)*gh;
      t===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();
    const lastRank=rankMat[T-1][i];
    ctx.fillStyle=colors[i%colors.length];
    ctx.font='bold 8px Inter,sans-serif';ctx.textAlign='left';
    ctx.fillText(toyNodes[i].label,PAD.left+gw+2,PAD.top+(lastRank-1)/(n-1||1)*gh+3);
  }
}

// ── Toy canvas interaction ────────────────────────────────────────
function initToyCanvas() {
  const canvas=document.getElementById('toy-canvas'); if(!canvas) return;

  canvas.addEventListener('mousedown',e=>{
    e.preventDefault();
    const rect=canvas.getBoundingClientRect();
    const mx=e.clientX-rect.left, my=e.clientY-rect.top;
    const W=toyBuildW();
    const n=toyNodes.length;
    const scores=n>0?runGRASP(W,{alpha:0.15}).scores:[];
    const hit=toyHitNode(mx,my,canvas,scores);
    if(hit>=0){
      toySelected=hit; toyDrag={fromIdx:hit,curX:mx,curY:my,moved:false};
      const delBtn=document.getElementById('toy-delete-btn');
      if(delBtn) delBtn.style.display='';
    } else {
      toySelected=null;
      const delBtn=document.getElementById('toy-delete-btn');
      if(delBtn) delBtn.style.display='none';
      updateToy();
    }
  });

  canvas.addEventListener('mousemove',e=>{
    if(!toyDrag) return;
    const rect=canvas.getBoundingClientRect();
    toyDrag.curX=e.clientX-rect.left;
    toyDrag.curY=e.clientY-rect.top;
    toyDrag.moved=true;
    drawToyGRASP();
  });

  canvas.addEventListener('mouseup',e=>{
    if(!toyDrag){return;}
    if(toyDrag.moved){
      const rect=canvas.getBoundingClientRect();
      const mx=e.clientX-rect.left,my=e.clientY-rect.top;
      const W=toyBuildW();
      const scores=toyNodes.length>0?runGRASP(W,{alpha:0.15}).scores:[];
      const hit=toyHitNode(mx,my,canvas,scores);
      if(hit>=0&&hit!==toyDrag.fromIdx){
        const w=parseFloat(document.getElementById('toy-edge-w')?.value||0.7);
        const ex=toyEdges.find(e=>e.from===toyDrag.fromIdx&&e.to===hit);
        if(ex) ex.w=w; else toyEdges.push({from:toyDrag.fromIdx,to:hit,w});
      }
    }
    toyDrag=null;
    updateToy();
  });

  canvas.addEventListener('dblclick',e=>{
    const rect=canvas.getBoundingClientRect();
    const mx=e.clientX-rect.left,my=e.clientY-rect.top;
    const W=toyBuildW();
    const scores=toyNodes.length>0?runGRASP(W,{alpha:0.15}).scores:[];
    const hit=toyHitNode(mx,my,canvas,scores);
    if(hit>=0) toyDeleteNode(hit);
  });

  document.addEventListener('keydown',e=>{
    if((e.key==='Delete'||e.key==='Backspace')&&toySelected!==null&&document.activeElement.tagName!=='INPUT'){
      e.preventDefault(); toyDeleteNode(toySelected);
    }
  });
}

function toyDeleteNode(idx) {
  toyNodes.splice(idx,1);
  toyEdges=toyEdges.filter(e=>e.from!==idx&&e.to!==idx)
    .map(e=>({from:e.from>idx?e.from-1:e.from,to:e.to>idx?e.to-1:e.to,w:e.w}));
  if(toySelected===idx) toySelected=null;
  else if(toySelected>idx) toySelected--;
  const delBtn=document.getElementById('toy-delete-btn');
  if(delBtn) delBtn.style.display=toySelected!==null?'':'none';
  updateToy();
}

function toyDeleteSelected() { if(toySelected!==null) toyDeleteNode(toySelected); }

function toyAddNode() {
  const angle=(toyNodeCounter*137.5)*Math.PI/180;
  const x=0.5+0.32*Math.cos(angle),y=0.5+0.32*Math.sin(angle);
  const sub=NODE_SUBS[toyNodeCounter-1]||String(toyNodeCounter);
  toyNodes.push({label:'a'+sub,side:toyNodeCounter%2===0?'Con':'Pro',
    x:Math.max(0.05,Math.min(0.95,x)),y:Math.max(0.05,Math.min(0.95,y))});
  toyNodeCounter++;
  updateToy();
}

function toyRandomDAG() {
  const rng=seededRng(Date.now()^0xbeef);
  const n=4+Math.floor(rng()*3); // 4-6 nodes
  toyNodes=[]; toyEdges=[]; toyNodeCounter=1;
  for(let i=0;i<n;i++){
    const angle=(i/n)*Math.PI*2;
    const sub=NODE_SUBS[i]||String(i+1);
    toyNodes.push({label:'a'+sub,side:i%2===0?'Pro':'Con',
      x:Math.max(0.1,Math.min(0.9,0.5+0.36*Math.cos(angle))),
      y:Math.max(0.1,Math.min(0.9,0.5+0.36*Math.sin(angle)))});
    toyNodeCounter++;
  }
  // Guarantee a spanning-path so graph is always connected
  const perm=[...Array(n).keys()].sort(()=>rng()-0.5);
  for(let k=0;k<n-1;k++){
    const w=parseFloat((0.35+rng()*0.55).toFixed(2));
    if(rng()<0.5) toyEdges.push({from:perm[k],to:perm[k+1],w});
    else          toyEdges.push({from:perm[k+1],to:perm[k],w});
  }
  // Add extra edges to reach ~50% density (target: ceil(n*(n-1)/2 * 0.5))
  const maxExtra=Math.floor(n*(n-1)/4);
  const pairs=[];
  for(let i=0;i<n;i++) for(let j=0;j<n;j++) if(i!==j&&!toyEdges.some(e=>e.from===i&&e.to===j)) pairs.push([i,j]);
  pairs.sort(()=>rng()-0.5);
  for(let k=0;k<Math.min(maxExtra,pairs.length);k++){
    const [i,j]=pairs[k];
    const w=parseFloat((0.3+rng()*0.6).toFixed(2));
    toyEdges.push({from:i,to:j,w});
  }
  toySelected=null;
  const delBtn=document.getElementById('toy-delete-btn');
  if(delBtn) delBtn.style.display='none';
  updateToy();
}

function toyReset() {
  toyNodes=[
    {label:'a₁',side:'Pro',x:0.25,y:0.28},
    {label:'a₂',side:'Con',x:0.75,y:0.28},
    {label:'a₃',side:'Pro',x:0.75,y:0.72},
    {label:'a₄',side:'Con',x:0.25,y:0.72},
  ];
  toyEdges=[{from:1,to:0,w:0.75},{from:1,to:2,w:0.60},{from:2,to:3,w:0.80},{from:2,to:0,w:0.40}];
  toySelected=null; toyNodeCounter=5;
  const delBtn=document.getElementById('toy-delete-btn');
  if(delBtn) delBtn.style.display='none';
  updateToy();
}

// ─── BIBTEX ───────────────────────────────────────────────────────
function copyBibtex() {
  navigator.clipboard.writeText(document.getElementById('bibtex-block').textContent).then(()=>{
    const btn=document.getElementById('copy-btn');
    btn.textContent='Copied!'; setTimeout(()=>{btn.textContent='Copy';},1800);
  });
}

// ─── INIT ─────────────────────────────────────────────────────────
async function init() {
  initTheme();

  // Load index + aggregate in parallel
  const [idxRes,aggRes]=await Promise.allSettled([
    fetch('static/debates/index.json').then(r=>r.json()),
    fetch('static/aggregate.json').then(r=>r.json()),
  ]);
  if (idxRes.status==='fulfilled') INDEX=idxRes.value;
  else { console.error('index.json failed',idxRes.reason); return; }
  if (aggRes.status==='fulfilled') AGG=aggRes.value;
  else console.warn('aggregate.json failed',aggRes.reason);

  buildMotionSelector();
  initToyCanvas();

  function drawAllStatic() {
    drawAggPearson();
    drawScatter('scatter-canvas','scatter-tooltip');
    drawScatter('scatter2-canvas','scatter2-tooltip');
    drawDensityIters();
    drawMiniGraphs();
    updateToy();
  }

  // Load first pool debate — by the time this resolves, layout is 100% computed
  const first=INDEX.find(e=>e.setting==='pool')||INDEX[0];
  await loadDebate(first.id);

  // Draw static figures now (layout is guaranteed resolved post-loadDebate)
  drawAllStatic();
  // Redraw again after a tick in case scroll position changed canvas visibility
  setTimeout(drawAllStatic, 200);
}

document.addEventListener('DOMContentLoaded',init);
window.addEventListener('resize',()=>{
  if(activeTab==='graph')    drawGraph();
  if(activeTab==='dynamics') drawDynamics();
  if(activeTab==='agreement')drawPearson();
  drawAggPearson();
  drawScatter('scatter-canvas','scatter-tooltip');
  drawScatter('scatter2-canvas','scatter2-tooltip');
  drawDensityIters();
  drawMiniGraphs();
  updateToy();
});
