import {useEffect,useState} from 'react';
import {useMediaQuery} from 'react-responsive';
import {toast} from 'react-toastify';
import {serviceTypes} from '../../../Preferences';
import {useTheme} from '../../contexts/ThemeContext';
import {useAdminAuth} from '../../contexts/AdminAuthContext';
import {Col,FlexH,GapV,ThemeButton,Spinner} from '../styles/Admin.style';
import url from '../../config/url';
import Accordion from './Accordion';
import SwitchItem from '../Switch';

export default () => {
  const isMobile = useMediaQuery({maxWidth:768})
  const {modeData:{backSecondary,textSecondary}} = useTheme();
  const [loading,setLoading] = useState(false);
  const [edited,setEdited]= useState([])
  let services //;
  
  useEffect(()=>{fetchServices()}, [])
  const fetchServices = async () =>{
    try{
      let res = await fetch(url.urlServices,{credentials:'include'});
      let data = await res.json()
      if(!res.ok) throw new Error(data.error)
      setEdited(data);services=edited
    }catch(e) {}
  }
  
  const editServices = async (e) => {
    e.preventDefault()
    //if(JSON.stringify(edited.sort())===JSON.stringify(services.sort())) {toast.info('No changes made');return};
    setLoading(true);
    try {
      let res = await fetch(url.urlServices, {
        method: 'PATCH',credentials:'include',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({services:edited})
      });
      let data = await res.json();
      if(!res.ok){throw new Error(data.error || 'failed to edit resource');}
      toast.success(data.message);
    }catch(err) {toast.error(err.message);}
    finally{setLoading(false)}
  }
  const handleChange = (e) =>{
    if(e.target.checked) setEdited(prev=>[...prev,e.target.value])
    else setEdited(prev=>prev.filter(s=>s!==e.target.value))
  }
  let content = <div style={{background:backSecondary,color:textSecondary,padding:'0.5rem'}}>
    <h4>Services</h4><GapV x='2'/>
    <form onSubmit={editServices}>
      {serviceTypes.map((s,i)=> <div /*x='flex-start' y='center'*/ key={i}>
        <SwitchItem label={s} check={edited?.includes(s)} v={s} identity={s} handleChange={handleChange}/><GapV x='2'/>
        {/*<label>{s}</label>*/}
      </div>)}
      <GapV x='2'/><FlexH x='flex-end' y='center'><ThemeButton type='submit' disabled={loading}>{loading?<Spinner  size='1'/>:'SAVE'}</ThemeButton></FlexH>
    </form>
  </div>
  
  return <>{isMobile?<Col /*xs={12}*/>
              
              <Accordion title='Services'  content={content}/>
              </Col>:<Col /*md={6} xl={4}*/>{content}</Col>
      }</>
}
              
                
                  
                   
