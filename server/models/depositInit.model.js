import {model, Schema} from 'mongoose';

export default model('DepositInit', new Schema({
  txn:{
    type: String,
    required: true
  },
  gateway:{
    type: String,
    required: true,
    enum:['bkash','rocket','nagad']
  },
  status:{
    type: String,
    enum:['PENDING','SUCCESS'],
    default:'PENDING'
  },
  amount:{
    type: Number,
    required: true
  },
  user:{
    type:String,
    required: true
  },
  message:{
    type: String,
    required: true
  }
}, {
  timestamps: true
}));