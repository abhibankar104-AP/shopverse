(() => {
  const host = document.querySelector('.category-page');
  if (!host) return;
  const categoryId = host.dataset.category;
  const grid = document.querySelector('#categoryProductGrid');
  const search = document.querySelector('#categorySearch');
  const sort = document.querySelector('#categorySort');
  const count = document.querySelector('#categoryProductCount');
  const empty = document.querySelector('#categoryEmpty');
  const toast = document.querySelector('#toast');
  let products = [];
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('shopverse-cart')) || []; } catch {}
  const money = amount => new Intl.NumberFormat('en-IN', {style:'currency',currency:'INR',maximumFractionDigits:0}).format(amount);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const emojis = {fashion:'🧥',electronics:'🎧','home-kitchen':'☕',beauty:'🧴',sports:'🏃',books:'📚'};
  function card(p) {
    const discount = Math.max(0, Math.round((1 - p.offerPrice / p.price) * 100));
    const imagePath = p.image ? `../${p.image}` : '';
    const image = imagePath ? `<img src="${esc(imagePath)}" alt="${esc(p.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.hidden=false"><div class="product-placeholder" hidden>${emojis[p.categoryId]||'✦'}</div>` : `<div class="product-placeholder">${emojis[p.categoryId]||'✦'}</div>`;
    let wish=[]; try{wish=JSON.parse(localStorage.getItem('shopverse-wishlist'))||[]}catch{}
    return `<article class="product-card"><div class="product-image-wrap">${image}<span class="discount-badge">${discount}% OFF</span><button class="wishlist-toggle" type="button" data-action="wish" data-id="${esc(p.id)}" aria-label="Save to wishlist">${wish.includes(p.id)?'♥':'♡'}</button></div><div class="product-info"><p class="product-category">${esc(p.categoryName)}</p><h3><a href="../product.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a></h3><p class="product-description">${esc(p.description)}</p><div class="price-row"><span class="offer-price">${money(p.offerPrice)}</span><span class="original-price">${money(p.price)}</span></div><div class="product-actions"><button class="add-cart-button" type="button" data-action="add" data-id="${esc(p.id)}">Add to cart</button><button class="buy-button" type="button" data-action="buy" data-id="${esc(p.id)}">Buy now ↗</button></div><a class="view-details" href="../product.html?id=${encodeURIComponent(p.id)}">View product details ↗</a></div></article>`;
  }
  function render(){
    const q=search.value.trim().toLowerCase(); let items=products.filter(p=>`${p.name} ${p.description}`.toLowerCase().includes(q));
    if(sort.value==='price-low')items.sort((a,b)=>a.offerPrice-b.offerPrice); if(sort.value==='price-high')items.sort((a,b)=>b.offerPrice-a.offerPrice); if(sort.value==='name')items.sort((a,b)=>a.name.localeCompare(b.name));
    grid.innerHTML=items.map(card).join(''); count.textContent=`${products.length} products in this collection`; empty.hidden=items.length>0;
  }
  function notify(message){toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200)}
  grid.addEventListener('click', e=>{const b=e.target.closest('[data-action]');if(!b)return;const p=products.find(x=>x.id===b.dataset.id);if(!p)return;
    if(b.dataset.action==='wish'){let list=[];try{list=JSON.parse(localStorage.getItem('shopverse-wishlist'))||[]}catch{};list=list.includes(p.id)?list.filter(x=>x!==p.id):[...list,p.id];localStorage.setItem('shopverse-wishlist',JSON.stringify(list));render();notify(list.includes(p.id)?'Saved to wishlist':'Removed from wishlist');return;}
    const old=cart.find(x=>x.productId===p.id);if(old)old.quantity++;else cart.push({productId:p.id,quantity:1});localStorage.setItem('shopverse-cart',JSON.stringify(cart));
    if(b.dataset.action==='buy'){location.href='../checkout.html';return;}notify(`${p.name} added to cart`);
  });
  search.addEventListener('input',render);sort.addEventListener('change',render);document.querySelector('#currentYear').textContent=new Date().getFullYear();
  fetch('../data/alldata.json').then(r=>{if(!r.ok)throw Error('Could not load product data');return r.json()}).then(data=>{const all=window.ShopCatalog?window.ShopCatalog.all(data.products):data.products;products=all.filter(p=>p.categoryId===categoryId);render()}).catch(err=>{grid.innerHTML=`<div class="empty-state"><strong>Products could not load</strong><span>${esc(err.message)}. Please run the website with a local server.</span></div>`});
})();
