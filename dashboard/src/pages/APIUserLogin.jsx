import React,{useState} from 'react';
import {Link,} from 'react-router-dom';
import {validateAPIUser} from '../utils/validate'
import {CenterCard,FlexH,GapV,InputField,ErrorText,ThemeButton,Loader,Spinner} from '../components/styles/Admin.style'
import {useUserAuth} from '../contexts/UserAuthContext'
import {useTheme} from '../contexts/ThemeContext'

export default ()=>{
    let {handleLogin,/*errors,*/loading} = useUserAuth();
    let {modeData} = useTheme();
    let [errors, setErrors] = useState({});
    const {backPrimary} = modeData          //
    const handleSubmit = async (e) => {
        let loginData = {username:e.target[0].value.trim(),password:e.target[1].value.trim()}
            let validationErrors =validateAPIUser(loginData)
            if(Object.keys(validationErrors).length)return setErrors(validationErrors);
     handleLogin(loginData);}
    
    return <div style={{background:backPrimary,position:'relative'}}>
        <CenterCard /*style={{}}*/>
            <form onSubmit={handleSubmit}>
                <InputField   type='text' placeholder='username' />
                <ErrorText >{errors?.username}</ErrorText>
                <InputField   type='password' placeholder='password' />
                <ErrorText >{errors?.password}</ErrorText><GapV x='2'/>
                <ThemeButton type='submit'>{loading?<Spinner size='1'/>:'LOGIN'}</ThemeButton>
                <FlexH><Link to='user/forgot'>Forgot Password?</Link></FlexH>
            </form>
        </CenterCard>
        {/*loading && <Loader><Spinner  /></Loader>*/}
    </div>
}