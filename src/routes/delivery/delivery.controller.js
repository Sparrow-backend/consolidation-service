const {
    createDelivery,
    findDeliveryById,
    findDeliveriesByDriver,
    getActiveDeliveries,
    startDelivery,
    endDelivery,
    updateDriverLocation,
    assignDriverToConsolidation,
    getDeliveryByConsolidation,
    getAllDeliveries
} = require('../../models/delivery/delivery.model');

async function httpAssignDriver(req, res) {
    try {
        const { consolidationId, driverId } = req.body;
        
        if (!consolidationId || !driverId) {
            return res.status(400).json({
                error: 'Consolidation ID and Driver ID are required'
            });
        }
        
        const delivery = await assignDriverToConsolidation(consolidationId, driverId);
        
        return res.status(201).json({
            success: true,
            message: 'Driver assigned successfully',
            data: delivery
        });
    } catch (error) {
        console.error('Error assigning driver:', error);
        return res.status(500).json({
            error: 'Failed to assign driver',
            details: error.message
        });
    }
}

async function httpStartDelivery(req, res) {
    try {
        const { id } = req.params;
        const { latitude, longitude, address } = req.body;
        
        if (!latitude || !longitude) {
            return res.status(400).json({
                error: 'Location coordinates are required'
            });
        }
        
        const delivery = await startDelivery(id, { latitude, longitude, address });
        
        return res.status(200).json({
            success: true,
            message: 'Delivery started successfully',
            data: delivery
        });
    } catch (error) {
        console.error('Error starting delivery:', error);
        return res.status(500).json({
            error: 'Failed to start delivery',
            details: error.message
        });
    }
}

async function httpEndDelivery(req, res) {
    try {
        const { id } = req.params;
        const { latitude, longitude, address, notes } = req.body;
        
        if (!latitude || !longitude) {
            return res.status(400).json({
                error: 'Location coordinates are required'
            });
        }
        
        const delivery = await endDelivery(id, { latitude, longitude, address }, notes);
        
        return res.status(200).json({
            success: true,
            message: 'Delivery completed successfully',
            data: delivery
        });
    } catch (error) {
        console.error('Error ending delivery:', error);
        return res.status(500).json({
            error: 'Failed to end delivery',
            details: error.message
        });
    }
}

async function httpUpdateLocation(req, res) {
    try {
        const { id } = req.params;
        const { latitude, longitude, address } = req.body;
        
        if (!latitude || !longitude) {
            return res.status(400).json({
                error: 'Location coordinates are required'
            });
        }
        
        const delivery = await updateDriverLocation(id, { latitude, longitude, address });
        
        return res.status(200).json({
            success: true,
            message: 'Location updated successfully',
            data: delivery
        });
    } catch (error) {
        console.error('Error updating location:', error);
        return res.status(500).json({
            error: 'Failed to update location',
            details: error.message
        });
    }
}

async function httpGetDeliveriesByDriver(req, res) {
    try {
        const { driverId } = req.params;
        const { status } = req.query;
        
        const deliveries = await findDeliveriesByDriver(driverId, status);
        
        return res.status(200).json({
            success: true,
            count: deliveries.length,
            data: deliveries
        });
    } catch (error) {
        console.error('Error fetching driver deliveries:', error);
        return res.status(500).json({
            error: 'Failed to fetch deliveries',
            details: error.message
        });
    }
}

async function httpGetActiveDeliveries(req, res) {
    try {
        const deliveries = await getActiveDeliveries();
        
        return res.status(200).json({
            success: true,
            count: deliveries.length,
            data: deliveries
        });
    } catch (error) {
        console.error('Error fetching active deliveries:', error);
        return res.status(500).json({
            error: 'Failed to fetch active deliveries',
            details: error.message
        });
    }
}

async function httpGetDeliveryById(req, res) {
    try {
        const { id } = req.params;
        
        const delivery = await findDeliveryById(id);
        
        if (!delivery) {
            return res.status(404).json({
                error: 'Delivery not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: delivery
        });
    } catch (error) {
        console.error('Error fetching delivery:', error);
        return res.status(500).json({
            error: 'Failed to fetch delivery',
            details: error.message
        });
    }
}

async function httpGetDeliveryByConsolidation(req, res) {
    try {
        const { consolidationId } = req.params;
        
        const delivery = await getDeliveryByConsolidation(consolidationId);
        
        if (!delivery) {
            return res.status(404).json({
                error: 'Delivery not found for this consolidation'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: delivery
        });
    } catch (error) {
        console.error('Error fetching delivery:', error);
        return res.status(500).json({
            error: 'Failed to fetch delivery',
            details: error.message
        });
    }
}

async function httpGetAllDeliveries(req, res) {
    try {
        const filters = {
            status: req.query.status,
            driverId: req.query.driverId
        };
        
        const deliveries = await getAllDeliveries(filters);
        
        return res.status(200).json({
            success: true,
            count: deliveries.length,
            data: deliveries
        });
    } catch (error) {
        console.error('Error fetching deliveries:', error);
        return res.status(500).json({
            error: 'Failed to fetch deliveries',
            details: error.message
        });
    }
}

module.exports = {
    httpAssignDriver,
    httpStartDelivery,
    httpEndDelivery,
    httpUpdateLocation,
    httpGetDeliveriesByDriver,
    httpGetActiveDeliveries,
    httpGetDeliveryById,
    httpGetDeliveryByConsolidation,
    httpGetAllDeliveries
};