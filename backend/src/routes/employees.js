import express from "express";

const router = express.Router();

import employeesController from "../controllers/employeesController.js";

router
  .route("/")
  .get(employeesController.getEmployees)
  .post(employeesController.createEmployees);

router
  .route("/:id")
  .get(employeesController.getEmployee)
  .put(employeesController.updateEmployees)
  .delete(employeesController.deleteEmployees);

export default router