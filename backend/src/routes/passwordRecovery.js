import { Router } from "express";
import passwordRecoveryController from "../controllers/passwordRecoveryController.js";

const router = Router();

console.log('🔐 Cargando rutas de recuperación de contraseña...');

// POST /api/password-recovery/send-code - Enviar código de recuperación
router.post("/send-code", (req, res, next) => {
    console.log('📧 POST /password-recovery/send-code - Enviar código');
    next();
}, passwordRecoveryController.sendRecoveryCode);

// POST /api/password-recovery/verify-code - Verificar código
router.post("/verify-code", (req, res, next) => {
    console.log('🔍 POST /password-recovery/verify-code - Verificar código');
    next();
}, passwordRecoveryController.verifyRecoveryCode);

// POST /api/password-recovery/reset-password - Restablecer contraseña
router.post("/reset-password", (req, res, next) => {
    console.log('🔄 POST /password-recovery/reset-password - Restablecer contraseña');
    next();
}, passwordRecoveryController.resetPassword);

console.log('✅ Rutas de recuperación de contraseña configuradas');

export default router;