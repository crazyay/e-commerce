const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get("/orders", orderController.getOrders);
router.post("/process-payment", orderController.postProcessPayment);
router.get("/buy",orderController.buyProducts);
module.exports = router;
