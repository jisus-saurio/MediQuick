import express from "express";

const router = express.Router();

import userController from "../controllers/userController.js";

// Define routes for users
router
  .route("/")
  .get(userController.getUser)
  .post(userController.createUsers);

// Define routes for a specific user by ID
router
  .route("/:id")
  .get(userController.getUsers)
  .put(userController.updateUsers)
  .delete(userController.deleteUsers);

export default router