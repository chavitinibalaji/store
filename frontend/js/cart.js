let appliedCoupon = null;

function renderCart(){
  const cart = JSON.parse(localStorage.getItem('cart')||'[]');
  const cont = document.getElementById('cart-items');
  if(!cont) return;
  cont.innerHTML = '';
  let total = 0;
  cart.forEach(it => {
    const div = document.createElement('div');
    div.className = 'cart-row';
    div.innerHTML = `<div class="cart-left"><strong>${it.name}</strong><div class="small">${it.quantity} × ₹${it.price}</div></div><div class="cart-right">₹${it.price*it.quantity}</div>`;
    cont.appendChild(div);
    total += it.price*it.quantity;
  });
  updateBill(cart);
}

function calculateBill(cart){
  const itemTotal = cart.reduce((s,it)=>s + (it.price||0)*(it.quantity||1), 0);
  const tax = Math.round(itemTotal * 0.05 * 100) / 100; // 5% GST
  let handling = 10; // default handling
  let delivery = 30; // default delivery
  let discount = 0;

  if (appliedCoupon){
    const code = appliedCoupon.code;
    if (code === 'SAVE10') {
      discount = Math.round(itemTotal * 0.10 * 100) / 100; // 10% off
    } else if (code === 'FREESHIP') {
      delivery = 0;
    } else if (code === 'SAVE70') {
      if (itemTotal >= 200) discount = 70;
    }
  }

  const total = Math.max(0, Math.round((itemTotal + tax + handling + delivery - discount) * 100) / 100);
  const savings = Math.round((discount + (appliedCoupon && appliedCoupon.code==='FREESHIP' ? 30 : 0)) * 100) / 100;
  return { itemTotal, tax, handling, delivery, discount, total, savings };
}

function updateBill(cart){
  const bill = calculateBill(cart);
  document.getElementById('bill-item-total').innerText = `₹${bill.itemTotal}`;
  document.getElementById('bill-tax').innerText = `₹${bill.tax}`;
  document.getElementById('bill-handling').innerText = bill.handling ? `₹${bill.handling}` : 'FREE';
  document.getElementById('bill-delivery').innerText = bill.delivery ? `₹${bill.delivery}` : 'FREE';
  document.getElementById('bill-to-pay').innerText = `₹${bill.total}`;
  const sb = document.getElementById('savings-banner');
  if (bill.savings > 0) { sb.style.display='block'; sb.innerText = `Yay! You saved ₹${bill.savings} on this order`; } else { sb.style.display='none'; sb.innerText = ''; }
}

function applyCouponCode(code){
  if(!code) return { ok:false, msg:'Enter a coupon code' };
  code = code.trim().toUpperCase();
  const valid = ['SAVE10','FREESHIP','SAVE70'];
  if (!valid.includes(code)) return { ok:false, msg:'Invalid coupon' };
  appliedCoupon = { code };
  localStorage.setItem('coupon', JSON.stringify(appliedCoupon));
  renderCart();
  return { ok:true, msg:'Coupon applied' };
}

function renderOrderConfirmation(order){
  const node = document.getElementById('confirmation');
  if(!node) return;
  const itemsHtml = (order.items||[]).map(it=>{
    const subtotal = (it.price||0)*(it.quantity||1);
    return `<li>${it.name} × ${it.quantity} — ₹${subtotal}</li>`;
  }).join('');
  const placed = order.createdAt ? new Date(order.createdAt).toLocaleString() : '';
  node.innerHTML = `
    <div class="order-confirm">
      <h3>Order Confirmed</h3>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Placed:</strong> ${placed}</p>
      <h4>Items</h4>
      <ul>${itemsHtml}</ul>
      <p><strong>Total:</strong> ₹${order.total}</p>
      <h4>Delivery Details</h4>
      <p>Name: ${order.customer?.name || ''}</p>
      <p>Email: ${order.customer?.email || ''}</p>
      <p>Address: ${order.customer?.address || ''}</p>
      <p>Estimated delivery: 30-60 minutes</p>
    </div>
  `;
  // clear cart UI
  localStorage.removeItem('cart');
  localStorage.removeItem('coupon');
  appliedCoupon = null;
  renderCart();
}

document.getElementById('apply-coupon')?.addEventListener('click', ()=>{
  const code = document.getElementById('coupon-input').value;
  const r = applyCouponCode(code);
  if (!r.ok) alert(r.msg); else alert(r.msg);
});

document.getElementById('place-order')?.addEventListener('click', async () => {
  const items = JSON.parse(localStorage.getItem('cart')||'[]');
  if (!items.length) return alert('Cart empty');
  const customer = { name: document.getElementById('name').value, email: document.getElementById('email').value, address: document.getElementById('address').value };
  const res = await fetch('/api/cart/checkout', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ items, customer }) });
  const j = await res.json();
  if (j.ok && j.order) { renderOrderConfirmation(j.order); }
  else if (j.ok) { document.getElementById('confirmation').innerText = 'Order placed. ID: ' + (j.orderId || ''); localStorage.removeItem('cart'); renderCart(); }
  else alert(j.error||'Error placing order');
});

// initialize coupon from storage
try{ appliedCoupon = JSON.parse(localStorage.getItem('coupon')||'null'); }catch(e){ appliedCoupon = null; }

renderCart();
