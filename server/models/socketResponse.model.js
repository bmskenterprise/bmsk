import {model, Schema, Types} from 'mongoose';

export default model('SocketResponse', new Schema({
    socketId: String,
    user: {type:String,required:true},
    level: {type:String,required:true},
    optChanged: {type:Boolean,default:false},
    topupOptChanged: {type:Boolean,default:false},
    driveOptChanged: {type:Boolean,default:false},
    //regularOptChanged: {type:Boolean,default:false},
    failed: {
        deposit:Number,
        topup:Number,
        drive:Number,
        regular:Number,
        bill:Number,
        bank:Number,
    },
    notices:[{type:Schema.Types.ObjectId,ref:'Notice'}],
}, {
    timestamps: true
}));