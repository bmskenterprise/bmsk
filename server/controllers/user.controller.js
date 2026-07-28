import {validationResult} from 'express-validator';
import {ObjectId} from 'mongodb';
import bcrypt from 'bcrypt';
import connectDB from '../config/db.js';
import dotenv from 'dotenv';dotenv.config();
import cloudinary from '../config/cloudinary.js';
//import APIUser from '../models/apiUser.model.js';
//import APIRequest from '../models/APIRequest.model.js' 
import socket from '../config/socket.js' 
import createJWT from '../config/jwt.js';
import emailWithNodemailer from '../utils/email.js';
let User,Admin,Notice,DepositInit,APIUser,APIRequest,Feedback,SocketResponse

(async () =>{
    try{
        let db = await connectDB();
        Admin = db.collection('admins')
        User = db.collection('users')
        Feedback = db.collection('feedbacks')
        APIUser = db.collection('apiusers')
        DepositInit = db.collection('depositinits')
        APIRequest = db.collection('apirequests');
        Notice = db.collection('notices')
        SocketResponse = db.collection('socketresponses');
    }catch(err){console.error('db failed');}
})()
export const temp = async (req,res,next) =>{
    try{
        await User.updateMany({},{$set:{avatar:['https://res.cloudinary.com/dnyyugfjv/image/upload/v1769691299/user-profile-icon-circle_1256048-12499_ns1dkj.jpg']}});res.status(200).json({m:'yes'})
    }catch(e) {next(e)}
}


//apiuser
export const authenticateAPIUser = (req, res) => {res.json({message: "Protected route access granted", apiUser: req.apiUser,});}

export const authenticateUser = async (req,res,next) =>{
    try{
        let user = await User.findOne({_id:new ObjectId(req.user.id)});
        if(!user||(user.device.lock&&!(user.device.allowed.includes(req.headers['user-login-id'])))) return res.status(401).json({error:'Access Denied',success:false}) //return res.status(404).json({ error: 'মোবাইল নাম্বার সঠিক নয়', success: false });
        res.status(200).json({...req.user,avatar:user.avatar[0],accesses:user.accesses})
    }catch(e) {next(e)}
}
/*const verifyNID = async (req, res) => {
    try{
    const filePath = req.file.path;
    // Optional: sharp দিয়ে grayscale করে OCR accuracy বাড়ানো
    const processedImagePath = `${filePath}_processed.png`;
    await sharp(filePath).grayscale().toFile(processedImagePath);

        const {data:{text}} = await  Tesseract.recognize(
      processedImagePath,
      'ben+eng',
      { logger: m => console.log(m) }
    );

    // Keyword-based validation
    const keywords = [
      "জাতীয় পরিচয়পত্র", "জাতীয় পরিচয়পত্র",
      "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার",
      "National ID", "People's Republic of Bangladesh"
    ];
    const isValid = keywords.some(keyword => text.includes(keyword));
    fs.unlinkSync(filePath);
    fs.unlinkSync(processedImagePath);
    if(!isValid) {
      return res.status(400).json({
        success: false,
        error: "আপলোড করা ছবিটি সঠিক নয়। অনুগ্রহ করে NID-এর সামনের দিকের ছবি আপলোড করুন যেখানে আপনার তথ্য স্পষ্ট দেখা যায়।"});
    }
    res.json({success:true,message:valid front side});
  } catch (err) {console.error(err);res.status(500).json({ success: false, error: "Server error occurred" });}
}*/


