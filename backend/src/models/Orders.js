// backend/src/models/Orders.js - Actualización del modelo existente
import { Schema, model } from "mongoose";

const OrdersSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  user_id: { type: Schema.Types.ObjectId, ref: "User" },
  products: [
    {
      product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      image: { type: String }
    },
  ],
  total: { type: Number, required: true },
  customerInfo: {
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'transfer'],
    default: 'card'
  },
  shippingAddress: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware para actualizar updatedAt
OrdersSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default model("orders", OrdersSchema);