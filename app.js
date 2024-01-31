require("dotenv").config();
const express=require("express");

const bodyparser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const session =require("express-session");   
const passport=require("passport")         
const flash = require('connect-flash');  
// const expressmessages=require("express-messages")                   
const passportlocalmongoose=require("passport-local-mongoose")
const app= express();
app.use(express.static("public")); 
app.set("view engine","ejs");
app.use(bodyparser.urlencoded({extended:true})); 
 
 app.use(flash());



app.use(session({
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DBURL)
.then(result=>{
    console.log("mongo connected");
})
.catch(err=>{
    console.log(err);
})
var msg="";
const schema=new mongoose.Schema({
    name:String,
    username:String,
    password:String,
   
});
const productschema=new mongoose.Schema({
    title:String,
    desc:String,
    price:Number,
    img:String
})
const cartitems=new mongoose.Schema({

    // title:String,
    // desc:String,
    // price:Number,
    // img:String
    userid:String,
    productid:String
})
const collection=new mongoose.Schema({
    category:String,
    title:String,
    desc:String,
    price:Number,
    img:String
})

schema.plugin(passportlocalmongoose); 
const collectionmodel=new mongoose.model("collection",collection);
const usermodel=new mongoose.model("user",schema);
const productmodel=new mongoose.model("product",productschema);
const cartmodel=new mongoose.model("cartitem",cartitems);
passport.use(usermodel.createStrategy()); 



// passport.serializeUser(usermodel.serializeUser());
// passport.deserializeUser(usermodel.deserializeUser());

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

passport.deserializeUser(function(id, done) {
    usermodel.findById(id).exec()
    .then(user=>{
        // console.log(user);
        done(null,user);
    })
    .catch(err=>{
        done(err);
    })
    
    });
    app.use(function(req, res, next){          //to dissplay messages
        res.locals.messages = require('express-messages')(req,res);
        next();
    });      

app.get("/login",(req,res)=>{

    res.render("login",{msg:msg}) 
    msg="";
})
app.get("/signup",(req,res)=>{
res.render("signup",{msg:msg})
msg="";
});

app.get("/",(req,res)=>{
    productmodel.find({}).exec()
    .then(result=>{
        // console.log(req.isAuthenticated());
        if(req.isAuthenticated()){
        res.render("index",{products:result});
        }else{
            res.redirect("/login")
        } 
    })
    });
    let s="";
app.post("/signup",(req,res)=>{
   
    var password=req.body.password; 
    var confirmpassword=req.body.confirmpassword 
    s=req.body.username;
   if(password!=confirmpassword){
    msg="passwords are not matching!";
     res.redirect("/signup");
  }
else{
    usermodel.register({username:req.body.username,name:req.body.name},req.body.password,function(err,user){
        if(err){
            // console.log(err); 
            res.redirect("/signup");
        }
        else{
           
            passport.authenticate("local")(req,res,function(){
            msg="";
            req.flash("info","Congrats! You are singned in")
            res.redirect("/");
            })
        }
    })}
})

app.post("/login",(req,res)=>{
 
   const user=new usermodel({
        username:req.body.username,
        password:req.body.password
     })
     s=req.body.username;
    req.login(user,function(err){
        // console.log(err);
        if(err){
        msg="Wrong password!"
        res.redirect("/login");
        }
        else{
           
            passport.authenticate("local")(req,res,function(){
                    req.flash("info","Successfully! login");
                    res.redirect("/") 
        })
    }
    })
   
      })
 app.get("/buy", (req, res) => {
        res.render("buy");
    });
 

app.get("/orders",(req,res)=>{
   
    if(req.isAuthenticated()){
        res.render("orders");
    }else{
        res.redirect("/login")
    }
})
// let item=[];
// app.get("/cart",(req,res)=>{
//     if(req.isAuthenticated()){
//         cartmodel.find({}).exec()                ///this code cannot handle promises and responses properly 
//           .then(result=>{                           //it sends res before getting promises froom the database 
//             console.log(result);

//            result.forEach(element => {
//             console.log(element.productid);
//             productmodel.find({_id:element.productid}).exec()
//             .then(rest=>{
                
//             console.log(rest);
//             item.push(rest);
              
             
//             }) 
//             console.log(item);
//             });
//            res.render("cart",{carts:item}); 
           
//           })
        
//     }else{

//         res.redirect("/login")
//     }
// })
let path="";
app.get("/cart", async (req, res) => {
    const item = [];
  try {
    if (req.isAuthenticated()) {
      const cartItems = await cartmodel.find({userid:s}).exec();          //this code works properly and  waits until you recive the data
    // console.log(cartItems);
      for (const element of cartItems) {
        const productDetails = await collectionmodel.findById(element.productid).exec();
        item.push(productDetails);
      }

    //   console.log(item);
      res.render("cart", {carts:item});    
    }else {
      // Handle case where user is not authenticated 
      res.redirect("/login");
    }
  } catch (error) {
    console.error(error);
    // Handle error appropriately
    res.status(500).send("Internal Server Error");
  }
});

app.post("/addtocart",(req,res)=>{
    // console.log(req.body.button); 
     const item=req.body.button;
    // productmodel.find({_id:item}).exec()
    //   .then(result=>{
    
     const cart=new cartmodel({
        productid:item,
        userid:s

     })
        cart.save();
   
    res.redirect("/collections/"+path);
    // })
    // .catch(err=>{
    //     console.log(err);
    // })
   
});
app.post("/delete",(req,res)=>{
    const deleteitem=req.body.cartbutton;
    // console.log(deleteitem);
    cartmodel.deleteOne({productid:deleteitem}).exec()
    .then(re=>{
        // console.log(re)
        res.redirect("/cart");
    })
    .catch(err=>{
        console.log(err);
    })
   
})

app.get("/account",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("account");
        }else{
            res.redirect("/login")
        }
})
 
