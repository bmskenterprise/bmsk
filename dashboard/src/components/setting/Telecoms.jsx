import { useEffect,useState,useRef } from 'react';
import {useMediaQuery} from 'react-responsive'
import {MdEdit} from 'react-icons/md'
import {BsPlusLg} from 'react-icons/bs';
import {toast} from 'react-toastify'
import {useTheme} from '../../contexts/ThemeContext';
import {useTelecom} from '../../contexts/TelecomContext'
import {Col,FlexH,GapV,GapH,TelecomCard,TelecomLogo,TelecomOverlay,AddButton,InputField,ErrorText,ThemeButton,IconButton,Spinner} from '../styles/Admin.style';
//import validURL from "../../utils/validURL";
import {validateTelecom} from '../../utils/validate';
import Accordion from './Accordion'
import url from '../../config/url'

export default  () =>{
   
    const init = {id:null,name:'',icon:''}; //const [telecoms, setTelecoms] = useState(JSON.parse(localStorage.getItem('telecoms')) || []);
    const isMobile = useMediaQuery({maxWidth:768})
    const {modeData:{backSecondary,textSecondary}} = useTheme() 
    const {telecoms,fetchTelecoms} = useTelecom();
    const [errors, setErrors] = useState({});
    const [modified,setModified] = useState(telecoms);
        const [initData, setInitData] = useState(init);
        const [formInit, setFormInit] = useState(false);
    const [editMode, setEditMode] = useState(false);
    let telecomData = {};  
       
    const selectLogo = e =>{
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        if(file && file.type.startsWith('image/')) {
           const img = new Image();
           img.onload = e => {
               if(img.naturalWidth!=img.naturalHeight) toast.error('logo should be a square');
               else{
                  let reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onloadend = e => setInitData(prev=>({...prev,icon:reader.result}));
               }
                  URL.revokeObjectURL(url)
           }
           img.src = url
        }
    }
            /*const fetchTelecoms= async ()=>{
                try{
                    setLoading(true)
                    let res = await fetch(telecomURL)
                    let data = await res.json();
                    if (!res.ok) throw new Error(data.message || 'failed to fetch operators');
                        
                    setTelecoms(data);
                    localStorage.setItem('opts',JSON.stringify(data));
                }catch(err) { toast.error(err.message)}
                finally{setLoading(false)}*/


            /*fetch(`${operatorURL}/${id}`,{
                method: 'POST',
                credentials: 'include',
                headers: {   'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            })
        };*/
        const addTelecom = /*[{name:'', code:''},*/async ({name,icon})=>{
             //const validationErrors = {};
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
            }catch(e){ toast.error(e.message)}
            finally{setLoading(false);setInitData(init);setFormInit(false)}
        }//]
        
    const editTelecom = async (id,{name,icon})=>{
//const {newName,icon} = telecomData;
        //let validationErrors=validateTelecom({telecoms,name:initData.name,newName,icon})
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
        }catch(e ){ toast.error('failed to update icon link')}
        finally{setLoading(false);setInitData(init);setFormInit(false)}
    }
    const handleSubmit= e=>{
        e.preventDefault();
        initData.id?editTelecom(initData.id,initData):addTelecom(initData)//config[1]({name:config[0].name, newName:e.target[0].value.trim(), icon:e.target[1].value.trim()})
    }                    
                               
                               
    let content = <div style={{background:backSecondary,color:textSecondary,padding:'0.5rem'}}>
            <h4>Telecoms</h4> <GapV x='2'/>
            {/*formInit &&<SimForm stateHandler={config} hideForm={e=>setEditInit(false)} />*/}
            {formInit ?<form onSubmit={handleSubmit}>
                        <div /*x='flex-start' y='flex-start'*/>
                            <label htmlFor='tname'>Telecom Name</label>
                            <InputField id='tname' placeholder='telecom name' value={initData.name} onChange={e=>setInitData({...initData,name:e.target.value})}  />
                            <ErrorText>{errors?.name}</ErrorText>
                        </div><GapV x='1.5'/>
                        <div /*x='flex-start' y='flex-start'*/>
                            <label htmlFor='logo'>Logo URL</label>
                            <InputField type='file' accept='.jpg, .jpeg, .png, .webp' onChange={selectLogo} id='logo' />
                            <ErrorText>{errors?.icon}</ErrorText>
                        </div><GapV x='3'/>
                        <FlexH x='flex-end' y='center'>
                            <button onClick={e=>setFormInit(false)}>CANCEL</button>
                            {/*loading?<Button><Spinner animation="border" size="sm"></Spinner></Button>:<FlexH x='flex-end' y='center'>*/}<GapH x='2'/><ThemeButton type='submit' disabled={loading}>{loading?<Spinner  size='1'/>:initData.id?'EDIT':'ADD'}</ThemeButton>{/*</FlexH>*/}
                        </FlexH>
                    </form>
             :<FlexH x='space-between' y='flex-start'>{/*<table>
                <tr>
                    {fields.map((f,i)=> <th key={i}>{f}</th>)}
                </tr>
            </table>*/}
                {modified?.map(({_id,icon,name, })=> <TelecomCard key={_id}>
                    {/*<h4>{name}</h4>*/}<TelecomLogo src={icon} alt='' />
                    <TelecomOverlay><IconButton style={{color:textSecondary}} onClick={e=>{setInitData({id:_id,name,icon});setFormInit(true);}}><MdEdit /></IconButton></TelecomOverlay>
                    {/*<td><span onClick={deleteOperator}><FaDelete /></span></td>*/}
                </TelecomCard>)}
                <AddButton onClick={e=>{setInitData(init);setFormInit(true)}}><BsPlusLg/></AddButton>
                </FlexH>
            }    
           <GapV x='5'/>
        </div>
           
        return <>{isMobile ? (
        <Col /*xs={12}*/>
          <Accordion title='Telecom Setting' content={content}/>
        </Col>
      ) : (
        <Col /*md={6} xl={4}*/>{content}</Col>
      )}</>
}

          
