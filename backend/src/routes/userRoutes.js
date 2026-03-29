import express from "express";
import { createUser, getUser, updateUser, getDefaultUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/default", getDefaultUser);
router.post("/", createUser);
router.get("/:id", getUser);
router.patch("/:id", updateUser);

export default router;
