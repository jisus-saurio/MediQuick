/* 
name
 description
    price
    stock
    categoryId
    supplierId
    image
*/

import { Schema, model } from "mongoose";

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
  supplierId: { type: Schema.Types.ObjectId, ref: "Supplier" },
  image: { type: String }
});

export default model("products", productSchema);
