import {header,body} from 'express-validator';

export const validateUserRegister = [
    body('level').trim().notEmpty().withMessage('level cannot be empty')
    .isIn(['platinum','gold','silver','distributor','sr','retailer']).withMessage('level must be one of the following: platinum'),
    
    body('username')
    .trim().notEmpty().withMessage('username cannot be empty')
    .matches(/^01[3-9]\d{8}$/).withMessage('username must be 01*** format mobile number')
    .isMobilePhone('bn-BD').withMessage('username must be a mobile number')/**/,

    body('fullname')
    .trim().notEmpty().withMessage('full name cannot be empty')
    .isLength({min:2, max: 32}).withMessage('username must be between 2 and 32 characters')
    .escape(),
    //.isLength({min:2, max: 32}).withMessage('full name must be between 2 and 32 characters')
    
    body('nid')
        .isNumeric().withMessage('শুধুমাত্র সংখ্যা হতে হবে')
        .matches(/^(\d{10}|\d{13}|\d{17})$/).withMessage('নাম্বারটি অবশ্যই ১০, ১৩ অথবা ১৭ সংখ্যার হতে হবে'),
        //.withMessage('নাম্বারটি অবশ্যই ১০, ১৩ অথবা ১৭ সংখ্যার হতে হবে'),
    body('password')
    .trim().notEmpty().withMessage('password cannot be empty')
    .isLength({min:8, max: 32}).withMessage('password must be between 8 and 32 characters')
    .isStrongPassword().withMessage('password must be strong'),/*.matches(/[A-Z]/).withMessage('password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('password must contain at least one lowercase letter')
    .matches(/[\W_]/).withMessage('password must contain at least one special character')*/

    body('pin')
    .trim().notEmpty().withMessage('pin cannot be empty')
    .isLength({min:4, max: 6}).withMessage('pin must be between 4 and 6 digits')
    .isNumeric().withMessage('pin must be numeric')
];

export const validateChange=[
    body('currentPassword')
    //.trim()
    .trim().notEmpty().withMessage('current password cannot be empty')
    .isLength({min:8, max: 32}).withMessage('current password must be between 8 and 32 characters'),

    body('newPassword')
    //.trim()
    .trim().notEmpty().withMessage('new password cannot be empty')
    .isLength({min:8, max: 32}).withMessage('new password must be between 8 and 32 characters')
    .isStrongPassword().withMessage('password must be strong')/*.matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('New password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('New password must contain at least one number')
    .matches(/[\W_]/).withMessage('New password must contain at least one special character')*/,

    body('confirmPassword')
    .isLength({min:8, max: 32}).withMessage('new password must be between 8 and 32 characters')
    .custom((confirmPassword, {req}) => {
        if(confirmPassword != req.body.newPassword){
            throw new Error('password doesn\'t match');
        }
        return true;
    })
]
export const validateUserLogin=[
    body('username')
    .trim().notEmpty().withMessage('আপনার ইউজারনেম দিন')
    .matches(/^(?:\+?88)?01[3-9]\d{8}$/).withMessage('ইউজারনেমে আপনার ১১ সংখ্যার মোবাইল নাম্বার দিন'),
    
    body('password')
    .trim().notEmpty().withMessage('আপনার পাসওয়ার্ড দিন')
];

export const validateUserData=[
    body('username')
    .trim().notEmpty().withMessage('আপনার ফিডব্যাক লিখুন')
    .matches(/^(?:\+?88)?01[3-9]\d{8}$/).withMessage('ইউজারনেম একটি মোবাইল নাম্বার হতে হবে'),
    
    body('password')
    .trim().notEmpty().withMessage('আপনার ফিডব্যাক লিখুন')
    .isLength({min:8, max: 50}).withMessage('ফিডব্যাক ৮ থেকে ৫০ অক্ষরের মধ্যে হতে হবে')
]

