// Aqui en el controlador, irán todos los metodos
// (C R U D)

const productsController = {};

import  ProductsModels from "../models/Products.js";

// SELECT
productsController.getProducts = async (req, res) => {
  const products = await ProductsModels.find().populate("user_id");
  res.json(products);
};

// INSERT
productsController.createProducts = async (req, res) => {
  const { user_id, products, total} = req.body;

  const newProducts = new ProductsModels({ user_id, products, total });

  await newProducts.save();
  res.json({ message: "Producto guardado" });
};

// DELETE
productsController.deleteProducts = async (req, res) => {
  const deleteProducts = await ProductsModels.findByIdAndDelete(req.params.id);
  res.json({ message: "Producto eliminado" });
};

// UPDATE
productsController.updateProducts = async (req, res) => {
  const { user_id, products, total } = req.body;
  const updateProducts = await ProductsModels.findByIdAndUpdate(
    req.params.id,
    { user_id, products, total },
    { new: true }
  );

  res.json({ message: "producto actualizado" });
};

// SELECT 1 PRODUCT BY ID
productsController.getProduct = async (req, res) => {
  const product = await ProductsModels.findById(req.params.id);
  res.json(product);
};

export default productsController;