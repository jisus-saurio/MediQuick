/* 
name
 description
*/

import { Schema, model } from "mongoose";

const Categoriesschema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
});

export default model("Category", Categoriesschema);
