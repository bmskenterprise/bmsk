import {body,header} from 'express-validator';

export const validateSubAdmin = [
    body('username').optional({checkFalsy:true}),
    
    body('password').optional({checkFalsy:true})
    .isStrongPassword().withMessage('password must be strong'),
    
    body('pin').optional({checkFalsy:true})
    .matches(/^[0-9]{4,6}$/).withMessage('pin must be 4 to 6 digits')
]

export const validateDriveHit = [
    body('recipient')
    .trim().notEmpty().withMessage('mobile number cannot be empty')
    .isLength({min:11, max: 14}).withMessage('mobile number must be between 11 and 14 characters')
];

export const validatePack = [
    body('title')
    .trim().notEmpty().withMessage('pack title cannot be empty')
    .isLength({min:10, max: 80}).withMessage('pack title must be between 10 and 80 characters'),

    body('price')
    .trim().isNumeric().withMessage('pack must be a number')
    .notEmpty().withMessage('pack price cannot be empty')
    .isInt({min:0  }).withMessage('pack price must be a positive number  '),

    body('operator')
    .isIn(['airtel','banglalink','grameenphone','robi','teletalk']).withMessage('Enter a Valid Operator'),
    body('expireDate').optional({checkFalsy:true}).isISO8601().withMessage('Enter a valid date'),
    
    body('commission')
    .optional({checkFalsy:true}).isInt({min:0}).withMessage('commission must be a number')
];


export const validatePackEdit = [
    body('title').optional({checkFalsy:true})
    .isLength({min:10,max:80}).withMessage('pack title must be between 10 and 80 characters'),

    body('price').optional({checkFalsy:true})
    .isNumeric().withMessage('pack must be a number')
    .isInt({min:0}).withMessage('pack price must be a positive number'),
    
    body('expireDate').optional({checkFalsy:true}).isISO8601().withMessage('Enter a valid date')
]

export const validateTxn= [
    body('txn')
    .trim().notEmpty().withMessage('txn is required'),
    body('amount')
    .trim().notEmpty().withMessage('amount is required'),
    body('user')
    .trim().notEmpty().withMessage('user is required')
];
export const validateAdminPassword = [
    body('password')
    .trim().notEmpty().withMessage('admin password is required ')
    .isLength({min:6, max: 32}).withMessage('admin password must be between 6 and 32 characters')
    .isStrongPassword().withMessage('admin password must be strong')
]

export const validateAdminPIN = [
    body('pin')
    .trim().notEmpty().withMessage(' pin is required ')
    //.exists().withMessage('admin pin is required')
    .isLength({min:4,max:6}).withMessage('admin pin must be between 4 and 6 characters')
    .matches(/^\d+$/).withMessage('admin pin must be a number')
]
export const validateUserPassword = [
    body('password')
    .trim().notEmpty().withMessage('user password is required ')
    .isLength({min:6, max: 32}).withMessage('user password must be between 6 and 32 characters')
    .isStrongPassword().withMessage('user password must be strong')
]

export const validateUserPIN = [
    body('pin')
    .trim().notEmpty().withMessage('user pin is required ')
    //.exists().withMessage('admin pin is required')
    .isLength({min:4,max:6}).withMessage('user pin must be between 4 and 6 characters')
    .matches(/^\d+$/).withMessage('user pin must be a number')
]

export const validateAuthPIN = [
    header('x-admin-pin')
    .exists().withMessage('admin pin is required')
    .isLength({min:4,max:6}).withMessage('admin pin must be between 4 and 6 characters')
    .matches(/^\d+$/).withMessage('admin pin must be a number')
]
export const validateBankNames = [
    body('banks')
    .isString().withMessage('bank names must be a comma separated list of string')
    .custom((value) => {
        value.split(/[,\n]/).forEach((item ) => {
        if(item.length>50) throw new Error('Bank name should be less than 50 characters')
        })
        return true
    })
]
export const validateRequestStatus =[
    body('username').trim().notEmpty().withMessage('username is required'),
    body('status').isIn(['SUCCESS','FAILED']).withMessage('status must be SUCCESS or FAILED'),
    body('feedback').optional({checkFalsy:true}).isIn(['unavailable','invalid','error']).withMessage('feedback must be unavailable, invalid or error')
]
    //.isLength({min:2, max: 100}).withMessage('drive title must be between 2 and 100 characters'),