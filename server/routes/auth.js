import express from "express";
import {
	getCurrentUser,
	login,
	requestPasswordReset,
	resetPassword,
	signup,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.get("/me", requireAuth, getCurrentUser);

export default router;