import { useState } from 'react';
import {Navigate} from 'react-router-dom'
//import { Form,InputGroup, Button, } from 'react-bootstrap';
import {FaEye,FaEyeSlash} from 'react-icons/fa'
// from 'react-router-dom';
import {CenterCard,FlexH,GapV,InputField,ErrorText,ThemeButton,Loader,Spinner} from '../../components/styles/Admin.style';
import {useAdminAuth} from '../../contexts/AdminAuthContext';
import {useTheme} from '../../contexts/ThemeContext'
import { validateAdminLogin } from '../../utils/validate';

export default  () =>{
    let {admin,handleLogin,sendRecoveryEmail,loginError,loading} = useAdminAuth();
    let {modeData:{backPrimary,backSecondary,textPrimary,glassmorph}} = useTheme(); //}
    const [show,setShow] = useState(false);
    let [errors, setErrors] = useState({});//             
    if(admin) return <Navigate to='/dashboard/index'/>   //
    const handleForm =  (e) => {e.preventDefault()
        let loginData = {username:e.target.username.value.trim(),password:e.target.password.value.trim()}
            let validationErrors =validateAdminLogin(loginData)
            if(Object.keys(validationErrors).length){ setErrors(validationErrors);return}
     handleLogin(loginData);}/*       let res=await fetch(urlLogin,
            {
                method:'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({username:e.target[0].value,password:e.target[1].value})
                     
                })
            })
            let data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Login failed');
                //return;
            }
            login(data.token)
            navigate('/dashboard')
        }catch(err){toast.error(err);
    }*/
    //alert(`${errors.username},${errors.password}`)
    return <div style={{width:'100%',height:'100vh',background:backPrimary,color:textPrimary/*,position:'relative'*/}}>
        <CenterCard /*style={{}}*/>
            <form /*validated={!(Object.keys(errors).length)}*/ onSubmit={handleForm}>
                <div  >
                    <InputField type='text' placeholder='username' name='username'/>
                    <ErrorText >{errors?.username}</ErrorText>
                </div><GapV x='2'/>
                <div  >
                    {/*<InputGroup>*/}
                    <div style={{position:'relative',width:'100%'}}><InputField type={show?'text':'password'} name='password' placeholder='Password'/><span style={{color:textPrimary,position:'absolute',top:'20%',right:'1%',zIndex:10}} onClick={e=>setShow(prev=>!prev)}>{show?<FaEyeSlash/>:<FaEye/>}</span> 
                    </div>
                        {/*<InputGroup.Text onClick={e=>setShow(!show)}>{show?<FaEyeSlash/>:<FaEye/>}</InputGroup.Text>
                    </InputGroup>*/}
                    <ErrorText >{errors?.password}</ErrorText>
                </div><GapV x='4'/>
                {loginError&&admin.role=='admin' && <span style={{color:'red'}} onClick={e=>sendRecoveryEmail('password')}>Forgot Password?</span>}
                <FlexH x='center' y='center'><ThemeButton type='submit'  disabled={loading}>{loading?<Spinner />:'LOGIN'}</ThemeButton></FlexH>
            </form>
        </CenterCard>
        {/*loading && <Loader><Spinner  ></Spinner></Loader>*/}
    </div>
}
