import express from "express";

const router = express.Router();

import suppliersController from "../controllers/suppliersControllers.js";

// Define routes for suppliers
router
  .route("/")
  .get(suppliersController.getSupplier)
  .post(suppliersController.createSupplier);

// Define routes for a specific supplier by ID
router
  .route("/:id")
  .get(suppliersController.getSuppliers)
  .put(suppliersController.updateSupplier)
  .delete(suppliersController.deleteSupplier);

export default router