import {useEffect,useState} from 'react';
import {useMediaQuery} from 'react-responsive'
import {toast} from 'react-toastify';
import {MdEdit} from 'react-icons/md';     
import {BsPlusLg} from 'react-icons/bs';
import {useTheme} from '../../contexts/ThemeContext';
import {useAdminAuth} from '../../contexts/AdminAuthContext';
import {Col,FlexH,GapV,ThemeButton,InputField,ErrorText,TinyIcon,PrimaryButton,IconButton,Spinner} from '../styles/Admin.style'
import {validateAddAPIGateway,validateEditAPIGateway} from '../../utils/validate';
import url from '../../config/url'
import SwitchItem from '../Switch'
import Accordion from './Accordion'

export default  () =>{
    const isMobile = useMediaQuery({maxWidth:768})
    const [gateways,setGateways] = useState([])
    const init = {id:null,name:'',merchantID:''}
    const {admin} = useAdminAuth()
    const accesses = admin?.accesses
    const [editInit,setEditInit] = useState({});
    const [errors,setErrors] = useState({});
    const [loading,setLoading] = useState(false)
    const {modeData:{backSecondary,textSecondary}} = useTheme()
    let [SMSGateways,setSMSGateways] = useState([])
    
    useEffect(()=>{fetchSMSGateways()}, [])
    
    const fetchSMSGateways = async e =>{
        try{
            let res = await fetch(url.urlSMSGateway,{credentials:'include'})
            let data = await res.json()
            if(!res.ok) throw new Error(data.error|| ' failed');
            setGateways(data)
            setSMSGateways(data)  
        }catch(e) {toast.error(e.message)}
    }
    
    const addSMSGateway = async (smsgData) => {
        setLoading(true)
        try{
            let res = await fetch(url.urlSMSGateway,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify(smsgData)
                }
            )
            let data = await res.json()
            if(!res.ok) throw new Error(data.error||'failed to add pgw');
            toast.success('payment gateway added');setEditInit({})
        }catch(e) { toast.error(e.message)}
        finally{setLoading(false);setErrors({})}
    }
    

    const editSMSGateway = async (id,modifiedFields) => {
        if(!Object.keys(modifiedFields).length>0) return
        setLoading(true)
        try{
            let res = await fetch(`${url.urlSMSGateway}/${id}`,
                {
                    method: 'PATCH',credentials:'include',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify(modifiedFields)
                }
            )
            let data = await res.json()
            if(!res.ok) throw new Error(data.error || ' failed');setGateways(data)
             toast.success('edited');setEditInit({})
        }catch(e) { toast.error(e.message)}
        finally{setLoading(false);setErrors({})}
    }
    const handleChange = (e)=> setEditInit(prev=>({...prev,[e.target.name]:e.target.value}))
    
    const handleSubmit = e =>{
        e.preventDefault()
        if(!accesses?.includes('modify-api')) {toast.info('you don\'t have modify permission');return}
        let validationErrors
        if(editInit.id){
          validationErrors = validateEditAPIGateway(SMSGateways,editInit);
          if(Object.keys(validationErrors).length) {setErrors(validationErrors);return}
          editSMSGateway(editInit.id,editInit)
        }else{
          validationErrors = validateAddAPIGateway(SMSGateways,editInit)
          if(Object.keys(validationErrors).length) {setErrors(validationErrors);return}
          addSMSGateway(editInit)
        }
    }
    
    let content = <div style={{background:backSecondary,color:textSecondary,minHeight:'24rem',padding:'0.5rem'}}>
        <h4>SMS Gateway</h4><GapV x='1.5'/>
        {!Object.keys(editInit).length &&<>
            <FlexH x='flex-end' y='center'><PrimaryButton onClick={()=>setEditInit(init)}><BsPlusLg/></PrimaryButton></FlexH><GapV x='2'/> 
             <div>
                {gateways?.map(({_id,name,icon,merchantID,active}) => <FlexH x='space-between' key={_id} style={{width:'100%'}}>
                    <div style={{width: '65%'}}><TinyIcon src={icon}/> {name}</div>
                    <FlexH x='flex-end' y='center' style={{width:'30%'}}>
                        <IconButton size='1.5' onClick={()=>setEditInit({id:_id,name,merchantID})}><MdEdit/></IconButton>
                        <SwitchItem check={active} handleChange={e=>editSMSGateway(_id,{active:e.target.checked})}/>
                    </FlexH>
                </FlexH>) }
            </div>
        </>}
        {Object.keys(editInit).length>0 &&<form onSubmit={handleSubmit}>
            <div  >
                <label>Gateway Name</label>
                <InputField name='name' value={editInit.name} onChange={handleChange}/>
                <ErrorText>{errors?.name}</ErrorText>
            </div><GapV x='1.5'/>
            <div  >
                <label>Gateway Icon</label>
                <InputField name='icon' value={editInit.icon} onChange={handleChange}/>
                <ErrorText>{errors?.icon}</ErrorText>
            </div><GapV x='1.5'/>
           { /*<div  >
                <label>Merchant ID</label>
                <InputField name='merchantID' value={editInit.merchantID} onChange={handleChange}/>
                <ErrorText >{errors?.merchantID}</ErrorText>
            </div>*/}<GapV x='1.5'/>
            <div  >
                <label>API KEY</label>
                <InputField name='apiKey' onChange={handleChange}/>
          <ErrorText>{errors?.apiKey}</ErrorText>
            </div><GapV x='1.5'/>
            {/*<div  >
                <label>API Password</label>
                <InputField name='apiPassword' onChange={handleChange}/>
          <ErrorText>{errors?.apiPassword}</ErrorText>
            </div>*/}<GapV x='2'/>
            <FlexH x='flex-end' y='center'><button onClick={e=>setEditInit({})}>CANCEL</button><GapH x='2'/><ThemeButton type='submit' disabled={loading}>{loading?<Spinner  size='1'/>:'SAVE'}</ThemeButton></FlexH>
        </form>}
        <GapV x='1'/>
    </div>

    return <>{isMobile? <Col >
            <Accordion title='SMS Gateways' content={content}/>
                </Col>:<Col  >{content}</Col>
    }</>
}
