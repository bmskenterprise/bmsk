import {createRequire} from 'module';const require = createRequire(import.meta.url);
import {ObjectId,} from 'mongodb'
import dotenv from 'dotenv';dotenv.config() ;
const UAParser = require('ua-parser-js');
import bcrypt from 'bcrypt';
import {v4 as uuidv4} from 'uuid'
import {validationResult} from 'express-validator'
import jwt from 'jsonwebtoken';
import connectDB from '../config/db.js';
//import Drive from '../models/drive.model.js';
//import Regular from '../models/regular.model.js';
//import DriveHit from '../models/driveHit.model.js';
//import User from '../models/user.model.js'
//import DepositInit from '../models/depositInit.model.js'
//import Deposit from '../models/deposit.model.js'
//import Topup from '../models/topup.model.js'
//import Bank from '../models/bank.model.js'
//import SocketResponse from '../models/socketResponse.model.js'
//import Notice from '../models/notice.model.js'
//import APIRequest from '../models/APIRequest.model.js'
//import APIUser from '../models/apiUser.model.js'
//import Feedback from '../models/feedback.model.js'
import emailWithNodemailer from '../utils/email.js'
import createJWT from '../config/jwt.js';
import socket from '../config/socket.js';
import cacheObject from '../utils/cacheStore.js'
//import { create } from 'domain';
let cacheData = cacheObject.getCache()
let Admin,User,DepositInit,Drive,Regular,DriveHit,Feedback,Bill,Bank,APIUser,APIRequest,Topup,Notice,SocketResponse 
//import getRecoveryToken from '../utils/RecoveryToken.js'

(async () =>{
    try{
        let db = await connectDB();
        Admin = db.collection('admins');
        DepositInit = db.collection('depositinits')
        Drive = db.collection('drives')
        Regular = db.collection('regulars')
        DriveHit = db.collection('drivehits')
        Topup = db.collection('topups')
        Bill = db.collection('bills');
        Feedback = db.collection('feedbacks')
        Bank = db.collection('banks')
        User = db.collection('users')
        APIUser = db.collection('apiusers')
        Notice = db.collection('notices')
        SocketResponse = db.collection('socketresponses')
        APIRequest = db.collection('apirequests')
    }catch(e){console.error(e);}
})()
      
export const authenticateAdmin =async (req, res, next) =>{
    try{//console.log('req.admin')
        let appData = await Admin.findOne({role:'admin'},{projection:{avatar:1,mbanks:1,userLevels:1,methods:1/*,email:0,role:0,notices:0,__v:0*/}})
        if(!appData) throw new Error('Server Issue')
        res.status(200).json({admin:req.admin,appData})
    }catch(e) {next(e)}
  //res.json({message: "Protected route access granted", admin: req.admin,});
};

/*export const getAppData = async (req,res,next) =>{
    try{
        let admin = await Admin.findOne({role:'admin'},{username:0,password:0,pin:0,email:0,role:0,_V:0})
        if(!admin) throw new Error('Server Issue')
        res.status(200).json(admin)
    }catch(e) {next(e)}//   
}*/

export const register = async (req, res,next) => {
    const {username,password,pin,access} = req.body
    try {
        let hashPassword = await bcrypt.hash(password,11)
        let hashPIN = await bcrypt.hash(pin,11)
        await Admin.insertOne({username,password:hashPassword,pin:hashPIN,role:'subadmin',access,createdAt:new Date(),updatedAt:new Date()})
        const subadmins = await Admin.find({role:'subadmin'}).toArray()
        res.status(200).json({subadmins})
    }catch(e) {next(e)}
}


export const adminLogin = async (req, res, next) => {
    const {username, password } = req.body;
    try {
        const admin = await Admin.findOne({username});
        if(!admin) return res.status(401).json({error:'Wrong Credential'})
        let matched=await bcrypt.compare(password,admin.password);
        if(!matched) return res.status(401).json({error: 'Wrong Credential'});
        let token = createJWT({id:admin._id,username,role:admin.role,accesses:admin.accesses}, process.env.JWT_ADMIN_AUTH_SECRET, process.env.JWT_ADMIN_AUTH_EXPIRES_IN)
        let parser = new UAParser(req.headers['x-user-agent']).getResult()
        /*admin.status = true;
        admin.loginAt = Date.now();
        admin.device = [parser.os.name,parser.browser.name]*/
        await Admin.findOneAndUpdate({username},{$set:{/*status:true,*/loginStatus:true ,device:[parser.os.name,parser.browser.name]}});//console.log(admin,token)
        res.cookie('admin-token',token,{
                httpOnly:false,
                secure:true,
                sameSite:'none',
                maxAge:24*60*60*1000
            })
         return res.status(200).json({message: 'login success'});
        //res.status(400).json({success: false, message:'wrong credentials'})
    }catch(e) {next(e);}  
}


export const getSubAdmins = async (req,res,next) =>{
    try{
        let admins = await Admin.find({role:'subadmin'}).toArray()
        if(!admins) return res.status(404).json({error:'No subadmins found'})
        return res.status(200).json(admins)
    }catch(e){next(e)}
}

export const addSubAdmin = async (req,res,next) =>{
    const {username,phone,email,nid,password,pin,accesses} = req.body;
    let errors = validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=> err.msg).mapped()})
    try{
        const exist = await Admin.findOne({username})
        if(exist) return res.status(409).json({error:'username already exist'})
        const hashedPIN = await bcrypt.hash(pin,11)
        const hashedPassword = await bcrypt.hash(password,11)
        await Admin.insertOne({username,phone,email,nid,password:hashedPassword,pin:hashedPIN,role:'subadmin',accesses,device:['',''],status:false,loginStatus:false,createdAt:new Date(),updatedAt:new Date()})
        const admins = await Admin.find({role:'subadmin'}).toArray();
        res.status(201).json({admins,message:'subadmin added'});
    }catch(e) {next(e)}
}

