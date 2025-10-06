const express = require('express');
const {
    httpCreateConsolidation,
    httpGetAllConsolidations,
    httpGetConsolidationById,
    httpGetConsolidationByReference,
    httpGetConsolidationByTracking,
    httpUpdateConsolidationStatus,
    httpAssignDriverToConsolidation,
    httpAddParcelToConsolidation,
    httpRemoveParcelFromConsolidation,
    httpUpdateConsolidation,
    httpDeleteConsolidation
} = require('./consolidation.controller');

const consolidationRouter = express.Router();

// Create a new consolidation
consolidationRouter.post('/', httpCreateConsolidation);

// Get all consolidations (with optional filters)
consolidationRouter.get('/', httpGetAllConsolidations);

// Get consolidation by ID
consolidationRouter.get('/id/:id', httpGetConsolidationById);

// Get consolidation by reference code
consolidationRouter.get('/reference/:referenceCode', httpGetConsolidationByReference);

// Get consolidation by master tracking number
consolidationRouter.get('/tracking/:masterTrackingNumber', httpGetConsolidationByTracking);

// Update consolidation status
consolidationRouter.patch('/:id/status', httpUpdateConsolidationStatus);

// Assign driver to consolidation
consolidationRouter.patch('/:id/assign-driver', httpAssignDriverToConsolidation);

// Add parcel to consolidation
consolidationRouter.post('/:id/parcels', httpAddParcelToConsolidation);

// Remove parcel from consolidation
consolidationRouter.delete('/:id/parcels/:parcelId', httpRemoveParcelFromConsolidation);

// Update consolidation
consolidationRouter.put('/:id', httpUpdateConsolidation);

// Delete consolidation
consolidationRouter.delete('/:id', httpDeleteConsolidation);

module.exports = consolidationRouter;