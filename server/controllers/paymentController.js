const axios = require('axios')
const paymentModel = require('../model/paymentModel')
const globals = require('node-global-storage')
const {v4:uuidv4} = require('uuid')
import connectDB from '../config/db'

(async () =>{
    try{
         
                
        
           
             
        let Admin = db.collection()
        let Deposit = db.collection
    }catch(err){}
})()
   export const bkashHeaders = async (req,res) =>{
        //try 
        const admin = await Admin.findOne({role:'admin'})
        return {
            "Content-Type": "application/json",
            Accept: "application/json",
            authorization: globals.get('id_token'),
            'x-app-key': process.env.bkash_api_key,
        }
}
    export const paymentCreate = async (req,res) =>{
        const {amount,userId} = req.body
        globals.set('userId', userId)
        try{
            const { data } = await axios.post(process.env.bkash_create_payment_url, {
                mode: '0011',
                payerReference: " ",
                callbackURL: 'http://localhost:5000/api/bkash/payment/callback',
                amount: amount,
                currency: "BDT",
                intent: 'sale',
                merchantInvoiceNumber: 'Inv' + uuidv4().substring(0, 5)
            }, {
                headers: await this.bkash_headers()
            })
            return res.status(200).json({ bkashURL: data.bkashURL })
        }catch(err) {return res.status(401).json({error:err.message})}

        }

export const call_back = async (req,res) =>{ //(req, res) => {
    const {paymentId,status} = req.query

    if(status=='cancel' || status=='failure') return res.redirect(`http://localhost:5173/error?message=${status}`)
    if(status=='success')  {
        try{
            //try {
            const {data} = await axios.post(process.env.bkash_execute_payment_url, {paymentID}, {headers: await bkash_headers()})
            if(data && data.statusCode=='0000') {
                await Deposit.insertOne({txn:data.trxID,createdAt:data.paymentExecuteTime,amount:data.amount})
                return res.redirect(`http://localhost:5173/success`)     
            }
            res.redirect(`http://localhost:5173/error?message=${data.statusMessage}`)
        }catch(err) {res.redirect(`http://localhost:5173/error?message=${err.message}`)}
    }
                
}

export const refund = async (req,res) =>{
    const {txnId} = req.params //const {trxID} = req.params;
    try{
        //try {
        const payment = await model.findOne({txnId})
        const {data} = await axios.post(process.env.bkash_refund_transaction_url,{
            paymentID: payment.paymentID,
            amount: payment.amount,
            txnId,
            sku: 'payment',
            reason: 'cashback'
        },{headers: await this.bkash_headers()})

        if(data && data.statusCode=='0000') return res.status(200).json({message:'refund success'})
        res.status(404).json({error:'refund failed'})
    }catch(err) {res.status(200).json({message:'refund failed'})}
}

module.exports = new paymentController()
    /*          paymentID : payment.paymentID,
        = await axios.post(process.env.bkash_refund_transaction_url,{
                amount : payment.amount,
                trxID,
                sku : 'payment',
                reason : 'cashback'
            },{
                headers: await this.bkash_headers()
            })
            if (data && data.statusCode === '0000') {
                return res.status(200).json({message : 'refund success'})
            }else{
                return res.status(404).json({error : 'refund failed'})
            }
        } catch (error) {
            return res.status(404).json({error : 'refund failed'})}*/
                /*if (data && data.statusCode === '0000') {
                    //const userId = globals.get('userId')
                    await paymentModel.create({
                        userId: Math.random() * 10 + 1 ,
                        paymentID,
                        trxID: data.trxID,
                        date: data.paymentExecuteTime,
                        amount: parseInt(data.amount)
                    })

                     
                }else{
                    return res.redirect(`http://localhost:5173/error?message=${data.statusMessage}`)
                }
            }catch(err) catch (error) {
                console.log(error)
                return res.redirect(`http://localhost:5173/error?message=${error.message}`)}*/