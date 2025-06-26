import express from "express";

const router = express.Router();

import userController from "../controllers/userController.js";

// Define routes for users
router
  .route("/")
  .get(userController.getUsers)  // GET todos los usuarios
  .post(userController.createUsers); // POST crear usuario

// Define routes for a specific user by ID
router
  .route("/:id")
  .get(userController.getUser)    // GET usuario específico por ID
  .put(userController.updateUsers) // PUT actualizar usuario
  .delete(userController.deleteUsers); // DELETE eliminar usuario

export default router;