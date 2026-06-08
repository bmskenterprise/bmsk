import {createRequire} from 'module'
import {ObjectId} from 'mongodb';
import {validationResult} from 'express-validator'
import globals from 'node-global-storage'
import dotenv from 'dotenv';dotenv.config();
const require = createRequire(import.meta.url);
const SSLCommerzPayment = require('sslcommerz-lts')
import {v4 as uuidv4} from 'uuid';
import axios from 'axios';
import connectDB from '../config/db.js';
import socket from '../config/socket.js';
import cloudinary from '../config/cloudinary.js'
let Admin,User,Deposit,DepositInit,SocketResponse,Withdraw


(async () =>{
    try{
        let db = await connectDB();
        Admin = db.collection('admins')
        User = db.collection('users')
        Deposit = db.collection('deposits');
        DepositInit = db.collection('depositinits');
        SocketResponse = db.collection('socketresponses')
        Withdraw = db.collection('withdraws')
    }catch(e) {console.error(`deposit db failed ${e}`)} 
})()
export const getDepositMethod =async (req,res,next) =>{
    try{
        let result=await Admin.findOne({role:'admin'});
        res.status(200).json({depositMethod:result.methods.deposit})
    }catch(e) {next(e)}
}

export const changeDepositMethod = async (req,res,next) =>{
    try{
        let result=await Admin.findOneAndUpdate({role:'admin'},{$set:{[`methods.deposit`]:req.params.method}},{returnDocument:'after'});
        res.status(200).json({depositMethod:result.methods.deposit,message:'deposit method changed'});
    }catch(e) {next(e)}
}


export const depositByUser = async (req, res,next) => {
    let {txn,gateway,balanceType,ref} = req.body;
    //if(/*!userId||*/ isNaN(amount)) return res.status(400).json({ error: 'Invalid Amount' });
    //if(!['topup','drive','bank'].includes(balanceType)) return res.status(400).json({error:'invalid balance type'});
    let initFilter = {txn}
    if(ref) {initFilter.user = ref}
    else {initFilter.user = req.user.username}
    try{
        const admin= await Admin.findOne({role:'admin'});
        if(admin.methods.deposit=='manual') return next();
        const user = await User.findOne({_id:new ObjectId(req.user.id)});
        if(!user) return res.status(404).json({ error: 'User not found',success:false });
        let init= await Deposit.findOneAndUpdate(initFilter,{$set:{status:'SUCCESS',updatedAt:new Date()}},{returnDocument:'after'});
        if(!init) return res.status(404).json({error:'txn not found',success:false});
        if(!admin) return res.status(404).json({ error: 'Admin not found',success:false });
      //let c=admin.deposits.find(d=>d.level==req.user.level)?.[balanceType]?.commission?.[init.gateway]//const newBalance = user[balanceType] += (amount+amount*(admin.topupDeposit.commission/100).toPrecision(3));
      //let extra = (Number(init.amount)*c/100).toFixed(2);
      //io.emit('failed', )
        await User.updateOne({_id:new ObjectId(req.user.id)},{$inc:{[`balance.main.${gateway}`]:Number(init.amount)},$set:{lastActiveAt:new Date()}});
        //await Deposit.insertOne({txn,user:req.user.username, amount:Number(init.amount), balanceType,createdAt:new Date(),updatedAt:new Date()})
        //await DepositInit.findOneAndDelete(initFilter);
        res.status(201).json({message:'deposit success', success:true});
    }catch(e) {next(e)}
}

export const getAllGatewayDepositFee = async (req, res,next) => {
    try{
        const admin = await Admin.findOne({role: 'admin'});
        let userLevel = admin.deposits.find(d=> d.level==req.user.level);
        res.status(200).json(userLevel.fee)
    }catch(e) {next(e)}
}
const getDepositFee = async (level,gateway,amount)=>{
    try{
        const admin = await Admin.findOne({role:'admin'});
        let c = admin.deposits.find(d=> d.level==level)?.[gateway]
        return Number((Number(amount)-(Number(amount)*Number(c)/100)).toFixed(3))
    }catch(e) {}
}
const getExtra = async (level,balanceType,gateway,amount)=>{
    try{
        const admin = await Admin.findOne({role:'admin'});
        let c=admin.deposits.find(d=>d.level==level)?.[balanceType]?.commission?.[gateway]
        return !c ? 0 : (Number(amount)*Number(c)/100).toFixed(3)
    }catch(e) {}
}

