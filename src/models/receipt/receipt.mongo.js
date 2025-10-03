
const mongoose = require('mongoose')

const ReceiptSchema = new mongoose.Schema({
    receiptNumber: {
        type: String,
        required: true,
        unique: true
    },
    consolidationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Consolidation",
        required: true
    },
    totalParcels: {
        type: Number,
        required: true
    },
    totalWeight: {
        type: Number
    },
    charges: {
        serviceFee: {
            type: Number,
            default: 0
        },
        handlingFee: {
            type: Number,
            default: 0
        },
        discount: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            required: true
        }
    },
    issuedAt: {
        type: Date,
        default: Date.now
    },
    issuedy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    updatedTimestamp: {
        type: Date,
        default: Date.now
    }
})

module.exports=mongoose.model("Receipt", ReceiptSchema)