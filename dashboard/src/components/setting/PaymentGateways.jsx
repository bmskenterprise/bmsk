import {useEffect,useState} from 'react';
import {useMediaQuery} from 'react-responsive'
import {toast} from 'react-toastify';
import {MdEdit} from 'react-icons/md';     
import {BsPlusLg} from 'react-icons/bs'
import {useTheme} from '../../contexts/ThemeContext';
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {Col,FlexH,GapV,GapH,ThemeButton,InputField,ErrorText,TinyIcon,PrimaryButton,IconButton,Spinner} from '../styles/Admin.style'
import {validateAddAPIGateway,validateEditAPIGateway} from '../../utils/validate';
import url from '../../config/url'
import Accordion from './Accordion';
import SwitchItem from '../Switch'

export default  () =>{
    const isMobile = useMediaQuery({maxWidth:786})
    const {modeData:{backSecondary,textSecondary}} = useTheme()
          const {admin} = useAdminAuth()
    const accesses = admin?.accesses
    const init = {id:null,name:'',merchantID:''}
    const [gateways,setGateways] = useState([])
    const [editInit, setEditInit] = useState({});
    const [errors, setErrors] = useState({});
    const [loading,setLoading] = useState(false)
    const [pgws,setPGW] =useState([])
                  
    useEffect(()=>{fetchPGW()}, [])
                  
    const fetchPGW = async e =>{
        try{
            let res = await fetch(url.urlPGW,{credentials:'include'})
            let data = await res.json()
            if(!res.ok) throw new Error(data.error|| ' failed');
            setGateways(data)
              setPGW(data)
        }catch(e) {toast.error(e.message)}
    }
                  
                  
                  
                  
              const selectIcon = e =>{
        const file = e.target.files[0];
        if(file && file.type.startsWith('image/')) {
         let reader = new FileReader()
        reader.onloadend = e => setEditInit(prev=>({...prev,link:reader.result}))
        }
    }
                  
                    
                    
    const addPGW = async (pgwData) => {
        //const dataPGW=/*[*/{name:e.target[0].value.trim(), merchantID:e.target[1].value.trim(), apiKey:e.target[2].value.trim(), apiPassword:e.target[3].value.trim()}//] = [e.target[0].value.trim(),e.target[1].value.trim(),e.target[2].value.trim(),e.target[3].value.trim()];
        //if (!(title)) validationErrors.title = 'gateway name is required';
        //else if(pgws.some(pgw=>pgw.name==title)) validationErrors.title = 'gateway name is already exist';
        //else if(title.length>32) validationErrors.title = 'gateway name is too long';

        setLoading(true)
        try{
            let res = await fetch(url.urlPGW,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify(pgwData)/*dataPGW*//*{name:title, merchantID, apiKey, apiPassword, active:true}*/
                }
            )
            let data = await res.json()
            if(!res.ok) throw new Error(data.error||'failed to add pgw');
            toast.success('payment gateway added');setEditInit({})
        }catch(e) { toast.error(e.message)}
        finally{setLoading(false);setErrors({})}
    }
    
    /*const editStatus = async (id,status)=> {
        setLoading(true)
        try{
            let res = await fetch(`${url.urlPGW}/${id}`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({active:status})
                }
            )
            let data = await res.json()
            if(!res.ok) throw new Error(data.error);toast.success('toggled');
        }catch(e) {toast.error(e.message)}
        finally{setLoading(false)}
    }*/


    const editPGW = async (id,modifiedFields) => {
        //const validationErrors = validateEditPGW(pgws,modifiedFields);
        //const [merchantID, merchantPassword, apiKey, ] = [e.target[0].value.trim(),e.target[1].value.trim(),e.target[2].value.trim()/*,e.target[3].value.trim()*/];
        //else if(pgws.some(pgw=>pgw.name==title)) validationErrors.title = 'gateway name is already exist';
        //if (Object.keys(validationErrors).length) return setErrors(validationErrors);
        //if(apiKey && apiKey!=editInit.apiKey) modifiedFields.apiKey = apiKey;
        //if(isActive!=editInit.isActive) modifiedFields.isActive = isActive;
        if(!Object.keys(modifiedFields).length) return
        setLoading(true)
        try{
            let res = await fetch(`${url.urlPGW}/${id}`,
                {
                    method: 'PATCH',credentials:'include',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify(modifiedFields)
                }
            )
            let data = await res.json()
            if(!res.ok) throw new Error(data.error || ' failed');setGateways(data.pgws)
             toast.success('edited');setEditInit({})
        }catch(e) { toast.error(e.message)}
        finally{setLoading(false);setErrors({})}
    }
    const handleChange = (e)=> setEditInit(prev=>({...prev,[e.target.name]:e.target.value}))
    

                  
    const handleSubmit = e =>{
        e.preventDefault()
           if(!accesses?.includes('modify-api')) {toast.info('you don\'t have modify permission');return}
        let validationErrors// = validatePGW(pgws,editInit);
        //if (Object.keys(validationErrors).length) {return setErrors(validationErrors);}
        if(editInit.id){
          validationErrors = validateEditAPIGateway(pgws,editInit);
          if(Object.keys(validationErrors).length) {setErrors(validationErrors);return}
          editPGW(editInit.id,editInit)
        }else{
          validationErrors = validateAddAPIGateway(pgws,editInit)
          if(Object.keys(validationErrors).length) {setErrors(validationErrors);return} //new Error(data.message || ' failed');
          addPGW(editInit)
        }
    }
    let content = <div style={{background:backSecondary,color:textSecondary,padding:'0.5rem'}}>
        <h4>PGW</h4><GapV x='1.5'/>
        {!Object.keys(editInit).length>0 &&<>
            <FlexH x='flex-end'><PrimaryButton onClick={()=>setEditInit(init/*{name:'', merchantID:''}*/)}><BsPlusLg/></PrimaryButton><GapH x='1'/></FlexH><GapV x='2'/>   
            <div /*style={{border:'none'}}*/>
                {gateways?.map(({_id,name,icon,merchantID,active}) => <FlexH key={_id} style={{marginBottom: '3rem!important'}}>
                    <div style={{width:'65%'}}><TinyIcon src={icon}/><GapH x='1'/>{name}</div>
                    <FlexH x='flex-end' y='center' style={{width:'30%'}}>
                       <IconButton size='1.5' onClick={()=>setEditInit({id:_id,name,merchantID})}><MdEdit/></IconButton>
                       <SwitchItem check={active} handleChange={e=>editPGW(_id,{active:e.target.checked})}/>
                    </FlexH>
                </FlexH>) }
            </div>
        </>}
        {Object.keys(editInit).length>0 &&<form onSubmit={handleSubmit}>
            <div /*x='flex-start' y='flex-start'*/>
                <label>Gateway Name</label>
                <InputField name='name' value={editInit.name} onChange={handleChange}/>
                <ErrorText>{errors?.name}</ErrorText>
            </div><GapV x='2'/>
            <div /*x='flex-start' y='flex-start'*/>
                <label>Gateway Icon</label>
                <InputField type='file' accept='.jpg, .jpeg, .png, .webp' onChange={selectIcon}/>
                <ErrorText>{errors?.icon}</ErrorText>
            </div><GapV x='2'/>
            <div /*x='flex-start' y='flex-start'*/>
                <label>Merchant ID</label>
                <InputField name='merchantID' value={editInit.merchantID} onChange={handleChange}/>
                <ErrorText >{errors?.merchantID}</ErrorText>
            </div><GapV x='2'/>
            <div /*x='flex-start' y='flex-start'*/>
                <label>API KEY</label>
                <InputField name='apiKey' onChange={handleChange}/>
          <ErrorText>{errors?.apiKey}</ErrorText>
            </div><GapV x='2'/>
            <div /*x='flex-start' y='flex-start'*/>
                <label>API Password</label>
                <InputField name='apiPassword' onChange={handleChange}/>
          <ErrorText>{errors?.apiPassword}</ErrorText>
            </div>
            {/* <Form.Group>
                <Form.Label>API Type</Form.Label>
                <FlexH x='start' y='center'>
                    <div style={{marginRight: '1rem'}}><input type="radio" name="pgw" id="test" /><label htmlFor="test">sandbox</label></div>
                    <div><input type="radio" name="pgw" id="live" /><label htmlFor="live">production</label></div>
                </FlexH>
            </Form.Group> */}
            <GapV x='3'/><FlexH x='flex-end'><button onClick={e=>setEditInit({})}>CANCEL</button><GapH x='2'/><ThemeButton type='submit' disabled={loading}>{loading?<Spinner size='1'/>:'SAVE'}</ThemeButton></FlexH><GapV x='2'/>
        </form>}
           <GapV x='4'/>
    </div>
                   
    return <>{isMobile? <Col >
              <Accordion title='Payment Gateways' content={content}/>
                </Col>:<Col /*md={6} xl={4}*/>{content}</Col>
    }</>
}
