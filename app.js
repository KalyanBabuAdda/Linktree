const CFG=window.LINKHUB_CONFIG||{};
const URL=CFG.supabaseUrl, KEY=CFG.supabasePublishableKey;
const LOGOS={instagram:'IG',youtube:'▶',whatsapp:'WA',facebook:'f',x:'X',linkedin:'in',github:'GH',tiktok:'♪',telegram:'➤',discord:'DC',spotify:'●',snapchat:'S',email:'✉',website:'◎'};
let state={profile:{name:'SRIRAM',bio:'Designer • Creator • Developer',tagline:'Built for a bolder tomorrow.',overlay:55,background_url:null},links:[],analytics:{pageViews:[],events:[],range:'all'}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const token=()=>sessionStorage.getItem('linkhubAccessToken')||'';
function headers(auth=false,extra={}){const h={apikey:KEY,...extra};if(auth&&token())h.Authorization='Bearer '+token();return h}
async function api(path,opts={}){const r=await fetch(URL+path,{...opts,headers:{...headers(!!opts.auth,opts.headers||{})}});if(!r.ok){let m=await r.text();throw new Error(m||`Request failed (${r.status})`)}if(r.status===204)return null;const t=await r.text();return t?JSON.parse(t):null}
function logoMarkup(l){const k=l.logo||'custom';return k==='custom'?`<span class="logo-glyph">${esc(l.icon||'↗')}</span>`:`<span class="brand-logo brand-${esc(k)}" aria-label="${esc(k)}">${LOGOS[k]||'↗'}</span>`}
function setBg(){document.documentElement.style.setProperty('--bg',state.profile.background_url?`url(${state.profile.background_url})`:"url('assets/cinematic-bg.jpg')");const o=(state.profile.overlay||55)/100;document.body.style.backgroundImage=`linear-gradient(rgba(2,4,7,${o}),rgba(2,4,7,${Math.min(.9,o+.15)})),var(--bg)`}
async function loadPublic(){const [p,l]=await Promise.all([api('/rest/v1/profile_settings?id=eq.1&select=*'),api('/rest/v1/links?active=eq.true&select=*&order=sort_order.asc')]);if(p?.[0])state.profile=p[0];state.links=l||[]}
async function publicPage(){const root=document.querySelector('.profile');if(!root)return;try{await loadPublic();setBg();root.querySelector('h1').textContent=state.profile.name;root.querySelector('.role').textContent=state.profile.bio;root.querySelector('.tagline').textContent=state.profile.tagline;const box=document.querySelector('#links');box.innerHTML='';state.links.forEach(l=>{const a=document.createElement('a');a.className='link-card';a.href=l.url;a.target=l.url.startsWith('mailto:')?'_self':'_blank';a.rel='noopener';a.innerHTML=`<span class="link-icon">${logoMarkup(l)}</span><span><b>${esc(l.title)}</b><small>${esc(l.subtitle)}</small></span><span class="arrow">›</span>`;a.addEventListener('click',()=>{api('/rest/v1/click_events',{method:'POST',headers:{'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({link_id:l.id})}).catch(()=>{})});box.appendChild(a)});api('/rest/v1/page_views',{method:'POST',headers:{'Content-Type':'application/json','Prefer':'return=minimal'},body:'{}'}).catch(()=>{})}catch(e){root.querySelector('.tagline').textContent='Unable to load links right now.';console.error(e)}}
async function signIn(email,password){const r=await fetch(URL+'/auth/v1/token?grant_type=password',{method:'POST',headers:headers(false,{'Content-Type':'application/json'}),body:JSON.stringify({email,password})});const d=await r.json();if(!r.ok)throw new Error(d.error_description||d.msg||'Sign in failed');sessionStorage.setItem('linkhubAccessToken',d.access_token);sessionStorage.setItem('linkhubRefreshToken',d.refresh_token||'');return d}
async function verifyAdmin(){await api('/rest/v1/admin_users?select=user_id&limit=1',{auth:true});}
async function loadAdmin(){
  const [p,l,v,c]=await Promise.all([
    api('/rest/v1/profile_settings?id=eq.1&select=*',{auth:true}),
    api('/rest/v1/links?select=*&order=sort_order.asc',{auth:true}),
    api('/rest/v1/page_views?select=id,created_at&order=created_at.desc',{auth:true}),
    api('/rest/v1/click_events?select=id,link_id,created_at&order=created_at.desc',{auth:true})
  ]);
  if(p?.[0])state.profile=p[0];
  state.links=l||[];
  state.analytics.pageViews=v||[];
  state.analytics.events=c||[];
}
function rangeStart(range){
  if(range==='all')return 0;
  const d=new Date(); d.setHours(0,0,0,0);
  if(range==='today')return d.getTime();
  const days=range==='7d'?6:29; d.setDate(d.getDate()-days); return d.getTime();
}
function analyticsForRange(){
  const start=rangeStart(state.analytics.range||'all');
  const views=(state.analytics.pageViews||[]).filter(x=>!start||new Date(x.created_at).getTime()>=start);
  const events=(state.analytics.events||[]).filter(x=>!start||new Date(x.created_at).getTime()>=start);
  const clicks={}; events.forEach(x=>{const k=String(x.link_id||'unknown');clicks[k]=(clicks[k]||0)+1});
  return {views,events,clicks,total:events.length};
}
function v(id){return document.querySelector('#'+id).value.trim()}function set(id,val){const e=document.querySelector('#'+id);if(e)e.textContent=val}
function updateLogoPicker(){const sel=document.querySelector('#linkLogo');if(!sel)return;const custom=sel.value==='custom';document.querySelector('#customIconWrap').style.display=custom?'grid':'none';document.querySelector('#logoPreview').innerHTML=custom?'<span class="logo-glyph">'+esc(document.querySelector('#linkIcon').value||'↗')+'</span>':'<span class="brand-logo brand-'+sel.value+'">'+(LOGOS[sel.value]||'↗')+'</span>'}
function openDialog(item){document.querySelector('#dialogTitle').textContent=item?'Edit Link':'Add Link';document.querySelector('#editId').value=item?.id||'';document.querySelector('#linkTitle').value=item?.title||'';document.querySelector('#linkSubtitle').value=item?.subtitle||'';document.querySelector('#linkUrl').value=item?.url||'';document.querySelector('#linkLogo').value=item?.logo||'custom';document.querySelector('#linkIcon').value=item?.icon||'';updateLogoPicker();document.querySelector('#linkDialog').showModal()}
async function saveLink(){const title=v('linkTitle'),url=v('linkUrl');if(!title||!url){alert('Title and URL are required.');return}const id=v('editId'),payload={title,subtitle:v('linkSubtitle'),url,logo:document.querySelector('#linkLogo').value,icon:v('linkIcon')||'↗',updated_at:new Date().toISOString()};if(id)await api('/rest/v1/links?id=eq.'+encodeURIComponent(id),{method:'PATCH',auth:true,headers:{'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify(payload)});else await api('/rest/v1/links',{method:'POST',auth:true,headers:{'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({...payload,active:true,sort_order:state.links.length+1})});document.querySelector('#linkDialog').close();await refreshAdmin()}
async function refreshAdmin(){await loadAdmin();render()}
function render(){
  const a=analyticsForRange(), total=a.total, vis=a.views.length;
  set('visits',(state.analytics.pageViews||[]).length);set('clicks',(state.analytics.events||[]).length);
  const allV=(state.analytics.pageViews||[]).length, allC=(state.analytics.events||[]).length;
  set('rate',allV?Math.round(allC/allV*100)+'%':'0%');set('activeLinks',state.links.filter(x=>x.active).length);
  set('aVisits',vis);set('aClicks',total);
  const perf=document.querySelector('#performance');perf.innerHTML='';
  state.links.forEach(l=>{const n=(state.analytics.events||[]).filter(e=>String(e.link_id)===String(l.id)).length,p=allC?Math.round(n/allC*100):0;perf.insertAdjacentHTML('beforeend',`<div class="perf-row"><span>${logoMarkup(l)} &nbsp;${esc(l.title)}</span><div class="bar"><i style="width:${p}%"></i></div><b>${n}</b></div>`)});
  if(!state.links.length)perf.innerHTML='<div class="empty">No links yet.</div>';
  const ed=document.querySelector('#linkEditor');ed.innerHTML='';
  state.links.forEach((l,i)=>{const row=document.createElement('div');row.className='editor-row';row.innerHTML=`<span>${i+1}</span><span>${logoMarkup(l)} ${esc(l.title)}</span><span class="url">${esc(l.url)}</span><label class="status"><input class="switch" type="checkbox" ${l.active?'checked':''}> Visible</label><span><button class="edit">Edit</button> <button class="del">×</button></span>`;row.querySelector('.switch').onchange=async e=>{await api('/rest/v1/links?id=eq.'+encodeURIComponent(l.id),{method:'PATCH',auth:true,headers:{'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({active:e.target.checked,updated_at:new Date().toISOString()})});await refreshAdmin()};row.querySelector('.edit').onclick=()=>openDialog(l);row.querySelector('.del').onclick=async()=>{if(confirm(`Delete ${l.title}?`)){await api('/rest/v1/links?id=eq.'+encodeURIComponent(l.id),{method:'DELETE',auth:true,headers:{Prefer:'return=minimal'}});await refreshAdmin()}};ed.appendChild(row)});
  const ar=document.querySelector('#analyticsRows'); ar.innerHTML='';
  const rows=state.links.map(l=>({link:l,count:a.clicks[String(l.id)]||0})).sort((x,y)=>y.count-x.count);
  rows.forEach(({link:l,count:n})=>{const pct=total?Math.round(n/total*100):0;ar.insertAdjacentHTML('beforeend',`<div class="analytics-link-row"><div class="analytics-link-top"><span>${logoMarkup(l)} <b>${esc(l.title)}</b></span><span><b>${n}</b> click${n===1?'':'s'} · ${pct}%</span></div><div class="analytics-bar"><i style="width:${pct}%"></i></div></div>`)});
  const known=new Set(state.links.map(l=>String(l.id))); const unknown=a.events.filter(e=>!known.has(String(e.link_id))).length;
  if(unknown)ar.insertAdjacentHTML('beforeend',`<div class="analytics-link-row"><div class="analytics-link-top"><span><b>Deleted / unavailable links</b></span><span><b>${unknown}</b> clicks</span></div></div>`);
  if(!rows.length&&!unknown)ar.innerHTML='<div class="empty">No links available yet.</div>';
  document.querySelector('#displayName').value=state.profile.name;document.querySelector('#bio').value=state.profile.bio;document.querySelector('#tagline').value=state.profile.tagline;document.querySelector('#overlay').value=state.profile.overlay;
}
async function adminPage(){const tabs={dashboard:document.querySelector('#dashboard'),links:document.querySelector('#linksTab'),appearance:document.querySelector('#appearance'),analytics:document.querySelector('#analytics')};document.querySelectorAll('button.nav[data-tab]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));b.classList.add('active');Object.values(tabs).forEach(x=>x.classList.remove('show'));tabs[b.dataset.tab].classList.add('show');document.querySelector('#pageTitle').textContent=b.textContent.replace(/^[^A-Za-z]+/,'').trim();render()}));document.querySelector('#addLink').onclick=()=>openDialog();document.querySelector('#saveLink').onclick=async e=>{e.preventDefault();try{await saveLink()}catch(err){alert('Could not save link: '+err.message)}};document.querySelector('#linkLogo').addEventListener('change',updateLogoPicker);document.querySelector('#linkIcon').addEventListener('input',updateLogoPicker);document.querySelector('#saveAppearance').onclick=async()=>{try{const payload={name:v('displayName')||'SRIRAM',bio:v('bio'),tagline:v('tagline'),overlay:+document.querySelector('#overlay').value,background_url:v('backgroundUrl')||null,updated_at:new Date().toISOString()};await api('/rest/v1/profile_settings?id=eq.1',{method:'PATCH',auth:true,headers:{'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify(payload)});await refreshAdmin();alert('Appearance saved to Supabase.')}catch(err){alert(err.message)}};document.querySelector('#logoutBtn').onclick=()=>{sessionStorage.clear();location.reload()};const range=document.querySelector('#analyticsRange');if(range){range.value=state.analytics.range||'all';range.addEventListener('change',()=>{state.analytics.range=range.value;render()})}await refreshAdmin();document.querySelector('#backgroundUrl').value=state.profile.background_url||''}
async function initLoginGate(){const gate=document.querySelector('#loginGate'),app=document.querySelector('#adminApp'),form=document.querySelector('#loginForm');if(!gate)return;const unlock=async()=>{await verifyAdmin();gate.style.display='none';app.classList.remove('locked');app.classList.add('unlocked');await adminPage()};if(token()){try{await unlock();return}catch{sessionStorage.clear()}}form.addEventListener('submit',async e=>{e.preventDefault();const msg=document.querySelector('#loginMsg');msg.textContent='Signing in…';try{await signIn(v('adminEmail'),document.querySelector('#adminPassword').value);await unlock()}catch(err){sessionStorage.clear();msg.textContent='Sign in failed. Check your account/setup. '+err.message}})}
if(!URL||!KEY){document.body.innerHTML='<p style="padding:30px;color:white">Supabase configuration missing.</p>'}else if(document.querySelector('#loginGate'))initLoginGate();else publicPage();
