/*
Suppliers (Proveedores):
{
  "name": ,
  "contact": ,
  "phone": 
}
*/

import { Schema, model } from "mongoose";

const SupplierSchema = new Schema({
    name: {type : String, required : true},
    contact: {type : String, required : true},
    phone: {type : String, required : true}
});

export default model("Supplier", SupplierSchema);