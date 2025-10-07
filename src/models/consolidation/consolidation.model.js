const Consolidation = require('./consolidation.mongo');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Helper function to generate unique master tracking number
async function generateMasterTrackingNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Find the last consolidation of the day
    const startOfDay = new Date(year, date.getMonth(), date.getDate());
    const endOfDay = new Date(year, date.getMonth(), date.getDate() + 1);
    
    const lastConsolidation = await Consolidation.findOne({
        createdTimestamp: { $gte: startOfDay, $lt: endOfDay },
        masterTrackingNumber: { $exists: true, $ne: null }
    }).sort({ createdTimestamp: -1 });
    
    let sequence = 1;
    if (lastConsolidation && lastConsolidation.masterTrackingNumber) {
        const lastSequence = parseInt(lastConsolidation.masterTrackingNumber.slice(-4));
        if (!isNaN(lastSequence)) {
            sequence = lastSequence + 1;
        }
    }
    
    return `MTN-${year}${month}${day}-${String(sequence).padStart(4, '0')}`;
}

async function createConsolidation(consolidationData) {
    // Generate masterTrackingNumber if not provided
    if (!consolidationData.masterTrackingNumber) {
        consolidationData.masterTrackingNumber = await generateMasterTrackingNumber();
    }
    
    const consolidation = new Consolidation({
        ...consolidationData,
        statusHistory: [{
            status: consolidationData.status || 'pending',
            timestamp: new Date(),
            note: 'Consolidation created'
        }]
    });
    
    await consolidation.save();
    
    // Send notification to creator
    if (consolidationData.createdBy) {
        await sendNotification({
            userId: consolidationData.createdBy,
            type: 'consolidation_update',
            title: 'Consolidation Created',
            message: `Consolidation ${consolidation.referenceCode} (${consolidation.masterTrackingNumber}) has been created successfully`,
            entityType: 'Consolidation',
            entityId: consolidation._id,
            channels: ['in_app', 'email']
        });
    }
    
    return consolidation;
}

async function findConsolidationById(id) {
    return await Consolidation.findById(id)
        .populate('parcels')
        .populate('createdBy', 'name email')
        .populate('assignedDriver', 'userName entityId')
        .populate('warehouseId', 'name location');
}

async function findConsolidationByReferenceCode(referenceCode) {
    return await Consolidation.findOne({ referenceCode })
        .populate('parcels')
        .populate('createdBy', 'name email')
        .populate('assignedDriver', 'userName entityId')
        .populate('warehouseId', 'name location');
}

async function findConsolidationByMasterTracking(masterTrackingNumber) {
    return await Consolidation.findOne({ masterTrackingNumber })
        .populate('parcels')
        .populate('createdBy', 'name email')
        .populate('assignedDriver', 'userName entityId')
        .populate('warehouseId', 'name location');
}

async function getAllConsolidations(filters = {}) {
    const query = {};
    
    if (filters.status) {
        query.status = filters.status;
    }
    
    if (filters.warehouseId) {
        query.warehouseId = filters.warehouseId;
    }
    
    if (filters.createdBy) {
        query.createdBy = filters.createdBy;
    }
    
    if (filters.assignedDriver) {
        query.assignedDriver = filters.assignedDriver;
    }
    
    return await Consolidation.find(query)
        .populate('parcels')
        .populate('createdBy', 'name email')
        .populate('assignedDriver', 'userName entityId')
        .populate('warehouseId', 'name location')
        .sort({ createdTimestamp: -1 });
}

