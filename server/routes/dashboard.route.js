import express from 'express';
const router=express.Router();
import limiter from '../middlewares/rateLimit.js'
import {seed,socketSeed,initRecovery,adminLogin,authenticateAdmin,getTodayExpense,changeSuperAdminPassword,changeSuperAdminPIN,sendCredentialRecoveryEmail,resetSuperAdminPassword,resetSuperAdminPIN,getSubAdmins,addSubAdmin,editSubAdmin,deleteSubAdmin,getTelecoms,addTelecom,editTelecom,getDepositRates,toggleSubAdminStatus,editSubAdminAccess,getMBanks,addMBank,updateMBankList,getBankNames,saveBankNames,editContactMedia,getSocialMediaLinks,editSocialMedia,updateDepositRates,getServices,editServices,getUsersByAdmin,getUserByAdmin,toggleUserStatus,editUserAccess,toggleUserNewDevice,removeUserDevice,getUserFeedback,deleteUserFeedback,resetSubAdminPassword,resetSubAdminPIN,addUser,resetUserPassword,resetUserPIN,deleteUserByAdmin,getSlideImages,addSlideImageLink,editSlideImageLink,deleteSlideImageLink,getPGW,addPGW,editPGW,getSMSGateway,addSMSGateway,editSMSGateway,getNotices,addNotice,editNotice,toggleNotice,deleteNotice/*,sendNotice*/,logout, getContactMedia} from '../controllers/admin.controller.js';//import { addBalance, deductBalance } from '../controllers/transaction.controller.js';
import {authAdmin,isSuperAdmin,matchAuthPIN} from '../middlewares/auth.middleware.js';
import {validatePack,validateTxn,validateAuthPIN,validateAdminPassword,validateAdminPIN,validateAddSubAdmin,validateUserPassword,validateUserPIN,validatePackEdit,validateBankNames} from '../validations/dashboard.validation.js'
import {validateUserRegister} from '../validations/user.validation.js'
import {getTelecomBalances,getModemRouting,updateModemRouting,updateTopupTelecomAccess,getTopupHistoryByAdmin,changeTopupStatus,getTopupMethod,changeTopupMethod, getAllOptDriveSummary,getDriveHits,changeHitStatus,getDrivesByAdmin,getDrive,addDrive,editDrive,toggleDriveStatus,deleteDrive, getAllOptRegularSummary,getRegularsByAdmin,getRegular,addRegular,editRegular,toggleRegularStatus,deleteRegular,updateDriveTelecomAccess,updateRegularTelecomAccess,getAllTelecomAccess} from '../controllers/telecom.controller.js';
import {getTodayDepositSummary,getBalanceSummary,getDepositInit,depositInit,getDepositHistoryByAdmin,getWithdrawHistoryByAdmin,changeDepositStatus,changeWithdrawStatus,deleteDepositHistory,addBalanceByAdmin,deductBalanceByAdmin,getDepositMethod,changeDepositMethod} from '../controllers/deposit.controller.js';
import {getBankRequestByAdmin,changeBankRequestStatus,getBillRequestByAdmin,changeBillRequestStatus,changeMbankRequestStatus,getMbankHistoryByAdmin} from '../controllers/request.controller.js'
//import {getTelecomBalances,updateModemRouting,updateTopupTelecomAccess,getTopupHistoryByAdmin,changeTopupMethod} from '../controllers/topup.controller.js'
import {/*changePassword,changePIN,updateUserStatus,*/deleteUser} from '../controllers/user.controller.js'

router.post('/seed', seed);
router.post('/socket-seed', socketSeed);
router.post('/login', adminLogin);
router.get('/auth', authAdmin, authenticateAdmin);
router.get('/admin',authAdmin,isSuperAdmin,getSubAdmins)
router.post('/admin',authAdmin,isSuperAdmin,validateAuthPIN,matchAuthPIN,validateAddSubAdmin,addSubAdmin)
router.patch('/admin/:id',authAdmin,isSuperAdmin,validateAuthPIN,matchAuthPIN,editSubAdmin)
router.patch('/admin/access/:id',authAdmin,isSuperAdmin,editSubAdminAccess)  //dashboard/api/drive-package
router.patch('/admin/status/:id',authAdmin,isSuperAdmin, toggleSubAdminStatus);
router.delete('/admin/:id',authAdmin,isSuperAdmin,deleteSubAdmin)
router.get('/today-expense',authAdmin,getTodayExpense);
router.get('/today-deposit-summary',authAdmin,getTodayDepositSummary);
router.get('/balance-summary', authAdmin, getBalanceSummary);
router.get('/telecom/balance',authAdmin,getTelecomBalances);

