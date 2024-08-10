const cartModel = require('../models/cartItem');
const collectionModel = require('../models/collection');

exports.getCart = async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const cartItems = await cartModel.find({ userid: req.user.id }).exec();
      const items = await Promise.all(cartItems.map(async (item) => {
        return collectionModel.findById(item.productid).exec();
      }));
      res.render("cart", { carts: items });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.redirect("/auth/login");
  }
};
const path=require("./collectionController").path;
console.log(path);

exports.postAddToCart = (req, res) => {

  const item = req.body.button;
  if (!req.user) {
    // If user is not authenticated, redirect to login
    return res.redirect('/auth/login');
  }

  const cart = new cartModel({ productid: item, userid: req.user.id });
  cart.save().then(() => res.redirect("/cart"));
};

exports.postDeleteFromCart = (req, res) => {
  const deleteItem = req.body.cartbutton;
  cartModel.deleteOne({ productid: deleteItem })
    .then(() => res.redirect("/cart"))
    .catch(err => console.log(err));
};
 