export const editSubAdmin = async (req,res,next) =>{
    const {username,phone,email,nid,password,pin} = req.body
    if(!username&&!phone&&!email&&!nid&&!password&&!pin) return res.status(400).json({error:'No data to update'})
    const updated={};
    try{
        let admin= await Admin.findOne({_id:new ObjectId(req.params.id)});
        if(username&&admin.username!=username){
            let exist= await Admin.findOne({username})
            if(exist) return res.status(409).json({error:'username already exist'})
            updated.username=username
        }
        if(password){
            let hashedPassword=await bcrypt.hash(password,11);
            updated.password=hashedPassword
        }
        if(pin){
            let hashedPIN = await bcrypt.hash(pin,11);
            updated.pin=hashedPIN
        }
        await Admin.findOneAndUpdate({_id:new ObjectId(req.params.id)},{$set:{updated}});
        res.status(200).json({message:'updated successfully'})
    }catch(e){next(e)}
}
export const editSubAdminAccess = async (req,res,next) =>{
    const {accesses} = req.body;
    try{
        if(!Array.isArray(accesses)) return res.status(400).json({error:'data is not an array'})
        await Admin.findOneAndUpdate({_id:new ObjectId(req.params.id)},{$set:{accesses,status:false}})
        res.status(200).json({message:'access updated'})
    }catch(e){next(e)}
}
export const toggleSubAdminStatus = async (req,res,next) =>{
    try{
        await Admin.findOneAndUpdate({_id:new ObjectId(req.params.id)},{$set:{status:req.body.status}})
        const admins = await Admin.find({role:'subadmin'}).toArray();
        res.status(200).json({admins,message:'admin status updated'})
    }catch(e) {next(e)}
}

/*export const editSubAdmin = async (req,res,next) =>{
    let errors = validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=> err.msg).mapped()})
    try{
        let admins = await Admin.find({role:'subadmin'});
        res.status(200).json(admins);
    }catch(err) {next(err)}
}*/
export const deleteSubAdmin = async (req,res,next) =>{
    try{
        await Admin.findOneAndDelete({_id:new ObjectId(req.params.id)})
        res.status(200).json({message:'Sub Admin deleted' })
    }catch(e) {next(e)}
}
export const changeSuperAdminPassword = async (req, res, next) => {
    const {oldPassword,password} = req.body;
    try {
        let admin = await Admin.findOne({_id:new ObjectId(req.admin.id)});
        if(!admin) return res.status(404).json({success:false,error:'Admin not found'})
        if(!(await bcrypt.compare(oldPassword,admin.password))) return res.status(400).json({success:false,error:'Old password is incorrect'})
            let salt = await bcrypt.genSalt(10);
            let hashed = await bcrypt.hash(password,salt);
            //admin.password = hash;
            await Admin.findOneAndUpdate({_id:new ObjectId(req.admin.id)},{$set:{password:hashed}});
            return res.status(200).json({success:true,message:'Password changed successfully'})
    }catch(e) {next(e)}
}


export const changeSuperAdminPIN = async (req, res, next) => {
    const {oldPIN,pin} = req.body;
    try {
        let admin = await Admin.findOne({role:'admin'}/*{_id:req.admin.id}*/);
        if(!admin) return res.status(404).json({success:false,error:'Admin not found'})
        if(!(await bcrypt.compare(oldPIN,admin.pin))) return res.status(400).json({success:false,error:'Old PIN is incorrect'})
            let salt = await bcrypt.genSalt(10);
            let hashed = await bcrypt.hash(pin,salt);
            //admin.pin = hash;
            await Admin.findOneAndUpdate({_id:new ObjectId(req.admin.id)},{$set:{pin:hashed}});
            return res.status(200).json({success:true,message:'PIN changed successfully'})
    }catch(e) {next(e)}  
}

export const initRecovery = async (req,res,next) =>{
    try{
        if(!req.params.token) return res.redirect('/')
        let decoded = jwt.verify(req.params.token,process.env.RECOVERY_SECRET)
        if(!decoded) return res.status(401).json({error:'token invalid or expired'})
        res.status(200).json({message:'ok'});
    }catch(e){next(e)/*res.redirect('/')*/}
}
export const resetSuperAdminPassword = async (req,res,next) =>{
    const {password,token} = req.body
    let errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=> err.msg).mapped()})
    try{
        let decoded = jwt.verify(token,process.env.RECOVERY_SECRET)
        if(!decoded) return res.status(401).json({error:'token invalid or expired'})
        let hashed = await bcrypt.hash(password,11)
        await Admin.findOneAndUpdate({role:'admin'},{$set:{password:hashed}})
        res.status(204).json({message:'password reseted'})
    }catch(e) {next(e)}
}  
export const resetSuperAdminPIN = async (req,res,next) =>{
    const {pin,token} = req.body
    let errors = validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=> err.msg).mapped()})
    try{
        const hashed = await bcrypt.hash(pin,11)
        let decoded = jwt.verify(token,process.env.RECOVERY_SECRET)
        if(decoded) return res.status(401).json({error:'token invalid or expired'})
        await Admin.findOneAndUpdate({role:'admin'},{$set:{pin:hashed}})
        res.status(204).json({message:'pin reseted'})
    }catch(e) {next(e)}
}
export const sendCredentialRecoveryEmail = async (req,res,next) =>{
    try{
        let recoveryToken= createJWT({id:(new Date()).getTime().toString()},process.env.RECOVERY_SECRET,process.env.RECOVERY_EXPIRES_IN)
        await emailWithNodemailer({
            email:process.env.SMTP_USERNAME,
            subject:'Credential Recovery',
            html:`<h5>tannimtelecom.shop</h5><p>Click the link below to recover your credential</p><p>The links is valid for 2 minutes</p><a href=${process.env.CLIENT_URL}/recover-${req.params.credential}/${recoveryToken}>${process.env.CLIENT_URL}/recover-password/${recoveryToken}</a>`
        })
    }catch(e){next(e)}
}
/*export const sendPINRecoveryEmail = async (req,res,next) =>{
    try{
        let recoveryToken= createJWT({id:(new Date().getTime()).toString()},process.env.RECOVERY_SECRET,process.env.RECOVERY_EXPIRES_IN)
        await emailWithNodemailer({
            email:process.env.SMTP_USERNAME,
            subject:'Credential Recovery',
            html:`<h5>tannimtelecom.shop</h5><p>Click the link below to recover your credential</p><p>The links is valid for 2 minutes</p><a href=${process.env.CLIENT_URL}/recover-pin/${recoveryToken}>${process.env.CLIENT_URL}/recover-pin/${recoveryToken}</a>`
        })
    }catch(err){next(err)}
}*/
//admin
export const resetSubAdminPassword = async (req,res,next) =>{
    const {password} = req.body;
    let errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=> err.msg).mapped()});
    try{
        let hashed = await bcrypt.hash(password,11)
        await Admin.findOneAndUpdate({_id:new ObjectId(req.params.id)},{$set:{password:hashed,status:false}});
        res.status(200).json({message:'Password reset successfully'})
    }catch(e) {next(e)}
}

