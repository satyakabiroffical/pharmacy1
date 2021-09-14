const mongoose = require("mongoose");

const orderschema = new mongoose.Schema({
        customerName:{
            type:String
        },
        customerEmail:{
            type:String
        },
        customerMobile:{
            type:Number
        },
        customerPincode:{
            type:Number
        },
        customerAddress:{
            type:String
        },
        orderDate:{
            type:Date,
            default:  Date.now
        }
})

const Order = new mongoose.model("order", orderschema);

module.exports = Order;