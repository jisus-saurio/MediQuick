import express from "express";

const router = express.Router();

import discountsController from "../controllers/discountsController.js";

// Define routes for discounts
router
  .route("/")
  .get(discountsController.getDiscounts)
  .post(discountsController.createDiscounts);

// Define routes for a specific discount by ID
router
  .route("/:id")
  .get(discountsController.getDiscount)
  .put(discountsController.updateDiscounts)
  .delete(discountsController.deleteDiscounts);

export default router