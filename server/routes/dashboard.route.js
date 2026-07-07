import express from 'express';
const router=express.Router();
import limiter from '../middlewares/rateLimit.js'
import {seed,initRecovery,adminLogin,authenticateAdmin,getTodayExpense,changeSuperAdminPassword,changeSuperAdminPIN,sendCredentialRecoveryEmail,resetSuperAdminPassword,resetSuperAdminPIN,getSubAdmins,addSubAdmin,editSubAdmin,deleteSubAdmin,getDepositRates,toggleSubAdminStatus,editSubAdminAccess,getMBanks,addMBank,updateMBankList,getBankNames,saveBankNames,editContactMedia,getSocialMediaLinks,editSocialMedia,updateDepositRates,getServices,editServices,getUsersByAdmin,getUserByAdmin,toggleUserStatus,editUserAccess,toggleUserNewDevice,removeUserDevice,getUserFeedback,deleteUserFeedback,resetSubAdminPassword,resetSubAdminPIN,addUser,resetUserPassword,resetUserPIN,deleteUserByAdmin,getSlideImages,addSlideImageLink,editSlideImageLink,deleteSlideImageLink,getPGW,addPGW,editPGW,getSMSGateway,addSMSGateway,editSMSGateway,getNotices,addNotice,editNotice,toggleNotice,deleteNotice/*,sendNotice*/,logout, getContactMedia} from '../controllers/admin.controller.js';//import { addBalance, deductBalance } from '../controllers/transaction.controller.js';
import {authAdmin,isSuperAdmin,matchAuthPIN} from '../middlewares/auth.middleware.js';
import {validatePack,validateTxn,validateAuthPIN,validateAdminPassword,validateAdminPIN,validateAddSubAdmin,validateUserPassword,validateUserPIN,validatePackEdit,validateBankNames} from '../validations/dashboard.validation.js'
import {validateUserRegister} from '../validations/user.validation.js'
import {getTelecomBalances,getModemRouting,updateModemRouting,updateTopupTelecomAccess,getTelecoms,addTelecom,editTelecom,getTelecomCategories,addTelecomCategory,editTelecomCategory,deleteTelecomCategory,getTopupHistoryByAdmin,changeTopupStatus,getTopupMethod,changeTopupMethod, getAllOptDriveSummary,getDriveHits,changeHitStatus,getDrivesByAdmin,getDrive,addDrive,editDrive,toggleDriveStatus,deleteDrive, getAllOptRegularSummary,getRegularsByAdmin,getRegular,addRegular,editRegular,toggleRegularStatus,deleteRegular,updateDriveTelecomAccess,updateRegularTelecomAccess,getAllTelecomAccess} from '../controllers/telecom.controller.js';
import {getTodayDepositSummary,getBalanceSummary,getDepositInit,depositInit,getDepositHistoryByAdmin,getWithdrawHistoryByAdmin,changeDepositStatus,changeWithdrawStatus,deleteDepositHistory,addBalanceByAdmin,deductBalanceByAdmin,getDepositMethod,changeDepositMethod} from '../controllers/deposit.controller.js';
import {getBankRequestByAdmin,changeBankRequestStatus,getBillRequestByAdmin,changeBillRequestStatus,changeMbankRequestStatus,getMbankHistoryByAdmin} from '../controllers/request.controller.js'
//import {getTelecomBalances,updateModemRouting,updateTopupTelecomAccess,getTopupHistoryByAdmin,changeTopupMethod} from '../controllers/topup.controller.js'
import {/*changePassword,changePIN,updateUserStatus,*/deleteUser} from '../controllers/user.controller.js'

router.post('/seed', seed);
//router.post('/socket-seed', socketSeed);
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
router.patch('/drive/telecom-access', authAdmin, updateDriveTelecomAccess)
router.patch('/drive/status/:id', authAdmin, toggleDriveStatus);///api/drive-package/
router.delete('/drive', authAdmin, deleteDrive);///api/drive-package
router.get('/drive/:opt', authAdmin, getDrivesByAdmin);///api/drive-package/opt
router.patch('/drive/:id', authAdmin, validatePackEdit, editDrive);///api/drive-package/id
router.patch('/drive/hit/:id', authAdmin,validateAuthPIN,matchAuthPIN, changeHitStatus);
router.get('/drive/:id',authAdmin,getDrive)

