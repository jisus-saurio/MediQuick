import express from "express";

const router = express.Router();

import cartsController from "../controllers/cartsController.js";

// Define routes for carts
router
  .route("/")
  .get(cartsController.getCarts)
  .post(cartsController.createCarts);

// Define routes for a specific cart by ID
router
  .route("/:id")
  .get(cartsController.getCart)
  .put(cartsController.updateCarts)
  .delete(cartsController.deleteCarts);

export default router