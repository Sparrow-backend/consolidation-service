const mongoose = require('mongoose');
require('../consolidation/consolidation.mongo');
require('../user/user.mongo');

const DeliverySchema = new mongoose.Schema({
    consolidationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Consolidation",
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["assigned", "in_progress", "completed", "cancelled"],
        default: "assigned"
    },
    startTime: Date,
    endTime: Date,
    startLocation: {
        latitude: Number,
        longitude: Number,
        address: String
    },
    endLocation: {
        latitude: Number,
        longitude: Number,
        address: String
    },
    currentLocation: {
        latitude: Number,
        longitude: Number,
        address: String,
        timestamp: Date
    },
    locationHistory: [{
        latitude: Number,
        longitude: Number,
        address: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    notes: String,
    createdTimestamp: {
        type: Date,
        default: Date.now
    },
    updatedTimestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Delivery", DeliverySchema);