router.get('/regular/summary', authAdmin, getAllOptRegularSummary);
router.post('/regular', authAdmin, validatePack, addRegular);///api/regular-package
router.delete('/regular', authAdmin, deleteRegular);///api/regular-package
router.patch('/regular/telecom-access', authAdmin, updateRegularTelecomAccess)
router.patch('/regular/status/:id', authAdmin, toggleRegularStatus);///api/regular-package/
router.get('/regular/:opt', authAdmin, getRegularsByAdmin);///api/regular-package/opt
router.patch('/regular/:id', authAdmin, validatePackEdit, editRegular);///api/regular-package/id
router.get('/regular/:id',authAdmin,getRegular)

router.get('/deposit/history', authAdmin, getDepositHistoryByAdmin);
router.get('/withdraw/history',authAdmin,getWithdrawHistoryByAdmin)
router.patch('/deposit/:id',authAdmin,validateAuthPIN,matchAuthPIN,changeDepositStatus)
router.patch('/withdraw/:id',authAdmin,validateAuthPIN,matchAuthPIN,changeWithdrawStatus)
router.get('/topup/history', authAdmin, getTopupHistoryByAdmin);
router.patch('/topup/:id',authAdmin,validateAuthPIN,matchAuthPIN,changeTopupStatus)
router.get('/utility-bill/history', authAdmin, getBillRequestByAdmin);
router.patch('/utility-bill/:id',authAdmin,validateAuthPIN,matchAuthPIN, changeBillRequestStatus);
router.get('/bank/history', authAdmin, getBankRequestByAdmin);
router.patch('/bank/:id',authAdmin,validateAuthPIN,matchAuthPIN, changeBankRequestStatus);
router.patch('/mbank/:id',authAdmin,validateAuthPIN,matchAuthPIN,changeMbankRequestStatus)
router.patch('/change-password', authAdmin, /*userValidation,*/ limiter, changeSuperAdminPassword);
router.patch('/change-pin', authAdmin, /*userValidation,*/ limiter, changeSuperAdminPIN);
router.get('/recover-credential/:token',initRecovery)
router.get('/recover-credential/send-email/:credential',sendCredentialRecoveryEmail)
router.patch('/reset-password',resetSuperAdminPassword)
router.patch('/reset-pin',resetSuperAdminPIN)
router.patch('/manage-admin/reset-password/:id',authAdmin,isSuperAdmin,validateAuthPIN,matchAuthPIN,validateAdminPassword,resetSubAdminPassword)//  )
router.patch('/manage-admin/reset-pin/:id',authAdmin,isSuperAdmin,validateAuthPIN,matchAuthPIN,validateAdminPIN,resetSubAdminPIN)  
router.post('/manage-user',authAdmin,validateAuthPIN,matchAuthPIN,validateUserRegister,addUser)
router.get('/manage-user',authAdmin,getUsersByAdmin);
router.get('/manage-user/:id',authAdmin,getUserByAdmin);
router.delete('/manage-user/:id',authAdmin,deleteUserByAdmin);
router.patch('/manage-user/access/:id',authAdmin,editUserAccess);
router.patch('/manage-user/status/:id', authAdmin,   toggleUserStatus);
router.patch('/manage-user/reset-password/:id',authAdmin,validateAuthPIN,matchAuthPIN,validateUserPassword,resetUserPassword);// ,,, );
router.patch('/manage-user/reset-pin/:id',authAdmin,validateAuthPIN,matchAuthPIN,validateUserPIN,resetUserPIN)// ,,, resetUserPIN);
router.patch('/manage-user/device/:id',authAdmin,validateAdminPIN,matchAuthPIN,toggleUserNewDevice)
router.delete('/manage-user/device/:id',authAdmin,validateAdminPIN,matchAuthPIN,removeUserDevice);
router.patch('/deposit/add/:id', authAdmin,validateAuthPIN, matchAuthPIN, addBalanceByAdmin);
router.patch('/deposit/deduct/:id', authAdmin,validateAuthPIN, matchAuthPIN, deductBalanceByAdmin);
//router.put('/status', authAdmin, updateUserStatus);
router.delete('/user/:id', authAdmin, deleteUser);

