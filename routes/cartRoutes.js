const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get("/", cartController.getCart);
router.post("/addtocart", cartController.postAddToCart);
router.post("/delete", cartController.postDeleteFromCart);

module.exports = router;
