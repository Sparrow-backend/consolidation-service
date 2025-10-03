const express = require('express');
const {
    httpCreateRequest,
    httpGetAllRequests,
    httpGetRequestById,
    httpGetRequestByNumber,
    httpGetRequestsByCustomer,
    httpUpdateRequestStatus,
    httpApproveRequest,
    httpRejectRequest,
    httpProcessRequest,
    httpUpdateRequest,
    httpDeleteRequest,
    httpGenerateRequestNumber,
    httpGetPendingRequestsCount
} = require('./request.controller');

const requestRouter = express.Router();

// Generate a new request number
requestRouter.get('/generate-number', httpGenerateRequestNumber);

// Get pending requests count
requestRouter.get('/pending-count', httpGetPendingRequestsCount);

// Create a new request
requestRouter.post('/', httpCreateRequest);

// Get all requests (with optional filters)
requestRouter.get('/', httpGetAllRequests);

// Get request by ID
requestRouter.get('/id/:id', httpGetRequestById);

// Get request by request number
requestRouter.get('/number/:requestNumber', httpGetRequestByNumber);

// Get requests by customer ID
requestRouter.get('/customer/:customerId', httpGetRequestsByCustomer);

// Update request status
requestRouter.patch('/:id/status', httpUpdateRequestStatus);

// Approve request
requestRouter.post('/:id/approve', httpApproveRequest);

// Reject request
requestRouter.post('/:id/reject', httpRejectRequest);

// Process request
requestRouter.post('/:id/process', httpProcessRequest);

// Update request
requestRouter.put('/:id', httpUpdateRequest);

// Delete request
requestRouter.delete('/:id', httpDeleteRequest);

module.exports = requestRouter;