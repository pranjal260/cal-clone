# 📊 Cal.com Clone - Visual Architecture & Flow Diagrams

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL USERS                               │
│           (Event Organizers & Guests)                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    ┌─────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
    │ Organizer  │ │   Guest    │ │  Organizer │
    │ Dashboard  │ │ Booking    │ │ Public     │
    │ (Admin)    │ │ Page       │ │ Link Share │
    └─────┬──────┘ └─────┬──────┘ └─────┬──────┘
          │               │               │
          └───────────────┼───────────────┘
                          │
                ┌─────────▼────────────┐
                │   NEXT.JS APP       │
                │  (Vercel)           │
                │                     │
                │ Pages:              │
                │ - / (Dashboard)     │
                │ - /availability     │
                │ - /bookings         │
                │ - /[slug] (Booking) │
                │                     │
                │ Components:         │
                │ - EventTypeCard     │
                │ - Calendar          │
                │ - TimeSlotPicker    │
                │ - Modal Forms       │
                └─────────┬───────────┘
                          │
                ┌─────────▼────────────┐
                │   AXIOS API CLIENT  │
                │   (lib/api.js)      │
                │                     │
                │ Endpoints:          │
                │ - /api/events       │
                │ - /api/slots        │
                │ - /api/availability │
                │ - /api/bookings     │
                └─────────┬───────────┘
                          │
                          │ HTTPS/REST
                          │
                ┌─────────▼────────────┐
                │  EXPRESS.JS API     │
                │  (Render)           │
                │                     │
                │ Controllers:        │
                │ - eventController   │
                │ - bookingController │
                │ - slotController    │
                │ - availabilityCtl   │
                │                     │
                │ Validation:         │
                │ - Input checks      │
                │ - Double-booking    │
                │ - Format checks     │
                └─────────┬───────────┘
                          │
                ┌─────────▼────────────┐
                │ PRISMA ORM + NEON   │
                │ (PostgreSQL)        │
                │                     │
                │ Tables:             │
                │ - users             │
                │ - eventTypes        │
                │ - availability      │
                │ - bookings          │
                └─────────────────────┘
```

---

## 🔄 User Flow - Event Organizer

```
START
  │
  ├─→ Go to Dashboard
  │    ├─→ See: Event type list
  │    └─→ Options: Create, Edit, Delete, Share
  │
  ├─→ Create Event Type
  │    ├─→ Fill: Title, Description, Duration, Slug
  │    ├─→ Validate: All fields required
  │    └─→ Save: Event created ✓
  │
  ├─→ Go to Availability
  │    ├─→ See: Days of week with toggles
  │    ├─→ Configure: Days, Times, Timezone
  │    └─→ Save: Availability set ✓
  │
  ├─→ Share Booking Link
  │    ├─→ Copy: https://cal-clone.vercel.app/event-slug
  │    └─→ Share: With contacts/on social
  │
  ├─→ Go to Bookings
  │    ├─→ View: Upcoming/Past/Cancelled
  │    ├─→ See: Booker details, time, status
  │    └─→ Can: Cancel booking
  │
  └─→ END
```

---

## 🔄 User Flow - Guest Booking

```
START
  │
  ├─→ Receive Booking Link
  │    └─→ Click: https://cal-clone.vercel.app/quick-chat
  │
  ├─→ View Event Details
  │    ├─→ See: Event name, duration, organizer
  │    └─→ See: Calendar with available dates
  │
  ├─→ Select Date
  │    ├─→ Click: Available date on calendar
  │    └─→ See: Time slots for that day load
  │
  ├─→ Select Time Slot
  │    ├─→ Click: Available time slot
  │    └─→ Confirm: Slot shows as selected
  │
  ├─→ Fill Booking Form
  │    ├─→ Enter: Name (2-100 chars)
  │    ├─→ Enter: Email (valid format)
  │    └─→ Validate: Both fields required
  │
  ├─→ Submit Booking
  │    ├─→ Check: No conflicts ✓
  │    ├─→ Save: Booking created ✓
  │    └─→ Organizer gets notification
  │
  ├─→ See Confirmation
  │    ├─→ Display: Event, date, time, organizer
  │    └─→ Option: Book another slot
  │
  └─→ END
```

---

## 🗄️ Database Relationships

```
USER
├── id (UUID)
├── name (String)
├── email (String, unique)
├── timezone (String)
└── relationships:
    ├── → EventType[] (1:many)
    └── → Availability[] (1:many)

