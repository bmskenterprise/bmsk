import  { createContext, useContext, useEffect, useState } from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import {validateAdminLogin,validateAdminAdd,validateAdminEdit, validatePassword,validatePIN,validateAdminAuthPIN} from '../utils/validate';
import url from '../config/url'
//import { changePassword, changePIN } from '../../../server/controllers/admin.controller';

const AdminAuthContext = createContext(/*{
  token: null,
  admin: null,
  appData: null,
  login: () => {},
  handleLogin: () => {},
  logout: () => {},
  authentic: false,loading:false,changePassword:()=>{},changePIN:()=>{}
}*/);

export const AdminAuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const [admin,setAdmin] = useState(null);
  const [admins, setAdmins] = useState([] );
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(false) 
  const [loginError,setLoginError] = useState(false)   
  const [errors,setErrors] = useState({})

  useEffect(() => {
    //fetchSuperAdmin();
      //fetchAdminData()
  }, []);
    const fetchAdminData = async () =>{
        try{
          const res = await fetch(url.urlAdminAuth, {credentials:'include',headers:{Accept:'application/json','Content-Type':'application/json'}});
          const data = await res.json();
          if(!res.ok) throw new Error(data.error||'Failed to fetch access')
          setAdmin(data.admin)
          setAppData(data.appData);
          //navigate('/dashboard')
        }catch(e){toast.error(e.message);navigate('/login') }
    }      /*const fetchSuperAdmin= async ()=>{
            try{
                let res = await fetch(url.urlAdmin,{credentials:'include'})
                let data = await res.json();
                if (!res.ok) throw new Error(data.message || 'failed to fetch access');
                setAdmin(data)
            }catch(e) {toast.error(e.message)}
            finally{setLoading(false)}
        }*/
    const fetchAdmins = async ()=>{
      setLoading(true);
      try {
        const res = await fetch(url.urlAdmin, {credentials: 'include',});
          let data = await res.json();
        if(!res.ok) throw new Error('Failed to fetch admin');
          setAdmins(data);
      }catch(e) {toast.error(e.message)}
      finally {setLoading(false);}
    };
    /*const login = token =>{
    setToken(token);
    localStorage.setItem("token", JSON.stringify(token));
    //const fakeUser = { username: credentials.username, token: "fake-jwt-token" };
  };*/
    const handleLogin = async (loginData) => {
        const validationErrors = validateAdminLogin(loginData)
        setErrors(validationErrors)
        if(Object.keys(validationErrors).length>0) return
      setLoading(true);
      try{
          let res=await fetch(url.urlAdminLogin,
          {
            method:'POST',
            credentials: 'include',
            headers: {'Content-Type':'application/json', 'x-user-agent':navigator.userAgent},  
            body: JSON.stringify(loginData)
          })
          let data = await res.json();
          if(res.status===400) return setLoginError(true);
          if(!res.ok) {throw new Error(data.error || 'Login failed');}
          toast.success(data.message);
          fetchAdminData()
      }catch(e){toast.error( e.message);}
      finally{setLoading(false);}
    }
    const logout = async () =>{
        try{
            let res=await fetch(url.urlLogout, {method:'POST',credentials:'include'});
            let data=await res.json()
            if(!res.ok) throw new Error(data.error || 'failed to logout');
            setAdmin(null);
            navigate('/login')
        }catch(e) {toast.error(e.message)}
    };
    
    const changeSuperAdminPassword = async (formData) => {
        /*const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,16}$/;*/
        /*if (!(e.target[0].value.trim())) validationErrors.oldCredential = 'Old password is required';
        else if(!(passwordRegex.test(e.target[0].value.trim()))) validationErrors.oldCredential = 'Old password is invalid';

        if (!(e.target[1].value.trim())) validationErrors.newCredential = 'New password is required';
        else if(!(passwordRegex.test(e.target[1].value.trim()))) validationErrors.newCredential = 'new password is invalid';*/
        /*let formData = {oldPassword:e.target[0].value.trim(), newPassword:e.target[1].value.trim()}//   */

        const validationErrors = validatePassword(formData);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length>0) return 
          setLoading(true)
        try {
            setLoading(true)
            let res = await fetch(url.urlChangeSuperAdminPassword,{
                method:'PATCH',
                credentials: 'include',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({oldPassword:formData.oldPassword,password:formData.password})
            });
            let data=await res.json()
            if(res.status==400) {setErrors(data.error);return}
            if(!res.ok){throw new Error(data.error || 'failed');}
            toast.success('successfully changed');
            setLoading(false)
        }catch(e) {toast.error(e.message);}  
        finally{setLoading(false)}
    }
    
    const changeSuperAdminPIN = async (formData) => {
        /*const pinRegex = /^\d{4,6}$/;
        let formData={oldPIN:e.target[0].value.trim(),newPIN:e.target[1].value.trim()}*/
        const validationErrors = validatePIN(formData);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length>0) return 
      setLoading(true)
        try {
            setLoading(true)
            let res = await fetch(url.urlChangeSuperAdminPIN,{
                method:'PATCH',
                credentials: 'include',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({oldPIN:formData.oldPIN,pin:formData.pin})
            });
            let data=await res.json()
            if(res.status==400) {setErrors(data.error);return}
            if(!res.ok){throw new Error(data.error || 'failed');}
            toast.success('successfully changed');
        }catch(e) {toast.error(e.message);}
        finally{setLoading(false)}
    }

    
    const resetAdminPassword = async ({id,password,confirm},pinSuperAdmin)=>{
            const validationErrors = validatePassword({password,confirm});
        setErrors(validationErrors)
        const authError = validateAdminAuthPIN(pinSuperAdmin)
        if(Object.keys(authError).length>0) {toast.error(authError.adminPin);return}
        if (Object.keys(validationErrors).length>0) return 
        setLoading(true)
        try{
            let res = await fetch(`${url.urlResetSubAdminPassword}/${id}`,{method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json','x-admin-pin':pinSuperAdmin},body:JSON.stringify({password})})
            let data = await res.json()
            if(res.status==400) {setErrors(data.error);return}
            if(!res.ok) throw new Error(data.error|| 'failed')
            toast.success(data.message)
        }catch(e){toast.error(e.message)}
        finally{setLoading(false)}
    }

    const resetAdminPIN = async ({id,pin,confirm},pinSuperAdmin)=>{
        const validationErrors = validatePIN({pin,confirm});
        setErrors(validationErrors)
        const authError = validateAdminAuthPIN(pinSuperAdmin)
        if(Object.keys(authError).length>0) {toast.error(authError.adminPin);return}
        if(Object.keys(validationErrors).length>0) return
        try{
            let res = await fetch(`${url.urlResetSubAdminPIN}/${id}`,{method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json','x-admin-pin':pinSuperAdmin},body:JSON.stringify(pin)}) 
            let data = await res.json() 
            if(res.status==400) {setErrors(data.error);return}
            if(!res.ok) throw new Error(data.error|| 'failed to reset');
            toast.success(data.message)
        }catch(e){toast.error(e.message)}
    }
    
    const resetSuperAdminPassword = async(formData) =>{
      const validationErrors = validatePassword(formData)
      setErrors(validationErrors)
          if(Object.keys(validationErrors).length>0) return 
          setLoading(true)
      try{
        let res= await fetch(url.urlResetSuperAdminPassword,{
          method:'PATCH',
          headers: {'Content-Type':'application/json'},
          body:JSON.stringify(formData)
        });
        let data= await res.json();
        if(res.status==400) {setErrors(data.error);return}
        if(!res.ok) throw new Error(data.error||'failed to reset')
        toast.success(data.message)
      }catch(e) {toast.error(e.message)}
      finally{setLoading(false)}
    }
    
    const resetSuperAdminPIN = async(formData) =>{
      const validationErrors = validatePIN(formData)
      setErrors(validationErrors)
          if(Object.keys(validationErrors).length>0) return 
          setLoading(true)
      try{
        let res= await fetch(url.urlResetSuperAdminPIN,{
          method:'PATCH',
          headers: {'Content-Type':'application/json'},
          body:JSON.stringify(formData)
        });
        let data= await res.json();
        if(res.status==400) {setErrors(data.error);return}
        if(!res.ok) throw new Error(data.error||'failed to reset')
        toast.success(data.message)
      }catch(e) {toast.error(e.message)}
      finally{setLoading(false)}
    }
    const addSubAdmin = async ({formData,accesses,cancelForm},pin)=>{
      let validationErrors = validateAdminAdd(formData)
      let authError = validateAdminAuthPIN(pin);
      if(Object.keys(validationErrors).length>0) {setErrors(validationErrors);return}
      if(Object.keys(authError).length>0) {/*setErrors(authError)*/toast.error(authError.adminPin||'invalid admin pin');return}
      setLoading(true);
      try{
        let res = await fetch(url.urlAdmin,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-admin-pin':pin.toString()},body:JSON.stringify({...formData,accesses})});
        let data = await res.json();
        if(res.status==400) setErrors(data.error)
        if(!res.ok) throw new Error(data.error||'failed to add subadmin');
        toast.success(data.message);cancelForm()
        setAdmins(data.admins);
      }catch(e) {toast.error(e.message)}
      finally{setLoading(false)}
    }
    const editSubAdmin = async ({admin:{id,username},formData,handleFormCancel},pin) => {
      let validationErrors = validateAdminEdit(username,formData)
      let authError = validateAdminAuthPIN(pin)
      if(Object.keys(validationErrors).length>0) {setErrors(validationErrors);return}
      if(Object.keys(authError).length>0) {/*setErrors(prev=>({...prev,authError}));*/toast.error(authError.adminPin||'invalid admin pin');return}
      setLoading(true);
      try {
        let res = await fetch(`${url.urlAdmin}/${id}`, {
          method: 'PATCH',
          headers: {'Content-Type':'application/json','x-admin-pin':pin.toString()},
          body: JSON.stringify()
        });
        let data = await res.json();
        if(res.status==400) setErrors(data.error)
        if(!res.ok){throw new Error(data.error || 'failed to edit subadmin');}
        toast.success(data.message);
        setAdmins(data.admins);handleFormCancel()
      }catch(e) {toast.error(e.message);}
      finally{setLoading(false)}
    }
    const editSubAdminAccess = async ({id,editedAccesses,cancelForm},pin) => {
      let authError = validateAdminAuthPIN(pin)
      if(Object.keys(authError).length>0) {toast.error(authError.adminPin||'invalid admin pin');return}
      setLoading(true);
      try {
        let res = await fetch(`${url.urlAdminAccess}/${id}`, {
          method: 'PATCH',credentials:'include',
          headers: {'Content-Type':'application/json','x-admin-pin':pin.toString()},
          body: JSON.stringify({accesses:editedAccesses})
        });
        let data = await res.json();
        if(!res.ok){throw new Error(data.error || 'failed to edit access');}
        toast.success(data.message);cancelForm()
      }catch(e) {toast.error(e.message);}
      finally{setLoading(false)}
    }
    const toggleSubAdminStatus = async (id,e) =>{
        setLoading(true)
        try{
            let res=await fetch(`${url.urlAdminStatus}/${id}`,{method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:e})})
            let data = await res.json();
            if(!res.ok) throw new Error(data.error)
            toast.success(data.message)
            setAdmins(data.admins)
        }catch(e){toast.error(e.message)}
        finally{setLoading(false)}
    }
        const sendRecoveryEmail = async(credential) =>{
        setLoading(true)
            try{
                let res =await fetch(`${url.urlRecoveryEmail}/${credential}`,{credentials:'include'});
                let data =await res.json();
                if(!res.ok) throw new Error(data.error||'failed to send')
                toast.success('recovery email sent')
            }catch(e) {toast.error(e.message)}
            finally{setLoading(false)}
        }


    return (
    <AdminAuthContext.Provider value={{appData, admin, handleLogin,loginError, errors,logout, authentic:!!admin,admins,fetchAdminData,changeSuperAdminPassword,changeSuperAdminPIN, resetAdminPassword,resetAdminPIN,resetSuperAdminPassword,resetSuperAdminPIN,sendRecoveryEmail,fetchAdmins,addSubAdmin,editSubAdmin,editSubAdminAccess,toggleSubAdminStatus, loading}}>{children}</AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
