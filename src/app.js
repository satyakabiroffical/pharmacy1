const express = require("express");
const multer = require("multer");
const upload = require("express-fileupload");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const hbs = require("hbs");
const swal = require("sweetalert");
const fs = require("fs");
const bcrypt = require("bcryptjs");


require("./db/conn")
const Product = require("../src/models/product");
const Slider = require("../src/models/slider")
const userMessage = require("../src/models/usermessage")
const Admin = require("../src/models/admin")
const Order = require("./models/order")

// const update = multer({dest:__dirname + '/uploads'});

const app = express();
app.use(upload())

const port = process.env.PORT || 3000 || 8000;

// const upload = multer({dest:__dirname + '/uploads/images'});

// setting path
const staticPath = path.join(__dirname, "../public");
const templatePath = path.join(__dirname, "../templates/views");
const partialPath = path.join(__dirname, "../templates/partials");

// middleware
// app.use("/css", express.static(path.join(__dirname, "../node_modules/bootstrap/dist/css")));
// app.use("/js", express.static(path.join(__dirname, "../node_modules/bootstrap/dist/js")));
// app.use("/jq", express.static(path.join(__dirname, "../node_modules/jquery/dist")));
app.use(express.urlencoded({ extended: false }));
app.use(express.static("uploads"));
app.use(express.static(staticPath));
app.set("view engine", "hbs");
app.set("views", templatePath);
hbs.registerPartials(partialPath);

app.use(session({
    secret: "thisisasecret",
    saveUninitialized: false,
    resave: false
})
);

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

var sess;

// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//                        front end starts
//                  ===========================

app.get("/", async (req, res) => {
    // get images from slider
    let slide =( await Slider.find()) 
    let products = await Product.find()
    let slide1 = (slide[0]['image']);
    let slide2 = slide[1]['image'];
    let slide3 = slide[2]['image'];
    let message = ""
    // render to index page with slide variable that contains slider database
      res.render("front_index", {slide1, slide2, slide3, slide, products, message})
    
})

app.get("/products", async(req,res) => {
    let product = await Product.find()
   
    res.render("front_products", {product})
})

app.get("/contact", (req, res) => {
    res.render("front_contact")
})

app.get("/blog", (req, res) => {
    res.render("front_blog")
})

app.get("/product-details/:id",async (req, res) => {
    try{
        let product = await Product.findById({_id:req.params.id})
       
        res.render("front_product-details",{product})
    }
    catch(error){
        console.log(error)
    }
})

app.get("/about", (req, res) =>{
    res.render("front_about")
})

app.get("/buy-now", (req, res) =>{
    res.render("front_buynow")
})


//                  ===========================
//                        front end ends
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

app.post("/usermessage", async (req, res) =>{
    try {
        await new userMessage(req.body).save();
        req.body="";
        res.status(201).render("front_contact", {message:"message sent successfully"})
    } catch (error) {
        res.send(error)
    }
})

// orders save start
app.post("/order", async (req, res)=> {
    try {
        await new Order(req.body).save();
        res.status(201).render("front_index", {message:`order successfully sent,  we will contact soon`})
    } catch (error) {
        res.send(error)
    }
})
// orders save ends


app.get("/admin", (req, res) => {

    res.render("login");
})

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// //////////////////////////////////////////////////////////////////////////////////////////////
// -----------  login starts -------------------
app.post("/login", async (req, res) => {
    
    let adminid = req.body.username;
    let adminpassword = req.body.password;

    const presentAdmin = await Admin.findOne({adminid:adminid});

    const isMatch = await bcrypt.compare(adminpassword , presentAdmin.adminpassword)

    // if (req.body.username === "admin@admin.admin" && req.body.password === "admin*admin") {
    if(isMatch){
        sess = req.session;
        sess.email = req.body.username;
        message="logged in successfully"
        res.render("login",{message});
    }
    else {
        res.render("invalid-login")
    }

  
})
// ------------- login ends-------------------
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// ///////////////////////////////////////////////////////////////////////////////////////////////
app.get("/admin/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return console.log(err)
        }
        res.render("login")
    })
})

app.get("/admin/dashboard", async (req, res) => {
    // sess = req.session;
    // if (sess.email) {
      let orders = await Order.find().sort({orderDate:-1});
      let products = await Product.find();
      let usermessages = await userMessage.count();
        res.render("dashboard", {orders, products, usermessages});
    // }
    // else {
        // res.render("login-credentials");
    // }
})

