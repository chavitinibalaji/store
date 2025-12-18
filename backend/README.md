AAGAM Backend

Setup:

1. Copy `.env.example` to `.env` and set `MONGODB_URI` and `JWT_SECRET`.
2. Install dependencies: `npm install` (run in `backend` folder).
3. Start server: `npm start` (or `npm run dev` with nodemon).

APIs:
- `GET /api/products` - list products (query: `search`, `category`)
- `POST /api/admin/add-product` - multipart upload: `name`, `price`, `category`, `description`, `image`
- `POST /api/auth/signup` - JSON: `name,email,password`
- `POST /api/auth/login` - JSON: `email,password`
- `POST /api/cart/checkout` - JSON: `items`, `customer`

The backend serves static files from the sibling `frontend` folder if present.
