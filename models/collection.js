const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  category: String,
  title: String,
  desc: String,
  price: Number,
  img: String
});

module.exports = mongoose.model("collection", collectionSchema);