app.get("/admin/usermessages", async (req, res) => {
    
    sess = req.session;
    if (sess.email) {
        let usermessages = await userMessage.find();
        res.render("usermessages", {usermessages});
    }
    else {
        res.render("login-credentials");
    }
})
app.get("/admin/manageslider", (req, res) => {
    
    
    sess = req.session;
    if (sess.email) {
        let message = ""
        manageslider(req, res, message);
    }
    else {
        res.render("login-credentials");
    }
})
app.get("/admin/starter", (req, res) => {
    sess = req.session;
    if (sess.email) {
        res.render("starter-kit");
    }
    else {
        res.render("login-credentials");
    }
})
app.get("/admin/adminmanage", async (req, res) =>{
    
    sess = req.session;
    if (sess.email) {
        let currentAdmin = await Admin.find();
        currentAdmin = currentAdmin[0]["_id"]
        msg = ""
        res.render("adminmanage", {currentAdmin, msg})
    }
    else {
        res.render("login-credentials");
    }
})
app.get("/admin/products", (req, res) => {
  
    sess = req.session;
    if(sess.email){
        
        let message=""
        showProducts(req, res, message);
    }
    else{
        res.render("login-credentials");
    }
})

app.get("/admin-product-brief/:id", async (req, res) => {

    sess = req.session;
    if(sess.email){
        const currentProduct = await Product.findById({_id:req.params.id})
        res.render("admin-product-brief", {currentProduct})
    }
    else{
        res.render("login-credentials");
    }
})

app.get("/admin/addproduct", (req, res) => {

    sess = req.session;
    if(sess.email){
        res.render("addproduct");
    }
    else{
        res.render("login-credentials");
    }
})

app.get("/admin/updateproduct/:id", (req, res) => {

    sess = req.session;
    if(sess.email){
        Product.findById(req.params.id, (err, doc) => {
            if (!err) {
                res.render("updateproduct", { product: doc });
            } else {
                res.send(`product update find error ${err}`);
            }
        })
    }
    else{
        res.render("login-credentials")
    }
})


app.get("/admin-product-add-images/:id", (req,res)=>{

    
    sess = req.session;
    if(sess.email){
        let productid = req.params.id
        res.render("admin-product-add-images", {productid})
    }
    else{
        res.render("login-credentials");
    }
})
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// -----------------Admin add product image - starts
app.post("/admin-product-add-images", async (req, res) =>{
    sess = req.session;
    if(sess.email){
        try {
            if(req.files){
             let num = (Math.floor(Math.random() * (10000 - 1000) + 10000));
             let file = req.files.productImage;
             let filename = req.body.productid+num+file.name;
             let filepath = './uploads/products/' + filename
            
             const image = new Productimage()
             image.productid = req.body.productid;
             image.productimageName = filename;
             image.productimagePath = filepath
     
             await image.save();
     
             await file.mv(filepath)
            }
            res.send("success")
        } catch (error) {
            res.status(500).send(error)
        } 
    }
    else{
        res.render("login-credentials");
    }
  
   
   
})
//  ----------------admin add products image ends
// //////////////////////////////////////////////////////////////////////////////////////////////
// ----------------admin manage admin starts
    app.post("/admin/adminmanage", async (req, res) => {
        sess = req.session;
        if(sess.email){
            let adminPassword = req.body.adminpassword;
            let admincnfPassword = req.body.admincnfpassword
        
            if(adminPassword === admincnfPassword){
                // const currentAdmin = await Admin.findByIdAndUpdate({_id:req.body.adminid}, {adminpassword:adminPassword}, {new:true})
                const bcryptpassword = await bcrypt.hash(adminPassword, 10)
                const adminpassword = {adminpassword:bcryptpassword}
                let currentAdmin = await Admin.findByIdAndUpdate({_id:req.body.adminid}, adminpassword, {new:true});
    
                 currentAdmin = await Admin.find();
                currentAdmin = currentAdmin[0]["_id"];
                let msg="Password changed Successfully";
                res.render("adminmanage", {currentAdmin, msg})
            }
            else{
                res.send("not match")
            }
        }
        else{
            res.render("login-credentials");
        }

     
    })
