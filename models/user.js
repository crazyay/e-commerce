const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const schema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
});

schema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user", schema);
