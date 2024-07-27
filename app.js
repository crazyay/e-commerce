
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const passportLocalMongoose = require('passport-local-mongoose');
const _ = require('lodash');

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(flash());

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DBURL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const schema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
});

const productSchema = new mongoose.Schema({
  title: String,
  desc: String,
  price: Number,
  img: String
});

const cartItemsSchema = new mongoose.Schema({
  userid: String,
  productid: String
});

const collectionSchema = new mongoose.Schema({
  category: String,
  title: String,
  desc: String,
  price: Number,
  img: String
});
const orderSchema = new mongoose.Schema({
    userid: String,
    products: [
      {
        productid: String,
        title: String,
        price: Number,
        img: String
      }
    ],
    total: Number,
    orderDate: {
      type: Date,
      default: Date.now
    }
  });
  
  
  
schema.plugin(passportLocalMongoose);
const orderModel = new mongoose.model("order", orderSchema);
const collectionModel = mongoose.model("collection", collectionSchema);
const userModel = mongoose.model("user", schema);
const productModel = mongoose.model("product", productSchema);
const cartModel = mongoose.model("cartitem", cartItemsSchema);

passport.use(userModel.createStrategy());

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
  userModel.findById(id)
    .then(user => done(null, user))
    .catch(err => done(err));
});
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

let msg = "";

app.get("/login", (req, res) => res.render("login", { msg: msg }));

app.get("/signup", (req, res) => res.render("signup", { msg: msg }));

app.get("/", (req, res) => {
  productModel.find({})
    .then(result => req.isAuthenticated() ? res.render("index", { products: result }) : res.redirect("/login"));
});

app.post("/signup", (req, res) => {
  const { password, confirmpassword, username, name } = req.body;
  if (password !== confirmpassword) {
    msg = "Passwords are not matching!";
    res.redirect("/signup");
  } else {
    userModel.register({ username, name }, password, (err, user) => {
      if (err) return res.redirect("/signup");
      passport.authenticate("local")(req, res, () => {
        msg = "";
        req.flash("info", "Congrats! You are signed in");
        res.redirect("/");
      });
    });
  }
});

app.post("/login", (req, res) => {
  const user = new userModel({ username: req.body.username, password: req.body.password });
  req.login(user, err => {
    if (err) {
      msg = "Wrong password!";
      res.redirect("/login");
    } else {
      passport.authenticate("local")(req, res, () => {
        req.flash("info", "Successfully logged in");
        res.redirect("/");
      });
    }
  });
});

app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error("Error logging out:", err);
            return res.redirect("/");
        }
        res.redirect("/");
    });
});

