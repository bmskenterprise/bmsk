import {model, Schema} from 'mongoose';

export default model('Notice', new Schema({
  recipients: [String],
  receiveMedium: [String],
  msgId:{
    type: String,
    required: true
  },
  duration:Date,
  repeat:{type:Boolean,default:false}
}, {
  timestamps: true
}));