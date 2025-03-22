import express from "express";

const router = express.Router();

import suppliersController from "../controllers/suppliersControllers.js";

router
  .route("/")
  .get(suppliersController.getSupplier)
  .post(suppliersController.createSupplier);

router
  .route("/:id")
  .get(suppliersController.getSuppliers)
  .put(suppliersController.updateSupplier)
  .delete(suppliersController.deleteSupplier);

export default router