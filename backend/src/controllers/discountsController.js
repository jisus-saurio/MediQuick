// Aqui en el controlador, irán todos los metodos
// (C R U D)

const discountsController = {};

import  DiscountsModels from "../models/Discounts.js";

// SELECT
discountsController.getDiscounts = async (req, res) => {
  const discounts = await DiscountsModels.find();
  res.json(discounts);
};

// INSERT
discountsController.createDiscounts = async (req, res) => {
  const { name, surname, email, position, nurse_credential} = req.body;

  const newEmployees = new DiscountsModels({ name, surname, email, position, nurse_credential });

  await newEmployees.save();
  res.json({ message: "Descuento guardado" });
};

// DELETE
discountsController.deleteDiscounts = async (req, res) => {
  const deleteEmployees = await DiscountsModels.findByIdAndDelete(req.params.id);
  res.json({ message: "Descuento eliminado" });
};

// UPDATE
discountsController.updateDiscounts = async (req, res) => {
  const { name, surname, email, position, nurse_credential } = req.body;
  const updateEmployees = await DiscountsModels.findByIdAndUpdate(
    req.params.id,
    { name, surname, email, position, nurse_credential },
    { new: true }
  );

  res.json({ message: "Descuento actualizado" });
};

// SELECT 1 PRODUCT BY ID
discountsController.getDiscount = async (req, res) => {
  const discount = await DiscountsModels.findById(req.params.id);
  res.json(discount);
};

export default discountsController;