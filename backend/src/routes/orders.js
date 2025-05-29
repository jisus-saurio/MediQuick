import express from "express";

const router = express.Router();

import ordersController from "../controllers/ordersController.js";

// Define routes for orders
router
  .route("/")
  .get(ordersController.getOrders)
  .post(ordersController.createOrders);

// Define routes for a specific order by ID
router
  .route("/:id")
  .get(ordersController.getOrder)
  .put(ordersController.updateOrders)
  .delete(ordersController.deleteOrders);

export default router