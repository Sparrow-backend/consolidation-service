
const mongoose = require('mongoose')

const RequestSchema = new mongoose.Schema({
    requestNumber: {
        type: String,
        required: true,
        unique: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parcel",
        required: true
    },
    status: {
        type: String,
        enum: ["submitted", "approved", "rejected", "processed"],
        default: "submitted"
    },
    consolidationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Consolidation"
    }, 
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    notes: String,
    updatedTimestamp: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Request", RequestSchema)