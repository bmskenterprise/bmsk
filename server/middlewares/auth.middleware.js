import {ObjectId} from 'mongodb';
import axios from 'axios';
     import dotenv from 'dotenv';dotenv.config();
import connectDB from '../config/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
let Admin,User,APIUser;
(async ()=>{
    try{
        let db = await connectDB()
        User = db.collection('users')
        APIUser = db.collection('apiusers')
        Admin = db.collection('admins')
    }catch(err) {console.error(err);}
})()
export const authAdmin = async (req, res, next) => {
    try{
        const token = req.cookies['admin-token'] ;
        let decoded 
        if(!token) {return res.status(401).json({error:'Access denied. No token provided.'});}
        try{decoded = jwt.verify(token, process.env.JWT_ADMIN_AUTH_SECRET);}
        catch(err){return res.status(401).json({error:'invalid token'})}
        const admin = await Admin.findOne({_id:new ObjectId(decoded.id)});
        if(!admin||!admin.status) return res.status(401).json({error:'Access Denied'})
        req.admin = decoded;
        next();
    } catch(err) {res.status(500).json({error:'Something failed.'});}
}
export const isSuperAdmin = async (req, res, next) => {
    try{
        if(req.admin.role!='admin') return res.status(401).json({error:'Access Denied'})
        next()
    }catch(e) {next(e)}
}
export const matchAuthPIN = async (req,res,next)=> {
    const pin = req.headers['x-admin-pin'] 
    try{
        if(!pin) return res.status(401).json({error:'Admin PIN missing'})
        const admin = await Admin.findOne({_id:new ObjectId(req.admin.id)});
        if(!admin) return res.status(401).json({error:'admin not found.'});
        bcrypt.compare(pin, admin.pin, (err, isMatch) => {
            if(err) return res.status(500).json({error:'something went wrong'});
            if(isMatch) {next();}
            else {res.status(401).json({error:'pin doesnt matched'})}
        })
    }catch(e) {next(e)}
}

export const authAPIUser = async (req, res, next) => {
    try {
        let token=req.headers.authorization.split(' ')[1] ;
        if(!token) {return res.status(401).json({messae:'Access denied. No token provided.'});}
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await APIUser.findOne({_id:new ObjectId(decoded.id)});
        if(!user) return res.status(401).json({error:'Invalid token.'});
        req.apiUser = decoded;
        next();
    } catch(error) {res.status(500).json({error:'Something failed.'});}
}

    /*res.status(401).json({error:'pin doesnt matched'})*/
        //res.redirect('/login')//res.status(401).json({error:'Invalid token.'});
     
        
        //const token = req.headers.authorization.split(' ')[1] ;
export const authUser = async (req, res, next) => {
    try{
        const token = req.cookies['user-token'] ;
        if(!token) {return res.status(401).json({error:'Access denied. No token provided.'});}
        let decoded
        try{decoded = jwt.verify(token, process.env.JWT_USER_AUTH_SECRET);}
        catch(err) {return res.status(401).json({error:'invalid token'})} 
        const user = await User.findOne({_id:new ObjectId(decoded.id)});
        if(!user) return res.status(401).json({error:'Invalid token.'});
        req.user = decoded;
        next();
    }catch(err) {res.status(500).json({error:'Something failed.'});}
}
export const matchUserAuthPIN = async(req,res,next) =>{
    const pin = req.headers['x-user-pin']
    try{
        if(!pin) {return res.status(401).json({error:'Access denied. No pin provided.'});}
        let user = await User.findOne({_id:new ObjectId(req.user.id)});
        if(!user) return res.status(401).json({error:'Authentication failed. Login again.'});
        bcrypt.compare(pin,user.pin,(err,isMatch) =>{
            if(err) return res.status(500).json({error:'something went wrong'});
            if(isMatch) {next();}
            else {res.status(401).json({error:'pin doesnt matched'})}
        })
    }catch(e) {next(e)}
}
export const authBkash = async (req,res,next) =>{
    try{
        const admin = await Admin.findOne({role:'admin'});
        let bkash = admin.pgws.find(p=>p.name=='bkash')
        const {data} = await axios.post(process.env.BKAS_GRANT_TOKEN,{app_key:process.env.BKASH_KEY,app_secret:process.env.BKASH_SECRET},{headers:{'Content-Type':'application/json','Accept':'application/json',username:bkash.merchantID,password:bkash.apiPassword}});
        req.bkashToken = data.id_token
        next()
    }catch(e) {next(e)}
}