export const depositRequest = async (req,res,next) =>{
    const {txn,gateway,amount,ref} = req.body
    const screenshot = req.file;
    let io = socket.getIO()
    try{
        let user = await User.findOne({_id:new ObjectId(req.user.id)});
        if(!user.accesses.includes('deposit')) return res.status(401).json({error:'Don\'t have deposit permission',success:false});
        const data= {gateway,status:'PENDING',amount,ref:ref||'',user:req.user.username,createdAt:new Date(),updatedAt:new Date()}
        if(txn){
            let deposit = await Deposit.findOne({txn,gateway});
            if(deposit) return res.status(409).json({error:'txn already exist',success:false});
            data.txn=txn
        }
        if(screenshot){
            if(screenshot.length>5*1024*1024) return res.status(413).json({error:'max file size is 5MB',success:false});
            const base64 = screenshot.buffer.toString('base64');
            const dataUri = `data:${screenshot.mimetype};base64,${base64}`;
            let response = await cloudinary.uploader.upload(dataUri,{
                folder:'deposits',
                resource_type:'image',
                allowed_formats:['jpg','jpeg','png','webp']
            });
            data.screenshot=response.secure_url
        }
        await Deposit.insertOne(data)
        io.emit('added',{type:'deposit'})
        await SocketResponse.updateOne({admin:req.user.adminRef},{$inc:{['pendings.deposit']:1}})
        res.status(200).json({message:'wait for admin approval',success:true});
    }catch(e) {next(e)}
}

//admin
export const addBalanceByAdmin = async (req, res,next) => {
    const {id} = req.params
    const {amount,balanceType,gateway} = req.body;
    let errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=> err.msg).mapped()});
    if(!id|| isNaN(amount)) {return res.status(400).json({error:'Invalid Amount'});}
    if (!['topup','drive','mbank'].includes(balanceType)) return res.status(400).json({ error: 'Invalid balance type' });
    try{
        const user = await User.findOne({_id:new ObjectId(id)});
        if(!user) return res.status(404).json({ error: 'User not found' });
        let extra = await getExtra(user.level,balanceType,gateway,amount)
        await User.updateOne({_id:new ObjectId(id)},{$inc:{[`balance.${balanceType}`]:Number(amount)+parseFloat(extra)}});
        await Deposit.insertOne({txn:(new Date()).getTime().toString(16).toUpperCase(),gateway,user:user.username, amount:Number(amount), extra:parseFloat(extra), balanceType,status:'SUCCESS',createdAt:new Date(),updatedAt:new Date()});
        res.status(200).json({message:'deposit successfull' });
    }catch(e) {next(e)}
}

  //}
  //}
