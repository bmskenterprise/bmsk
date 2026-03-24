import {model, Schema} from 'mongoose';

export default model('APIUser', new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },apis:[{date:{type:Date,default:Date.now},domain:String,apiKey:String,apiType:String,expiry:{type:Date,default:Date.now}}],
  /*topupConnections: [{domain:String,date:Date.now}],
  driveConnections:[{domain:String,date:Date.now}],
  regularConnections:[{domain:String,date:Date.now}]*/
  lockUntil:Date,
  failedLoginAttempts:{type:Number,default:0},
}, {
  timestamps: true
}));