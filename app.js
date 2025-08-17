// Fixed daily windows (local time)
const TIME_WINDOWS = [
  {start:"00:00", end:"03:24"},
  {start:"03:25", end:"06:50"},
  {start:"06:51", end:"10:16"},
  {start:"10:17", end:"13:41"},
  {start:"13:42", end:"17:07"},
  {start:"17:08", end:"20:33"},
  {start:"20:34", end:"23:59"}
];

// Legend & icons
const LEGEND = {
  RELAX:{emoji:"🧘", summary:"Do NOT start a new project"},
  PRODUCE:{emoji:"🏃", summary:"Work on an old project (success)"},
  PATIENCE:{emoji:"⏳", summary:"Do NOT take chances"},
  ANALYZE:{emoji:"🔍", summary:"Beware of deception (be methodical)"},
  CREATE:{emoji:"🙂", summary:"Start a new project (success)"},
  MONEY:{emoji:"💵", summary:"Create income (success)"},
  SUCCESS:{emoji:"⭐", summary:"Initiate any plan (success)"},
  DISCRETION:{emoji:"👁️", summary:"A wise reply is required (confusion)"}
};

// Per-day outcomes (SU..SA)
const SCHEDULE_MATRIX = [
  ["ANALYZE","PRODUCE","CREATE","PRODUCE","MONEY","PATIENCE","DISCRETION"], // SU
  ["PRODUCE","MONEY","PATIENCE","SUCCESS","DISCRETION","RELAX","CREATE"],   // MO
  ["SUCCESS","ANALYZE","RELAX","CREATE","PRODUCE","MONEY","PATIENCE"],      // TU
  ["CREATE","PRODUCE","MONEY","PATIENCE","SUCCESS","ANALYZE","RELAX"],      // WE
  ["PATIENCE","SUCCESS","ANALYZE","RELAX","CREATE","PRODUCE","MONEY"],      // TH
  ["PRODUCE","CREATE","MONEY","PRODUCE","PATIENCE","SUCCESS","ANALYZE"],    // FR
  ["DISCRETION","PATIENCE","SUCCESS","ANALYZE","RELAX","DISCRETION","PRODUCE"] // SA
];

function parseHM(hm){
  const [hh,mm] = hm.split(':').map(Number);
  const d = new Date();
  d.setSeconds(0,0);
  d.setHours(hh, mm, 0, 0);
  return d;
}
function fmtRange(a,b){ return `${a} – ${b}`; }

function findCurrentBlock(){
  const now = new Date();
  for (let i=0;i<TIME_WINDOWS.length;i++){
    const s = parseHM(TIME_WINDOWS[i].start);
    const e = parseHM(TIME_WINDOWS[i].end);
    if (now >= s && now <= e) return i;
  }
  return -1;
}

function renderToday(){
  const title = document.getElementById('today-title');
  const blocksEl = document.getElementById('blocks');
  title.textContent = new Date().toLocaleDateString([], {weekday:'long', month:'long', day:'numeric'});
  blocksEl.innerHTML = '';

  const todayIdx = new Date().getDay(); // 0=SU
  const row = SCHEDULE_MATRIX[todayIdx];

  row.forEach((key,i)=>{
    const w = TIME_WINDOWS[i];
    const info = LEGEND[key];
    const div = document.createElement('div');
    div.className = 'block';
    div.innerHTML = `
      <div class="time">${fmtRange(w.start, w.end)}</div>
      <div class="leg"><span class="emoji">${info.emoji}</span><strong>${key}</strong><span style="opacity:.7">${info.summary}</span></div>
    `;
    blocksEl.appendChild(div);
  });
}

function renderLegend(){
  const box = document.getElementById('legend');
  box.innerHTML = '';
  Object.entries(LEGEND).forEach(([k,v])=>{
    const div = document.createElement('div');
    div.className = 'leg';
    div.innerHTML = `<span class="emoji">${v.emoji}</span><strong>${k}</strong><span style="opacity:.7">${v.summary}</span>`;
    box.appendChild(div);
  });
}

function renderStatus(){
  const el = document.getElementById('status');
  const now = new Date();
  // Determine next change
  const idx = findCurrentBlock();
  let nextEnd;
  if (idx === -1) {
    // before first or after last -> set to first window end today or tomorrow
    nextEnd = parseHM(TIME_WINDOWS[0].end);
    if (now > parseHM(TIME_WINDOWS[6].end)) {
      nextEnd = new Date(nextEnd.getTime() + 24*3600*1000);
    }
  } else {
    nextEnd = parseHM(TIME_WINDOWS[idx].end);
  }
  const ms = Math.max(0, nextEnd - now);
  const mins = String(Math.floor(ms/60000)).padStart(2,'0');
  const secs = String(Math.floor((ms%60000)/1000)).padStart(2,'0');
  el.textContent = `Local time: ${now.toLocaleTimeString()} · Next change in ${mins}:${secs}`;
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderToday();
  renderLegend();
  renderStatus();
  document.getElementById('upgradeBtn').onclick = ()=> alert('SEERS Premium: unlock your full 7‑day view.');
  setInterval(renderStatus, 1000);
});
