const Request = require('./request.mongo');

async function createRequest(requestData) {
    const request = new Request(requestData);
    return await request.save();
}

async function findRequestById(id) {
    return await Request.findById(id)
        .populate('customerId')
        .populate('consolidationId')
        .populate('processedBy', 'name email');
}

async function findRequestByNumber(requestNumber) {
    return await Request.findOne({ requestNumber })
        .populate('customerId')
        .populate('consolidationId')
        .populate('processedBy', 'name email');
}

async function findRequestsByCustomer(customerId) {
    return await Request.find({ customerId })
        .populate('consolidationId')
        .populate('processedBy', 'name email')
        .sort({ updatedTimestamp: -1 });
}

async function getAllRequests(filters = {}) {
    const query = {};
    
    if (filters.status) {
        query.status = filters.status;
    }
    
    if (filters.customerId) {
        query.customerId = filters.customerId;
    }
    
    if (filters.processedBy) {
        query.processedBy = filters.processedBy;
    }
    
    if (filters.consolidationId) {
        query.consolidationId = filters.consolidationId;
    }
    
    return await Request.find(query)
        .populate('customerId')
        .populate('consolidationId')
        .populate('processedBy', 'name email')
        .sort({ updatedTimestamp: -1 });
}

async function updateRequestStatus(id, status, processedBy = null, notes = '') {
    const updateData = {
        status,
        updatedTimestamp: new Date()
    };
    
    if (processedBy) {
        updateData.processedBy = processedBy;
    }
    
    if (notes) {
        updateData.notes = notes;
    }
    
    return await Request.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    );
}

async function approveRequest(id, processedBy, consolidationId = null) {
    const updateData = {
        status: 'approved',
        processedBy,
        updatedTimestamp: new Date()
    };
    
    if (consolidationId) {
        updateData.consolidationId = consolidationId;
    }
    
    return await Request.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    );
}

async function rejectRequest(id, processedBy, reason) {
    return await Request.findByIdAndUpdate(
        id,
        {
            $set: {
                status: 'rejected',
                processedBy,
                notes: reason,
                updatedTimestamp: new Date()
            }
        },
        { new: true, runValidators: true }
    );
}

async function processRequest(id, processedBy, consolidationId) {
    return await Request.findByIdAndUpdate(
        id,
        {
            $set: {
                status: 'processed',
                processedBy,
                consolidationId,
                updatedTimestamp: new Date()
            }
        },
        { new: true, runValidators: true }
    );
}

async function updateRequest(id, updateData) {
    updateData.updatedTimestamp = new Date();
    
    return await Request.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    );
}

async function deleteRequest(id) {
    return await Request.findByIdAndDelete(id);
}

async function requestExists(requestNumber) {
    const request = await Request.findOne({ requestNumber });
    return !!request;
}

async function generateRequestNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Find the last request of the day
    const startOfDay = new Date(year, date.getMonth(), date.getDate());
    const endOfDay = new Date(year, date.getMonth(), date.getDate() + 1);
    
    const lastRequest = await Request.findOne({
        updatedTimestamp: { $gte: startOfDay, $lt: endOfDay }
    }).sort({ updatedTimestamp: -1 });
    
    let sequence = 1;
    if (lastRequest && lastRequest.requestNumber) {
        const lastSequence = parseInt(lastRequest.requestNumber.slice(-4));
        sequence = lastSequence + 1;
    }
    
    return `REQ-${year}${month}${day}-${String(sequence).padStart(4, '0')}`;
}

async function getPendingRequestsCount() {
    return await Request.countDocuments({ status: 'submitted' });
}

module.exports = {
    createRequest,
    findRequestById,
    findRequestByNumber,
    findRequestsByCustomer,
    getAllRequests,
    updateRequestStatus,
    approveRequest,
    rejectRequest,
    processRequest,
    updateRequest,
    deleteRequest,
    requestExists,
    generateRequestNumber,
    getPendingRequestsCount
};