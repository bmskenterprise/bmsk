import {useState} from 'react'
import {useLocation} from 'react-router-dom';
import {Form,Button} from 'react-bootstrap';
import {toast} from 'react-toastify';
import {useTheme} from '../../contexts/ThemeContext';
import {useAdminAuth} from '../../contexts/AdminAuthContext';
import {validateCredential} from '../../utils/validate'
import {Stack,FlexH,GapV,CenterCard,InputField,ErrorText,ThemeButton,Loader,Spinner} from '../../components/styles/Admin.style';
//import { changePIN } from '../../../server/controllers/admin.controller';

export default  () =>{
    const location = useLocation();
    const {type} = location.state
    const {modeData:{backPrimary,textPrimary}} = useTheme()
    const [errors, setErrors] = useState({});
    const credentialType = type||location.pathname.split('-')[1];
    const {changeSuperAdminPassword, changeSuperAdminPIN,loading} = useAdminAuth()
    
    const handleForm = async (e) => {
        e.preventDefault();
        //const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,16}$/;
        /*if (!(e.target[0].value.trim())) validationErrors.oldCredential = 'Old password is required';
        else if(!(passwordRegex.test(e.target[0].value.trim()))) validationErrors.oldCredential = 'Old password is invalid';

        if (!(e.target[1].value.trim())) validationErrors.newCredential = 'New password is required';
        else if(!(passwordRegex.test(e.target[1].value.trim()))) validationErrors.newCredential = 'new password is invalid';*/
        let formData = {
            password:{oldPassword:e.target[0].value.trim(), password:e.target[1].value.trim(),confirm:e.target[2].value.trim()},
            pin: {oldPIN:e.target[0].value.trim(),pin:e.target[1].value.trim(),confirm:e.target[2].value.trim()}
        }  
        /*let regex = {
            password: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,16}$/,
            pin: /^\d{4,6}$/
        }*/
        let action = {
            password: changeSuperAdminPassword,
            pin: changeSuperAdminPIN
        } 

        //const validationErrors = validateCredential({...formData[credentialType],confirm:e.target[2].value.trim()});
        //if (Object.keys(validationErrors).length) { setErrors(validationErrors);return}
        action[credentialType](formData[credentialType])// changePassword()  
        
    }
    
    /*const changePIN = async (e) => {
        e.preventDefault();
        const pinRegex = /^\d{4,6}$/;
        let formData={oldPIN:e.target[0].value.trim(),newPIN:e.target[1].value.trim()}
        const validationErrors = validateCredential({...formData,confirm:e.target[2].value.trim()},pinRegex);

        if (Object.keys(validationErrors).length) return setErrors(validationErrors);
         changePIN()
        
    }*/
    
                   
                   
                   
    return <Stack /*x='center' y='center'*/ style={{ width:'100%',height:'100%'}}>
        <div style={{background:backPrimary,color:textPrimary,width:'100%',height:'98vh',position:'absolute',top:'0',left:'0'/*,transform:'translate(-50%,-50%)'*/}}>
          <CenterCard>
              <h3>Admin {credentialType}</h3><GapV x='4'/>
              <form onSubmit={handleForm}>
                <GapV x='3'/><div>
                    <InputField placeholder={`Current ${credentialType}`} />
                    {/*<ErrorText>{errors?.oldCredential}</ErrorText>*/}
                </div>
                <GapV x='3'/><div>
                    <InputField placeholder={`New ${credentialType}`} />
                    <ErrorText>{errors?.[credentialType]}</ErrorText>
                </div>
                <GapV x='3'/><div>
                    <InputField placeholder={`Confirm new ${credentialType}`} />
                    <ErrorText>{errors?.confirm}</ErrorText>
                </div>
                <GapV x='5'/><FlexH x='center' y='center'>{/*<Button onClick={e=>setCredential({type:'',action:null})}>cancel</Button>*/}<ThemeButton type='submit' disabled={loading}>{loading?<Spinner />:'CHANGE'}</ThemeButton></FlexH>
              </form>
          </CenterCard><GapV x='5'/>
        </div>
        {loading &&<Loader><Spinner /></Loader>/*<FlexH x='center' y='center' style={{background:'rgba(0,0,0,0.5)', position:'fixed',top:0,left:0,width:'50vw',height:'50vh',zIndex:1000}}></FlexH>*/}
      </Stack>
}
