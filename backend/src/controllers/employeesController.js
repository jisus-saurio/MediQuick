// Aqui en el controlador, irán todos los metodos
// (C R U D)

const employeesController = {};

import  EmployeesModels from "../models/Employees.js";

// SELECT
employeesController.getEmployees = async (req, res) => {
  const employees = await EmployeesModels.find();
  res.json(employees);
};

// INSERT
employeesController.createEmployees = async (req, res) => {
  const { name, surname, email, position, nurse_credential} = req.body;

  const newEmployees = new EmployeesModels({ name, surname, email, position, nurse_credential });

  await newEmployees.save();
  res.json({ message: "Producto guardado" });
};

// DELETE
employeesController.deleteEmployees = async (req, res) => {
  const deleteEmployees = await EmployeesModels.findByIdAndDelete(req.params.id);
  res.json({ message: "Producto eliminado" });
};

// UPDATE
employeesController.updateEmployees = async (req, res) => {
  const { name, surname, email, position, nurse_credential } = req.body;
  const updateEmployees = await EmployeesModels.findByIdAndUpdate(
    req.params.id,
    { name, surname, email, position, nurse_credential },
    { new: true }
  );

  res.json({ message: "producto actualizado" });
};

// SELECT 1 PRODUCT BY ID
employeesController.getEmployee = async (req, res) => {
  const employee = await EmployeesModels.findById(req.params.id);
  res.json(employee);
};

export default employeesController;