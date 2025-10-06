const {
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
    assignDriverToConsolidation
} = require('../../models/consolidation/consolidation.model');

async function httpCreateConsolidation(req, res) {
    try {
        const consolidationData = req.body;
        
        // Validate required fields
        if (!consolidationData.referenceCode) {
            return res.status(400).json({
                error: 'Reference code is required'
            });
        }
        
        if (!consolidationData.createdBy) {
            return res.status(400).json({
                error: 'Created by user ID is required'
            });
        }
        
        // Check if reference code already exists
        const exists = await consolidationExists(consolidationData.referenceCode);
        if (exists) {
            return res.status(409).json({
                error: 'Consolidation with this reference code already exists'
            });
        }
        
        const consolidation = await createConsolidation(consolidationData);
        
        return res.status(201).json(consolidation);
    } catch (error) {
        console.error('Error creating consolidation:', error);
        return res.status(500).json({
            error: 'Failed to create consolidation',
            details: error.message
        });
    }
}

async function httpGetAllConsolidations(req, res) {
    try {
        const filters = {
            status: req.query.status,
            warehouseId: req.query.warehouseId,
            createdBy: req.query.createdBy,
            assignedDriver: req.query.assignedDriver
        };
        
        const consolidations = await getAllConsolidations(filters);
        
        return res.status(200).json(consolidations);
    } catch (error) {
        console.error('Error fetching consolidations:', error);
        return res.status(500).json({
            error: 'Failed to fetch consolidations',
            details: error.message
        });
    }
}

async function httpGetConsolidationById(req, res) {
    try {
        const { id } = req.params;
        
        const consolidation = await findConsolidationById(id);
        
        if (!consolidation) {
            return res.status(404).json({
                error: 'Consolidation not found'
            });
        }
        
        return res.status(200).json(consolidation);
    } catch (error) {
        console.error('Error fetching consolidation:', error);
        return res.status(500).json({
            error: 'Failed to fetch consolidation',
            details: error.message
        });
    }
}

async function httpGetConsolidationByReference(req, res) {
    try {
        const { referenceCode } = req.params;
        
        const consolidation = await findConsolidationByReferenceCode(referenceCode);
        
        if (!consolidation) {
            return res.status(404).json({
                error: 'Consolidation not found'
            });
        }
        
        return res.status(200).json(consolidation);
    } catch (error) {
        console.error('Error fetching consolidation:', error);
        return res.status(500).json({
            error: 'Failed to fetch consolidation',
            details: error.message
        });
    }
}

async function httpGetConsolidationByTracking(req, res) {
    try {
        const { masterTrackingNumber } = req.params;
        
        const consolidation = await findConsolidationByMasterTracking(masterTrackingNumber);
        
        if (!consolidation) {
            return res.status(404).json({
                error: 'Consolidation not found'
            });
        }
        
        return res.status(200).json(consolidation);
    } catch (error) {
        console.error('Error fetching consolidation:', error);
        return res.status(500).json({
            error: 'Failed to fetch consolidation',
            details: error.message
        });
    }
}

async function httpUpdateConsolidationStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, note, location } = req.body;
        
        if (!status) {
            return res.status(400).json({
                error: 'Status is required'
            });
        }
        
        const consolidation = await updateConsolidationStatus(id, status, note, location);
        
        return res.status(200).json(consolidation);
    } catch (error) {
        console.error('Error updating consolidation status:', error);
        return res.status(500).json({
            error: 'Failed to update consolidation status',
            details: error.message
        });
    }
}

async function httpAssignDriverToConsolidation(req, res) {
    try {
        const { id } = req.params;
        const { driverId } = req.body;
        
        if (!driverId) {
            return res.status(400).json({
                error: 'Driver ID is required'
            });
        }
        
        const consolidation = await assignDriverToConsolidation(id, driverId);
        
        return res.status(200).json({
            success: true,
            message: 'Driver assigned successfully',
            data: consolidation
        });
    } catch (error) {
        console.error('Error assigning driver to consolidation:', error);
        return res.status(500).json({
            error: 'Failed to assign driver',
            details: error.message
        });
    }
}

async function httpAddParcelToConsolidation(req, res) {
    try {
        const { id } = req.params;
        const { parcelId } = req.body;
        
        if (!parcelId) {
            return res.status(400).json({
                error: 'Parcel ID is required'
            });
        }
        
        const consolidation = await addParcelToConsolidation(id, parcelId);
        
        return res.status(200).json(consolidation);
    } catch (error) {
        console.error('Error adding parcel to consolidation:', error);
        return res.status(500).json({
            error: 'Failed to add parcel to consolidation',
            details: error.message
        });
    }
}

async function httpRemoveParcelFromConsolidation(req, res) {
    try {
        const { id, parcelId } = req.params;
        
        const consolidation = await removeParcelFromConsolidation(id, parcelId);
        
        return res.status(200).json(consolidation);
    } catch (error) {
        console.error('Error removing parcel from consolidation:', error);
        return res.status(500).json({
            error: 'Failed to remove parcel from consolidation',
            details: error.message
        });
    }
}

async function httpUpdateConsolidation(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Prevent updating certain fields directly
        delete updateData._id;
        delete updateData.statusHistory;
        
        const consolidation = await updateConsolidation(id, updateData);
        
        if (!consolidation) {
            return res.status(404).json({
                error: 'Consolidation not found'
            });
        }
        
        return res.status(200).json(consolidation);
    } catch (error) {
        console.error('Error updating consolidation:', error);
        return res.status(500).json({
            error: 'Failed to update consolidation',
            details: error.message
        });
    }
}

async function httpDeleteConsolidation(req, res) {
    try {
        const { id } = req.params;
        
        const consolidation = await deleteConsolidation(id);
        
        if (!consolidation) {
            return res.status(404).json({
                error: 'Consolidation not found'
            });
        }
        
        return res.status(200).json({
            message: 'Consolidation deleted successfully',
            consolidation
        });
    } catch (error) {
        console.error('Error deleting consolidation:', error);
        return res.status(500).json({
            error: 'Failed to delete consolidation',
            details: error.message
        });
    }
}

module.exports = {
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
};