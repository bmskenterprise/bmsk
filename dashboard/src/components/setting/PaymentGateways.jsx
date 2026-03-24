import React,{useEffect,useState} from "react";
import { Col,Accordion,Form, } from "react-bootstrap";
import {useMediaQuery} from 'react-responsive'
import { toast } from "react-toastify";
import {MdEdit} from 'react-icons/md';     
import url from '../../config/url'
import {useTheme} from "../../contexts/ThemeContext";
import {FlexH,FlexV,GapV,ThemeButton,InputField,ErrorText,TinyIcon,IconButton,Spinner} from '../styles/Admin.style'
import {validateAddPGW,validateEditPGW} from "../../utils/validate";
import SwitchItem from '../Switch'

export default  () =>{
    const {isMobile} = useMediaQuery({maxWidth:786})
    const [gateways,setGateways] = useState([])
    const init = {id:null,name:'',merchantID:''}
    const [editInit, setEditInit] = useState({});
    const [errors, setErrors] = useState({});
    const [loading,setLoading] = useState(false)
    const {modeData:{backSecondary,textSecondary}} = useTheme()
    let pgws 
    useEffect(()=>{fetchPGW()}, [])
    const fetchPGW = async e =>{
        try{
            let res = await fetch(url.urlPGW,{credentials:'include'})
            let data = await res.json()
            if(!res.ok) throw new Error(data.error|| ' failed');
            setGateways(data)
            pgws = data
        }catch(e) {toast.error(e.message)}
    }
        //   catch(err){  toast.error(err.message)}
                  
                  
                  
                  
                  
                  
                  
                  
                    
                    
            
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
        }catch(err) { toast.error(err.message)}
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
        }catch(err) {toast.error(err.message)}
        finally{setLoading(false)}
    }*/
    


    const editPGW = async (id,modifiedFields) => {
        //const validationErrors = validateEditPGW(pgws,modifiedFields);
        //const modifiedFields = {};
        //const [merchantID, merchantPassword, apiKey, ] = [e.target[0].value.trim(),e.target[1].value.trim(),e.target[2].value.trim()/*,e.target[3].value.trim()*/];
        //else if(pgws.some(pgw=>pgw.name==title)) validationErrors.title = 'gateway name is already exist';
        //if (Object.keys(validationErrors).length) return setErrors(validationErrors);
        //if(title!==editInit.name) modifiedFields.name = title;
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
        }catch(err) { toast.error(err.message)}
        finally{setLoading(false);setErrors({})}
    }
    const handleChange = (e)=> setEditInit(prev=>({...prev,[e.target.name]:e.target.value}))
    
    const handleSubmit = e =>{
        e.preventDefault()
        let validationErrors// = validatePGW(pgws,editInit);
        //if (Object.keys(validationErrors).length) {return setErrors(validationErrors);}
        if(editInit.id){
          validationErrors = validateEditPGW(pgws,editInit);
          if(Object.keys(validationErrors).length) {setErrors(validationErrors);return}
          editPGW(editInit.id,editInit)
        }else{
          validationErrors = validateAddPGW(pgws,editInit)
          if(Object.keys(validationErrors).length) {setErrors(validationErrors);return} //new Error(data.message || ' failed');
          addPGW(editInit)
        }
    }
    let content= <div style={{background:backSecondary,color:textSecondary}}>
        <h4 style={{marginBottom:'2rem'}}>PGW</h4>
        {!Object.keys(editInit).length &&<>
            <FlexH x='flex-end' y='center'><ThemeButton  style={{marginBottom:'2rem'}} onClick={()=>setEditInit(init/*{name:'', merchantID:''}*/)}>Add  </ThemeButton></FlexH>
            <table style={{border:'none'}}><tbody>
                {gateways?.map(({_id,name,icon,merchantID,active}) => <tr key={_id} style={{marginBottom: '2rem!important'}}>
                    <td style={{width: '80%'}}><TinyIcon src={icon}/>{name}</td>
                    <td style={{width:'10%'}}><IconButton style={{color:textSecondary}} onClick={()=>setEditInit({id:_id,name,merchantID})}><MdEdit/></IconButton></td>
                    <td style={{width:'10%'}} ><SwitchItem  check={active} handleChange={e=>editPGW(_id,{active:e.target.checked})}/></td>
                </tr>) }
            </tbody></table>
        </>}
        {Object.keys(editInit).length>0 &&<form onSubmit={handleSubmit}>
            <FlexV x='flex-start' y='flex-start'>
                <label>Gateway Name</label>
                <InputField name='name' value={editInit.name} onChange={handleChange}/>
                <ErrorText>{errors?.name}</ErrorText>
            </FlexV><GapV x='2'/>
            <FlexV x='flex-start' y='flex-start'>
                <label>Gateway Icon</label>
                <InputField name='icon' value={editInit.icon} onChange={handleChange}/>
                <ErrorText>{errors?.icon}</ErrorText>
            </FlexV><GapV x='2'/>
            <FlexV x='flex-start' y='flex-start'>
                <label>Merchant ID</label>
                <InputField name='merchantID' value={editInit.merchantID} onChange={handleChange}/>
                <ErrorText >{errors?.merchantID}</ErrorText>
            </FlexV><GapV x='2'/>
            <FlexV x='flex-start' y='flex-start'>
                <label>API KEY</label>
                <InputField name='apiKey' onChange={handleChange}/>
          <ErrorText>{errors?.apiKey}</ErrorText>
            </FlexV><GapV x='2'/>
            <FlexV x='flex-start' y='flex-start'>
                <label>API Password</label>
                <InputField name='apiPassword' onChange={handleChange}/>
          <ErrorText>{errors?.apiPassword}</ErrorText>
            </FlexV>
            {/* <Form.Group>
                <Form.Label>API Type</Form.Label>
                <FlexH x='start' y='center'>
                    <div style={{marginRight: '1rem'}}><input type="radio" name="pgw" id="test" /><label htmlFor="test">sandbox</label></div>
                    <div><input type="radio" name="pgw" id="live" /><label htmlFor="live">production</label></div>
                </FlexH>
            </Form.Group> */}
            <FlexH x='flex-end' y='center'><button onClick={e=>setEditInit({})}>CANCEL</button><ThemeButton  type='submit' disabled={loading}>{loading?<Spinner  size='1'/>:'SAVE'}</ThemeButton></FlexH>
        </form>}
    </div>
    return <>{isMobile? <Col xs={12}>
            <Accordion>
              <Accordion.Item eventKey="0">
                  <Accordion.Header>Payment Gateways</Accordion.Header>
                  <Accordion.Body>{content}</Accordion.Body>
                </Accordion.Item>
                </Accordion>
                </Col>:<Col md={6} xl={4}>{content}</Col>
    }</>
}
