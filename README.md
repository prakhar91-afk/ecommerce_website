# AuraCommerce

AuraCommerce is a modern e-commerce storefront built with Next.js and React. It showcases a premium product catalog with search, filtering, cart management, authentication, an admin dashboard, and a checkout experience.

## Features

- Responsive storefront with a polished premium UI
- Product catalog with search, category filters, and sorting
- Shopping cart drawer with quantity updates and stock awareness
- Auth modal for sign-in and sign-up with mock user sessions
- Admin panel for managing products and viewing orders
- Checkout flow with simulated order placement
- Local JSON-backed data storage for products and orders

## Tech Stack

- Next.js 16
- React 19
- CSS Modules
- JSON file-based mock database

## Project Structure

- src/app - Main app routes and API handlers
- src/components - Reusable UI components such as header, cart drawer, auth modal, and footer
- src/context - Cart and authentication state providers
- src/lib - Database helpers for reading and writing local JSON data
- src/data - Product and order seed data
- src/styles - Component-scoped CSS modules

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser at:
   ```text
   http://localhost:3000
   ```

## Available Scripts

- npm run dev - Start the development server
- npm run build - Create a production build
- npm run start - Start the production build locally
- npm run lint - Run ESLint checks

## API Overview

The app includes lightweight API routes for:

- GET /api/products - Retrieve and filter products
- POST /api/products - Create a new product
- GET /api/products/[id] - Retrieve a single product
- POST /api/orders - Create an order

## Notes

This project uses a local JSON file as a simple mock database, so data persists during development in the project workspace.
