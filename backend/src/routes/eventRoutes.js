import express from "express";
import { createEventType, getEventBySlug, getAllEventTypes, updateEventType, deleteEventType } from "../controllers/eventController.js";

const router = express.Router();

// Get event by slug (public booking page)
router.get("/:slug", getEventBySlug);

// Get all event types for a user (dashboard)
router.get("/", getAllEventTypes);

// Create event type
router.post("/", createEventType);

// Update event type
router.put("/:id", updateEventType);

// Delete event type
router.delete("/:id", deleteEventType);

export default router;