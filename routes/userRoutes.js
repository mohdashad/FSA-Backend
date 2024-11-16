const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path based on your structure
require('dotenv').config();
const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;
// Create a new user
router.post('/', async (req, res) => {
  try {
    const { Name, Email, Password, Address, ProfilePicture } = req.body;

     // Validate email and password
    if (!Email || !Password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

     // Check if the user already exists
    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(Password, 10);

    const newUser = new User({
      Name,
      Email,
      PasswordHash: passwordHash,
      Address,
      ProfilePicture,
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user's details
router.put('/:id', async (req, res) => {
  try {
    const { Name, Email, Address, ProfilePicture, IsActive } = req.body;

    // Update user information
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { Name, Email, Address, ProfilePicture, IsActive },
      { new: true, runValidators: true } // Ensure validators run during update
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User login (for authentication)
router.post('/login', async (req, res) => {
  try {
    const { Email, Password } = req.body;

    // Find the user by email
    const user = await User.findOne({ Email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(Password, user.PasswordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid Cred' });
    }

    // Create a JWT token
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Password reset request (generate reset token)
router.post('/password-reset-request', async (req, res) => {
  try {
    const { Email } = req.body;

    const user = await User.findOne({ Email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token (for simplicity, just using a random string)
    const resetToken = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });

    user.ResetToken = resetToken;
    await user.save();

    // Send reset token via email (in a real app, you'd send this to the user via email)
    res.status(200).json({ message: 'Password reset token generated', resetToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Password reset (set new password)
router.post('/password-reset', async (req, res) => {
  try {
    const { ResetToken, NewPassword } = req.body;

    // Verify the reset token
    const decoded = jwt.verify(ResetToken, jwtSecret);
    const user = await User.findById(decoded.userId);
    if (!user || user.ResetToken !== ResetToken) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(NewPassword, 10);
    user.PasswordHash = passwordHash;
    user.ResetToken = null; // Clear the reset token

    await user.save();
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Password reset (set new password)
router.post('/password-change', async (req, res) => {
  try {
    
    const { userId,oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old and new passwords are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Step 2: Compare the old password with the stored hashed password
    const isMatch = await bcrypt.compare(oldPassword, user.PasswordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    // Verify the reset token
    //const decoded = jwt.verify(ResetToken, 'your_jwt_secret');
    //const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: 'There is some error' });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.PasswordHash = passwordHash;
    await user.save();
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
