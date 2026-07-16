import {ObjectId} from 'mongodb'
import connectDB from '../config/db.js';
//import Admin from '../models/admin.model.js'
let Admin,Notice,SocketResponse
(async () => {
    try{
        let db = await connectDB();
        Admin = db.collection('admins');
        Notice = db.collection('notices');
        SocketResponse = db.collection('socketresponses');
    }catch(e){console.error(e);}
})()
export const initSocketAdmin=async (mongoId,socketId)=>{
  try{await SocketResponse.insertOne({admin:mongoId,socketId,pendings:{deposit:0,withdraw:0,topup:0,drive:0,mbank:0,bill:0,bank:0,user:0},failed:{deposit:0,withdraw:0,topup:0,mbank:0,bill:0,bank:0,drive:0},countInbox:0})}catch(e){throw new Error(e)}
}
export const initSocketUser=async (mongoId,level,socketId)=>{
  try{await SocketResponse.insertOne({user:mongoId,level,socketId,failed:{deposit:0,withdraw:0,topup:0,drive:0,regular:0,bill:0,bank:0,bkash:0,dbbl:0,nagad:0,upay:0},optChanged:false,topupOptChanged:false,regularOptChanged:false,driveOptChanged:false,notices:[],countInbox:0,seenNotice:false})}catch(e){throw new Error(e)}
}
export const findSocketAdmin =async (id,socketId)=>{
  try{let admin = await SocketResponse.findOneAndUpdate({admin:id},{$set:{socketId}},{returnDocument:'after'});return admin;}catch(e){throw new Error(e)}
}
export const findSocketUser =async (id,socketId)=>{
  try{let user = await SocketResponse.findOneAndUpdate({user:id},{$set:{socketId}},{returnDocument:'after'});return user;}catch(e){throw new Error(e)}
}
export const seenPendingByAdmin =async (id,type)=>{
  try{let admin = await SocketResponse.findOneAndUpdate({admin:id}, {$set:{[`pendings.${type}`]:0}});}catch(e){throw new Error(e)}
}
let seenFailedByUser=async (user,seenType)=>{console.log(user,seenType)
  await SocketResponse.findOneAndUpdate({user}, {$set:{[`failed.${seenType}`]:0}})
}
const seenInbox = async (id)=>{console.log(id)
  try{let {modifiedCount}=await SocketResponse.updateOne({user:id},{$set:{countInbox:0}});console.log(modifiedCount)}catch(e) {throw new Error(e)}
}
const getNotice = async (noticeId) =>{
  try{
    return await Notice.findOne({_id:new ObjectId(noticeId)})
  }catch(err){return {}}
}

