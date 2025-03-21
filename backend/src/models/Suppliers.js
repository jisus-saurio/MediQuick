/*
Suppliers (Proveedores):
{
  "_id": ObjectId("5f50c31b1c9d440000a1b2c7"),
  "name": "Farmaceutica XYZ",
  "contact": "contact@pharmaceuticalxyz.com",
  "phone": "555-5678"
}
*/

import { Schema, model } from "mongoose";

const supplierSchema = new Schema({
    name: {type : String, required : true},
    contact: {type : String, required : true},
    phone: {type : String, required : true}
});

export default model("supplier", supplierSchema);