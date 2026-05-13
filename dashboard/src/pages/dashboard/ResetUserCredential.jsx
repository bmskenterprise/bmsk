import {useState} from 'react';
import {useLocation,Navigate} from 'react-router-dom'
//import {validateCredential} from '../../utils/validate'
import {useTheme} from '../../contexts/ThemeContext'
import {useUser} from '../../contexts/UserContext'
import {Stack,FlexH,GapV,CenterCard,InputField,ErrorText,ThemeButton,Loader,Spinner} from '../../components/styles/Admin.style'
import AdminPIN from '../../components/AdminPIN'

export default () =>{
    //const navigate = useNavigate()      //
    const location = useLocation()
    const {id,username,credentialType} = location?.state
    const {thememode,modeData:{backPrimary,textPrimary},themeData:{themeBackground}} = useTheme()
    const {resetUserPassword,resetUserPIN,errors,loading} = useUser();
    if(!id) return <Navigate to='/manage-user'/>
    
    const handleSubmit = (e) => {
        e.preventDefault()
        let formData = {
            password:{id,password:e.target[0].value.trim(), confirm:e.target[1].value.trim()},
            pin: {id,pin:e.target[0].value.trim(),confirm:e.target[1].value.trim()}
        }  
        let action = {
            password: resetUserPassword,
            pin: resetUserPIN
        } 
        //const validationErrors = validateCredential({...formData[credential],confirm:e.target[2].value.trim()});
        //if (Object.keys(validationErrors).length) {return setErrors(validationErrors);}
        AdminPIN([thememode,themeBackground],{cb:action[credentialType],data:formData[credentialType]},'RESET')
  }
  
             
  return <Stack style={{background:backPrimary,color:textPrimary,width:'100vw',height:'97vh'}}>
      {/*<div style={{width:'100vw',height:'100vh',position:'absolute',top:0,left:0,background:'inherit',color:'inherit'}}>*/}
        <CenterCard>
        <h3>Reset User {credentialType}</h3>
        <h4>{username}</h4><GapV x='4'/>
            <form onSubmit={handleSubmit}>
               <GapV x='2'/><div>
                  <InputField placeholder={`New ${credentialType}`}/>
                  <ErrorText>{errors?.[credentialType]}</ErrorText>
              </div>
               <GapV x='2'/><div>
                  <InputField placeholder={`Confirm ${credentialType}`}/>
                  <ErrorText>{errors?.confirm}</ErrorText>
              </div>
              <GapV x='3'/><FlexH x='center'><ThemeButton type='submit' disabled={loading}>{loading?<Spinner size='1'/>:'NEXT'}</ThemeButton></FlexH>
            </form>
        </CenterCard>
      {/*</div>*/}
    {loading&&<Loader><Spinner  /></Loader>}
  </Stack>
}