export default (io)=>{
    const connectedDevices = new Map();
    const deviceSockets = new Map();
    const transactions = new Map();
    
    io.on('connection', (socket) => {
      socket.on('admin:join',async(id)=>{
        let socketAdmin=await findSocketAdmin(id/*.username*/,socket.id);
        if(socketAdmin){
          //const failed = {};
          //const pending = {};
          let failed = Object.fromEntries(Object.entries(socketAdmin.fail||{}).filter(([_,v])=>v>0))
          //if(socketAdmin.failed[f]>0) failed[f]=socketAdmin.failed[f]
          //}//if(socketAdmin.failed.topup>0) failed.topup=socketAdmin.failed.topup
          let pendings = Object.fromEntries(Object.entries(socketAdmin.pendings||{}).filter(([_,v])=>v>0))
          //if(socketAdmin.pendings[p]>0) pending[p]=socketAdmin.pendings[p]
          /*}if(socketAdmin.pending.withdraw>0) pending.withdraw=socketAdmin.pending.withdraw
          if(socketAdmin.pending.topup>0) pending.topup=socketAdmin.pending.topup
          if(socketAdmin.pending.mbank>0) pending.mbank=socketAdmin.pending.mbank
          if(socketAdmin.pending.bill>0) pending.bill=socketAdmin.pending.bill*/
          if(Object.keys(failed).length>0) io.to(socket.id).emit('admin:failed',failed);
          if(Object.keys(pendings).length>0) io.to(socket.id).emit('admin:pending',pendings);
        }
        else {initSocketAdmin(id,socket.id)}
      })
      socket.on('admin:deposit-history:seen',(id)=> seenPendingByAdmin(id,'deposit'))
      socket.on('admin:topup-history:seen',(id)=> seenPendingByAdmin(id,'topup'))
      socket.on('admin:withdraw-history:seen',(id)=> seenPendingByAdmin(id,'withdraw'))
      socket.on('admin:drive-history:seen',(id)=> seenPendingByAdmin(id,'drive'))
      socket.on('admin:mbank-history:seen',(id)=> seenPendingByAdmin(id,'mbank'))
      socket.on('admin:bill-history:seen',(id)=> seenPendingByAdmin(id,'bill'))
      socket.on('admin:bank-history:seen',(id)=> seenPendingByAdmin(id,'bank'))
      socket.on('admin:user-history:seen',(id)=> seenPendingByAdmin(id,'user'))
      socket.on('user:join',async ({id,level}) => {     //
        let socketUser=await findSocketUser(id,socket.id);
        if(socketUser) {if(socketUser.countInbox>0) io.to(socket.id).emit('user:inbox',socketUser.countInbox)
          let failed = Object.fromEntries(Object.entries(socketUser.failed|| {}).filter(([_,v])=>v>0));
          //let targetUser = socketUser
          /*if(targetUser.failed[0]>0) io.to(targetUser.socketId).emit('deposit-failed',{failedDepositCount:targetUser.failed[0]})
          if(targetUser.failed[1]>0) io.to(targetUser.socketId).emit('topup-failed',{failedTopupCount:targetUser.failed[1]})
          if(targetUser.failed[2]>0) io.to(targetUser.socketId).emit('drive-failed',{failedDriveCount:targetUser.failed[2]})*/
          //for(let f in socketUser.failed){
          //if(socketUser.failed[f]>0) failed[f]=socketUser.failed[f]
          //}//if(targetUser.failed[5]>0) io.to(targetUser.socketId).emit('bank-failed',{failedBankCount:targetUser.failed[5]})
          /*if(socketUser.failed.deposit>0) failed.deposit=socketUser.failed.deposit
          if(socketUser.failed.topup>0) failed.topup=socketUser.failed.topup
          if(socketUser.failed.drive>0) failed.drive=socketUser.failed.drive
          if(socketUser.failed.withdraw>0) failed.withdraw=socketUser.failed.withdraw
          if(socketUser.failed.bill>0) failed.bill=socketUser.failed.bill
          if(socketUser.failed.bkash>0) failed.bkash=socketUser.failed.bkash
          if(socketUser.failed.dbbl>0) failed.dbbl=socketUser.failed.dbbl
          if(socketUser.failed.nagad>0) failed.nagad=socketUser.failed.nagad
          if(socketUser.failed.upay>0) failed.upay=socketUser.failed.upay*/
          if(Object.keys(failed).length>0) io.to(socket.id).emit('user:failed',failed)
          
          if(socketUser.optChanged) io.to(socket.id).emit('user:telecoms',true)
          if(socketUser.topupOptChanged) io.to(socket.id).emit('user:topup-opts',true)
          if(socketUser.regularOptChanged) io.to(socket.id).emit('user:regular-opts',true)
          if(socketUser.driveOptChanged) io.to(socket.id).emit('user:drive-opts',true)
          if(socketUser.notices.length>0) io.to(socket.id).emit('user:notice',getNotice(socketUser.notices.length-1))
        }
        //else {usersSocketConnected[userId]={socketId:socket.id, failed:[null,null,null,null,null,null]}}
        else {initSocketUser(id,level,socket.id )}
      });
      /*socket.on('seen-failed-deposit',({userId})=> usersSocketConnected[userId].failed[0]=null)
      socket.on('seen-failed-bill',({userId})=> usersSocketConnected[userId].failed[4]=null)
      socket.on('seen-failed-bank',({userId})=> usersSocketConnected[userId].failed[5]=null)*/
      socket.on('user:failed-deposit:seen',(id)=> seenFailedByUser(id,'deposit'))
      socket.on('user:failed-withdraw:seen',(id)=> seenFailedByUser(id,'withdraw'))
      socket.on('user:failed-topup:seen',(id)=> seenFailedByUser(id,'topup'))
      socket.on('user:failed-drive:seen',(id)=> seenFailedByUser(id,'drive'))
      socket.on('user:failed-mbank:seen',(id)=> seenFailedByUser(id,'mbank'))
      socket.on('user:failed-bill:seen',(id)=> seenFailedByUser(id,'bill'))
      socket.on('user:failed-bank:seen',(id)=> seenFailedByUser(id,'bank'))
      socket.on('user:inbox:seen',(id)=>seenInbox(id))

    /*socket.on('register-device', (data) => {
        const { deviceId, deviceName, androidVersion } = data;
        
        connectedDevices.set(socket.id, {
            deviceId,
            deviceName,
            androidVersion,
            connectedAt: new Date().toISOString(),
            lastSeen: new Date().toISOString()
        });

        deviceSockets.set(deviceId, socket.id);

        console.log(`[Device] Registered: ${deviceId} (${deviceName})`);
        console.log(`[Devices] Total connected: ${connectedDevices.size}`);

        socket.emit('registration-success', {
            success: true,
            message: 'Device registered successfully',
            deviceId
        });

        // Broadcast to all admin clients
        io.emit('device-status', {
            type: 'connected',
            deviceId,
            totalDevices: connectedDevices.size
        });
    });

    // Heartbeat/ping
    socket.on('ping', (data) => {
        const device = connectedDevices.get(socket.id);
        if (device) {
            device.lastSeen = new Date().toISOString();
            socket.emit('pong', { timestamp: Date.now() });
        }
    });

    // Transaction status update from device
    socket.on('transaction-status', (data) => {
        const { transactionId, status, result, timestamp } = data;

        if (transactions.has(transactionId)) {
            const transaction = transactions.get(transactionId);
            transaction.status = status;
            transaction.result = result || '';
            transaction.completedAt = timestamp || new Date().toISOString();
            transactions.set(transactionId, transaction);

            console.log(`[Transaction] ${transactionId} updated: ${status}`);

            // Notify admin clients
            io.emit('transaction-update', {
                transactionId,
                status,
                result,
                transaction
            });
        }
    });

    // Log from device
    socket.on('device-log', (data) => {
        const device = connectedDevices.get(socket.id);
        console.log(`[Device Log] ${device?.deviceId || 'unknown'}: ${data.message}`);
    });*/

      socket.on('disconnect', async () =>{
        /*for (const userId in usersSocketConnected) {
          if (usersSocketConnected[userId] === socket.id) {
            delete usersSocketConnected[userId];
            break;
          }
        }*/await SocketResponse.findOneAndUpdate({socketId:socket.id},{$set:{socketId:null}});
        console.log('User disconnected:', socket.id);
      });
      console.log('Admin connected');
    });
}
