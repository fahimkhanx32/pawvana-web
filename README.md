# Pawvana — pet-care storefront + admin dashboard

React 18 · Vite · Tailwind 3 · MUI (floating-label inputs) · Lucide icons · React Router 6.
Built against the **ecobazar-backend** (Express + MongoDB) without changing any API.

## Run it
```bash
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:5000
npm run dev              # must stay on http://localhost:5173
```
Port 5173 is fixed because the backend's emails and aamarPay URLs point to it.
Start the backend first (`npm start` in the backend folder).

## What's inside
| Area | Routes |
|---|---|
| Store | `/`, `/shop`, `/product/:slug`, `/wishlist`, `/cart`, `/checkout`, `/order-success` |
| Account | `/account`, `/account/orders` |
| Auth | `/login`, `/register`, `/forgot-password`, `/resetpassword/:token`, `/verifyemail/:token` |
| Dashboard (admin / editor / vendor) | `/admin`, `/admin/products`, `/admin/categories`; admin only: `/admin/orders`, `/admin/customers` |

* Light/dark mode (saved, no flash on load). Brand name, currency, delivery fees and divisions: `src/config/brand.js`.
* Every text input is an MUI outlined floating-label field with a leading icon (`src/components/ui/FloatField.jsx`); every button has an icon (`Button.jsx`).
* Designed from 320 px (Galaxy S Duos 2) up to desktop; phones get a bottom tab bar and bottom sheets.
* First admin: register normally, then set `role: "admin"` on that user in MongoDB.
* Products only show in the store when their **status is Active**.

## Backend issues found (the frontend works around them, but please fix)
1. **No route is protected.** Login returns no token, `secureMiddleWare` is never used, and `/update/:id` accepts any body, so anyone can call admin endpoints or make themselves admin. The dashboard guards only hide screens.
2. **Passwords hashes leak**: `GET /cart/:userId` and `GET /allusers` return full user documents. The frontend discards them immediately.
3. **Discounts are not charged.** Cart/checkout show the discounted price (`priceOf()` in `src/lib/helpers.js`), but `/payment` and `getCart` use `product.price`. Compute the same discount server-side before going live. The client-sent `shipping` amount is also trusted.
4. **Order status never changes** from `pending`, and there is no "all orders" endpoint (the dashboard fetches orders per customer). aamarPay POSTs to `/order-success`, which Vite cannot serve; add a backend success route that redirects to `/order-success?pay_status=success`. The page clears the cart only when it sees that parameter.
5. `cart/create` and `/category` respond before `save()` finishes (missing `await`); the UI waits briefly then refreshes.
6. Bulk upload inserts rows without the required `slug`, so it fails validation until slug generation is added.
7. `createProduct` rejects `stock < 1` and crashes if `tag` is missing; the form always sends it.
8. Rotate the Gmail app password and MongoDB credentials that are in the uploaded `.env` / `utils/email.js`.

## Not available from the API (so not built)
Username/phone login (login is email + password), phone saved at registration (it's applied on first login), product reviews, coupon codes, deleting/renaming categories, wishlist sync (stored on the device).
