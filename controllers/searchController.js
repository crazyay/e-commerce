const collectionModel = require('../models/collection');

exports.getSearch = async (req, res) => {
  try {
    const query = req.query.query;
    const regex = new RegExp(escapeRegex(query), 'gi');

    // Use Mongoose to find products that match the search query
    const searchResults = await collectionModel.find({ $or: [{ title: regex }, { desc: regex }] }).exec();

    res.render("search", { products: searchResults, query: query });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
