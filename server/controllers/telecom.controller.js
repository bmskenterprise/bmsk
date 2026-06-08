import {ObjectId} from 'mongodb';
import {validationResult} from 'express-validator';
import axios from 'axios';
import {v4 as uuidv4} from 'uuid'
import dotenv from 'dotenv';dotenv.config()
import connectDB from '../config/db.js';
//import SocketResponse from '../models/socketResponse.model.js'
import socket from '../config/socket.js';
//import userModel from '../models/user.model.js';
//let io = socket.getIO()
let CACHE_TTL_MS = 24*1000*60*60;
let routings = null
let lastFetchedTime = 0
let devices = new Map()
let Admin,User,Topup,Drive,DriveHit,Regular,SocketResponse
(async () =>{
    try{
        let db = await connectDB();
        Admin = db.collection('admins')
        User = db.collection('users') 
        Topup = db.collection('topups')
        Drive = db.collection('drives')
        DriveHit = db.collection('drivehits')
        Regular = db.collection('regulars')
        SocketResponse = db.collection('socketresponses')
    }catch(e){console.error(`pack db failed ${e}`);}
})()
     
     
     
   
     
     
     
     
     
     
        // { username: req.params.user },
//call by admin ;
const emitToDevice = (deviceId,event,payload) =>{
    let io = socket.getIO()
    let sid = devices.get(deviceId)
    if(!sid) return {ok:false, error:'device offline'}
    io.to(sid).emit(event, payload)
    return {ok:true}
}
//call by user
export const getTopupOpts =async (req, res,next) => {
    try{
        let admin = await Admin.findOne({role:'admin'});
        if(!admin) throw new Error('server issue');
        res.status(200).json(admin.topupAccess.sort())
    }catch(e) {next(e)}
}
export const getTopupMethod = async (req,res,next) =>{
    try{
        let admin =await Admin.findOne({role:'admin'})
        res.status(200).json({topupMethod:admin.methods.topup})
    }catch(e) {next(e)}
}
          
            // Notify admin dashboard in real-time via socket.io
        //যায়নি','success':false})//   {$set: {lastActiveAt: new Date()}}
