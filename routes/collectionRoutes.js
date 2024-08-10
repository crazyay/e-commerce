const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');

router.get("/addcollection", collectionController.getAddCollection);
router.post("/addcollection", collectionController.postAddCollection);
router.get("/collections/:url", collectionController.getCollections);
router.get("/:url", collectionController.getCollectionById);

module.exports = router;
