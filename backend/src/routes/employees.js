import express from "express";

const router = express.Router();

import employeesController from "../controllers/employeesController.js";

// Define routes for employees
router
  .route("/")
  .get(employeesController.getEmployees)
  .post(employeesController.createEmployees);

// Define routes for a specific employee by ID
router
  .route("/:id")
  .get(employeesController.getEmployee)
  .put(employeesController.updateEmployees)
  .delete(employeesController.deleteEmployees);

export default router