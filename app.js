require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('./config/passport');
const session = require('express-session');
const flash = require('connect-flash');
const expressMessages = require('express-messages');

const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const searchRoutes = require('./routes/searchRoutes');
const homeRoutes =require('./routes/homeRoutes')
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware to serve static files
app.use(express.static("public"));

// Set EJS as the templating engine
app.set("view engine", "ejs");

// Parse incoming request bodies in a middleware before your handlers
app.use(bodyParser.urlencoded({ extended: true }));

// Flash messages middleware
app.use(flash());

// Session middleware
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Set global variables accessible in templates
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.messages = expressMessages(req, res);
  next();
});

// Define routes with specific base URLs
app.use('/',homeRoutes);
app.use('/auth', authRoutes); 
app.use('/cart', cartRoutes);
app.use('/collection', collectionRoutes);
app.use('/order', orderRoutes);
app.use('/product', productRoutes);
app.use('/search', searchRoutes);

// Start the server
app.listen(3000, () => console.log("Server started on port 3000"));