router.post('/drive', authAdmin, validatePack, addDrive);///api/drive-package
router.get('/drive/summary', authAdmin, getAllOptDriveSummary);
router.get('/drive/hit', authAdmin, getDriveHits);
router.patch('/drive/telecom-access', authAdmin,isSuperAdmin, updateDriveTelecomAccess)
router.patch('/drive/status/:id', authAdmin, toggleDriveStatus);///api/drive-package/
router.delete('/drive', authAdmin, deleteDrive);///api/drive-package
router.get('/drive/:opt', authAdmin, getDrivesByAdmin);///api/drive-package/opt
router.patch('/drive/:id', authAdmin, validatePackEdit, editDrive);///api/drive-package/id
router.patch('/drive/hit/:id', authAdmin,validateAdminPIN,matchAuthPIN, changeHitStatus);
router.get('/drive/:id',authAdmin,getDrive)

router.get('/regular/summary', authAdmin, getAllOptRegularSummary);
router.post('/regular', authAdmin, validatePack, addRegular);///api/regular-package
router.delete('/regular', authAdmin, deleteRegular);///api/regular-package
router.patch('/regular/telecom-access', authAdmin,isSuperAdmin, updateRegularTelecomAccess)
router.patch('/regular/status/:id', authAdmin, toggleRegularStatus);///api/regular-package/
router.get('/regular/:opt', authAdmin, getRegularsByAdmin);///api/regular-package/opt
router.patch('/regular/:id', authAdmin, validatePackEdit, editRegular);///api/regular-package/id
router.get('/regular/:id',authAdmin,getRegular)

router.get('/deposit/history', authAdmin, getDepositHistoryByAdmin);
router.get('/withdraw/history',authAdmin,getWithdrawHistoryByAdmin)
router.patch('/deposit/:id',authAdmin,validateAdminPIN,matchAuthPIN,changeDepositStatus)
router.patch('/withdraw/:id',authAdmin,changeWithdrawStatus)
router.get('/topup/history', authAdmin, getTopupHistoryByAdmin);
router.patch('/topup/:id',authAdmin,validateAdminPIN,matchAuthPIN,changeTopupStatus)
router.get('/utility-bill/history', authAdmin, getBillRequestByAdmin);
router.patch('/utility-bill/:id',authAdmin,validateAdminPIN,matchAuthPIN, changeBillRequestStatus);
router.get('/bank/history', authAdmin, getBankRequestByAdmin);
router.patch('/bank/:id',authAdmin, changeBankRequestStatus);
router.patch('/mbank/:id',authAdmin,validateAdminPIN,matchAuthPIN,changeMbankRequestStatus)
router.patch('/change-password', authAdmin, /*userValidation,*/ limiter, changeSuperAdminPassword);
router.patch('/change-pin', authAdmin, /*userValidation,*/ limiter, changeSuperAdminPIN);
router.get('/recover-credential/:token',initRecovery)
router.get('/recover-credential/send-email/:credential',sendCredentialRecoveryEmail)
router.patch('/reset-password',resetSuperAdminPassword)
router.patch('/reset-pin',resetSuperAdminPIN)
router.patch('/manage-admin/reset-password/:id',authAdmin,isSuperAdmin,validateAuthPIN,matchAuthPIN,validateAdminPassword,resetSubAdminPassword)//  )
router.patch('/manage-admin/reset-pin/:id',authAdmin,isSuperAdmin,validateAuthPIN,matchAuthPIN,validateAdminPIN,resetSubAdminPIN)  
router.post('/manage-user',authAdmin,isSuperAdmin,validateAuthPIN,matchAuthPIN,validateUserRegister,addUser)
router.get('/manage-user',authAdmin,isSuperAdmin,getUsersByAdmin);
router.get('/manage-user/:id',authAdmin,isSuperAdmin,getUserByAdmin);
router.delete('/manage-user/:id',authAdmin,isSuperAdmin,deleteUserByAdmin);
router.patch('/manage-user/access/:id',authAdmin,isSuperAdmin,editUserAccess);
router.patch('/manage-user/status/:id', authAdmin,  isSuperAdmin, toggleUserStatus);
router.patch('/manage-user/reset-password/:id',authAdmin,isSuperAdmin,validateAuthPIN,matchAuthPIN,validateUserPassword,resetUserPassword);// ,,, );
router.patch('/manage-user/reset-pin/:id',authAdmin,isSuperAdmin,validateAuthPIN,matchAuthPIN,validateUserPIN,resetUserPIN)// ,,, resetUserPIN);
router.patch('/manage-user/device/:id',authAdmin,isSuperAdmin,validateAdminPIN,matchAuthPIN,toggleUserNewDevice)
router.delete('/manage-user/device/:id',authAdmin,isSuperAdmin,validateAdminPIN,matchAuthPIN,removeUserDevice);
router.patch('/deposit/add/:id', authAdmin,isSuperAdmin,validateAuthPIN, matchAuthPIN, addBalanceByAdmin);
router.patch('/deposit/deduct/:id', authAdmin,isSuperAdmin,validateAuthPIN, matchAuthPIN, deductBalanceByAdmin);
//router.put('/status', authAdmin, updateUserStatus);
router.delete('/user/:id', authAdmin,isSuperAdmin, deleteUser);

