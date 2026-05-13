import {InlineBadge} from '../../components/styles/Admin.style';
import {useNotification} from '../../contexts/NotificationContext'
import React from 'react';
export default ()=>{
    const {pendingCounts:{deposit,withdraw,topup,drive,bill,mbank,bank,user}/*,failedCounts:{deposit,topup,regular}*/} = useNotification();
    return [
        {text:"Dashboard",path:"/dashboard/index",access:"index"},
        {text:<>Deposit {deposit>0&&<InlineBadge>{deposit}</InlineBadge>}</>,path:"/dashboard/deposit/history",access:"deposit-history"},
        {text:<>Withdraw {withdraw>0&&<InlineBadge>{withdraw}</InlineBadge>}</>,path:"/dashboard/withdraw/history",access:"withdraw-history"},
        {text:<>Drive {drive>0&&<InlineBadge>{drive}</InlineBadge>}</>,path:"/dashboard/drive/history",access:"drive-history"},
        {text:<>Topup {topup>0&&<InlineBadge>{topup}</InlineBadge>}</>,path:"/dashboard/topup/history",access:"topup-history"},
        {text:<>M Banking {mbank>0&&<InlineBadge>{mbank}</InlineBadge>}</>,path:"/dashboard/mbank/history",access:"mbank-history"},
        {text:<>Bill {bill>0&&<InlineBadge>{bill}</InlineBadge>}</>,path:"/dashboard/utility-bill/history",access:"bill-history"},
        {text:<>Bank {bank>0&&<InlineBadge>{bank}</InlineBadge>}</>,path:"/dashboard/bank/history",access:"bank-history"},
        {text:<>TXN</>,path:"/dashboard/deposit-init",access:"deposit-init"},
        {text:<>Manage Drive</>,path:"/dashboard/manage-package/drive",access:"manage-drive"},
        {text:<>Manage Regular</>,path:"/dashboard/manage-package/regular",access:"manage-regular"},
        {text:<>Users {user>0&&<InlineBadge>{user}</InlineBadge>}</>,path:"/dashboard/manage-user",access:"manage-user"},
        {text:<>Admins</>,path:"/dashboard/manage-admins",access:"manage-admin"},
        {text:<>Deposit Setting</>,path:"/dashboard/deposit-setup",access:"deposit-setup"},
        {text:<>Setting</>,path:"/dashboard/setup",access:"setup"},
        {text:<>Store</>,path:"/dashboard/store",access:"store"},
        {text:<>Notice</>,path:"/dashboard/notice/manage",access:"notice"},
        {text:<>API</>,path:"/dashboard/gateway-api",access:"api"},
        {text:<>Feedback</>,path:"/dashboard/feedback",access:"feedback"}
    ]
}    