EVENTTYPE
├── id (UUID)
├── title (String)
├── description (String?)
├── duration (Integer, minutes)
├── slug (String, unique)
├── userId → User
└── relationships:
    ├── ← User (many:1)
    └── → Booking[] (1:many)

AVAILABILITY
├── id (UUID)
├── dayOfWeek (Integer, 0-6)
├── startTime (String, "HH:MM")
├── endTime (String, "HH:MM")
├── userId → User
└── constraints:
    ├── unique(userId, dayOfWeek)
    └── ← User (many:1)

BOOKING
├── id (UUID)
├── name (String)
├── email (String)
├── startTime (DateTime)
├── endTime (DateTime)
├── status (enum: booked/cancelled/completed)
├── eventTypeId → EventType
└── relationships:
    ├── ← EventType (many:1)
    └── indexes: (eventTypeId, startTime, endTime)
```

---

## 📱 Component Hierarchy - Frontend

```
App (Root Layout)
├── Context: UserProvider
│
├── Dashboard Page (/)
│   ├── DashboardLayout
│   │   ├── Sidebar (Navigation)
│   │   │   ├── Links: Events, Bookings, Availability
│   │   │   └── User Profile Section
│   │   │
│   │   └── Main Content
│   │       ├── Header (Title + New Button)
│   │       ├── EventTypesList
│   │       │   ├── EventTypeCard[] (for each event)
│   │       │   │   ├── Title, Description, Duration
│   │       │   │   ├── Copy Link Button
│   │       │   │   ├── Preview Link Button
│   │       │   │   └── Edit/Delete Menu
│   │       │   │
│   │       │   └── EventTypeModal (Create/Edit Form)
│   │       │       ├── Input: Title
│   │       │       ├── Input: Slug
│   │       │       ├── Select: Duration
│   │       │       ├── Textarea: Description
│   │       │       └── Buttons: Cancel, Save
│   │       │
│   │       └── Delete Confirmation Dialog
│   │
│   ├── Availability Page (/availability)
│   │   ├── DashboardLayout
│   │   └── Schedule Editor
│   │       ├── Timezone Selector
│   │       ├── DayRow[] (for each day)
│   │       │   ├── Toggle (Enable/Disable)
│   │       │   ├── Time Start Selector
│   │       │   └── Time End Selector
│   │       └── Save Button
│   │
│   ├── Bookings Page (/bookings)
│   │   ├── DashboardLayout
│   │   ├── TabSelector (Upcoming, Past, Cancelled)
│   │   └── BookingsList
│   │       ├── BookingCard[] (for each booking)
│   │       │   ├── Event Name, Date, Time
│   │       │   ├── Booker Name, Email
│   │       │   ├── Status Badge
│   │       │   └── Cancel Button
│   │       │
│   │       └── Cancel Confirmation Dialog
│   │
│   └── Public Booking Page (/[slug])
│       └── BookingView (No Sidebar)
│           ├── LeftPanel (Event Info)
│           │   ├── Organizer Avatar
│           │   ├── Event Title
│           │   ├── Event Description
│           │   ├── Duration, Timezone
│           │   └── Selected Date/Time Display
│           │
│           ├── RightPanel (Calendar + Form)
│           │   ├── Step 1: Calendar
│           │   │   ├── BookingCalendar Component
│           │   │   │   ├── Month Navigation
│           │   │   │   ├── Day Grid
│           │   │   │   └── Available Day Highlighting
│           │   │   │
│           │   │   └── TimeSlotPicker Component
│           │   │       ├── Time Slot List
│           │   │       ├── Selected Indicator
│           │   │       └── Confirm Button
│           │   │
│           │   ├── Step 2: Form
│           │   │   ├── Input: Name
│           │   │   ├── Input: Email
│           │   │   ├── Error Display
│           │   │   ├── Back Button
│           │   │   └── Confirm Button
│           │   │
│           │   └── Step 3: Confirmation
│           │       ├── Success Icon
│           │       ├── Confirmation Message
│           │       ├── Booking Details Display
│           │       └── Book Another Button
│           │
│           └── Error State (Event Not Found)
│               ├── Error Icon
│               ├── Error Message
│               └── Home Link
```

---

## 🔌 API Endpoint Map

```
┌─────────────────────────────────────────┐
│  GET /api/users/default                 │
│  → Get default logged-in user           │
│  ← { id, name, email, timezone }        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  GET /api/events/:slug                  │
│  → Get event by slug (public)           │
│  ← { id, title, description, duration,  │
│      slug, user: {...} }                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  GET /api/events?userId=X               │
│  → List events for user                 │
│  ← [ { id, title, slug, duration } ]    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  POST /api/events                       │
│  → Create event                         │
│  ← { id, title, slug, created }         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  GET /api/availability/:userId          │
│  → Get availability for user            │
│  ← [ { dayOfWeek, startTime, endTime } ]│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  GET /api/slots?eventTypeId=X&date=YYY  │
│  → Get available time slots for date    │
│  ← [ { startTime, endTime } ]           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  POST /api/bookings                     │
│  → Create booking                       │
│  ← { id, name, email, status: "booked" }│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  GET /api/bookings/user/:userId         │
│  → Get bookings for user                │
│  ← [ { id, name, email, startTime,      │
│       endTime, status } ]               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  PATCH /api/bookings/:id/cancel         │
│  → Cancel booking                       │
│  ← { id, status: "cancelled" }          │
└─────────────────────────────────────────┘
```

---

## 🎯 Double-Booking Prevention Algorithm

```
USER ATTEMPTS BOOKING
        │
        ▼