export const validateUserPIN = async (req,res,next) =>{
    try{
        let user = await User.findOne({username:req.user.username});
        let matched = await bcrypt.compare(req.body.pin,user.pin)
        if(!matched) res.status(400).json({error:'pin is incorrect',success:false});
        //return res.status(400).json({error:errors.array()[0].msg,success:false});
        res.status(200).json({matched})
    }catch(e) {next(e)}
}
export const verifyUser = async (req, res, next) => {
    let errors=validationResult(req).formatWith((error)=>error.msg)
    if(!errors.isEmpty()) return res.status(400).json({error:errors.array()[0].msg,success:false});
        //return res.status(400).json({error:errors.array()[0].msg,success:false});
    const {username} = req.body;
    try{
        const exist = await User.findOne({username});
        if(exist) res.status(400).json({error:'অন্য নাম্বার দিয়ে চেষ্টা করুন'});
        /*const accountSid = process.env.TWILIO_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const client = new twilio(accountSid, authToken);

        client.messages
            .create({body: `Your OTP is ${otp}`,to: username,from: process.env.TWILIO_PHONE_NUMBER,})
            .then(message => res.status(200).json({ success: true, otp }))
            .catch(err => res.status(500).json({ success: false, error: err.message }));*/
    }catch(err) {next(err)}
}
        //res.status(500).json({ message: error.message });

export const validUser = async (req, res, next) => {
    let errors=validationResult(req).formatWith((error)=>error.msg)
    if(!errors.isEmpty()){return res.status(400).json({error:errors.array()[0].msg,success:false});}
    const {username} = req.params;
    try {
        const exist = await User.findOne({username});
        if (exist) res.status(200).json({exist:true})
    }catch(err) {next(err)}
}
        //res.status(500).json({ message: error.message });
    

        //return res.status(400).json({error:errors.array()[0].msg,success:false});

export const registerUser = async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=>err.msg).mapped()})   
    /*function* generateID() {
        let i = 0;
        while(true){yield i++;}
    }
    const idGenerator = generateID();*/
    const {level,username,phone,email,fullname,nid,password,pin} = req.body;
    let io = socket.getIO()
    try {
        const userExists = await User.findOne({username});
        if(userExists) return res.status(409).json({error:'user with the mobile number already exist',success:false})
        const hashedPassword = await bcrypt.hash(password,11);
        const hashedPIN = await bcrypt.hash(pin,11);
        const userData = {level,username,phone,email,fullname,password:hashedPassword,pin:hashedPIN,nid,avatar:['https://res.cloudinary.com/dnyyugfjv/image/upload/v1769691299/user-profile-icon-circle_1256048-12499_ns1dkj.jpg'],accesses:['deposit','withdraw','topup','regular','drive','bkash','dbbl','nagad','bill','bank','payment','feedback'],verified:false,balance:{main:{bkash:0,dbbl:0,nagad:0,upay:0},topup:0.0,drive:0.0,mbank:0.0},loginSecurity:'off',lastActiveAt:null,failedLoginAttempts:0,lockUntil:null,createdAt:new Date(),updatedAt:new Date()}
        await User.insertOne(user);
        const {socketId} = await SocketResponse.find({admin:'socket-admin'})
        if(!socketId) await SocketResponse.findOneAndUpdate({admin:'socket-admin'},{$inc:{['pending.user']:1}});
        io.emit('added',{type:'user'})
        res.status(201).json({success: true})
    }catch(err) {next(err)}
}

export const regfeeByTXN = async (req,res,next)=>{
    const {username,txn,level} = req.body
    try{
        let admin = await User.findOne({username},{$set:{regFeeRef:txn}})
        //let init = await DepositInit.findOne({txn})
        //if(!init) return res.status(404).json({error:'transaction not found'})
        //let fee = admin.deposits.find(d=>d.level==level)?.regFee
        //if(init.amount!=fee) return res.status(400).json({error:'registration fee didnt match'});
        res.status(200).json({statusRegFeePaid:true})
    }catch(e) {next(e)}
}
export const otpGenerateAndSend = async (req,res,next) =>{
    try{
        await User.findOneAndUpdate({username:req.body.username},{$set:{otp:'123456'}});
        res.status(200).json({success:true})
    }catch(e) {next(e)}
}
export const verifyRegisterByOTP = async (req,res,next) =>{
    let {username,otp} = req.body;
    try{
        let user = await User.findOneAndUpdate({username,otp:Number(otp)},{$unset:{otp:''}});
        if(!user) return res.status(400).json({error:'otp doesn\'t match'})
               //await User.findOneAndUpdate({username},{$unset:{otp:''}});
        res.status(200).json({success:true})
    }catch(e) {next(e)}
}
                       
                 
                 
