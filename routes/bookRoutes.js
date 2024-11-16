const express = require('express');
const Book = require('../models/Book'); // Adjust path based on your directory structure
const User = require('../models/User'); // Adjust path based on your directory structure
const Request = require('../models/Request'); // Adjust the path based on your directory structure

const router = express.Router();

// Create a new book
router.post('/', async (req, res) => {
  try {
    const { Title, Author, Genre, PublishedYear, OwnerID } = req.body;

    const newBook = new Book({
      Title,
      Author,
      Genre,
      PublishedYear,
      OwnerID,
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET route to get all books where isAvailable is true
router.get('/available-books/', async (req, res) => {
  try {
    // Find all books where the logged-in user is the owner
    //const {id} = req.params; // Assume userId is available after authentication (via JWT or session)

    const { search = '', page = 1, limit  } = req.query;

    // Build the query object for search
    const query = {
      
      $and: [
        { IsAvailable: true }, // Filter by owner if provided
        {
          $or: [
            { Title: { $regex: search, $options: 'i' } }, // Case-insensitive search on title
            { Author: { $regex: search, $options: 'i' } }, // Case-insensitive search on author
            { Genre: { $regex: search, $options: 'i' } }, 
          ],
        },
      ],
    };

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Find books where the User is the owner
    const books = await Book.find(query).skip(skip).limit(Number(limit)).populate({
      path: 'Requests',  // Populate the requests field (child records)
      select: 'RequestedBy RequestDate Status', // Select the fields to return from the ExchangeRequest
      populate: {
        path: 'RequestedBy',  // Populate the requestedBy field (user who requested the book)
        select: 'Name Email'  // Only select Name and Email fields of the user
      }
    })
    .exec();
     // Get the total count of books matching the query
    const totalBooks = await Book.countDocuments(query);

    if (books.length === 0) {
      return res.status(404).json({ message: 'No books found for this user' });
    }

    // Fetch user details
    //const user = await User.findById(id);

    // Return the user data along with the books they own
    res.status(200).json({  books,totalBooks,totalPages: Math.ceil(totalBooks / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().populate('OwnerID', 'username email'); // Adjust fields as needed
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('OwnerID', 'username email');
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




// Get Books By Owner
router.get('/owner/:id', async (req, res) => {
  try {
    // Find all books where the logged-in user is the owner
    const {id} = req.params; // Assume userId is available after authentication (via JWT or session)

    const { search = '', page = 1, limit  } = req.query;

    // Build the query object for search
    const query = {
      $and: [
        id ? { OwnerID: id } : {}, // Filter by owner if provided
        {
          $or: [
            { Title: { $regex: search, $options: 'i' } }, // Case-insensitive search on title
            { Author: { $regex: search, $options: 'i' } }, // Case-insensitive search on author
            { Genre: { $regex: search, $options: 'i' } }, 
          ],
        },
      ],
    };

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Find books where the User is the owner
    const books = await Book.find(query).skip(skip).limit(Number(limit));
     // Get the total count of books matching the query
    const totalBooks = await Book.countDocuments(query);

    if (books.length === 0) {
      return res.status(404).json({ message: 'No books found for this user' });
    }

    // Fetch user details
    const user = await User.findById(id);

    // Return the user data along with the books they own
    res.status(200).json({ user, books,totalBooks,totalPages: Math.ceil(totalBooks / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a book's details
router.put('/:id', async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // Ensure validators run during update
    });

    if (!updatedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.status(200).json(updatedBook);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a book
router.delete('/:id', async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