export const changeTopupMethod= async (req,res,next) =>{
    try{
        let result=await Admin.findOneAndUpdate({role:'admin'},{$set:{['methods.topup']:req.params.method}},{returnDocument:'after'})
        res.status(200).json({topupMethod:result.methods.topup,message:'topup method changed'})
    }catch(e){next(e)}
}
export const topup = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=>err.msg).mapped(),success:false});
    const {operator,recipient,amount} = req.body
    let admin
    if(!operator||!recipient||!amount) return res.status(400).json({error:'Missing operator, number, or amount',success:false});
    let io = socket.getIO()

    try{
            admin = await Admin.findOne({role:'admin'});
        let user=await User.findOne({_id:new ObjectId(req.user.id)});
        if(!user.accesses.includes('topup')) return res.status(401).json({error:'dont have topup permission',success:false})
        if(user.balance.topup<amount) return res.status(422).json({error:'Insufficient balance',success:false})
        if(admin.methods.topup=='retail'){
        /*const response = await fetch(url);
        if(!response.ok) return res.status(500).json({ error:"Failed to forward USSD request", success:false });
        let d=await response.json();*/
    const now = Date.now()
    if(!routings|| (now - lastFetchedTime > CACHE_TTL_MS)) {
        try{
            routings =admin.routing;
            lastFetchedTime = now;
        }catch(e) {return res.status(500).json({ error: 'MongoDB fetch error'+e,success:false});}
    }
    const opKey = operator.toLowerCase();
    const map = routings.find(r=> r.operator==opKey);
    if(!map) return res.status(400).json({error:`Operator '${operator}' not supported`, success:false });

    const ussds = {
        airtel: `*123*${recipient}*${amount}#`,
        banglalink: `*5000*1*1*${recipient}*${amount}#`,
        grameenphone: `555*${recipient}*${amount}#`,
        robi: `*123*${recipient}*${amount}#`,
        teletalk: `*727*${recipient}*${amount}#`
    };
    const url = `http://${map.ip}:8080/ussd/send?ussd=${encodeURIComponent(ussds[opKey])}&sim=${map.slot}&token=ksmb@25112025`;
            await Topup.insertOne({recipient,operator,amount:parseInt(amount),user:req.user.username,status:'SUCCESS'});//console.log(`d.data ${d.data}`);
            await User.findOneAndUpdate({_id:new ObjectId(req.user.id)},{$inc:{['balance.topup']:amount*(-1)}})
            return res.status(201).json({message:'topup success',success:true,operator,sim:map.slot,device:map.ip/*,gateway_response:d.data*/});
        }else if(admin.methods.topup=='manual'){
            await Topup.insertOne({recipient,operator,amount:parseInt(amount),user:req.user.username,status:'PENDING',createdAt:new Date(),updatedAt:new Date()});
            await User.findOneAndUpdate({_id:new ObjectId(req.user.id)},{$inc:{['balance.topup']:amount*(-1)}})
            let {socketId} = await SocketResponse.findOneAndUpdate({admin:req.user.adminRef},{$inc:{['pendings.topup']:1}},{returnDocument:'after'});
            //if(!socketAdmin) await SocketResponse.findOneAndUpdate({admin:'socket-admin'},{$inc:{['pending.topup']:1}});
            if(socketId) io.to(socketId).emit('added',{type:'topup'})
            return res.status(201).json({message:'topup request sent',success:true}); 
        }else if(admin.methods.topup=='mbank'){
            const id = uuidv4()
            const {deviceId,operator,recipient,amount} = req.body;
            const r = emitToDevice(deviceId,'topup',{id,operator,recipient,amount})
            if(!r.ok) return res.status(400).json({error:r.error,success:false})
            await Topup.insertOne({recipient,operator,amount:parseInt(amount),user:req.user.username,status:'SUCCESS'});
            await User.findOneAndUpdate({_id:new ObjectId(req.user.id)},{$inc:{['balance.topup']:amount*(-1)}})
            return res.status(201).json({message:'topup request sent',success:true})
        }
    }catch(e) {
    return res.status(500).json({
      error: 'Failed to forward USSD request',
      details: e.message,success:false
    });
  }
};

export const changeTopupStatus = async (req,res,next)=>{
    const {username,status,feedback} = req.body;
    let io = socket.getIO()
    try{
        const {socketId} = await SocketResponse.findOne({user:username})
        let {recipient,amount}= await Topup.findOneAndUpdate({_id:new ObjectId(req.params.id),status:'PENDING'},{$set:{status,feedback:feedback||'',updatedAt:new Date()}});
        if(status=='FAILED') {
            await User.findOneAndUpdate({username},{$inc:{[`balance.topup`]:parseInt(amount)}})
            await SocketResponse.findOneAndUpdate({user:username},{$inc:{['failed.topup']:1}});
        }
        if(socketId) io.to(socketId).emit('user:status-changed', {title:`Topup Request ${status}`,body:`Recipient:${recipient} Amount:৳${amount} `,url:`${process.env.CLIENT_URL}/topup/history`})
        if(socketId&&status==='FAILED') io.to(socketId).emit('user:status-failed','topup')
        res.status(200).json({message:'topup status updated'})
    }catch(e) {next(e)}
}

export const updateTopupTelecomAccess = async (req, res,next) => {
    try {
        await Admin.findOneAndUpdate({role:'admin'},{$set:{topupAccess:req.body}})
        await SocketResponse.updateMany({user:{$exists:true}},{$set:{topupOptChanged:true}});
        res.status(200).json({message:'updated successfully'})
    }catch(e) {next(e)}
}

