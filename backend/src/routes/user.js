import { Router } from "express";
import userController from "../controllers/userController.js";
import { validateAuthToken, optionalAuth } from "../middleware/validateAuthToken.js";

const router = Router();

console.log('📁 Cargando rutas de usuarios...');

// POST /api/users - Crear usuario (REGISTRO - COMPLETAMENTE PÚBLICO)
// Esta ruta NO debe tener ningún middleware de autenticación
router.post("/", (req, res, next) => {
    console.log('📝 POST /users - Registro de usuario');
    next();
}, userController.createUsers);

// GET /api/users - Obtener lista de usuarios (AUTENTICACIÓN OPCIONAL)
// Sin auth: devuelve datos básicos para sistema de login
// Con auth: devuelve datos según permisos
router.get("/", (req, res, next) => {
    console.log('📋 GET /users - Lista de usuarios');
    next();
}, optionalAuth, userController.getUsers);

// Rutas que SÍ requieren autenticación

// GET /api/users/:id - Obtener un usuario específico
router.get("/:id", validateAuthToken(), userController.getUser);

// PUT /api/users/:id - Actualizar usuario
router.put("/:id", validateAuthToken(), userController.updateUsers);

// DELETE /api/users/:id - Eliminar usuario (solo admin/empleado)
router.delete("/:id", validateAuthToken(['Admin', 'Employee']), userController.deleteUsers);

console.log('✅ Rutas de usuarios configuradas');

export default router;