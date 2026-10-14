/* ShopVerse Phase 11 admin workspace. Browser-only demo; not production security. */
const ADMIN_EMAIL = 'admin@shopverse.demo';
const ADMIN_PASSWORD = 'ShopVerse@123';
const ADMIN_SESSION = 'shopverse-admin-session';
const OVERRIDES_KEY = 'shopverse-product-overrides';
const DELETED_KEY = 'shopverse-deleted-products';
const $ = selector => document.querySelector(selector);
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
const money = value => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(Number(value) || 0);
let baseData = null;
let currentProducts = [];

function adminToast(message) {
  const element = $('#adminToast');
  if (!element) return;
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(adminToast.timer);
  adminToast.timer = setTimeout(() => element.classList.remove('show'), 2800);
}
function showAdminMessage(message) {
  const box = $('#adminMessage');
  if (!box) return;
  box.textContent = message;
  box.className = 'auth-message show error';
}

const loginForm = $('#adminLoginForm');
if (loginForm) loginForm.addEventListener('submit', event => {
  event.preventDefault();
  const email = $('#adminEmail').value.trim().toLowerCase();
  const password = $('#adminPassword').value;
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    showAdminMessage('ईमेल किंवा पासवर्ड चुकीचा आहे.');
    return;
  }
  sessionStorage.setItem(ADMIN_SESSION, JSON.stringify({ email, role:'admin', signedInAt:new Date().toISOString() }));
  location.href = 'dashboard.html';
});

$('#adminLogout')?.addEventListener('click', () => {
  sessionStorage.removeItem(ADMIN_SESSION);
  location.href = 'login.html';
});

