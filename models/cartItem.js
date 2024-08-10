const mongoose = require('mongoose');

const cartItemsSchema = new mongoose.Schema({
  userid: String,
  productid: String
});

module.exports = mongoose.model("cartitem", cartItemsSchema);
