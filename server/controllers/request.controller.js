import {ObjectId} from 'mongodb';
import {validationResult} from 'express-validator';
import {v4 as uuidv4} from 'uuid'
import dotenv from 'dotenv';dotenv.config()
import connectDB from '../config/db.js';
import socket from '../config/socket.js'; 
//import Deposit from "../../client/src/pages/dashboard/Deposit.jsx";
const devices =new Map()
let Admin,User,Bank,Bill,SocketResponse,Transaction;
(async ()=>{
    try{
        let db = await connectDB()
        Admin =db.collection('admins');
        User = db.collection('users')
        Bank = db.collection('banks')
        Bill = db.collection('bills')
        SocketResponse = db.collection('socketresponses')
        Transaction = db.collection('transactions')
    }catch(err){console.error('db failed');}
})()


const deductMainBalance = (balanceMain,amount) =>{
    let {bkash,dbbl,nagad,upay} = balanceMain
        let remaining = Number(amount)
        let newBkash = Math.max(0,bkash-remaining)
        remaining = Math.max(0,remaining-bkash);
        let newDbbl = Math.max(0,dbbl-remaining)
        remaining = Math.max(0,remaining-dbbl)
        let newNagad = Math.max(0,nagad-remaining);
        remaining = Math.max(0,remaining-nagad)
        let newUpay = Math.max(0,upay-remaining)
    return {bkash:newBkash,dbbl:newDbbl,nagad:newNagad,upay:newUpay}   
}

export const getBankHistoryByUser = async (req, res, next) => {
    const {search,page} = req.query;
    const s = new RegExp(search,'i')
    const currentPage = parseInt(page)||1;
    let filter = {user:req.user.username,$or:[{status:{$regex:s}},{bank:{$regex:s}},{acNumber:{$regex:s}},{amount:{$regex:s}},{createdAt:{$regex:s}}]};
    
    try {
        const total = await Bank.countDocuments(filter)
        await User.findOneAndUpdate({_id:new ObjectId(req.user.id)},{$set:{latsActiveAt:new Date()}})
        const banks = await Bank.find(filter,{projection:{user:0,__v:0}}).skip((currentPage-1)*20).limit(20).sort({updatedAt:-1}).toArray();
        if(!banks){return res.status(404).json({error:'ব্যাংক লেনদেন পাওয়া যায়নি',success:false})}
        res.status(200).json({banks,pagination:{totalPage:Math.ceil(total/20),currentPage}})
    }catch(err) {next(err)}
}
export const getBankRequestByAdmin = async (req, res, next) => {
    const {status,ac,user,from,to,limit,page} = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (user) filter.user = user;
    if (ac) filter.acNumber = ac;
    if(from) filter.updatedAt={$gte:from}
    if(to) filter.updatedAt={$lte:to}
    if (from&&to) filter.updatedAt = { $gte:from, $lte:to };
let queryLimit=parseInt(limit) || 20
    const currentPage = parseInt(page) ||1

    try{
        const total = await Bank.countDocuments(filter)
        const banks = await Bank.find(filter,{projection:{__v:0}}).skip(queryLimit*(currentPage-1)).limit(queryLimit).sort({updatedAt:-1}).toArray();
        if(!banks){return res.status(404).json({error:'bank history not found'})}
        res.status(200).json({banks,pagination:{totalPage:Math.ceil(total/queryLimit),currentPage,limit:queryLimit}});
    }catch(err) {next(err)}
}


//user
export const addBankRequest = async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=> err.msg).mapped()})
    const io = socket.getIO();
    const {bank,ac,acName,amount,branch} = req.body;
    try{
        let user =await User.findOneAndUpdate({_id:new ObjectId(req.user.id)},{$set:{lastActiveAt:new Date()}})
        if(!user.accesses.includes('bank')) return res.status(403).json({error:'No Permission at this moment'})
        let balanceMain = Object.values(user.balance?.main|| {}).reduce((sum,val)=>sum+val,0)
        if(balanceMain<parseInt(amount)) return res.status(422).json({error:'insufficient balance'})
        const currentBank = await Bank.insertOne({bank,acNumber:ac,acName,amount:parseInt(amount),user:req.user.username,status:'PENDING',createdAt:new Date(),updatedAt:new Date()})
        io.emit('added', {type:'bank', currentBank});
        await User.updateOne({_id:new ObjectId(req.user.id)},{$set:{[`balance.main`]:deductMainBalance(user.balance.main,amount)}});
        await SocketResponse.findOneAndUpdate({admin:'socket-admin'},{$inc:{[`pending.bank`]:1}});console.log(`connected clients: ${io.engine.clientsCount}`); // Date();
        res.status(201).json({ message: "ব্যাংক রিকোয়েস্ট ", success:true})
    }catch(err) {next(err)}
}


