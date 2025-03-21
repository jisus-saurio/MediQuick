import express from "express";

const router = express.Router();

import userController from "../controllers/userController.js";

router
  .route("/")
  .get(userController.getUser)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUsers)
  .put(userController.updateuser)
  .delete(userController.deleteUser);

export default router