import {useEffect,useState} from 'react';
import {useParams,} from 'react-router-dom';
import {toast} from 'react-toastify';
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {useTheme} from '../../contexts/ThemeContext';
import {Stack,CenterCard,FlexH,GapV,Loader,InputField,ThemeButton,Spinner} from '../../components/styles/Admin.style';
import url from '../../config/url';


export default () =>{
  const {credential} = useParams()
  const {modeData} = useTheme()
  const {sendRecoveryEmail} = useAdminAuth()
  const [loading,setLoading] = useState(false)
  
  useEffect(()=>{sendRecoveryEmail(credential)}, [credential])
  
  const verifyEmail = async (e) =>{e.preventDefault()
    setLoading(true);
    try{
      let res = await fetch(`${url.urlRecoveryEmail}/${credential}`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({email:e.target[0].value.trim()})
      });
      let data = await res.json();
      if(!res.ok){throw new Error(data.message || 'failed to send email');}
      toast.success(data.message);
    }catch(e) {toast.error(e.message);}
    finally{setLoading(false)}
  }
  
  return <Stack style={{color:modeData.textPrimary,width:'100vw',height:'100vh'}}><CenterCard>
    <h4>Reset {credential}</h4>
    <p>Enter your email to get reset link</p><GapV x='6'/>
    <form onSubmit={verifyEmail}>
      <InputField type='email' placeholder='Enter your Email'/><GapV x='4'/>
      <FlexH x='center'><ThemeButton type='submit'>SUBMIT</ThemeButton></FlexH>
    </form><GapV x='6'/>
    </CenterCard>
    {loading&&<Loader><Spinner/></Loader>}
  </Stack>
}