export const loginUser = async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=>err.msg).mapped(),success:false});
    const {username,password} = req.body;
    try{
        const user = await User.findOne({username});
        if(!user?.device?.allowed?.includes(req.headers['user-login-id'])&&user.device.lock) return res.status(401).json({error:'Access Denied'})
        let matched=await bcrypt.compare(password,user.password);
        if(!user||!matched){
            await User.updateOne({username}, {$set:{lastActiveAt:new Date()},$inc:{failedLoginAttempts:1}});
            if(user.failedLoginAttempts >= 3) {await User.updateOne({username},{$set:{lockUntil:Date.now()+30*60*1000}});}
            return res.status(401).json({error:"Invalid credentials"});
        }
        const loginId = new Date().getTime().toString()
        let token = createJWT({id:user._id,username,level:user.level}, process.env.JWT_USER_AUTH_SECRET, process.env.JWT_USER_AUTH_EXPIRES_IN)
        await User.updateOne({username},{$set:{failedLoginAttempts:0,lockUntil:null}})
        if(!user.device.allowed.includes(req.headers['user-login-id'])) {
            let admin = await Admin.findOne({role:'admin'})
            await User.updateOne({username},{$push:{['device.allowed']: {$each:[loginId],$position:0}}});
            emailWithNodemailer({
                email:user.email,
                subject:'New Login Detected',
                html:`<h4>bmsk telecom</h4><br/><p>Your account has been logged in from a new device</p><p>if it was you, ignore this email. otherwise contact admin below</p><br/><br/><a href=${admin.contacts[0].contactURL}><img style='width:100px' src=${admin.contacts[0].icon}/></a>&nbsp;&nbsp;<a href=${admin.contacts[1].contactURL}><img style='width:100px' src=${admin.contacts[1].icon}/></a>`
            })
        }
        if(user.loginSecurity=='email') {
            let otp = Math.floor(Math.random() *(999999-100000))+100000
            emailWithNodemailer({
                email:user.email,
                subject:'User Login OTP',
                html:`<h5>bmsk telecom</h5><p>Enter the OTP below to Login your Account</p><h4>${otp}</h4>`
            })
            await User.updateOne({username},{$set:{loginOTP:otp}});
        }
        if(user.loginSecurity=='sms') {
            let otp = Math.floor(Math.random() *(999999-100000))+100000
            await User.updateOne({username},{$set:{loginOTP:otp}});
        }
        let resJson = {loginId}
        if(['email','sms'].includes(user.loginSecurity)) resJson.redirectTo = '/login/verify'
        else{
            let token = createJWT({id:user._id,username,level:user.level}, process.env.JWT_USER_AUTH_SECRET, process.env.JWT_USER_AUTH_EXPIRES_IN)
            res.cookie('user-token',token,{
                httpOnly: false,
                secure: true,
                sameSite: 'none',
                maxAge: 30*24*60*60*1000
            })
        }
        res.status(200).json(resJson)    
    }catch(err) {next(err)}
}

export const verifyLoginOTP = async (req,res,next) =>{
    const {username,otp} = req.body
    try{
        let user = await User.findOneAndUpdate({username,loginOTP:Number(otp)},{$unset:{loginOTP:''}});
        if(!user) return res.status(400).json({error:'otp doesn\'t matched',success:false});
        let token = createJWT({id:user._id,username,level:user.level}, process.env.JWT_USER_AUTH_SECRET, process.env.JWT_USER_AUTH_EXPIRES_IN);
        res.cookie('user-token',token,{
            httpOnly: false,
            secure: true,
            sameSite: 'none',
            maxAge: 30*24*60*60*1000
        })
        res.status(200).json({redirectTo:'/index'})
    }catch(e){next(e)}
}

