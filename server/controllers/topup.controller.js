import axios from 'axios'//https://chatgpt.com/c/689f2ca5-5cf4-8326-8485-3cdbd5223fe7
import connectDB from '../config/db.js';
import {ObjectId} from 'mongodb';
//import User from '../models/user.model.js';
import socket from '../config/socket.js';
import {v4 as uuidv4} from 'uuid';
let routings = null;
let lastFetchedTime = 0;
const CACHE_TTL_MS = 24*1000*60*60
let io = socket.getIO()
const devices= new Map();
let Admin,User,Topup,SocketResponse;
(async () =>{
    try{
        let db = await connectDB()
        Admin = db.collection('admins')
        User = db.collection('users')
        Topup = db.collection('topups')
        SocketResponse = db.collection('socketresponses')
    }catch(e) {console.error('topup db failed');}
})()
const emitToDevice = (deviceId,event,payload) =>{
    let sid = devices.get(deviceId)
    if(!sid) return {ok:false, error:'device offline'}
    io.to(sid).emit(event, payload)
    return {ok:true}
}
//call by user
export const getTopupOpts =async (req, res,next) => {
  try {
    let admin = await Admin.findOne({role:'admin'});
    if(!admin) throw new Error('server issue');
    res.status(200).json(admin.topupAccess)
  }catch(err) {next(err)}
}
export const changeTopupMethod= async (req,res,next) =>{
    try{
        await Admin.findOneAndUpdate({role:'admin'},{$set:{topupMethod:req.params.method}})
        res.status(200).json({message:'topup method changed'})
    }catch(err){next(err)}
}
export const topup = async (req, res) => {
    const {operator,recipient,amount} = req.body
    let admin
    if(!operator||!recipient||!amount) return res.status(400).json({ error:"Missing operator, number, or amount", success:false });
    const now = Date.now()
    if(!routings|| (now - lastFetchedTime > CACHE_TTL_MS)) {
      try {
          admin = await Admin.findOne({role:'admin'});
          routings =admin.routing;
          lastFetchedTime = now;
      }catch(err) {return res.status(500).json({ error: "MongoDB fetch error"+err,});}
    }
    const opKey = operator.toLowerCase();
    const map = routings[opKey];
    if(!map) return res.status(400).json({error:`Operator '${operator}' not supported`, success:false });

  const ussds = {
    airtel: `*123*${recipient}*${amount}#`,
    banglalink: `*5000*1*1*${recipient}*${amount}#`,
    grameenphone: `555*${recipient}*${amount}#`,
    robi: `*123*${recipient}*${amount}#`,
    teletalk: `*727*${recipient}*${amount}#`
  };
  const url = `http://${map.ip}:8080/ussd/send?ussd=${encodeURIComponent(ussds[opKey])}&sim=${map.slot}&token=ksmb@25112025`;

  try{
    let user=await User.findOne({_id:new ObjectId(req.user.id)});
    if(user.balance.topup<amount) return res.status(400).json({error:"Insufficient balance"})
    if(admin.topupMethod=='retail'){
      /*const response = await fetch(url);
      if(!response.ok) return res.status(500).json({ error:"Failed to forward USSD request", success:false });
      let d=await response.json();*/
      await Topup.insertOne({recipient,operator,amount,user:req.user.username,status:'SUCCESS'});//console.log(`d.data ${d.data}`);
      await User.findOneAndUpdate({_id:new ObjectId(req.user.id)},{$inc:{[`balance.topup`]:amount*(-1)}})
      return res.status(201).json({message:'topup success',success:true,operator,sim:map.slot,device:map.ip/*,gateway_response:d.data*/});
    }else if(admin.topupMethod=='manual'){
        await Topup.insertOne({recipient,operator,amount,user:req.user.username,status:'PENDING'});
        await User.findOneAndUpdate({_id:new ObjectId(req.user.id)},{$inc:{[`balance.topup`]:amount*(-1)}})
        return res.status(201).json({message:'topup request sent'}); 
    }else if(admin.topupMethod=='mbank'){
      const id = uuidv4()
      const {deviceId,operator,recipient,amount} = req.body;
      const r = emitToDevice(deviceId,'topup',{id,operator,recipient,amount})
      if(!r.ok) return res.status(400).json({error:r.error})
      await Topup.insertOne({recipient,operator,amount,user:req.user.username,status:'SUCCESS'});
      await User.findOneAndUpdate({_id:new ObjectId(req.user.id)},{$inc:{[`balance.topup`]:amount*(-1)}})
      return res.status(201).json({message:'topup request sent',id})
    }
  }catch(err) {
    return res.status(500).json({
      error: "Failed to forward USSD request",
      details: err.message
    });
  }
};

