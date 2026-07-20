# Divine Gospel Delight Foundation — Backend API

Express + MongoDB API for the DGDF public site and admin portal.

## Stack

- **Node.js** + **Express** (ES modules)
- **MongoDB** via **Mongoose**
- **JWT** auth in `httpOnly` cookie (`dgdf_token`)
- **Multer** + **Cloudinary** for gallery uploads
- **Paystack** for donation initiate / verify / webhook

Donations require `MONGODB_URI` and `PAYSTACK_SECRET_KEY`. In Paystack Dashboard, set the webhook URL to `https://<api-host>/api/donations/webhook`.

## Setup

```bash
cp .env.example .env
# Fill in MONGODB_URI, JWT_SECRET, Cloudinary, and Paystack keys as needed
npm install
npm run dev
```

The API starts on `http://localhost:5000`. Donation endpoints require MongoDB and `PAYSTACK_SECRET_KEY` (no mock payment fallback).

### Mock admin (no DB)

- Email: `admin@dgdf.org`
- Password: `admin123`

## Scripts

| Command       | Description                    |
|---------------|--------------------------------|
| `npm run dev` | Start with `--watch` (reload)  |
| `npm start`   | Production start               |

## Endpoints

| Method | Path                         | Access  |
|--------|------------------------------|---------|
| GET    | `/api/health`                | Public  |
| POST   | `/api/auth/login`            | Public  |
| POST   | `/api/auth/logout`           | Public  |
| GET    | `/api/auth/me`               | Auth    |
| GET    | `/api/gallery`               | Public  |
| POST   | `/api/gallery`               | Admin   |
| DELETE | `/api/gallery/:id`           | Admin   |
| GET    | `/api/donations`             | Admin   |
| POST   | `/api/donations/initiate`    | Public  |
| POST   | `/api/donations/verify`      | Public  |
| POST   | `/api/donations/webhook`     | Public (Paystack) |
| GET    | `/api/messages`              | Admin   |
| POST   | `/api/messages`              | Public  |
| PATCH  | `/api/messages/:id/read`     | Admin   |
| DELETE | `/api/messages/:id`          | Admin   |
| GET    | `/api/content`               | Public  |
| PATCH  | `/api/content/:key`          | Admin   |

## Environment

See `.env.example` for all variables. CORS allows `CLIENT_URL` and `ADMIN_URL` with credentials.
