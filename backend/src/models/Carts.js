/* 
user_id
products: [{
product_id
quantity
unit_price
subtotal
}],
discounts: [{
discount_id
}],
total
status

*/
import { Schema, model } from "mongoose";
const CartsSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
    products: [{
        product_id: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true },
        unit_price: { type: Number, required: true },
        subtotal: { type: Number, required: true }
    }],
    discounts: [{
        discount_id: { type: Schema.Types.ObjectId, ref: "Discount" }
    }],
    total: { type: Number, required: true },
    status: { type: String, enum: ["pending", "processing", "shipped", "delivered", "cancelled"], default: "pending" }
});

export default model("carts", CartsSchema);