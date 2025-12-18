const categories = [
  { name: 'Fruits', label: 'Fruits & Vegetables', img: 'https://via.placeholder.com/120?text=Fruits' },
  { name: 'Dairy', label: 'Dairy, Bread & Eggs', img: 'https://via.placeholder.com/120?text=Dairy' },
  { name: 'Bakery', label: 'Bakery', img: 'https://via.placeholder.com/120?text=Bakery' },
  { name: 'Grains', label: 'Atta, Rice & Dals', img: 'https://via.placeholder.com/120?text=Rice' },
  { name: 'Vegetables', label: 'Vegetables', img: 'https://via.placeholder.com/120?text=Veg' },
  { name: 'Frozen', label: 'Frozen Food', img: 'https://via.placeholder.com/120?text=Frozen' }
];

function renderCategories(){
  const bar = document.getElementById('category-bar');
  categories.forEach(c => {
    const el = document.createElement('a');
    el.className = 'category-item';
    el.href = `/category.html?cat=${encodeURIComponent(c.name)}`;
    el.innerHTML = `<img src="${c.img}" alt="${c.label}"><div>${c.label}</div>`;
    bar.appendChild(el);
  });
}

async function loadPopular(){
  try{
    const res = await fetch('/api/products');
    const list = await res.json();
    const cont = document.getElementById('popular-list');
    cont.innerHTML = '';
    (list.slice(0,8)).forEach(p => {
      const el = document.createElement('div'); el.className='card';
      el.innerHTML = `<img src="${p.image||'/css/placeholder.png'}" alt="${p.name}"><h4>${p.name}</h4><p class="price">₹${p.price}</p><button data-id="${p._id}" data-name="${p.name}" data-price="${p.price}">Add</button>`;
      cont.appendChild(el);
    });
    document.querySelectorAll('.card button').forEach(b => b.addEventListener('click', addToCart));
  }catch(err){console.error(err)}
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

document.getElementById('search-btn').addEventListener('click', ()=>{
  const q = document.getElementById('search-input').value;
  if(q) window.location = `/products.html?search=${encodeURIComponent(q)}`;
});

// Search suggestions: fetch matching product names and show a bottom->top scrolling list
let suggestionInterval = null;
let suggestionScrollPos = 0;
let suggestionSpeed = 40; // pixels per second

function debounce(fn, delay){
  let t;
  return (...args)=>{ clearTimeout(t); t = setTimeout(()=>fn(...args), delay); };
}

async function fetchSuggestions(q){
  if(!q) return [];
  try{
    const res = await fetch('/api/products?search=' + encodeURIComponent(q));
    if(!res.ok) return [];
    const list = await res.json();
    return list.map(p => ({ id: p._id, name: p.name }));
  }catch(e){ return []; }
}

function startAutoScroll(container){
  stopAutoScroll();
  const inner = container.querySelector('.list-inner');
  if(!inner) return;
  suggestionScrollPos = inner.scrollHeight - container.clientHeight; // start at bottom
  if(suggestionScrollPos <= 0) return; // no need to scroll
  container.scrollTop = suggestionScrollPos;
  suggestionInterval = setInterval(()=>{
    suggestionScrollPos -= (suggestionSpeed/10); // adjust step per tick
    if(suggestionScrollPos <= 0) suggestionScrollPos = inner.scrollHeight - container.clientHeight; // loop
    container.scrollTop = Math.max(0, Math.floor(suggestionScrollPos));
  }, 100);
}

function stopAutoScroll(){ if(suggestionInterval){ clearInterval(suggestionInterval); suggestionInterval = null; } }

const onSearchInput = debounce(async function(){
  const q = document.getElementById('search-input').value.trim();
  const suggestionsRoot = document.getElementById('search-suggestions');
  if(!q){ suggestionsRoot.style.display='none'; stopAutoScroll(); return; }
  const items = await fetchSuggestions(q);
  if(!items.length){ suggestionsRoot.style.display='none'; stopAutoScroll(); return; }
  suggestionsRoot.innerHTML = '';
  const wrapper = document.createElement('div'); wrapper.className='inner scrolling-list';
  const listInner = document.createElement('div'); listInner.className='list-inner';
  items.forEach(it => {
    const el = document.createElement('div'); el.className='item'; el.textContent = it.name; el.dataset.id = it.id;
    el.addEventListener('click', ()=>{ window.location = `/products.html?search=${encodeURIComponent(it.name)}`; });
    listInner.appendChild(el);
  });
  wrapper.appendChild(listInner);
  suggestionsRoot.appendChild(wrapper);
  suggestionsRoot.style.display = 'block';
  startAutoScroll(wrapper);
  wrapper.addEventListener('mouseenter', ()=> stopAutoScroll());
  wrapper.addEventListener('mouseleave', ()=> startAutoScroll(wrapper));
}, 220);

document.getElementById('search-input').addEventListener('input', onSearchInput);
document.addEventListener('click', (e)=>{ if(!e.target.closest('.search-wrap') && !e.target.closest('#search-suggestions')){ document.getElementById('search-suggestions').style.display='none'; stopAutoScroll(); } });

renderCategories();
loadPopular();
