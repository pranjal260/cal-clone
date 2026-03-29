import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import slotRoutes from "./routes/slotRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

dotenv.config();

const app = express();

// ─── CORS — allow the Vercel frontend + localhost ──────────
const allowedOrigins = [
  "https://cal-clone-inwv.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., curl, Postman, server-side)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Also allow any *.vercel.app subdomain in case of preview deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      return callback(null, true); // allow all for now during development
    },
    credentials: true,
  })
);

app.use(express.json());

// Health check
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Cal.com Clone API is running" });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});