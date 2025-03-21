import express from "express";

const router = express.Router();

import userController from "../controllers/userController.js";

router
  .route("/")
  .get(userController.getUser)
  .post(userController.createUsers);

router
  .route("/:id")
  .get(userController.getUsers)
  .put(userController.updateUsers)
  .delete(userController.deleteUsers);

export default router