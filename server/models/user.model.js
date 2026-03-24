import {model, Schema} from 'mongoose';

export default model('User', new Schema({
    level: {
        type: String,
        enum: ['distributor', 'sr', 'retailer', 'platinum', 'gold', 'silver'],
        required: true
    },
    username:{
        type: String,
        required: true,
        /*min: 11,
        max: 13*/
    },
    fullname: {
        type: String,
        //minlength
    },
    password: {
        type: String,
        required: true,
        /*minlength: 8,
        maxlength: 16*/
    },
    pin: {
        type: String,
        required: true,
        /*minlength: 4,
        maxlength: 6*/
    },
    nid: {
        type: Number,
        required: true,
    },
    balance:{
        topup:{
            type: Number,
            default: 0
        },
        drive:{
            type:Number,
            default:0
        },
        bank:{
            type: Number,
            default: 0
        }
    },
    status:{
        type:String,
        enum:['ACTIVE','INACTIVE'],
        default: 'INACTIVE'
    },
    accesses:[String],
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    },
    lastActiveAt: Date
},{timestamps: true}
))