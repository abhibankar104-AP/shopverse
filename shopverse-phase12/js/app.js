const DATA_URL = 'data/alldata.json';
const PRODUCTS_PER_PAGE = 12;
const WISHLIST_KEY = 'shopverse-wishlist';
function readWishlist(){ try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; } catch { return []; } }
function saveWishlist(items){ localStorage.setItem(WISHLIST_KEY, JSON.stringify([...new Set(items)])); updateWishlistCount(); }
function updateWishlistCount(){ const el=document.querySelector('#wishlistCount'); if(el) el.textContent=`♡ ${readWishlist().length}`; }

const categoryIcons = {
  fashion: '✦', electronics: '⌁', 'home-kitchen': '⌂', beauty: '✿', sports: '↗', books: '▤'
};
const fallbackEmojis = {
  fashion: '🧥', electronics: '🎧', 'home-kitchen': '☕', beauty: '🧴', sports: '🏃', books: '📚'
};

const state = {
  products: [],
  categories: [],
  activeCategory: 'all',
  searchTerm: '',
  sortBy: 'featured',
  minPrice: '',
  maxPrice: '',
  inStockOnly: false,
  visibleCount: PRODUCTS_PER_PAGE,
  cart: readCart()
};

const els = {
  categoryGrid: document.querySelector('#categoryGrid'),
  productGrid: document.querySelector('#productGrid'),
  searchInput: document.querySelector('#searchInput'),
  sortSelect: document.querySelector('#sortSelect'),
  productSectionTitle: document.querySelector('#productSectionTitle'),
  resultsLine: document.querySelector('#resultsLine'),
  loadMoreButton: document.querySelector('#loadMoreButton'),
  clearFilterButton: document.querySelector('#clearFilterButton'),
  cartCount: document.querySelector('#cartCount'),
  cartButton: document.querySelector('#cartButton'),
  accountLink: document.querySelector('#accountLink'),
  toast: document.querySelector('#toast'),
  categoryFilter: document.querySelector('#categoryFilter'),
  minPrice: document.querySelector('#minPrice'),
  maxPrice: document.querySelector('#maxPrice'),
  inStockOnly: document.querySelector('#inStockOnly'),
  resetFiltersButton: document.querySelector('#resetFiltersButton')
};

function readCart() {
  try { return JSON.parse(localStorage.getItem('shopverse-cart')) || []; }
  catch { return []; }
}

function saveCart() {
  localStorage.setItem('shopverse-cart', JSON.stringify(state.cart));
  updateCartCount();
}

function updateCartCount() {
  const total = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  els.cartCount.textContent = total > 99 ? '99+' : String(total);
}

function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function getFilteredProducts() {
  let items = [...state.products];
  if (state.activeCategory !== 'all') items = items.filter(product => product.categoryId === state.activeCategory);
  if (state.minPrice !== '' && Number.isFinite(Number(state.minPrice))) items = items.filter(product => product.offerPrice >= Number(state.minPrice));
  if (state.maxPrice !== '' && Number.isFinite(Number(state.maxPrice))) items = items.filter(product => product.offerPrice <= Number(state.maxPrice));
  if (state.inStockOnly) items = items.filter(product => Number(product.stock) > 0);
  if (state.searchTerm.trim()) {
    const term = state.searchTerm.toLowerCase().trim();
    items = items.filter(product => `${product.name} ${product.description} ${product.categoryName}`.toLowerCase().includes(term));
  }
  if (state.sortBy === 'price-low') items.sort((a, b) => a.offerPrice - b.offerPrice);
  if (state.sortBy === 'price-high') items.sort((a, b) => b.offerPrice - a.offerPrice);
  if (state.sortBy === 'name') items.sort((a, b) => a.name.localeCompare(b.name));
  return items;
}

function renderCategories() {
  const allTile = `<button class="category-tile ${state.activeCategory === 'all' ? 'selected' : ''}" data-category="all" type="button"><span class="category-icon">✧</span><span><strong>All products</strong><small>${state.products.length} items</small></span></button>`;
  const tiles = state.categories.map(category => `
    <button class="category-tile ${state.activeCategory === category.id ? 'selected' : ''}" data-category="${escapeHTML(category.id)}" type="button">
      <span class="category-icon">${categoryIcons[category.id] || '✦'}</span>
      <span><strong>${escapeHTML(category.name)}</strong><small>${category.productCount} products</small></span>
    </button>`).join('');
  els.categoryGrid.innerHTML = allTile + tiles;
  if (els.categoryFilter) {
    const current = els.categoryFilter.value || 'all';
    els.categoryFilter.innerHTML = '<option value="all">All categories</option>' + state.categories.map(category => `<option value="${escapeHTML(category.id)}">${escapeHTML(category.name)}</option>`).join('');
    els.categoryFilter.value = state.categories.some(category => category.id === current) || current === 'all' ? current : state.activeCategory;
  }
}

