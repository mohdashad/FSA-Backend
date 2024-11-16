const express = require('express');
const mongoose = require('mongoose');
const Request = require('../models/Request'); // Adjust the path based on your directory structure
const Notification = require('../models/Notification'); // Adjust the path based on your directory structure
const Book = require('../models/Book'); // Adjust the path based on your directory structure
const Transaction = require('../models/Transaction'); // Adjust path based on your directory structure
const router = express.Router();

// Create a new request
router.post('/', async (req, res) => {
  try {
    const { RequestedBy, BookID, DeliveryMethod, Duration, NegotiatedTerms,RequestedTo } = req.body;


     // Ensure all required fields are provided
     if (!RequestedBy || !BookID || !DeliveryMethod || !Duration) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const newRequest = new Request({
      RequestedBy,
      RequestedTo,
      BookID,
      RequestDate: new Date(),
      Status: 'Pending', // Initial status
      DeliveryMethod,
      Duration,
      NegotiatedTerms,
    });



    const savedRequest = await newRequest.save();//.populate('BookID', 'OwnerID email');
    const bookDetail = await Book.findById(BookID);
    // Notify the book owner and the requester
    const notifications = [
      {
        UserID: RequestedBy,
        Message: `You have successfully requested to borrow Book ID ${BookID}.`,
        Type: 'Exchange Status Update',
        Timestamp: new Date(),
        IsRead: false,
      },
      {
        UserID: bookDetail.OwnerID, // Assuming the book model has an owner field
        Message: `User ID ${RequestedBy} has requested to borrow your book.`,
        Type: 'Exchange Status Update',
        Timestamp: new Date(),
        IsRead: false,
      },
    ];

    await Notification.insertMany(notifications);

    res.status(201).json({
      message: 'Exchange request created successfully.',
      exchangeRequest: savedRequest,
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all requests
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('RequestedBy', 'username email') // Adjust fields as needed
      .populate('BookID', 'title author'); // Adjust fields as needed
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Fetch requests related to the user
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find requests where the user is either the requester or the book owner
    const requests = await Request.find({
      $or: [
        { RequestedBy: userId },
        { RequestedTo: userId }
      ]
    }).populate('BookID', 'Title OwnerID').populate('RequestedBy', 'Name Email');

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific request by ID
router.get('/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('RequestedBy', 'username email')
      .populate('BookID', 'title author');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a request
router.put('/:id', async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body;

    if (!['Pending', 'Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      { Status: status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // If the status is 'Accepted', create a transaction
    if (status === 'Accepted') {
      const transaction = new Transaction({
        RequestID: requestId,
        OwnerID:updatedRequest.RequestedTo,
        BooKID:updatedRequest.BookID,
        Status: 'Pending',
        TransactionDate: new Date(), // Current date
      });

      await transaction.save();
    }

    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a request
router.delete('/:id', async (req, res) => {
  try {
    const deletedRequest = await Request.findByIdAndDelete(req.params.id);

    if (!deletedRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
