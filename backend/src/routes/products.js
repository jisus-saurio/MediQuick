import express from "express";
import { upload, productsController } from "../controllers/productsController.js";
import { validateAuthToken, optionalAuth } from "../middleware/validateAuthToken.js";

const router = express.Router();

// ===== RUTAS PÚBLICAS (accesibles sin autenticación) =====
// Obtener todos los productos - acceso público para la tienda
router.get("/", optionalAuth, productsController.getProducts);

// Obtener un producto específico - acceso público
router.get("/:id", optionalAuth, productsController.getProduct);

// ===== RUTAS PROTEGIDAS (requieren autenticación) =====
// Crear producto - solo admin y empleados
router.post("/", validateAuthToken(["Admin", "Employee"]), upload.single('image'), productsController.createProducts);

// Actualizar producto - solo admin y empleados
router.put("/:id", validateAuthToken(["Admin", "Employee"]), upload.single('image'), productsController.updateProducts);

// Eliminar producto - solo admin y empleados
router.delete("/:id", validateAuthToken(["Admin", "Employee"]), productsController.deleteProducts);

// Actualizar stock - solo admin y empleados
router.patch("/:id/update-stock", validateAuthToken(["Admin", "Employee"]), productsController.updateProductStock);

export default router;