┌───────────────────┐
│ VALIDATE INPUT    │
│ - Date format     │
│ - Time range      │
│ - Duration valid  │
└───────┬───────────┘
        │
        ▼
┌───────────────────────────┐
│ CHECK AVAILABILITY        │
│ - Day enabled?            │
│ - Time in available range?│
│ - Timezone converted OK?  │
└───────┬───────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│ START DATABASE TRANSACTION              │
│ (Ensures atomic operation - no race)    │
└───────┬─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│ QUERY FOR CONFLICTS                     │
│ Find bookings where:                    │
│  - Same eventTypeId                     │
│  - startTime < requested_endTime   AND │
│  - endTime > requested_startTime   AND │
│  - NOT cancelled                        │
└───────┬─────────────────────────────────┘
        │
        ├─→ CONFLICT FOUND? ──────────┐
        │                              ▼
        │                    ┌──────────────────┐
        │                    │ ROLLBACK TRANS   │
        │                    │ Return: 409      │
        │                    │ Message:         │
        │                    │ "Slot taken"     │
        │                    └──────────────────┘
        │                              │
        │                              ▼
        │                         ERROR PAGE
        │
        └─→ NO CONFLICT
           │
           ▼
    ┌──────────────────┐
    │ CREATE BOOKING   │
    │ Inside TRANS     │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ COMMIT TRANS     │
    │ ✓ Safe write     │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────────┐
    │ BOOKING CONFIRMED    │
    │ Show confirmation    │
    │ page to guest        │
    └──────────────────────┘
```

---

## 📊 Data Flow: Create Booking

```
FRONTEND
────────
Guest inputs:
 - name, email
 - selected slot

     │
     ▼
┌─────────────┐
│ Validate    │ (name 2-100 chars, email format)
│ Input       │
└─────┬───────┘
      │
      ▼
   POST /api/bookings
   {
     eventTypeId,
     startTime,
     endTime,
     name,
     email
   }

BACKEND
───────
      │
      ▼
┌──────────────────┐
│ Validate Input   │ (types, lengths, formats)
│ Validate Times   │ (dates, overlap)
│ Check Event      │ (exists)
│ Check Avail      │ (day/time in range)
└────────┬─────────┘
         │
         ▼
    TRANSACTION
         │
         ├─→ Query conflicts
         │   └─→ Found? Return 409 ✗
         │
         └─→ No conflicts?
             ├─→ Create booking
             └─→ Return 201 ✓

FRONTEND
────────
      │
      ▼
 Response 201?
    │        │
   YES       NO
    │        │
    ▼        ▼
 Show    Show
 Success Error
 Page    Message
```

---

## 🎨 Color Scheme & Design Token

```
Primary: #0f172a (Navy - Buttons, Headings)
Accent: #3b82f6 (Blue - Links, Focus)
Background: #fafbfc (Light - Page background)
Muted: #f1f5f9 (Gray - Hover states)
Border: #e2e8f0 (Slate - Dividers)
Text: #0f172a (Dark - Body text)
Text Muted: #64748b (Gray - Descriptions)
Success: #10b981 (Green - Confirmations)
Danger: #ef4444 (Red - Deletes)
```

---

This visual map should help you understand and explain the system architecture during evaluation! 🎯
