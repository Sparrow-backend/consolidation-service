const express = require('express');
const {
    httpCreateReceipt,
    httpGetAllReceipts,
    httpGetReceiptById,
    httpGetReceiptByNumber,
    httpGetReceiptsByConsolidation,
    httpUpdateReceipt,
    httpUpdateReceiptCharges,
    httpDeleteReceipt,
    httpGenerateReceiptNumber
} = require('./receipt.controller');

const receiptRouter = express.Router();

// Generate a new receipt number
receiptRouter.get('/generate-number', httpGenerateReceiptNumber);

// Create a new receipt
receiptRouter.post('/', httpCreateReceipt);

// Get all receipts (with optional filters)
receiptRouter.get('/', httpGetAllReceipts);

// Get receipt by ID
receiptRouter.get('/id/:id', httpGetReceiptById);

// Get receipt by receipt number
receiptRouter.get('/number/:receiptNumber', httpGetReceiptByNumber);

// Get receipts by consolidation ID
receiptRouter.get('/consolidation/:consolidationId', httpGetReceiptsByConsolidation);

// Update receipt charges
receiptRouter.patch('/:id/charges', httpUpdateReceiptCharges);

// Update receipt
receiptRouter.put('/:id', httpUpdateReceipt);

// Delete receipt
receiptRouter.delete('/:id', httpDeleteReceipt);

module.exports = receiptRouter;