router.get('/deposit-init', authAdmin, getDepositInit);
router.post('/deposit-init',authAdmin,validateAuthPIN,matchAuthPIN,validateTxn,depositInit);
router.delete('/deposit-init',authAdmin,validateAuthPIN,matchAuthPIN,deleteDepositHistory);

router.get('/telecom', authAdmin,  getTelecoms);
router.patch('/telecom', authAdmin, /*validateTelecom,*/ addTelecom);
router.patch('/telecom/:id', authAdmin, /*validateTelecom,*/ editTelecom);
router.get('/telecom-access',authAdmin,getAllTelecomAccess)
router.get('/modem-routing',authAdmin,getModemRouting)
router.patch('/modem-routing', authAdmin, updateModemRouting);
router.get('/deposit-rates',authAdmin,getDepositRates)
router.patch('/deposit-rates',authAdmin,validateAdminPIN,matchAuthPIN,updateDepositRates);
router.get('/deposit/method',authAdmin,getDepositMethod)
router.patch('/deposit/method/:method',authAdmin,changeDepositMethod)
router.get('/topup/method',authAdmin,getTopupMethod)
router.patch('/topup/method/:method',authAdmin,changeTopupMethod)
router.patch('/topup/telecom-access', authAdmin, updateTopupTelecomAccess)
router.get('/mbank',authAdmin,getMBanks)
router.post('/mbank',authAdmin,addMBank)
router.patch('/mbank', authAdmin, updateMBankList);
router.get('/mbank/history',authAdmin,getMbankHistoryByAdmin)
router.get('/bank-names',authAdmin,getBankNames)
router.patch('/bank-names',authAdmin,validateBankNames,saveBankNames)
router.get('/slide-images',authAdmin,getSlideImages)
router.patch('/slide-images',authAdmin,addSlideImageLink)
router.patch('/slide-images/:id',authAdmin,editSlideImageLink)
router.delete('/slide-images/:id',authAdmin,deleteSlideImageLink)
router.get('/telecom-category',authAdmin,getTelecomCategories)
router.patch('/telecom-category',authAdmin,addTelecomCategory)
router.patch('/telecom-category/:id',authAdmin,editTelecomCategory)
router.delete('/telecom-category/:id',authAdmin,deleteTelecomCategory)
router.get('/pgw',authAdmin,getPGW)
router.patch('/pgw',authAdmin,addPGW)
router.patch('/pgw/:id',authAdmin,editPGW)
router.get('/sms-gateway',authAdmin,getSMSGateway)
router.patch('/sms-gateway',authAdmin,addSMSGateway)
router.patch('/sms-gateway/:id',authAdmin,editSMSGateway)
router.get('/services',authAdmin,getServices)
router.patch('/services',authAdmin,editServices)
//router.get('/api-request',authAdmin,getRequestAPI)
router.get('/notice',authAdmin,getNotices)
router.post('/notice',authAdmin,validateAuthPIN,matchAuthPIN,addNotice)
//router.post('/notice/send',authAdmin,sendNotice)
router.patch('/notice/:id',authAdmin,validateAuthPIN,matchAuthPIN,editNotice)
router.patch('/notice/toggle/:id',authAdmin,toggleNotice)
router.delete('/notice/:id',authAdmin,deleteNotice)
router.get('/feedback', authAdmin, getUserFeedback);
router.delete('/feedback/:id', authAdmin, deleteUserFeedback);
router.get('/contacts',authAdmin,getContactMedia)
router.patch('/contacts', authAdmin, editContactMedia);
router.get('/social-links',authAdmin,getSocialMediaLinks)
router.patch('/social-links',authAdmin,editSocialMedia)
router.post('/logout',authAdmin,logout)

export default router;
