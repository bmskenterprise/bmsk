import React,{ useEffect,useState,useRef } from "react";
import {Col,Accordion,Form,Button,} from 'react-bootstrap'
import {useMediaQuery} from 'react-responsive'
import {MdEdit} from 'react-icons/md'
import {BsPlusLg} from "react-icons/bs";
import {toast} from 'react-toastify'
import {useTheme} from '../../contexts/ThemeContext';
import url from '../../config/url'
import {FlexH,FlexV,GapV,TelecomCard,TelecomLogo,TelecomOverlay,AddButton,InputField,ErrorText,ThemeButton,IconButton,Spinner} from "../styles/Admin.style";
//import validURL from "../../utils/validURL";
import {useTelecom} from '../../contexts/TelecomContext'
import {validateTelecom} from "../../utils/validate";

export default  () =>{
const init = {id:null,name:'',icon:''};
    const {modeData:{backSecondary,textSecondary}} = useTheme() 
    const [errors, setErrors] = useState({});
       
    const {telecoms,fetchTelecoms} = useTelecom();
    const [modified,setModified] = useState(telecoms);
        //const [telecoms, setTelecoms] = useState(JSON.parse(localStorage.getItem('telecoms')) || []);
        const [initData, setInitData] = useState(init);
        const [formInit, setFormInit] = useState(false);
        const [loading, setLoading] = useState(false);
    const isMobile = useMediaQuery({maxWidth:768})
    const [editMode, setEditMode] = useState(false);
    let telecomData = {};  
        /*useEffect(()=>{
            const fetchTelecoms= async ()=>{
                try{
                    setLoading(true)
                    let res = await fetch(telecomURL)
                    let data = await res.json();
                    if (!res.ok) throw new Error(data.message || 'failed to fetch operators');
                        
                    setTelecoms(data);
                    localStorage.setItem('opts',JSON.stringify(data));
                }catch(err) { toast.error(err.message)}
                finally{setLoading(false)}
            }
            (telecoms.length==0 || !telecoms) && fetchTelecoms();
        },[])*/


        /*const editTelecom = (data,id)=>{
            // e.preventDefault();
            fetch(`${operatorURL}/${id}`,{
                method: 'POST',
                credentials: 'include',
                headers: {   'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            })
            setFormInit(false);
        };*/
        const addTelecom = /*[{name:'', code:''},*/async ({name,icon})=>{
             //const validationErrors = {};
            //else if(telecoms.some(({name})=>name===newName)) validationErrors.name='Name already exists';
            //let validationErrors= validateTelecom(telecoms, {name:initData.name, newName:telecomData.newName, icon:telecomData.icon})
            //if(Object.keys(validationErrors).length>0) {return setErrors(validationErrors);}
            setLoading(true);
            try{
                let res = await fetch(url.urlTelecom,{
                    method: 'PATCH',
                    credentials: 'include',//  },
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({name,icon})//JSON.stringify({newName:telecomData.newName,icon:telecomData.icon})
                })
             let data = await res.json();
                if(!res.ok) throw new Error(data.error || 'failed to add telecom operator');
            toast.success('telecom added')
            setModified(data.telecoms);fetchTelecoms()
            }catch(err){ toast.error(err.message)}
            finally{setLoading(false);setInitData(init);setFormInit(false)}
        }//]
        
    const editTelecom = async (id,{name,icon})=>{
//const {newName,icon} = telecomData;
        //let validationErrors=validateTelecom({telecoms,name:initData.name,newName,icon})
        //if(Object.keys(validationErrors).length>0) return setErrors(validationErrors);
        //if(initData.name==newName&&initData.icon==icon)return toast.success('')
        setLoading(true);
        try{
            let res = await fetch(`${url.urlTelecom}/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {'Content-Type':'application/json'},//  },
                body: JSON.stringify({name,icon})//JSON.stringify({name:initData.name,...telecomData/*newName,icon*/})
            })
            let data = await res.json();
            if(!res.ok) throw new Error(data.error ||'failed ');

            toast.success(data.message);setModified(data.telecoms);  /*setTelecoms(data);*/fetchTelecoms()
        }catch(err ){ toast.error('failed to update icon link')}
        finally{setLoading(false);setInitData(init);setFormInit(false)}
    }
    const handleSubmit= e=>{
        e.preventDefault();
        initData.id?editTelecom(initData.id,initData):addTelecom(initData)//config[1]({name:config[0].name, newName:e.target[0].value.trim(), icon:e.target[1].value.trim()})
    }                    
    
                               
                               
let content = <div style={{background:backSecondary,color:textSecondary}}>
            <h4 style={{marginBottom: '3rem'}}>Telecoms</h4>
            {/*formInit &&<SimForm stateHandler={config} hideForm={e=>setEditInit(false)} />*/}
            {formInit &&<form onSubmit={handleSubmit}>
                        <FlexV x='flex-start' y='flex-start'>
                            {/*<Form.Label>Telecom Name</Form.Label>*/}
                            <InputField type='text' placeholder='telecom name' value={initData.name} onChange={e=>setInitData({...initData,name:e.target.value})}  />
                            <ErrorText>{errors?.name}</ErrorText>
                        </FlexV><GapV x='1'/>
                        <FlexV x='flex-start' y='flex-start'>
                            {/*<Form.Label>Logo URL</Form.Label>*/}
                            <InputField type='text' placeholder='telecom icon link' value={initData.icon} onChange={e=>setInitData({...initData,icon:e.target.value.trim()})}  />
                            <ErrorText>{errors?.icon}</ErrorText>
                        </FlexV><GapV x='1'/>
                        <FlexH x='flex-end' y='center'>
                            <button onClick={e=>setFormInit(false)}>CANCEL</button>
                            {/*loading?<Button><Spinner animation="border" size="sm"></Spinner></Button>:*/}<FlexH x='flex-end' y='center'><ThemeButton type='submit'  disabled={loading}>{loading?<Spinner  size="1"/>:initData.id?'EDIT':'ADD'}</ThemeButton></FlexH>
                        </FlexH>
                    </form>}
            {!formInit &&<FlexH x='space-between' y='flex-start'>{/*<table>
                <tr>
                    {fields.map((f,i)=> <th key={i}>{f}</th>)}
                </tr>
            </table>*/}
                {modified.map(({_id,icon,name, },i)=> <TelecomCard key={i}>
                    {/*<h4>{name}</h4>*/}<TelecomLogo src={icon} alt="" />
                    <TelecomOverlay><IconButton style={{color:textSecondary}} onClick={e=>{setInitData({id:_id,name,icon});setFormInit(true);}}><MdEdit /></IconButton></TelecomOverlay>
                    {/*<td><span onClick={deleteOperator}><FaDelete /></span></td>*/}
                </TelecomCard>)}
                <AddButton onClick={e=>{setInitData(init);setFormInit(true)}}><BsPlusLg/></AddButton>
                </FlexH>
            }    
        </div>
        return <>{isMobile ? (
        <Col xs={12}>
          <Accordion.Item eventKey="0">
            <Accordion.Header>Telecom Setting</Accordion.Header>
            <Accordion.Body>{content}</Accordion.Body>
          </Accordion.Item>
        </Col>
      ) : (
        <Col md={6} xl={4}>{content}</Col>
      )}</>
}
