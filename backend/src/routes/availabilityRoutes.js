import express from "express";
import {
  getAvailability,
  setAvailability,
  setBulkAvailability,
  deleteAvailability,
} from "../controllers/availability.controller.js";

const router = express.Router();

// Get all availability for a user
router.get("/:userId", getAvailability);

// Set/Update availability for a single day
router.post("/", setAvailability);

// Set bulk availability (replace all days at once)
router.put("/bulk", setBulkAvailability);

// Delete availability for a specific day
router.delete("/:userId/:dayOfWeek", deleteAvailability);

export default router;
