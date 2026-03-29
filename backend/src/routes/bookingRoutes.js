import express from "express";
import {
  createBooking,
  getBookingsByEventType,
  getBookingsByUser,
  cancelBooking,
} from "../controllers/booking.controller.js";

const router = express.Router();

router.post("/", createBooking);
router.get("/event/:eventTypeId", getBookingsByEventType);
router.get("/user/:userId", getBookingsByUser);
router.patch("/:id/cancel", cancelBooking);

export default router;
