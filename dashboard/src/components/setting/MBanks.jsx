import {useEffect,useState} from 'react'
import {useMediaQuery} from 'react-responsive'
import {toast} from 'react-toastify'
import {BsPlusLg} from 'react-icons/bs' //
import {useTheme} from '../../contexts/ThemeContext'
import {Col,FlexH,GapV,GapH,Field,InputField,ErrorText,ThemeButton,PrimaryButton,TinyIcon,Spinner} from '../styles/Admin.style'
import {validateMBank} from '../../utils/validate';
import url from '../../config/url'
import Accordion from './Accordion'
import SwitchItem from '../Switch';

export default ()=>{
    const isMobile = useMediaQuery({maxWidth:768})
    const {modeData:{backSecondary,textSecondary}} = useTheme();
    const [mobileBanks,setMobileBanks] = useState([]);
    const [modified,setModified] = useState([]);
    const [errors,setErrors] = useState({});
    const [loading,setLoading] = useState(false);
    const [addInit,setAddInit] = useState(false)
    const [icon,setIcon] = useState('')
    let mbanks
    
    useEffect(()=>{fetchMBanks();},[])
    
    const fetchMBanks = async e =>{
        try{
            let res = await fetch(url.urlMBank,{credentials:'include'})
            let data = await res.json()
            if(!res.ok) throw new Error('failed mbanks')
            setMobileBanks(data)
            mbanks = data
            if(!res.ok) throw new Error()
        }catch(e) {toast.error(e.message)}
    }
              
    const selectLogo = e =>{
        const file = e.target.files?.[0]
        if(file&&file.type.startsWith('image/')) {
            let img = new Image();
            const url = URL.createObjectURL(file)
            img.onload = e => {
                if(img.naturalWidth!=img.naturalHeight) toast.error('logo sould be a square')
                else {
                    let reader = new FileReader();
                    reader.readAsDataURL(file)
                    reader.onloadend = e => setIcon(reader.result);
                }
            }
            img.src = url
        }
    }
                  
  const changeAccount=(id,value) =>{
    setMobileBanks(prev=>prev.map(b=>b._id==id?{...b,account:value.trim()}:b))
    setModified(prev=> prev.find(b=>b._id==id) ? prev.map(b=>b._id==id?{...b,account:value.trim()}:b) : [...prev,{_id:id,account:value.trim()}])
  }
  const changeStatus=(id,status) =>{
    setMobileBanks(prev=> prev.map(b=>b._id==id?{...b,active:status}:b))
    setModified(prev=> prev.find(b=>b._id==id) ? prev.map(b=>b._id==id?{...b,active:status}:b) : [...prev,{_id:id,active:status}])
  }
  
  const changeMbank = async (formData) =>{
    setLoading(true);
    try{
      let res = await fetch(url.urlMBank, {
        method:'PATCH',
        credentials:'include',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(formData)
      })
      let data = await res.json()
      if(!res.ok) throw new Error(data.error || 'failed to change mbank');
      toast.success(data.message)
    }catch(err) {toast.error(err.message)}
    finally {setLoading(false)}
  }
    const addMbank = async (e) =>{e.preventDefault()
      let formData={name:e.target.name.value.trim(),icon:e.target.icon.value.trim()}
      const validationResult = validateMBank(formData)
      if(Object.keys(validationResult).length) {setErrors(validationResult);return}
      try{
        let res = await fetch(url.urlMBank,{
          method:'POST',credentials:'include',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({name:e.target.name.value.trim(),icon})
        })
        let data = await res.json()
        if(!res.ok) throw new Error(data.message);
        setAddInit(false);setMobileBanks(data.mbanks)
      }catch(e) {toast.error(e.message)}
    }
    const handleSubmit = (e) => {
      e.preventDefault()
      if(JSON.stringify(modified)==JSON.stringify(mbanks)) {toast.info('No changes made');return}
      //let validationErrors = validateMBanks(modified.map(mb=>({name:mb.name,account:mb.account})))
      //if(Object.keys(validationErrors).length) {setErrors(validationErrors);return}
      changeMbank(modified)
    }
    
  let content= <div style={{background:backSecondary,color:textSecondary}}>
    <h4 >MBanks</h4><GapV x='2'/>
    {addInit?<form onSubmit={addMbank}>
      <div>
        <InputField name='name' placeholder='Name'/>
        <ErrorText>{errors?.name}</ErrorText>
      </div><GapV x='2'/>
      <div>
        <InputField type='file' accept='.jpg, .jpeg, .png, .webp' onChange={selectLogo}/>
        <ErrorText>{errors?.icon}</ErrorText>
      </div><GapV x='3'/>
      <FlexH x='flex-end'><ThemeButton type='submit'>ADD</ThemeButton></FlexH>
    </form>
    :<div>
      <FlexH x='flex-end'><PrimaryButton onClick={e=>setAddInit(true)}><BsPlusLg/></PrimaryButton><GapH x='1'/></FlexH><GapV x='2.5'/>
      <form onSubmit={handleSubmit}>
        {mobileBanks?.map(({_id,name,icon,account,active},i)=><FlexH x='space-between' y='center' key={i} style={{marginBottom:'2rem'}}>
          <div style={{width:'15%'}}><TinyIcon src={icon} alt={name}/></div>
        <FlexH x='flex-end' y='center' style={{width:'75%'}}>
          <div> <Field x='18' name={name} value={account} onChange={e=>changeAccount(_id,e.target.value)}/>
          <ErrorText>{errors?.name}</ErrorText></div><GapH x='1.5'/>
        <SwitchItem check={active} handleChange={e=>changeStatus(_id,e.target.checked)}/>
        </FlexH>
        </FlexH>)}
        <GapV x='3'/><FlexH x='flex-end'><ThemeButton  type='submit' disabled={loading}>{loading?<Spinner size='1'/>:'Save '}</ThemeButton></FlexH><GapV x='4'/>
      </form>
    </div>}
  </div>
  
  return <>{isMobile?<Col /*xs={12}*/>
            <Accordion title='Mobile Banks' content={content}/>
          </Col>:<Col /*md={6} xl={4}*/>{content}</Col>
        }</>
}
            
            
              
                
                 
