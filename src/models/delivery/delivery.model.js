const Delivery = require('./delivery.mongo');
const Consolidation = require('../consolidation/consolidation.mongo');
const fetch = require('node-fetch');

async function createDelivery(deliveryData) {
    const delivery = new Delivery(deliveryData);
    await delivery.save();
    
    // Send notification
    await sendNotification({
        userId: deliveryData.driverId,
        type: 'consolidation_update',
        title: 'New Delivery Assigned',
        message: `You have been assigned a new delivery for consolidation ${deliveryData.consolidationId}`,
        entityType: 'Consolidation',
        entityId: deliveryData.consolidationId,
        channels: ['in_app', 'push']
    });
    
    return delivery;
}

async function findDeliveryById(id) {
    return await Delivery.findById(id)
        .populate('consolidationId')
        .populate('driverId', 'userName entityId');
}

async function findDeliveriesByDriver(driverId, status = null) {
    const query = { driverId };
    if (status) {
        query.status = status;
    }
    
    return await Delivery.find(query)
        .populate('consolidationId')
        .sort({ createdTimestamp: -1 });
}

async function getActiveDeliveries() {
    return await Delivery.find({ 
        status: { $in: ['assigned', 'in_progress'] } 
    })
        .populate('consolidationId')
        .populate('driverId', 'userName entityId')
        .sort({ startTime: -1 });
}

async function startDelivery(deliveryId, locationData) {
    const delivery = await Delivery.findById(deliveryId);
    
    if (!delivery) {
        throw new Error('Delivery not found');
    }
    
    if (delivery.status === 'in_progress') {
        throw new Error('Delivery already in progress');
    }
    
    delivery.status = 'in_progress';
    delivery.startTime = new Date();
    delivery.startLocation = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.address || ''
    };
    delivery.currentLocation = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.address || '',
        timestamp: new Date()
    };
    delivery.locationHistory.push({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.address || '',
        timestamp: new Date()
    });
    delivery.updatedTimestamp = new Date();
    
    await delivery.save();
    
    // Update consolidation status
    await Consolidation.findByIdAndUpdate(delivery.consolidationId, {
        status: 'in_transit',
        'deliveryStatus.started': true,
        'deliveryStatus.startedAt': new Date(),
        'deliveryStatus.startLocation': delivery.startLocation,
        $push: {
            statusHistory: {
                status: 'in_transit',
                timestamp: new Date(),
                note: 'Delivery started',
                location: delivery.startLocation
            }
        }
    });
    
    // Send notification
    const consolidation = await Consolidation.findById(delivery.consolidationId).populate('createdBy');
    if (consolidation && consolidation.createdBy) {
        await sendNotification({
            userId: consolidation.createdBy._id,
            type: 'consolidation_update',
            title: 'Delivery Started',
            message: `Delivery for consolidation ${consolidation.referenceCode} has started`,
            entityType: 'Consolidation',
            entityId: delivery.consolidationId,
            channels: ['in_app', 'email']
        });
    }
    
    return delivery;
}

async function endDelivery(deliveryId, locationData, notes = '') {
    const delivery = await Delivery.findById(deliveryId);
    
    if (!delivery) {
        throw new Error('Delivery not found');
    }
    
    if (delivery.status !== 'in_progress') {
        throw new Error('Delivery is not in progress');
    }
    
    delivery.status = 'completed';
    delivery.endTime = new Date();
    delivery.actualDeliveryTime = new Date();
    delivery.endLocation = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.address || ''
    };
    delivery.currentLocation = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.address || '',
        timestamp: new Date()
    };
    delivery.locationHistory.push({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.address || '',
        timestamp: new Date()
    });
    delivery.notes = notes;
    delivery.updatedTimestamp = new Date();
    
    await delivery.save();
    
    // Update consolidation status
    await Consolidation.findByIdAndUpdate(delivery.consolidationId, {
        status: 'delivered',
        'deliveryStatus.ended': true,
        'deliveryStatus.endedAt': new Date(),
        'deliveryStatus.endLocation': delivery.endLocation,
        $push: {
            statusHistory: {
                status: 'delivered',
                timestamp: new Date(),
                note: notes || 'Delivery completed',
                location: delivery.endLocation
            }
        }
    });
    
    // Send notification
    const consolidation = await Consolidation.findById(delivery.consolidationId).populate('createdBy');
    if (consolidation && consolidation.createdBy) {
        await sendNotification({
            userId: consolidation.createdBy._id,
            type: 'consolidation_update',
            title: 'Delivery Completed',
            message: `Delivery for consolidation ${consolidation.referenceCode} has been completed`,
            entityType: 'Consolidation',
            entityId: delivery.consolidationId,
            channels: ['in_app', 'email', 'sms']
        });
    }
    
    return delivery;
}

async function updateDriverLocation(deliveryId, locationData) {
    const delivery = await Delivery.findById(deliveryId);
    
    if (!delivery) {
        throw new Error('Delivery not found');
    }
    
    if (delivery.status !== 'in_progress') {
        throw new Error('Delivery is not in progress');
    }
    
    delivery.currentLocation = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.address || '',
        timestamp: new Date()
    };
    delivery.locationHistory.push({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.address || '',
        timestamp: new Date()
    });
    delivery.updatedTimestamp = new Date();
    
    await delivery.save();
    
    return delivery;
}

async function assignDriverToConsolidation(consolidationId, driverId) {
    // Update consolidation
    await Consolidation.findByIdAndUpdate(consolidationId, {
        assignedDriver: driverId,
        status: 'assigned_to_driver',
        $push: {
            statusHistory: {
                status: 'assigned_to_driver',
                timestamp: new Date(),
                note: 'Driver assigned'
            }
        }
    });
    
    // Create delivery record
    const delivery = await createDelivery({
        consolidationId,
        driverId,
        status: 'assigned'
    });
    
    return delivery;
}

async function getDeliveryByConsolidation(consolidationId) {
    return await Delivery.findOne({ consolidationId })
        .populate('driverId', 'userName entityId')
        .sort({ createdTimestamp: -1 });
}

async function getAllDeliveries(filters = {}) {
    const query = {};
    
    if (filters.status) {
        query.status = filters.status;
    }
    
    if (filters.driverId) {
        query.driverId = filters.driverId;
    }
    
    return await Delivery.find(query)
        .populate('consolidationId')
        .populate('driverId', 'userName entityId')
        .sort({ createdTimestamp: -1 });
}

// Helper function to send notifications
async function sendNotification(notificationData) {
    try {
        const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'https://notification-service.vercel.app';
        
        const response = await fetch(`${NOTIFICATION_SERVICE_URL}/api/notifications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(notificationData)
        });
        
        if (!response.ok) {
            console.error('Failed to send notification:', await response.text());
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

module.exports = {
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
};