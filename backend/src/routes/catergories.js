import express from "express";
import categoriesController from "../controllers/categoriesController.js";
import { validateAuthToken, optionalAuth } from "../middleware/validateAuthToken.js";

const router = express.Router();

// ===== RUTAS PÚBLICAS (accesibles sin autenticación) =====
// Obtener todas las categorías - acceso público para la tienda
router.get("/", optionalAuth, categoriesController.getCategories);

// Obtener una categoría específica - acceso público
router.get("/:id", optionalAuth, categoriesController.getCategorie);

// ===== RUTAS PROTEGIDAS (requieren autenticación de Admin) =====
// Crear categoría - solo admin
router.post("/", validateAuthToken(["Admin"]), categoriesController.createCategories);

// Actualizar categoría - solo admin
router.put("/:id", validateAuthToken(["Admin"]), categoriesController.updateCategories);

// Eliminar categoría - solo admin
router.delete("/:id", validateAuthToken(["Admin"]), categoriesController.deleteCategories);

export default router;