router.get('/deposit-init', authAdmin, getDepositInit);
router.post('/deposit-init',authAdmin,isSuperAdmin,validateAuthPIN,matchAuthPIN,validateTxn,depositInit);
router.delete('/deposit-init',authAdmin,isSuperAdmin,validateAuthPIN,matchAuthPIN,deleteDepositHistory);

router.get('/telecom', authAdmin, isSuperAdmin, getTelecoms);
router.patch('/telecom', authAdmin,isSuperAdmin, /*validateTelecom,*/ addTelecom);
router.patch('/telecom/:id', authAdmin,isSuperAdmin, /*validateTelecom,*/ editTelecom);
router.get('/telecom-access',authAdmin,getAllTelecomAccess)
router.get('/modem-routing',authAdmin,isSuperAdmin,getModemRouting)
router.patch('/modem-routing', authAdmin,isSuperAdmin, updateModemRouting);
router.get('/deposit-rates',authAdmin,getDepositRates)
router.patch('/deposit-rates',authAdmin,isSuperAdmin,validateAdminPIN,matchAuthPIN,updateDepositRates);
router.get('/deposit/method',authAdmin,isSuperAdmin,getDepositMethod)
router.patch('/deposit/method/:method',authAdmin,isSuperAdmin,changeDepositMethod)
router.get('/topup/method',authAdmin,isSuperAdmin,getTopupMethod)
router.patch('/topup/method/:method',authAdmin,isSuperAdmin,changeTopupMethod)
router.patch('/topup/telecom-access', authAdmin,isSuperAdmin, updateTopupTelecomAccess)
router.get('/mbank',authAdmin,isSuperAdmin,getMBanks)
router.post('/mbank',authAdmin,isSuperAdmin,addMBank)
router.patch('/mbank', authAdmin,isSuperAdmin, updateMBankList);
router.get('/mbank/history',authAdmin,getMbankHistoryByAdmin)
router.get('/bank-names',authAdmin,isSuperAdmin,getBankNames)
router.patch('/bank-names',authAdmin,isSuperAdmin,validateBankNames,saveBankNames)
router.get('/slide-images',authAdmin,isSuperAdmin,getSlideImages)
router.patch('/slide-images',authAdmin,isSuperAdmin,addSlideImageLink)
router.patch('/slide-images/:id',authAdmin,isSuperAdmin,editSlideImageLink)
router.delete('/slide-images/:id',authAdmin,isSuperAdmin,deleteSlideImageLink)
router.get('/pgw',authAdmin,isSuperAdmin,getPGW)
router.patch('/pgw',authAdmin,isSuperAdmin,addPGW)
router.patch('/pgw/:id',authAdmin,isSuperAdmin,editPGW)
router.get('/sms-gateway',authAdmin,getSMSGateway)
router.patch('/sms-gateway',authAdmin,isSuperAdmin,addSMSGateway)
router.patch('/sms-gateway/:id',authAdmin,isSuperAdmin,editSMSGateway)
router.get('/services',authAdmin,isSuperAdmin,getServices)
router.patch('/services',authAdmin,isSuperAdmin,editServices)
router.get('/api-request',authAdmin,getRequestAPI)
router.get('/notice',authAdmin,getNotices)
router.post('/notice',authAdmin,isSuperAdmin,validateAuthPIN,matchAuthPIN,addNotice)
//router.post('/notice/send',authAdmin,sendNotice)
router.patch('/notice/:id',authAdmin,isSuperAdmin,validateAuthPIN,matchAuthPIN,editNotice)
router.patch('/notice/toggle/:id',authAdmin,toggleNotice)
router.delete('/notice/:id',authAdmin,deleteNotice)
router.get('/feedback', authAdmin, getUserFeedback);
router.delete('/feedback/:id', authAdmin,isSuperAdmin, deleteUserFeedback);
router.get('/contacts',authAdmin,isSuperAdmin,getContactMedia)
router.patch('/contacts', authAdmin,isSuperAdmin, editContactMedia);
router.get('/social-links',authAdmin,getSocialMediaLinks)
router.patch('/social-links',authAdmin,editSocialMedia)
router.post('/logout',authAdmin,logout)

export default router;