//admin
export const resetSubAdminPIN = async (req,res,next) =>{
    const {pin} = req.body;
    let errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=> err.msg).mapped()});
    try{
        let hashed= await bcrypt.hash(pin,11)
        //let matched= await bcrypt.compare(req.headers['x-admin-pin'], admin.pin)
        await Admin.findOneAndUpdate({_id:new ObjectId(req.params.id)},{$set:{pin:hashed,status:false}});
        res.status(200).json({message:'Pin reset successfully'})
    }catch(e) {next(e)}
}

//admin
export const resetUserPassword = async (req,res,next) =>{
    const {password} = req.body;
    let errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=> err.msg).mapped()});
    try{
        /*let matched= await bcrypt.compare(req.headers['x-admin-pin'], admin.pin)
        if(!matched) return res.status(401).json({error:'admin pin doesnt matched'})*/
        let hashed= await bcrypt.hash(password,11)
        await User.findOneAndUpdate({_id:new ObjectId(req.params.id)},{$set:{password:hashed}});
        res.status(200).json({message:'Password reset successfully'})
    }catch(e) {next(e)}
}

//admin
export const resetUserPIN = async (req,res,next) =>{
    const {pin} = req.body;
    let errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=> err.msg).mapped()});
    try{
        let hashed= await bcrypt.hash(pin,11)
        await User.findOneAndUpdate({_id:new ObjectId(req.params.id)},{$set:{pin:hashed}});
        res.status(200).json({message:'Pin reset successfully'})
    }catch(e) {next(e)}
}

export const toggleUserNewDevice = async (req,res,next) =>{
    try{
        let {user,domain,apiType} = await User.findOneAndUpdate({_id:new ObjectId(req.params.id)},{$set:{'device.lock':req.body.isDeviceLock}});
        res.status(200).json({message:'API Denied'});
    }catch(e) {next(e)} 
}
export const removeUserDevice = async (req,res,next) =>{
    try{
        await User.UpdateOne({_id:new ObjectId(req.params.id)},{$pull:{'device.allowed':req.body.deviceId}})
        res.status(200).json({message:'device removed'})
    }catch(e) {next(e)} 
}
export const deleteUserByAdmin = async (req,res,next) =>{
    try{
        let {username} = await User.findOne({_id:new ObjectId(req.params.id)})
        let {socketId} = await SocketResponse.findOne({user:username})
        if(socketId) io.to(socketId).emit('deleted',null)
        await User.deleteOne({_id:new ObjectId(req.params.id)});
        await SocketResponse.deleteOne({user:username}) //return res.status(404).json({ error: 'Admin not found' });*/
        res.status(200).json({message:'user deleted'})
    }catch(e) {next(e)}
}
           
           
export const depositInitByAdmin = async (req,res,next) =>{
    let errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=> err.msg).mapped()});
    try{
        /*let matched = await bcrypt.compare(req.headers['x-admin-pin'], admin.pin)
        if(!matched) return res.status(401).json({error:'admin pin doesnt matched'})*/
        await DepositInit.insertOne({...req.body,createdAt:new Date(),updatedAt:new Date()})
        res.status(201).json({message:'txn added'})
    }catch(e) {next(e)}
}
export const deleteDepositInit = async (req,res,next) =>{
    let errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=> err.msg).mapped()});
    try{
        /*let matched = await bcrypt.compare(req.headers['x-admin-pin'],admin.pin)
        if(!matched) return res.statrus(401).json({error:'admin pin doesnt matched'})*/
        await DepositInit.findOneAndDelete({_id:new ObjectId(req.params.id)})
        res.status(200).json({message:'deleted'})
    }catch(e) {next(e)}
}

export const access = async (req, res, next) => {
    try {
        /*const accessSetting = await Admin.findOne({_id:req.admin.id},{_id:0, username:0, password:0,pin:0});
        if(!accessSetting) {return res.status(404).json({error: 'Access not found'});}*/
        if(req.headers['x-device-id'] && !(await Admin.findOne({deviceId:req.headers['x-device-id']}))) return res.redirect('/');
        let admins=await Admin.find({deviceId:null}).toArray()
        if(!admins.length) return res.redirect('/');
        const {userAgent} = req.body;
        const parser = new UAParser(userAgent);
        const result = parser.getResult();

        socket.emit('admin',admins)
    }catch(e) {next(e)}
}


export const getMBanks = async (req,res,next) =>{
    try{
        const admin = await Admin.findOne({role:'admin'});
        res.status(200).json(admin.mbanks)
    }catch(e) {next(e)}
}

export const addMBank = async (req,res,next)=>{
    const {name,icon} = req.body
    try{
        let admin = await Admin.findOne({role:'admin'})
        if(admin.mbanks.find(b=>b.name==name)) return res.status(409).json({error:'mobile bank already exist'})
        let result =await Admin.findOneAndUpdate({role:'admin'},{$push:{mbanks:{_id:new ObjectId(),name,icon,account:'',active:true}}},{returnDocument:'after'})
        
        res.status(200).json({mbanks:result.mbanks,message:'mbank added'});
    }catch(e) {next(e)}
}
export const updateMBankList = async (req,res,next) =>{
    try{
        let updatedMBanks = req.body
        if(!updatedMBanks||!updatedMBanks.length) return res.status(400).json({error:'No Updates Provided'})
        const bulkOps = updatedMBanks.map(bank=> {
            const updateFields = {}
            if(bank.account!=undefined) updateFields['mbanks.$.account'] = bank.account
            if(bank.active!=undefined) updateFields['mbanks.$.active'] = bank.active
            return {updateOne:{filter:{'mbanks._id':new ObjectId(bank._id)}, update:{$set:updateFields}}}
        })
        await Admin.bulkWrite(bulkOps)
        let admin= await Admin.findOne({role:'admin'})
        res.status(200).json({mbanks:admin.mbanks,message:'mbank updated'})
    }catch(e) {next(e)}
}


export const getDepositRates = async (req,res,next) => {
    try {
        let admin = await Admin.findOne({role:'admin'});
        if(!admin) return res.status(404).json({error: 'Admin not found'});
        res.status(200).json(admin.deposits);
    }catch(e) {next(e)}
}

export const updateDepositRates= async (req, res,next) => {
    try{
        if(!Array.isArray(req.body)) return res.status(400).json({error:"Deposits array must be an array of objects" });
    const result = await Admin.findOneAndUpdate({role:'admin'},{$set:{deposits:req.body}},{returnDocument:'after'})
        res.status(200).json(result.value?.deposits);
    }catch(e) {next(e)}
}




