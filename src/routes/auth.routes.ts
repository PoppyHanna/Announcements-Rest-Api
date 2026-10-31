import { Router } from "express";
import { register, login, refresh, getMe, logout } from "../controllers/auth.controller.ts";
import { loginSchema, refreshSchema, registerSchema } from "../validators/auth.validator.ts";
import { validateBody } from "../middleware/validate.ts";
import { authenticate } from "../middleware/authenticate.ts";

import { rateLimit } from "express-rate-limit";


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    message: "Too many requests, please try again later",
  },
});


const router = Router();


router.use(authLimiter);

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/refresh", validateBody(refreshSchema), refresh);
router.get("/me", authenticate, getMe);
router.post("/logout", authenticate, logout);

export default router;
