import {model, Schema} from 'mongoose';

export default model('Topup', new Schema({
    txn:String,
    recipient: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    operator:{
        type: String,
        required: true,
        enum:['airtel','banglalink','grameenphone','robi','teletalk']
    },
    user:{
        type: String,
        required: true,
    },status:{
        type: String,
        enum:['SUCCESS','FAILED']
    }
}, {
    timestamps: true
}));