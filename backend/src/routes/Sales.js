import express from "express";

const router = express.Router();

import salesController from "../controllers/salesController.js";

// Define routes for sales
router
  .route("/")
  .get(salesController.getSales)
  .post(salesController.createSales);

// Define routes for a specific sale by ID
router
  .route("/:id")
  .get(salesController.getSale)
  .put(salesController.updateSales)
  .delete(salesController.deleteSales);

export default router