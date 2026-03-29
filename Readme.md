# 🧠 Cal.com Clone — Full-Stack Event Scheduling Platform

A fully functional scheduling platform inspired by Cal.com, built with modern web technologies. Users can create event types, set their availability, and receive bookings through public links.

## 🎯 Live Demo

- **Frontend:** https://cal-clone-inwv.vercel.app/
- **Backend API:** https://cal-clone-h445.onrender.com/
- **Public Booking:** https://cal-clone-inwv.vercel.app/quick-chat

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cal-clone
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure DATABASE_URL
   npx prisma migrate dev
   npx prisma db seed
   npm run dev
   ```

3. **Frontend Setup** (in new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the app**
   - Admin: http://localhost:3000
   - Backend: http://localhost:5000

### Production Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for step-by-step instructions to deploy on Vercel (frontend), Render (backend), and Supabase (database).

---

## 📌 Project Overview

This is a full-stack event scheduling platform where users can:
- ✅ Create and manage event types
- ✅ Set availability (days, hours, timezone)
- ✅ Share public booking links
- ✅ Receive and manage bookings
- ✅ Prevent double-booking with smart slot management

---

## ✨ Key Features

### Event Management
- Create event types with title, description, duration, and custom URL slug
- Edit and delete events
- Color-coded event cards for visual organization
- One-click copy to share booking links

### Availability Settings
- Set available days (Monday-Sunday)
- Configure time ranges per day (9 AM - 5 PM, etc.)
- Timezone support (Asia/Kolkata, US timezones, Europe, etc.)
- Easy toggle to enable/disable days

### Public Booking Page
- Interactive calendar with availability highlights
- Available time slot picker
- Real-time slot availability checking
- Guest form to capture name and email
- Booking confirmation page with details

### Booking Dashboard
- View upcoming bookings
- View past bookings
- View cancelled bookings
- Cancel bookings with confirmation
- Filter by status

### Technical Highlights
- Dynamic booking pages using Next.js routing (`/[slug]`)
- Smart slot generation (checks availability vs existing bookings)
- Double-booking prevention with database transactions
- Responsive UI with Tailwind CSS
- Clean REST API architecture
- Prisma ORM with relational data modeling

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 5
- **ORM:** Prisma
- **Validation:** Built-in error handling

### Database
- **Type:** PostgreSQL
- **Hosting:** Neon.tech, Supabase, or self-hosted
- **Schema:** User, Event Type, Availability, Bookings

---

## 📁 Project Structure

```
cal-clone/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   ├── migrations/            # DB migrations
│   │   └── seed.js                # Sample data
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js          # Prisma client
│   │   ├── controllers/           # Route handlers
│   │   │   ├── availability.controller.js
│   │   │   ├── booking.controller.js
│   │   │   ├── eventController.js
│   │   │   ├── slot.controller.js
│   │   │   └── userController.js
│   │   ├── routes/                # API routes
│   │   │   ├── availabilityRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── eventRoutes.js
│   │   │   ├── slotRoutes.js
│   │   │   └── userRoutes.js
│   │   └── server.js              # Express app
│   ├── .env                       # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.js          # Root layout
│   │   │   ├── page.js            # Dashboard
│   │   │   ├── availability/      # Availability page
│   │   │   ├── bookings/          # Bookings page
│   │   │   ├── [slug]/            # Public booking page
│   │   │   └── globals.css        # Global styles
│   │   ├── components/
│   │   │   ├── BookingCalendar.js
│   │   │   ├── DashboardLayout.js
│   │   │   ├── EventTypeCard.js
│   │   │   ├── EventTypeModal.js
│   │   │   ├── Sidebar.js
│   │   │   └── TimeSlotPicker.js
│   │   └── lib/
│   │       ├── api.js             # API client
│   │       ├── constants.js       # App constants
│   │       └── userContext.js     # User context
│   ├── next.config.mjs
│   ├── package.json
│   └── tailwind.config.js
│
└── Readme.md
```

---

## 🗄️ Database Schema

### User
```
- id (UUID, primary key)
- name (string)
- email (string, unique)
- timezone (string, default: "Asia/Kolkata")
- createdAt, updatedAt (timestamps)
```

### EventType
```
- id (UUID, primary key)
- title (string)
- description (text, nullable)
- duration (integer, in minutes)
- slug (string, unique)
- userId (foreign key → User)
- createdAt, updatedAt (timestamps)
```

### Availability
```
- id (UUID, primary key)
- dayOfWeek (integer, 0-6)
- startTime (string, e.g., "09:00")
- endTime (string, e.g., "17:00")
- userId (foreign key → User)
- createdAt, updatedAt (timestamps)
- Unique constraint: (userId, dayOfWeek)
```

### Booking
```
- id (UUID, primary key)
- name (string)
- email (string)
- startTime (timestamp)
- endTime (timestamp)
- status (enum: booked, cancelled, completed)
- eventTypeId (foreign key → EventType)
- createdAt, updatedAt (timestamps)
- Index on (eventTypeId, startTime, endTime)
```

---

## 🔌 API Endpoints

### Users
- `GET /api/users/default` - Get default user
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user

### Event Types
- `GET /api/events/:slug` - Get event by slug (public)
- `GET /api/events?userId=X` - List events for user
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Availability
- `GET /api/availability/:userId` - Get availability schedule
- `POST /api/availability` - Set single availability
- `PUT /api/availability/bulk` - Set bulk availability
- `DELETE /api/availability/:userId/:dayOfWeek` - Delete availability

### Slots
- `GET /api/slots?eventTypeId=X&date=YYYY-MM-DD` - Get available slots

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/user/:userId` - Get bookings for user
- `PATCH /api/bookings/:id/cancel` - Cancel booking

