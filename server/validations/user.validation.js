import {header,body} from 'express-validator';

export const validateUserRegister = [
    body('level').escape().trim().notEmpty().withMessage('level cannot be empty')
    .isIn(['platinum','gold','silver','distributor','sr','retailer']).withMessage('level must be one of the following: platinum'),
    
    body('username').escape().notEmpty().withMessage('Username is required')
    .matches(/^[a-zA-Z0-9_.]{4,32}$/).withMessage('username must contain alphabet number _ .'),
    //.trim()
    body('phone').escape()
    .trim().notEmpty().withMessage('username cannot be empty')
    .matches(/^01[3-9]\d{8}$/).withMessage('username must be 01*** format mobile number')
    .isMobilePhone('bn-BD').withMessage('username must be a mobile number')/**/,

    body('email').escape().trim()
    .notEmpty().withMessage('email cannot be empty')
    .isEmail().withMessage('email must be a valid email address'),
    
    body('fullname').escape()
    .trim().notEmpty().withMessage('full name cannot be empty')
    .isLength({min:2, max: 32}).withMessage('username must be between 2 and 32 characters'),
    
    //.isLength({min:2, max: 32}).withMessage('full name must be between 2 and 32 characters')
    
    body('nid').escape()
        .isNumeric().withMessage('nid must be a number')
        .matches(/^(\d{10}|\d{13}|\d{17})$/).withMessage('nid number must be 10, 13 or 17 digits'),
        //.withMessage('নাম্বারটি অবশ্যই ১০, ১৩ অথবা ১৭ সংখ্যার হতে হবে'),
    body('password').escape()
    .trim().notEmpty().withMessage('password cannot be empty')
    .isLength({min:8, max: 32}).withMessage('password must be between 8 and 32 characters')
    .isStrongPassword().withMessage('password must be strong'),/*.matches(/[A-Z]/).withMessage('password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('password must contain at least one lowercase letter')
    .matches(/[\W_]/).withMessage('password must contain at least one special character')*/

    body('pin').escape()
    .trim().notEmpty().withMessage('pin cannot be empty')
    .isLength({min:4, max: 6}).withMessage('pin must be between 4 and 6 digits')
    .isNumeric().withMessage('pin must be numeric')
];

    //.trim()

export const validateUserLogin=[
    body('username').escape()
    .trim().notEmpty().withMessage('username is required')
    .matches(/^[a-zA-Z0-9_.]{4,32}$/).withMessage('username allowed a-z A-Z 0-9 _ .'),
    
    body('password').escape()
    .trim().notEmpty().withMessage('password is required')
];

export const validateDepositByTxn=[
    /*body('balanceType')
    .isIn(['topup','drive','mbank']).withMessage('Enter a valid Balance Type'),*/
    body('txn').escape()
    .trim().optional({checkFalsy:true})/*.withMessage('Enter Transaction ID')*/
    .isLength({max:80}).withMessage('Txn is too long')
    .matches(/^[a-zA-Z0-9]{4,32}$/).withMessage('invalid transaction id')
]
export const validateTopupRequest=[
    body('recipient').escape()
    .trim().notEmpty().withMessage('Enter a Mobile Number')
    .matches(/^01[3-9]\d{8}$/).withMessage('Enter 01***** format Mobile Number'),
    
    body('operator').escape()
    .isIn(['airtel','banglalink','grameenphone','robi','teletalk']).withMessage('Enter a valid Operator'),
    
    body('amount').escape()
    .trim().notEmpty().withMessage('Enter Topup Amount')
    .isInt().withMessage('Topup Amount must be a Number')
]


export const validateDriveHit=[
    body('recipient').escape()
    .trim().notEmpty().withMessage('Enter a Mobile Number')
    .matches(/^(?:\+?88)?01[3-9]\d{8}$/).withMessage('Enter 01**** format Mobile Number'),
    
    /*body('operator')
    .notEmpty().withMessage('Enter a Telecom Operator')
    .isIn(['airtel','banglalink','grameenphone','robi','teletalk']).withMessage('Enter a valid Operator'),
    
    body('drive-id')
    .notEmpty().withMessage('Enter drive id')*/
]

