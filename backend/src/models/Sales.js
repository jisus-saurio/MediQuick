/* 
cartId
paymentMethod: ["dinero", "tarjeta"]
address
status

*/
import { Schema, model } from "mongoose";

const salesSchema = new Schema({

    cartId: { type: Schema.Types.ObjectId, ref: "Carts" },
    paymentMethod: { type: String, enum: ["dinero", "tarjeta"], required: true },
    address: { type: String, required: true },
    status: { type: String, enum: ["pendiente", "confirmado", "cancelado"], default: "pendiente" },

});

export default model("Payment", salesSchema);
