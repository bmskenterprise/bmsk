import {useState} from 'react';
import {useLocation,useNavigate,useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import {balanceTypes} from '../../../Preferences.json';
import {useTheme} from '../../contexts/ThemeContext';
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {useUser} from '../../contexts/UserContext';
import {FlexH,GapV,GapH,ThemeButton,SecondaryButton,InputField,ErrorText,Spinner} from '../../components/styles/Admin.style';
import url from '../../config/url'
import AdminPIN from '../../components/AdminPIN'  // (err) 

export default () => {
    const location = useLocation()         //</div> */}
    const navigate = useNavigate();
    const {username} = location.state         //{/* <div className="col-sm-10">
    const {thememode,themeData:{themeBackground,themeText},modeData:{backSecondary,textSecondary}} = useTheme()
    const {appData} = useAdminAuth()
    const {id} = useParams()
    const {modifyUserBalance,errors,loading} = useUser();
    const [balanceData,setBalanceData] = useState({})
    const [actionType,setActionType] = useState('')
    //const [errors,setErrors]=useState({});
    //const [loading,setLoading] = useState(false);
    
    const handleSubmit = e =>{
        e.preventDefault()
        AdminPIN([thememode,themeBackground],{cb:modifyUserBalance,data:{id,balanceData:{...balanceData,actionType}}},actionType.toUpperCase()) //
    }
    
                
    const markAction = action => ({background:actionType==action?themeBackground:backSecondary,color:actionType==action?themeText:textSecondary})
    const markBalanceType = type => ({background:balanceData.balanceType==type?themeBackground:backSecondary,color:balanceData.balanceType==type?themeText:textSecondary,textTransform:'capitalize'})
                     const markGateway = gateway => ({background:balanceData.gateway==gateway?themeBackground:backSecondary,color:balanceData.gateway==gateway?themeText:textSecondary})
            
    return <div>
                <div style={{maxWidth:'32rem',margin:'auto'}} /*md={{span:4,offset:4}}*/>
                <h4>{username} Wallet</h4><GapV x='4'/>
                   <div>
                    <FlexH style={{width:'100%'}} x='space-around' y='center'>
                        <SecondaryButton style={markAction('add')} type='button' onClick={e=>setActionType('add')}>{/*<input type='radio' name='deposit'id='add'value='add'onChange={e=>setActionType(e.target.value)}/>*/}Add Balance</SecondaryButton>
                        <SecondaryButton style={markAction('deduct')} type='button' onClick={e=>setActionType('deduct')}>{/*<input type='radio' name='deposit'id='deduct'value='deduct'onChange={e=>setActionType(e.target.value)}/>*/}Return Balance</SecondaryButton>
                    </FlexH><ErrorText >{errors?.actionType}</ErrorText>
                    </div><GapV x='4'/>
                {/*<Col xs={2} md={3}>
                    <label htmlFor="" className="">Balance</label><br /><br />
                    <label htmlFor="amount" className=" ">Amount</label><br /><br />
                    <label htmlFor="type" className=" ">Type</label><br /><br />
                    <label htmlFor="pin">Admin PIN</label>
                </Col>*/}
                    {actionType&& <div><div><FlexH x='space-around' y='center' /*ref={sourceRef}*/>
                        {balanceTypes.map((type,i)=> <SecondaryButton key={i} style={markBalanceType(type)} onClick={e=>setBalanceData(prev=>({...prev,balanceType:type}))}>{type}
                            {/*<input type="radio" value={type} name="balance" id={type} onChange={e=>balanceData.balanceType=e.target.value}/>*/} 
                        </SecondaryButton>)}
                    </FlexH><ErrorText >{errors?.balanceType}</ErrorText>
                    </div><GapV x='2'/>
                    <FlexH x='space-around' y='center'>{appData?.mbanks.map(({name},i)=> <SecondaryButton key={i} style={markGateway(name)} onClick={e=>setBalanceData(prev=>({...prev,gateway:name}))}>{/*<input type="radio" name="mb" id={name} value={name} onChange={e=>balanceData.gateway=e.target.value.toLowerCase()}/>*/} </SecondaryButton>)}</FlexH><GapV x='6'/>
        <form onSubmit={handleSubmit}>
                    <div>
                        <InputField style={{width:'100%'}} placeholder='Amount' onChange={e=>setBalanceData(prev=>({...prev,amount:e.target.value}))}/>
                        <ErrorText >{  errors?.amount}</ErrorText>
                    </div><GapV x='5'/>
                    {/*<div>
                        <InputField   style={{width:'100%'}} type='password' placeholder='admin pin' name='admin-pin'/>
                        <ErrorText >{errors.adminPIN&&errors.adminPIN}</ErrorText>
                    </div><GapV x='3'/>*/}
            <FlexH x='flex-end' y='center'><button onClick={e=>navigate(-1)}>CANCEL</button><GapH x='2'/> <ThemeButton type='submit' >{loading?<Spinner  size='1'/>:'NEXT'}</ThemeButton></FlexH><GapV x='4'/>
        </form>
            </div>}
    </div>
}
