import express from 'express';
import {authenticateAPIUser, registerUser,loginUser,getSliderImages,validateUserPIN,changePassword,changePIN,authenticateUser,getPGWs,deleteUser,getUserBalances,getContactList,getTelecomOpts,getMBankList, getDepositLimit,getModalNotices,seenModalNotices,getNotices,validUser,getRegisterSetting,regfeeByTXN,otpGenerateAndSend,verifyByOTP,getBankNames,getFeedbacksByUser,addFeedback,addAvatar,getUserProfile,loginAPIUser,requestAPI,logout} from '../controllers/user.controller.js';
//import { 
import {validateUserRegister,validateUserLogin,validateTopupRequest,validateDriveHit,validateBillRequest,validateBankRequest,validateMbankTransaction,validateUserFeedback,validateUserAuthPIN} from '../validations/user.validation.js';
import {authAPIUser,authUser,matchUserAuthPIN,authBkash} from '../middlewares/auth.middleware.js';
import limiter from '../middlewares/rateLimit.js';
//import {getContactMedia} from '../controllers/admin.controller.js';
import {sendMoney,cashin,addBankRequest,getBankHistoryByUser,addBillRequest,requestMbankTransaction,getBillHistoryByUser,getMbankHistoryByUser,getBkashHistory,getDBBLHistory,getNagadHistory} from '../controllers/request.controller.js';
/*import {getTopupOpts,topup,changeTopupStatus,getTopupHistoryByUser} from '../controllers/topup.controller.js';*/import {getTopupOpts,topup,changeTopupStatus,getTopupHistoryByUser,getDriveOpts,getDrivesByUser,hitDrive,getDriveHistoryByUser,getRegularOpts,getRegularsByUser} from '../controllers/telecom.controller.js'
import {depositByUser,addBalanceByUser,depositRequest,getDepositHistoryByUser,getWithdrawHistoryByUser,withdraw/*transferBalance*/,bkashPaymentCreate,bkashCallback,sslc,sslcSuccess,sslcCancel,sslcFail,sslcIPN} from '../controllers/deposit.controller.js';

const router = express.Router();

router.get('/register', /*authUser,*/ getRegisterSetting);
router.post('/register/regfee',regfeeByTXN)
router.patch('/register/verify',otpGenerateAndSend)
router.post('/register/verify',verifyByOTP)
router.post('/register', validateUserRegister, registerUser);
router.post('/login', /*userValidation,*/ validateUserLogin, /*limiter,*/ loginUser);
router.get('/auth', authUser, authenticateUser);
router.post('/api-user/login', /*userValidate,*/ validateUserLogin, limiter, loginAPIUser);
router.get("/api-user/auth", authAPIUser, authenticateAPIUser);
router.post('/valid/:username', /*authUser,*/ validUser);
router.get('/image-slider', authUser,  getSliderImages);
//router.post('/change-password', adminAuth, userValidation, limiter, changePassword);
//router.post('/change-pin', adminAuth, userValidation, limiter, changePIN);
router.get('/balance', authUser, getUserBalances/*, limiter, topupBalance*/);
router.post('/balance',authUser,validateUserAuthPIN,matchUserAuthPIN,addBalanceByUser)
router.get('/telecoms', authUser, getTelecomOpts)
router.get('/mbank', authUser, getMBankList)
router.get('/bank',authUser,getBankNames)
router.get('/deposit-info/:level', /*authUser,*/ getDepositLimit);
router.post('/deposit',authUser,depositByUser,depositRequest)
router.post('/deposit/payment/bkash',authUser,authBkash,bkashPaymentCreate)
router.post('/deposit/payment/bkash/callback',authUser,authBkash,bkashCallback)
router.post('/deposit/payment/sslcommerz', authUser, /*validateUserData,*/ sslc);
router.post('/deposit/payment/sslcommerz/success',sslcSuccess)
router.post('/deposit/payment/sslcommerz/fail',sslcFail)
router.post('/deposit/payment/sslcommerz/cancel',sslcCancel)
router.post('/deposit/transfer',authUser,validateUserAuthPIN,matchUserAuthPIN,withdraw/*transferBalance*/)
router.get('/deposit/history',authUser,getDepositHistoryByUser)
router.get('/withdraw/history',authUser,getWithdrawHistoryByUser)
router.get('/topup', authUser, getTopupOpts)
router.post('/topup',authUser,validateUserAuthPIN,matchUserAuthPIN,validateTopupRequest,topup)
router.patch('/topup/:id',authUser,changeTopupStatus)
router.get('/topup/history',authUser,getTopupHistoryByUser)
router.get('/drive',authUser,getDriveOpts);
router.get('/drive/:opt',authUser,getDrivesByUser);
router.post('/drive', authUser,validateUserAuthPIN,matchUserAuthPIN,validateDriveHit, hitDrive);
router.get('/drive/history',authUser,getDriveHistoryByUser)
router.get('/regular',authUser,getRegularOpts);
router.get('/regular/:opt',authUser,getRegularsByUser);
//router('/regular/history',authUser,getRegularHistoryByUser)
router.get('/utility-bill/history', authUser, getBillHistoryByUser);
router.post('/utility-bill', authUser,validateUserAuthPIN,matchUserAuthPIN,validateBillRequest, addBillRequest);
router.post('/send-money',authUser,sendMoney)
router.post('/cash-in',authUser,cashin)
router.get('/bank/history', authUser, getBankHistoryByUser);
router.post('/bank', authUser,validateUserAuthPIN,matchUserAuthPIN, validateBankRequest, addBankRequest);
router.post('/validate-pin',authUser,validateUserPIN)
router.get('/pgws',authUser,getPGWs)
router.get('/mbank/history/:type', authUser, getMbankHistoryByUser);
//router.get('/mbank/history/bkash',authUser,getBkashHistory)
//router.get('/mbank/history/dbbl', authUser, getDBBLHistory);
//router.get('/mbank/history/nagad', authUser, getNagadHistory);
router.post('/mbank',authUser,validateUserAuthPIN,matchUserAuthPIN,validateMbankTransaction,requestMbankTransaction)
router.get('/contacts', authUser, getContactList);
router.post('/api-user/api-request',authUser,requestAPI)
router.get('/feedback',authUser,getFeedbacksByUser)
router.post('/feedback',authUser,validateUserAuthPIN,matchUserAuthPIN,validateUserFeedback,addFeedback)
router.get('/modal-notices',authUser,getModalNotices)
router.patch('/modal-notices/seen',authUser,seenModalNotices)
router.get('/notices', authUser, getNotices);
router.get('/profile',authUser,getUserProfile)
router.post('/upload-avatar',authUser,addAvatar)
router.post('/logout',authUser,logout)
export default router;