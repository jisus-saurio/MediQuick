import express from "express";

const router = express.Router();

import salesController from "../controllers/salesController.js";

router
  .route("/")
  .get(salesController.getSales)
  .post(salesController.createSales);

router
  .route("/:id")
  .get(salesController.getSale)
  .put(salesController.updateSales)
  .delete(salesController.deleteSales);

export default router