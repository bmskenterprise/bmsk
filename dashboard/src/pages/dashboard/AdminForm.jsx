import {useState} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {FaEye,FaEyeSlash} from 'react-icons/fa';
import {useTheme} from '../../contexts/ThemeContext';
import {useAdminAuth} from '../../contexts/AdminAuthContext';
import {Col,FlexH,GapV,GapH,InputField,ErrorText,ThemeButton,IconButton} from '../../components/styles/Admin.style';
import AdminPIN from '../../components/AdminPIN';
import SwitchItem from '../../components/Switch'

export default () =>{
    const navigate = useNavigate()
    const location = useLocation()
    const {thememode,modeData:{textPrimary},themeData:{themeBackground}} = useTheme();
    const {errors} = useAdminAuth();
    const {admin,adminData,accesses} = location?.state;
      const [show,setShow] = useState(false)
    const [editedAccesses,setEditedAccesses] = useState(accesses)
    const [editedData,setEditedData] = useState(adminData)
    const {/*admin,admins,toggleSubAdminStatus,fetchAdmins,*/addSubAdmin,editSubAdmin,editSubAdminAccess,sendRecoveryEmail,loading} = useAdminAuth()
        
    const handleChange = (e) =>{
        if(e.target.checked) setEditedAccesses(prev=>[...prev,e.target.value])
        else setEditedAccesses(prev=>prev.filter(access=>access!==e.target.value))
    }
    const handleForm = (e) =>{
        e.preventDefault()
        let form = e.target
        let formData ={username:form.username?.value.trim(),phone:form.phone?.value.trim(),fullname:form.fullname?.value.trim(),email:form.email?.value.trim(),nid:form.nid?.value.trim(),password:form.password?.value.trim(),pin:form.pin?.value.trim()/*,adminPIN:e.target['admin-pin'].value.trim()*/}
        if(!admin?.id && accesses.length>0) {AdminPIN([thememode,themeBackground],{cb:addSubAdmin,data:{formData,accesses:new Set(editedAccesses),cancelForm}},'ADD');return}
        if(accesses.length>0) {AdminPIN([thememode,themeBackground],{cb:editSubAdminAccess,data:{id:editedData?.id,editedAccesses:new Set(editedAccesses),cancelForm}},'EDIT');return}
        if(admin?.id) {AdminPIN([thememode,themeBackground],{cb:editSubAdmin,data:{admin:{id:editedData?.id,username:editedData?.username},formData,cancelForm}},'EDIT');return}
    }
    const cancelForm = e =>{navigate(-1)/*setEditAccess(false);setOpenForm(false);setEditedData(null)*/}



               return <div>
                   {/*admin?.id&&<h4>{admin?.username}</h4><h5>Access Permission</h5><GapV x='4'/>*/}
     <form onSubmit={handleForm}>
                <FlexH x='space-between' style={{width:'100%'}}>
                    {(!admin.id||accesses.length==0)&&<Col  ><div /*x='flex-start'*/>
                        <InputField placeholder='Username' name='username' onChange={e=>setEditedData(prev=>({...prev,username:e.target.value.trim()}))} value={editedData?.username}/>
                        <ErrorText>{errors?.username}</ErrorText>
                    </div><GapV x='3'/>
                    <div>
                        <InputField name='phone' placeholder='Mobile Number' onChange={e=>setEditedData(prev=>({...prev,phone:e.target.value.trim()}))} value={editedData?.phone}/>
                        <ErrorText >{errors?.phone}</ErrorText>
                          
                    </div><GapV x='3'/>
                    <div>
                        <InputField name='email' placeholder='Email' onChange={e=>setEditedData(prev=>({...prev,email:e.target.value.trim()}))} value={editedData?.email}/>
                        <ErrorText>{errors?.email}</ErrorText>
                    </div><GapV x='3'/>
                    <div>
                        <InputField name='nid' placeholder='NID Number' onChange={e=>setEditedData(prev=>({...prev,nid:e.target.value.trim()}))} value={editedData?.nid}/>
                        <ErrorText>{errors?.nid}</ErrorText>
                    </div><GapV x='3'/>
                    {!(admin?.id) && <div>  {/*<label>Password</label>*/}
                    <div >
                        <div style={{position:'relative',width:'100%'}}>  <InputField type={show?'text':'password'} placeholder='Password' /*onChange={e=>setAdminData(data=>({...data,password:e.target.value.trim()}))}*/ name='password'/><IconButton type='button' style={{color:textPrimary,position:'absolute',top:'10%',right:'0%'}} onClick={e=>setShow(prev=>!prev)}>{show?<FaEyeSlash/>:<FaEye/>}</IconButton></div>
                        <ErrorText>{errors?.password}</ErrorText>
                    </div><GapV x='3'/>
                    <div >
                        {/*<label>PIN</label>*/}
                        <InputField placeholder='PIN' /*onChange={e=>setAdminData(data=>({...data,pin:e.target.value.trim()}))}*/ name='pin'/>
                        <ErrorText>{errors?.pin}</ErrorText>
                    </div></div>}<GapV x='4'/>
                    {/*authError&&admin.role=='admin'&&<span onClick={sendRecoveryEmail}>Forgot PIN?</span>*/}</Col>}
                    {editedAccesses.length>0&&<Col  >
                        {admin.id&&<div><h4>{admin?.username}</h4><GapV x='1'/><h5>Access Permission</h5><GapV x='4'/></div>}
                        <div>
                            <SwitchItem label='Dashboard' check={editedAccesses.includes('index')} v='index' identity='index' handleChange={handleChange}/>  
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Deposit History' check={editedAccesses.includes('deposit-history')} v='deposit-history' identity='deposit' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Modify Deposit History' check={editedAccesses.includes('modify-deposit-history')} v='modify-deposit-history' identity='modify-deposit' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Withdraw History' check={editedAccesses.includes('withdraw-history')} v='withdraw-history' identity='withdraw' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Modify Withdraw History' check={editedAccesses.includes('modify-withdraw-history')} v='modify-withdraw-history' identity='modify-withdraw' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Topup History' check={editedAccesses.includes('topup-history')} v='topup-history' identity='topup' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Modify Topup History' check={editedAccesses.includes('modify-topup-history')} v='modify-topup-history' identity='modify-topup' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Drive History' check={editedAccesses.includes('drive-history')} v='drive-history' identity='drive-history' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Modify Drive History' check={editedAccesses.includes('modify-drive-history')} v='modify-drive-history' identity='modify-drive' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Manage Drive' check={editedAccesses.includes('manage-drive')} v='manage-drive' identity='manage-drive' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Modify Drive' check={editedAccesses.includes('modify-drive')} v='modify-drive' identity='modify-drive' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Manage Regular' check={editedAccesses.includes('manage-regular')} v='manage-regular' identity='manage-regular' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Modify Regular' check={editedAccesses.includes('modify-regular')} v='modify-regular' identity='modify-regular' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='MBank History' check={editedAccesses.includes('mbank-history')} v='mbank-history' identity='mbank' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Modify MBank History' check={editedAccesses.includes('modify-mbank-history')} v='modify-mbank-history' identity='modify-mbank' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Utility Bill History' check={editedAccesses.includes('bill-history')} v='bill-history' identity='utility' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Modify Utility Bill History' check={editedAccesses.includes('modify-bill-history')} v='modify-bill-history' identity='modify-utility' handleChange={handleChange}/>   </FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Bank History' check={editedAccesses.includes('bank-history')} v='bank-history' identity='bank' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Modify Bank History' check={editedAccesses.includes('modify-bank-history')} v='modify-bank-history' identity='modify-bank' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Deposit Setting' check={editedAccesses.includes('deposit-setup')} v='deposit-setup' identity='deposit-setup' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Modify Deposit Setting' check={editedAccesses.includes('modify-deposit-setting')} v='modify-deposit-setting' identity='modify-deposit-setup' handleChange={handleChange}/>/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Setting' check={editedAccesses.includes('setting')} v='setting' identity='setting' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Modify Setting' check={editedAccesses.includes('modify-setting')} v='modify-setting' identity='modify-setting' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Manage User' check={editedAccesses.includes('manage-user')} v='manage-user' identity='manage-user' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Modify User' check={editedAccesses.includes('modify-user')} v='modify-user' identity='modify-user' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Manage Admin' check={editedAccesses.includes('manage-admin')} v='manage-admin' identity='manage-admin' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Modify Admin' check={editedAccesses.includes('modify-admin')} v='modify-admin' identity='modify-admin' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Notice' check={editedAccesses.includes('notice')} v='notice' identity='notice' handleChange={handleChange}/> </FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Modify Notice' check={editedAccesses.includes('modify-notice')} v='modify-notice' identity='modify-notice' handleChange={handleChange}/> </FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Feedback' check={editedAccesses.includes('feedback')} v='feedback' identity='feedback' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='API' check={editedAccesses.includes('api')} v='api' identity='api' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Modify API' check={editedAccesses.includes('modify-api')} v='modify-api' identity='modify-api' handleChange={handleChange}/></FlexH>
                        </div>
                    </Col>}
        </FlexH>
                    <GapV x='5'/><FlexH x='flex-end' style={{width:'100%'}}><button type='button' onClick={e=>{cancelForm()}}>CANCEL</button><GapH x='2'/><ThemeButton type='submit'>{editedData?.id?'NEXT':'NEXT'}</ThemeButton></FlexH>
    </form>
    <GapV x='4'/>           </div>
}