//admin
export const getTelecoms = async (req,res,next)=>{
    try {
        const admin = await Admin.findOne({role:'admin'});
        if(!admin || !admin.telecoms)return res.status(404).json({error:'Not Found'})
        /*const logos = {};
        for(const element of admin.telecom) logos[element.name] =element.icon*/
        let telecoms = admin.telecoms.map(t=>({name:t.name,icon:t.icon,active:t.active}))
        res.status(200).json(telecoms);
    }catch(e) {next(e)}
};
//user
export const getTelecomOpts = async (req,res) => {
    try {
        const admin = await Admin.findOne({role:'admin'});
        if(!admin) res.status(200).json([]);
        res.status(200).json(admin.telecoms.map(t=>({name:t.name,icon:t.icon})))
    } catch(e) {res.status(200).json([]);} 
}

export const getModemRouting = async (req,res,next) =>{
    try{
        const admin = await Admin.findOne({role:'admin'});
        res.status(200).json(admin.routing)
    }catch(e) {next(e)}
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
    }catch(e){next(e)}
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
    }catch(e) {next(e)}
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
    }catch(e) {next(e)}
}
     


export const getTopupHistoryByUser = async (req,res,next)=>{
  const {id,search,page} =req.query
  const s =new RegExp(search,'i');
  let filter ={user:req.user.username,$or:[{status:{$regex:s}},{recipient:{$regex:s}},{transactionType:{$regex:s}},{amount:{$regex:s}},{createdAt:{$regex:s}}]}
  //filter.user=req.user.id
  //if(status) filter.status =status;
  let currentPage=parseInt(page)||1
  try {
    const total = await Topup.countDocuments(filter);
    const topups = await Topup.find(filter,{projection:{user:0,__v:0}}).skip(20*(currentPage-1)).limit(20).sort({updatedAt:-1}).toArray();
    if(!topups) return res.status(404).json({error:'topup history not found', success:false});
    return res.status(200).json({topups,pagination:{totalPage:Math.ceil(total.length/20),currentPage}});
  }catch(e) {next(e)}
}

