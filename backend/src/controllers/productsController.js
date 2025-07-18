import productsModel from "../models/Products.js";
import { v2 as cloudinary } from "cloudinary";
import multer from 'multer';
import { config } from "../config.js";
import Category from '../models/Categories.js';
import Supplier from '../models/Suppliers.js';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: config.CLOUDINARY.CLOUD_NAME,
  api_key: config.CLOUDINARY.API_KEY,
  api_secret: config.CLOUDINARY.API_SECRET,
});

// Configurar multer para manejar la subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Controlador de productos
const productsController = {};

// Obtener todos los productos
productsController.getProducts = async (req, res) => {
  try {
    const products = await productsModel.find().populate('categoryId supplierId');
    res.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

// Agregar un nuevo producto
productsController.createProducts = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId, supplierId } = req.body;

    // Validación de campos requeridos
    if (!name || !price || !stock || !categoryId || !supplierId) {
      return res.status(400).json({ error: "Nombre, precio, stock, categoría y proveedor son requeridos." });
    }

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
    res.status(201).json({ message: "Producto agregado con éxito", product: newProduct });
  } catch (error) {
    console.error("Error al agregar producto:", error);
    res.status(500).json({ error: "Error al agregar producto" });
  }
};

// Actualizar un producto
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

    const updatedProduct = await productsModel.findByIdAndUpdate(
      req.params.id,
      { name, description, price, stock, categoryId, supplierId, image: imageUrl },
      { new: true }
    ).populate('categoryId supplierId');

    if (!updatedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ message: "Producto actualizado con éxito", product: updatedProduct });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
};

// Eliminar un producto
productsController.deleteProducts = async (req, res) => {
  try {
    const deletedProduct = await productsModel.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json({ message: "Producto eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};

// Obtener un producto por ID
productsController.getProduct = async (req, res) => {
  try {
    const product = await productsModel.findById(req.params.id).populate('categoryId supplierId');
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ error: "Error al obtener producto" });
  }
};
productsController.updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityToDeduct } = req.body;
    
    if (!quantityToDeduct || quantityToDeduct <= 0) {
      return res.status(400).json({ message: 'Cantidad a deducir debe ser mayor a 0' });
    }
    
    const product = await productsModel.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    if (product.stock < quantityToDeduct) {
      return res.status(400).json({ 
        message: 'Stock insuficiente', 
        availableStock: product.stock,
        requestedQuantity: quantityToDeduct
      });
    }
    
    // Actualizar stock
    const updatedProduct = await productsModel.findByIdAndUpdate(
      id,
      { 
        $inc: { stock: -quantityToDeduct }
      },
      { new: true }
    );
    
    res.json({
      message: 'Stock actualizado exitosamente',
      product: {
        id: updatedProduct._id,
        name: updatedProduct.name,
        previousStock: updatedProduct.stock + quantityToDeduct,
        currentStock: updatedProduct.stock,
        quantityDeducted: quantityToDeduct
      }
    });
    
  } catch (error) {
    console.error('Error actualizando stock:', error);
    res.status(500).json({ message: 'Error actualizando stock', error: error.message });
  }
};

// Exportar el controlador y el middleware de multer
export { upload, productsController };
