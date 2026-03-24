import {useMemo} from 'react'
import {Routes,Route,useNavigate} from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'
import {ThemeProvider} from 'styled-components'
import {useTheme} from './contexts/ThemeContext'
import UserRoute from './routes/UserRoute';
import DashboardRoute from './routes/DashboardRoute';
import Index from './pages/Index'
import APIUserLogin from './pages/APIUserLogin'
import APIUserSignup from './pages/APIUserSignup'
import APIUserForgot from './pages/APIUserForgot'
import TopupAPIs from './pages/TopupAPIs'
import DriveAPIs from './pages/DriveAPIs'
import RegularAPIs from './pages/RegularAPIs'
import Login from './pages/dashboard/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Drive from './pages/dashboard/Drive'
import ManageDrive from './pages/dashboard/ManageDrive';
import ManageRegular from './pages/dashboard/ManageRegular'
import BankHistory from './pages/dashboard/BankHistory'
import BillHistory from './pages/dashboard/BillHistory'
import DepositHistory from './pages/dashboard/DepositHistory'
import TopupHistory from './pages/dashboard/TopupHistory'
import ManageNotice from './pages/dashboard/ManageNotice';
import SendNotice from './pages/dashboard/SendNotice';
import ChangeSuperAdminCredential from './pages/dashboard/ChangeCredential';
import ResetSubAdminCredential from './pages/dashboard/ResetAdminCredential';
import ResetUserCredential from './pages/dashboard/ResetUserCredential';
import ResetSuperAdminCredential from './pages/ResetSuperAdminCredential'
import Setup from './pages/dashboard/Setup';
import DepositRate from './pages/dashboard/Deposit';
import TXNID from './pages/dashboard/TxnID'
import Users from './pages/dashboard/Users';
import UserDetail from './pages/dashboard/UserDetail';
import Feedback from './pages/dashboard/Feedback'
import Balance from './pages/dashboard/Balance';
import Admins from './pages/dashboard/Admins'
import APIRequest from './pages/dashboard/APIRequest'
import APISetup from './pages/dashboard/APISetup'
import NotFound from './pages/dashboard/NotFound';
import {PackProvider} from './contexts/PackContext';
import {useAdminAuth/*,changePassword,changePIN*/} from './contexts/AdminAuthContext';
import {UserProvider} from './contexts/UserContext';
import {MessageProvider} from './contexts/MessageContext'
import RegularForm from './pages/dashboard/RegularForm';
import DriveForm from './pages/dashboard/DriveForm';
import RegularList from './pages/dashboard/RegularList';
import DriveList from './pages/dashboard/DriveList';
import MbankHistory from './pages/dashboard/MbankHistory'
import WithdrawHistory from './pages/dashboard/WithdrawHistory'   //
//import Store from './pages/dashboard/Store'
//CDK9I7WULV01788353710 
export default ()=>{
  let {themeData,modeData} = useTheme()
  const Navigate = useNavigate();
  const theme = useMemo(()=> ({themeData,modeData}), [themeData,modeData])
     

  return (<div style={{width:'100%',height:'100%'}}>
    <ThemeProvider theme={theme} >
    <Routes>
        <Route path='/' element={<Index/>}></Route>
        <Route path='/user/signup' element={<APIUserSignup/>}/>
        <Route path='/user/forgot' element={<APIUserForgot/>}/>
        <Route path='/user/login' element={<APIUserLogin/>}></Route>
        <Route path='/recover-password/:token' element={<ResetSuperAdminCredential/>}/>
        <Route path='/recover-pin/:token' element={<ResetSuperAdminCredential/>}/>
        {/*<Route path='/dashboard' element={<Navigate to={admin?'/dashboard':'/login'} />}></Route>*/}
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/user/*' element={<UserRoute></UserRoute> }>
          <Route path='topup' element={<TopupAPIs/>} />
          <Route path='drive' element={<DriveAPIs/>} />
          <Route path='regular' element={<RegularAPIs/>}/>
        </Route>
        <Route path='dashboard/*' element={<DashboardRoute />}>
          <Route path='index' element={<Dashboard/>} />
          <Route path='drive/history' element={<Drive/>}/>
          <Route path='utility-bill/history' element={<BillHistory/>}></Route>
          <Route path='mbank/history' element={<MbankHistory/>}/>
          <Route path='bank/history' element={<BankHistory/>}></Route>
          <Route path='deposit/history' element={<DepositHistory/>}></Route>
          <Route path='withdraw/history' element={<WithdrawHistory/>}></Route>
          <Route path='deposit-init' element={<TXNID/>}></Route>
          <Route path='topup/history' element={<TopupHistory/>}></Route>
          <Route path='manage-package/*'
            element={<PackProvider><Routes>
            <Route path='drive' element={<ManageDrive/>} />
            <Route path='regular' element={<ManageRegular/>}/>
            <Route path='regular/add' element={<RegularForm/>} />
            <Route path='regular/edit/:id' element={<RegularForm/>} />
            <Route path='drive/add' element={<DriveForm/>} />
            <Route path='drive/edit/:id' element={<DriveForm/>} />
            <Route path='regular/:opt' element={<RegularList/>} />
            <Route path='drive/:opt' element={<DriveList/>} />
            </Routes></PackProvider>}/>
          <Route path='manage-user/*'
            element={<UserProvider><Routes>
            <Route path='' element={<Users/>} />
            <Route path=':id' element={<UserDetail/>} />
            <Route path='balance/:id' element={<Balance/>} />
            <Route path='reset-credential' element={<ResetUserCredential /*handleSubmit={changeUserPassword}*//>}/>
            </Routes></UserProvider>}/>
          <Route path='change-password' element={<ChangeSuperAdminCredential /*handleSubmit={changePassword}*//>}/>
          <Route path='change-pin' element={<ChangeSuperAdminCredential /*handleSubmit={changePIN}*//>}/>
          {/*<Route path='manage-users/reset-credential' element={<ResetUserCredential //handleSubmit={changeUserPIN}///>}/>*/}
          <Route path='manage-admins' element={<Admins/>}/>
          <Route path='manage-admins/reset-credential' element={<ResetSubAdminCredential/>}/>
          <Route path='setup' element={<Setup/>}></Route>
          <Route path='deposit-setup' element={<DepositRate/>}></Route>
          {/*<Route path='store' element={<Store/>}/>*/}
          <Route
            path='notice/*'
            element={
            <MessageProvider>
              <Routes>
                <Route path='manage' element={<ManageNotice/>} />
                <Route path='add' element={<SendNotice/>}/>
                <Route path='edit' element={<SendNotice/>}/>
              </Routes>
            </MessageProvider>
            }>
          </Route>
          <Route path='feedback' element={<Feedback/>}></Route>
          <Route path='api-request' element={<APIRequest/>}></Route>
          <Route path='api-setup' element={<APISetup/>}></Route>
          <Route path='change-password' element={<ChangeSuperAdminCredential/>}/>
          <Route path='change-pin' element={<ChangeSuperAdminCredential/>}></Route>
        </Route>
        <Route path='*' element={<NotFound/>}/>
      </Routes>
      </ThemeProvider>
    </div>
  )
}
