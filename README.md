# Mini E-Commerce Application

A full-stack e-commerce web app where customers browse products, manage a cart and place Cash on Delivery (COD) orders, and admins manage products, categories, users and orders.

Built for the internship technical assignment.

## Features

**Customer**

- Register, log in and log out (JWT authentication)
- Browse products with search by name, category filter, pagination and stock status
- Product details page
- Cart: add items, change quantity, remove items, subtotal and total, quantity limited by available stock
- Checkout with a saved or new delivery address and Cash on Delivery
- Order confirmation, order history, order details and status tracking

**Admin**

- Dashboard with totals and recent orders
- Products: add, edit and delete, with image upload or image URL, price and stock management
- Categories: add, rename and delete
- Users: list with search, user details and order history
- Orders: list with status filter, order details and status updates (Pending, Confirmed, Shipped, Delivered, Cancelled)

## Tech stack

| Layer    | Technology                                                 |
| -------- | ---------------------------------------------------------- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, Axios |
| Backend  | Node.js, Express, TypeScript, Zod (validation)             |
| Database | PostgreSQL with Prisma ORM                                 |
| Auth     | JWT, bcrypt password hashing, role-based access control    |
| Uploads  | Multer (JPG, PNG, WebP, up to 2 MB)                        |

## Project structure

```
.
├── backend
│   ├── prisma/                 # schema and migrations
│   └── src
│       ├── config/             # env, Prisma client, paths
│       ├── middlewares/        # auth, validation, upload, error handler
│       ├── modules/            # auth, products, categories, cart,
│       │                       # addresses, orders, users (routes, controller,
│       │                       # service and schema for each)
│       ├── scripts/            # createAdmin seed script
│       └── utils/
└── frontend
    └── src
        ├── api/                # axios client and API functions
        ├── components/         # shared UI (navbar, layouts, forms...)
        ├── context/            # auth and cart providers
        ├── hooks/
        ├── pages/              # auth, customer and admin pages
        ├── routes/             # route guards
        ├── types/
        └── utils/
```

## Getting started

### Prerequisites

- Node.js 22 or newer
- PostgreSQL running locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env     # on Windows PowerShell: copy .env.example .env
```

Edit `.env` and set at least:

| Variable                                      | Description                              |
| --------------------------------------------- | ---------------------------------------- |
| `PORT`                                        | API port (default `5000`)                |
| `DATABASE_URL`                                | PostgreSQL connection string             |
| `JWT_SECRET`                                  | Long random string used to sign tokens   |
| `JWT_EXPIRES_IN`                              | Token lifetime, for example `7d`         |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Credentials for the seeded admin account |

Create the database (for example `ecommerce_db`), then:

```bash
npx prisma migrate deploy   # create the tables
npx prisma generate         # generate the Prisma client (src/generated is not committed)
npm run seed:admin          # create the admin user
npm run dev                 # start the API on http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health` returns `{ "status": "ok" }`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env     # set VITE_API_URL=http://localhost:5000
npm run dev              # http://localhost:5173
```

### 3. Try it

1. Log in with the admin email and password from `backend/.env`.
2. In the admin area, create a category and a few products.
3. Register a customer account (or log out and use the Register page), add products to the cart and place an order.
4. Log back in as admin and update the order status.

## Scripts

| Where    | Command                       | Purpose                              |
| -------- | ----------------------------- | ------------------------------------ |
| backend  | `npm run dev`                 | Start the API with auto-reload       |
| backend  | `npm run build` / `npm start` | Compile and run the production build |
| backend  | `npm run seed:admin`          | Create or promote the admin user     |
| frontend | `npm run dev`                 | Start the Vite dev server            |
| frontend | `npm run build`               | Type-check and build                 |
| frontend | `npm run lint`                | Run Oxlint                           |

## API overview

All responses use the envelope `{ "success": true, "data": ... }`. Errors return `{ "success": false, "message": "...", "errors": [{ "field", "message" }] }` with an appropriate HTTP status.

Protected routes expect `Authorization: Bearer <token>`.

| Area         | Method and path                                                                                                  | Access                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Auth         | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`                                            | Public, public, any user |
| Products     | `GET /api/products` (`search`, `categoryId`, `page`, `limit`), `GET /api/products/:id`                           | Public                   |
| Products     | `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`, `POST /api/products/upload-image`     | Admin                    |
| Categories   | `GET /api/categories`                                                                                            | Public                   |
| Categories   | `POST /api/categories`, `PUT /api/categories/:id`, `DELETE /api/categories/:id`                                  | Admin                    |
| Cart         | `GET /api/cart`, `POST /api/cart/items`, `PATCH /api/cart/items/:productId`, `DELETE /api/cart/items/:productId` | Customer                 |
| Addresses    | `GET /api/addresses`, `POST /api/addresses`, `PUT /api/addresses/:id`, `DELETE /api/addresses/:id`               | Customer                 |
| Orders       | `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id`                                                     | Customer                 |
| Admin orders | `GET /api/admin/orders` (`status`, `page`), `GET /api/admin/orders/:id`, `PATCH /api/admin/orders/:id/status`    | Admin                    |
| Admin users  | `GET /api/admin/users` (`search`, `page`), `GET /api/admin/users/:id`                                            | Admin                    |

### Order status flow

```
PENDING ──► CONFIRMED ──► SHIPPED ──► DELIVERED
   │            │
   └────────────┴──► CANCELLED   (stock is returned)
```

`DELIVERED` and `CANCELLED` are final. Invalid transitions are rejected by the API.

## Design notes

- **Validation lives on the server** (Zod). The frontend displays the server's field messages under each input, so rules are defined in one place.
- **Checkout is transactional.** Placing an order verifies and decrements stock, creates the order and its items, and empties the cart in one database transaction.
- **Prices are copied onto order items** at purchase time, so later price changes never alter past orders.
- **Role-based access** is enforced by backend middleware. The frontend route guards only improve the user experience.
- **Cart uniqueness:** a product appears at most once per cart (unique cart and product pair); adding it again increases the quantity.
- **Money values** are stored as `Decimal` in PostgreSQL and returned as strings, then formatted on the client.

## Known limitations

- The JWT is stored in `localStorage`, which is simple but readable by injected scripts. An `httpOnly` cookie would be safer in production.
- No refresh tokens, rate limiting or email verification.
- Uploaded images are stored on the local disk (`backend/uploads`), which is not committed to git.
- Stock is checked when adding to the cart and again at checkout, but the cart does not reserve stock.
- Customers cannot cancel their own orders; only admins change order status.
- CORS is open for development and should be restricted to the frontend origin in production.
