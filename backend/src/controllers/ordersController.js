// backend/src/controllers/ordersController.js - Actualizando tu controlador existente
const ordersController = {};

import OrdersModel from "../models/Orders.js";
import productsModel from "../models/Products.js";

// SELECT - Obtener todas las órdenes
ordersController.getOrders = async (req, res) => {
  try {
    const orders = await OrdersModel.find()
      .populate("user_id")
      .populate("products.product_id")
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    res.status(500).json({ message: 'Error obteniendo órdenes', error: error.message });
  }
};

// SELECT 1 ORDER BY ID
ordersController.getOrder = async (req, res) => {
  try {
    const order = await OrdersModel.findById(req.params.id)
      .populate("user_id")
      .populate("products.product_id");
    
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error obteniendo orden:', error);
    res.status(500).json({ message: 'Error obteniendo orden', error: error.message });
  }
};

// INSERT - Crear nueva orden (actualizando tu método existente)
ordersController.createOrders = async (req, res) => {
  try {
    const { items, total, customerInfo, paymentMethod, shippingAddress, user_id } = req.body;
    
    // Validar datos requeridos
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Los items son requeridos' });
    }
    
    if (!customerInfo || !customerInfo.customerName || !customerInfo.email) {
      return res.status(400).json({ message: 'Información del cliente es requerida' });
    }

    // Verificar stock disponible para todos los productos
    for (const item of items) {
      const product = await productsModel.findById(item._id);
      if (!product) {
        return res.status(404).json({ message: `Producto ${item.name} no encontrado` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Stock insuficiente para ${item.name}. Disponible: ${product.stock}` 
        });
      }
    }

    // Generar número de orden único
    const orderNumber = `ORD-${Date.now()}`;
    
    // Crear la orden con la estructura de tu modelo existente
    const newOrder = new OrdersModel({
      orderNumber,
      user_id: user_id || null,
      products: items.map(item => ({
        product_id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        image: item.image
      })),
      total,
      customerInfo,
      paymentMethod: paymentMethod || 'card',
      shippingAddress: shippingAddress || customerInfo.address,
      status: 'pending'
    });

    const savedOrder = await newOrder.save();

    // Actualizar stock de cada producto
    for (const item of items) {
      await productsModel.findByIdAndUpdate(
        item._id,
        { $inc: { stock: -item.quantity } }
      );
    }
    
    res.status(201).json({
      message: 'Orden creada exitosamente',
      order: savedOrder
    });
    
  } catch (error) {
    console.error('Error creando orden:', error);
    res.status(500).json({ message: 'Error creando orden', error: error.message });
  }
};

// UPDATE - Actualizar orden (manteniendo tu método existente)
ordersController.updateOrders = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }
    
    const updatedOrder = await OrdersModel.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    res.json({ message: 'Orden actualizada exitosamente', order: updatedOrder });
    
  } catch (error) {
    console.error('Error actualizando orden:', error);
    res.status(500).json({ message: 'Error actualizando orden', error: error.message });
  }
};

// DELETE - Eliminar orden (manteniendo tu método existente)
ordersController.deleteOrders = async (req, res) => {
  try {
    const deletedOrder = await OrdersModel.findByIdAndDelete(req.params.id);
    
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    res.json({ message: "Orden eliminada exitosamente" });
  } catch (error) {
    console.error('Error eliminando orden:', error);
    res.status(500).json({ message: 'Error eliminando orden', error: error.message });
  }
};

// NUEVO MÉTODO - Cancelar orden
ordersController.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await OrdersModel.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Solo se pueden cancelar órdenes pendientes' });
    }
    
    // Restaurar stock de los productos
    for (const item of order.products) {
      await productsModel.findByIdAndUpdate(
        item.product_id,
        { $inc: { stock: item.quantity } }
      );
    }
    
    order.status = 'cancelled';
    order.updatedAt = new Date();
    
    await order.save();
    
    res.json({ message: 'Orden cancelada exitosamente', order });
    
  } catch (error) {
    console.error('Error cancelando orden:', error);
    res.status(500).json({ message: 'Error cancelando orden', error: error.message });
  }
};

export default ordersController;