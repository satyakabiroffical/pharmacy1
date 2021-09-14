const mongoose = require("mongoose");

const usermessageschema = new mongoose.Schema({
        userName:{
            type:String
        },
        userEmail:{
            type:String
        },
        userSubject:{
            type:String
        },
        userMessage:{
            type:String
        }
})

const userMessage = new mongoose.model("usermessage", usermessageschema);

module.exports = userMessage;