export const addBalanceByUser = async (req,res,next) =>{
    const {balanceType,gateway,amount} = req.body
    try{
        const user = await User.findOne({_id:new ObjectId(req.user.id)});
        if(!user.accesses.includes('deposit')) return res.status(401).json({error:'dont have deposit permission',success:false});
        let admin = await Admin.findOne({role:'admin'})
        let currentLevel = admin.deposits.find(l=>l.level==req.user.level)
        if(currentLevel[balanceType].min>Number(amount)||currentLevel[balanceType].max<Number(amount)) return res.status(422).json({error:`${balanceType} amount minimum ${currentLevel[balanceType].min} and maximum ${currentLevel[balanceType].max}`,success:false})
        let factAmount = user.balance.main[gateway]<Number(amount) ? user.balance.main[gateway] : Number(amount);
        let extra= await getExtra(req.user.level,balanceType,gateway,factAmount);
        await User.updateOne({_id:new ObjectId(req.user.id)},{$inc:{[`balance.${balanceType}`]:parseFloat(factAmount)+parseFloat(extra),[`balance.main.${gateway}`]:factAmount*(-1)},$set:{lastActiveAt:new Date()}});
        res.status(200).json({message:'refill success',success:false});
    }catch(e) {next(e)}
}
//admin
export const deductBalanceByAdmin = async (req, res,next) => {
    const {id} = req.params
    const {amount,balanceType} = req.body;
    let errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=> err.msg).mapped()});

    if(!id|| isNaN(amount)) {return res.status(400).json({ error: 'Invalid Amount' });}
    if(!['topup','drive','mbank'].includes(balanceType)) {return res.status(400).json({ error: 'Invalid balance type' });}
    try{
        const user = await User.findOne({_id:new ObjectId(id)});
        if(!user) return res.status(404).json({error:'user not found'});
        if(user.balance[balanceType]<Number(amount)) return res.status(422).json({error:'insufficient balance'});
        await User.updateOne({_id:new ObjectId(id)},{$inc:{[`balance.${balanceType}`]:(-1)*amount}});
        await Deposit.insertOne({txn:(new Date()).getTime().toString(16).toUpperCase(),user:user.username,balanceType,amount:amount*(-1),createdAt:new Date(),updatedAt:new Date()});
        res.status(200).json({message:'balance deducted' });
    }catch(e) {next(e)}
}

export const changeDepositStatus = async (req,res,next) =>{
    const {username,status,feedback} = req.body
    let io = socket.getIO()
    try{
        
        let user = await User.findOne({username})
        if(!user.verified) return res.status(422).json({error:'user not verified'});
        let {gateway,amount,txn}=await Deposit.findOneAndUpdate({_id:new ObjectId(req.params.id),status:'PENDING'},{$set:{status,feedback:feedback||'',updatedAt:new Date()}})
        let deductedAmount = getDepositFee(user.level,gateway,amount)
        let {socketId} = await SocketResponse.findOne({user:username})
        if(socketId) io.to(socketId).emit('user:status-changed',{title:`Deposit ${status}`,body:`TXN:${txn} Amount:${deductedAmount}`,url:`${process.env.CLIENT_URL}/deposit/history`});
        if(status=='SUCCESS') await User.findOneAndUpdate({username},{$inc:{[`balance.main.${gateway}`]:deductedAmount}})
        if(status=='FAILED') await SocketResponse.findOneAndUpdate({user:username},{$inc:{[`failed.deposit`]:1}});
     
        if(socketId&&status==='FAILED') io.to(socketId).emit('user:status-failed','deposit')
        
      //user[balanceType] += init.amount+extra
        res.status(200).json({message:'deposit status changed'});
    }catch(e) {next(e)}
}


