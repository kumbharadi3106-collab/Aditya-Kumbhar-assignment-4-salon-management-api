# 💇 Salon Management API

A RESTful API to manage **Salons**, **Services**, and **User Authentication**, built with **Node.js**, **Express.js**, **JWT**, **Bcrypt**, and **Supabase**.

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** Supabase (PostgreSQL)
- **Auth:** JWT (jsonwebtoken) + bcryptjs for password hashing
- **Testing:** Postman

## 📁 Project Structure

```
salon-api/
├── server.js                  # App entry point
├── package.json
├── .env.example                # Copy to .env and fill in your keys
├── schema.sql                  # Run this in Supabase SQL editor first
├── config/
│   └── supabaseClient.js       # Supabase client setup
├── middleware/
│   ├── authMiddleware.js       # JWT verification
│   └── logger.js               # Request logging (method, path, timestamp)
├── controllers/
│   ├── authController.js       # register, login
│   ├── salonController.js      # salon CRUD, top-rated, city filter
│   └── serviceController.js    # service CRUD, availability filter
└── routes/
    ├── authRoutes.js
    ├── salonRoutes.js
    └── serviceRoutes.js
```

## 🚀 Setup Instructions

### 1. Create your Supabase project & tables

1. Go to [supabase.com](https://supabase.com) and create a new project (free tier is fine).
2. Open **SQL Editor** → paste the contents of `schema.sql` → **Run**. This creates the `users`, `salons`, and `services` tables.
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (or `anon` key for basic testing) → `SUPABASE_KEY`

### 2. Install dependencies

```bash
cd salon-api
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env`:
```
PORT=3000
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-supabase-key
JWT_SECRET=some_long_random_string
JWT_EXPIRES_IN=1d
```

### 4. Run the server

```bash
npm start
```
or with auto-restart:
```bash
npm run dev
```

You should see:
```
🚀 Salon Management API running on http://localhost:3000
```

## 🔌 API Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/` | No | Welcome route |
| POST | `/register` | No | Register a new user |
| POST | `/login` | No | Login, returns JWT |
| GET | `/salons` | No | Get all salons |
| GET | `/salons/top` | No | Top 5 salons by rating |
| GET | `/salons/city/:city` | No | Filter salons by city |
| GET | `/salons/:id` | No | Get one salon by ID |
| POST | `/salons` | **Yes** | Create a salon |
| PUT | `/salons/:id` | **Yes** | Update a salon |
| DELETE | `/salons/:id` | **Yes** | Delete a salon |
| GET | `/salons/:id/services` | No | Get all services for a salon |
| POST | `/salons/:id/services` | **Yes** | Add a service to a salon |
| GET | `/services/available` | No | All services where `isAvailable = true` |
| PUT | `/services/:id` | **Yes** | Update a service |
| DELETE | `/services/:id` | **Yes** | Delete a service |

## 🧪 Testing with Postman

### 1. Register a user
```
POST http://localhost:3000/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

### 2. Login
```
POST http://localhost:3000/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secret123"
}
```
Response includes a `token`. Copy it.

### 3. Call a protected route
```
POST http://localhost:3000/salons
Authorization: Bearer <paste token here>
Content-Type: application/json

{
  "name": "Glow Salon",
  "city": "Mumbai",
  "address": "12 MG Road",
  "rating": 4.5
}
```

### 4. Add a service to that salon
```
POST http://localhost:3000/salons/<salonId>/services
Authorization: Bearer <token>
Content-Type: application/json

{
  "serviceName": "Haircut",
  "price": 500,
  "duration": "40 min",
  "isAvailable": true
}
```

### 5. Try the extra routes
```
GET http://localhost:3000/salons/top
GET http://localhost:3000/salons/city/Mumbai
GET http://localhost:3000/services/available
```

💡 **Tip:** Create a Postman Collection with an environment variable (e.g. `{{token}}`) so you can paste the JWT once after login and reuse it across all protected requests.

## 🔐 Authentication Flow

1. `/register` hashes the password with bcrypt and stores the user in Supabase.
2. `/login` compares the submitted password against the stored hash with `bcrypt.compare`.
3. On success, the server signs a JWT containing `{ id, email, username }`.
4. Protected routes require `Authorization: Bearer <token>`.
5. `middleware/authMiddleware.js` verifies the token before the request reaches the controller; invalid/missing tokens get `401`/`403`.

## ✅ Validation & Error Handling

- Required fields (`email`, `password`, `serviceName`, `price`, etc.) are checked before hitting the database.
- `rating` is constrained to 0–5, `price` must be non-negative.
- Proper status codes are used throughout: `200` (OK), `201` (created), `400` (bad request/validation), `401`/`403` (auth), `404` (not found), `500` (server/database error).
- All Supabase calls use `async/await` and are wrapped in `try/catch`.

## 📝 Notes

- Route order matters for Express: `/salons/top` and `/salons/city/:city` are declared **before** `/salons/:id` so they aren't swallowed by the dynamic `:id` param. Same for `/services/available` before `/services/:id`.
- The request logger middleware (`middleware/logger.js`) prints every request's method, path, and timestamp to the console.
- Passwords are never returned in API responses — only hashed and stored.
