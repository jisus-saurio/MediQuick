import express from "express";

const router = express.Router();

import categoriesController from "../controllers/categoriesController.js";

// Define routes for categories
router
  .route("/")
  .get(categoriesController.getCategories)
  .post(categoriesController.createCategories);

// Define routes for a specific category by ID
router
  .route("/:id")
  .get(categoriesController.getCategorie)
  .put(categoriesController.updateCategories)
  .delete(categoriesController.deleteCategories);

export default router