export const withdraw/*transferBalance*/ = async (req, res, next) => {
    //const { username, 
    const {gateway,amount,ref} = req.body;
    //if(!userId || typeof amount!=='number') return res.status(400).json({error: 'Invalid input'});
    //const validTypes =['topup','drive','bank'];
    //if(!validTypes.includes(balanceType)) return res.status(400).json({message:'ব্যাল্যান্স টাইপ সঠিক নয়'})
    try{
      //const receiver = await User.findOneAndUpdate({username},{$inc:{[`balance.${balanceType}`]:Number(amount)}});
        let user = await User.findOne({_id:new ObjectId(req.user.id)});
        let balanceMain = Object.values(user.balance?.main|| {}).reduce((sum,val)=>sum+val,0) //user.balance.main[gateway]<amount? user.balance.main[gateway] : amount;
        if(balanceMain<Number(amount)) return res.status(400).json({error:'Insufficient Balance',success:false});
        let {bkash,dbbl,nagad} = user.balance.main
        let remaining = Number(amount)
        let newBkash = Math.max(0,bkash-remaining)
        remaining = Math.max(0,remaining-bkash);
        let newDbbl = Math.max(0,dbbl-remaining)
        remaining = Math.max(0,remaining-dbbl)
        let newNagad = Math.max(0,nagad-remaining);
        await User.findOneAndUpdate({_id:new ObjectId(req.user.id)},{$set:{['balance.main']:{bkash:newBkash,dbbl:newDbbl,nagad:newNagad}}})
        //await User.findOneAndUpdate({_id:new ObjectId(req.user.id)},[{$set:{[`balance.main.${gateway}`]:{$max:[0,{$subtract:[{$toDouble:[`$balance.main.${gateway}`]},parseInt(amount)]}]}}}]);

        const seconds = Math.floor((new Date()).getTime()/1000)
        const txn = `${req.user.id}${seconds.toString(16).toUpperCase()}`
        await Withdraw.insertOne({txn,user:req.user.username,gateway,amount:{bkash:bkash-newBkash,dbbl:dbbl-newDbbl,nagad:nagad-newNagad},ref, status:'PENDING', createdAt:new Date(),updatedAt:new Date()})
        res.status(200).json({message:`৳${amount} withdraw request sent`, success:true})
    }catch(e) {next(e)}
}

export const changeWithdrawStatus = async (req,res,next) =>{
    const {username,status,feedback} = req.body
    let io = socket.getIO()
    try{
        let {gateway,amount,txn} = await Withdraw.findOneAndUpdate({_id:new ObjectId(req.params.id)},{$set:{status,feedback:feedback||'',updatedAt:new Date()}})
        let {socketId} = await SocketResponse.findOne({user:username})
        if(status=='FAILED') {
            await User.findOneAndUpdate({username},{$inc:{[`balance.main.bkash`]:Number(amount.bkash),[`balance.main.dbbl`]:Number(amount.dbbl),[`balance.main.nagad`]:Number(amount.nagad),[`balance.main.upay`]:Number(amount.upay)}})
            await SocketResponse.findOneAndUpdate({user:username},{$inc:{[`failed.withdraw`]:1}});
        }
        if(socketId) io.to(socketId).emit('user:status-changed',{title:`Withdraw ${status}`,body:`TXN:${txn} Amount:${amount}`,url:`${process.env.CLIENT_URL}/withdraw/history`});
        if(socketId&&status==='FAILED') io.to(socketId).emit('user:status-failed','withdraw')
        res.status(200).json({message:'withdraw status changed'});
    }catch(e) {next(e)}
}


/*export const deductBalance = async (req, res,next) => {
    const {userId,amount,balanceType} = req.body;
    if(!userId|| isNaN(amount)) return res.status(400).json({error:'Invalid Amount'});
    //return res.status(400).json({ error: 'Invalid input' });
  //}
  //const validTypes = ['topup','drive', 'mbank'];
    if(!['topup','drive','bank'].includes(balanceType)) return res.status(400).json({ error: 'Invalid balance type' });
    //return res.status(400).json({ error: 'Invalid balance type' });
   try{
    const user = await User.findById(userId);
    if(!user) return res.status(404).json({ error: 'User not found' });
    if(user[balanceType]<amount) return res.status(422).json({error:'insufficient balance'})// save
    const newBalance = user[balanceType] -= amount;
    await user.save();
    res.status(200).json({ newBalance });
  }catch(e) {next(e)}
}*/


//call by admin
export const getDepositInit =async (req, res,next) => {
    let {status,txn,user,gateway,from,to,limit,page} = req.query
    let filter = {/*status:'PENDING'*/}
    if(status) filter.status = status
    if(user) filter.user = user;
    if(gateway) filter.gateway = gateway;
    if(txn) filter.txn = txn;
    if(from) filter.createdAt={$gte:from}
    if(to) filter.createdAt={$lte:to}
    if(from&&to) filter.createdAt={$gte:from,$lte:to}
    let queryLimit = parseInt(limit) ||20
    let currentPage = parseInt(page) ||1
    try{
        let total = await DepositInit.countDocuments(filter)// )
        let depositInits = await DepositInit.find(filter).skip(queryLimit*(currentPage-1)).limit(queryLimit).sort({createdAt:-1}).toArray();
        if(!depositInits) return res.status(404).json({error:'Deposit not found'})
        res.status(200).json({depositInits,pagination:{totalPage:Math.ceil(total/queryLimit),currentPage}});
    }catch(e) {next(e)}  
}

