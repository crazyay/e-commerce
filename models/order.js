const mongoose = require('mongoose');

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

module.exports = mongoose.model("order", orderSchema);
