/* 
description
 surname
    amount
    position
    expiration_date
*/

import { Schema, model } from "mongoose";

const discountsSchema = new Schema({
    surname: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    expiration_date: {
        type: Date,
        required: true
    }
});

export default model("discounts ", discountsSchema);