import {balanceTypes} from '../../Preferences.json';
import validURL from './validURL';
    let passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,32}$/;
    let pinRegex = /^\d{4,6}$/
///^[^\sa-zA-Z]{2}[^\s]{0,14}$/
export const validateAdminLogin =({username,password})=> {
    let validationErrors={}
    if(!username) validationErrors.username = 'enter your username';
    if(!/^[a-zA-Z0-9!@#$%^&*]{2,32}$/.test(username)) validationErrors.username = 'invalid username';
    if(!password) validationErrors.password = 'enter your password';
    if(!(/^[^\s]{4,32}$/.test(password))) validationErrors.password= 'invalid password';
    return validationErrors
}

export const validateAdminAdd =({username,password,pin})=> {
    let validationErrors={}
    if(!/^[^\s]{4,20}$/.test(username)) validationErrors.username='invalid username'
    if(!username) validationErrors.username = 'username is required';
    if(!passwordRegex.test(password)) validationErrors.password = 'invalid password'
    if(!password) validationErrors.password = 'password is required';
    if(!pinRegex.test(pin)) validationErrors.pin = 'invalid pin'
    if(!pin) validationErrors.pin = 'pin is required'
    return validationErrors
}

export const validateAdminEdit = (username,data)=>{
    let validationErrors ={}
    if(data.username!=username && !/^[^\s]{4,20}$/.test(data.username)) validationErrors.username = 'username must be between 4 to 20 characters'
    if(data.password&&!passwordRegex.test(data.password)) validationErrors.password = 'invalid password ';
    if(data.pin&&!pinRegex.test(data.pin)) validationErrors.pin = 'invalid pin ';
    return validationErrors
}

export const validatePassword = (data) => {
    let validationErrors = {}
    if(data.password.length<6||data.password.length>32) {validationErrors.password= "password should be between 6 to 32 characters";}
    if(!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,32}$/.test(data.password)) {validationErrors.password='choose a strong password including at least one uppercase letter, one lowecase letter, one digit, one symbol';}
    if(!data.password) {validationErrors.password = 'enter your password';}
    if(data.confirm&&data.confirm!=data.password) validationErrors.confirm = 'password doesn\'t match'
    if(!data.confirm) {validationErrors.confirm = 'confirm the password';}
    return validationErrors
    
}
export const validatePIN=(data)=>{
    let validationErrors ={}
    if(!data.pin) {validationErrors.pin = 'enter your pin';return validationErrors}
    if(data.pin.length<4||data.pin.length>6) {validationErrors.pin= 'pin should be between 4 to 6 characters';}
    if(!pinRegex.test(data.pin)) {validationErrors.pin= 'invalid pin';}
    if(data.confirm&&data.confirm!=data.pin) validationErrors.confirm = 'pin doesn\'t match'
    return validationErrors
}

export const validateAdminAuthPIN = (pin) => {
    let validationErrors ={}
    if(!pinRegex.test(pin)) {validationErrors.adminPin= 'invalid superadmin pin';/*return validationErrors*/}
    if(!pin) {validationErrors.adminPin = 'superadmin pin is required';}
    return validationErrors
}

export const validateCredential =(data)=>{
    let validationErrors ={}
    if(!data.oldPassword) validationErrors.oldCredential ='Old password is required';
    else if(data.oldPassword && !passwordRegex.test(data.oldPassword)) validationErrors.oldCredential ='Invalid old password';
    if(!data.newPassword) validationErrors.newCredential ='New passwrd is required';
    else if(data.newPassword && !passwordRegex.test(data.newPassword)) validationErrors.newCredential ='Invalid new password';
    else if(data.newPassword && !validationErrors.newCredentials && data.confirm!=data.newPassword) validationErrors.confirm='does not match';

    if (!data.oldPIN) validationErrors.oldCredential = 'Old pin is required';
    else if(data.oldPIN && !(pinRegex.test(data.oldPIN))) validationErrors.oldCredential = 'Old pin is invalid';
    if (!data.newPIN) validationErrors.newCredential = 'New pin is required';
    else if(data.newPIN && !(pinRegex.test(data.newPIN))) validationErrors.newCredential = 'New pin is invalid';
    else if(data.newPIN && !validationErrors.newCredential && data.confirm!=data.newPIN) validationErrors.confirm='does not match';
    return validationErrors
}


export const validateUser= (data)=>{
    let validationErrors={}
    if(!data.level) validationErrors.level = 'level is required';
    if(!(/^01[3-9]\d{8}$/.test(data.username))){validationErrors.username='invalid username';}
    if(!data.username) validationErrors.username = 'username is required'
    if(!/^[A-Za-z. ]{2,32}$/.test(data.fullname)) validationErrors.fullname = 'invalid fullname'
    if(!data.fullname) validationErrors.fullname = 'fullname is required'
    if(!(/^(?:\d{10}|\d{13}|\d{17})$/.test(data.nid))) validationErrors.nid = 'invalid nid';
    if(!data.nid) validationErrors.nid = 'nid is required';
    if(!(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,16}$/.test(data.password))){validationErrors.password='invalid password';}
    if(!data.password) validationErrors.password = 'password is required'
    if(!(/^\d{4,6}$/.test(data.pin))){validationErrors.pin='invalid pin';}
    if(!data.pin) validationErrors.pin = 'pin is required'
    //if(!/^\d{4,6}$/.test(data.adminPIN)) validationErrors.adminPIN = "invalid admin pin";
    return validationErrors;
}
export const validateUserBalance = (data)=>{
    let validationErrors = {};
        if(isNaN(data.amount)) validationErrors.amount = 'invalid amount'//);return}// is required'
        if(!data.amount) validationErrors.amount = 'amount is required'
        if(!balanceTypes.includes(data.balanceType)) validationErrors.balanceType = 'balance type is required'
        if(!['add','deduct'].includes(data.actionType)) validationErrors.actionType = 'action type is required'
       return validationErrors
}