export const updateUser = async (req, res, next) => {
    let errors = validationResult(req).formatWith((error)=>error.msg)
    if(!errors.isEmpty()) return res.status(400).json({error:errors.array()[0].msg,success:false});
    const {username} = req.body;
    try{
        await User.findOneAndUpdate({_id:new ObjectId(req.params.id)},{$set:req.body});
        res.status(200).json({success: true,message: 'updated successfully'});
    }catch(err) {next(err)}
}

export const toggleNewDevice = async (req, res,next) => {
    try{
        await User.updateOne({_id:new ObjectId(req.user.id) },{$set:{'device.lock':req.body.isDeviceLock}})
        res.status(200).json({message:'device lock toggled'})
    }catch(err){next(err)}
}
export const getLoginSecurity = async (req,res,next) =>{
    const {username,otp} = req.body
    try{
        let user = await User.findOne({_id:new ObjectId(req.user.id)})
        res.status(200).json({loginSecurity:user.loginSecurity})
    }catch(e){next(e)}
}
export const enableTwoStep = async (req,res,next) =>{
    const {loginSecurity} = req.body
    try{
        /*let matched = */await User.updateOne({_id:new ObjectId(req.user.id)},{$set:{loginSecurity}})
        /*if(!matched) return */res.status(200).json({message:`login security changed to ${loginSecurity}`,success:true});
    }catch(e){next(e)}
}


export const changePassword = async (req, res, next) => {
    try{
        let errors=validationResult(req).formatWith((error)=>error.msg)
        if(!errors.isEmpty()) return res.status(400).json({error:errors.array()[0].msg,success:false});
        const {username,currentPassword,newPassword} = req.body;
        const user = await User.findOne({username});
        if(!user) return res.status(404).json({error: 'মোবাইল নাম্বার সঠিক নয়, লগ আউট করে আবার লগইন করুন',success:false});
        if(!(await bcrypt.compare(currentPassword,user.password))) return res.status(401).json({error:'পাসওয়ার্ড ভুল',success:false});
        //return res.status(401).json({'error':'পাসওয়ার্ড ভুল','success':false});
        let password = await bcrypt.hash(newPassword,await bcrypt.genSalt(10));
        await User.updateOne({username},{$set:{password,lastActiveAt:Date.now()}});
        res.status(200).json({'message':'পাসওয়ার্ড পরিবর্তন হয়েছে','success':true});
    }catch(err) {next(err)}
}


export const changePIN = async (req, res,next) => {
    try{
        const user = await User.findOne({username: req.body.user})
        if(!user) return res.status(404).json({error:'মোবাইল নাম্বার সঠিক নয়', success:false});
        user.lastActiveAt = Date.now();
        user.password = await bcrypt.hash(req.body.password, await bcrypt.genSalt(10));
        await user.save();
        res.status(200).json({success: true,message: 'updated successfully'});
    }catch(err) {next(err)}
}

export const deleteUser = async (req, res, next) => {
    try{
        let user =await User.findOneAndDelete({_id:new ObjectId(req.params.id)});
        if(!user) return res.status(404).json({error:'user with the id not found'})
        res.status(203).json({success: true,message: 'deleted successfully'});
    }catch(err) {next(err)}
}

export const addAvatar = async (req,res,next) =>{
    try{
        let user = await User.findOne({_id:new ObjectId(req.user.id)});
        if(user.avatar.length==3) return res.status(400).json({error:'You can only upload 3 avatars'});
        if(req.body.avatar&&req.body.avatar.length>5*1024*1024) return res.status(413).json({error:'max file size is 5MB'});
        let response = await cloudinary.uploader.upload(req.body.avatar,{
            folder:'avatars',
            resource_type:'image',
            allowed_formats:['jpg','jpeg','png','webp']
        });
        await User.updateOne({_id:new ObjectId(req.user.id)},{$push:{avatar:{$each:[response.secure_url],$position:0}}});
        res.status(200).json({message:'Avatar Updated'})
    }catch(e) {next(e)}
}
export const getUserProfile = async (req,res,next) =>{
    try{
        let user = await User.findOne({_id:new ObjectId(req.user.id)});
        res.status(200).json({phone:user.phone,fullname:user.fullname,verified:user.verified,isDeviceLock:user.device.lock});
    }catch(e) {next(e)}
}

