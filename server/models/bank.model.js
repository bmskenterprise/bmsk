import {model, Schema} from 'mongoose';

export default model('Bank', new Schema({
    bank: {
        type: String,
        required: true
    },
    acNumber:{
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    acName: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    status:{
        type: String,
        enum:['PENDING','SUCCESS','FAILED'],
        default: 'PENDING'
    },
    feedback:String
}, {
    timestamps: true
}));