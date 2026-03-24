import nodemailer from 'nodemailer';
//import {smtpUsername, smtpPassword} from '../services/secret';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
    }
})

export default async ({email, subject, html}) => {
    //const  = emailData;
    try{
        const info = await transporter.sendMail({
            from: process.env.SMTP_USERNAME,
            to: email,
            subject: subject,
            html: html
        });console.log('message sent %s', info.response);
    }catch (e){
        console.error('error occured while sending email');
        throw e;
    }
}