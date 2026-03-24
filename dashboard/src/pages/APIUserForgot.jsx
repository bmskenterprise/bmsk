import React,{useEffect,useState} from 'react';
import {toast} from 'react-toastify';
import {useTheme} from '../contexts/ThemeContext';
import {CenterCard,FlexH,GapV,ThemeButton,InputField,Spinner} from '../components/styles/Admin.style';
import url from '../config/url';

export default () =>{
  const {themeData,modeData} = useTheme();
  const [loading,setLoading] = useState(false);
  const [OTPMatched,setOTPMatched] = useState({});
  
  useEffect(()=>{sendRecoveryOTPEmail()},[])
  const sendRecoveryOTPEmail = async() =>{
    setLoading(true)
    try{
      let res = await fetch(url.urlUserRecovery);
      let data = await res.json();
      if(!res.ok) throw new Error(data.error)
    }catch(e) {toast.error(e.message)}
    finally{setLoading(false)}
  }
  
  const checkRecoveryOTP = async (e) =>{
    e.preventDefault()
    setLoading(true)
    try{
      let res = await fetch(url.urlUserRecovery);
      let data = await res.json();
      if(!res.ok) throw new Error(data.error)
      setOTPMatched({otp:data.otp,matched:data.matched})
    }catch(err) {toast.error(err.message)}
    finally{setLoading(false)}
  }
  
  const resetPassword = async(e) =>{
    e.preventDefault()
    setLoading(true)
    try{
      let res = await fetch(url.urlUserRecovery,
        {
          method:'PATCH',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({username,password:e.target[0],otp:OTPMatched.otp})
        }
      );
      let data = await res.json();
      if(!res.ok) throw new Error(data.error)
    }catch(err) {toast.error(err.message)}
    finally{setLoading(false)}
  }
  
  return <div>
    <h5 style={{margin:'auto'}}>password recovary link sent to your email</h5>
    <CenterCard>{OTPMatched?<form onSubmit={checkRecoveryOTP}>
      <InputField   type='text' placeholder='Enter Recovery OTP'/><GapV x='1'/>
      <FlexH x='flex-end' y='center'><ThemeButton  type='submit' disabled={loading}>{loading?<Spinner  size='1'/>:'SEND'}</ThemeButton></FlexH>
    </form>:<form onSubmit={resetPassword}>
      <InputField   type='text' placeholder='Enter New Password'/><GapV x='1'/>
      <FlexH x='flex-end' y='center'><ThemeButton  type='submit' disabled={loading}>{loading?<Spinner  size='1'/>:'RESET'}</ThemeButton></FlexH>
    </form>}
    </CenterCard>
  </div>
}