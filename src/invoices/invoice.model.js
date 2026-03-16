import { Schema, model } from 'mongoose'

const invoiceSchema = new Schema({
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

export default model('Invoice', invoiceSchema)