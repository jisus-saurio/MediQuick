import express from "express";

const router = express.Router();

import cartsController from "../controllers/cartsController.js";

router
  .route("/")
  .get(cartsController.getCarts)
  .post(cartsController.createCarts);

router
  .route("/:id")
  .get(cartsController.getCart)
  .put(cartsController.updateCarts)
  .delete(cartsController.deleteCarts);

export default router