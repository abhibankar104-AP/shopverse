const ShopStore = (() => {
  const CART_KEY = 'shopverse-cart';
  const ORDERS_KEY = 'shopverse-orders';
  const SESSION_KEY = 'shopverse-session';
  const read = (key, fallback) => { try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const cart = () => read(CART_KEY, []);
  const saveCart = value => write(CART_KEY, value);
  const session = () => read(SESSION_KEY, null);
  const orders = () => read(ORDERS_KEY, []);
  const saveOrders = value => write(ORDERS_KEY, value);
  const money = value => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(Number(value)||0);
  const count = () => cart().reduce((sum, item) => sum + Math.max(0, Number(item.quantity)||0), 0);
  const setHeader = () => {
    const countEl = document.querySelector('#cartCount'); if (countEl) countEl.textContent = String(count());
    const link = document.querySelector('#accountLink'); const user = session();
    if (link && user) { link.textContent = 'My account'; link.href = 'account.html'; }
  };
  const toast = message => { let el=document.querySelector('#toast'); if(!el){el=document.createElement('div');el.id='toast';el.className='toast';el.setAttribute('role','status');document.body.appendChild(el);} el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2400); };
  const add = (id, quantity=1) => { const items=cart();const existing=items.find(x=>x.productId===id);if(existing)existing.quantity+=quantity;else items.push({productId:id,quantity});saveCart(items);setHeader(); };
  return {read,write,cart,saveCart,session,orders,saveOrders,money,count,setHeader,toast,add};
})();
document.addEventListener('DOMContentLoaded', ShopStore.setHeader);