// ----------------admin manage admin ends
// ////////////////////////////////////////////////////////////////////////////////////
// =========manage slider starts=====================================================
app.post("/admin/manageslider",   async (req, res) =>{
    sess = req.session;
    if(sess.email){
        if(req.files){
            let num = (Math.floor(Math.random() * (10000 - 1000) + 10000));
            let id = req.body.id
            let file = req.files.sliderImage;
            let filename = num + file.name
    
            const previousImage = await Slider.findById(id);
           
            try {
                fs.unlinkSync('./uploads/slider/'+ previousImage.image);
                console.log(`previousImage = ${previousImage.image} delted from uploads folder`)
            } catch (error) {
                console.log(`previous Image = ${previousImage.image} not found in uploads folder`)
            }
            
            
            console.log(`num = ${num} & filename = ${filename}`)
            
            await Slider.findByIdAndUpdate({_id:id}, 
                {
                    image:filename
                },
                {new:true}
            );
    
                file.mv('./uploads/slider/' + filename, function (err) {
                if(!err){
                    console.log("slider image uploaded")
                }
                else{
                    console.log(`slider image upload error ${err}`)
                }
            })
            let message = "slider image updated successfully"
            manageslider(req, res, message);
        }
        else{
            res.send("no file selected")
        }
    }
    else{
        res.render("login-credentials");
    }
  
})
// =========manage slider ends =======================================================
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// ////////////////////////////////////////////////////////////////////////////////////
// --------- user message delete starts ----------------------------------------------
app.post("/usermessagedelete", async (req, res) => {
    sess = req.session;
    if(sess.email){
        try {
            await userMessage.findByIdAndDelete(req.body.id)
            let message = "message deleted"
        let usermessages = await userMessage.find();
        res.render("usermessages", {usermessages, message});
        } catch (error) {
            
        }
    }
    else{
        res.render("login-credentials");
    }

    
})
// ----------user message delete ends--------------------------------------------------
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// ///////////////////////////////////////////////////////////////////////////////////////////////
// ===============ORDER DELETE STARTS===================
app.post("/orderdelete", async (req, res)=>{
    sess = req.session;
    if(sess.email){
        try {
            await Order.findByIdAndDelete(req.body.id)
            let message = "order deleted"
        // let usermessages = await userMessage.find();
        res.render("dashboard", {message});
        } catch (error) {
            res.send(error).status(500)
        }
    }
    else{
        res.render("login-credentials");
    }
})
// ==============order delter ends==================
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// //////////////////////////////////////////////////////////////////////////////////////
// add product starts
app.post("/admin/addproduct", async (req, res) => {
    sess = req.session;
    if(sess.email){
        try {

            if (req.files) {
                let num1 = (Math.floor(Math.random() * (10000 - 1000) + 10000));
                let num2 = (Math.floor(Math.random() * (10000 - 1000) + 10000));
                let num3 = (Math.floor(Math.random() * (10000 - 1000) + 10000));
                let num4 = (Math.floor(Math.random() * (10000 - 1000) + 10000));
                
                var productname = req.body.productName
                
                var file1 = req.files.productImage1 ;
                var file2 = req.files.productImage2 ;
                var file3 = req.files.productImage3 ;
                var file4 = req.files.productImage4 ;
    
                var filename1 = productname+num1+file1.name;
                var filename2 = productname+num2+file2.name;
                var filename3 = productname+num3+file3.name;
                var filename4 = productname+num4+file4.name;
    
                
    
                let filepath1= './uploads/products/' + filename1;
                let filepath2= './uploads/products/' + filename2;
                let filepath3= './uploads/products/' + filename3;
                let filepath4= './uploads/products/' + filename4;
    
    
                //    product save in database start
                let product = new Product();
                product.productName = req.body.productName;
                product.productDescription = req.body.productDescription;
                product.productPrice = req.body.productPrice;
                product.productQuantity = req.body.productQuantity;
                product.productImage1 = filename1;
                product.productImage2 = filename2;
                product.productImage3 = filename3;
                product.productImage4 = filename4;
          
                await product.save();
                //    product save in database end
    
                //file move in upload folder
                  try {
                    await file1.mv(filepath1);
                    await file2.mv(filepath2);
                    await file3.mv(filepath3);
                    await file4.mv(filepath4);
                  } catch (error) {
                      console.log(`file upload error ${error}`)
                  }
                    
              
            }
    
             let message = "Product Added Successfully"   
            showProducts(req, res, message);
        } catch (error) {
            res.status(400).send(error)
        }
    }
    else{
        res.render("login-credentials");
    }

})
// ==============add product ends====================================================
// ////////////////////////////////////////////////////////////////////////////////////////////
// =============delete product starts===================================================
app.get("/admin-delete-product/:id", async (req, res) => {
    sess = req.session;
    if(sess.email){
        try {
       
            const previousProduct = await Product.findById(req.params.id);
          
    
            try {
                fs.unlinkSync('./uploads/products/'+previousProduct.productImage1);
                fs.unlinkSync('./uploads/products/'+previousProduct.productImage2);
                fs.unlinkSync('./uploads/products/'+previousProduct.productImage3);
                fs.unlinkSync('./uploads/products/'+previousProduct.productImage4);
                console.log(`previous product image   deleted from uploads`)    
            } catch (error) {
                console.log(`previous product not found in uploads folder`)
            }
            
    
            await Product.findByIdAndDelete(req.params.id)
            if (!req.params.id) {
                return res.status(400).send();
            }
            let message = "Product Deleted Successfully"   
            showProducts(req, res, message);
            // res.render("deleteproduct")
        } catch (error) {
            res.status(500).send(`producct delete error ${error}`)
        }
    }
    else{
        res.render("login-credentials");
    }


})

