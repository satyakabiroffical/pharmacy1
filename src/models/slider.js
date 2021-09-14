const mongoose = require("mongoose");

const sliderSchema = new mongoose.Schema({
    image:{
        type:String
    }
})


const Slider = new mongoose.model("slider", sliderSchema);

module.exports = Slider;
