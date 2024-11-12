// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Book = require('../models/Book');

// Create a new user
router.post('/', async (req, res) => {
  
  const { title, author, summary, category, userId } = req.body;

  try {
      // Validate and convert `userId` to ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
          return res.status(400).json({ error: 'Invalid user ID format' });
      }

      const ownerObjectId = new mongoose.Types.ObjectId(userId);

      // Create the new book document
      const newBook = new Book({
          title,
          author,
          summary,
          category,
          owner: ownerObjectId,
          isListed: true, // Set defaults if needed
          isBorrowed: false
      });

      // Save the book to the database
      const savedBook = await newBook.save();
      res.status(201).json(savedBook);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add the book' });
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

        if (isListed !== undefined) {
            query.isListed = isListed === 'true'; // Convert 'true'/'false' string to boolean
        }

        if (isBorrowed !== undefined) {
            query.isBorrowed = isBorrowed === 'true'; // Convert 'true'/'false' string to boolean
        }

        if (author) {
            query.author = { $regex: new RegExp(author, 'i') }; // Case-insensitive search for author
        }

        const books = await Book.find(query);
        res.send(books);

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
