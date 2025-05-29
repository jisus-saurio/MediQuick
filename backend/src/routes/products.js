import express from "express";
import { upload, productsController } from "../controllers/productsController.js"; // Asegúrate de importar correctamente

const router = express.Router();

// Rutas para productos
router
  .route("/")
  .get(productsController.getProducts) // Obtener todos los productos
  .post(upload.single('image'), productsController.createProducts); // Agregar un nuevo producto

router
  .route("/:id")
  .get(productsController.getProduct) // Obtener un producto por ID
  .put(upload.single('image'), productsController.updateProducts) // Actualizar un producto
  .delete(productsController.deleteProducts); // Eliminar un producto

export default router;