/*export const depositAccess = async (req, res) => {
  try {
    const { topupBalance, bankBalance } = req.body;
    const updateFields = {};
    if (topupBalance) {
      for (const key in topupBalance) {updateFields[`balance.topup.${key}`] = balance.topup[key];}
    }
    if (bankBalance) {
      for (const key in bankBalance) {updateFields[`balance.bank.${key}`] = balance.bank[key];}
    }
    const updated = await Admin.findOneAndUpdate({role:'admin'},{$set:updateFields},{new:true});
      
    res.json(updated);
  }catch(e) {next(e)}// (err) {
    //res.status(500).json({ error: e.message });
};*/




export const addUser = async (req, res,next) => {
    let errors = validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=>err.msg).mapped()});
    const {level,username,phone,fullname,email,password,pin,nid,accesses} = req.body;
    try {
        const exist = await User.findOne({username})
        if(exist) return res.status(409).json({error:'user already exist '})
        let hashedPassword = await bcrypt.hash(password,11)
        let hashedPIN = await bcrypt.hash(pin,11)
        await User.insertOne({level,username,phone,fullname,email,password:hashedPassword,pin:hashedPIN,nid,accesses,balance:{main:{bkash:0,dbbl:0,nagad:0,upay:0},topup:0,drive:0,mbank:0},status:accesses.length>0?'ACTIVE':'INACTIVE',lastActiveAt:null,lockUntil:null,failedLoginAttempts:0,createdAt:new Date(),updatedAt:new Date()})
        res.status(201).json({message:'user created'})
    }catch(e) {next(e)}
}
export const toggleUserStatus = async (req,res,next) =>{
    try{
        await User.UpdateOne({_id:new ObjectId(req.params.id)},{$set:{verified:req.params.verified}})
        res.status(200).json({message:'updated successfully'})
    }catch(e) {next(e)}
}
//admin
export const getUsersByAdmin = async (req, res, next) => {
    const {user,status,from,to,limit,page} = req.query;
    let filter = {};
    if(['platinum','gold','silver','distributor','sr','retailer'].includes(user)) filter.level = user;
    else if(user) filter.username = user;
    if(status) filter.verified = status=='verified'
    if(from) filter.updatedAt = {$gte:from}
    if(to) filter.updatedAt= {$lte:to}
    if(from&&to) filter.updatedAt={$gte:from,$lte:to}
    let currentPage = parseInt(page)|| 1;
    let queryLimit = parseInt(limit)|| 20;
    try {
        const totalUsers = await User.countDocuments(filter);
        const users = await User.find(filter,{projection:{password:0,pin:0,failedLoginAttempts:0,lockUntil:0,__v:0}}).skip((currentPage-1)*queryLimit).limit(queryLimit).sort({createdAt:-1}).toArray();
        if(!users) return res.status(404).json({error:'users not found'})
        res.status(200).json({users,pagination:{currentPage,totalPages:Math.ceil(totalUsers/queryLimit),}});
    }catch(e) {next(e)}  
}


export const getUserByAdmin = async (req,res,next) =>{
    try{
        let user = await User.findOne({_id:new ObjectId(req.params.id)},{projection:{_id:1,username:1,level:1,phone:1,fullname:1,email:1,nid:1,device:1,createdAt:1,accesses:1,regFeeRef:1}})
        if(!user) return res.status(404).json({error:'user not found'});
        res.status(200).json(user)
    }catch(e) {next(e)}
}

export const editUserAccess = async (req,res,next) =>{
    let io = socket.getIO()
    try{
        let {username} = await User.findOneAndUpdate({_id:new ObjectId(req.params.id)},{$set:{accesses:req.body/*,status:req.body.length>0?'ACTIVE':'INACTIVE'*/}})
        const {socketId} = await SocketResponse.findOne({user:username})
        if(socketId) io.to(socketId).emit('access-modified',null)
        res.status(200).json({message:'user access updated'})
    }catch(e) {next(e)}
}


export const getSlideImages =async (req,res,next) =>{
    try{
        const admin = await Admin.findOne({role:'admin'});
        res.status(200).json(admin.slideImages)
    }catch(e) {next(e)}
}

export const addSlideImageLink = async (req, res,next) => {
    const {link} = req.body;
    try{
        let result=await Admin.findOneAndUpdate({role:'admin'},{$push:{slideImages:{_id:new ObjectId(),link,active:true}}},{returnDocument:'after'})
        res.status(200).json({slides:result.slideImages,message:'slide image added'});
    }catch(e) {next(e)}
}
/*export const editSlideImageLink = async (req, res,next) => {
    const {active link,newLink,active} = req.body;
    try {
        if (!admin) return res.status(404).json({ error: 'Admin not found' });

        const image = admin.slideImages.find(img => img.link === link);
        if (!image) return res.status(404).json({ error: 'Slide image not found' });
        if (newLink !== undefined) image.link = newLink;
        if (active !== undefined) image.active = active;
        res.status(200).json({links:admin.slideImages});
    }catch(e) {next(e)}
}*/
export const editSlideImageLink = async (req,res,next) =>{
    const {link,active} = req.body
    try{
        let updateFields = {}
        if(link!=undefined) updateFields['slideImages.$[elem].link'] = link
        if(active!=undefined) updateFields['slideImages.$[elem].active'] = active
        let result = await Admin.findOneAndUpdate({role:'admin'},{$set:updateFields},{arrayFilters:[{'elem._id':new ObjectId(req.params.id)}],returnDocument:'after'})
        res.status(200).json({slides:result.slideImages,message:'slide image edited'})
    }catch(e) {next(e)}
}

export const deleteSlideImageLink = async (req, res, next) => {
    try {
        let result = await Admin.findOneAndUpdate({role:'admin'},{$pull:{slideImages:{_id:new ObjectId(req.params.id)}}},{returnDocument:'after'})
        res.status(200).json({slides:result.slideImages,message:'slide image deleted'});
    }catch(e) {next(e)}
}


