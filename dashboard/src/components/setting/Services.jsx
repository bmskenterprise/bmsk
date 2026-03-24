import React,{useEffect,useState} from 'react';
import {Accordion,Col,} from 'react-bootstrap';
import {useMediaQuery} from 'react-responsive';
import {toast} from 'react-toastify';
import {serviceTypes} from '../../../Preferences';
import {FlexH,ThemeButton,Spinner} from '../styles/Admin.style';
import {useAdminAuth} from '../../contexts/AdminAuthContext';
import url from '../../config/url';
import SwitchItem from '../Switch';

export default () => {
  const {isMobile} =useMediaQuery({maxWidth:768})
  //const {themeData} = useTheme();
  const [loading,setLoading] = useState(false);
  let [edited,setEdited]= useState([])
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
  const handleChange = (e) =>{console.log(e.target.checked,e.target.value);
    if(e.target.checked) setEdited(prev=>[...prev,e.target.value])
    else setEdited(prev=>prev.filter(s=>s!==e.target.value))
  }
  let content= <div>
    <h4 style={{marginBottom:'2rem'}}>Services</h4>
    <form onSubmit={editServices}>
      {serviceTypes.map((s,i)=> <FlexH x='flex-start' y='center' key={i}>
        <SwitchItem label={s} check={edited?.includes(s)} v={s} identity={s} handleChange={handleChange}/>
        {/*<label>{s}</label>*/}
      </FlexH>)}
      <FlexH x='flex-end' y='center'><ThemeButton  type='submit' disabled={loading}>{loading?<Spinner  size='1'/>:'SAVE'}</ThemeButton></FlexH>
    </form>
  </div>
  
  return <>{isMobile?<Col xs={12}>
              <Accordion>
                <Accordion.Item eventKey="0">
                  <Accordion.Header> Services</Accordion.Header>
                  <Accordion.Body>{content}</Accordion.Body>
                </Accordion.Item>
              </Accordion>
              </Col>:<Col md={6} xl={4}>{content}</Col>
      }</>
}