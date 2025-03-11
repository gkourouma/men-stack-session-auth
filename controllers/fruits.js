// controllers/fruits.js
const express = require("express");
const router = express.Router();

const Fruit = require("../models/fruit.js");

router.get("/new", (req, res) => {
  res.render("fruits/new.ejs");
});

router.post("/", async (req, res) => {
  try {
    if(!req.body.name.trim()) {
      throw new Error('Invalid Input: The name field cannot be blank')
    }
    await Fruit.create(req.body);
    req.session.message = 'Fruits created successfully!'
    res.redirect("/fruits");
  } catch (error) {
    console.log(error.message);
    req.session.message = error.message;
    res.redirect('/fruits');
  }
});

router.get("/", async (req, res) => {
  const foundFruits = await Fruit.find();
  res.render("fruits/index.ejs", { fruits: foundFruits });
});

module.exports = router;