export const getTelecomCategories =async (req,res,next) =>{
    try{
        const admin = await Admin.findOne({role:'admin'});
        res.status(200).json(admin.telecomCategories)
    }catch(e) {next(e)}
}
export const addTelecomCategory = async (req, res,next) => {
    const {category} = req.body;
    try{
        let result=await Admin.findOneAndUpdate({role:'admin'},{$push:{telecomCategories:{_id:new ObjectId(),category,active:true}}},{returnDocument:'after'})
        res.status(200).json({categories:result.telecomCategories,message:'telecom category added'});
    }catch(e) {next(e)}
}
export const editTelecomCategory = async (req,res,next) =>{
    const {category,active} = req.body
    try{
        let updateFields = {}
        if(category!=undefined) updateFields['telecomCategories.$[elem].category'] = category
        if(active!=undefined) updateFields['telecomCategories.$[elem].active'] = active
        let result = await Admin.findOneAndUpdate({role:'admin'},{$set:updateFields},{arrayFilters:[{'elem._id':new ObjectId(req.params.id)}],returnDocument:'after'})
        res.status(200).json({categories:result.telecomCategories,message:'telecom category edited'})
    }catch(e) {next(e)}
}

export const deleteTelecomCategory = async (req, res, next) => {
    try {
        let result = await Admin.findOneAndUpdate({role:'admin'},{$pull:{telecomCategories:{_id:new ObjectId(req.params.id)}}},{returnDocument:'after'})
        res.status(200).json({categories:result.telecomCategories,message:'telecom category deleted'});
    }catch(e) {next(e)}
}




export const getContactMedia = async (req, res, next) => {
    try {
        let admin = await Admin.findOne({role:'admin'});
        if(!admin) return res.status(404).json({error:'Admin not found'})
        res.status(200).json(admin.contacts);
    }catch(e) {next(e)}
}


export const editContactMedia = async (req,res,next) =>{
    try{
        const bulkOps=req.body.map(({media,updatedURL})=> ({updateOne:{filter:{role:'admin','contacts.media':media},update:{$set:{['contacts.$.contactURL']:updatedURL}}}}))
        await Admin.bulkWrite(bulkOps)
        const admin = await Admin.findOne({role:'admin'});
        res.status(200).json({contacts:admin.contacts,message:'contact numbers updated'})
    }catch(e) {next(e)}
}
export const getSocialMediaLinks = async (req, res, next) => {
    try {
        let admin = await Admin.findOne({role:'admin'});
        if(!admin) return res.status(404).json({error:'Admin not found'})
        res.status(200).json(admin.socialLinks);
    }catch(e) {next(e)}
}
export const editSocialMedia = async (req,res,next) =>{
    try{
        const bulkOps=req.body.map(({media,updatedURL})=> ({updateOne:{filter:{role:'admin','contacts.media':media},update:{$set:{['socialLinks.$.url']:updatedURL}}}}))
        await Admin.bulkWrite(bulkOps)
        const admin = await Admin.findOne({role:'admin'});
        res.status(200).json({socialLinks:admin.socialLinks,message:'social links updated'})
    }catch(e) {next(e)}
}

/*export const editContactMedia = async (req, res, next) => {
    try {
        //const {updates} = req.body;
        const updateOps = updatesreq.body.map((item,i) => ({ [`contacts.$[elem${i}].contactURL`]:item.updatedURL }));
        const arrayFilters = updatesreq.body.map((item, i) => ({[`elem${i}.media`]: item.media}));
        const admin = await Admin.findOneAndUpdate(
            {role:'admin'},
            { $set: Object.assign({}, ...updateOps) },
            { arrayFilters, new:true}
        );
        res.status(200).json({ message: "Contact numbers updated", contacts:admin.contacts });
    }catch(e) {next(e)}
}*/

export const getServices = async (req, res,next) => {
    try {
        let admin=await Admin.findOne({role:'admin'})
        //let services=admin.services.filter(service=>service.active)
        res.status(200).json(admin.services)
    }catch(e) {next(e)}
}
export const editServices = async (req,res,next) =>{
    try{    
        await Admin.findOneAndUpdate({role:'admin'},{$set:{services:req.body.services}})
        await User.updateMany({},{$set:{accesses:req.body.services}})
        res.status(200).json({message:'services updated'})
    }catch(e) {next(e)}
}


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


export const addTelecom = async (req, res, next) => {
    try {
          const {name,icon} = req.body;
        const result = await Admin.findOneAndUpdate({role:'admin'},{$push:{telecoms:{_id:new ObjectId(),name,icon,active:true}}},{returnDocument:'after'})
        res.status(200).json({telecoms:result.telecoms,message:'telecom added'});
    }catch(e) {next(e)}
}


export const editTelecom = async (req,res,next) =>{
    const {name,icon,active} = req.body
    try{
        let updateFields ={}
        if(name!=undefined) updateFields['telecoms.$[elem].name'] = name
        if(icon!=undefined) updateFields['telecoms.$[elem].icon'] = icon
        if(active!=undefined) updateFields['telecoms.$[elem].active'] = active;
        let result = await Admin.findOneAndUpdate({role:'admin'},{$set:updateFields},{arrayFilters:[{'elem._id':new ObjectId(req.params.id)}],returnDocument:'after'}) 
        await SocketResponse.updateMany({user:{$exists:true}},{$set:{optChanged:true}});
        if(name){
            await Drive.updateMany({operator:name},{$set:{operator:name}});
            await Regular.updateMany({operator:name}, {$set:{operator:name}})  
        }
        socket.getIO().emit('telecoms',{telecoms:result.telecoms});
        res.status(200).json({telecoms:result.telecoms,message:'telecom edited'});
    }catch(e) {next(e)};
}


/*export const editTelecom = async (req, res, next) => {
    try {
        const {name,newName,newIcon} = req.body;
        const opt = admin.telecoms.find(telecom => telecom.name === name);
        if (!opt) return res.status(404).json({ error: 'operator  not found' });
        if(newName!==undefined) opt.name = newName;
        if(newIcon!==undefined) opt.icon = newIcon;
        res.status(200).json({telecoms:admin.telecoms,message:'operator updated successfully'});
    }catch(e) {next(e)}
}*/



export const getPGW = async (req, res,next) => {
    try{
        let admin = await Admin.findOne({role:'admin'});
        if(!admin) return res.status(404).json({error:'Admin not found'})
        res.status(200).json(admin.pgws);
    }catch(e) {next(e)}
}


export const addPGW = async (req, res, next) => {
    const {name,icon,merchantID,apiKey,apiPassword/*,active*/} = req.body;
    try{
        let admin = await Admin.findOne({role:'admin'})
        if(admin.pgws.some(pgw => pgw.name === name)) return res.status(400).json({error:'Payment gateway already exists'})
        let updated=await Admin.findOneAndUpdate({role:'admin'},{$push:{pgws:{_id:new ObjectId(),name,icon,merchantID,apiKey,apiPassword,active:true}}},{returnDocument:'after'})
        res.status(200).json({pgws:updated.pgws,message:'Payment gateway added '});
    }catch(e) {next(e)}
}


