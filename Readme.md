# 🧠 Cal.com Clone — Full-Stack Event Scheduling Platform

🚀 **Live Demo**

* Frontend: https://cal-clone-inwv.vercel.app/
* Backend: https://cal-clone-h445.onrender.com/

---

## 📌 Project Overview

This is a full-stack event scheduling platform inspired by tools like Cal.com and Calendly.
Users can define availability, create event types, and share booking links. The system dynamically calculates available slots by checking existing bookings, preventing double-booking.

---

## ✨ Key Features

* Dynamic booking pages using Next.js routing (`/[slug]`)
* Smart slot generation (availability vs existing bookings)
* Event type creation and management
* Booking system with conflict handling
* Responsive UI using Tailwind CSS
* REST API with structured backend architecture
* Prisma ORM with relational data modeling

---

## 🛠️ Tech Stack

### Frontend

* Next.js (App Router)
* React
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js
* Prisma ORM

### Database

* PostgreSQL

---

## 📁 Project Structure

```
cal-clone/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js
│   │   │   ├── [slug]/
│   │   │   └── dashboard/
│   │   └── lib/
│   │       └── api.js
│   ├── package.json
│
└── backend/
    ├── prisma/
    │   └── schema.prisma
    ├── src/
    │   ├── controllers/
    │   ├── routes/
    │   └── server.js
    └── package.json
```

---

## ⚙️ Local Setup

### 1. Clone Repository

```
git clone https://github.com/pranjal260/cal-clone.git
cd cal-clone
```

---

### 2. Backend Setup

```
cd backend
npm install
```

Create `.env`:

```
DATABASE_URL=your_database_url
PORT=5000
```

Run Prisma:

```
npx prisma generate
npx prisma migrate dev
```

Start server:

```
npm run dev
```

---

### 3. Frontend Setup

```
cd ../frontend
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Run frontend:

```
npm run dev
```

---

## 🌐 Deployment

### Frontend (Vercel)

* Root Directory → `frontend`
* Framework → Next.js
* Environment Variable:

```
NEXT_PUBLIC_API_URL=https://cal-clone-h445.onrender.com
```

---

### Backend (Render)

* Root Directory → `backend`
* Build Command:

```
npm install && npx prisma generate && npx prisma migrate deploy
```

* Start Command:

```
npm start
```

Environment Variables:

```
DATABASE_URL=your_production_db_url
PORT=5000
```

---

## 🔗 Architecture

```
Client (Next.js - Vercel)
        ↓
Backend API (Express - Render)
        ↓
PostgreSQL Database
```

---

## ⚠️ Important Notes

* `.env` files are not committed
* Ensure correct API URL in frontend
* Run Prisma migrations in production
* Configure CORS properly in backend

---

## 🚧 Future Improvements

* Authentication (JWT / OAuth)
* Email notifications
* Calendar integrations
* Payment system (Stripe)

---