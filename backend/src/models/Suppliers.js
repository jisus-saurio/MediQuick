/*
Suppliers (Proveedores):
{
  "name": ,
  "contact": ,
  "phone": 
}
*/

import { Schema, model } from "mongoose";

const supplierSchema = new Schema({
    name: {type : String, required : true},
    contact: {type : String, required : true},
    phone: {type : String, required : true}
});

export default model("supplier", supplierSchema);