export const editPGW = async (req, res, next) => {
    const {name,merchantID,apiKey,apiPassword,active} = req.body
    let gateway = {};
    try {
        if(name!==undefined) gateway['pgws.$[elem].name'] = name
        if(merchantID!==undefined) gateway['pgws.$[elem].merchantID'] = merchantID;
        if(apiKey!==undefined) gateway['pgws.$[elem].apiKey'] = apiKey
        if(apiPassword!==undefined) gateway['pgws.$[elem].apiPassword'] = apiPassword;
        if(active!==undefined) gateway['pgws.$[elem].active'] = active
        const result = await Admin.findOneAndUpdate({role:'admin'},{$set:gateway},{arrayFilters:[{'elem._id':new ObjectId(req.params.id)}],returnDocument:'after'});
        res.status(200).json({pgws:result.pgws});
    }catch(e) {next(e)}
}
export const getSMSGateway = async (req,res,next) =>{
    try{
        const admin = await Admin.findOne({role:'admin'})
        res.status(200).json(admin.smsGateway)
    }catch(e) {next(e)}
}
export const addSMSGateway = async (req,res,next) =>{
    const {name,icon,merchantID,apiKey,apiPassword/*,active*/} = req.body;
    try{
        const admin = await Admin.findOne({role:'admin'})
        if(admin.smsGateways.some(smsg => smsg.name==name)) return res.status(400).json({error:'sms gateway already exist'});
        const updated = await Admin.findOneAndUpdate({},{$push:{smsGateways:{_id:new ObjectId(),name,icon,merchantID,apiKey,apiPassword,active:true}}})
        res.status(200).json({smsGateways:updated.smsGateways,message:'sms gateway added'})
    }catch(e) {next(e)}
}
export const editSMSGateway = async (req,res,next) =>{
    const {name,merchantID,apiKey,apiPassword,active} = req.body
    let gateway = {};
    try{
        if(name!==undefined) gateway['smsGateways.$[elem].name'] = name
        if(apiKey!==undefined) gateway['smsGateways.$[elem].apiKey'] = apiKey;
        if(active!==undefined) gateway['smsGateways.$[elem].active'] = active //gateway.active = active;*/
    }catch(e) {next(e)}
}
export const getUserLevels =async (req, res,next) => {
    try{
        if(!cacheData.levels){
            const admin = await Admin.findOne({role:'admin'});
            if(!admin) return res.status(404).json({error:'Admin not found'});cacheData.levels=admin.userLevels;
        }
        res.status(200).json(cacheData.levels);
    }catch(e){next(e)}
}

export const getNotices = async (req,res,next) => {
    try{
        let notices = await Notice.find({}).toArray();
        res.status(200).json(notices)
    }catch(e) {next(e)}
}
/*export const addNotice = async (req,res,next) =>{
    let {title,description} = req.body;
    try{
        let result=await Admin.findOneAndUpdate({role:'admin'},{$push:{notices:{_id:new ObjectId(),title,description,}}},{returnDocument:'after'})//modifiedAt:new Date()
        res.status(200).json({notices:result.notices,message:'Notice Added'});
    }catch(e) {next(e)}
}*/

export const /*noticeStack*//*sendNotice*/addNotice = async (req, res,next) => {
    const io = socket.getIO();
    const {recipient,medium,notice,noticeDuration,repeat} = req.body;
    let recipients=(!recipient||recipient?.length==0)? cacheData.levels:recipient;
    let receiveMedium=(!medium||medium?.length==0)? ['push','in-app','inbox']:medium;
    if(repeat && receiveMedium.includes('push')) {
        let i=receiveMedium.indexOf('push');
        receiveMedium.splice(i,1)
    }
    try{
        let {insertedId} = await Notice.insertOne({recipients,receiveMedium,notice,duration:new Date(noticeDuration),repeat,active:true,createdAt:new Date(),updatedAt:new Date()});
        //await SocketResponse.updateMany({level:{$in:recipients}},{$push:{notices:insertedId}});
        if(receiveMedium.includes('inbox')) {console.log(receiveMedium,recipients);
            io.emit('user:inbox-immediate',recipients)
            await SocketResponse.updateMany({socketId:null,level:{$in:recipients}},{$inc:{countInbox:1}});
        }
        res.status(200).json({message:'Notice Sent'});
    }catch(e){next(e)}
}
export const editNotice = async (req,res,next) =>{
    const {recipient,medium,notice,noticeDuration,repeat}=req.body
    let io = socket.getIO()
    try{
        let recipients,receiveMedium,duration //= {};
        recipients= (recipient!==undefined&&recipient.length==0)? cacheData.levels:recipient
        receiveMedium= (medium!==undefined&&medium.length==0) ?['push','in-app','inbox']:medium
        if(noticeDuration !==undefined) duration=new Date(noticeDuration);
        const updateData = Object.fromEntries(
            Object.entries({ recipients, receiveMedium, notice,duration,repeat }).filter(([_, v]) => v !== undefined)
        );
        if(receiveMedium.includes('inbox')) {
            io.emit('user:inbox-immediate',recipients)
            await SocketResponse.updateMany({socketId:null,level:{$in:recipients}},{$inc:{countInbox:1}})
        }
        let result = await Notice.findOneAndUpdate({_id:new ObjectId(req.params.id)},{$set:{...updateData,updatedAt:new Date()}});
        //let admin=await Admin.findOne({role:'admin'})//=> notice._id==req.params.id)
         
        if(result.modifiedCount==0) return res.status(404).json({error:'Notice not found'})
        res.status(200).json({/*notices:result.notices,*/message:'Notice Edited'});
    }catch(e){next(e)}
}
export const toggleNotice = async (req,res,next) =>{
    try{
        let result = await Notice.findOneAndUpdate({_id:new ObjectId(req.params.id)},{$set:{active:req.body.status}})
        res.status(200).json({/*notices:result.notices,*/message:'Notice Toggled'});
    }catch(e) {next(e)} 
}
export const deleteNotice = async (req,res,next) =>{
    try{
        await Notice.findOneAndDelete({_id:new ObjectId(req.params.id)})
        res.status(200).json({/*notices:result.notices,*/message:'Notice Deleted'});
    }catch(e){next(e)}
}


