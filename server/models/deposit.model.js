import {model,Schema} from 'mongoose';

export default model('Deposit', new Schema({
    txn: {
        type: String,
        required: true
    },
    gateway:{
        type: String,
        //required: true,
        enum:['bkash','rocket','nagad']
    },
    amount: {
        type: Number,
        required: true
    },
    extra: {
        type: Number,
        default: 0
    },
    balanceType: {
        type: String,
        required: true,
        enum: ['topup', 'drive', 'bank']
    },
    user: {
        type: String,
        required: true
    },
    status: {
        type: String,
        //required: true,
        enum: ['PENDING', 'SUCCESS', 'FAILED']
    },
},{timestamps:true}));