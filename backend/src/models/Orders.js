/* 
user_id
products: [{
product_id
quantity
}],
total

*/
import { Schema, model } from "mongoose";

const OrdersSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
    products: [{
        product_id: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true },
    }],
    total: { type: Number, required: true },
});

export default model("UserOrder", OrdersSchema);