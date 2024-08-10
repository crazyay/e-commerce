const productModel = require('../models/product');

exports.getAddProduct = (req, res) => res.render("addproduct");

exports.postAddProduct = (req, res) => {
  const product = new productModel({
    title: req.body.title,
    desc: req.body.desc,
    price: req.body.price,
    img: req.body.img
  });
  product.save().then(() => res.redirect("/product/addproduct"));
};