function productCard(product) {
  const discount = Math.max(0, Math.round((1 - product.offerPrice / product.price) * 100));
  const imageMarkup = product.image
    ? `<img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.hidden=false"><div class="product-placeholder" hidden>${fallbackEmojis[product.categoryId] || '✦'}</div>`
    : `<div class="product-placeholder">${fallbackEmojis[product.categoryId] || '✦'}</div>`;
  return `<article class="product-card">
    <div class="product-image-wrap">${imageMarkup}<span class="discount-badge">${discount}% OFF</span><button class="wishlist-toggle" type="button" data-action="wishlist" data-id="${escapeHTML(product.id)}" aria-label="Toggle wishlist" title="Save to wishlist">${readWishlist().includes(product.id) ? '♥' : '♡'}</button></div>
    <div class="product-info"><p class="product-category">${escapeHTML(product.categoryName)}</p>
      <h3><a href="product.html?id=${encodeURIComponent(product.id)}">${escapeHTML(product.name)}</a></h3><p class="product-description">${escapeHTML(product.description)}</p>
      <div class="price-row"><span class="offer-price">${formatPrice(product.offerPrice)}</span><span class="original-price">${formatPrice(product.price)}</span></div>
      <div class="product-actions"><button class="add-cart" type="button" data-action="add" data-id="${escapeHTML(product.id)}">Add to cart</button><button class="buy-now" type="button" data-action="buy" data-id="${escapeHTML(product.id)}">Buy now ↗</button></div><a class="view-details" href="product.html?id=${encodeURIComponent(product.id)}">View product details ↗</a>
    </div></article>`;
}

function renderProducts() {
  const filtered = getFilteredProducts();
  const visible = filtered.slice(0, state.visibleCount);
  const category = state.categories.find(item => item.id === state.activeCategory);
  els.productSectionTitle.textContent = category ? category.name : (state.searchTerm ? 'Search results' : 'Popular picks');
  els.resultsLine.textContent = `Showing ${visible.length} of ${filtered.length} products`;
  els.clearFilterButton.hidden = state.activeCategory === 'all' && !state.searchTerm && state.minPrice === '' && state.maxPrice === '' && !state.inStockOnly;
  els.loadMoreButton.hidden = visible.length >= filtered.length;
  els.productGrid.innerHTML = visible.length
    ? visible.map(productCard).join('')
    : `<div class="empty-state"><strong>No products found</strong><span>Try another search or clear your category filter.</span></div>`;
}


function renderHomeCategoryShowcases() {
  const host = document.querySelector('#homeCategoryShowcases');
  if (!host) return;
  host.innerHTML = state.categories.map(category => {
    const items = state.products.filter(product => product.categoryId === category.id).slice(0, 12);
    if (!items.length) return '';
    return `<section class="category-showcase" aria-labelledby="showcase-${escapeHTML(category.id)}">
      <div class="showcase-heading"><div><p class="eyebrow">CURATED FOR YOU</p><h3 id="showcase-${escapeHTML(category.id)}">${escapeHTML(category.name)}</h3><p>${escapeHTML(category.description || 'Explore the collection')}</p></div>
      <div class="showcase-actions"><a class="showcase-view-all" href="categories/${encodeURIComponent(category.id)}.html">View all ↗</a><button class="carousel-arrow" type="button" data-carousel="${escapeHTML(category.id)}" data-direction="prev" aria-label="Previous ${escapeHTML(category.name)} products">←</button><button class="carousel-arrow" type="button" data-carousel="${escapeHTML(category.id)}" data-direction="next" aria-label="Next ${escapeHTML(category.name)} products">→</button></div></div>
      <div class="category-carousel" id="carousel-${escapeHTML(category.id)}">${items.map(product => `<div class="carousel-product">${productCard(product)}</div>`).join('')}</div>
    </section>`;
  }).join('');
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => els.toast.classList.remove('show'), 2300);
}

function addToCart(productId) {
  const product = state.products.find(item => item.id === productId);
  if (!product) return;
  const existing = state.cart.find(item => item.productId === productId);
  if (existing) existing.quantity += 1;
  else state.cart.push({ productId, quantity: 1 });
  saveCart();
  showToast(`${product.name} added to your cart`);
}

function handleProductAction(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === 'add') { addToCart(id); }
  if (action === 'buy') { addToCart(id); window.location.href = 'checkout.html'; }
  if (action === 'wishlist') { const items=readWishlist(); const exists=items.includes(id); saveWishlist(exists?items.filter(x=>x!==id):[...items,id]); renderProducts(); showToast(exists?'Removed from wishlist':'Saved to wishlist'); }
}

