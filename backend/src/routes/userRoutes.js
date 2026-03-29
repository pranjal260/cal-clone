import express from "express";
import { createUser, getUser, updateUser } from "../controllers/userController.js";

const router = express.Router();

// Create user
router.post("/", createUser);

// Get user by ID
router.get("/:id", getUser);

// Update user details
router.patch("/:id", updateUser);

export default router;