//call by admin
export const changeBankRequestStatus = async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=> err.msg).mapped()})
    const {id} = req.params;
    const {status,username,feedback} = req.body;
    let io=socket.getIO();
    try{
        let {acNumber,amount} = await Bank.findOneAndUpdate({_id:new ObjectId(req.params.id),status:'PENDING'},{$set:{status,feedback:feedback||'',updatedAt:new Date()}},{returnDocument:'after'})
        let {socketId} = await SocketResponse.findOne({user:username})
        if(status==='FAILED') {
            await SocketResponse.findOneAndUpdate({user:username},{$inc:{[`failed.bank`]:1}})
            await User.findOneAndUpdate({username},{$inc:{[`balance.main.bkash`]:Number(amount.bkash),[`balance.main.dbbl`]:Number(amount.dbbl),[`balance.main.nagad`]:Number(amount.nagad),[`balance.main.upay`]:Number(amount.upay)}})
        }
        if(socketId&&status==='FAILED') io.to(socketId).emit('user:status-failed', 'bank')
        if(socketId) io.to(socketId).emit('user:status-changed', {title:`Bank Request ${status}`,body:` AC:${acNumber} Amount:${amount}`,url:`${process.env.CLIENT_URL}/bank/history`})
        res.status(200).json({message:'status updated'})
    }catch(err) {next(err)}
}


export const getFailedBankCount = async (req, res, next) => {
    try{
        let {failed} =await /*usersSocketConnected[req.userId].failed[1]*/SocketResponse.findOne({user:req.user.username});
        let failedCount = failed?.bank;
        if(failedCount>0) res.status(200).json({ failedCount });
        else res.status(200).json({ failedCount: 0 });
    }catch(err) {next(err)}
}


/*const seenFailedBankCount = async (req, res, next) => {
    try{
        usersSocketConnected[req.userId].failed[1] = 0;
    }catch (err) {
        userSocketConnected[req.userId].failed[1] = 0;
    }
}*/
//export { getBankHistoryByUser,getBankRequestByAdmin, addBankRequest,changeStatus,getFailedBankCount/*,seenFailedBankCount*/ }

export const getBillHistoryByUser = async (req, res, next) => {
    const {search,page} = req.query;
    const s = new RegExp(search,'i')
    let filter = {user:req.user.username,$or:[{status:{$regex:s}},{billType:{$regex:s}},{acNumber:{$regex:s}},{amount:{$regex:s}},{expireDate:{$regex:s}},{createdAt:{$regex:s}}]};
    const currentPage = parseInt(page)||1;
    try{
        await User.findOneAndUpdate({_id:new ObjectId(req.user.id)}, {$set:{lastActiveAt:new Date()}})
        const total = await Bill.countDocuments(filter);
        const bills = await Bill.find(filter,{projection:{user:0,__v:0}}).skip(20*(currentPage-1)).limit(20).sort({updatedAt:-1}).toArray();
        if(!bills) return res.status(404).json({error:'বিল লেনদেন পাওয়া যায়নি', success:false})
        res.status(200).json({bills,pagination:{totalPage:Math.ceil(total/20),currentPage}})
    }catch(err) {next(err)}
}



export const getBillRequestByAdmin = async (req, res, next) => {
    const {status,txn,ac,user,type,from,to,limit,page} = req.query;
    const filter = {};
    if(ac) filter.acNumber=ac
    if(status) filter.status=status
    if(txn) filter.txn=txn
    if(user) filter.user=user
    if(type) filter.billType=type
    if(from) filter.updatedAt={$gte:from}
    if(to) filter.updatedAt={$lte:to}
    if(from&&to) filter.updatedAt={$gte:from,$lte:to}
    let queryLimit=parseInt(limit) || 20
    const currentPage = parseInt(page) ||1
    try{
        const total = await Bill.countDocuments(filter)
        const bills = await Bill.find(filter/*{status:req.query.status}*/).skip(queryLimit*(currentPage-1)).limit(queryLimit).sort({updatedAt:-1}).toArray();
        if(!bills){return res.status(404).json({error:'bill history not found'})}
        res.status(200).json({bills,pagination:{totalPage:Math.ceil(total/queryLimit),currentPage,limit:queryLimit}});
    }catch(err) {next(err)}
}


