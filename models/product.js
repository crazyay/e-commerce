const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: String,
  desc: String,
  price: Number,
  img: String
});

module.exports = mongoose.model("product", productSchema);
