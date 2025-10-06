const mongoose = require('mongoose')
require('../parcel/parcel.mongo')
require('../user/user.mongo')
require('../warehouse/warehouse.mongo')

const ConsolidationSchema = new mongoose.Schema({
    masterTrackingNumber: {
        type: String,
        unique: true
    },
    referenceCode: {
        type: String,
        required: true,
        unique: true
    },
    parcels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parcel"
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assignedDriver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    warehouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Warehouse"
    },
    status: {
        type: String,
        enum: [
            "pending", 
            "consolidated", 
            "assigned_to_driver",
            "in_transit", 
            "out_for_delivery",
            "delivered", 
            "cancelled"
        ],
        default: "pending"
    },
    deliveryStatus: {
        started: {
            type: Boolean,
            default: false
        },
        startedAt: Date,
        startLocation: {
            latitude: Number,
            longitude: Number,
            address: String
        },
        ended: {
            type: Boolean,
            default: false
        },
        endedAt: Date,
        endLocation: {
            latitude: Number,
            longitude: Number,
            address: String
        }
    },
    statusHistory: [{
        status: String,
        timestamp: {
            type: Date,
            default: Date.now
        }, 
        note: String,
        location: {
            latitude: Number,
            longitude: Number,
            address: String
        }
    }],
    createdTimestamp: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Consolidation", ConsolidationSchema)