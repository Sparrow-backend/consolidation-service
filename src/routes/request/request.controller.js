const {
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
} = require('../../models/request/request.model');

async function httpCreateRequest(req, res) {
    try {
        let requestData = req.body;
        
        // Validate required fields
        if (!requestData.customerId) {
            return res.status(400).json({
                error: 'Customer ID is required'
            });
        }
        
        // Generate request number if not provided
        if (!requestData.requestNumber) {
            requestData.requestNumber = await generateRequestNumber();
        }
        
        // Check if request number already exists
        const exists = await requestExists(requestData.requestNumber);
        if (exists) {
            return res.status(409).json({
                error: 'Request with this number already exists'
            });
        }
        
        const request = await createRequest(requestData);
        
        return res.status(201).json(request);
    } catch (error) {
        console.error('Error creating request:', error);
        return res.status(500).json({
            error: 'Failed to create request',
            details: error.message
        });
    }
}

async function httpGetAllRequests(req, res) {
    try {
        const filters = {
            status: req.query.status,
            customerId: req.query.customerId,
            processedBy: req.query.processedBy,
            consolidationId: req.query.consolidationId
        };
        
        const requests = await getAllRequests(filters);
        
        return res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        return res.status(500).json({
            error: 'Failed to fetch requests',
            details: error.message
        });
    }
}

async function httpGetRequestById(req, res) {
    try {
        const { id } = req.params;
        
        const request = await findRequestById(id);
        
        if (!request) {
            return res.status(404).json({
                error: 'Request not found'
            });
        }
        
        return res.status(200).json(request);
    } catch (error) {
        console.error('Error fetching request:', error);
        return res.status(500).json({
            error: 'Failed to fetch request',
            details: error.message
        });
    }
}

async function httpGetRequestByNumber(req, res) {
    try {
        const { requestNumber } = req.params;
        
        const request = await findRequestByNumber(requestNumber);
        
        if (!request) {
            return res.status(404).json({
                error: 'Request not found'
            });
        }
        
        return res.status(200).json(request);
    } catch (error) {
        console.error('Error fetching request:', error);
        return res.status(500).json({
            error: 'Failed to fetch request',
            details: error.message
        });
    }
}

async function httpGetRequestsByCustomer(req, res) {
    try {
        const { customerId } = req.params;
        
        const requests = await findRequestsByCustomer(customerId);
        
        return res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        return res.status(500).json({
            error: 'Failed to fetch requests',
            details: error.message
        });
    }
}

async function httpUpdateRequestStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, processedBy, notes } = req.body;
        
        if (!status) {
            return res.status(400).json({
                error: 'Status is required'
            });
        }
        
        const request = await updateRequestStatus(id, status, processedBy, notes);
        
        if (!request) {
            return res.status(404).json({
                error: 'Request not found'
            });
        }
        
        return res.status(200).json(request);
    } catch (error) {
        console.error('Error updating request status:', error);
        return res.status(500).json({
            error: 'Failed to update request status',
            details: error.message
        });
    }
}

async function httpApproveRequest(req, res) {
    try {
        const { id } = req.params;
        const { processedBy, consolidationId } = req.body;
        
        if (!processedBy) {
            return res.status(400).json({
                error: 'Processed by user ID is required'
            });
        }
        
        const request = await approveRequest(id, processedBy, consolidationId);
        
        if (!request) {
            return res.status(404).json({
                error: 'Request not found'
            });
        }
        
        return res.status(200).json(request);
    } catch (error) {
        console.error('Error approving request:', error);
        return res.status(500).json({
            error: 'Failed to approve request',
            details: error.message
        });
    }
}

async function httpRejectRequest(req, res) {
    try {
        const { id } = req.params;
        const { processedBy, reason } = req.body;
        
        if (!processedBy) {
            return res.status(400).json({
                error: 'Processed by user ID is required'
            });
        }
        
        if (!reason) {
            return res.status(400).json({
                error: 'Rejection reason is required'
            });
        }
        
        const request = await rejectRequest(id, processedBy, reason);
        
        if (!request) {
            return res.status(404).json({
                error: 'Request not found'
            });
        }
        
        return res.status(200).json(request);
    } catch (error) {
        console.error('Error rejecting request:', error);
        return res.status(500).json({
            error: 'Failed to reject request',
            details: error.message
        });
    }
}

async function httpProcessRequest(req, res) {
    try {
        const { id } = req.params;
        const { processedBy, consolidationId } = req.body;
        
        if (!processedBy) {
            return res.status(400).json({
                error: 'Processed by user ID is required'
            });
        }
        
        if (!consolidationId) {
            return res.status(400).json({
                error: 'Consolidation ID is required'
            });
        }
        
        const request = await processRequest(id, processedBy, consolidationId);
        
        if (!request) {
            return res.status(404).json({
                error: 'Request not found'
            });
        }
        
        return res.status(200).json(request);
    } catch (error) {
        console.error('Error processing request:', error);
        return res.status(500).json({
            error: 'Failed to process request',
            details: error.message
        });
    }
}

async function httpUpdateRequest(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Prevent updating certain fields directly
        delete updateData._id;
        delete updateData.requestNumber;
        
        const request = await updateRequest(id, updateData);
        
        if (!request) {
            return res.status(404).json({
                error: 'Request not found'
            });
        }
        
        return res.status(200).json(request);
    } catch (error) {
        console.error('Error updating request:', error);
        return res.status(500).json({
            error: 'Failed to update request',
            details: error.message
        });
    }
}

async function httpDeleteRequest(req, res) {
    try {
        const { id } = req.params;
        
        const request = await deleteRequest(id);
        
        if (!request) {
            return res.status(404).json({
                error: 'Request not found'
            });
        }
        
        return res.status(200).json({
            message: 'Request deleted successfully',
            request
        });
    } catch (error) {
        console.error('Error deleting request:', error);
        return res.status(500).json({
            error: 'Failed to delete request',
            details: error.message
        });
    }
}

async function httpGenerateRequestNumber(req, res) {
    try {
        const requestNumber = await generateRequestNumber();
        
        return res.status(200).json({ requestNumber });
    } catch (error) {
        console.error('Error generating request number:', error);
        return res.status(500).json({
            error: 'Failed to generate request number',
            details: error.message
        });
    }
}

async function httpGetPendingRequestsCount(req, res) {
    try {
        const count = await getPendingRequestsCount();
        
        return res.status(200).json({ count });
    } catch (error) {
        console.error('Error fetching pending requests count:', error);
        return res.status(500).json({
            error: 'Failed to fetch pending requests count',
            details: error.message
        });
    }
}

module.exports = {
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
};