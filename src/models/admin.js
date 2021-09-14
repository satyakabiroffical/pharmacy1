const mongoose = require("mongoose")
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
    adminid:String,
    adminpassword:String
});

adminSchema.pre("save", async function(next){
    console.log(`admin password = ${this.adminpassword}`)
    if(this.isModified("adminpassword")){
        this.adminpassword = await bcrypt.hash(this.adminpassword, 10);
    }
    next();
})

adminSchema.pre("update", async function(next){
    console.log(`admin password = ${this.adminpassword}`)
    if(this.isModified("adminpassword")){
        this.adminpassword = await bcrypt.hash(this.adminpassword, 10);
    }
    next();
})

const Admin = new mongoose.model("admin", adminSchema);
module.exports = Admin;