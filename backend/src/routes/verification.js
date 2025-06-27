import { Router } from "express";
import verificationController from "../controllers/verificationController.js";

const router = Router();

// Enviar código de verificación
router.post("/send-code", verificationController.sendVerificationCode);

// Verificar código
router.post("/verify-code", verificationController.verifyCode);

// Reenviar código
router.post("/resend-code", verificationController.resendCode);

export default router;