const cartModel = require('../models/cartItem');
const collectionModel = require('../models/collection');
const orderModel = require('../models/order');

exports.getOrders = async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const orders = await orderModel.find({ userid: req.user.id }).exec();
      res.render("orders", { orders: orders });
    } else {
      res.redirect("/auth/login");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.postProcessPayment = async (req, res) => {
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
};

// const collectionModel = require('../models/collection');
// const cartModel = require('../models/cart');

exports.buyProducts = async (req, res) => {
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
    res.redirect("/auth/login");
  }
};