export const getTodayExpense = async (res, req, next)=>{
    try{
        let startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        let endOfDay = new Date();
        endOfDay.setHours(23,59,59,999);
        let driveExpense=await DriveHit.aggregate([{$match:{status:'SUCCESS',updatedAt:{$gte:startOfDay,$lte:endOfDay}}},{$group:{_id:null,todayDriveExpense:{$sum:'$drive.price'}}}])
        /*let driveExpense= await DriveHit.aggregate([
            {$match:{status:'success',createdAt:{$gte:startOfDay,$lte:endOfDay}}},
            {
                $lookup:{
                    from: 'drives',
                    localField: 'driveID',
                    foreignField: '_id',
                    as: 'drive'
                }
            },
            {$unwind:'$drive'},
            {$group:{_id:null,todayDriveExpense:{$sum:"$drive.price"}}}
        ])*/
        let topupExpense= await Topup.aggregate([
            {$match:{updatedAt:{$gte:startOfDay,$lte:endOfDay}}},
            {$group:{_id:null,todayTopupExpense:{$sum:"$amount"}}}
        ])
        let bankExpense= await Bank.aggregate([
            {$match:{status:'SUCCESS',updatedAt:{$gte:startOfDay,$lte:endOfDay}}},
            {$group:{_id:null,todayBankExpense:{$sum:"$amount"}}}
        ])
        res.status(200).json({
            todayDriveExpense:driveExpense[0]?.todayDriveExpense||0,
            todayTopupExpense:topupExpense[0]?.todayTopupExpense||0,
            todayBankExpense:bankExpense[0]?.todayBankExpense||0
        })
    }catch(e){next(e)}
}

//admin
export const getUserFeedback = async (req, res,next) => {
    const {limit,page,} = req.query;
    //if (user) query.user = user;
    let currentPage = parseInt(page)|| 1;
    let queryLimit = parseInt(limit)|| 20;
    try{
        const total = await Feedback.countDocuments({});
        const feedbacks = await Feedback.find({}).skip(queryLimit*(currentPage-1)).limit(queryLimit).sort({createdAt:-1}).toArray();
        if(!feedbacks) return res.status(404).json({error:'No feedbacks found'});
        res.status(200).json({feedbacks,pagination:{totalPage:Math.ceil(total/queryLimit),currentPage}});
    }catch(e) {next(e)}
}
export const deleteUserFeedback = async (req,res,next) =>{
    try{
        await Feedback.findOneAndDelete({_id:new ObjectId(req.params.id)});
        res.status(200).json({message:'feedback deleted'});
    }catch(e) {next(e)}
}

export const getBankNames =async (req,res,next) =>{
    try{
        const admin = await Admin.findOne({role:'admin'});
        res.status(200).json({bankNames:admin.bankNames})
    }catch(e){next(e)}
}
export const saveBankNames = async (req,res,next) =>{
    let errors = validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=> err.msg).mapped()})
    try{
        await Admin.findOneAndUpdate({role:'admin'},{$set:{bankNames:req.body.banks}})
        res.status(200).json({message:'Bank names saved'})
    }catch(e) {next(e)}
}

//call by admin
/*export const getRequestAPI = async (req, res,next) => {
    const {user,domain,status} = req.query;
    let query = {};
    if(user) query.user=user
    if(domain) query.domain=domain
    if(status) query.status=status
    try{
    }catch(e){next(e)}
}

export const allowAPIKey = async (req, res,next) => {
    try{
        const {user,domain,apiType} = await APIRequest.findOneAndUpdate({_id:new ObjectId(req.params.id)},{$set:{status:'ALLOWED'}})
        const key = uuidv4();
        const {username,email} = await APIUser.findOne({user});
        /*if(email){
            try {
                await emailWithNodemailer({
                    email,
                    subject: 'Account Activation Email',
                    html: `<div style="text-align:center">
                        <img src="${process.env.CLIENT_URL}/images/logo.png" alt="logo" width="100px" height="100px"/>
                        <h2>Welcome ${username} to tannimtelecom</h2>
                        <h3>Congratulations, your API key has been created successfully</h3>
                        <!--p>please click here to <a href="${process.env.CLIENT_URL}/api/users/activate/${'token'}" target="_blank">activate your</a></p--> <p>${key}</p>
                        </div>
                    `
                })
            }catch(e) {}
        }*/
    /*}catch(e){next(e)}
}*/