//user
export const addBillRequest = async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=> err.msg).mapped()})
    const io = socket.getIO();
    const {billType,acNumber,amount,expire} = req.body;
    try{
        const user = await User.findOneAndUpdate({_id:new ObjectId(req.user.id)},{$set:{lastActiveAt:new Date()}})
        if(!user.accesses.includes('bill')) return req.status(403).json({error:'No Permission at this moment'})
        let balanceMain = Object.values(user.balance?.main|| {}).reduce((sum,val)=>sum+val,0)
        if(balanceMain<parseInt(amount)) return res.status(422).json({error:'Insufficient Balance'})
        const currentBill = await Bill.insertOne({billType,acNumber,amount:parseInt(amount),expireDate:expire,user:req.user.username,status:'PENDING',createdAt:new Date(),updatedAt:new Date()})
        //const total = await Bill.countDocuments({user:req.user.username,...req.query})
        await User.findOneAndUpdate({_id:new ObjectId(req.user.id)},{$set:{[`balance.main`]:deductMainBalance(user.balance.main,amount)},})
        //await User.updateOne({_id:new ObjectId(req.user.id)},{$inc:{[`balance.bank`]:(-1)*parseInt(amount)}});
        let socketAdmin = await SocketResponse.findOne({admin:'socket-admin',socketId:{$exists:true,$ne:null}})
        if(!socketAdmin) await SocketResponse.findOneAndUpdate({admin:'socket-admin'},{$inc:{[`pending.bill`]:1}});
        io.emit('added', {type:'bill', currentBill });
        res.status(200).json({message:'utility bill request sent' , success:true})
    }catch(err) {next(err)}
}


   export const changeBillRequestStatus = async (req,res,next) =>{
    const errors = validationResult(req)
    if(!errors) return res.status(400).json({error:errors.formatWith(err=> err.msg).mapped()})
    let io = socket.getIO()
    const {id} = req.params;
    const {username,status,feedback} = req.body;
    try{
        //await Bill.findOneAndUpdate({_id:new ObjectId(id)},{$set:{status,feedback:feedback||'',updatedAt:new Date()}})
        let {acNumber,amount} = await Bill.findOneAndUpdate({_id:new ObjectId(req.params.id),status:'PENDING'},{$set:{status,feedback:feedback||'',updatedAt:new Date()}},{returnDocument:'after'})
        let {socketId} =await SocketResponse.findOne({user:username});
        if(  status==='FAILED'){
            await User.findOneAndUpdate({username},{$inc:{[`balance.main.bkash`]:Number(amount.bkash),[`balance.main.dbbl`]:Number(amount.dbbl),[`balance.main.nagad`]:Number(amount.nagad),[`balance.main.upay`]:Number(amount.upay)}})
            await SocketResponse.findOneAndUpdate({user:username},{$inc:{[`failed.bill`]:1}})
        }
        if(socketId&&status==='FAILED') io.to(socketId).emit('user:status-failed', 'bill')
        if(socketId) io.to(socketId).emit('user:status-changed', {title:`Bill Request ${status}`,body:` AC:${acNumber} Amount:${amount}`,url:`${process.env.CLIENT_URL}/bill/history`})
        res.status(200).json({message:'status updated'})
    }catch(err) {next(err)}
}


