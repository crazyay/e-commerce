const express = require('express');
const router = express.Router();
const productModel = require('../models/product');

router.get("/", (req, res) => {
  productModel.find({})
    .then(result => {
      if (req.isAuthenticated()) {
        res.render("index", { products: result });
      } else {
        res.redirect("/auth/login");
      }
    })
    .catch(err => {
      console.error("Error fetching products:", err);
      res.status(500).send("Internal Server Error");
    });
});

module.exports = router;
