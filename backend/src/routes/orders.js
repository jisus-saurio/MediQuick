// backend/src/routes/orders.js - Actualizando tus rutas existentes
import express from "express";

const router = express.Router();

import ordersController from "../controllers/ordersController.js";

// Define routes for orders (manteniendo tu estructura existente)
router
  .route("/")
  .get(ordersController.getOrders)
  .post(ordersController.createOrders); // Usar tu método existente

// Define routes for a specific order by ID
router
  .route("/:id")
  .get(ordersController.getOrder)
  .put(ordersController.updateOrders) // Usar tu método existente
  .delete(ordersController.deleteOrders); // Usar tu método existente

// Nueva ruta específica para cancelar orden
router
  .route("/:id/cancel")
  .patch(ordersController.cancelOrder);

export default router;