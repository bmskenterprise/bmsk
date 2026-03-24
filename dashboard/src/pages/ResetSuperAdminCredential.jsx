import React,{useEffect,useState} from 'react';
import {useLocation,useNavigate,useParams} from 'react-router-dom';
import {FaEye,FaEyeSlash} from 'react-icons/fa';
import {useTheme} from '../contexts/ThemeContext';
import {Stack,CenterCard,FlexH,GapV,InputField,ErrorText,ThemeButton,Loader,Spinner} from '../components/styles/Admin.style';
import {useAdminAuth} from '../contexts/AdminAuthContext';
import url from '../config/url';

export default ()=>{
  let location=useLocation();
  let {token}=useParams()
  let navigate=useNavigate();
  const {resetSuperAdminPassword,resetSuperAdminPIN,errors,loading} = useAdminAuth();
  const [show,setShow] = useState(false)
  let match= location.pathname.match(/recover-(\w+)/);
  const credentialType=match[0].split('-')[1]
  useEffect(()=>{
    initRecovery()
  },[])
  
  const initRecovery = async() =>{
    try{
      let res =await fetch(`${url.urlInitRecovery}/${token}`);
      await res.json();
    }catch(e) {navigate('/')}
  }
  const resetSuperAdminCredential= async (e)=>{
      e.preventDefault()
      let formData = {password:{password:e.target[0].value.trim(),token},pin:{pin:e.target[0].value.trim(),token}}
          let action = {
              password: resetSuperAdminPassword,
              pin: resetSuperAdminPIN
          } 
          action[credentialType](formData[credentialType])
  }
            
          
  return <Stack style={{width:'100vw',height:'100vh'}}>
    <CenterCard /*style={{width:'60vw',height:'60vh',position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)'}}*/>
      <h4 style={{marginBottom:'2rem'}}>Reset {credentialType}</h4><GapV x='4'/>
      <form onSubmit={resetSuperAdminCredential}>
        <div>
          <InputField placeholder={`New ${credentialType}`} name={credentialType}/>
          <span onClick={e=>setShow(!show)}>{show?<FaEyeSlash/>:<FaEye/>}</span>
        </div>
        <ErrorText>{errors?.[credentialType]}</ErrorText><GapV x='3'/>
        <FlexH x='flex-end'><ThemeButton  type='submit'>RESET</ThemeButton></FlexH>
      </form>
    </CenterCard>
    {loading&& <Loader><Spinner/></Loader>}
  </Stack>
}