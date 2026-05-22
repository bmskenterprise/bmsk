import {useEffect,useState} from 'react';
import {useLocation,useNavigate,useParams} from 'react-router-dom';
import {FaEye,FaEyeSlash} from 'react-icons/fa';
import {useTheme} from '../contexts/ThemeContext';
import {useAdminAuth} from '../contexts/AdminAuthContext';
import {Stack,CenterCard,FlexH,GapV,InputField,ErrorText,ThemeButton,Loader,Spinner} from '../components/styles/Admin.style';
//import url from '../config/url';

export default ()=>{
       const {modeData:{backPrimary,textPrimary}} = useTheme()
  let location=useLocation();
  let {token}=useParams()
  let navigate=useNavigate();
  const {resetSuperAdminPassword,resetSuperAdminPIN,errors,loading} = useAdminAuth();
  let match = location.pathname.match(/recover-(\w+)/);
  const credentialType = match[0].split('-')[1]
  const [show,setShow] = useState(false)
  /*useEffect(()=>{
    initRecovery()
  },[])
  
  const initRecovery = async() =>{
    try{
      let res =await fetch(`${url.urlInitRecovery}/${token}`);
      await res.json();
    }catch(e) {navigate('/')}
  }*/
  const resetSuperAdminCredential= async (e)=>{
      e.preventDefault()
      let formData = {password:{password:e.target[0].value.trim(),token},pin:{pin:e.target[0].value.trim(),token}}
          let action = {
              password: resetSuperAdminPassword,
              pin: resetSuperAdminPIN
          } 
          action[credentialType](formData[credentialType])
  }
            
  return <Stack style={{background:backPrimary,color:textPrimary,width:'100vw',height:'97vh'}}>
    <CenterCard /*style={{width:'60vw',height:'60vh',position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)'}}*/>
      <h4 style={{color:textPrimary,textTransform:'capitalize'}}>Reset {credentialType}</h4><GapV x='6'/>
      <form onSubmit={resetSuperAdminCredential}>
        <div>
          <InputField placeholder={`New ${credentialType}`} name={credentialType}/>
          <span onClick={e=>setShow(!show)}>{show?<FaEyeSlash/>:<FaEye/>}</span>
        </div>
        <ErrorText>{errors?.[credentialType]}</ErrorText><GapV x='3'/>
        <FlexH x='center'><ThemeButton  type='submit'>RESET</ThemeButton></FlexH>
      </form>
    </CenterCard>
    {loading&& <Loader><Spinner/></Loader>}
  </Stack>
}