async function updateConsolidationStatus(id, status, note = '', location = null) {
    const consolidation = await Consolidation.findById(id).populate('createdBy assignedDriver');
    
    if (!consolidation) {
        throw new Error('Consolidation not found');
    }
    
    const oldStatus = consolidation.status;
    consolidation.status = status;
    
    const historyEntry = {
        status,
        timestamp: new Date(),
        note
    };
    
    if (location) {
        historyEntry.location = location;
    }
    
    consolidation.statusHistory.push(historyEntry);
    
    await consolidation.save();
    
    // Send notifications based on status change
    const notifications = [];
    
    // Notify creator
    if (consolidation.createdBy && oldStatus !== status) {
        notifications.push(sendNotification({
            userId: consolidation.createdBy._id,
            type: 'consolidation_update',
            title: 'Consolidation Status Updated',
            message: `Consolidation ${consolidation.referenceCode} (${consolidation.masterTrackingNumber}) status changed from ${oldStatus} to ${status}`,
            entityType: 'Consolidation',
            entityId: consolidation._id,
            channels: ['in_app', 'email']
        }));
    }
    
    // Notify driver for specific statuses
    if (consolidation.assignedDriver && ['in_transit', 'out_for_delivery'].includes(status)) {
        notifications.push(sendNotification({
            userId: consolidation.assignedDriver._id,
            type: 'consolidation_update',
            title: 'Delivery Update',
            message: `Consolidation ${consolidation.referenceCode} (${consolidation.masterTrackingNumber}) is now ${status.replace('_', ' ')}`,
            entityType: 'Consolidation',
            entityId: consolidation._id,
            channels: ['in_app', 'push']
        }));
    }
    
    await Promise.all(notifications);
    
    return consolidation;
}

async function addParcelToConsolidation(consolidationId, parcelId) {
    const consolidation = await Consolidation.findById(consolidationId);
    
    if (!consolidation) {
        throw new Error('Consolidation not found');
    }
    
    if (!consolidation.parcels.includes(parcelId)) {
        consolidation.parcels.push(parcelId);
        await consolidation.save();
    }
    
    return consolidation;
}

async function removeParcelFromConsolidation(consolidationId, parcelId) {
    const consolidation = await Consolidation.findById(consolidationId);
    
    if (!consolidation) {
        throw new Error('Consolidation not found');
    }
    
    consolidation.parcels = consolidation.parcels.filter(
        p => p.toString() !== parcelId.toString()
    );
    
    return await consolidation.save();
}

async function updateConsolidation(id, updateData) {
    return await Consolidation.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    );
}

async function deleteConsolidation(id) {
    return await Consolidation.findByIdAndDelete(id);
}

async function consolidationExists(referenceCode) {
    const consolidation = await Consolidation.findOne({ referenceCode });
    return !!consolidation;
}

async function assignDriverToConsolidation(consolidationId, driverId) {
    const consolidation = await Consolidation.findById(consolidationId).populate('createdBy');
    
    if (!consolidation) {
        throw new Error('Consolidation not found');
    }
    
    consolidation.assignedDriver = driverId;
    consolidation.status = 'assigned_to_driver';
    consolidation.statusHistory.push({
        status: 'assigned_to_driver',
        timestamp: new Date(),
        note: 'Driver assigned to consolidation'
    });
    
    await consolidation.save();
    
    // Notify driver
    await sendNotification({
        userId: driverId,
        type: 'consolidation_update',
        title: 'New Delivery Assigned',
        message: `You have been assigned consolidation ${consolidation.referenceCode} (${consolidation.masterTrackingNumber})`,
        entityType: 'Consolidation',
        entityId: consolidation._id,
        channels: ['in_app', 'push', 'email']
    });
    
    // Notify creator
    if (consolidation.createdBy) {
        await sendNotification({
            userId: consolidation.createdBy._id,
            type: 'consolidation_update',
            title: 'Driver Assigned',
            message: `Driver has been assigned to consolidation ${consolidation.referenceCode} (${consolidation.masterTrackingNumber})`,
            entityType: 'Consolidation',
            entityId: consolidation._id,
            channels: ['in_app']
        });
    }
    
    return consolidation;
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
    createConsolidation,
    findConsolidationById,
    findConsolidationByReferenceCode,
    findConsolidationByMasterTracking,
    getAllConsolidations,
    updateConsolidationStatus,
    addParcelToConsolidation,
    removeParcelFromConsolidation,
    updateConsolidation,
    deleteConsolidation,
    consolidationExists,
    assignDriverToConsolidation,
    generateMasterTrackingNumber
};