export const getRegisterSetting =async (req, res,next) => {
    try{
        const admin = await Admin.findOne({role:'admin'});
        if(!admin) res.status(404).json({error:'Not found',success:false});
        let levels = admin.deposits.filter(d=>d.selfReg).map(d=>({level:d.level,regFee:d.regFee,otp:d.otp}));
        if(!levels.length) res.status(404).json({error:'Not found',success:false});
        res.status(200).json(levels);
    }catch(err){next(err)}
}
//
export const getTelecomOpts = async (req,res) => {
    try {
        const admin = await Admin.findOne({role:'admin'});
        if(!admin) res.status(200).json([]);
        res.status(200).json(admin.telecoms.map(t=>({name:t.name,icon:t.icon})))
    } catch(err) {res.status(200).json([]);} 
}
export const getBankNames = async (req,res,next) =>{
    try{
        let admin= await Admin.findOne({role:'admin'});
        if(!admin) res.status(404).json({error:'Not found'});
        let banknames = admin.bankNames.split(/[,\n]/).map(b=>b.trim());
        res.status(200).json(banknames);
    }catch(err){next(err)}
}

export const getMBankList = async (req, res,next) => {
    try {
        const admin = await Admin.findOne({role:'admin'})
        if(!admin) res.status(404).json({error:'Not found'});
        //let mbanks=/*.filter(m=>m.active)*/admin.mbanks.map(m=>({name:m.name,icon:m.icon,account:m.account,active:m.active}));
        res.status(200).json(admin.mbanks);
    }catch(err){next(err)}
}


export const getDepositLimit = async (req, res,next) => {
    let {level} = req.params;
    try {
        const admin = await Admin.findOne({role:'admin'});
        if(!admin) res.status(404).json({error:'Not found',success:false});
        let userLevel = admin.deposits.find(d=>d.level==level)
        res.status(200).json({
            topup:{min:userLevel.topup.min,max:userLevel.topup.max},
            drive:{min:userLevel.drive.min,max:userLevel.drive.max},
            mbank:{min:userLevel.mbank.min,max:userLevel.mbank.max}
        });
    }catch(e){next(e)}
}
/*export const getDepositFee = async (req, res,next) => {
    try{
        const admin = await Admin.findOne({role: 'admin'});
        let userLevel = admin.deposits.find(d=> d.level==req.user.level);
        res.status(200).json(userLevel.fee)
    }catch(e) {next(e)}
}*/

/*export const deposit =async (req, res,next) => {
    const {balanceType,txnId,} = req.body;
    try{
        await User.findByIdAndUpdate(req.user.id,{$set:{lastActiveAt:new Date()}});
        let init= await DepositInit.findOne({user:req.user.username,txnId});
        if(!init) return res.status(404).json({error:'ট্রানজেকশন আইডি পাওয়া যায়নি',success:false});
        let admin=await Admin.findById('admin');
        let c=(parseFloat(admin.deposits.find(d=>d.level==req.user.level)[balanceType].commission[init.gateway])/100*init.amount).toFixed(2);
        await Deposit.insertOne({user:req.user.username,level:req.user.level,txnId,balanceType,amount:init.amount,commission:c});
        await User.findByIdAndUpdate(req.user.id,{$inc:{[balanceType]:init.amount+parseFloat(c)}})
        await DepositInit.findOneAndDelete({user,txnId});
        res.status(200).json({message:'ডিপোজিট সফল হয়েছে',success:true})
    }catch(err){next(err)}
}*/

