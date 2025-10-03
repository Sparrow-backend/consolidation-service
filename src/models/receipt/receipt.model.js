const Receipt = require('./receipt.mongo');

async function createReceipt(receiptData) {
    // Calculate total if not provided
    if (!receiptData.charges.total) {
        const { serviceFee = 0, handlingFee = 0, discount = 0 } = receiptData.charges;
        receiptData.charges.total = serviceFee + handlingFee - discount;
    }
    
    const receipt = new Receipt(receiptData);
    return await receipt.save();
}

async function findReceiptById(id) {
    return await Receipt.findById(id)
        .populate('consolidationId')
        .populate('issuedy', 'name email');
}

async function findReceiptByNumber(receiptNumber) {
    return await Receipt.findOne({ receiptNumber })
        .populate('consolidationId')
        .populate('issuedy', 'name email');
}

async function findReceiptsByConsolidation(consolidationId) {
    return await Receipt.find({ consolidationId })
        .populate('issuedy', 'name email')
        .sort({ issuedAt: -1 });
}

async function getAllReceipts(filters = {}) {
    const query = {};
    
    if (filters.consolidationId) {
        query.consolidationId = filters.consolidationId;
    }
    
    if (filters.issuedy) {
        query.issuedy = filters.issuedy;
    }
    
    if (filters.startDate || filters.endDate) {
        query.issuedAt = {};
        if (filters.startDate) {
            query.issuedAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
            query.issuedAt.$lte = new Date(filters.endDate);
        }
    }
    
    return await Receipt.find(query)
        .populate('consolidationId')
        .populate('issuedy', 'name email')
        .sort({ issuedAt: -1 });
}

async function updateReceipt(id, updateData) {
    // Recalculate total if charges are being updated
    if (updateData.charges) {
        const { serviceFee = 0, handlingFee = 0, discount = 0 } = updateData.charges;
        updateData.charges.total = serviceFee + handlingFee - discount;
    }
    
    updateData.updatedTimestamp = new Date();
    
    return await Receipt.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    );
}

async function updateReceiptCharges(id, charges) {
    const { serviceFee = 0, handlingFee = 0, discount = 0 } = charges;
    const total = serviceFee + handlingFee - discount;
    
    return await Receipt.findByIdAndUpdate(
        id,
        {
            $set: {
                charges: {
                    serviceFee,
                    handlingFee,
                    discount,
                    total
                },
                updatedTimestamp: new Date()
            }
        },
        { new: true, runValidators: true }
    );
}

async function deleteReceipt(id) {
    return await Receipt.findByIdAndDelete(id);
}

async function receiptExists(receiptNumber) {
    const receipt = await Receipt.findOne({ receiptNumber });
    return !!receipt;
}

async function generateReceiptNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Find the last receipt of the day
    const startOfDay = new Date(year, date.getMonth(), date.getDate());
    const endOfDay = new Date(year, date.getMonth(), date.getDate() + 1);
    
    const lastReceipt = await Receipt.findOne({
        issuedAt: { $gte: startOfDay, $lt: endOfDay }
    }).sort({ issuedAt: -1 });
    
    let sequence = 1;
    if (lastReceipt && lastReceipt.receiptNumber) {
        const lastSequence = parseInt(lastReceipt.receiptNumber.slice(-4));
        sequence = lastSequence + 1;
    }
    
    return `RCP-${year}${month}${day}-${String(sequence).padStart(4, '0')}`;
}

module.exports = {
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
};