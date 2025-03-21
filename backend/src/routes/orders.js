import express from "express";

const router = express.Router();

import ordersController from "../controllers/ordersController.js";

router
  .route("/")
  .get(ordersController.getOrders)
  .post(ordersController.createOrders);

router
  .route("/:id")
  .get(ordersController.getOrder)
  .put(ordersController.updateOrders)
  .delete(ordersController.deleteorders);

export default router