export const updatePermission = async (req, res, next) => {
    const {username} = req.body;
    try{
        User.updateOne({username},{$set:{permission:req.body.permission}})
    }catch(err) {next(err)}
}
export const getUserBalances = async (req,res,next) =>{
    try{
        const user = await User.findOne({_id:new ObjectId(req.user.id)})
        res.status(200).json(user.balance)
    }catch(err) {next(err)}
}
export const getDriveBalance = async (req,res,next) =>{
    try{
        let user = await User.findOne({_id:new ObjectId(req.user.id)})// success: false });
        res.status(200).json({driveBalance:user.balance.drive})
    }catch(err){next(err)}
}
export const getBankBalance = async (req, res,next) => {
    try{
        const user = await User.findOne({_id:new ObjectId(req.user.id)});
        if(!user) return res.status(404).json({error:'ইউজারনেম  সঠিক নয়',success:false});
        res.status(200).json({bankBalance:user.balance.bank})
    }catch(err) {next(err)}
}


export const getSliderImages = async (req, res) => {
    try{
        const admin = await Admin.findOne({role:'admin'});
        if(!admin) return res.status(200).json([]);
        let urls=admin.slideImages.filter(image=>image.active).map(image=>image.link);
        res.status(200).json(urls);
    }catch(e) {res.status(200).json([])}
}
export const addFeedback = async (req,res,next) =>{
    let errors=validationResult(req).formatWith((error)=>error.msg)
    if(!errors.isEmpty()) return res.status(400).json({error:errors.formatWith(err=>err.msg).mapped(),success:false});
    try{
        await User.findOneAndUpdate({_id:new ObjectId(req.user.id)},{$set:{lastActiveAt:new Date()}})
        await Feedback.insertOne({description:req.body.description,user:req.user.id,createdAt:new Date(),updatedAt:new Date()})
        res.status(201).json({message:'Feedback Added',success:true});
    }catch(e) {next(e)} 
}
//user
export const getFeedbacksByUser = async (req, res, next) => {
    try{
        await User.findOneAndUpdate({_id:new ObjectId(req.user.id)},{$set:{lastActiveAt:new Date()}});
        const feedbacks = await Feedback.find({user: req.user.id}).sort({ createdAt: -1 }).toArray();
        if (!feedbacks) return next(new Error('No feedback found'));
        res.status(200).json(feedbacks)
    }catch(e) {next(e)}
}
    /*let errors=validationResult(req).formatWith((error)=>error.msg)
    if(!errors.isEmpty()) return res.status(400).json({error:errors.array()[0].msg,success:false});
    const {username,email,password} = req.body;*/