app.get("/orders", async (req, res) => {
    try {
      if (req.isAuthenticated()) {
        const orders = await orderModel.find({ userid: req.user.id }).exec();
        res.render("orders", { orders: orders });
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });
  app.get("/buy", async (req, res) => {
    if (req.isAuthenticated()) {
      let products;
      
      if (req.query.productId) {
        // Fetch single product details
        products = await collectionModel.findById(req.query.productId).exec();
        products = [products]; // Make it an array for consistency with the template
      } else {
        // Fetch products from the cart
        const cartItems = await cartModel.find({ userid: req.user.id }).exec();
        products = [];
        for (const item of cartItems) {
          const productDetails = await collectionModel.findById(item.productid).exec();
          products.push(productDetails);
        }
      }
  
      res.render("buy", { products: products, fromCart: !req.query.productId });
    } else {
      res.redirect("/login");
    }
  });
  
  
// app.get("/buy", async (req, res) => {
//   if (req.isAuthenticated()) {
//     const cartItems = await cartModel.find({ userid: req.user.id }).exec();
//     const item = [];
//     for (const element of cartItems) {
//       const productDetails = await collectionModel.findById(element.productid).exec();
//       item.push(productDetails);
//     }

//     res.render("buy", { carts: item });
//   } else {
//     res.redirect("/login");
//   }
// });


// app.post("/buy", async (req, res) => {
//     try {
//       if (req.isAuthenticated()) {
//         const cartItems = await cartModel.find({ userid: req.user.id }).exec();
//         let total = 0;
//         const products = [];
  
//         for (const item of cartItems) {
//           const productDetails = await collectionModel.findById(item.productid).exec();
//           products.push({
//             productid: productDetails._id,
//             title: productDetails.title,
//             price: productDetails.price,
//             img: productDetails.img
//           });
//           total += productDetails.price;
//         }
  
//         const newOrder = new orderModel({
//           userid: req.user.id,
//           products: products,
//           total: total
//         });
  
//         await newOrder.save();
//         await cartModel.deleteMany({ userid: req.user.id }).exec(); // Clear the cart after purchase
//         // res.redirect("/orders");
//         res.render("buy", { carts: products });
//       } else {
//         res.redirect("/login");
//       }
//     } catch (error) {
//       console.error(error);
//       res.status(500).send("Internal Server Error");
//     }
//   });
  

//   app.post("/process-payment", async (req, res) => {
//     try {
//       if (req.isAuthenticated()) {
//         const paymentMethod = req.body["payment-method"];
  
//         // Fetch cart items
//         const cartItems = await cartModel.find({ userid: req.user.id }).exec();
//         let total = 0;
//         const products = [];
  
//         for (const item of cartItems) {
//           const productDetails = await collectionModel.findById(item.productid).exec();
//           products.push({
//             productid: productDetails._id,
//             title: productDetails.title,
//             price: productDetails.price,
//             img: productDetails.img
//           });
//           total += productDetails.price;
//         }
  
//         // Create an order
//         const newOrder = new orderModel({
//           userid: req.user.id,
//           products: products,
//           total: total,
//           paymentMethod: paymentMethod // Store payment method
//         });
  
//         await newOrder.save();
//         // Clear the cart
//         await cartModel.deleteMany({ userid: req.user.id }).exec(); 
  
//         req.flash("info", "Payment successful using " + paymentMethod);
//         res.redirect("/orders"); // Redirect to orders page or any other page as needed
//       } else {
//         res.redirect("/login");
//       }
//     } catch (error) {
//       console.error(error);
//       req.flash("error", "Payment failed: " + error.message);
//       res.redirect("/buy"); // Redirect back to the buy page on failure
//     }
//   });
  

// app.post("/process-payment", async (req, res) => {
//     try {
//       if (req.isAuthenticated()) {
//         const paymentMethod = req.body["payment-method"];
//         const productId = req.body["product-id"];
//         const productPrice = req.body["product-price"];
//         const productTitle = req.body["product-title"];
  
//         if (productId) { // Direct purchase
//           // Fetch product details
//           const productDetails = await collectionModel.findById(productId).exec();
  
//           // Create order
//           const newOrder = new orderModel({
//             userid: req.user.id,
//             products: [{
//               productid: productDetails._id,
//               title: productDetails.title,
//               price: productDetails.price,
//               img: productDetails.img
//             }],
//             total: productPrice,
//             paymentMethod: paymentMethod
//           });
  
//           await newOrder.save();
//           req.flash("info", "Payment successful using " + paymentMethod);
  
//           res.redirect("/orders"); // Redirect to orders page
//         } else { // Buying from cart
//           const cartItems = await cartModel.find({ userid: req.user.id }).exec();
//           let total = 0;
//           const products = [];
  
//           for (const item of cartItems) {
//             const productDetails = await collectionModel.findById(item.productid).exec();
//             products.push({
//               productid: productDetails._id,
//               title: productDetails.title,
//               price: productDetails.price,
//               img: productDetails.img
//             });
//             total += productDetails.price;
//           }
  
//           // Create order
//           const newOrder = new orderModel({
//             userid: req.user.id,
//             products: products,
//             total: total,
//             paymentMethod: paymentMethod
//           });
  
//           await newOrder.save();
//           await cartModel.deleteMany({ userid: req.user.id }).exec(); // Clear the cart
  
//           req.flash("info", "Payment successful using " + paymentMethod);
//           res.redirect("/orders"); // Redirect to orders page
//         }
//       } else {
//         res.redirect("/login");
//       }
//     } catch (error) {
//       console.error(error);
//       req.flash("error", "Payment failed: " + error.message);
//       res.redirect("/buy");
//     }
//   });
  
// app.post("/process-payment", async (req, res) => {
//     try {
//       if (req.isAuthenticated()) {
//         const paymentMethod = req.body["payment-method"];
//         const productId = req.body["product-id"];
//         const productPrice = req.body["product-price"];
//         const productTitle = req.body["product-title"];
  
//         if (productId) { // Direct purchase
//           const productDetails = await collectionModel.findById(productId).exec();
  
//           // Create order
//           const newOrder = new orderModel({
//             userid: req.user.id,
//             products: [{
//               productid: productDetails._id,
//               title: productDetails.title,
//               price: productDetails.price,
//               img: productDetails.img
//             }],
//             total: productPrice,
//             paymentMethod: paymentMethod
//           });
  
//           await newOrder.save();
//           req.flash("info", "Payment successful using " + paymentMethod);
  
//           res.redirect("/orders"); // Redirect to orders page
//         } else { // Buying from cart
//           const cartItems = await cartModel.find({ userid: req.user.id }).exec();
//           let total = 0;
//           const products = [];
  
//           for (const item of cartItems) {
//             const productDetails = await collectionModel.findById(item.productid).exec();
//             products.push({
//               productid: productDetails._id,
//               title: productDetails.title,
//               price: productDetails.price,
//               img: productDetails.img
//             });
//             total += productDetails.price;
//           }
  
//           // Create order
//           const newOrder = new orderModel({
//             userid: req.user.id,
//             products: products,
//             total: total,
//             paymentMethod: paymentMethod
//           });
  
//           await newOrder.save();
//           await cartModel.deleteMany({ userid: req.user.id }).exec(); // Clear the cart
  
//           req.flash("info", "Payment successful using " + paymentMethod);
//           res.redirect("/orders"); // Redirect to orders page
//         }
//       } else {
//         res.redirect("/login");
//       }
//     } catch (error) {
//       console.error(error);
//       req.flash("error", "Payment failed: " + error.message);
//       res.redirect("/buy");
//     }
//   });
  
app.post("/process-payment", async (req, res) => {
    const paymentMethod = req.body["payment-method"];
    const productId = req.body["product-id"];
    const productTitle = req.body["product-title"];
    const productPrice = req.body["product-price"];
    const productImg = req.body["product-img"];
    try {
      if (productId) {
        // Create an order for a single product
        const newOrder = new orderModel({
          userid: req.user.id,
          products: [{
            productid: productId,
            title: productTitle,
            price: productPrice,
            img: productImg
          }],
          total: productPrice
        });
        await newOrder.save();
      } else {
        // Process for cart items
        const cartItems = await cartModel.find({ userid: req.user.id }).exec();
        let total = 0;
        const products = [];
  
        for (const item of cartItems) {
          const productDetails = await collectionModel.findById(item.productid).exec();
          products.push({
            productid: productDetails._id,
            title: productDetails.title,
            price: productDetails.price,
            img: productDetails.img
          });
          total += productDetails.price;
        }
  
        const newOrder = new orderModel({
          userid: req.user.id,
          products: products,
          total: total
        });
  
        await newOrder.save();
        await cartModel.deleteMany({ userid: req.user.id }).exec(); // Clear the cart after purchase
      }
  
      req.flash("info", "Payment successful using " + paymentMethod);
      res.redirect("/");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });
  


app.get("/cart", async (req, res) => {
  if (req.isAuthenticated()) {
    const cartItems = await cartModel.find({ userid: req.user.id }).exec();
    const item = [];
    for (const element of cartItems) {
      const productDetails = await collectionModel.findById(element.productid).exec();
      item.push(productDetails);
    }
    res.render("cart", { carts: item });
  } else {
    res.redirect("/login");
  }
});

app.post("/addtocart", (req, res) => {
  const item = req.body.button;
  const cart = new cartModel({ productid: item, userid: req.user.id });
  cart.save().then(() => res.redirect("/collections/" + path));
});

app.post("/delete", (req, res) => {
  const deleteItem = req.body.cartbutton;
  cartModel.deleteOne({ productid: deleteItem })
    .then(() => res.redirect("/cart"))
    .catch(err => console.log(err));
});

app.get("/account", (req, res) => req.isAuthenticated() ? res.render("account") : res.redirect("/login"));

app.get("/addproduct", (req, res) => res.render("addproduct"));

app.post("/addproduct", (req, res) => {
  const product = new productModel({
    title: req.body.title,
    desc: req.body.desc,
    price: req.body.price,
    img: req.body.img
  });
  product.save().then(() => res.redirect("/addproduct"));
});

app.get("/addcollection", (req, res) => res.render("addcollection"));

app.post("/addcollection", (req, res) => {
  const products = new collectionModel({
    category: req.body.category,
    title: req.body.title,
    desc: req.body.desc,
    price: req.body.price,
    img: req.body.img
  });
  products.save().then(() => res.redirect("/addcollection"));
});

app.get("/search", async (req, res) => {
  try {
    const query = req.query.query;
    const regex = new RegExp(escapeRegex(query), 'gi'); // Function to escape special characters

    // Use Mongoose to find products that match the search query
    const searchResults = await collectionModel.find({ $or: [{ title: regex }, { desc: regex }] }).exec();

    res.render("search", { products: searchResults, query: query });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

app.get("/collections/:url", (req, res) => {
  const route = req.params.url;
  path = route;
  collectionModel.find({ "category": { $regex: route, $options: 'i' } }).exec()
    .then(result => res.render("collections", { products: result }));
});

app.get("/:url", async (req, res) => {
  const route = req.params.url;
  await collectionModel.findOne({ title: route }).exec()
    .then(result => result ? res.render("desc", { title: result.title, img: result.img, price: result.price, desc: result.desc, id: result._id }) : res.redirect("/"))
    .catch(err => console.log(err));
});

app.listen(4000, () => console.log("Server started on port 4000"));