---

## 🔐 Security Features

✅ **CORS Protection** - Configurable allowed origins
✅ **Input Validation** - All inputs validated server-side
✅ **Double-Booking Prevention** - Database transactions ensure no conflicts
✅ **Email Validation** - Regex validation for email addresses
✅ **Timezone Awareness** - All times stored in UTC, converted per user
✅ **No Authentication Bypass** - Assumes default user for demo (easily extended with auth)

---

## 📝 Assumptions

1. **Single User Demo** - Application assumes a default user is logged in
2. **No Authentication** - This is a simplified demo; extend with JWT/OAuth for production
3. **UTC Times** - All times stored in UTC, client displays in user timezone
4. **No Buffer Time** - Currently no meeting buffer time (can be added)
5. **Email Only** - Guest capture limited to name/email (can add custom fields)

---

## 🚀 How to Use

### For Event Organizer

1. **Access Dashboard**
   - Go to http://localhost:3000
   - You're logged in as the default user

2. **Create Event Type**
   - Click "New" button
   - Fill in title, URL slug, duration
   - Click "Create"

3. **Set Availability**
   - Go to Availability page
   - Toggle days of the week
   - Set time ranges (9 AM - 5 PM)
   - Select timezone
   - Click "Save"

4. **Share Booking Link**
   - Copy link from event card
   - Share it with people who want to book

### For Guest Booker

1. **Visit Booking Link**
   - Click a shared link: `https://cal-clone.vercel.app/quick-chat`

2. **Select Date**
   - Choose an available date from calendar

3. **Pick Time Slot**
   - Available slots load for that date
   - Click to select a time

4. **Enter Details**
   - Fill in name and email
   - Click "Confirm Booking"

5. **See Confirmation**
   - Booking confirmed page shows details
   - Option to book another slot

---

## ✅ Features Checklist

### Core Requirements ✅
- [x] Event types with title, description, duration, slug
- [x] Create, edit, delete event types
- [x] Public booking links
- [x] Availability settings (days, hours, timezone)
- [x] Calendar view with available dates
- [x] Time slot picker
- [x] Guest form (name, email)
- [x] Double-booking prevention
- [x] Booking confirmation page
- [x] Bookings dashboard
- [x] Cancel bookings
- [x] Responsive design

### Bonus Features ✅
- [x] Multiple availability schedules (per day of week)
- [x] Timezone support
- [x] Color-coded event cards
- [x] Elegant UI matching Cal.com style
- [x] Loading states and animations
- [x] Error handling

### Future Enhancements 📋
- [ ] Email notifications on booking
- [ ] Buffer time between meetings
- [ ] Custom booking questions
- [ ] Rescheduling flow
- [ ] Date overrides (block specific dates)
- [ ] User authentication
- [ ] Multi-user support

---

## 🧪 Testing

```bash
# Test event creation
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quick Chat",
    "slug": "quick-chat",
    "duration": 30,
    "userId": "YOUR_USER_ID"
  }'

# Test availability fetch
curl http://localhost:5000/api/availability/YOUR_USER_ID

# Test booking
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "eventTypeId": "EVENT_ID",
    "startTime": "2025-03-29T09:00:00Z",
    "endTime": "2025-03-29T09:30:00Z",
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

---

## 📦 Installation from Scratch

```bash
# Create directories
mkdir cal-clone && cd cal-clone

# Backend
mkdir backend && cd backend
npm init -y
npm install express cors dotenv @prisma/client prisma
npm install -D nodemon

# Prisma setup
npx prisma init

# Frontend
cd ../
npx create-next-app@latest frontend
cd frontend
npm install axios lucide-react

# Initialize git
git init
git add .
git commit -m "Initial commit"
```

---

## 🐛 Known Issues & Workarounds

### Issue: "No available slots"
- **Cause:** Availability not set or not matching booking date
- **Fix:** Ensure availability enabled for the day and times configured

### Issue: "Time slot already booked"
- **Cause:** Another booking exists for that time
- **Fix:** Select a different time slot

### Issue: "Database connection error"
- **Cause:** DATABASE_URL not set or database down
- **Fix:** Check `.env` file and verify database is running

---

## 📄 License

This project is open source for educational purposes.

---

## 👨‍💻 Author

Built for Scaler AI SDE Placement Round

---

## 🤝 Contributing

Feel free to fork and submit pull requests!

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section in [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. Review API endpoint documentation above
3. Check database schema for data relationships

---

**Happy scheduling! 🎉**

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