export const validateDepositByTxn=[
    body('balanceType')
    .isIn(['topup','drive','mbank']).withMessage('Enter a valid Balance Type'),
    body('txnId')
    .trim().notEmpty().withMessage('Enter Transaction ID')
    .isLength({max:80}).withMessage('Txn is too long')
]
export const validateTopupRequest=[
    body('recipient')
    .trim().notEmpty().withMessage('Enter a Mobile Number')
    .matches(/^01[3-9]\d{8}$/).withMessage('Enter 01***** format Mobile Number'),
    
    body('operator')
    //.notEmpty().withMessage('Enter a Telecom Operator')
    .isIn(['airtel','banglalink','grameenphone','robi','teletalk']).withMessage('Enter a valid Operator'),
    
    body('amount')
    .trim().notEmpty().withMessage('Enter Topup Amount')
    .isInt().withMessage('Topup Amount must be a Number')
]


export const validateDriveHit=[
    body('recipient')
    .trim().notEmpty().withMessage('Enter a Mobile Number')
    .matches(/^(?:\+?88)?01[3-9]\d{8}$/).withMessage('Enter  format Mobile Number'),
    
    /*body('operator')
    .notEmpty().withMessage('Enter a Telecom Operator')
    .isIn(['airtel','banglalink','grameenphone','robi','teletalk']).withMessage('Enter a valid Operator'),
    
    body('drive-id')
    .notEmpty().withMessage('Enter drive id')*/
]

export const validateBillRequest = [
    body('billType')
    .notEmpty().withMessage('Enter a Bill Type')
    .isIn(['electricity','water','gas','mobile','landline','internet','education','insurance',]).withMessage('Enter a valid Bill Type'),
    
    body('amount')
    .trim().notEmpty().withMessage('Enter Bill Amount')
    .isInt().withMessage('Bill Amount must be a Number'),
    
    body('acNumber')
    .trim().notEmpty().withMessage('Enter Bill AC Number')
    .isLength({min:4,max:80}).withMessage('Bill AC must be between 4 to 80 chars'),
    body('expire').notEmpty().withMessage('Enter Bill Expire Date').isISO8601().withMessage('Enter a valid date')
]

export const validateBankRequest = [
    body('bank')
    .trim().notEmpty().withMessage('Enter Bank Name and Branch')
    .isLength({min:4,max:32}).withMessage('Bank Name must be between 4 and 32 characters'),
    
    body('acNumber')
    .trim().notEmpty().withMessage('Enter Bank AC Number'),
    //.isInt().withMessage('Bank AC Number must be a Positive Number'),
    
    body('amount')
    .trim().notEmpty().withMessage('Enter Transaction Amount')
    .isInt().withMessage('Transaction Amount must be a Number  ')
]
export const validateUserFeedback=[
    body('description').optional().trim().isLength({min:4,max:32}).withMessage('ফিডব্যাক টাইটেল ৪ থেকে ৩২ অক্ষরের মধ্যে হতে হবে'),
    body('description')
    .trim().notEmpty().withMessage('আপনার ফিডব্যাক লিখুন')
    .isLength({min:4, max: 100}).withMessage('ফিডব্যাক ৪ থেকে ১০০ অক্ষরের মধ্যে হতে হবে')
]

export const validateMbankTransaction =[
    body('recipient').notEmpty().withMessage('Enteer a valid recipient number')
    .matches(/^01[3-9]\d{8}$/).withMessage('Recipient must be a 01********* format mobile number'),
    body('amount').notEmpty().withMessage('Enter a valid amount')
    .isInt().withMessage('Amount must be a number'),
    body('mbankType').notEmpty().withMessage('Enter a mobile bank gateway')
    .isIn(['bkash','dbbl','nagad','upay']).withMessage('Enter a valid mobile bank gateway'),
    body('transactionType').notEmpty().withMessage('Enter a transaction type')
    .isIn(['send-money','cash-in']).withMessage('Enter a valid transaction type')
]
export const validateUserAuthPIN = [
    header('x-user-pin').exists().withMessage('Enter a valid pin')
    .isLength({min:4, max:6}).withMessage('pin must be between 4 to 6 digits')
    .matches(/^\d+$/).withMessage('pin must be a number')
]