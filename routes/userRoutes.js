// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;

// Create a new user
router.post('/', async (req, res) => {
  const { name, email, password, city, state, street, postalCode } = req.body;
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
    }
    /*
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    */
    // Create a new user
    const newUser = new User({
        name,
        email,
        password: password,
        city,
        state,
        street,
        postalCode
    });

    // Save the user to the database
    const savedUser = await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: savedUser });
} catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'An error occurred during registration' });
}
});

// Read all users
router.get('/', async (req, res) => {

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id).select('-password'); // exclude password field
    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }

  /*
  try {
    const users = await User.find();
    res.send(users);
  } catch (err) {
    res.status(500).send(err);
  }
    */
});

// Update a user
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).send();
    res.send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send();
    res.send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
