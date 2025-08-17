const years = Array.from({length:11}, (_,i)=>2025+i);
const yearBar = document.getElementById('year-bar');
const monthSel = document.getElementById('month');
const searchEl = document.getElementById('search');
const tbody = document.getElementById('voctbody');
const todayBtn = document.getElementById('todayBtn');

let currentYear = new Date().getFullYear();
if (currentYear < 2025 || currentYear > 2035) currentYear = 2025;
let dataset = [];

function drawYearBar(){
  yearBar.innerHTML = '';
  years.forEach(y=>{
    const a = document.createElement('a');
    a.href = '#'; a.className='badge';
    a.textContent = y;
    if (y===currentYear){ a.style.background='#FFD700'; a.style.fontWeight='700'; }
    a.onclick = (e)=>{ e.preventDefault(); currentYear = y; loadYear(); };
    yearBar.appendChild(a);
  });
}

async function loadYear(){
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;opacity:.7">Loading ${currentYear}…</td></tr>`;
  try{
    const res = await fetch(`data/voc-${currentYear}.json`, {cache:'no-store'});
    if(!res.ok) throw new Error('Missing file');
    dataset = await res.json();
  }catch(e){
    dataset = [];
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;opacity:.7">No data file found for ${currentYear}. Upload <code>data/voc-${currentYear}.json</code> to your repo.</td></tr>`;
    return;
  }
  renderTable();
}

function toLocal(ts){
  const d = new Date(ts);
  return d.toLocaleString([], {dateStyle:'medium', timeStyle:'short'});
}

function monthIndex(ts){
  return new Date(ts).getMonth();
}

function renderTable(){
  const q = (searchEl.value||'').toLowerCase();
  const m = monthSel.value===''? null : Number(monthSel.value);
  const rows = dataset.filter(r=>{
    const passMonth = m===null || monthIndex(r.startUTC)===m || monthIndex(r.endUTC)===m;
    const txt = (r.startSign+' '+r.endSign+' '+(r.bestUse||'')).toLowerCase();
    const passSearch = !q || txt.includes(q);
    return passMonth && passSearch;
  });

  if(!rows.length){
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;opacity:.7">No results for selected filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(r=>`
    <tr>
      <td>${new Date(r.startUTC).toLocaleDateString()}</td>
      <td>${toLocal(r.startUTC)}</td>
      <td>${toLocal(r.endUTC)}</td>
      <td>${r.startSign||''}</td>
      <td>${r.endSign||''}</td>
      <td>${r.bestUse||''}</td>
    </tr>
  `).join('');
}

drawYearBar();
loadYear();
searchEl.addEventListener('input', renderTable);
monthSel.addEventListener('change', renderTable);
todayBtn.addEventListener('click', ()=>{
  monthSel.value = String(new Date().getMonth());
  renderTable();
});
