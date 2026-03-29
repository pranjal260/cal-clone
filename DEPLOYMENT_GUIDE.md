# Cal.com Clone - Deployment Guide

## 🚀 Quick Start for Vercel Deployment

This guide will help you deploy the Cal.com clone to production.

### Prerequisites

- GitHub account (for pushing code)
- Vercel account (for frontend hosting)
- Render.com or Railway account (for backend hosting)
- Supabase or Neon account (for PostgreSQL database)

---

## ✅ Step 1: Set Up Cloud Database

### Option A: Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com)
2. Sign in with GitHub
3. Click **"New Project"**
   - Project name: `cal-clone`
   - Password: Create a strong password (save this!)
   - Region: Choose closest to you
4. Wait for project creation (3-5 minutes)
5. Go to **Settings → Database → Connection String**
6. Select **PostgreSQL** tab
7. Copy the connection string (looks like: `postgresql://...`)
   - Replace `[YOUR-PASSWORD]` with the password you created

**Example connection string:**
```
postgresql://postgres:YOUR_PASSWORD@db.supabase.co:5432/postgres?sslmode=require
```

### Option B: Neon (If you want to use your existing database)

1. Go to [neon.tech](https://neon.tech)
2. Create account and project
3. Copy the connection string from dashboard

### Option C: Railway

1. Go to [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy connection string

---

## ✅ Step 2: Deploy Backend to Render or Railway

### Using Render (Free tier available)

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure:
   - **Name:** `cal-clone-backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npx prisma migrate deploy && npx prisma db seed`
   - **Start Command:** `npm start`
6. Add environment variables:
   - `DATABASE_URL`: Your database connection string
   - `DIRECT_URL`: Same as DATABASE_URL
   - `PORT`: 5000
7. Click **"Deploy Web Service"**
8. Wait for deployment (2-3 minutes)
9. Copy your backend URL (e.g., `https://cal-clone-backend.onrender.com`)

### Important: For Render Free Tier
- Spins down after 15 minutes of inactivity
- For production, upgrade to Paid Tier

---

## ✅ Step 3: Push Code to GitHub

```bash
git add .
git commit -m "Production ready with cloud database setup"
git push origin main
```

---

## ✅ Step 4: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Select your `cal-clone` repository
5. Configure:
   - **Framework:** Next.js
   - **Root Directory:** `./frontend`
6. Click **"Environment Variables"** and add:
   ```
   NEXT_PUBLIC_API_URL: https://cal-clone-backend.onrender.com/api
   ```
   (Replace with your actual backend URL)
7. Click **"Deploy"**
8. Wait for deployment (2-3 minutes)
9. Get your frontend URL (e.g., `https://cal-clone.vercel.app`)

---

## ✅ Step 5: Configure CORS

Update your backend `.env` or Render environment with your Vercel URL.

**Backend `.env` or Render env vars:**
```
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

Or update `backend/src/server.js` CORS config:
```javascript
const allowedOrigins = [
  "https://your-vercel-app.vercel.app",
  "http://localhost:3000",
];
```

---

## ✅ Step 6: Database Migrations

Your migrations run automatically in the build command. To manually run:

```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

---

## 🎯 Testing Your Deployment

1. **Frontend:** Visit `https://your-app.vercel.app`
2. **Backend Health:** Visit `https://your-backend.onrender.com/`
3. Try creating an event type
4. Share your booking link

---

## 🐛 Troubleshooting

### "Cannot connect to database"
- ✅ Check `DATABASE_URL` in Render/backend env vars
- ✅ Verify Supabase/Neon database is running
- ✅ Check IP whitelist (Supabase: Settings → Database → Firewall)

### "Frontend can't reach backend"
- ✅ Check `NEXT_PUBLIC_API_URL` in Vercel
- ✅ Verify backend is deployed and running
- ✅ Check CORS configuration in `server.js`

### "Event creation fails on Vercel"
- ✅ Check browser Network tab for API errors
- ✅ View Render logs: Dashboard → Your app → Logs
- ✅ Check database migrations ran successfully

### "Database migrations failed"
- Step 1: Check connection string format
- Step 2: Run locally first: `npx prisma migrate deploy`
- Step 3: If issues, recreate database and reseed

---

## 📊 Environment Variables Checklist

### Render (Backend)
- [ ] `DATABASE_URL` - Set to your database connection string
- [ ] `DIRECT_URL` - Usually same as DATABASE_URL for Prisma
- [ ] `PORT` - Set to 5000

### Vercel (Frontend)
- [ ] `NEXT_PUBLIC_API_URL` - Your Render backend URL + `/api`

---

## 🔒 Security Notes

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use strong database passwords**
3. **Rotate passwords monthly**
4. **Enable firewall in Supabase/Neon**
5. **Review CORS origins in production**

---

## 📈 Monitoring

### Vercel
- Functions monitoring: Vercel Dashboard → Analytics
- Error tracking: Vercel Dashboard → Monitoring

### Render
- Logs: Render Dashboard → Your Service → Logs
- Metrics: Render Dashboard → Your Service → Metrics

---

## 🎓 Common Commands

```bash
# Local development
cd backend && npm run dev
cd ../frontend && npm run dev

# Local database setup
npx prisma migrate dev
npx prisma db seed

# Production build
npm run build

# Check database
npx prisma studio
```

---

## ✨ You're All Set!

Your Cal.com clone is now live! 🎉

- **Frontend:** `https://your-app.vercel.app`
- **Backend API:** `https://your-backend.onrender.com/api`
- **Database:** Supabase/Neon PostgreSQL

Share your booking link format: `https://your-app.vercel.app/[event-slug]`

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review logs in Render/Vercel dashboard
3. Check database connection in Supabase/Neon

**Good luck with your deployment!** 🚀