function setCategory(categoryId) {
  state.activeCategory = categoryId;
  if (els.categoryFilter) els.categoryFilter.value = categoryId;
  state.visibleCount = PRODUCTS_PER_PAGE;
  renderCategories();
  renderProducts();
  document.querySelector('#products').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function init() {
  els.currentYear;
  document.querySelector('#currentYear').textContent = new Date().getFullYear();
  updateCartCount();
  updateWishlistCount();
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`Could not load ${DATA_URL} (${response.status})`);
    const data = await response.json();
    if (!Array.isArray(data.categories) || !Array.isArray(data.products)) throw new Error('JSON format is invalid. Expected categories and products arrays.');
    state.categories = data.categories;
    state.products = window.ShopCatalog ? window.ShopCatalog.all(data.products) : data.products;
    const countByCategory = Object.fromEntries(state.categories.map(category => [category.id, 0]));
    state.products.forEach(product => { if (countByCategory[product.categoryId] !== undefined) countByCategory[product.categoryId] += 1; });
    state.categories = state.categories.map(category => ({ ...category, productCount: countByCategory[category.id] }));
    renderCategories();
    renderProducts();
    renderHomeCategoryShowcases();
  } catch (error) {
    console.error(error);
    els.categoryGrid.innerHTML = '<p class="loading-message">Could not load categories.</p>';
    els.productGrid.innerHTML = `<div class="empty-state"><strong>Products could not load</strong><span>Run this project with a local server and confirm data/alldata.json exists. Details: ${escapeHTML(error.message)}</span></div>`;
    els.resultsLine.textContent = 'Unable to load product data.';
  }
}

document.querySelector('#homeCategoryShowcases')?.addEventListener('click', event => {
  const arrow = event.target.closest('[data-carousel][data-direction]');
  if (!arrow) return;
  const track = document.querySelector(`#carousel-${CSS.escape(arrow.dataset.carousel)}`);
  if (!track) return;
  const card = track.querySelector('.carousel-product');
  const distance = card ? (card.getBoundingClientRect().width + 18) * 4 : track.clientWidth;
  track.scrollBy({ left: arrow.dataset.direction === 'next' ? distance : -distance, behavior: 'smooth' });
});

els.categoryGrid.addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (button) setCategory(button.dataset.category);
});
els.productGrid.addEventListener('click', handleProductAction);
document.querySelector('#homeCategoryShowcases')?.addEventListener('click', handleProductAction);
els.searchInput.addEventListener('input', event => {
  state.searchTerm = event.target.value;
  state.visibleCount = PRODUCTS_PER_PAGE;
  renderProducts();
});
els.sortSelect.addEventListener('change', event => {
  state.sortBy = event.target.value;
  renderProducts();
});
els.loadMoreButton.addEventListener('click', () => {
  state.visibleCount += PRODUCTS_PER_PAGE;
  renderProducts();
});
els.clearFilterButton.addEventListener('click', () => {
  state.activeCategory = 'all';
  state.searchTerm = '';
  state.minPrice = ''; state.maxPrice = ''; state.inStockOnly = false;
  els.searchInput.value = '';
  if (els.categoryFilter) els.categoryFilter.value = 'all';
  if (els.minPrice) els.minPrice.value = '';
  if (els.maxPrice) els.maxPrice.value = '';
  if (els.inStockOnly) els.inStockOnly.checked = false;
  state.visibleCount = PRODUCTS_PER_PAGE;
  renderCategories();
  renderProducts();
});
els.cartButton.addEventListener('click', () => { window.location.href = 'cart.html'; });
if (els.accountLink) {
  const session = readCustomerSession();
  if (session) { els.accountLink.textContent = 'My account'; els.accountLink.href = 'account.html'; }
}

function readCustomerSession() {
  try { return JSON.parse(localStorage.getItem('shopverse-session')); } catch { return null; }
}

if (els.categoryFilter) els.categoryFilter.addEventListener('change', event => setCategory(event.target.value));
if (els.minPrice) els.minPrice.addEventListener('input', event => { state.minPrice = event.target.value; state.visibleCount = PRODUCTS_PER_PAGE; renderProducts(); });
if (els.maxPrice) els.maxPrice.addEventListener('input', event => { state.maxPrice = event.target.value; state.visibleCount = PRODUCTS_PER_PAGE; renderProducts(); });
if (els.inStockOnly) els.inStockOnly.addEventListener('change', event => { state.inStockOnly = event.target.checked; state.visibleCount = PRODUCTS_PER_PAGE; renderProducts(); });
if (els.resetFiltersButton) els.resetFiltersButton.addEventListener('click', () => els.clearFilterButton.click());

init();
