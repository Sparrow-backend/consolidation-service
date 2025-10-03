const {
    createReceipt,
    findReceiptById,
    findReceiptByNumber,
    findReceiptsByConsolidation,
    getAllReceipts,
    updateReceipt,
    updateReceiptCharges,
    deleteReceipt,
    receiptExists,
    generateReceiptNumber
} = require('../../models/receipt/receipt.model');

async function httpCreateReceipt(req, res) {
    try {
        let receiptData = req.body;
        
        // Validate required fields
        if (!receiptData.consolidationId) {
            return res.status(400).json({
                error: 'Consolidation ID is required'
            });
        }
        
        if (!receiptData.totalParcels) {
            return res.status(400).json({
                error: 'Total parcels is required'
            });
        }
        
        // Generate receipt number if not provided
        if (!receiptData.receiptNumber) {
            receiptData.receiptNumber = await generateReceiptNumber();
        }
        
        // Check if receipt number already exists
        const exists = await receiptExists(receiptData.receiptNumber);
        if (exists) {
            return res.status(409).json({
                error: 'Receipt with this number already exists'
            });
        }
        
        const receipt = await createReceipt(receiptData);
        
        return res.status(201).json(receipt);
    } catch (error) {
        console.error('Error creating receipt:', error);
        return res.status(500).json({
            error: 'Failed to create receipt',
            details: error.message
        });
    }
}

async function httpGetAllReceipts(req, res) {
    try {
        const filters = {
            consolidationId: req.query.consolidationId,
            issuedy: req.query.issuedy,
            startDate: req.query.startDate,
            endDate: req.query.endDate
        };
        
        const receipts = await getAllReceipts(filters);
        
        return res.status(200).json(receipts);
    } catch (error) {
        console.error('Error fetching receipts:', error);
        return res.status(500).json({
            error: 'Failed to fetch receipts',
            details: error.message
        });
    }
}

async function httpGetReceiptById(req, res) {
    try {
        const { id } = req.params;
        
        const receipt = await findReceiptById(id);
        
        if (!receipt) {
            return res.status(404).json({
                error: 'Receipt not found'
            });
        }
        
        return res.status(200).json(receipt);
    } catch (error) {
        console.error('Error fetching receipt:', error);
        return res.status(500).json({
            error: 'Failed to fetch receipt',
            details: error.message
        });
    }
}

async function httpGetReceiptByNumber(req, res) {
    try {
        const { receiptNumber } = req.params;
        
        const receipt = await findReceiptByNumber(receiptNumber);
        
        if (!receipt) {
            return res.status(404).json({
                error: 'Receipt not found'
            });
        }
        
        return res.status(200).json(receipt);
    } catch (error) {
        console.error('Error fetching receipt:', error);
        return res.status(500).json({
            error: 'Failed to fetch receipt',
            details: error.message
        });
    }
}

async function httpGetReceiptsByConsolidation(req, res) {
    try {
        const { consolidationId } = req.params;
        
        const receipts = await findReceiptsByConsolidation(consolidationId);
        
        return res.status(200).json(receipts);
    } catch (error) {
        console.error('Error fetching receipts:', error);
        return res.status(500).json({
            error: 'Failed to fetch receipts',
            details: error.message
        });
    }
}

async function httpUpdateReceipt(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Prevent updating certain fields
        delete updateData._id;
        delete updateData.receiptNumber;
        
        const receipt = await updateReceipt(id, updateData);
        
        if (!receipt) {
            return res.status(404).json({
                error: 'Receipt not found'
            });
        }
        
        return res.status(200).json(receipt);
    } catch (error) {
        console.error('Error updating receipt:', error);
        return res.status(500).json({
            error: 'Failed to update receipt',
            details: error.message
        });
    }
}

async function httpUpdateReceiptCharges(req, res) {
    try {
        const { id } = req.params;
        const charges = req.body;
        
        const receipt = await updateReceiptCharges(id, charges);
        
        if (!receipt) {
            return res.status(404).json({
                error: 'Receipt not found'
            });
        }
        
        return res.status(200).json(receipt);
    } catch (error) {
        console.error('Error updating receipt charges:', error);
        return res.status(500).json({
            error: 'Failed to update receipt charges',
            details: error.message
        });
    }
}

async function httpDeleteReceipt(req, res) {
    try {
        const { id } = req.params;
        
        const receipt = await deleteReceipt(id);
        
        if (!receipt) {
            return res.status(404).json({
                error: 'Receipt not found'
            });
        }
        
        return res.status(200).json({
            message: 'Receipt deleted successfully',
            receipt
        });
    } catch (error) {
        console.error('Error deleting receipt:', error);
        return res.status(500).json({
            error: 'Failed to delete receipt',
            details: error.message
        });
    }
}

async function httpGenerateReceiptNumber(req, res) {
    try {
        const receiptNumber = await generateReceiptNumber();
        
        return res.status(200).json({ receiptNumber });
    } catch (error) {
        console.error('Error generating receipt number:', error);
        return res.status(500).json({
            error: 'Failed to generate receipt number',
            details: error.message
        });
    }
}

module.exports = {
    httpCreateReceipt,
    httpGetAllReceipts,
    httpGetReceiptById,
    httpGetReceiptByNumber,
    httpGetReceiptsByConsolidation,
    httpUpdateReceipt,
    httpUpdateReceiptCharges,
    httpDeleteReceipt,
    httpGenerateReceiptNumber
};