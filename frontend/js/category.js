function queryParam(name){
  return new URLSearchParams(window.location.search).get(name);
}

async function loadCategory(){
  const cat = queryParam('cat') || 'All';
  document.getElementById('cat-title').innerText = cat;
  try{
    const res = await fetch('/api/products?category=' + encodeURIComponent(cat));
    const list = await res.json();
    const cont = document.getElementById('category-products');
    cont.innerHTML = '';
    list.forEach(p => {
      const el = document.createElement('div'); el.className='card';
      el.innerHTML = `<img src="${p.image||'/css/placeholder.png'}" alt="${p.name}"><h4>${p.name}</h4><p>${p.description||''}</p><p class="price">₹${p.price}</p><button data-id="${p._id}" data-name="${p.name}" data-price="${p.price}">Add</button>`;
      cont.appendChild(el);
    });
    document.querySelectorAll('.card button').forEach(b => b.addEventListener('click', e=>{
      const id = e.currentTarget.dataset.id; const name = e.currentTarget.dataset.name; const price = Number(e.currentTarget.dataset.price||0);
      const cart = JSON.parse(localStorage.getItem('cart')||'[]');
      const found = cart.find(x=>x.productId===id);
      if(found) found.quantity +=1; else cart.push({ productId:id, name, price, quantity:1 });
      localStorage.setItem('cart', JSON.stringify(cart));
      alert('Added to cart');
    }));
  }catch(err){console.error(err)}
}

loadCategory();
