import {useState} from 'react';
import {useLocation,Navigate} from 'react-router-dom'
import {useTheme} from '../../contexts/ThemeContext'
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {Stack,FlexH,GapV,CenterCard,InputField,ErrorText,ThemeButton,Loader,Spinner} from '../../components/styles/Admin.style'
import {validateCredential} from '../../utils/validate'
import AdminPIN from '../../components/AdminPIN'

export default () =>{
    //const navigate = useNavigate()
    const location = useLocation()
    const {thememode,modeData:{backPrimary,textPrimary}}=useTheme()
    const {id,username,credentialType} = location?.state
    const {resetAdminPassword,resetAdminPIN,errors,loading} = useAdminAuth();
    if(!id) return <Navigate to='/manage-admins'/>
  
    const handleSubmit = (e) => {
        e.preventDefault()
        let formData = {
            password:{id,password:e.target[0].value.trim(),confirm:e.target[1].trim() },
            pin: {id,pin:e.target[0].value.trim(),confirm:e.target[1].trim()}
        }  
        let action = {
            password: resetAdminPassword,
            pin: resetAdminPIN
        } 
        AdminPIN([thememode,themeBackground],{cb:action[credentialType],data:formData[credentialType]},'RESET')
  }
             
             
  return <Stack style={{background:backPrimary,color:textPrimary,width:'100vw',height:'97vh'}}>
      {/*<div style={{background:backPrimary,color:textPrimary,width:'100vw',height:'100vh',position:'absolute'}}>*/}
        <CenterCard>
        <h4>{username}</h4>
        <h3>Reset Admin {credentialType}</h3><GapV x='4'/>
            <form onSubmit={handleSubmit}>
              <div>
                  <InputField placeholder={`New ${credentialType}`}/>
                  <ErrorText>{errors?.[credentialType]}</ErrorText>
              </div><GapV x='2'/>
              <div>
                  <InputField placeholder={`Confirm ${credentialType}`}/>
                  <ErrorText>{errors?.confirm}</ErrorText>
              </div><GapV x='1'/>
              <GapV x='3'/><FlexH x='center'><ThemeButton type='submit' disabled={loading}>{loading?<Spinner/>:'NEXT'}</ThemeButton></FlexH>
            </form>
        </CenterCard>
        {/*</div>*/}
    {loading&&<Loader><Spinner  /></Loader>}
  </Stack>
}
