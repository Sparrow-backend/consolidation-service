const express = require('express');
const {
    httpAssignDriver,
    httpStartDelivery,
    httpEndDelivery,
    httpUpdateLocation,
    httpGetDeliveriesByDriver,
    httpGetActiveDeliveries,
    httpGetDeliveryById,
    httpGetDeliveryByConsolidation,
    httpGetAllDeliveries
} = require('./delivery.controller');

const deliveryRouter = express.Router();

// Assign driver to consolidation
deliveryRouter.post('/assign', httpAssignDriver);

// Get all deliveries (with optional filters)
deliveryRouter.get('/', httpGetAllDeliveries);

// Get active deliveries
deliveryRouter.get('/active', httpGetActiveDeliveries);

// Get delivery by ID
deliveryRouter.get('/:id', httpGetDeliveryById);

// Get deliveries by driver
deliveryRouter.get('/driver/:driverId', httpGetDeliveriesByDriver);

// Get delivery by consolidation
deliveryRouter.get('/consolidation/:consolidationId', httpGetDeliveryByConsolidation);

// Start delivery
deliveryRouter.post('/:id/start', httpStartDelivery);

// End delivery
deliveryRouter.post('/:id/end', httpEndDelivery);

// Update driver location
deliveryRouter.patch('/:id/location', httpUpdateLocation);

module.exports = deliveryRouter;