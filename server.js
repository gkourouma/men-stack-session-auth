//Dependecies
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();

const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const session = require("express-session");

// Set the port from environment variable or default to 3000
const port = process.env.PORT || "3000";

const authController = require("./controllers/auth.js");
const fruitsController = require("./controllers/fruits.js");

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }));
// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride("_method"));
// Morgan for logging HTTP requests
app.use(morgan("dev"));
// new session middle ware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, //if you set it to true you are creating space that might not even be used
  })
);

//anything that uses session comes after the session middleware
app.use((req, res, next) => {
  if (req.session.message) {
    res.locals.message = req.session.message; //res.locals makes info available to templates. res is the response object and is part of our communication to the client
    req.session.message = null; //clears out req.session.message
  }
  next(); //next calls the next middlware function or route handler
});

app.use("/auth", authController);
app.use("/fruits", fruitsController);

app.get("/", (req, res) => {
  res.render("index.ejs", {
    user: req.session.user,
  });
});

app.get("/vip-lounge", (req, res) => {
  if (req.session.user) {
    res.send(`Welcome to the party ${req.session.user.username}.`);
  } else {
    res.send("Sorry, no guests allowed.");
  }
});

//catch all route should always be listed last
app.get("*", (req, res) => {
  res.status(404).render("error.ejs", { msg: "Page not found!" });
});

// server.js
const handleServerError = (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Warning! Port ${port} is already in use!`);
  } else {
    console.log('Error:', error);
  }
}

//custom error function
app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
}).on('error', handleServerError);
