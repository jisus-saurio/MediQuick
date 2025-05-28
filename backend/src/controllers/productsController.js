import productsModel from "../models/Products.js";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";

// Configurar Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.CLOUD_NAME,
  api_key: config.cloudinary.API_KEY,
  api_secret: config.cloudinary.API_SECRET,
});

const productsController = {};

// SELECT - Obtener todos los productos
productsController.getProducts = async (req, res) => {
  try {
    const products = await productsModel.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

// INSERT - Agregar un nuevo producto
productsController.createProducts = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId, supplierId } = req.body;
    let imageUrl = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
        allowed_formats: ["jpg", "png", "jpeg"],
      });
      imageUrl = result.secure_url;
    }

    const newProduct = new productsModel({
      name,
      description,
      price,
      stock,
      categoryId,
      supplierId,
      image: imageUrl,
    });

    await newProduct.save();
    res.json({ message: "Producto agregado con éxito" });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar producto" });
  }
};

// UPDATE - Actualizar un producto
productsController.updateProducts = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId, supplierId } = req.body;
    let imageUrl = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
        allowed_formats: ["jpg", "png", "jpeg"],
      });
      imageUrl = result.secure_url;
    }

    await productsModel.findByIdAndUpdate(
      req.params.id,
      { name, description, price, stock, categoryId, supplierId, image: imageUrl },
      { new: true }
    );

    res.json({ message: "Producto actualizado con éxito" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar producto" });
  }
};

// DELETE - Eliminar un producto
productsController.deleteProducts = async (req, res) => {
  try {
    await productsModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Producto eliminado con éxito" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};

// SELECT - Obtener un producto por ID
productsController.getProduct = async (req, res) => {
  try {
    const product = await productsModel.findById(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener producto" });
  }
};

export default productsController;
