import { useEffect,useState, } from 'react'
import {useMediaQuery} from 'react-responsive';
import { toast } from 'react-toastify'
import {useTheme} from '../../contexts/ThemeContext'
import {Col,FlexH,GapV,Field,ThemeButton,TinyIcon,Spinner} from '../styles/Admin.style';
/*import {Accordion,Col,*/   import Accordion from './Accordion'
import url from '../../config/url';

export default  () =>{
     const isMobile = useMediaQuery({maxWidth:768});
    const [socialLinks,setSocialLinks] = useState([]);
    const [modified,setModified] = useState([]);
    const [loading, setLoading] = useState(false);
    const {modeData:{backSecondary,textSecondary}} = useTheme()// fetch()
           
    useEffect(() => {fetchSocialLinks()},[])
    
    const fetchSocialLinks = async e =>{
            fetch(url.urlSocialLinks,{credentials:'include'}).then(res => res.json())
            .then(data => {setSocialLinks(data);  setModified(data)})
            .catch(e => toast.error(e.message))
            //.finally(()=>{setLoading(false)})
    }

    const saveModified = async e=>{
        e.preventDefault();
        let updates = [];
        if(JSON.stringify(modified)===JSON.stringify(socialLinks)) return toast.success('saved successfully');
        socialLinks.forEach((link,i)=>{
            if(e.target[i].value.trim()!==link.url) {updates.push({media:link.media, updatedURL:e.target[i].value.trim()})}
        })
        setLoading(true);
        try{
          let res = await fetch(url.urlSocialLinks,
            {
              method: 'PATCH',
              credentials: 'include',
              headers: {'Content-Type':'application/json'},
              body: JSON.stringify(updates)
            }
          )
          let data = await res.json()
          if (!res.ok) throw new Error(data.error ||'failed to edit link')
          setSocialLinks(data.socialLinks);toast.success(data.message||'link saved')
        }catch(err){  toast.error(err.message)}
        finally{setLoading(false)}
    };
    const handleChange = (value,media) =>setModified(prev=>prev.map(link=>link.media===media?{...link,url:value}:link))
        
    let content = <div style={{background:backSecondary,color:textSecondary,padding:'0.5rem'}}>
        <h4 style={{marginBottom:'2rem'}}>Social Media</h4>
        <form onSubmit={saveModified}>
            <div>
                {modified?.map(({_id,media,icon,url},i) => <FlexH x='space-between' y='center' key={_id} style={{width:'100%',marginBottom:'1rem'}}><TinyIcon src={icon} alt={media}/*style={{width:'100%',height:'100%'}}*//>  <Field x='20' value={url} onChange={e=>handleChange(e.target.value,media)}/>
                    {/*<div style={{width: '4rem',height:'4rem',marginRight:'2rem'}} onClick={e=>fileRef.current.click()}><input ref={fileRef} type="file" name="" hidden /><img style={{width:'100%', height:'100%'}} src={icon} alt={media} /></div>
                    <input type="text" value={contactNumber} />*/}
                </FlexH>)} 
            </div>
            <FlexH x='flex-end' y='center'><ThemeButton  type='submit' disabled={loading}>{loading?<Spinner  size='1'></Spinner>:'SAVE'}</ThemeButton></FlexH>
        </form><GapV x='5'/>
    </div>

        
    return<>{isMobile ? (
        <Col /*xs={12}*/>
          <Accordion title='Social Links' content={content}/>
        </Col>
      ) : <Col /*md={6} xl={4}*/>{content}</Col>
      }</>
}

          
            
