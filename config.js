const mongoose = require('mongoose');
console.log(process.env.DBURL);

mongoose.connect(process.env.DBURL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));
