import {model, Schema} from 'mongoose';

export default model('Feedback', new Schema({
    description: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    }
}, {
    timestamps: true
}));