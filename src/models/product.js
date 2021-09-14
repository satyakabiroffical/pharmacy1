const express= require("express");
const mongoose = require("mongoose");

const productschema = new mongoose.Schema({
    productName:{
        type:String
    },
    productDescription:{
        type:String
    },
    productPrice:String,
    productQuantity:Number,

    productImage1:String,
    productImage2:String,
    productImage3:String,
    productImage4:String,


})

    const Product = new mongoose.model("product", productschema);
    module.exports = Product;