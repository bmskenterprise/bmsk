import {model, Schema} from 'mongoose';

export default model('APIRequest', new Schema({
  user:{
    type:String,
    required:true
  },
  domain:{
    type:String,
    required:true
  },
  apiType:{
    type:String,
    required:true
  },
  status:{
    type:String,
    enum:['PENDING','ALLOWED','DENIED'],
    default:'PENDING'
  }
},
{timestamps: true}
));