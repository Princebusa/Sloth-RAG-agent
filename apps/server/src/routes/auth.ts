import { Router } from "express";
import { Register, login } from "../Controllers/auth.controller";


const router = Router();

router.post("/register", Register);
router.post("/login", login);

export default router;