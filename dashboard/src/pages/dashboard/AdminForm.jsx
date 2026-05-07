import {useState} from 'react';
import {FaEye,FaEyeSlash} from 'react-icons/fa';
import {useLocation,useNavigate} from 'react-router-dom';
import {Col,GapV,FlexH,InputField,ErrorText,ThemeButton,IconButton} from '../../components/styles/Admin.style';
import {useAdminAuth} from '../../contexts/AdminAuthContext';
import {useTheme} from '../../contexts/ThemeContext';
import AdminPIN from '../../components/AdminPIN';
import SwitchItem from '../../components/Switch'

export default () =>{
      const [show,setShow] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const {thememode,modeData:{textPrimary},themeData:{themeBackground}} = useTheme();
    const {errors} = useAdminAuth();
    const {admin,accesses} = location?.state;
    const [editedAccesses,setEditedAccesses] = useState(accesses)
    const [editedData,setEditedData] = useState(admin)
    const {/*admin,admins,toggleSubAdminStatus,fetchAdmins,*/addSubAdmin,editSubAdmin,editSubAdminAccess,sendRecoveryEmail,loading} = useAdminAuth()
    const handleChange = (e) =>{
        if(e.target.checked) setEditedAccesses(prev=>[...prev,e.target.value])
        else setEditedAccesses(prev=>prev.filter(access=>access!==e.target.value))
    }
    const handleForm = (e) =>{
        e.preventDefault()
        let formData ={username:e.target.username.value.trim(),phone:e.target.phone?.value.trim(),fullname:e.target.fullname?.value.trim(),email:e.target.email?.value.trim(),nid:e.target.nid?.value.trim(),password:e.target.password.value.trim(),pin:e.target.pin.value.trim()/*,adminPIN:e.target['admin-pin'].value.trim()*/}
        if(!editedData?.id && accesses.length>0) {AdminPIN([thememode,themeBackground],{cb:addSubAdmin,data:{formData,accesses:editedAccesses,cancelForm}},'ADD');return}
        if(accesses.length>0) {AdminPIN([thememode,themeBackground],{cb:editSubAdminAccess,data:{id:editedData?.id,editedAccesses,cancelForm}},'EDIT');return}
        if(editedData?.id) {AdminPIN([thememode,themeBackground],{cb:editSubAdmin,data:{admin:{id:editedData?.id,username:editedData?.username},formData,cancelForm}},'EDIT');return}
        //cancelForm()
    }
    const cancelForm = e =>{navigate(-1)/*setEditAccess(false);setOpenForm(false);setEditedData(null)*/}


    return <form onSubmit={handleForm}><div>
                <FlexH x='flex-start'>
                {/*<Col xs={12} md={4}>*/}
                    {(Object.keys(editedData??{}).length>0)&&<Col  ><div /*x='flex-start'*/>
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
                    <div /*x='flex-start'*/>
                        {/*<label>Password</label>*/}
                        <div style={{position:'relative',width:'100%'}}>  <InputField type={show?'text':'password'} placeholder='Password' /*onChange={e=>setAdminData(data=>({...data,password:e.target.value.trim()}))}*/ name='password'/><IconButton type='button' style={{color:textPrimary,position:'absolute',top:'10%',right:'0%'}} onClick={e=>setShow(prev=>!prev)}>{show?<FaEyeSlash/>:<FaEye/>}</IconButton></div>
                        <ErrorText>{errors?.password}</ErrorText>
                    </div><GapV x='3'/>
                    <div /*x='flex-start'*/>
                        {/*<label>PIN</label>*/}
                        <InputField placeholder='PIN' /*onChange={e=>setAdminData(data=>({...data,pin:e.target.value.trim()}))}*/ name='pin'/>
                        <ErrorText>{errors?.pin}</ErrorText>
                    </div><GapV x='4'/>
                    {/*authError&&admin.role=='admin'&&<span onClick={sendRecoveryEmail}>Forgot PIN?</span>*/}</Col>}
                {/*</Col>*/}
                    {editedAccesses.length>0&&<Col  >
                        <h3></h3>
                        <div>
                            <SwitchItem label='Dashboard' check={editedAccesses.includes('index')} v='index' identity='index' handleChange={handleChange}/>  
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Deposit History' check={editedAccesses.includes('deposit-history')} v='deposit-history' identity='deposit' handleChange={handleChange}/>  </FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Topup History' check={editedAccesses.includes('topup-history')} v='topup-history' identity='topup' handleChange={handleChange}/>  </FlexH>
                            <GapV x='2'/><FlexH x='1'><SwitchItem label='Drive History' check={editedAccesses.includes('drive-history')} v='drive-history' identity='drive-history' handleChange={handleChange}/>  </FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Manage Drive' check={editedAccesses.includes('manage-drive')} v='manage-drive' identity='manage-drive' handleChange={handleChange}/>  </FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Manage Regular' check={editedAccesses.includes('manage-regular')} v='manage-regular' identity='manage-regular' handleChange={handleChange}/>  </FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem check={editedAccesses.includes('mbank-history')} label='MBank History' v='mbank-history' identity='mbank' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Utility Bill History' check={editedAccesses.includes('bill-history')} v='bill-history' identity='utility' handleChange={handleChange}/>   </FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Bank History' check={editedAccesses.includes('bank-history')} v='bank-history' identity='bank' handleChange={handleChange}/>   </FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Notice' check={editedAccesses.includes('notice')} v='notice' identity='notice' handleChange={handleChange}/> </FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Feedback' check={editedAccesses.includes('feedback')} v='feedback' identity='feedback' handleChange={handleChange}/></FlexH>
                            <GapV x='2'/><FlexH x='flex-start'><SwitchItem label='Manage API' check={editedAccesses.includes('manage-api')} v='manage-api' identity='api' handleChange={handleChange}/></FlexH>
                        </div>
                    </Col>}
                    <GapV x='4'/><FlexH x='flex-end' y='center' style={{width:'100%'}}><button onClick={e=>{cancelForm()}}>CANCEL</button><ThemeButton style={{marginLeft:'2rem'}} type='submit'>{editedData?.id?'NEXT':'NEXT'}</ThemeButton></FlexH>
        </FlexH>
        </div>
    </form>
}