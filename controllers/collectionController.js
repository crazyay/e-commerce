const collectionModel = require('../models/collection');
const productModel = require('../models/product');

exports.getAddCollection = (req, res) => res.render("addcollection");

exports.postAddCollection = (req, res) => {
  const products = new collectionModel({
    category: req.body.category,
    title: req.body.title,
    desc: req.body.desc,
    price: req.body.price,
    img: req.body.img
  });
  products.save().then(() => res.redirect("/collection/addcollection"));
};

exports.getCollections = async (req, res) => {
  const route = req.params.url;
  console.log(route);
  
  
  try {
    const result = await collectionModel.find({ "category": { $regex: route, $options: 'i' } }).exec();
    res.render("collections", { products: result });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
};

exports.getCollectionById = async (req, res) => {
  const route = req.params.url;
  try {
    const result = await collectionModel.findOne({ title: route }).exec();
    if (result) {
    
      
      res.render("desc", { title: result.title, img: result.img, price: result.price, desc: result.desc, id: result._id });
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
};
