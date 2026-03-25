import {createRequire} from 'module'
const require = createRequire(import.meta.url);
import dotenv from 'dotenv'
dotenv.config()
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {createServer} from 'http';
import setRoutes from './routes/route.js';//const config = require('config');
//import { mongodbURL, serverPort } from './services/secret.js';
import connectDB from './config/db.js';
import socket from './config/socket.js';
const app = express();
const server = createServer(app);
/*import SocketResponse from './models/socketResponse.model.js';
import {initSocketUser,findSocketUser} from './controllers/socket.controller.js'//
import Notice from './models/notice.model.js'   */
import socketController from './controllers/socket.controller.js';
//import Admin from './admin.model.js';
app.use(cors({
    origin: ['https://bmsk-admin-dashboard.onrender.com','https://bmsk-user.onrender.com'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods:['GET','POST','PATCH','DELETE','OPTIONS'],
    allowedHeaders:['Content-Type','Authorization','x-admin-pin','x-user-pin']
}))
//for preflight request
app.options('*',cors();
const io = socket.init(server);
app.use(express.json({limit:'50mb'})); 
app.use(express.urlencoded({limit:'50mb', extended:true}));// );
 app.use(cookieParser());
 app.use(helmet() );
setRoutes(app)


/*app.use((req, res, next) => {
    class HttpError extends Error {
        constructor(message, status) {
            super(message);
            this.status = status;
        }
    }
    next(new HttpError('404 page not found',404))//let error = new Error('404 page not found')
    //error.status=404//res.render('pages/auth/signup', {title: 'create a new account'})
    //next(error);
})*/
socketController(io)
/*app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Headers','Content-Type, x-admin-pin')
})*/
app.use((req, res, next) => {
    class HttpError extends Error {
        constructor(message, status) {
            super(message);
            this.status = status;
        }
    }
    next(new HttpError('404 page not found',404))//let error = new Error('404 page not found')
    //error.status=404//res.render('pages/auth/signup', {title: 'create a new account'})
    //next(error);
})
app.use((err, req, res, next)=>{
    const status = err.status?err.status:500;
    const message = err.message?err.message:'server error';
    if(err.status==404){return res.send(err.message)}
    res.status(status).json({message})    //return res.render('pages/error/404', {title: '404   '})
    //}
    //res.render('pages/error/500', {title: 'internal a server error'});
});
connectDB()
.then(()=>{
    /*server*/server.listen(process.env.SERVER_PORT, ()=>{
        console.log(`running on http://localhost:${process.env.SERVER_PORT}`)
    })
})
.catch(e =>{console.log(e);process.exit(1)}) 
