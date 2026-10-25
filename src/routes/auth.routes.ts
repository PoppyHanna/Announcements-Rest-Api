import { Router } from "express";
import { register, login, refresh, getMe, logout } from "../controllers/auth.controller.ts";
import { loginSchema, refreshSchema, registerSchema } from "../validators/auth.validator.ts";
import { validateBody } from "../middleware/validate.ts";
import { authenticate } from "../middleware/authenticate.ts";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/refresh", validateBody(refreshSchema), refresh);
router.get("/me", authenticate, getMe);
router.post("/logout", authenticate, logout);

export default router;