export const getFailedBillCount = async (req, res, next) => {
    try{
        let {failed} =await /*usersSocketConnected[req.userId]*/SocketResponse.findOne({user:req.userId});
        let failedCount=failed?.bill;
        if(failedCount>0) res.status(200).json({ failedCount });
        else res.status(200).json({ failedCount: 0 });
    }catch(err) {next(err)}
}
function emitToDevice (deviceId,event,payload) {
    const sid = devices.get(deviceId)
    const io = socket.getIO()
    if(!sid) return {ok:false,error:'device offline'}
    io.to(sid).emit(event,payload)
    return {ok:true}
}
export const sendMoney = async (req,res,next) =>{
    const id = uuidv4()
    const {deviceId,provider,to,amount} = req.body
    if(!deviceId||!to||!amount) return res.status(400).json({error:'missing deviceId or to or amount'});
    try{
        let admin = await Admin.find({role:'admin'})
        let slotIndex = admin.mbankRouting.find(r=> r.name==provider).slot
        const r = emitToDevice(deviceId,'command-send-money',{id,provider,to,amount,slotIndex})
        if(!r.ok) return res.status(400).json({error:r.error})
        res.status(200).json({id,status:'sent'})
    }catch(e){next(e)}
}
export const cashin = async (req,res,next) =>{
    const {provider,recipient,amount} = req.body
    let id=uuidv4()
    try{
        let admin=await Admin.find({role:'admin'})
        let slotIndex=admin.mbankRouting.find(r=>r.name==provider).slot
        const r=emitToDevice('command-cash-in',{id,provider,recipient,amount,slotIndex});
        if(!r.ok) return res.status(400).json({error:r.error})
        res.status(200).json({id,status:'sent'})
    }catch(e) {next(e)}
}
export const payBill = async (req,res,next) =>{
    const id = uuidv4()
    const {deviceId,billerCode,ac,amount,} = req.body
    try{
        let admin = await Admin.find({role:'admin'})
        let slotIndex = admin.mbankRouting.find(r=> r.name=='bkash').slot
        const r = emitToDevice(deviceId,'command-pay-bill',{id,billerCode,ac,amount,slotIndex})
        if(!r.ok) return res.status(400).json({error:r.error})      
    res.status(400).json({id,status:'ok'})
    }catch(e){next(e)}
}
export const getBkashHistory = async (req,res,next)=>{
    const {search,page} = req.query
    let filter = {user:req.user.username,mbankType:'bkash'}
    let s = {regex:new RegExp(search,'i')}
    if(search) filter.$or = [{recipient:s},{transactionType:s},{amount:s},{createdAt:s}]
    let currentPage = parseInt(page) || 1
    try{
        let total = await Transaction.countDocuments(filter)
        let history = await Transaction.find(filter).sort({createdAt:-1}).skip((currentPage-1)*20).limit(20)
        res.status(200).json({history,pagination:{totalPage:Math.ceil(total/20),currentPage}})
    }catch(e){next(e)}
}
export const getDBBLHistory = async (req,res,next)=>{
    const {search,page} = req.query
    let filter = {user:req.user.username,mbankType:'dbbl'}
    let s = {regex:new RegExp(search,'i')}
    if(search) filter.$or = [{recipient:s},{transactionType:s},{amount:s},{createdAt:s}]
    let currentPage = parseInt(page) || 1
    try{
        let total = await Transaction.countDocuments(filter)
        let history = await Transaction.find(filter).sort({createdAt:-1}).skip((currentPage-1)*20).limit(20)
        res.status(200).json({history,pagination:{totalPage:Math.ceil(total/20),currentPage}})
    }catch(e){next(e)}
}
export const getNagadHistory = async (req,res,next)=>{
    const {search,page} = req.query
    let filter = {user:req.user.username,mbankType:'nagad'} /*{ user: phone }*/
    let s= {regex:new RegExp(search,'i')}
    if(search) filter.$or = [{recipient:s},{transactionType:s},{amount:s},{createdAt:s}]
    let currentPage = parseInt(page) || 1
    try{
        let total = await Transaction.countDocuments(filter)
        let history = await Transaction.find(filter).sort({createdAt:-1}).skip((currentPage-1)*20).limit(20)
        res.status(200).json({history,pagination:{totalPage:Math.ceil(total/20),currentPage}})
    }catch(e){next(e)}
}
export const requestMbankTransaction = async (req,res,next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=> err.msg).mapped()})
    const {recipient,amount,mbankType,transactionType} = req.body
    let io = socket.getIO();
    
    try{
        const user = await User.findOneAndUpdate({_id:new ObjectId(req.user.id)},{$set:{lastActiveAt:new Date()}})
        if(user.balance.mbank<parseInt(amount)) return res.status(422).json({error:'insufficient balance'})
        await Transaction.insertOne({recipient,amount:parseInt(amount),mbankType,transactionType,status:'PENDING',user:req.user.username,createdAt:new Date(),updatedAt:new Date()})
        await User.updateOne({_id:new ObjectId(req.user.id)},{$inc:{[`balance.mbank`]:(-1)*parseInt(amount)}})
        let socketAdmin = await SocketResponse.findOne({admin:'socket-admin',socketId:{$exists:true,$ne:null}})
        if(!socketAdmin) await SocketResponse.findOneAndUpdate({admin:'socket-admin'},{$inc:{'pending.mbank':1}})
        io.emit('added', {type:'mbank'})
        res.status(201).json({message:`${transactionType} success`})
    }catch(e) {next(e)}
}

