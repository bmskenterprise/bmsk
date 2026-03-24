import {model, Schema} from 'mongoose';

export default model('Admin', new Schema({
    username: {
        type: String,
        required: [true,'username is required'],
        unique: [true,'username already exists'],
        trim: true,
        maxlength: [16,'username can not be more than 16 characters']
    },
    password: {
        type: String,
        required: [true,'password is required'],
        trim: true,
        minlength: [6,'password can be at least 6 characters']/*,
        maxlength: [16,'password can not be more than 16 characters']*/
    },
    pin: {
        type: String,
        required: [true,'pin is required'],
        minlength: [4,'pin can be at least 4 characters']/*,
        maxlength: [6,'pin can not be more than 6 characters']*/
    },
    role: {
        type: String,
        enum: ['admin','subadmin'],
        default: 'subadmin'
    },
    avatar: String,
    userLevels: [{name:String, active:Boolean}],
    deposits:[
        {
            level:String,
            topupDeposit:{commission:{bkash:Number,nagad:Number,rocket:Number},min:{type:Number,default:500},max:{type:Number,default:5000}},
            driveDeposit:{commission:{bkash:Number,nagad:Number,rocket:Number},min:{type:Number,default:500},max:{type:Number,default:5000}},
            bankDeposit:{commission:{bkash:Number,nagad:Number,rocket:Number},min:{type:Number,default:2000},max:{type:Number,default:10000}},
            regFee:{type:Number,default:0},
            selfReg:{type:Boolean,default:true},
            otp:{type:Boolean,default:true},
            permission:{type:Boolean,default:true}
        }
    ],
    /*topupDeposit: {
        min:{type: Number, default: 500},
        max:{type: Number, default: 5000},
        commission: {type: Number, default: 0},
        active: {type:Boolean,default:true}
    },
    bankDeposit: {
        min:{type: Number, default: 2000},
        max:{type: Number, default: 10000},
        commission: {type: Number, default: 0},
        active: {type:Boolean,default:true}
    },*/
    notices: [{modifiedAt:{type:Date, default:Date.now}, title:String, description:{type:String,required:true}, active:{type:Boolean,default:true}}],//     
    contacts: [{media:String, icon:String, contactNumber:String }],
    slideImages: [{link:{type:String, unique:true}, active: Boolean}],
    topupAccess: [{opt:String, active:Boolean}],
    driveAccess: [{opt:String, active:Boolean}],
    regularAccess: [{opt:String,  active:Boolean}],
    /*bankService: {
        send:{type:Boolean,  default: true},
        bill:{type:Boolean,  default: true},
    },*/
    mbanks:[{name:String, icon:String, active:Boolean, account:String}],
    telecoms: [{name:String, icon:String, active:Boolean }],
    routing: {
        airtel: {ip:String, slot:String},
        banglalink: {ip:String, slot:String},
        grameenphone: {ip:String, slot:String},
        robi: {ip:String, slot:String},
        teletalk: {ip:String, slot:String},
    },
    pgws: [{name:{type:String,unique:true,trim:true}, merchantID:String, apiKey:String, apiPassword:String, active:Boolean}],
    status:Boolean,
    device:[String],accesses:[String],topupMethod:String,bankNames:String,services:[String]//     }],
}))