export const getDepositHistoryByAdmin = async (req, res, next) => {
    const {status,txn,user,type,gateway,from,to,limit,page} = req.query;
    const filter = {};
    if(status) filter.status=status
    if(txn) filter.txn=txn
    if(user) filter.user=user
    if(type) filter.balanceType=type
    if(gateway) filter.gateway =gateway
    if(from) filter.createdAt={$gte:from}
    if(to) filter.createdAt={$lte:to}
    if(from&&to) filter.createdAt={$gte:from,$lte:to}
    let queryLimit=parseInt(limit) || 20
    let currentPage = parseInt(page) || 1;
    try{
        const total = await Deposit.countDocuments(filter);
        const deposits = await Deposit.find(filter,{projection:{__v:0}}).skip(queryLimit*(currentPage-1)).limit(queryLimit).sort({ createdAt: -1 }).toArray();
        if(!deposits) {return res.status(404).json({ message: 'No deposits found' });}
        res.status(200).json({deposits,pagination:{totalPage:Math.ceil(total/queryLimit),currentPage,limit:queryLimit}});
    }catch(e) {next(e)}
}

export const getWithdrawHistoryByAdmin = async (req, res, next) => {
    const {status,txn,user,type,gateway,from,to,limit,page} = req.query;
    const filter = {};
    if(status) filter.status=status.toUpperCase()
    if(txn) filter.txn=txn
    if(user) filter.user=user
    //if(type) filter.balanceType=type
    if(gateway) filter.gateway =gateway
    if(from) filter.createdAt={$gte:from}
    if(to) filter.createdAt={$lte:to}
    if(from&&to) filter.createdAt={$gte:from,$lte:to}
    let queryLimit=parseInt(limit) || 20
    let currentPage = parseInt(page) || 1;
    try{
        const total = await Withdraw.countDocuments(filter);
        const withdraws = await Withdraw.find(filter,{projection:{__v:0}}).skip(queryLimit*(currentPage-1)).limit(queryLimit).sort({ createdAt: -1 }).toArray();
        if(!withdraws) {return res.status(404).json({ message: 'No deposits found' });}
        res.status(200).json({withdraws,pagination:{totalPage:Math.ceil(total/queryLimit),currentPage,limit:queryLimit}});
    }catch(e) {next(e)}
}


//call by driver,admin
export const depositInit =async (req, res,next) => {
    let errors = validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=> err.msg).mapped()});
    const {txn,gateway,amount,user} = req.body;
    try{
        await DepositInit.insertOne({txn,gateway,amount,user,status:'PENDING',message:'',createdAt:new Date(),updatedAt:new Date()});
        res.status(201).json({mesage:'txn added',success:true});
    }catch(e) {next(e)}  
}



