// Aqui en el controlador, irán todos los metodos
// (C R U D)

const supplierController = {};

import  SupplierModels from "../models/Suppliers.js";

// SELECT
supplierController.getSupplier = async (req, res) => {
  const supplier = await SupplierModels.find();
  res.json(supplier);
};

// INSERT
supplierController.createSupplier = async (req, res) => {
  const { name, contact, phone} = req.body;

  const newSupplier = new SupplierModels({ name, contact, phone });

  await newSupplier.save();
  res.json({ message: "Proveedor guardado" });
};

// DELETE
supplierController.deleteSupplier = async (req, res) => {
  const deleteSupplier = await SupplierModels.findByIdAndDelete(req.params.id);
  res.json({ message: "Proveedor eliminado" });
};

// UPDATE
supplierController.updateSupplier = async (req, res) => {
  const { name, contact, phone } = req.body;
  const updateSupplier = await SupplierModels.findByIdAndUpdate(
    req.params.id,
    { name, contact, phone },
    { new: true }
  );

  res.json({ message: "Proveedor actualizado" });
};

// SELECT 1 PRODUCT BY ID
supplierController.getSuppliers = async (req, res) => {
  const suppliers = await SupplierModels.findById(req.params.id);
  res.json(suppliers);
};

export default supplierController;