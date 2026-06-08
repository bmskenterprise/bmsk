import { useEffect,useState, } from 'react'
import {useMediaQuery} from 'react-responsive';
import { toast } from 'react-toastify'
import {useTheme} from '../../contexts/ThemeContext'
 import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {Col,FlexH,GapV,Field,ThemeButton,TinyIcon,Spinner} from '../styles/Admin.style';
import Accordion from './Accordion'
import url from '../../config/url';

export default  () =>{
  const isMobile = useMediaQuery({ maxWidth: 768 });
    const {modeData:{backSecondary,textSecondary}} = useTheme()// fetch()
    const [modifiedContacts,setModifiedContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const {admin} = useAdminAuth()
    const accesses = admin?.accesses
    let contacts;
    useEffect(() => {fetchContacts()},[])
    const fetchContacts = async e=>{
        fetch(url.urlContacts,{credentials:'include'}).then(res => res.json())
            .then(data => {setModifiedContacts(data);contacts = data})
            .catch(err => toast.error(err))
            //.finally(()=>{setLoading(false)})
    }

    const saveModified = async e=>{
        e.preventDefault();
        if(!accesses?.includes('modify-setting')) {toast.info('you don\'t have modify permission');return}
        let updates = [];
        if(JSON.stringify(modifiedContacts)===JSON.stringify(contacts)) return toast.success('saved successfully');
        contacts.forEach((contact,i)=>{
            if(e.target[i].value.trim()!==contact.contactURL) {updates.push({media:contact.media, updatedURL:e.target[i].value.trim()})}
        })
        setLoading(true);console.log(updates);
        try{
          let res = await fetch(url.urlContacts,
            {
              method: 'PATCH',
              credentials: 'include',
              headers: {'Content-Type':'application/json'},
              body: JSON.stringify(updates)
            }
          )
          let data = await res.json()
          if (!res.ok) throw new Error(data.error ||'failed to edit contact')
          setModifiedContacts(data.contacts);toast.success(data.message||'contact saved')
        }catch(err){  toast.error(err.message)}
        finally{setLoading(false)}
    };
    const handleChange = (value,media) =>setModifiedContacts(prev=>prev.map(contact=>contact.media===media?{...contact,contactURL:value}:contact))
    
    let content= <div style={{background:backSecondary, color:textSecondary}}>
        <h4 style={{marginBottom:'2rem'}}>Contact Media</h4>
        <form onSubmit={saveModified}>
            <div>
                {modifiedContacts?.map(({media,icon,contactURL},i) => <FlexH x='space-between' y='center' key={i}style={{width:'100%',marginBottom:'1rem'}}><TinyIcon src={icon} alt={media} /*style={{width:'100%',height:'100%'}}*//>  <Field x='20' value={contactURL} onChange={e=>handleChange(e.target.value,media)}/>
                    {/*<div style={{width: '4rem',height:'4rem',marginRight:'2rem'}} onClick={e=>fileRef.current.click()}><input ref={fileRef} type="file" name="" hidden /><img style={{width:'100%', height:'100%'}} src={icon} alt={media} /></div>
                    <input type="text" value={contactNumber} />*/}
                </FlexH>)} 
            </div>
            <FlexH x='flex-end' y='center'><ThemeButton  type='submit' disabled={loading}>{loading?<Spinner  size='1'/>:'SAVE'}</ThemeButton></FlexH>
        </form>
    </div>

    return<>{isMobile ? (
        <Col /*xs={12}*/>
        <Accordion title='Contact Sttings' content={content}/>
        </Col>
      ) : <Col /*md={6} xl={4}*/>{content}</Col>
      }</>
}

        
          
            
        
