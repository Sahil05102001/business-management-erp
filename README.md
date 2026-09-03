# Business Management ERP

A general-purpose business management application inspired by platforms such as Zoho Books, Zoho Inventory, and Vyapar.

## Tech Stack

### Backend
- Node.js
- NestJS
- PostgreSQL
- Prisma ORM
- JWT
- bcrypt

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query

### Core Modules

- Authentication & Authorization
- Parties
- Products
- Inventory
- Sales
- Purchases
- Payments
- GST
- Accounting
- Financial Reports
- Dashboard

## Architecture

The application uses a unified party ledger and unified inventory model.

Customers and suppliers are represented by a single Party entity.

Sales and purchases both use the same Product and StockMovement infrastructure.

Financial transactions automatically generate double-entry accounting journals.

## Status

🚧 Under active development