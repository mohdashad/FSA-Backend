// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Notification = require('../models/Notification');

// Create a new user
router.post('/', async (req, res) => {
  
  const { title, message, isRead, userId } = req.body;

  try {
      // Validate and convert `userId` to ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
          return res.status(400).json({ error: 'Invalid user ID format' });
      }

      const ownerObjectId = new mongoose.Types.ObjectId(userId);

      // Create the new book document
      const noti = new Notification({
          title,
          message,
          isRead,
          owner: ownerObjectId
      });

      // Save the book to the database
      const savedNoti = await noti.save();
      res.status(201).json(savedNoti);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add the Notification' });
  }

});

// Read all users
router.get('/', async (req, res) => {
  try {

        // Destructure query parameters (with default values)
        const { isListed, isBorrowed, author,userId } = req.query;
    
        // Build the query object
        let query = {};

        if (mongoose.Types.ObjectId.isValid(userId)) {
          query.owner = new mongoose.Types.ObjectId(userId);
        }      

        const noti = await Notification.find(query);
        res.send(noti);

  } catch (err) {
    res.status(500).send(err);
  }
});





// Update a book
router.put('/:id', async (req, res) => {
  try {
    const book = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) return res.status(404).send();
    res.send(book);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Delete a book
router.delete('/:id', async (req, res) => {
  try {
    const book = await User.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).send();
    res.send(book);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