app.get("/addproduct",(req,res)=>{
    res.render("addproduct");
})
app.post("/addproduct",(req,res)=>{
    var product=new productmodel({
        title:req.body.title,
        desc:req.body.desc,
        price:req.body.price,
        img:req.body.img
    })
    product.save();
    res.redirect("/addproduct")
})
app.get("/addcollection",(req,res)=>{
    res.render("addcollection");
})
app.post("/addcollection",(req,res)=>{
    var products=new collectionmodel({
        category:req.body.category,
        title:req.body.title,
        desc:req.body.desc,
        price:req.body.price,
        img:req.body.img
    })
    products.save();
    res.redirect("/addcollection")
         
})

 /// for search barrrr
 app.get("/search", async (req, res) => {
    try {
        const query = req.query.query;
        const regex = new RegExp(escapeRegex(query), 'gi'); // Function to escape special characters

        // Use Mongoose to find products that match the search query
        const searchResults = await collectionmodel.find({ $or: [{ title: regex }, { desc: regex }] }).exec();

        res.render("search", { products: searchResults, query: query });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

//ends here


app.get("/collections/:url",(req,res)=>{
     
    var route=req.params.url;
    path=route;
    // console.log(route);
    collectionmodel.find({"category":{$regex:route,$options:'i'}}).exec()
    .then(result=>{
        // console.log(req.isAuthenticated());
        // console.log(result);                                          //{ '$regex':/^route$/i}//{ $regex: desiredCountryCode, $options: 'i' }
        res.render("collections",{products:result})
    })
    
    
})
app.get("/:url",async(req,res)=>{   
    var route=req.params.url;
    // console.log(route); 
    await collectionmodel.findOne({title:route}).exec()
    .then(result=>{ 
        if(result){
        res.render("desc",{title:result.title, img:result.img,price:result.price,desc:result.desc,id:result._id})
        }
    })
    .catch(err=>{
        // console.log("errrr");
        console.log(err); 
    })
})


app.listen(4000,function(req,res){
    console.log("server 4000 started");
})
