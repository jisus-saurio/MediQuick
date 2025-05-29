// Aqui en el controlador, irán todos los metodos
// (C R U D)

const ordersController = {};

import OrdersModels from "../models/Orders.js";

// SELECT
ordersController.getOrders = async (req, res) => {
  const UserOrder = await OrdersModels.find().populate("user_id");
  res.json(UserOrder);
};

// INSERT
ordersController.createOrders = async (req, res) => {
  const { user_id, products, total } = req.body;

  const newOrders = new OrdersModels({ user_id, products, total });

  await newOrders.save();
  res.json({ message: "Orden guardada" });
};

// DELETE
ordersController.deleteOrders = async (req, res) => {
  const deleteOrders = await OrdersModels.findByIdAndDelete(req.params.id);
  res.json({ message: "Orden eliminada" });
};

// UPDATE
ordersController.updateOrders = async (req, res) => {
  const { user_id, products, total } = req.body;
  const updateOrders = await OrdersModels.findByIdAndUpdate(
    req.params.id,
    { user_id, products, total },
    { new: true }
  );

  res.json({ message: "Orden actualizada" });
};

// SELECT 1 PRODUCT BY ID
ordersController.getOrder = async (req, res) => {
  const order = await OrdersModels.findById(req.params.id);
  res.json(order);
};

export default ordersController;