export const getTelecomBalances= async(req,res,next)=>{
    try{
        const admin = await Admin.findOne({role:'admin'}) 
        const responses = await Promise.allSettled(
        [...new Set(Object.values(admin.routing).map(r => r.ip))].map((url) => axios.get(url, {timeout:8000}))
        );
        const marged = {}
        responses.forEach((resp, idx) => {
            if(resp.status==="fulfilled") {
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
export const getAllOptDriveSummary/*Count*/ = async (req, res, next) => {
    try{
        const admin = await Admin.findOne({role:'admin'});
        //let driveOpts=admin.drive.optAccess.filter(op=>op.access).map(op=>op.opt)
        //const counts = await Drive.aggregate([{$group: {_id:'$operator', count:{$sum:1}}}])
        //let summary=admin.driveAccess.map(op=>({...op,driveCount:counts.find(opt=>opt._id==op.opt).count || 0}))/*counts.filter(opt=>driveOpts.includes(opt.optName))*/
        let opts=['airtel','banglalink','grameenphone','robi','teletalk']//admin.driveAccess.map(op=>op.opt)
        const counts = await Drive.aggregate([{$match:{operator:{$in:opts}}},{$group: {_id:'$operator', count:{$sum:1}}}]).toArray()
        let summary=opts.map(op=>{
            const found=counts.find(opt=>opt._id==op)
            return {opt:op,active:admin.driveAccess.includes(op), driveCount:found?found.count:0}
        })
        res.status(200).json(summary);
    }catch(e) {next(e)}
}

//call by user
export const getDriveOpts =async (req, res,next) => {
    try{
        let admin = await Admin.findOne({role:'admin'});
        if(!admin) throw new Error('server issue');
        //const driveOpts = admin.drive.optAccess.filter(op=>op.access).map(op=>({name:op.name,icon:admin.telecoms.find(t=>t.name==op.name).icon}));
        const driveOpts = admin.driveAccess.sort()//.filter(op=>op.active).map(op=>op.opt);
        res.status(200).json(driveOpts)
    }catch(e) {next(e)}
}

//call by user
export const hitDrive = async (req, res, next) => {
    const io = socket.getIO();
    let errors = validationResult(req).formatWith(err=>err.msg)
    if(!errors.isEmpty()) return res.status(400).json({error:'required', success:false});
    const {drive, recipient, price, } = req.body;
    try{
        let user= await User.findOne({_id:new ObjectId(req.user.id)})
        if(user.balance.drive<price) return res.status(422).json({error:'insufficient balance',success:false})
        await User.findOneAndUpdate({_id:new ObjectId(req.user.id)},{$inc:{[`balance.drive`]:Number(drive.price-drive.commission)*(-1)}})
        await User.findOneAndUpdate({_id:new ObjectId(req.user.id)},{$set:{lastActiveAt:new Date()}});
        //const hit = new DriveHit({drive, recipient, user:req.user.username});
        const currentPack= await DriveHit.insertOne({drive, recipient, user:req.user.username,status:'PENDING',createdAt:new Date(),updatedAt:new Date()});
        io.emit('added', {type:'drive', currentPack });
        await SocketResponse.findOneAndUpdate({admin:'socket-admin'},{$inc:{[`pending.drive`]:1}});

        res.status(201).json({message:'drive hit success', success:true});
    }catch(e) {next(e)}
}

export const getDriveHistoryByUser = async (req,res,next) =>{
    const {search,/*recipient,*/page} = req.query
    const s = new RegExp(search,'i')
    const filter ={user:req.user.username,$or:[{status:{$regex:s}},{recipient:{$regex:s}},{operator:{$regex:s}},{amount:{$regex:s}},{createdAt:{$regex:s}}]}
    //if(status) filter.status = status
    let currentPage=parseInt(page) || 1
    try{
        let total = await DriveHit.countDocuments(filter);
        let drives = await DriveHit.find(filter,{projection:{user:0,__v:0}}).skip(20*(currentPage-1)).limit(20).sort({updatedAt:-1}).toArray();
        if(!drives) return res.status(404).json({error:'Drive History Not Found',success:false})
        res.status(200).json({drives,pagination:{currentPage,totalPage:Math.ceil(total/20)}});
    }catch(e) {next(e)};
}
  //}
//call by user
export const getDrivesByUser = async (req,res,next)=>{
    const {category,search,page} = req.query
    const filter={operator:req.params.opt,category,active:true}
    if(search) filter.title = {$regex:new RegExp(search,'i')}
    if(req.params.opt) filter.operator=req.params.opt
    filter.active=true
    const currentPage = parseInt(page) || 1;
    const queryLimit = 20;
    try{
        let user=await User.findOneAndUpdate({_id:new ObjectId(req.user.id)},{$set:{lastActiveAt:new Date()}});
        let total = await Drive.countDocuments(filter);
        if(!user.accesses.includes('drive')) return res.status(401).json({error:'Access Denied',success:false}) 
        const drives = await Drive.find(filter,{projection:{active:0,sold:0,expireDate:0,createdAt:0,updatedAt:0,__v:0}}).skip(queryLimit*(currentPage-1)).limit(queryLimit).sort({updatedAt:-1}).toArray();
        if(!drives) return res.status(404).json({error:'drives not found', success:false});
        res.status(200).json({drives,pagination:{totalPage:Math.ceil(total/queryLimit),currentPage}});
    }catch(e) {next(e)}// (e) {
};

export const getDrive = async (req,res,next) =>{
    try{
        let drive = await Drive.findOne({_id:new ObjectId(req.params.id)},{projection:{__v:0,active:0,expireDate:0,sold:0,createdAt:0,updatedAt:0}});
        if(!drive) return res.status(200).json({error:'drive not found'});
        res.status(200).json(drive);
    }catch(e){next(e)}
}

//call by admin
export const getDrivesByAdmin = async (req, res, next) => {
    const {opt} = req.params;
    const {status,category,fromPrice,toPrice,fromDate,toDate,search,limit,page} = req.query;
    const filter = {};
    const queryRegex = new RegExp(search, 'i');
    if(opt) filter.operator = opt.toLowerCase()
    if(status) filter.active = status==='active'
    if(category) filter.category = category
    if(fromDate) filter.updatedAt = {$gte:fromDate};
    if(toDate) filter.updatedAt = {$lte:toDate};
    if(fromDate&&toDate) filter.updatedAt = {$gte:fromDate, $lte:toDate};
    if(fromPrice) filter.price = {$gte:fromPrice}
    if(toPrice) filter.price = {$lte:toPrice}
    if(fromPrice&&toPrice) filter.price = {$gte:fromPrice, $lte:toPrice}//next(e);
    if(search) filter.title = {$regex:queryRegex} //console.error(error);
    let queryLimit=parseInt(limit) || 20
    let currentPage=parseInt(page) || 1
    try{
        const total = await Drive.countDocuments(filter);
        const drives = await Drive.find(filter,{projection:{__v:0}}).skip(queryLimit*(currentPage-1)).limit(queryLimit).sort({updatedAt:-1}).toArray();
        if(!drives) {return res.status(404).json({ error: 'No drives found' });}
        res.status(200).json({drives,pagination:{totalPage:Math.ceil(total/queryLimit),currentPage}});
    }catch(e) {next(e)}// (e) {
}


//call by admin
export const addDrive = async (req, res, next) => {
    const errors = validationResult(req);
     if(!errors.isEmpty()) return res.status(400).json({ error: errors.formatWith(err=>err.msg).mapped() });
    //}
    try{
        const {operator,category,title, price, commission, expireDate} = req.body;
        const exist = await Drive.findOne({operator,title})// real-time via socket.io
        if(exist) return res.status(400).json({error:'drive already exist'});
        let id = Math.trunc(new Date().getTime() / 1000).toString(16).toUpperCase();
        //const drive = new Drive({id,operator:operator.toLowerCase(),title, price:parseInt(price), commission:parseInt(commission)/*, expireDate*/});
        const currentPack= await Drive.insertOne({id,operator:operator.toLowerCase(),category,title, price:parseInt(price), commission:parseInt(commission),sold:0,active:true, expireDate,createdAt:new Date(),updatedAt:new Date()});
        res.status(201).json({message:'Drive added successfully', drive:currentPack});
    }catch(e) {next(e)}// (error) {
}
    //}



//call by admin
export const editDrive = async (req, res, next) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ error: errors.formatWith(err=>err.msg).mapped()});// });
        //return res.status(400).json({ error: errors.formatWith(err=>err.msg).mapped() });
    //}
    try{
        const {id} = req.params;
        await Drive.findOneAndUpdate({_id:new ObjectId(id)},{$set: req.body}/*,{new:true}*/);
        res.status(200).json({message:'Drive updated successfully'});
    }catch(e) {next(e)}// (error) {
}
    //}



//call by admin
export const toggleDriveStatus = async (req, res, next) => {
    const {/*ids,*/ status} = req.body;
    //if(!Array.isArray(ids)) return res.status(400).json({error:'ids must be an array'});
    try{
        let result=await Drive.updateOne({_id:new ObjectId(req.params.id)},{$set:{active:status}}/*,{new:true}*/);
        res.status(200).json({message:` drive status updated successfully`});
    }catch(e) {next(e)}// (error) {
}
    //}



//call by admin
export const deleteDrive = async (req, res, next) => {
    try{
        const {ids} = req.body;
        let result=await Drive.deleteMany({_id:{$in:ids.map(id=>new ObjectId(id))}});
        res.status(203).json({message:`${result.deletedCount} Drive deleted successfully`});
    }catch(e) {next(e)}// (e) {
}
    //}



//call by admin
export const getDriveHits = async (req, res, next) => {
    const {status, user,telecom,fromDate,toDate,limit,page} = req.query;
    const filter = {};
    if(status) filter.status = status.toUpperCase();
    if(user) filter.user = user;
    if(telecom) filter['drive.operator'] = telecom;
    if(fromDate) filter.createdAt = {$gte:fromDate};
    if(toDate) filter.createdAt = {$lte:toDate};
    if(fromDate&&toDate) filter.createdAt = {$gte:fromDate,$lte:toDate};
    let queryLimit=parseInt(limit) || 20
    let currentPage=parseInt(page) || 1
    
    try{
        const total = await DriveHit.countDocuments(filter);
        const hits = await DriveHit.find(filter,{projection:{__v:0}}).skip(queryLimit*(currentPage-1)).limit(queryLimit).sort({createdAt:-1}).toArray();
        if(!hits) return res.status(404).json({ error: 'No drives found' });
        res.status(200).json({hits,pagination:{totalPage:Math.ceil(total/queryLimit),currentPage,limit:queryLimit}});
    }catch(e) {next(e)}// (e) {
}
    //}


//call by admin
export const changeHitStatus = async (req, res,next) => {
    const {username,status,feedback} = req.body;
    let io = socket.getIO() 
    try{
        let {drive,recipient} = await DriveHit.findOneAndUpdate({_id:new ObjectId(req.params.id),status:'PENDING'},{$set:{status,feedback:feedback||''}});
        const {socketId} =await SocketResponse.findOne({user:username})//usersSocketConnected[username];

        //if(socketId) io.to(socketId).emit('drivehit-status', { title:'Drive', message:`drive ${status=='failed'?feedback:status}`});
        if(status=='SUCCESS') await Drive.findOneAndUpdate({_id:new ObjectId(drive.id)},{$inc:{sold:1}});
        if( status=='FAILED'){
            await User.findOneAndUpdate({username}, {$inc:{[`balance.drive`]:drive.price}})
            await SocketResponse.findOneAndUpdate({user:username},{$inc:{['failed.drive']:1}})
        }
        if(socketId&&status==='FAILED') io.to(socketId).emit('user:status-failed','drive')
        if(socketId) io.to(socketId).emit('user:status-changed',{title:`Drive Request ${status}`,body:`Recipient:${recipient} Amount:${drive.price}`,url:`${process.env.CLIENT_URL}/drive/history`})
        res.status(200).json({message:`Drive hit status : ${status}`});
    }catch(e) {next(e)}// (e) {
}
                //{ $inc: { sold: 1 } }
        //next(e);
    //}

//user
export const getFailedDriveCount = async (req, res, next) => {
    try{
        let {failed} =await SocketResponse.findOne({user:req.user.username})//usersSocketConnected[req.userId].failed[0];
        if(failed?.drive>0) res.status(200).json({ failedDriveCount:failed?.drive });
        else res.status(200).json({ failedCount: 0 });
    }catch(e) {next(e)}// (e) {
}



//call by admin ;
export const getAllOptRegularSummary/*Count*/ = async (req, res, next) => {
    try{
        const admin = await Admin.findOne({role:'admin'});
        //let regularOpts=admin.regular.optAccess.filter(op=>op.access).map(op=>op.opt)
        //const counts = await Regular.aggregate([{$group: {_id:'$operator', count:{$sum:1}}}])
        //let summary=admin.regularAccess.map(op=>({...op,regularCount:counts.find(opt=>opt._id==op.opt)?.count || 0}))//counts.filter(opt=>regularOpts.includes(opt.optName))
        let opts=['airtel','banglalink','grameenphone','robi','teletalk']//admin.regularAccess.map(op=>op.opt)
        const counts = await Regular.aggregate([{$match:{operator:{$in:opts}}},{$group: {_id:'$operator', count:{$sum:1}}}]).toArray()
        let summary=opts.map(op=>{
            const found= counts.find(opt=>opt._id==op)
            return {opt:op,active:admin.regularAccess.includes(op),regularCount:found?found.count : 0}
        })
        res.status(200).json(summary);
    }catch(e) {next(e)}
}

//call by user
export const getRegularOpts =async (req, res,next) => {
  try{
    let admin = await Admin.findOne({role:'admin'});
    if(!admin) throw new Error('server issue');
    //const driveOpts = admin.drive.optAccess.filter(op=>op.access).map(op=>({name:op.name,icon:admin.telecoms.find(t=>t.name==op.name).icon}));
    const regularOpts = admin.regularAccess.sort()//.filter(op=>op.active).map(op=>op.opt);
    res.status(200).json(regularOpts)
  }catch(e) {next(e);}  
}

//call by user
export const getRegularsByUser = async (req,res,next)=>{
    const {category,search,page} = req.query
    let filter = {operator:req.params.opt,category,active:true}
    if(search) filter.title = {$regex:new RegExp(search,'i')};
    const currentPage = parseInt(page)||1;
    const queryLimit = 20;
    try{
        let user=await User.findOneAndUpdate({_id:new ObjectId(req.user.id)},{$set:{lastActiveAt:new Date()}})
        if(!user.accesses.includes('regular')) return res.status(401).json({error:'Access Denied',success:false})
        const total = await Regular.countDocuments(filter)
            /*{$set: {lastActiveAt: new Date()}});*/
        const regulars = await Regular.find(filter,{projection:{active:0,expireDate:0,sold:0,createdAt:0,updatedAt:0,__v:0}}).skip(queryLimit*(currentPage-1)).limit(queryLimit).sort({updatedAt:-1}).toArray();
        if(!regulars) {return res.status(404).json({error:'regular packs not found', success:false});}  //
        res.status(200).json({regulars,pagination:{totalPage:Math.ceil(total/queryLimit),currentPage}});
    }catch(e) {next(e)}
};
export const getRegular = async (req,res,next) =>{
    try{
        let regular = await Regular.findOne({_id:new ObjectId(req.params.id)},{projection:{__v:0,active:0,expireDate:0,sold:0,createdAt:0,updatedAt:0}});
        if(!regular) return res.status(404).json({error:'regular not found'})//);*/
        res.status(200).json(regular);
    }catch(e){next(e)}
}
//call by admin
export const getRegularsByAdmin = async (req, res, next) => {
    const {opt} = req.params;
    const {status,category,fromPrice,toPrice,fromDate,toDate,search,limit,page} = req.query;
    const queryRegex = new RegExp(search, 'i');
    const filter = {};
    if(opt) filter.operator = opt.toLowerCase()
    if(status) filter.active = status=='active'
    if(category) filter.category = category
    if(fromDate) filter.updatedAt = {$gte:fromDate};
    if(toDate) filter.updatedAt = {$lte:toDate};
    if(fromDate&&toDate) filter.updatedAt = {$gte:fromDate, $lte:toDate};
    if(fromPrice) filter.price = {$gte:fromPrice}
    if(toPrice) filter.price={$gte:toPrice}
    if(fromPrice&&toPrice) filter.price = {$gte:fromPrice, $lte:toPrice}
    if(search) filter.title = {$regex:queryRegex} //next(e);
    let queryLimit=parseInt(limit) || 20
    let currentPage=parseInt(page) || 1
    try {
        const total = await Regular.countDocuments(filter);
        const regulars = await Regular.find(filter,{projection:{__v:0}}).skip(queryLimit*(currentPage-1)).limit(queryLimit).sort({updatedAt:-1}).toArray();
         if(!regulars) {return res.status(404).json({ error: 'No regulars found' });}
        res.status(200).json({regulars,pagination:{totalPage:Math.ceil(total/queryLimit),currentPage}});
    }catch(e) {next(e)}// (e) {
}
    //}



//call by admin
export const addRegular = async (req, res, next) => {
    let errors = validationResult(req);
     if(!errors.isEmpty()) return res.status(400).json({ error: errors.formatWith(err=>err.msg).mapped() });
    //}
    try {
        const {operator,category,title, price, expireDate} = req.body;
        const exist = await Regular.findOne({operator,title})// real-time via socket.io
        if(exist) return res.status(400).json({error:'regular already exist'});
        let id = Math.trunc(new Date().getTime() / 1000).toString(16).toUpperCase();
        //const regular = new Regular({id,operator:operator.toLowerCase(),title, price:parseInt(price)/*, expireDate*/, });
        const currentPack= await Regular.insertOne({id,operator:operator.toLowerCase(),category,title, price:parseInt(price),sold:0,active:true,expireDate,createdAt:new Date(),updatedAt:new Date()});
        res.status(201).json({message:'Regular created successfully', regular:currentPack});
    }catch(e) {next(e)}// (error) {
}
        //console.error(error);
    //}



//call by admin
export const editRegular = async (req, res, next) => {
    let errors = validationResult(req);
     
    if(!errors.isEmpty()) return res.status(400).json({ error: errors.formatWith(err=>err.msg).mapped() });
    //}
    try {
        const {id} = req.params;
        await Regular.findOneAndUpdate({_id:new ObjectId(id)},{$set: req.body}/*,{new:true}*/);
        res.status(200).json({message:'Regular updated successfully'});
    }catch(e) {next(e)}// (error) {
}
    //}



//call by admin
export const toggleRegularStatus = async (req, res, next) => {
    const {/*ids,*/ status} = req.body;
    //if(!Array.isArray(ids)) return res.status(400).jwson({error:'ids must be an array'});
    try {
        let result=await Regular.updateOne({_id:new ObjectId(req.params.id)},{$set:{active:status}}/*,{new:true}*/);
        res.status(200).json({message:` regular status updated successfully`});
    }catch(e) {next(e)}// (error) {
}
    //}



//call by admin
export const deleteRegular = async (req, res, next) => {
    try{
        const {ids} = req.body;
        let result=await Regular.deleteMany({_id:{$in:ids.map(id=>new ObjectId(id))}});
        res.status(203).json({message:`${result.deletedCount} regular deleted successfully`});
    }catch(e) {next(e)}
}
export const getAllTelecomAccess = async (req,res,next) =>{
    try{
        let admin = await Admin.findOne({role:'admin'});
        res.status(200).json({topupAccess:admin.topupAccess,regularAccess:admin.regularAccess,driveAccess:admin.driveAccess});
    }catch(e) {next(e)}
}

export const getFailedRegularCount = async (req, res, next) => {
    try{
        let {failed} = await SocketResponse.findOne({user:req.user.username})//usersSocketConnected[req.userId].failed[0];
        if(failed?.regular>0) res.status(200).json({ failedRegularCount:failed?.regular });
        else res.status(200).json({failedCount:0});
    }catch(e) {next(e)}// (e) {
}
export const updateDriveTelecomAccess = async (req, res,next) => {
    try {
        await Admin.findOneAndUpdate({role:'admin'},{$set:{driveAccess:req.body}})
        await SocketResponse.updateMany({user:{$exists:true}},{$set:{driveOptChanged:true}})
        res.status(200).json({message:'drive opt access updated'})
    }catch(e) {next(e)}
}

export const updateRegularTelecomAccess = async (req,res,next) =>{
    try{
        await Admin.findOneAndUpdate({role:'admin'},{$set:{regularAccess:req.body}})
        await SocketResponse.updateMany({user:{$exists:true}},{$set:{regularOptChanged:true}})  //
        res.status(200).json({message:'regular opt access updated'})
    }catch(e) {next(e)}
}
    //}
//user
export const getTelecomCategories = async (req,res,next) =>{
    try{
        const admin = await Admin.findOne({role:'admin'});
        res.status(200).json(admin.telecomCategories);
    }catch(e) {next(e)}
}
/*const seenFailedDriveCount = async (req, res, next) => {
    try{
        usersSocketConnected[req.userId].failed[2] = 0;
    }catch (e) {
        userSocketConnected[req.userId].failed[2] = 0;
    }
}*/
    /*getDrivesByUser,
    createDrive,
    editDrive,
    toggleDriveStatus,
    deleteDrive,getDriveHits,updateHitStatus,driveCount,getFailedDriveCount,seenFailedDriveCount*/
