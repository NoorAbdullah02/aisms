import { Router } from "express";
import { login, refresh, me, logout, changePassword, forgotPassword, updateProfile, adminResetPassword } from "../controllers/auth.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/change-password", requireAuth, changePassword);
router.post("/admin-reset-password", requireAuth, requireRole("admin"), adminResetPassword);
router.patch("/profile", requireAuth, updateProfile);
router.get("/me", requireAuth, me);

export default router;