// delete product ends
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// update product start
app.post("/admin/updateproduct", async (req, res) => {
    sess = req.session;
    if(sess.email){
        try {
   
            await Product.findByIdAndUpdate({_id:req.body.id}, {
                productName:req.body.productName,
                productDescription:req.body.productDescription,
                productPrice:req.body.productPrice,
                productQuantity:req.body.productQuantity
            }, 
            {new:true}
            )
         let add= "/admin-product-brief/"+req.body.id;
        let message = "Product updated Successfully"   
    
        const currentProduct = await Product.findById({_id:req.body.id})
        res.render("admin-product-brief", {currentProduct, message, add})
       
      
        
    } catch (error) {
        res.send(`product update error ${error}`)
    }
    }
    else{
        res.render("login-credentials");
    }

   
   
})
// update product ends
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//  PRODUCT IMAGE UPDATE STARTS
app.post("/admin-product-image-update", async (req, res)=> {
    sess = req.session;
    if(sess.email){
        try {
            if(req.files){
            let num = (Math.floor(Math.random() * (10000 - 1000) + 10000));
            const id = req.body.productID;
            const previousProduct = await Product.findById(id);
            var productname = req.body.productName
        
        // switch start
            switch(req.body.num){
                case '1':
                    
                    fs.unlinkSync('./uploads/products/'+previousProduct.productImage1);
                    let file1 = req.files.productImage1;
                    let filename1 = productname+num+file1.name
                    let filepath1= './uploads/products/' + filename1;
                   
                    await Product.findByIdAndUpdate({_id:id}, 
                        {   
                            productImage1:filename1
                        },
                        {new:true}
                 
                    );
                    await file1.mv(filepath1)
                    break;
                case '2':
                    
                    fs.unlinkSync('./uploads/products/'+previousProduct.productImage2);
                    let file2 = req.files.productImage2;
                    let filename2 = productname+num+file2.name
                    let filepath2= './uploads/products/' + filename2;
        
                    await Product.findByIdAndUpdate({_id:id}, 
                        {   
                            productImage2:filename2
                        },
                        {new:true}
                 
                    );
        
                    await file2.mv(filepath2)
                        break;
                case '3':
                    
                    fs.unlinkSync('./uploads/products/'+previousProduct.productImage3);
                    let file3 = req.files.productImage3;
                    let filename3 = productname+num+file3.name
                    let filepath3= './uploads/products/' + filename3;
        
                    await Product.findByIdAndUpdate({_id:id}, 
                        {   
                            productImage3:filename3
                        },
                        {new:true}
                 
                    );
        
                    await file3.mv(filepath3)
                    break;
                case '4':
                    
                    fs.unlinkSync('./uploads/products/'+previousProduct.productImage4);
                    let file4 = req.files.productImage4;
                    let filename4 = productname+num+file4.name
                    let filepath4= './uploads/products/' + filename4;
        
                    await Product.findByIdAndUpdate({_id:id}, 
                        {   
                            productImage4:filename4
                        },
                        {new:true}
                 
                    );
        
                    await file4.mv(filepath4)
                    break;
            }
        // switch end
        let add= "/admin-product-brief/"+id;
        let message = "Image updated Successfully"   
    
        const currentProduct = await Product.findById({_id:id})
        res.render("admin-product-brief", {add, message})   
            }
            else{
                res.send("please select an image")
            }
    
        } catch (error) {
            res.send(`image update error ${error}`);
        }
    }
    else{
        res.render("login-credentials");
    }

 
})
// product image update ends


// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
app.listen(port, () => {
    console.log(`server is running at port no. ${port}`);
})


// show product function start
const showProducts = (req, res, message) => {
    let msg=message;
    
    Product.find((err, docs) => {
        if (!err) {
            res.render("products", {
                product: docs, msg
            })
        } else {
            console.log(`error in view product ${err}`);
        }
    })
}
//  show product function ends
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  show slider function start
const manageslider = (req, res, message) => {
    let msg = message
    Slider.find((err, docs) => {
        if(!err){
            res.render("manageslider", {slider:docs, msg})
        }else{
            console.log(`error in manage slider ${err}`);
        }
    })
}

// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