export const validateBillRequest = [
    body('billType').escape()
    .notEmpty().withMessage('Enter a Bill Type'),
    //.isIn(['electricity','water','gas','mobile','landline','internet','education','insurance',]).withMessage('Enter a valid Bill Type'),
    
    body('amount').escape()
    .trim().notEmpty().withMessage('Enter Bill Amount')
    .isInt().withMessage('Bill Amount must be a Number'),
    
    body('acNumber').escape()
    .trim().notEmpty().withMessage('Enter Bill AC Number')
    .isLength({min:4,max:80}).withMessage('Bill AC must be between 4 to 80 chars'),
    body('expire').escape().notEmpty().withMessage('Enter Bill Expire Date').isISO8601().withMessage('Enter a valid date')
]

export const validateBankRequest = [
    body('bank').escape()
    .trim().notEmpty().withMessage('Enter Bank Name and Branch')
    .isLength({min:4,max:32}).withMessage('Bank Name must be between 4 and 32 characters'),
    
    body('acNumber').escape()
    .trim().notEmpty().withMessage('Enter Bank AC Number'),
    //.isInt().withMessage('Bank AC Number must be a Positive Number'),
    
    body('amount').escape()
    .trim().notEmpty().withMessage('Enter Transaction Amount')
    .isInt().withMessage('Transaction Amount must be a Number  ')
]
export const validateUserFeedback=[
    //body('description').optional().trim().isLength({min:4,max:32}).withMessage('ফিডব্যাক টাইটেল ৪ থেকে ৩২ অক্ষরের মধ্যে হতে হবে'),
    body('description').escape()
    .trim().notEmpty().withMessage('feedback is required')
    .isLength({min:4, max: 100}).withMessage('feedback be between 4 to 100 characters ')
]

export const validateMbankTransaction =[
    body('recipient').escape().notEmpty().withMessage('Enter a valid recipient number')
    .matches(/^01[3-9]\d{8}$/).withMessage('Recipient must be a 01********* format mobile number'),
    body('amount').escape().notEmpty().withMessage('Enter a valid amount')
    .isInt().withMessage('Amount must be a positive number'),
    body('mbankType').escape().notEmpty().withMessage('Enter a mobile bank gateway')
    .isIn(['bkash','dbbl','nagad','upay']).withMessage('Enter a valid mobile bank gateway'),
    body('transactionType').escape().notEmpty().withMessage('Enter a transaction type')
    .isIn(['send-money','cash-in']).withMessage('Enter a valid transaction type')
]
export const validateUserAuthPIN = [
    header('x-user-pin').exists().withMessage('Enter a valid pin')
    .isLength({min:4, max:6}).withMessage('pin must be between 4 to 6 digits')
    .matches(/^\d+$/).withMessage('pin must be a number')
]
export const validatePassword=[
    body('oldPassword').escape()
    .trim().notEmpty().withMessage('current password cannot be empty')
    .isLength({min:8, max: 32}).withMessage('current password must be between 8 and 32 characters'),

    body('password').escape()
    .trim().notEmpty().withMessage('new password cannot be empty')
    .isLength({min:8, max: 32}).withMessage('new password must be between 8 and 32 characters')
    .isStrongPassword().withMessage('password must be strong'),/*.matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('New password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('New password must contain at least one number')
    .matches(/[\W_]/).withMessage('New password must contain at least one special character')*/

    /*body('confirmPassword')
    .isLength({min:8, max: 32}).withMessage('new password must be between 8 and 32 characters')
    .custom((confirmPassword, {req}) => {
        if(confirmPassword != req.body.newPassword){
            throw new Error('password doesn\'t match');
        }
        return true;
    })*/
]
export const validatePIN=[
    body('oldPIN').escape()
    .trim().notEmpty().withMessage('current pin required')
    .isLength({min:4,max:6}).withMessage('pin be 4 to 6 chars'),
    
    body('pin').escape()
    .trim().notEmpty().withMessage('new pin required')
    .isLength({min:4, max: 6}).withMessage('new pin be between 4 to 6 chars')
]
