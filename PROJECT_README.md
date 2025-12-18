# AAGAM — Local Development

This repository contains a simple demo grocery store: a Node.js + Express backend and a static frontend served from `frontend/`.

Structure
- `backend/` — Node + Express API, Mongoose models, routes
- `frontend/` — static HTML/CSS/JS site

Quick start (Windows)

1. Install Node.js (v16+ recommended) and MongoDB (local or Atlas).
2. Create environment file in `backend`:

```powershell
cd backend
copy .env.example .env
# edit .env to set MONGODB_URI and JWT_SECRET
```

3. Install backend deps and start server:

```powershell
cd backend
npm install
npm start
# or for development with nodemon: npm run dev
```

4. Open the site in a browser:

http://localhost:4000/

APIs
- `GET /api/products` — list products (query `search`, `category`)
- `POST /api/admin/add-product` — multipart upload; fields: `name,price,category,description`, file field: `image`
- `POST /api/auth/signup` — JSON `name,email,password`
- `POST /api/auth/login` — JSON `email,password`
- `POST /api/cart/checkout` — JSON `items,customer`

Notes
- Uploaded images are stored in `backend/uploads` and served at `/uploads/`.
- This is a demo scaffold. For production: secure JWT usage, validate inputs, use cloud storage for images, add HTTPS, rate-limiting, and proper CORS origins.
