# ShopVerse — Phase 6

ShopVerse is a front-end learning project built with **HTML, CSS, vanilla JavaScript and JSON**. It includes six product categories and 300 sample products, product search and filters, demo customer signup/login, cart, checkout, order history, and a demo admin panel.

## Run locally

You need Python 3 installed (or another static web server). From this folder run:

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000>. Do not open `index.html` directly from the file system because the browser may block `fetch()` from `data/alldata.json`.

## Phase 7 additions

- Wishlist page with add/remove controls and saved item count
- Recently viewed products (last 12 product detail pages visited)
- Demo coupons in checkout: `SAVE10` (10% off up to ₹500), `FREESHIP`, `WELCOME100` (₹100 off orders ₹999+)
- ₹49 demo delivery charge for orders below ₹999; free delivery from ₹999
- These features use localStorage and remain local to the current browser. Coupons are client-side demonstrations, not secure promotions.

## Project map

- `index.html` — storefront
- `product.html` — product details
- `login.html`, `signup.html`, `account.html` — demo customer account screens
- `cart.html`, `checkout.html`, `orders.html`, `order-success.html` — demo purchase flow
- `admin/login.html`, `admin/dashboard.html` — demo admin screens
- `data/alldata.json` — 6 categories and 300 sample products (50 per category)
- `css/` — page styles
- `js/` — browser-side application logic

## Deploy to GitHub Pages

1. Create a GitHub repository (for example `shopverse`).
2. Upload the **contents** of this folder to the repository root, including `index.html`, `data/`, `css/`, `js/`, `admin/` and all other pages.
3. On GitHub open **Settings → Pages**.
4. Under Build and deployment, choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
5. Wait for the Pages deployment to finish and open the URL shown in the Pages section.
6. If you change code, commit and push the changes; GitHub Pages will redeploy.

Keep file and folder names exactly as they are. Paths are case-sensitive on hosting services. Test product loading, login screens, cart and checkout on the deployed URL.

## Important security limitations

This is a **front-end demo**, not a production-ready shop. `localStorage` is editable by visitors and only exists in that browser. Admin credentials and role checks implemented in browser JavaScript are not secret and cannot secure admin actions. Customer passwords, orders, stock and product edits are not stored in a trusted shared database. Checkout does not charge real money. Never use real customer data or real payment details in this demo.

For a production release, add a backend API, server-side authentication and authorization, a database, server-side price/stock/order validation, secure password hashing, HTTPS, and a payment provider integration. Never store payment card details yourself.


## Phase 9 updates
- Separate pages for all six categories in `categories/`.
- Homepage category carousels with four-card desktop windows and previous/next controls.
- Responsive hamburger navigation on small screens.
- Real SMS OTP and order SMS are not activated: secure server endpoint, provider credentials and applicable India SMS sender/template compliance are required. See `PHASE-9-MARATHI.txt`.

## Phase 11 — Admin panel improvements
- Product thumbnails in the admin product table and image preview in the editor.
- Add, edit, delete and quick-edit original/offer prices.
- Search and category filtering, plus catalogue JSON export and reset of local demo changes.
- Changes still live in the current browser's localStorage only. The static front end cannot rewrite `data/alldata.json` or sync catalogue edits across users/devices. Production use requires a protected backend and database.
- Open `admin/login.html` to access the demo admin panel. Demo credentials are shown on that page.


## Phase 12 — Portfolio Footer
Every storefront page now credits Mr. Abhishek Shankar Bankar and includes a styled **Explore Portfolio** button linking to https://portfoliofabhishek.netlify.app/. The link opens in a new tab. See `PHASE-12-PORTFOLIO-FOOTER.txt`.
