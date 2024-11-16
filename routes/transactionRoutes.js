const express = require('express');
const Transaction = require('../models/Transaction'); // Adjust path based on your directory structure

const router = express.Router();

// Create a new transaction
router.post('/', async (req, res) => {
  try {
    const { ExchangeRequestID, Status, BookReturnedDate } = req.body;

    const newTransaction = new Transaction({
      ExchangeRequestID,
      Status,
      BookReturnedDate,
    });

    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('RequestID', 'RequestID RequestedBy BookID');
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get transaction by ExchangeRequestID
router.get('/request/:exchangeRequestId', async (req, res) => {
  try {
    const { exchangeRequestId } = req.params;

    // Find the transaction linked to the ExchangeRequestID
    const transaction = await Transaction.findOne({ RequestID: exchangeRequestId });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('ExchangeRequestID', 'RequestID RequestedBy BookID');
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a transaction's details
router.put('/:id', async (req, res) => {
  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Ensure validators run during update
    );

    if (!updatedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(200).json(updatedTransaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a transaction
router.delete('/:id', async (req, res) => {
  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!deletedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
