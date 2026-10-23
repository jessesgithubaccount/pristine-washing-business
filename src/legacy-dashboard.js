import { createClient } from '@supabase/supabase-js';

let initialized = false;

export function initializeLegacyDashboard() {
  if (initialized) return;
  initialized = true;
const $=id=>document.getElementById(id);
// Add your own project URL and publishable key from Supabase -> Connect.
// A legacy anon key is also accepted. Never put a secret/service_role key here.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'YOUR_SUPABASE_PUBLISHABLE_KEY';
const isSupabaseConfigured = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(SUPABASE_URL) && !SUPABASE_URL.includes('YOUR_') && !!SUPABASE_PUBLISHABLE_KEY && !SUPABASE_PUBLISHABLE_KEY.includes('YOUR_');
const supabaseClient = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) : null;
let currentUser = null;
const money=n=>'KES '+Number(n||0).toLocaleString('en-KE',{maximumFractionDigits:0});
const todayISO=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const dateLabel=s=>s?new Date(s+'T12:00:00').toLocaleDateString('en-KE',{day:'2-digit',month:'short',year:'numeric'}):'—';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const seed=[
{id:'PR-1048',name:'Mary Wanjiku',phone:'0712 345 678',service:'Wash & Fold',received:shift(-0),due:shift(1),status:'Ready for pickup',amount:1200,payment:'Paid',notes:'',created:Date.now()-1000*60*22},
{id:'PR-1047',name:'Brian Otieno',phone:'0723 456 789',service:'Dry Cleaning',received:shift(-1),due:shift(1),status:'Washing',amount:1800,payment:'Unpaid',notes:'2 suits',created:Date.now()-1000*60*80},
{id:'PR-1046',name:'Aisha Hassan',phone:'0701 234 567',service:'Bedding & Duvets',received:shift(-1),due:shift(2),status:'Received',amount:950,payment:'Paid',notes:'',created:Date.now()-1000*60*155},
{id:'PR-1045',name:'Peter Mwangi',phone:'0798 765 432',service:'Ironing',received:shift(-2),due:shift(0),status:'Ready for pickup',amount:600,payment:'Paid',notes:'',created:Date.now()-1000*60*240},
{id:'PR-1044',name:'Grace Njeri',phone:'0710 222 333',service:'Wash & Fold',received:shift(-2),due:shift(-1),status:'Delivered',amount:1450,payment:'Paid',notes:'',created:Date.now()-1000*60*400},
{id:'PR-1043',name:'David Kamau',phone:'0722 111 444',service:'Wash Only',received:shift(-3),due:shift(-2),status:'Delivered',amount:500,payment:'Paid',notes:'',created:Date.now()-1000*60*600},
{id:'PR-1042',name:'Lydia Achieng',phone:'0700 888 999',service:'Dry Cleaning',received:shift(-3),due:shift(-1),status:'Delivered',amount:2200,payment:'Partial',notes:'',created:Date.now()-1000*60*900}
];
function shift(n){const d=new Date();d.setDate(d.getDate()+n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
let orders=[];
let activity=[];
if(!isSupabaseConfigured){
  try{const saved=localStorage.getItem('pristine_orders_v1')||localStorage.getItem('freshfold_orders_v1');orders=saved?JSON.parse(saved):seed;orders=orders.map(o=>({...o,id:String(o.id||'').replace(/^FF-/,'PR-')}))}catch(e){orders=seed}
  try{activity=JSON.parse(localStorage.getItem('pristine_activity_v1')||localStorage.getItem('freshfold_activity_v1')||'[]')}catch(e){activity=[]}
}
let view='dashboard';document.body.dataset.view='dashboard';
function persist(){if(isSupabaseConfigured)return;try{localStorage.setItem('pristine_orders_v1',JSON.stringify(orders));localStorage.setItem('pristine_activity_v1',JSON.stringify(activity))}catch(e){toast('Browser storage unavailable. Export a CSV backup.')}}
function toast(msg){const n=$('notice');n.textContent=msg;n.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>n.classList.remove('show'),3200)}
function setConnectionState(kind,message){const b=$('connection-banner');b.className='connection-banner'+(kind==='connected'?' connected':kind==='error'?' error':'');$('connection-message').textContent=message;$('storage-label').textContent=kind==='connected'?'Shared database · Supabase':isSupabaseConfigured?'Supabase connection required':'Stored in this browser only'}
function logActivity(title,detail,icon='✓'){
  const item={title,detail,icon,time:Date.now()};activity.unshift(item);activity=activity.slice(0,8);persist();renderActivity();
  if(supabaseClient && currentUser){supabaseClient.from('activity_logs').insert({title,detail,icon,user_id:currentUser.id}).then(({error})=>{if(error)console.warn('Activity log was not saved to Supabase:',error.message)});}
}
function uniqueCustomers(){const m=new Map();orders.forEach(o=>{const k=o.phone.trim();if(!m.has(k))m.set(k,o)});return [...m.values()]}
function paid(o){return o.payment==='Paid'?Number(o.amount):o.payment==='Partial'?Number(o.paidAmount||0):0}
function renderMetrics(){const rev=orders.reduce((s,o)=>s+paid(o),0),active=orders.filter(o=>o.status!=='Delivered').length,ready=orders.filter(o=>o.status==='Ready for pickup').length;
$('metric-revenue').textContent=money(rev);$('revenue-count').textContent=orders.filter(o=>o.payment==='Paid'||o.payment==='Partial').length+' payments';
$('metric-orders').textContent=orders.length;$('active-count').textContent=active+' active';$('metric-ready').textContent=ready;$('metric-customers').textContent=uniqueCustomers().length;
}
function renderChart(){const days=Number($('chart-period').value||7),data=[];for(let i=days-1;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const iso=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');data.push({iso,label:days>14?d.getDate()+'':d.toLocaleDateString('en-KE',{weekday:'short'}),v:orders.filter(o=>o.received===iso).reduce((s,o)=>s+paid(o),0)})}
const svg=$('revenue-chart'),W=620,H=220,L=38,R=10,T=16,B=28,iw=W-L-R,ih=H-T-B,max=Math.max(100,...data.map(x=>x.v));let out='';for(let i=0;i<4;i++){const y=T+ih*i/3,val=Math.round(max*(1-i/3));out+=`<line class="chart-grid" x1="${L}" y1="${y}" x2="${W-R}" y2="${y}"/><text class="chart-label" x="${L-8}" y="${y+4}" text-anchor="end">${val>=1000?(val/1000).toFixed(val%1000?1:0)+'k':val}</text>`}
const pts=data.map((d,i)=>({x:L+(data.length===1?iw/2:iw*i/(data.length-1)),y:T+ih-(d.v/max)*ih}));const line=pts.length<3?pts.map((p,i)=>(i?'L':'M')+p.x+' '+p.y).join(' '):pts.reduce((path,p,i)=>{if(i===0)return `M ${p.x} ${p.y}`;const prev=pts[i-1],before=pts[Math.max(0,i-2)],after=pts[Math.min(pts.length-1,i+1)];const c1x=prev.x+(p.x-before.x)/6,c1y=prev.y+(p.y-before.y)/6,c2x=p.x-(after.x-prev.x)/6,c2y=p.y-(after.y-prev.y)/6;return path+` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p.x} ${p.y}`},''),area=line+` L ${pts[pts.length-1].x} ${T+ih} L ${pts[0].x} ${T+ih} Z`;out+=`<path class="chart-area" d="${area}"/><path class="chart-line" d="${line}"/>`;pts.forEach((p,i)=>{if(days<=14||i%Math.ceil(days/10)===0||i===pts.length-1)out+=`<circle class="chart-dot" cx="${p.x}" cy="${p.y}" r="3.5"/><text class="chart-label" x="${p.x}" y="${H-8}" text-anchor="middle">${esc(data[i].label)}</text>`});svg.innerHTML=`<defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#2463eb" stop-opacity=".20"/><stop offset="100%" stop-color="#2463eb" stop-opacity="0"/></linearGradient></defs>${out}`}
function statusClass(s){return s==='Ready for pickup'?'s-ready':s==='Washing'?'s-wash':s==='Received'?'s-pending':s==='Delivered'?'s-delivered':'s-progress'}
function renderTable(){const q=$('search').value.toLowerCase().trim();let list=[...orders].sort((a,b)=>b.created-a.created);if(view==='customers'){const seen=new Set();list=list.filter(o=>{if(seen.has(o.phone))return false;seen.add(o.phone);return true});$('table-title').textContent='Customer records';$('table-sub').textContent='One record per customer, with their latest order';}else if(view==='reports'){$('table-title').textContent='All order transactions';$('table-sub').textContent='Review recorded services, payments and order status';}else{$('table-title').textContent=view==='orders'?'Orders & records':'Recent orders';$('table-sub').textContent='Track every item from drop-off to collection';}
list=list.filter(o=>[o.id,o.name,o.phone,o.service,o.status,o.payment].some(v=>String(v).toLowerCase().includes(q)));
$('orders-body').innerHTML=list.length?list.map(o=>`<tr><td><div class="customer"><div class="customer-avatar">${esc(o.name.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase())}</div><div><div class="customer-name">${esc(o.name)}</div><div class="customer-phone">${esc(o.phone)} · <span class="order-id">${esc(o.id)}</span></div></div></div></td><td>${esc(o.service)}</td><td>${dateLabel(o.received)}</td><td>${dateLabel(o.due)}</td><td><select aria-label="Status for ${esc(o.id)}" data-status="${esc(o.id)}" style="border:0;border-radius:20px;padding:6px 7px;font-size:10px;font-weight:800;background:${o.status==='Ready for pickup'?'#ddf8eb':o.status==='Delivered'?'#e8edf2':o.status==='Washing'?'#e4edff':'#fff0d2'};color:${o.status==='Ready for pickup'?'#13774e':o.status==='Delivered'?'#617286':o.status==='Washing'?'#2e5db3':'#9b6500'}"><option ${o.status==='Received'?'selected':''}>Received</option><option ${o.status==='Washing'?'selected':''}>Washing</option><option ${o.status==='Ready for pickup'?'selected':''}>Ready for pickup</option><option ${o.status==='Delivered'?'selected':''}>Delivered</option></select></td><td class="amount">${money(o.amount)}</td><td><select aria-label="Payment for ${esc(o.id)}" data-payment="${esc(o.id)}" style="border:1px solid #edf1f6;border-radius:7px;padding:6px;font-size:10px"><option ${o.payment==='Paid'?'selected':''}>Paid</option><option ${o.payment==='Unpaid'?'selected':''}>Unpaid</option><option ${o.payment==='Partial'?'selected':''}>Partial</option></select></td><td><button class="btn btn-light" data-edit="${esc(o.id)}" style="padding:6px 8px;font-size:10px">Edit</button></td></tr>`).join(''):'<tr><td colspan="8" class="empty">No matching records. Add a new order to get started.</td></tr>';
$('table-count').textContent=`Showing ${list.length} ${list.length===1?'record':'records'}`;
document.querySelectorAll('[data-status]').forEach(el=>el.addEventListener('change',async()=>{const o=orders.find(x=>x.id===el.dataset.status);if(!o)return;const previous=o.status;o.status=el.value;if(supabaseClient){const {error}=await supabaseClient.from('orders').update({status:o.status}).eq('order_number',o.id);if(error){o.status=previous;renderAll();toast('Supabase update failed: '+error.message);return}}persist();logActivity('Order status updated',o.id+' · '+o.status,'↻');renderAll();toast('Order status updated')}));
document.querySelectorAll('[data-payment]').forEach(el=>el.addEventListener('change',async()=>{const o=orders.find(x=>x.id===el.dataset.payment);if(!o)return;const previous=o.payment,previousPaid=Number(o.paidAmount||0),nextPayment=el.value;let nextPaid=previousPaid;if(nextPayment==='Paid')nextPaid=o.amount;else if(nextPayment==='Unpaid')nextPaid=0;else{const entered=prompt('How much has the customer paid so far (KES)?',String(previousPaid));if(entered===null){el.value=previous;return}nextPaid=Number(entered);if(!Number.isFinite(nextPaid)||nextPaid<0||nextPaid>Number(o.amount)){el.value=previous;toast('Enter an amount between KES 0 and '+money(o.amount));return}}o.payment=nextPayment;o.paidAmount=nextPaid;if(supabaseClient){const {error}=await supabaseClient.from('orders').update({payment_status:o.payment,paid_amount:Number(o.paidAmount||0)}).eq('order_number',o.id);if(error){o.payment=previous;o.paidAmount=previousPaid;renderAll();toast('Supabase update failed: '+error.message);return}}persist();logActivity('Payment updated',o.id+' · '+o.payment,'KES');renderAll();toast('Payment status updated')}));
document.querySelectorAll('[data-edit]').forEach(el=>el.addEventListener('click',()=>editOrder(el.dataset.edit)));
}
function renderActivity(){const items=activity.length?activity:[{title:'Welcome to Pristine',detail:'Your laundromat records will appear here.',icon:'✦',time:Date.now()}];$('activity-list').innerHTML=items.slice(0,5).map(a=>`<div class="activity"><div class="activity-icon">${esc(a.icon||'✓')}</div><div><strong>${esc(a.title)}</strong><p>${esc(a.detail)}</p></div><time>${timeAgo(a.time)}</time></div>`).join('');const right=$('right-activity');if(right)right.innerHTML=items.slice(0,5).map(a=>`<div class="activity"><div class="activity-icon">${esc(a.icon||'✓')}</div><div style="flex:1"><strong>${esc(a.title)}</strong><p>${esc(a.detail)}</p></div><time>${timeAgo(a.time)}</time></div>`).join('')}
function timeAgo(t){const m=Math.max(0,Math.floor((Date.now()-t)/60000));return m<1?'now':m<60?m+'m ago':m<1440?Math.floor(m/60)+'h ago':Math.floor(m/1440)+'d ago'}
function updateAIInsight(){
 const insight=$('ai-insight'); if(!insight)return;
 if(!orders.length){insight.textContent="Add your first order and I’ll start building a picture of your laundromat’s services, customers, payments, and workflow.";return}
 const counts={};orders.forEach(o=>String(o.service).split(', ').forEach(sv=>counts[sv]=(counts[sv]||0)+1));
 const top=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
 const unpaid=orders.filter(o=>o.payment==='Unpaid').reduce((sum,o)=>sum+Number(o.amount||0),0);
 const partial=orders.filter(o=>o.payment==='Partial').reduce((sum,o)=>sum+Math.max(0,Number(o.amount||0)-Number(o.paidAmount||0)),0);
 const ready=orders.filter(o=>o.status==='Ready for pickup').length;
 const active=orders.filter(o=>o.status!=='Delivered').length;
 let msg=`You have ${orders.length} order${orders.length===1?'':'s'} across ${Object.keys(counts).length} service${Object.keys(counts).length===1?'':'s'}. ${top[0]} is your most-recorded service (${top[1]} order${top[1]===1?'':'s'}). `;
 if(unpaid+partial>0)msg+=`Follow up on about ${money(unpaid+partial)} in unpaid or remaining balances. `;
 if(ready>0)msg+=`${ready} order${ready===1?' is':'s are'} ready for pickup. `;
 else if(active>0)msg+=`${active} order${active===1?' is':'s are'} still in progress. `;
 msg+='I refresh this summary whenever you add an order or update a status or payment.';
 insight.textContent=msg;
}
function renderAll(){renderMetrics();renderChart();renderTable();renderActivity();updateAIInsight()}
function updateServiceSummary(){const v=[...document.querySelectorAll('#service-chips input:checked')].map(c=>c.value);const el=$('service-summary');el.textContent=v.length?v.join(', '):'Select services';el.className=v.length?'':'placeholder'}
function toggleServiceDD(open){const panel=$('service-chips');const o=typeof open==='boolean'?open:panel.hidden;panel.hidden=!o;$('service-btn').setAttribute('aria-expanded',o)}
function resetServices(){document.querySelectorAll('#service-chips input').forEach(c=>c.checked=false);$('service-other').value='';$('service-other').style.display='none';$('service-error').classList.remove('show');updateServiceSummary();toggleServiceDD(false)}
function openModal(){ resetServices();$('order-modal').classList.add('show');$('received-date').value=todayISO();$('due-date').value=shift(1);setTimeout(()=>$('customer-name').focus(),50)}
function closeModal(){$('order-modal').classList.remove('show')}
async function editOrder(id){const o=orders.find(x=>x.id===id);if(!o)return;const next=prompt('Update order status:\n1. Received\n2. Washing\n3. Ready for pickup\n4. Delivered',String(['Received','Washing','Ready for pickup','Delivered'].indexOf(o.status)+1));if(next===null)return;const statuses=['Received','Washing','Ready for pickup','Delivered'];const idx=Number(next)-1;if(!Number.isInteger(idx)||!statuses[idx]){toast('No changes made');return}const previous=o.status;o.status=statuses[idx];if(supabaseClient){const {error}=await supabaseClient.from('orders').update({status:o.status}).eq('order_number',o.id);if(error){o.status=previous;renderAll();toast('Supabase update failed: '+error.message);return}}persist();logActivity('Order status updated',o.id+' · '+o.status,'↻');renderAll();toast('Order updated')}
function exportCSV(){const headers=['Order ID','Customer','Phone','Service','Date received','Due date','Status','Amount (KES)','Payment','Notes'];const rows=orders.map(o=>[o.id,o.name,o.phone,o.service,o.received,o.due,o.status,o.amount,o.payment,o.notes||'']);const csv=[headers,...rows].map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='pristine-laundry-records-'+todayISO()+'.csv';a.click();URL.revokeObjectURL(url);toast('CSV export prepared')}
$('order-form').addEventListener('submit',async e=>{e.preventDefault();const name=$('customer-name').value.trim(),phone=$('customer-phone').value.trim();if(!name||!phone)return;const picked=[...document.querySelectorAll('#service-chips input:checked')].map(c=>c.value);if(!picked.length){$('service-error').classList.add('show');return}const other=$('service-other').value.trim();const svc=picked.map(v=>v==='Other'&&other?other:v).join(', ');const order={id:'PR-'+String(Math.max(1000,...orders.map(o=>Number(o.id.replace(/\D/g,''))||0)+1)),name,phone,service:svc,amount:Number($('amount').value),received:$('received-date').value,due:$('due-date').value,status:$('order-status').value,payment:$('payment-status').value,notes:$('order-notes').value.trim(),created:Date.now(),paidAmount:$('payment-status').value==='Paid'?Number($('amount').value):0};
  if(supabaseClient){
    const normalizedPhone=normalizePhone(phone);if(!normalizedPhone){toast('Enter a valid phone number.');return}
    const {data:customer,error:customerError}=await supabaseClient.from('customers').upsert({full_name:name,phone,normalized_phone:normalizedPhone},{onConflict:'normalized_phone'}).select('id').single();
    if(customerError){toast('Could not save customer: '+customerError.message);return}
    const {error:orderError}=await supabaseClient.from('orders').insert({order_number:order.id,customer_id:customer.id,service:order.service,received_date:order.received,due_date:order.due,status:order.status,amount:order.amount,payment_status:order.payment,paid_amount:order.paidAmount,notes:order.notes});
    if(orderError){toast('Could not save order: '+orderError.message);return}
    await loadRemoteData();
  } else {orders.push(order);persist()}
  logActivity('New order recorded',order.id+' · '+name,'＋');closeModal();$('order-form').reset();renderAll();toast('Order '+order.id+' saved')});
$('service-btn').addEventListener('click',()=>toggleServiceDD());
document.addEventListener('click',e=>{if(!$('service-dd').contains(e.target))toggleServiceDD(false)});
document.querySelectorAll('#service-chips input').forEach(c=>c.addEventListener('change',()=>{updateServiceSummary();$('service-error').classList.remove('show');const oth=[...document.querySelectorAll('#service-chips input')].find(x=>x.value==='Other').checked;$('service-other').style.display=oth?'block':'none';if(oth)$('service-other').focus()}));
$('add-order-top').addEventListener('click',openModal);$('owner-add').addEventListener('click',openModal);$('owner-export').addEventListener('click',exportCSV);$('owner-contact').addEventListener('click',()=>{updateAIInsight();toast('Pristine AI insight refreshed from your current records.');});$('quick-add').addEventListener('click',openModal);$('close-modal').addEventListener('click',closeModal);$('cancel-modal').addEventListener('click',closeModal);$('order-modal').addEventListener('click',e=>{if(e.target===$('order-modal'))closeModal()});$('search').addEventListener('input',renderTable);$('chart-period').addEventListener('change',renderChart);$('export-btn').addEventListener('click',exportCSV);$('quick-export').addEventListener('click',exportCSV);
function normalizePhone(phone){let digits=String(phone||'').replace(/\D/g,'');if(digits.startsWith('00'))digits=digits.slice(2);if(digits.startsWith('0')&&digits.length===10)digits='254'+digits.slice(1);return digits}
function fromDatabase(row){return {id:row.order_number,dbId:row.id,customerId:row.customer_id,name:row.customer?.full_name||'Unknown customer',phone:row.customer?.phone||'',service:row.service,received:row.received_date,due:row.due_date,status:row.status,amount:Number(row.amount||0),payment:row.payment_status,paidAmount:Number(row.paid_amount||0),notes:row.notes||'',created:row.created_at?new Date(row.created_at).getTime():Date.now()}}
async function loadRemoteData(){
  if(!supabaseClient||!currentUser)return;
  setConnectionState('connected','Connected to Supabase. Changes are saved to the shared database.');
  const {data:orderRows,error:ordersError}=await supabaseClient.from('orders').select('id,order_number,customer_id,service,received_date,due_date,status,amount,payment_status,paid_amount,notes,created_at,customer:customers(full_name,phone)').order('created_at',{ascending:false});
  if(ordersError){setConnectionState('error','Could not load orders from Supabase: '+ordersError.message);toast('Database load failed. Check the setup SQL and table permissions.');return}
  orders=(orderRows||[]).map(fromDatabase);
  const {data:activityRows,error:activityError}=await supabaseClient.from('activity_logs').select('title,detail,icon,created_at').order('created_at',{ascending:false}).limit(8);
  if(activityError){console.warn('Could not load activity history:',activityError.message);activity=[]}
  else activity=(activityRows||[]).map(a=>({title:a.title,detail:a.detail,icon:a.icon,time:new Date(a.created_at).getTime()}));
  renderAll();
}
async function handleAuthSession(session){
  if(!isSupabaseConfigured)return;
  if(session?.user){currentUser=session.user;document.body.classList.remove('auth-locked');$('auth-gate').classList.remove('show');$('user-name').textContent=session.user.email||'Staff account';$('user-avatar').textContent=(session.user.email||'ST').slice(0,2).toUpperCase();$('signout-btn').hidden=false;await loadRemoteData();}
  else{currentUser=null;orders=[];activity=[];document.body.classList.add('auth-locked');$('auth-gate').classList.add('show');$('signout-btn').hidden=true;renderAll()}
}
$('auth-form').addEventListener('submit',async e=>{e.preventDefault();if(!supabaseClient){$('auth-error').style.display='block';$('auth-error').textContent='Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file, then restart the dev server.';return}const btn=$('auth-submit'),err=$('auth-error');btn.disabled=true;btn.textContent='Signing in…';err.style.display='none';const {error}=await supabaseClient.auth.signInWithPassword({email:$('auth-email').value.trim(),password:$('auth-password').value});btn.disabled=false;btn.textContent='Sign in securely';if(error){err.style.display='block';err.textContent=error.message}else{$('auth-password').value=''}});
$('signout-btn').addEventListener('click',async()=>{if(!supabaseClient)return;const {error}=await supabaseClient.auth.signOut();if(error)toast('Could not sign out: '+error.message);else toast('Signed out')});
function setView(v){view=v;document.body.dataset.view=v;document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===v));const titles={dashboard:'Dashboard overview',orders:'Orders & records',customers:'Customer directory',reports:'Business metrics'};const intros={dashboard:'A quick snapshot of your laundromat today',orders:'Manage orders, update progress and track payments',customers:'Browse your customers and their latest order details',reports:'Review revenue performance and order activity'};$('page-title').textContent=titles[v]||titles.dashboard;$('greeting').textContent=intros[v]||intros.dashboard;renderMetrics();renderChart();renderTable();window.scrollTo({top:0,behavior:'smooth'})}
document.querySelectorAll('.nav button').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));$('quick-customer').addEventListener('click',()=>setView('customers'));$('quick-metrics').addEventListener('click',()=>setView('reports'));
$('today-date').textContent=new Date().toLocaleDateString('en-KE',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
if(isSupabaseConfigured){
  if(!supabaseClient){setConnectionState('error','Supabase could not initialize. Check the project URL and publishable key.');document.body.classList.add('auth-locked');$('auth-gate').classList.add('show')}
  else{
    document.body.classList.add('auth-locked');$('auth-gate').classList.add('show');setConnectionState('connected','Supabase is configured. Sign in to load shared records.');
    supabaseClient.auth.onAuthStateChange((_event,session)=>{setTimeout(()=>{handleAuthSession(session)},0)});
    supabaseClient.auth.getSession().then(({data,error})=>{if(error){setConnectionState('error','Supabase authentication error: '+error.message)}handleAuthSession(data?.session||null)});
  }
} else {
  setConnectionState('','Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env file to enable shared records. This browser-only mode is for preview/testing.');
  renderAll();
}
}