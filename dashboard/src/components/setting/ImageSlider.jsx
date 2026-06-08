import {useEffect,useState,useRef} from 'react';
import {useLocation} from 'react-router-dom';
import {useMediaQuery} from 'react-responsive';
import {BsPlusLg} from 'react-icons/bs'
import {FaPen,FaTrash} from 'react-icons/fa';
import {toast} from 'react-toastify';
import {useTheme} from '../../contexts/ThemeContext';
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {Col,FlexH,GapV,GapH,ScrollViewV,InputField,Stack,ThemeButton,IconButton,Spinner} from '../styles/Admin.style'
import url from '../../config/url';
import Accordion from './Accordion';
import validURL from '../../utils/validURL';
import SwitchItem from '../Switch'

export default  () =>{
    let init = {id:null,link:''}// }*/
    let location = useLocation();
    const {admin} = useAdminAuth()
    const accesses = admin?.accesses
    const isMobile = useMediaQuery({ maxWidth: 768 });
    let [imagesRef,linkRef]=[useRef(null),useRef(null)];
    const [images,setImages] = useState([]);
    const [loading,setLoading] = useState(false); const [image,setImage] = useState(init);
    const [linkError,setLinkError] = useState(''); const [editMode,setEditMode] = useState(false);
    const [hover,setHover] = useState(false); const {modeData:{backSecondary,textSecondary}} = useTheme();
 
 
    useEffect(()=> {fetchSlides()},[])
     
    const fetchSlides = async e=>{
        try{
            let res = await fetch(url.urlImageSlider,{credentials:'include'})
            let data = await res.json()
            if(!res.ok) throw new Error('failed to fetch slide images')
            setImages(data);
        }catch(e) {toast.error(e.message)}
    }
      
    const selectImage = e =>{
        let file = e.target.files[0]
        if(file && file.type.startsWith('image'){
            let reader = new FileReader();
            reader.readAsDataURL(file)
            reader.onloadend = e => setImage(prev=>({...prev,link:reader.result}))
        }
    }
        //let [token, admin] = [localStorage.getItem('token'), localStorage.getItem('admin')]
            //if(validURL(linkText.trim()))return setLinkError('');
    const addImageLink = async () =>{// =async e=>{
        setLoading(true)
        try{
            let res= await fetch(url.urlImageSlider, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type':'application/json' },
                body: JSON.stringify({link:image.link,active:true})
            })
            let data = await res.json()
            if(!res.ok) throw new Error(data.error||'failed to add image link')
            setImages(data.slides);
            toast.success(data.message)
        }catch(e) {toast.error(e.message)}//   .catch(err => toast.error('failed to add image link'))
        finally{setLoading(false);setImage(init);setEditMode(false)}//    .finally(()=>setLoading(false))
    };    

    const editImageLink = async (id,link,active) =>{// = {
        setLoading(true)
        try{
            let res= await fetch(`${url.urlImageSlider}/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type':'application/json' },
                body: JSON.stringify({link,active})
           })
           let data = await res.json()
           if(!res.ok) throw new Error(data.error||'failed to update image link')
           setImages(data.slides)
        }catch(e) {toast.error(e.message)}//  .catch(err => toast.error('failed to update image link'))
        finally{setLoading(false);setImage(init);setEditMode(false)}//   .finally(()=>{setLoading(false);setEditMode(false)})
    };


        /*const toggleImageLink = async (status,linkText) => {
            try {
                let res = await fetch(`sliderImagesURL/${admin}`, {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: { 'Content-Type':'application/json' },
                    body: JSON.stringify({link:linkText,active:status})
                })
                let data = await res.json();
                if(!res.ok){
                    throw new Error(data.error)
                }
            }catch(err) {toast.error(err.message)}
                toast.error(err.message || 'failed to update image link')
        }*/
        

    const deleteImage = async imageId =>{// = linkText=>{
        if(!accesses?.includes('modify-setting')) {toast.info('you don\'t have modify permission');return}
            setLoading(true);
        try{
            let res= await fetch(`${url.urlImageSlider}/${imageId}`, {
                method: 'DELETE',
                credentials: 'include',
                //headers: { 'Content-Type':'application/json' },
            })
            let data = await res.json()
            if(!res.ok) throw new Error(data.error)
            setImages(data.slides);toast.success(data.message)
        }catch(err) {toast.error(err.message)}   
        finally{setLoading(false)}
    };
        const handleSubmit = e =>{//setLoading(true);
            //let link = e.target.url.value
            e.preventDefault()
        if(!accesses?.includes('modify-setting')) {toast.info('You don\'t have modify permission');return}
            if(!validURL(image.link)) {setLinkError('enter a valid link');return}
            if(images.some(l=>l.link==image.link))return setLinkError('link already exists');
            if(image.id) editImageLink(image.id,image.link)
            else addImageLink()
        }

        let content = <div style={{background:backSecondary,color:textSecondary,padding:'0.5rem'}}>
            {/*Object.keys(permission).map((p) => {
                permission[p].map((t,i)=> <div key={i}><input type='radio' name={key.split(' ')[0]} id={t} /><label htmlFor={t}>{t}</label></div>)
            })*/}
            {/*<div style={{background:backSecondary, color:textSecondary}}>*/}
                <h4 style={{marginBottom:'2rem'}}>Image Slider</h4>
                <ScrollViewV style={{maxHeight:'30rem'}}>{!editMode&&<FlexH x='space-between' y='center' ref={imagesRef}>
                    {images?.map(({_id,link,active}) => <Stack key={_id} onMouseOver={e=>setHover(true)} onMouseLeave={e=>setHover(false)} style={{aspectRatio:'4/3',width:'30%',background:`url(${link})`}}>
                        {(hover || !active) && <div onClick={e=>location.pathname=link}  ></div>}
                        {hover && <FlexH x='space-between' y='center' style={{position:'absolute',top:'0',left:'0',zIndex:'3',width:'100%',height:'40%'}}>
                            <SwitchItem  check={active} handleChange={e=>editImageLink(_id,undefined,e.target.checked)} />
                            <IconButton onClick={e=> {setEditMode(true);setImage({id:_id,link})}}><FaPen /></IconButton>
                            <IconButton onClick={e=>deleteImage(_id)}><FaTrash /></IconButton>
                        </FlexH>}
                        </Stack>
                    )}
                    <div style={{aspectRatio:'4/3',cursor:'pointer',display:'grid',placeItems:'center',width:'30%'}} onClick={e=>{setEditMode(true);setImage(init)}}><BsPlusLg/></div>
                </FlexH>}
                {editMode && <form onSubmit={handleSubmit}>
                    <div  >
                        <div><InputField type='file' style={{width:'100%'}} accept='.jpg, .jpeg, .png, .webp'   onChange={selectImage}/><span style={{color:'red'}}>{linkError}</span></div><GapV x='2'/>
                        <FlexH x='flex-end'><button type='button' onClick={e=>setEditMode(false)}>CANCEL</button><GapH x='2'/> <ThemeButton  type='submit' disabled={loading}>{loading?<Spinner  size='1'/>: 'SAVE'}</ThemeButton></FlexH>
                    </div>
                </form>}</ScrollViewV>
            {/*</div>*/}
        </div>

    return <>{isMobile ? (
        <Col /*xs={12}*/>
        <Accordion title='Image Slider' content={content}/>
        </Col>
      ) : <Col /*md={2} xl={4}*/>{content}</Col>}</>
}
          
