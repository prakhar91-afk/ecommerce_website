# E-Commerce Platform

A full-stack e-commerce platform with separate frontend, backend, and admin client applications.

## Repository structure

- `frontend/` - Next.js storefront with product catalog, cart, checkout, and authentication.
- `backend/` - Express/MongoDB API server handling authentication, products, orders, and uploads.
- `admin/` - Vite-powered admin client for managing the store.
- `ecommerce/` - Metadata and configuration files for the project.

## Frontend

The `frontend` app is a Next.js project.

### Install

```bash
cd frontend
npm install
```

### Run development server

```bash
cd frontend
npm run dev
```

### Build for production

```bash
cd frontend
npm run build
```

### Start production server

```bash
cd frontend
npm start
```

## Backend

The `backend` server is built with Express and MongoDB.

### Install

```bash
cd backend
npm install
```

### Required environment variables

Create a `.env` file in `backend/` with at least:

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Run backend server

```bash
cd backend
node index.js
```

## Admin client

The `admin` folder contains a Vite React admin interface.

### Install

```bash
cd admin
npm install
```

### Run development server

```bash
cd admin
npm run dev
```

## Authentication

The frontend uses a token-based authentication flow:

- `frontend/src/context/AuthContext.jsx` manages session state and login/signup requests.
- `frontend/src/components/AuthModal.jsx` displays the sign-in/sign-up modal.
- `frontend/src/app/api/auth/route.js` proxies auth requests to the backend.
- Backend routes `/login` and `/signup` are implemented in `backend/index.js`.

## Notes

- Make sure the backend is running before using the frontend authentication flow.
- If the frontend cannot reach the backend, confirm `BACKEND_URL` is set or that the backend is accessible at `http://localhost:4000`.

## Recommended workflow

Start the backend first, then the frontend:

```bash
cd backend && node index.js
cd frontend && npm run dev
```

Optional admin server:

```bash
cd admin && npm run dev
```
