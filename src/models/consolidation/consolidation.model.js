const Consolidation = require('./consolidation.mongo');

async function createConsolidation(consolidationData) {
    const consolidation = new Consolidation({
        ...consolidationData,
        statusHistory: [{
            status: consolidationData.status || 'pending',
            timestamp: new Date(),
            note: 'Consolidation created'
        }]
    });
    
    return await consolidation.save();
}

async function findConsolidationById(id) {
    return await Consolidation.findById(id)
        .populate('parcels')
        .populate('createdBy', 'name email')
        .populate('warehouseId', 'name location');
}

async function findConsolidationByReferenceCode(referenceCode) {
    return await Consolidation.findOne({ referenceCode })
        .populate('parcels')
        .populate('createdBy', 'name email')
        .populate('warehouseId', 'name location');
}

async function findConsolidationByMasterTracking(masterTrackingNumber) {
    return await Consolidation.findOne({ masterTrackingNumber })
        .populate('parcels')
        .populate('createdBy', 'name email')
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
    
    return await Consolidation.find(query)
        .populate('parcels')
        .populate('createdBy', 'name email')
        .populate('warehouseId', 'name location')
        .sort({ createdAt: -1 });
}

async function updateConsolidationStatus(id, status, note = '') {
    const consolidation = await Consolidation.findById(id);
    
    if (!consolidation) {
        throw new Error('Consolidation not found');
    }
    
    consolidation.status = status;
    consolidation.statusHistory.push({
        status,
        timestamp: new Date(),
        note
    });
    
    return await consolidation.save();
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
    consolidationExists
};