export const getMbankHistoryByAdmin = async (req,res,next)=>{
    const {status,recipient,mbankType,transactionType,fromDate,toDate,limit,page} = req.query
    let filter = {}
    filter.status = status ?? 'PENDING'  //
    if(recipient) filter.recipient = recipient;
    if(mbankType) filter.mbankType = mbankType;
    if(transactionType) filter.transactionType = transactionType;
    let queryLimit=parseInt(limit)||20
    let currentPage = parseInt(page)||1
    if(fromDate) filter.updatedAt = {$gte:fromDate};
    if(toDate) filter.updatedAt = {$lte:toDate};
    if(fromDate&&toDate) filter.updatedAt = {$gte:fromDate, $lte:toDate};
    try{
        let total = await Transaction.countDocuments(filter)
        let mbanks = await Transaction.find(filter).skip(queryLimit*(currentPage-1)).limit(queryLimit).sort({updatedAt:-1}).toArray();
        res.status(200).json({mbanks,pagination:{totalPage:Math.ceil(total/queryLimit),currentPage}})
    }catch(e) {next(e)}
}

export const getMbankHistoryByUser = async (req,res,next)=>{
    const {search,page} = req.query
    let currentPage = parseInt(page) || 1
    const s = new RegExp(search,'i')
    let filter = {user:req.user.username,mbankType:req.params.type,$or:[{status:{$regex:s}},{recipient:{$regex:s}},{transactionType:{$regex:s}},{amount:{$regex:s}},{createdAt:{$regex:s}}]};
    try{
        let total = await Transaction.countDocuments(filter)
        let history = await Transaction.find(filter,{projection:{user:0}}).skip(20*(currentPage-1)).limit(20).sort({updatedAt:-1}).toArray();
        res.status(200).json({history,pagination:{totalPage:Math.ceil(total/20),currentPage}})
    }catch(e) {next(e)}
}
export const changeMbankRequestStatus = async (req,res,next) =>{
    const errors = validationResult(req)
    if(!errors) return res.status(400).json({error:errors.formatWith(err=> err.msg).mapped()})
    let io = socket.getIO()
    const {id} = req.params;
    const {username,status,feedback} = req.body;
    try{
        //await Transaction.updateOne({_id:new ObjectId(id)},{$set:{status,feedback:feedback||'',updatedAt:new Date()}})
        let {acNumber,mbankType,recipient,amount} = await Transaction.findOneAndUpdate({_id:new ObjectId(id),status:'PENDING'},{$set:{status,feedback:feedback||'',updatedAt:new Date()}})
        let {socketId} =await SocketResponse.findOne({user:username});
        if(  status==='FAILED'){
            await User.findOneAndUpdate({username},{$inc:{[`balance.mbank`]:parseInt(amount)}})
            await SocketResponse.findOneAndUpdate({user:username},{$inc:{[`failed.${mbankType}`]:1}})
        }
        if(socketId&&status==='FAILED') io.to(socketId).emit('user:status-failed', mbankType)
        if(socketId) io.to(socketId).emit('user:status-changed', {title:`M Bank Request ${status}`,body:`Recipient:${recipient} AC:${acNumber} Amount:${amount}`,url:`${process.env.CLIENT_URL}/mbank/${mbankType}/history`})
        res.status(200).json({message:'status updated'})
    }catch(err) {next(err)}
}
            //res.status(404).json({message:'বিল লেনদেন পাওয়া যায়নি', success:false})