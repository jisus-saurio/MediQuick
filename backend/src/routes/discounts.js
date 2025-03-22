import express from "express";

const router = express.Router();

import discountsController from "../controllers/discountsController.js";

router
  .route("/")
  .get(discountsController.getDiscounts)
  .post(discountsController.createDiscounts);

router
  .route("/:id")
  .get(discountsController.getDiscount)
  .put(discountsController.updateDiscounts)
  .delete(discountsController.deleteDiscounts);

export default router