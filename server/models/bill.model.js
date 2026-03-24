import {model, Schema} from 'mongoose';

export default model('Bill', new Schema({
    billType: {
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
    expireDate: {
        type: Date,
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