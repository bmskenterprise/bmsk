import {model,Schema} from 'mongoose';

export default model('DriveHit', new Schema({
    drive:{
        id: {
            type: Schema.Types.ObjectId,
            ref: 'Drive',
            //required: true
        },
        operator:{
            type:String,
            enum:['airtel','banglalink','grameenphone','robi','teletalk'],
            required:true
        },
        title:{
            type:String,
            required:true
        },
        price:{
            type:Number,
            required:true
        },
        commission:Number
    },
    recipient:{
        type: Number,
        required: true,
        min: 11,
        max: 13,
        //opt: String
    },
    user: {
        type: String/*Schema.Types.ObjectId*/,
        //ref: 'User',
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['PENDING', 'SUCCESS', 'FAILED'],
        default: 'PENDING'
    },
    feedback: String
},{timestamps: true}))