export const getDepositHistoryByUser = async (req, res, next) => {
    const {/*id,*/search,page} = req.query;
    const s = new RegExp(search,'i')
    const filter ={user:req.user.username,$or:[{status:{$regex:s}},{txn:{$regex:s}},{gateway:{$regex:s}},{amount:{$regex:s}},{createdAt:{$regex:s}}]}
    const currentPage = parseInt(page)||1;
  //if(txn) filter.txn =txn;
  //filter.user=id
    try{
        await User.findOneAndUpdate({_id:new ObjectId(req.user.id)},{$set:{lastActiveAt:new Date()}});
        const total = await Deposit.countDocuments(filter);
        const deposits = await /*Transaction*/Deposit.find(filter,{projection:{__v:0}}).skip(20*(currentPage-1)).limit(20).sort({updatedAt:-1}).toArray();
        if(!deposits) {return res.status(404).json({error:'deposit history not found',success:false});}
        res.status(200).json({deposits,pagination:{totalPage:Math.ceil(total.length/20),currentPage}});
    }catch(e) {next(e)}
}
export const getWithdrawHistoryByUser = async (req,res,next) =>{
    const {search,page} = req.query;
    const s = new RegExp(search,'i')
    const filter ={user:req.user.username,$or:[{status:{$regex:s}},{txn:{$regex:s}},{gateway:{$regex:s}},{amount:{$regex:s}},{createdAt:{$regex:s}}]}
    const currentPage = parseInt(page)||1;
    try{
        const withdraws = await Withdraw.find(filter,{projection:{user:0,__v:0}}).skip(20*(currentPage-1)).limit(20).sort({updatedAt:-1}).toArray();
        let total = await Withdraw.countDocuments(filter);
        if(!withdraws) {return res.status(404).json({error:'withdraw history not found',success:false});}
    res.status(200).json({withdraws,pagination:{totalPage:Math.ceil(total.length/20),currentPage}});
    }catch(e) {next(e)}
}

//admin
export const deleteDepositHistory = async (req,res,next) =>{
    try{
        let result = await DepositInit.deleteMany({_id:{$in:req.body.map(id=>new ObjectId(id))}},{returnDocument:'after'});
        res.status(200).json({message:`${result.deletedCount} transactions deleted`})
    }catch(e) {next(e)}
}
export const getBalanceSummary = async (req, res) => {
    try{
    const result = await User.aggregate([
      {
        $group: {
          _id: null,
          totalTopupBalance: { $sum: "$balance.topup" },
          totalDriveBalance:{$sum:"$balance.drive"},
          totalBankBalance: { $sum: "$balance.bank" }
        }
      }
    ]);

    const summary = result[0] || {
      totalTopupBalance: 0,
      totalDriveBalance: 0,
      totalBankBalance: 0
    };
    res.status(200).json(summary);
  }catch(e) {res.status(500).json({ error: 'Server error' });}  
}