function getProducts() {
  return window.ShopCatalog ? window.ShopCatalog.all(baseData?.products || []) : (baseData?.products || []);
}
function renderAll() {
  currentProducts = getProducts();
  const orders = read('shopverse-orders', []);
  $('#statProducts').textContent = currentProducts.length;
  $('#statOrders').textContent = orders.length;
  $('#statSales').textContent = money(orders.filter(order => order.status !== 'Cancelled').reduce((sum, order) => sum + (Number(order.total) || 0), 0));
  $('#statLowStock').textContent = currentProducts.filter(product => Number(product.stock) <= 5).length;
  renderProducts();
  renderOrders();
}
function imageSource(path) {
  const value = String(path || '').trim();
  if (!value) return '';
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  return `../${value.replace(/^\.\//, '')}`;
}
function renderProducts() {
  const query = ($('#productSearch')?.value || '').trim().toLowerCase();
  const categoryId = $('#productCategoryFilter')?.value || 'all';
  const list = currentProducts.filter(product => (categoryId === 'all' || product.categoryId === categoryId) && `${product.name} ${product.sku} ${product.id}`.toLowerCase().includes(query));
  $('#productRows').innerHTML = list.length ? list.map(product => {
    const image = product.image ? `<img class="admin-product-thumb" src="${esc(imageSource(product.image))}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.hidden=false"><span class="admin-thumb-fallback" hidden>✦</span>` : '<span class="admin-thumb-fallback">✦</span>';
    return `<tr>
      <td><div class="admin-product-cell">${image}<div><strong>${esc(product.name)}</strong><small class="admin-subline">${esc(product.id)} · ${esc(product.sku || 'No SKU')}</small></div></div></td>
      <td>${esc(product.categoryName || baseData.categories.find(category => category.id === product.categoryId)?.name || product.categoryId)}</td>
      <td><strong>${money(product.offerPrice)}</strong><small class="admin-subline"><s>${money(product.price)}</s> · Offer price</small><button class="admin-quick-price" type="button" data-quick-price="${esc(product.id)}">Quick edit price</button></td>
      <td><span class="${Number(product.stock) <= 5 ? 'stock-low' : 'stock-ok'}">${Number(product.stock) || 0} in stock</span></td>
      <td><div class="table-actions"><button class="admin-secondary" type="button" data-edit="${esc(product.id)}">Edit</button><button class="admin-danger" type="button" data-delete="${esc(product.id)}">Delete</button></div></td>
    </tr>`;
  }).join('') : '<tr><td colspan="5">No matching products found.</td></tr>';
}
function renderOrders() {
  const filter = $('#orderStatusFilter')?.value || 'all';
  const orders = read('shopverse-orders', []).filter(order => filter === 'all' || order.status === filter);
  const statuses = ['Placed (demo)', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  $('#orderRows').innerHTML = orders.length ? orders.map(order => `<tr>
    <td><strong>${esc(order.id)}</strong><small class="admin-subline">${(order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0)} item(s)</small></td>
    <td>${esc(order.customerName || order.deliveryAddress?.fullName || order.userEmail || 'Customer')}<small class="admin-subline">${esc(order.userEmail || '')}</small></td>
    <td>${order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '—'}</td>
    <td><strong>${money(order.total)}</strong></td><td><span class="status-pill">${esc(order.status || 'Placed (demo)')}</span></td>
    <td><select data-order-status="${esc(order.id)}" aria-label="Update ${esc(order.id)} status">${statuses.map(status => `<option ${status === (order.status || 'Placed (demo)') ? 'selected' : ''}>${status}</option>`).join('')}</select></td>
  </tr>`).join('') : '<tr><td colspan="6">No orders found yet. Place a demo order from the storefront first.</td></tr>';
}
function updateImagePreview() {
  const value = $('#productForm')?.elements.image.value.trim();
  const wrap = $('#adminImagePreviewWrap');
  const image = $('#adminImagePreview');
  if (!wrap || !image) return;
  if (!value) { wrap.hidden = true; image.removeAttribute('src'); return; }
  wrap.hidden = false;
  image.src = imageSource(value);
  image.onerror = () => { wrap.hidden = true; };
}
function openProduct(product = null) {
  const dialog = $('#productDialog');
  const form = $('#productForm');
  form.reset();
  $('#productFormMessage').textContent = '';
  $('#productDialogTitle').textContent = product ? 'Edit product' : 'Add product';
  form.elements.id.value = product?.id || '';
  form.elements.name.value = product?.name || '';
  form.elements.categoryId.value = product?.categoryId || baseData.categories[0].id;
  form.elements.sku.value = product?.sku || '';
  form.elements.image.value = product?.image || '';
  form.elements.price.value = product?.price ?? '';
  form.elements.offerPrice.value = product?.offerPrice ?? '';
  form.elements.stock.value = product?.stock ?? 0;
  form.elements.rating.value = product?.rating ?? 4;
  form.elements.description.value = product?.description || '';
  form.elements.featured.checked = Boolean(product?.featured);
  updateImagePreview();
  dialog.showModal();
}
function quickEditPrice(id) {
  const product = currentProducts.find(item => item.id === id);
  if (!product) return;
  const original = prompt(`Original price for “${product.name}” (₹):`, String(product.price));
  if (original === null) return;
  const offer = prompt(`Offer price for “${product.name}” (₹):`, String(product.offerPrice));
  if (offer === null) return;
  const price = Number(original), offerPrice = Number(offer);
  if (!Number.isFinite(price) || !Number.isFinite(offerPrice) || price <= 0 || offerPrice <= 0 || offerPrice > price) {
    alert('कृपया योग्य किंमत भरा. Offer price ही 0 पेक्षा जास्त आणि मूळ किंमतीपेक्षा कमी किंवा समान असावी.');
    return;
  }
  window.ShopCatalog.save({ ...product, price, offerPrice });
  renderAll();
  adminToast('Product prices updated in this browser. Storefront वर बदल पाहण्यासाठी पान refresh करा.');
}
function exportCatalogue() {
  const payload = { exportedAt:new Date().toISOString(), note:'ShopVerse browser demo catalogue export. Import is not enabled; this file is a backup/reference.', products:currentProducts };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `shopverse-catalogue-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
  adminToast('Catalogue backup downloaded.');
}
function resetCatalogue() {
  if (!confirm('Reset all product edits, added products, and deletions in this browser? This cannot be undone.')) return;
  localStorage.removeItem(OVERRIDES_KEY);
  localStorage.removeItem(DELETED_KEY);
  renderAll();
  adminToast('Catalogue restored to the original demo data.');
}

$('#newProductBtn')?.addEventListener('click', () => openProduct());
$('#closeProductDialog')?.addEventListener('click', () => $('#productDialog').close());
$('#cancelProductDialog')?.addEventListener('click', () => $('#productDialog').close());
$('#productForm')?.elements.image.addEventListener('input', updateImagePreview);
$('#productSearch')?.addEventListener('input', renderProducts);
$('#productCategoryFilter')?.addEventListener('change', renderProducts);
$('#orderStatusFilter')?.addEventListener('change', renderOrders);
$('#exportCatalogueBtn')?.addEventListener('click', exportCatalogue);
$('#resetCatalogueBtn')?.addEventListener('click', resetCatalogue);

$('#productRows')?.addEventListener('click', event => {
  const edit = event.target.closest('[data-edit]');
  const remove = event.target.closest('[data-delete]');
  const quick = event.target.closest('[data-quick-price]');
  if (edit) { const product = currentProducts.find(item => item.id === edit.dataset.edit); if (product) openProduct(product); }
  if (quick) quickEditPrice(quick.dataset.quickPrice);
  if (remove) {
    const product = currentProducts.find(item => item.id === remove.dataset.delete);
    if (!product || !confirm(`Delete “${product.name}” from this browser's storefront catalogue?`)) return;
    window.ShopCatalog.remove(product.id);
    renderAll();
    adminToast('Product removed from this browser catalogue.');
  }
});

