const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get("/addproduct", productController.getAddProduct);
router.post("/addproduct", productController.postAddProduct);

module.exports = router;