export const getTodayDepositSummary = async (req, res) => {
    try{
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const result = await Deposit.aggregate([
      {$match: {updatedAt: {$gte: startOfDay,$lte: endOfDay}}},
      {
        $group: {
          _id: null,
          todayTopupDeposit: { $sum: "$balance.topup" },
          todayDriveDeposit: {$sum:"$balance.drive"},
          todayBankDeposit: { $sum: "$balance.bank" }
        }
      }
    ]);
    const total = result[0] || {
      todayTopupDeposit: 0,
      todayDriveDeposit: 0,
      todayBankDeposit: 0
    };
    res.status(200).json(total);
  }catch(e) {res.status(500).json({error:'server error'});}
}
const bkashHeader = async ()=>{
    let admin = await Admin.findOne({role:'admin'});
    let bkashAPIKey = admin.pgws.find(pgw=> pgw.name=='bkash').apiKey
    return {
        'Content-Type':'application/json',
        Accept:'application/json',
        authorization:globals.get('id_token'),
        'x-app-key':bkashAPIKey
    }
}
export const bkashPaymentCreate = async (req,res) =>{
    const {amount} = req.body;
    try{
        const {data} = await axios.post(process.env.BKASH_CREATE_PAYMENT_URL,{headers:await bkashHeader()},{
          mode:'0011',
          payerReference:' ',
          callbackURL:`${process.env.SERVER}/api/user/deposit/payment/bkash/callback`,
          amount,
          currency:'BDT',
          intent:'sale',
          merchantInvoiceNumber:`inv${uuidv4().substring(0,8)}`,
        });
        res.status(200).json({bkashURL:data.bkashURL})
    }catch(e) {res.status(401).json({error:e.message,success:false})}
}
  
  
export const bkashCallback = async (req,res) =>{
    const {paymentID,status} = req.query;
    if(status=='cancel'||status=='failure') return res.redirect(`${process.env.CLIENT_URL}/error?message=${status}`)
    if(status=='success'){
      try{
        const {data} = await axios.post(process.env.BKASH_EXECUTE_PAYMENT_URL,{paymentID},{headers:await bkashHeader()});
        if(data&&data.statusCode=='0000'){
          await Deposit.insertOne({txn:data.trxID,amount:data.amount,gateway:'bkash',createdAt:data.paymentExecuteTime,status:'SUCCESS',user:req.user.username});
          return res.redirect(`${process.env.CLIENT_URL}/success?message=${data.trxID}`)
        }
        res.redirect(`${process.env.CLIENT_URL}/error?message=${data.statusMessage}`)
      }catch(e) {res.redirect(`${process.env.CLIENT_URL}/error?message=${e.message}`)}
    }
}
export const sslc = async (req,res) =>{
    const {amount,customerName,email,phone} = req.body
    const admin =await Admin.findOne({role:'admin'});
    const {merchantID,apiPassword} = admin.pgws?.find(pgw=> pgw.name=='sslcommerz');
    const user = await User.findOne({_id:new ObjectId(req.user.id)})
    if(!user) return res.status(404).json({error:'User not found',success:false})
    /*function* generateID() {
        let i = 0;
        while(true){
            yield i++;
        }
    }*/
    const seconds = Math.floor((new Date()).getTime()/1000);
    const txn = (`${user._id}${(seconds).toString(16)}`).toUpperCase() //= req.body;

    const data = {
        total_amount: amount,
        currency: 'BDT',
        tran_id: txn,
        success_url: `${process.env.SERVER_URL}/api/user/deposit/payment/sslcommerz/success/${req.user.id}`,
        fail_url: `${process.env.SERVER_URL}/api/user/deposit/payment/sslcommerz/fail`,
        cancel_url: `${process.env.SERVER_URL}/api/user/deposit/payment/sslcommerz/cancel`,
        ipn_url: `${process.env.SERVER_URL}/api/user/deposit/payment/sslcommerz/ipn`,
        shipping_method: 'No',
        product_name: 'Test Product',
        product_category: 'Test Category',
        product_profile: 'general',
        cus_name: 'Cus Name',
        cus_email: 'zamanasad4992@gmail.com',
        cus_add1: 'Jashore',
        cus_phone: '+8801875554992',
        cus_city: 'Jashore',
        cus_country: 'Bangladesh',
    };
    const sslcz = new SSLCommerzPayment(merchantID, apiPassword, false);
    try{
        const apiResponse = await sslcz.init(data);
        if(apiResponse?.GatewayPageURL) return res.status(200).json({url:apiResponse.GatewayPageURL})
        res.status(500).json({error:'payment initiation failed',success:false})
    }catch(e) {res.status(500).json({error:e.message,success:false})}
};

export const sslcSuccess = async (req,res,next) =>{
    const {tran_id,amount,card_type} = req.body;
    //let balanceType= req.params.type
    let gateway = card_type.split('-')[1].slice(0,6).trim().toLowerCase()
    try{
        //let extra=await getExtra(req.user.level,balanceType,gateway,amount);
        await Deposit.insertOne({txn:tran_id,amount,/*extra,balanceType,*/gateway,status:'SUCCESS',user:req.user.username,createdAt:new Date(),updatedAt:new Date()});
        await User.findOneAndUpdate({_id:new ObjectId(req.params.id)},{$inc:{[`balance.main.${gateway}`]:amount}});
        res.status(200).json({message:'payment success', success:true})
    }catch(e) {next(e)} 
    
}
export const sslcFail = async (req,res,next) =>{
    try{
        return res.status(500).json({error:'sslc failed'});
    }catch(e) {next(e)}
}
export const sslcCancel = (req,res) => res.status(200).json({message:'cancel'}) 
export const sslcIPN = (req,res) => res.status(200).json({message:'ipm'})//await sender.save();
      //receiver[balanceType] += amount;
      //await receiver.save();
      //sender[balanceType] -= amount;
