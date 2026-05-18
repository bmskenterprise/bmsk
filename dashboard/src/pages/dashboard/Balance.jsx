import {useState} from 'react';
import {useLocation,useNavigate,useParams} from 'react-router-dom';
//import {Row,Col,} from 'react-bootstrap';
import {toast} from 'react-toastify';
import {balanceTypes} from '../../../Preferences.json';
import {useTheme} from '../../contexts/ThemeContext';
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {FlexH,GapV,GapH,ThemeButton,SecondaryButton,InputField,ErrorText,Spinner} from '../../components/styles/Admin.style';
import url from '../../config/url'
import AdminPIN from '../../components/AdminPIN'  // (err) 

export default () => {
    const location = useLocation()         //</div> */}
    const {username} = location.state         //{/* <div className="col-sm-10">
    const [balanceData,setBalanceData] = useState({})
    const {themeData:{themeBackground},thememode} = useTheme()
    const {appData} = useAdminAuth()
    const navigate = useNavigate();
    const {id} = useParams()
    const [errors,setErrors]=useState({});
    const [actionType,setActionType] = useState('')
    //const [amountRef,sourceRef,typeRef,adminPINRef] = [useRef(null),useRef(null),useRef(null),useRef(null)];
    const [loading,setLoading] = useState(false);
    
    const handleSubmit = e =>{
        e.preventDefault()
        AdminPIN([thememode,themeBackground],{cb:modifyBalance,data:{balanceData}},'ADD') //
    }
    const modifyBalance = async ({balanceData},pin) => {
        //()=>navigate('/transfer/confirm', {state: {{amount:amountRef.current.value,source:sourceRef.current.value,type:typeRef.current.value}}})
        let validationErrors = {};
        if(!balanceData.amount) validationErrors.amount = 'amount is required'
        //if(!pin) {toast.error('admin pin is required');return}// is required'
        if(!balanceTypes.includes(balanceData.balanceType)) validationErrors.balanceType = 'balance type is required'
        if(!['add','deduct'].includes(actionType)) validationErrors.actionType = 'action type is required'
        if(Object.keys(validationErrors).length) {setErrors(validationErrors);return} //
        setLoading(true);
        try {
            let res = await fetch(
                `${url.urlDeposit}/${actionType}/${id}`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {'Content-Type':'application/json','x-admin-pin':pin},
                    body: JSON.stringify({amount:parseInt(balanceData.amount),balanceType:balanceData.balanceType.toLowerCase(),gateway:balanceData.gateway.toLowerCase()})
                }
            )
            let data =await res.json();
            if(res.status==401) toast.error('auth error')
            if(!res.ok) {throw new Error(data.error|| 'deposit failed');}
            toast.success(data.message)
        }catch(e) {toast.error(e.message);}
        finally{setLoading(false);}
    }
                
    const getActiveStyle = action => ({background:actionType==action?themeBackground:'',})
    const markCurrentGateway = type => ({background:balanceData.balanceType==type?themeBackground:'',marginRight:'2rem',textTransform:'capitalize'})
                          
            
    return <div>
                {/*<Col xs={12} md={{span:4,offset:4}}>*/}
                <h4>{username} Wallet</h4><GapV x='4'/>
                   <div>
                    <FlexH style={{width:'100%'}} x='space-between' y='center'>
                        <SecondaryButton style={getActiveStyle('add')} onClick={e=>setActionType('add')}>{/*<input type='radio' name='deposit' id='add'value='add'onChange={e=>setActionType(e.target.value)}/>*/} >Add</SecondaryButton>
                        <SecondaryButton style={getActiveStyle('deduct')} onClick={e=>setActionType('deduct')}>{/*<input type='radio' name='deposit' id='deduct'value='deduct'onChange={e=>setActionType(e.target.value)}/>*/} >Return</SecondaryButton>
                    </FlexH><ErrorText >{errors?.actionType}</ErrorText>
                    </div><GapV x='3'/>
        {actionType&& <form onSubmit={handleSubmit}>
                {/*<Col xs={2} md={3}>
                    <label htmlFor="" className="">Balance</label><br /><br />
                    <label htmlFor="amount" className=" ">Amount</label><br /><br />
                    <label htmlFor="type" className=" ">Type</label><br /><br />
                    <label htmlFor="pin">Admin PIN</label>
                </Col>*/}
                    <div><div><FlexH x='flex-start' y='center' /*ref={sourceRef}*/>
                        {balanceTypes.map((type,i)=> <SecondaryButton key={i} style={markCurrentGateway(type)} onClick={e=>setBalanceData(prev=>({...prev,balanceType:type}))}>{type}
                            {/*<input type="radio" value={type} name="balance" id={type} onChange={e=>balanceData.balanceType=e.target.value}/>*/} 
                        </SecondaryButton>)}
                    </FlexH><ErrorText >{errors?.balanceType}</ErrorText>
                    </div><GapV x='2'/>
                    <FlexH x='flex-start' y='center'>{appData?.mbanks.map(({name},i)=> <SecondaryButton key={i} style={{color:balanceData.gateway==name?themeBackground:'',marginRight:'2rem'}} onClick={e=>setBalanceData(prev=>({...prev,gateway:name}))}>{/*<input type="radio" name="mb" id={name} value={name} onChange={e=>balanceData.gateway=e.target.value.toLowerCase()}/>*/} </SecondaryButton>)}</FlexH><GapV x='10'/>
                    <div>
                        <InputField style={{width:'100%'}} placeholder='Amount' onChange={e=>setBalanceData(prev=>({...prev,amount:e.target.value}))}/>
                        <ErrorText >{  errors?.amount}</ErrorText>
                    </div><GapV x='5'/>
                    {/*<div>
                        <InputField   style={{width:'100%'}} type='password' placeholder='admin pin' name='admin-pin'/>
                        <ErrorText >{errors.adminPIN&&errors.adminPIN}</ErrorText>
                    </div><GapV x='3'/>*/}
            <FlexH x='flex-end' y='center'><button onClick={e=>navigate(-1)}>CANCEL</button><GapH x='2'/> <ThemeButton type='submit' >{loading?<Spinner  size='1'/>:'NEXT'}</ThemeButton> </FlexH>
            </div>
        </form>}
    </div>
}