export const logout = async (req, res,next) => {
    try{
        res.clearCookie('admin-token');
        await Admin.findOneAndUpdate({_id:new ObjectId(req.admin.id)},{$set:{loginStatus:false}});
        res.status(200).json({message:'Logout success'})
    }catch(e) {next(e)}
}
export const seed = async (req, res,next) => {
    try{
        await Admin.insertOne({username:'admin',password:await bcrypt.hash('admin',11),pin:await bcrypt.hash('98765',11),role:'admin',status:true,avatar:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1752837562/bitmap_q4lnon.svg',email:'bmskenterprise70@gmail.com',device:['Windows','Chrome'],accesses:['index','drive-history','bill-history','mbank-history','deposit-history','deposit-init','topup-history','manage-drive','manage-regular','manage-admin','manage-user','deposit-setup','setup','notice','feedback','manage-api'],telecoms:[{_id:new ObjectId(),name:'airtel',icon:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1756549356/airtel-logo__sygrey.png',active:true},{_id:new ObjectId(),name:'banglalink',icon:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1756549356/bl-logo__xphcjx.png',active:true},{_id:new ObjectId(),name:'grameenphone',icon:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1777964343/GP_Logo_hhlgph.png',active:true},{_id:new ObjectId(),name:'robi',icon:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1756549356/robi-logo__bz1avh.png',active:true},{_id:new ObjectId(),name:'teletalk',icon:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1756549356/teletalk_logo_h9h0kz.png',active:true}],telecomCategories:[],routing:[{_id:new ObjectId(),operator:'airtel',ip:'168.192.',slot:0},{_id:new ObjectId(),operator:'banglalink',ip:'168.192.',slot:0},{_id:new ObjectId(),operator:'grameenphone',ip:'168.192.',slot:0},{_id:new ObjectId(),operator:'robi',ip:'168.192.',slot:0},{_id:new ObjectId(),operator:'teletalk',ip:'168.192.',slot:0}],slideImages:[{_id:new ObjectId(),link:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1760504784/one_sygkfm.png',active:true},{_id:new ObjectId(),link:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1760504784/two_ixyjca.png',active:true},{_id:new ObjectId(),link:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1760504783/three_wttlwu.png',active:true},{_id:new ObjectId(),link:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1760504784/four_hu2nnt.png',active:true}],deposits:[{level:'platinum',topup:{commission:{bkash:'0.0',dbbl:'0.0',nagad:'0.0',upay:'0.0'},min:'500',max:'5000'},drive:{commission:{bkash:'0.0',dbbl:'0.0',nagad:'0.0'},min:'500',max:'5000'},mbank:{commission:{bkash:'0.0',dbbl:'0.0',nagad:'0.0'},min:'500',max:'5000'},regFee:'0',selfReg:true,otp:false},{level:'gold',topup:{commission:{bkash:'0.0',dbbl:'0.0',nagad:'0.0'},min:'500',max:'5000'},drive:{commission:{bkash:'0.0',dbbl:'0.0',nagad:'0.0'},min:'500',max:'5000'},mbank:{commission:{bkash:'0.0',dbbl:'0.0',nagad:'0.0'},min:'500',max:'5000'},regFee:'0',selfReg:true,otp:false},{level:'silver',topup:{commission:{bkash:'0.0',dbbl:'0.0',nagad:'0.0'},min:'500',max:'5000'},drive:{commission:{bkash:'0.0',dbbl:'0.0',nagad:'0.0'},min:'500',max:'5000'},mbank:{commission:{bkash:'0.0',dbbl:'0.0',nagad:'0.0'},min:'500',max:'5000'},regFee:'0',selfReg:true,otp:false},{level:'distributor',topup:{commission:{bkash:'0.0',dbbl:'0.0',nagad:'0.0'},min:'500',max:'5000'},drive:{commission:{bkash:'0.0',dbbl:'0.0',nagad:'0.0'},min:'500',max:'5000'},mbank:{commission:{bkash:'0.0',dbbl:'0.0',nagad:'0.0'},min:'500',max:'5000'},regFee:'0.0',selfReg:true,otp:false},{level:'sr',topup:{commission:{bkash:'0.0',dbbl:'0.0',nagad:'0.0'},min:'500',max:'5000'},drive:{commission:{bkash:'0.0',dbbl:'0.0',nagad:'0.0'},min:'500',max:'5000'},mbank:{commission:{bkash:'0.0',dbbl:'0.0',nagad:'0.0'},min:'500',max:'5000'},regFee:'0',selfReg:true,otp:false},{level:'retailer',topup:{commission:{bkash:'0.0',dbbl:'0.0',nagad:'0.0'},min:'500',max:'5000'},drive:{commission:{bkash:'0.0',dbbl:'0.0',nagad:'0.0'},min:'500',max:'5000'},mbank:{commission:{bkash:'0.0',dbbl:'0.0',nagad:'0.0'},min:'500',max:'5000'},regFee:'0',selfReg:true,otp:false}],userLevels:[{name:'platinum',active:true},{name:'gold',active:true},{name:'silver',active:true},{name:'distributor',active:true},{name:'sr',active:true},{name:'retailer',active:true}],mbanks:[{_id:new ObjectId(),name:'bkash',icon:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1756576795/bkash_bxyoyp.webp',active:true,account:'017'},{_id:new ObjectId(),name:'dbbl',icon:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1756576816/DBBL-rocket_zjmdzj.jpg',active:true,account:'017'},{_id:new ObjectId(),name:'nagad',icon:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1756576817/nogod_essbez.png',active:true,account:'017'},{_id:new ObjectId(),name:'bank',icon:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1779799424/Image-default_ptg7cu.png',active:true,account:'A/C Title:\nA/C No:\nBank:\nMobile No: 017'}],methods:{deposit:'manual',topup:'manual',mbank:'manual'},topupAccess:['airtel','banglalink','grameenphone','robi','teletalk'],driveAccess:['airtel','banglalink','grameenphone','robi','teletalk'],regularAccess:['airtel','banglalink','grameenphone','robi','teletalk'],contacts:[{_id:new ObjectId(),media:'call',icon:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1756577181/telephone-call-logo_wq1wsh.png',contactURL:'tel:01'},{_id:new ObjectId(),media:'whatsapp',icon:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1756577181/WhatsApp_Logo_green_ineja8.svg',contactURL:'https://wa.me/01'},{_id:new ObjectId(),media:'telegram',icon:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1756577181/Telegram_2019_Logo_kmt1ox.svg',contactURL:'https://t.me/01'},{_id:new ObjectId(),media:'messenger',icon:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1756577181/Facebook_Messenger_logo_2025_iigz5y.svg',contactURL:'https://m.me/01'}],socialLinks:[{_id:new ObjectId(),media:'facebook',icon:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1770729684/Facebook_f_logo__2019.svg_wrj2hr.png',url:'https://www.facebook.com'},{_id:new ObjectId(),media:'youtube',icon:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1778658063/YouTube-500_doo8ld.jpg',url:'https://www.youtube.com'},{_id:new ObjectId(),media:'instagram',icon:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1777965618/instagram_oteyjy.jpg',url:'httos://instagram.com'},{_id:new ObjectId(),media:'x',icon:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1777965618/x_icon_cyroag.png',url:'httos://x.com'}],pgws:[{_id:new ObjectId(),name:'bkash',icon:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1756576795/bkash_bxyoyp.webp',active:true,apiKey:'',apiPassword:''},{_id:new ObjectId(),name:'dbbl',icon:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1756576816/DBBL-rocket_zjmdzj.jpg',active:true,apiKey:'',apiPassword:''},{_id:new ObjectId(),name:'nagad',icon:'https://res.cloudinary.com/dnyyugfjv/image/upload/v1756576817/nogod_essbez.png',active:true,apiKey:'',apiPassword:''}],smsGateways:[],   services:['deposit','topup','drive','regular','bill','mbank'],bankNames:'Islami Bank\nDBBL Bank'});
        res.status(200).json({message:'seeding success'})
    }catch(e) {next(e)}
}

export const socketSeed = async (req,res,next)=>{
    try{
        await SocketResponse.insertOne({socketId:null,admin:'socket-admin',pending:{deposit:0,withdraw:0,topup:0,drive:0,mbank:0,bill:0,user:0},failed:{deposit:0,topup:0,mbank:0}})
        res.status(200).json({message:'socket seeding success'})
    }catch(e) {next(e)}
}
//module.exports = {protectedController,register,login,deposit,updatePackageAccess/*,getImageLinks*/,addImageLink,editImageLink,deleteImageLink,getPGW,editContactList,getContactList,editContactList,getTelecoms,addTelecom,editTelecom,getPGW,addPGW,togglePGW}
