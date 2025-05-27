import productsModel from "../models/Products.js";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";

// Configurar Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.CLOUD_NAME,
  api_key: config.cloudinary.API_KEY,
  api_secret: config.cloudinary.API_SECRET,
});

// Array de funciones para el CRUD
const productsController = {};

// SELECT - Obtener todos los productos
productsController.getProducts = async (req, res) => {
  const products = await productsModel.find().populate("user_id");
  res.json(products);
};

// INSERT - Agregar un nuevo producto
productsController.createProducts = async (req, res) => {
  const { user_id, name, description, price, stock, categoryId, supplierId } = req.body;
  let imageUrl = "";

  // Subir imagen a Cloudinary
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "products",
      allowed_formats: ["jpg", "png", "jpeg"],
    });
    imageUrl = result.secure_url;
  }

  // Guardar en la base de datos
  const newProduct = new productsModel({
    user_id,
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
};

// UPDATE - Actualizar un producto
productsController.updateProducts = async (req, res) => {
  const { user_id, name, description, price, stock, categoryId, supplierId } = req.body;
  let imageUrl = "";

  // Subir nueva imagen a Cloudinary si se proporciona
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "products",
      allowed_formats: ["jpg", "png", "jpeg"],
    });
    imageUrl = result.secure_url;
  }

  // Actualizar en la base de datos
  await productsModel.findByIdAndUpdate(
    req.params.id,
    { user_id, name, description, price, stock, categoryId, supplierId, image: imageUrl },
    { new: true }
  );

  res.json({ message: "Producto actualizado con éxito" });
};

// DELETE - Eliminar un producto
productsController.deleteProducts = async (req, res) => {
  await productsModel.findByIdAndDelete(req.params.id);
  res.json({ message: "Producto eliminado con éxito" });
};

// SELECT - Obtener un producto por ID
productsController.getProduct = async (req, res) => {
  const product = await productsModel.findById(req.params.id);
  res.json(product);
};

export default productsController;