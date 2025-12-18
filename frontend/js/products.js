async function loadProducts(){
  const q = new URLSearchParams();
  const s = document.getElementById('search').value;
  const c = document.getElementById('category').value;
  if (s) q.set('search', s);
  if (c) q.set('category', c);
  const res = await fetch('/api/products?' + q.toString());
  const list = await res.json();
  const cont = document.getElementById('products');
  cont.innerHTML = '';
  list.forEach(p => {
    const el = document.createElement('div'); el.className='card';
    el.innerHTML = `<img src="${p.image||'/css/placeholder.png'}" alt=""><h4>${p.name}</h4><p class="price">₹${p.price}</p><p>${p.description||''}</p><button data-id="${p._id}" data-name="${p.name}" data-price="${p.price}">Add</button>`;
    cont.appendChild(el);
  });
  document.querySelectorAll('.card button').forEach(b => b.addEventListener('click', addToCart));
}

function addToCart(e){
  const b = e.currentTarget;
  const id = b.dataset.id; const name = b.dataset.name; const price = Number(b.dataset.price||0);
  const cart = JSON.parse(localStorage.getItem('cart')||'[]');
  const found = cart.find(x=>x.productId===id);
  if (found) found.quantity += 1; else cart.push({ productId:id, name, price, quantity:1 });
  localStorage.setItem('cart', JSON.stringify(cart));
  alert('Added to cart');
}

document.getElementById('search').addEventListener('input', () => loadProducts());
document.getElementById('category').addEventListener('change', () => loadProducts());
loadProducts();

// --- search suggestions (bottom->top auto-scroll) ---
function debounce(fn, delay){
  let t; return (...a)=>{ clearTimeout(t); t = setTimeout(()=>fn(...a), delay); }
}

async function fetchProductSuggestions(q){
  if(!q) return [];
  try{
    const res = await fetch('/api/products?search=' + encodeURIComponent(q));
    if(!res.ok) return [];
    const list = await res.json();
    return list.map(p=>({ id: p._id, name: p.name }));
  }catch(e){ return []; }
}

let suggInterval = null;
let suggPos = 0;

function stopSugg(){ if(suggInterval){ clearInterval(suggInterval); suggInterval = null; } }
function startSuggScroll(container){
  stopSugg();
  const inner = container.querySelector('.list-inner');
  if(!inner) return;
  suggPos = inner.scrollHeight - container.clientHeight;
  if(suggPos <= 0) return;
  container.scrollTop = suggPos;
  suggInterval = setInterval(()=>{
    suggPos -= 2; // px per tick
    if(suggPos <= 0) suggPos = inner.scrollHeight - container.clientHeight;
    container.scrollTop = Math.max(0, Math.floor(suggPos));
  }, 60);
}

const onProductsSearch = debounce(async function(){
  const q = document.getElementById('search').value.trim();
  const root = document.getElementById('search-suggestions');
  if(!q){ root.style.display='none'; stopSugg(); return; }
  const items = await fetchProductSuggestions(q);
  if(!items.length){ root.style.display='none'; stopSugg(); return; }
  root.innerHTML = '';
  const wrapper = document.createElement('div'); wrapper.className = 'inner scrolling-list';
  const listInner = document.createElement('div'); listInner.className = 'list-inner';
  items.forEach(it=>{ const el = document.createElement('div'); el.className='item'; el.textContent = it.name; el.addEventListener('click', ()=>{ document.getElementById('search').value = it.name; loadProducts(); root.style.display='none'; stopSugg(); }); listInner.appendChild(el); });
  wrapper.appendChild(listInner); root.appendChild(wrapper); root.style.display='block'; startSuggScroll(wrapper);
  wrapper.addEventListener('mouseenter', ()=> stopSugg()); wrapper.addEventListener('mouseleave', ()=> startSuggScroll(wrapper));
}, 220);

document.getElementById('search').addEventListener('input', onProductsSearch);
document.addEventListener('click', e=>{ if(!e.target.closest('.controls')){ const r=document.getElementById('search-suggestions'); if(r){ r.style.display='none'; stopSugg(); } } });
