const salesController = {};
import SalesModels from "../models/Sales.js";


// SELECT
salesController.getSales = async (req, res) => {
  const Payment = await SalesModels.find();
  res.json(Payment);
};

// INSERT
salesController.createSales = async (req, res) => {
  const { cartId, paymentMethod, address, status } = req.body;

  const newEmployees = new SalesModels({
    cartId,
    paymentMethod,
    address,
    status,
  });

  await newEmployees.save();
  res.json({ message: "Venta guardada" });
};

// DELETE
salesController.deleteSales = async (req, res) => {
  const deleteSales = await SalesModels.findByIdAndDelete(req.params.id);
  res.json({ message: "Venta eliminada" });
};

// UPDATE
salesController.updateSales = async (req, res) => {
  const { cartId, paymentMethod, address, status } = req.body;
  const updateSales = await SalesModels.findByIdAndUpdate(
    req.params.id,
    { cartId, paymentMethod, address, status },
    { new: true }
  );

  res.json({ message: "Venta actualizada" });
};

// SELECT 1 PRODUCT BY ID
salesController.getSale = async (req, res) => {
  const Payments = await SalesModels.findById(req.params.id);
  res.json(Payments);
};

export default salesController;