$('#productForm')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const id = String(data.get('id') || '').trim();
  const name = String(data.get('name') || '').trim();
  const sku = String(data.get('sku') || '').trim();
  const category = baseData.categories.find(item => item.id === data.get('categoryId'));
  const price = Number(data.get('price'));
  const offerPrice = Number(data.get('offerPrice'));
  const stock = Number(data.get('stock'));
  const rating = Number(data.get('rating'));
  const image = String(data.get('image') || '').trim();
  if (!category) { $('#productFormMessage').textContent = 'Please choose a valid category.'; return; }
  if (!Number.isFinite(price) || !Number.isFinite(offerPrice) || price <= 0 || offerPrice <= 0 || offerPrice > price) { $('#productFormMessage').textContent = 'Offer price must be greater than 0 and no more than original price.'; return; }
  if (!Number.isInteger(stock) || stock < 0 || !Number.isFinite(rating) || rating < 0 || rating > 5) { $('#productFormMessage').textContent = 'Check stock and rating values.'; return; }
  if (!sku) { $('#productFormMessage').textContent = 'SKU is required.'; return; }
  if (currentProducts.some(product => product.id !== id && String(product.sku || '').toLowerCase() === sku.toLowerCase())) { $('#productFormMessage').textContent = 'SKU must be unique.'; return; }
  const productId = id || `${category.id}-${Date.now().toString(36)}`;
  const existing = currentProducts.find(product => product.id === productId);
  const product = { id:productId, categoryId:category.id, categoryName:category.name, name, description:String(data.get('description') || '').trim(), price, offerPrice, image, sku, stock, rating, featured:data.get('featured') === 'on', ...(existing?.isNew || !id ? { isNew:true } : {}) };
  window.ShopCatalog.save(product);
  $('#productDialog').close();
  renderAll();
  adminToast(existing ? 'Product updated successfully.' : 'Product added to this browser catalogue.');
});

$('#orderRows')?.addEventListener('change', event => {
  const select = event.target.closest('[data-order-status]');
  if (!select) return;
  const orders = read('shopverse-orders', []);
  const order = orders.find(item => item.id === select.dataset.orderStatus);
  if (!order) return;
  order.status = select.value;
  write('shopverse-orders', orders);
  renderAll();
  adminToast(`Order ${order.id} updated.`);
});

async function loadAdmin() {
  if (!$('#statProducts')) return;
  let session = null;
  try { session = JSON.parse(sessionStorage.getItem(ADMIN_SESSION)); } catch {}
  if (!session || session.role !== 'admin') { location.replace('login.html'); return; }
  try {
    const response = await fetch('../data/alldata.json');
    if (!response.ok) throw new Error('Catalogue JSON not found');
    baseData = await response.json();
    $('#productCategoryFilter').innerHTML = '<option value="all">All categories</option>' + baseData.categories.map(category => `<option value="${esc(category.id)}">${esc(category.name)}</option>`).join('');
    $('#formCategory').innerHTML = baseData.categories.map(category => `<option value="${esc(category.id)}">${esc(category.name)}</option>`).join('');
    renderAll();
  } catch (error) {
    console.error(error);
    $('#productRows').innerHTML = '<tr><td colspan="5">Catalogue could not load. Run the website through a local server.</td></tr>';
  }
}
loadAdmin();
