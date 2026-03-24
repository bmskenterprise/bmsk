import {model, Schema} from 'mongoose';

export default model('Drive', new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    operator: {
        type: String,
        enum: ['airtel','banglalink','grameenphone','robi','teletalk'],
        required: true,
    },
    title: {
        type: String,
        required: true,
        minlength: 9,
        maxlength: 100,
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'price cannot be negative']
    },
    commission: {
        type: Number,
        //required: true,
        min: [0, 'commission cannot be negative']
    },
    active: {
        type: Boolean,
        required: true,
        //enum: ['active', 'deactive'],
        default: true,
    },
    expireDate: {
        type: Date,
        validate: {
            validator: v => v > new Date(),
            message: 'Expire date must be in the future!',
        }
    },
    sold: {
        type: Number,
        default: 0,
    }
}, {timestamps: true}))