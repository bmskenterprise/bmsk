import {useState} from 'react';
import {useLocation,useNavigate,useParams} from 'react-router-dom';
import {Row,Col,} from 'react-bootstrap';
import {toast} from 'react-toastify';
import {balanceTypes} from '../../../Preferences.json';
import url from '../../config/url'
import {FlexH,GapV,ThemeButton,InputField,ErrorText,Spinner} from '../../components/styles/Admin.style';
import {useTheme} from '../../contexts/ThemeContext';
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import adminPIN from '../../components/AdminPIN'  // (err) 

export default () => {
    const location = useLocation()         //</div> */}
    const {username} = location.state         //{/* <div className="col-sm-10">
    const [balanceData,setBalanceData] = useState({})
    const {themeData,thememode} = useTheme()
    const {appData} = useAdminAuth()
    const navigate = useNavigate();
    const {id} = useParams()
    const [errors,setErrors]=useState({});
    const [actionType,setActionType] = useState('')
    //const [amountRef,sourceRef,typeRef,adminPINRef] = [useRef(null),useRef(null),useRef(null),useRef(null)];
    const [loading,setLoading] = useState(false);
    
    const handleSubmit = e =>{
        e.preventDefault()
        adminPIN(thememode,{cb:modifyBalance,data:{balanceData}},'ADD') //
    }
    const modifyBalance = async ({balanceData},pin) => {
        //()=>navigate('/transfer/confirm', {state: {{amount:amountRef.current.value,source:sourceRef.current.value,type:typeRef.current.value}}})
        let validationErrors = {};
        if(!balanceData.amount) validationErrors.amount = 'amount is required'
        if(!pin) {toast.error('admin pin is required');return}// is required'
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
        }catch(err) {toast.error(err.message);}
        finally{setLoading(false);}
    }
                          
    return <div>
            <Row  >
                <Col xs={12} md={{span:4,offset:4}}>
                <h4 style={{marginBottom:'4rem'}}>{username} Wallet</h4>
                   <div>
                    <FlexH style={{width:'100%'}} x="space-between" y="center">
                        <div style={{color:actionType=='add'?themeData.themeBackground:'',}} onClick={e=>setActionType('add')}>{/*<input type='radio' name='deposit' id='add'value='add'onChange={e=>setActionType(e.target.value)}/>*/}<label htmlFor='add'>Add</label></div>
                        <div style={{color:actionType=='deduct'?themeData.themeBackground:''}} onClick={e=>setActionType('deduct')}>{/*<input type='radio' name='deposit' id='deduct'value='deduct'onChange={e=>setActionType(e.target.value)}/>*/}<label htmlFor='deduct'>Return</label></div>
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
                        {balanceTypes.map((type,i)=> <div key={i} style={{color:balanceData.balanceType==type?themeData.themeBackground:'',marginRight:'2rem'}} onClick={e=>setBalanceData(prev=>({...prev,balanceType:type}))}>
                            {/*<input type="radio" value={type} name="balance" id={type} onChange={e=>balanceData.balanceType=e.target.value}/>*/}<label htmlFor={type}style={{textTransform:'capitalize'}}>{type}</label>
                        </div>)}
                    </FlexH><ErrorText >{errors?.balanceType}</ErrorText>
                    </div><GapV x='2'/>
                    <FlexH x='flex-start' y='center'>{appData?.mbanks.map(({name},i)=> <div key={i} style={{color:balanceData.gateway==name?themeData.themeBackground:'',marginRight:'2rem'}} onClick={e=>setBalanceData(prev=>({...prev,gateway:name}))}>{/*<input type="radio" name="mb" id={name} value={name} onChange={e=>balanceData.gateway=e.target.value.toLowerCase()}/>*/}<label htmlFor={name}>{name}</label></div>)}</FlexH><GapV x='10'/>
                    <div>
                        <InputField style={{width:'100%'}} placeholder="Amount" onBlur={e=>balanceData.amount=e.target.value}/>
                        <ErrorText >{errors.amount && errors.amount}</ErrorText>
                    </div><GapV x='4'/>
                    {/*<div>
                        <InputField   style={{width:'100%'}} type='password' placeholder='admin pin' name='admin-pin'/>
                        <ErrorText >{errors.adminPIN&&errors.adminPIN}</ErrorText>
                    </div>*/}<GapV x='3'/>
            <FlexH x='flex-end' y='center'><button onClick={e=>navigate(-1)}>CANCEL</button><ThemeButton  style={{marginLeft:'2rem'}} type="submit" >{loading?<Spinner  size='1'/>:'NEXT'}</ThemeButton> </FlexH>
            </div>
        </form>}
                </Col>
            </Row>
    </div>
}