export const changeTopupStatus = async (req,res,next)=>{
    const {status,username,feedback} = req.body;
    try{
        const socketRes = await SocketResponse.findOne({user:username})
        let topup= await Topup.findOneAndUpdate({_id:new ObjectId(req.params.id)},{$set:{status,feedback:feedback||'',updatedAt:new Date()}});
        if(!socketRes.socketId && status=='FAILED'){await SocketResponse.findOneAndUpdate({user:username},{$inc:{['failed.topup']:1}});}
        if(socketRes.socketId) io.to(socketRes.socketId).emit('request-status', {title:`Topup Request ${status}`,body:`Recipient:${topup.recipient} Amount:৳${topup.amount} `,url:`${process.env.CLIENT_URL}/topup/history`})
        res.status(200).json({message:'status updated'})
    }catch(e) {next(e)}
}


export const updateTopupTelecomAccess = async (req, res,next) => {
    try {
        await Admin.findOneAndUpdate({role:'admin'},{$set:{topupAccess:req.body}})
        await SocketResponse.updateMany({user:{$exists:true}},{$set:{topupOptChanged:true}});
        res.status(200).json({message:'updated successfully'})
    }catch(err) {next(err)}
}



export const updateModemRouting = async (req,res,next) =>{
    try{
        let {updatedRouting} =req.body
        if(!updatedRouting.length) return res.status(400).json({error:'No updates Provided'})
        const bulkOps = updatedRouting.map(r=>{
            const updateFields = {}
            if(r.ip!=undefined) updateFields['routing.$.ip'] = r.ip
            if(r.slot!=undefined) updateFields['routing.$.slot'] = r.slot
            return {updateOne:{filter:{'routing._id':new ObjectId(r._id)}, update:{$set:updateFields}}}
        })
        await Admin.bulkWrite(bulkOps)
        const admin = await Admin.findOne({role:'admin'})
        res.status(200).json({routing:admin.routing,message:'routing updated'})
    //return res.status(400).json({ error:"Missing operator, number, or amount", success:false });
    }catch(err){next(err)}
}
/*export const updateModemRouting = async (req,res,next) =>{
    const {airtel,banglalink,gp,robi,teletalk} = req.body
    try {
        const updateField = {};
        if(airtel) updateField['routing.airtel']=airtel;
        if(banglalink) updateField['routing.banglalink'] = banglalink;
        if(gp) updateField['routing.gp'] = gp;
        if(robi) updateField['routing.robi'] = robi;
        if(teletalk) updateField['routing.teletalk'] = teletalk;
        let admin = await Admin.findOneAndUpdate({role:'admin'},{$set:updateField},{new:true});
    }catch(err) {next(err)}
}*/


export const getTopupHistoryByAdmin = async (req,res,next)=>{
    const {status,txn,user,opt,from,to,limit,page} = req.query;
    const filter = {};
    if(status) filter.status=status
    if(txn) filter.txn=txn
    if(user) filter.user=user
    if(opt) filter.operator=opt
    if(from) filter.createdAt={$gte:from}
    if(to) filter.createdAt={$lte:to}
    if(from&&to) filter.createdAt={$gte:from,$lte:to}
    let queryLimit=parseInt(limit) || 20
    let currentPage=parseInt(page)||1
    try{
        const total = await Topup.countDocuments(filter);
        const topups = await Topup.find(filter,{projection:{__v:0}}).skip(queryLimit*(currentPage-1)).limit(queryLimit).sort({createdAt:-1}).toArray();
        if(!topups) return res.status(404).json({error:'No topup history found'});
        res.status(200).json({topups,pagination:{totalPage:Math.ceil(total/queryLimit),currentPage}});
    }catch(err) {next(err)}
}


export const getTopupHistoryByUser = async (req,res,next)=>{
  const {id,status,page} =req.query
  let filter ={}
  //if(!id) return res.status().json({error:''});
  filter.user=req.user.id
  if(status) filter.status =status;
  let currentPage=parseInt(page)||1
  try {
    const total = await Topup.countDocuments(filter);
    const topups = await Topup.find(filter,{projection:{__v:0}}).skip(20*(currentPage-1)).limit(20).sort({updatedAt:-1}).toArray();
    if(!topups) return res.status(404).json({error:'টপ-আপ হিস্টোরি পাওয়া যায়নি', success:false});
    return res.status(200).json({topups,pagination:{totalPage:Math.ceil(total.length/20),currentPage}});
  }catch(err) {next(err)}
}

export const getTelecomBalances= async(req,res,next)=>{
    try{
      const admin = await Admin.findOne({role:'admin'}) 
      const responses = await Promise.allSettled(
        [...new Set(Object.values(admin.routing).map(r => r.ip))].map((url) => axios.get(url, {timeout:8000}))
      );
      const marged = {}
      responses.forEach((resp, idx) => {
        if (resp.status === "fulfilled") {
          try{
            const data = resp.value.data;
            const parsed = typeof data=='string'?JSON.parse(data):data;
            Object.assign(marged, parsed);
          }catch(e) {marged[`device_${idx+1}_error`] = 'Invalid JSON'}
        }else{marged[`device_${idx+1}_error`] = resp.reason.message }
      })
      res.json(marged);
    }catch(e) {res.status(500).json({error:e.message})}
}