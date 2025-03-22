// Aqui en el controlador, irán todos los metodos
// (C R U D)

const salesController = {};

import  SalesModels from "../models/Sales.js";

// SELECT
salesController.getCategories = async (req, res) => {
  const Payment = await SalesModels.find();
  res.json(Payment);
};

// INSERT
salesController.createCategories = async (req, res) => {
  const {  cartId, paymentMethod, address, status} = req.body;

  const newEmployees = new SalesModels({ cartId, paymentMethod, address, status });

  await newEmployees.save();
  res.json({ message: "Venta guardada" });
};

// DELETE
salesController.deleteCategories = async (req, res) => {
  const deleteEmployees = await SalesModels.findByIdAndDelete(req.params.id);
  res.json({ message: "Venta eliminada" });
};

// UPDATE
salesController.updateCategories = async (req, res) => {
  const {  cartId, paymentMethod, address, status } = req.body;
  const updateEmployees = await SalesModels.findByIdAndUpdate(
    req.params.id,
    {  cartId, paymentMethod, address, status },
    { new: true }
  );

  res.json({ message: "Venta actualizada" });
};

// SELECT 1 PRODUCT BY ID
salesController.getCategorie = async (req, res) => {
  const Payments = await SalesModels.findById(req.params.id);
  res.json(Payments);
};

export default salesController;