export const validateDrivePack = ({title,price,commission})=>{
    let validationErrors={}
    if(!title) validationErrors.title = 'pack title is required';
    if(title.length<8||title.length>80) validationErrors.title = 'pack title must be between 8 to 80 chars';
    if(!price) validationErrors.price = 'pack price is required';
    if(parseInt(price)<0) validationErrors.price = 'pack price must be a positive Number';
    if(!commission) validationErrors.commission = 'pack commission is required';
    if(parseInt(commission)<0) validationErrors.price = 'pack price must be a positive Number';
    return validationErrors;
}
export const validateRegularPack = ({title,price})=>{
    let validationErrors={}
    if(!title) validationErrors.title = 'pack title is required';
    if(title.length<8||title.length>50) validationErrors.title = 'pack title must be less than 50 chars';
    if(!price) validationErrors.price = 'pack price is required';
    if(parseInt(price)<0) validationErrors.price = 'pack price must be a positive Number';
    return validationErrors;
}

export const validateTelecom = (telecoms,data)=>{
    let validationErrors={}
    const {name,newName,icon} = data;
    if(newName==='' || !(/^.{2,16}$/.test(newName))) validationErrors.name='Enter a valid name';
    if(name && newName!==name && telecoms.some(t=>t.name==newName)) validationErrors.newName = 'telecom name already exist';
    if(!name && telecoms.some(t=>t.name==newName)) validationErrors.newName = 'telecom name already exist';
    if(!validURL(icon)) validationErrors.icon='invalid icon URL';return validationErrors;
}
export const validateMBank = (data)=>{
    let validationErrors={}
    if(!data.name) validationErrors.name = 'name is required'
    if(data.icon&&!validURL(data.icon)) validationErrors.icon = 'icon should be a url';
    if(!data.icon) validationErrors.icon = 'icon url is required' //modifiedFields.merchantID = merchantID;
    return validationErrors;
}

export const validateAddAPIGateway = (gateways,{name,icon,merchantID,apiKey,apiPassword})=>{
    let validationErrors={}
    if(name && /*newName!=name &&*/ gateways.some(gw=>gw.name==name)) validationErrors.name = 'gateway name already exist';
    if(!name) validationErrors.name ='gateway name required'
    if(!/^[A-Za-z0-9\s]{2,32}$/.test(name)) validationErrors.name = 'invalid gateway name ';
    if(icon&&!validURL(icon)) validationErrors.icon = 'invalidurl'
    //if(merchantID && !/^[A-Z][a-z][0-9]{2,80}$/.test(merchantID)) validationErrors.merchantID = 'invalid merchant id';
    //if(!(apiKey)) validationErrors.apiKey = 'api key is required';
    //else if(apiKey.includes(' ') || (apiKey.length>500)) validationErrors.apiKey = 'api key is invalid';
    //if (!(apiPassword)) validationErrors.apiPassword = 'api password is required';
    //else if(apiPassword.includes(' ') || (apiPassword.length>500)) validationErrors.apiPassword = 'api password is invalid';
    return validationErrors;
}

export const validateEditAPIGateway = (gateways,{name,merchantID,apiKey,apiPassword})=>{
    let validationErrors={}
    if(name&&gateways.some(gw=>gw.name==name)) validationErrors.name = 'gateway name already exist';
    if(name&&!/^[A-Z][a-z]$/.test(name)) validationErrors.name='invalid gateway name'
    if(name&&name.length<2&&name.length>32) validationErrors.name = 'gateway name should be between 2 to 32 chars'
    if(merchantID&&!(/^[A-Z][a-z][0-9]{2,80}$/).test(merchantID)) validationErrors.merchantID = 'invalid merchantId  ';
    if(apiKey&&!(/^[A-Z][a-z][0-9]{2,500}$/).test(apiKey)) validationErrors.apiKey = 'invalid apiKey';
    if(apiPassword&&!(/^[A-Z][a-z][0-9]{2,500}$/).test(apiPassword)) validationErrors.apiPassword = 'invalid gateway password';// too long
    return validationErrors
}

export const validateTxn = ({txn,amount,user}) =>{
    let validationErrors={}
    if(user=='') validationErrors.sender = 'sender is';
    if(!(/^(?:\+88|01)?\d{11}\r?$/.test(user))) validationErrors.sender = 'invalid sender';
    if(0>=amount || !amount) validationErrors.amount='amount must be greater than 0 and a positive number'
    if(txn=='') validationErrors.tnx = 'transaction id required';
    if(!(/^[a-zA-Z0-9!@#$%^&*]{4,80}$/.test(txn))) validationErrors.tnx = 'invalid transaction id';
    return validationErrors;
}
export const validateAPIUser = ({username,email,password})=> {
    let validationErrors={}
    if(username=='') validationErrors.username ='username is required';
    else if(!/^(?:\+88|01)?\d{11}\r?$/.test(username)) validationErrors.username = 'username must be a mobile number'
    if(email && !(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email))) validationErrors.email = 'invalid email'
    if(password=='') validationErrors.password ='password is required';
    else if(!/^[a-zA-Z0-9!@#$%^&*]{6,16}$/.test(password)) validationErrors.password = 'invalid password'
    return validationErrors
}
