// backend/src/routes/products.js - Agregar esta ruta a tu archivo existente
import express from "express";
import { upload, productsController } from "../controllers/productsController.js";

const router = express.Router();

// Rutas existentes
router
  .route("/")
  .get(productsController.getProducts)
  .post(upload.single('image'), productsController.createProducts);

router
  .route("/:id")
  .get(productsController.getProduct)
  .put(upload.single('image'), productsController.updateProducts)
  .delete(productsController.deleteProducts);

// Nueva ruta para actualizar stock (AGREGAR ESTA LÍNEA)
router
  .route("/:id/update-stock")
  .patch(productsController.updateProductStock);

export default router;