export const loginAPIUser = async (req, res,next) => {
    let errors=validationResult(req).formatWith((error)=>error.msg)
    if(!errors.isEmpty()) return res.status(400).json({error:errors.array()[0].msg,success:false});
    try{
        const {username,password} = req.body;
        const user = await APIUser.findOne({username});
        if(!user) return res.status(404).json({error:'user not found',success:false});
        const matched=await bcrypt.compare(password,user.password)
        if(!matched) return res.status(401).json({error:'password incorrect',success:false});
        if(!matched){
            user.failedLoginAttempts += 1;
            if (user.failedLoginAttempts >= 3) {user.lockUntil = Date.now() + 30 * 60 * 1000;}
            await user.save();
            return res.status(401).send("Invalid credentials");
        }else{
            let token = createJWT({id:user._id,username,email:user.email}, process.env.JWT_SECRET, '30d')
            res.cookie('user-token',token,{
                httpOnly:true,
                secure:false,
                maxAge:24*60*60*1000
            })
            user.failedLoginAttempts = 0;
            user.lockUntil = null;
            await user.save();
            res.status(200).json({message:'login success',success:true});
        }
    }catch(e){next(e)}
}
//call by user
export const sendRecoveryOTPEmail = async (req,res,next) =>{
    try{
        let otp = Math.floor(Math.random() *(999999-100000))+100000
        let user = await APIUser.findOne({username:req.body.username});
        emailWithNodemailer({
            email:user.email,
            subject:'Password Recovery',
            html:`<h5>tannimtelecom.shop</h5><p>Enter the OTP below to recover your password</p><p>The OTP is valid for 2 minutes</p><h6>${otp}</h6>`
        })
        user.recoveryOTP =await bcrypt.hash(otp.toString(),11)
        await user.save();
        res.status(200).json({message:'OTP sent to your email'});// });
    }catch(e){next(e)}
}
export const resetAPIUserPassword = async (req,res,next) =>{
    const {username,password,otp} = req.body
    try{
        let user = await APIUser.findOne({username})
        if(!otp) return res.status(404).json({error:'otp not found', success:false});
        let matched = await bcrypt.compare(otp,user.recoveryOTP)
        if(!matched) return res.status.json({error:'otp doesn\'t match'})
        user.password = await bcrypt.hash(password,11)
        await user.save()
        res.status(200).json({message:'password reseted'});
    }catch(e){next(e)}
}
export const getNotices = async (req,res,next) =>{
    try{
            //return res.status(404).json({ error: 'মোবাইল নাম্বার সঠিক নয়', success: false });
        let notices = await Notice.find({recipients:req.user.level,receiveMedium:'inbox',duration:{$gte:new Date()},active:true},{projection:{notice:1,updatedAt:1}}).toArray()
        res.status(200).json(notices)
    }catch(e) {res.status(200).json([])}
}
export const getModalNotices = async (req,res,next) =>{
    try{
        let onceNotices=[];
        let socketRes = await SocketResponse.findOne({user:req.user.username})
        let repeatedNotices = await Notice.find({recipients:req.user.level,receiveMedium:'in-app',repeat:true,duration:{$gte:new Date()},active:true},{projection:{notice:1}}).toArray()
        if(!repeatedNotices) repeatedNotices=[];
        if(!socketRes.seenNotice) {
            onceNotices = await Notice.find({recipients:req.user.level,receiveMedium:'in-app',repeat:false,duration:{$gte:new Date()}},{projection:{notice:1}}).toArray()
        }    
        res.status(200).json([...onceNotices,...repeatedNotices])
    }catch(e) {next(e)}
}
export const seenModalNotices = async (req,res,next) =>{
    try{
        let noticesOneTime = await Notice.find({repeat:false}).toArray()
        if(noticesOneTime.length>0) await SocketResponse.updateOne({user:req.user.username},{$set:{seenNotice:true}})
        res.status(200).json({})
    }catch(e) {next(e)}
}
export const getSocialLinks = async (req, res,next) => {
    try{
        const admin = await Admin.findOne({role:  'admin'});
        res.status(200).json(admin.socialLinks)//await APIUser.insertOne({username,email,password:hashed,createdAt:new Date(),updatedAt:new Date()});
    }catch(e){next(e)}
}
export const getContactList = async (req,res,next) =>{
    try{
        let admin = await Admin.findOne({role:'admin'}) 
        let contacts = admin.contacts.map(c=> ({media:c.media,icon:c.icon,contactURL:c.contactURL}))
        res.status(200).json(contacts)
    }catch(e){next(e)}
}
export const getPGWs = async (req,res,next) =>{
    try{
        let admin = await Admin.findOne({role:'admin'})
        let pgws = admin.pgws.filter(pgw=> pgw.active).map(p=> ({name:p.name,icon:p.icon}))
        res.status(200).json(pgws)
    }catch(e) {next(e)}
}
export const logout = (req,res,next) => {
    try{
        res.clearCookie('user-token');res.status(200).json({message:'logout success',success:true});
    }catch(e){next(e)}
}
                /*$set: {
                    permission: req.body.permission
                }*/
/*module.exports = {
    //verifyNID,
    deleteUser,changePassword,changePIN,getTopupBalance,getBankBalance,getSliderImages*/
