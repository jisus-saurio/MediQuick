// Aqui en el controlador, irán todos los metodos
// (C R U D)

const cartsController = {};

import CartsModels from "../models/Carts.js";

// SELECT
cartsController.getCarts = async (req, res) => {
  const carts = await CartsModels.find().populate("user_id");
  res.json(carts);
};

// INSERT
cartsController.createCarts = async (req, res) => {
  const { user_id, products, discounts, total, status } = req.body;

  const newCarts = new CartsModels({ user_id, products, discounts, total, status });

  await newCarts.save();
  res.json({ message: "Carrito guardado" });
};

// DELETE
cartsController.deleteCarts = async (req, res) => {
  const deleteCarts = await CartsModels.findByIdAndDelete(req.params.id);
  res.json({ message: "Carrito eliminado" });
};

// UPDATE
cartsController.updateCarts = async (req, res) => {
  const { user_id, products, discounts, total, status } = req.body;
  const updateCarts = await CartsModels.findByIdAndUpdate(
    req.params.id,
    { user_id, products, discounts, total, status },
    { new: true }
  );

  res.json({ message: "Carrito actualizado" });
};

// SELECT 1 PRODUCT BY ID
cartsController.getCart = async (req, res) => {
  const cart = await CartsModels.findById(req.params.id);
  res.json(cart);
};

export default cartsController;