import {createContext,useContext,useEffect,useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import {validateUser,validateUserBalance,validatePassword,validatePIN,validateAdminAuthPIN} from '../utils/validate';
import {useNotification} from '../contexts/NotificationContext';
import url from '../config/url';

const UserContext = createContext();

export const UserProvider = ({children}) =>{
    const [searchParams] = useSearchParams() 
    const {pendingCounts:{users}} = useNotification();
    const [status,user,fromDate,toDate,limit,page] = [searchParams.get('status')||(users>0?'not-verified':'verified'),searchParams.get('user')||'',searchParams.get('fromDate')||'',searchParams.get('toDate')||'',searchParams.get('limit')||'20',searchParams.get('page')||'1']  ;
         
    //const type = searchParams.get('type') || '';
         
         
         
         
    const [loading,setLoading] = useState(false);
    const [userData,setUserData] = useState({users:[],pagination:{currentPage:1,totalPage:1,limit:20},query:''});
    const [authError,setAuthError] = useState(null)
    const [errors,setErrors] = useState({});
    let [filter,setFilter]= useState(/*{}*/{status,user,fromDate,toDate,limit,page})
    useEffect(()=>{
        //fetchUsers(/*{page:1}*/);/*fetchUserLevels();*/
        setFilter({status,user,fromDate,toDate,limit,page})
    },[status,user,fromDate,toDate,limit,page]);

    
    const fetchUsers = async (/*{page}*/)=>{
            //let form = e.target;
            try{
                setLoading(true);
                let res = await fetch(`${url.urlManageUser}?status=${status.toUpperCase()}&user=${user}&from=${fromDate}&to=${toDate}&limit=${limit}&page=${page}`,
                {credentials: 'include'})
                let data = await res.json()
                if(!res.ok) {throw new Error(data.error ||'user fetching failed');} 
                setUserData(data)
            }catch(err) {toast.error(err.message);}
            finally{setLoading(false);}
        }
    const initFilterData = filterData =>{setFilter(filterData)}
    const addUser = async ({formData,accesses},pin) => {
        let validationErrors = validateUser(formData)
        if(Object.keys(validationErrors).length) {setErrors(validationErrors);return} //
        setLoading(true)    ;console.log({...formData,accesses});
        try {
            let res = await fetch(
                url.urlManageUser,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {'Content-Type':'application/json','x-admin-pin':pin},
                    body: JSON.stringify({...formData,accesses})/*{username:filterData.username}*/
                }
            );
            let data =await res.json();
            //if(res.status==401) {/*setAuthError(data.error);*/toast.error(data.error)}
            if(res.status==400) setErrors(data.error);
            if(!res.ok) {throw new Error(data.error || 'failed to add user');}
            setUserData(data/*[data.user, ...users]*/);toast.success('User added successfully');
        } catch(err) {toast.error(err.message);} 
        finally{setLoading(false)}    
    }
    const editUserAccess = async ({id,accesses},pin) =>{
        const authErrors = validateAdminAuthPIN(pin)
        if(Object.keys(authErrors).length>0) {toast.error(authErrors.adminPin);return}
        setLoading(true)
        try{
            let res = await fetch(`${url.urlManageUserAccess}/${id}`,{
                method: 'PATCH',
                credentials: 'include',
                headers: {'Content-Type':'application/json','x-admin-pin':pin},
                body: JSON.stringify(accesses)
            });
            let data = await res.json();
            if(!res.ok) throw new Error(data.error||'failed to edit user access')
            toast.success(data.message||'user access edited')
        }catch(e) {toast.error(e.message)}
        finally{setLoading(false)}
    }
    
              
    const modifyUserBalance = async ({id,balanceData},pin) => {
        //()=>navigate('/transfer/confirm', {state: {{amount:amountRef.current.value,source:sourceRef.current.value,type:typeRef.current.value}}})
        let validationErrors = validateUserBalance(balanceData);
        let authErrors = validateAdminAuthPIN(pin) //is required'
        if(Object.keys(authErrors).length>0) {toast.error(authErrors.adminPin||'admin pin is required');return}// is required'
        if(Object.keys(validationErrors).length>0) {setErrors(validationErrors);return} //
        setLoading(true);
        try {
            let res = await fetch(
                `${url.urlDeposit}/${actionType}/${id}`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {'Content-Type':'application/json','x-admin-pin':pin},
                    body: JSON.stringify({amount:parseInt(balanceData.amount),balanceType:balanceData.balanceType.toLowerCase(),gateway:balanceData?.gateway?.toLowerCase()})
                }
            )
            let data = await res.json();
            if(res.status==401) toast.error('auth error')
            if(!res.ok) {throw new Error(data.error|| 'deposit failed');}
            toast.success(data.message)
        }catch(e) {toast.error(e.message);}
        finally{setLoading(false);}
    }
    const resetUserPassword = async ({id,password,confirm},pin) => {
        //e.preventDefault();
        let authErrors = validateAdminAuthPIN(pin)
        const validationErrors = validatePassword({password,confirm});
        if(Object.keys(authErrors).length>0) {toast.error(authErrors.adminPin);return}
        if(Object.keys(validationErrors).length>0) {setErrors(validationErrors);return}
        setLoading(true);
        try {
            let res = await fetch(`${url.urlResetUserPassword}/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {'Content-Type':'application/json','x-admin-pin':pin},
                body: JSON.stringify({password})
            });
            let data = await res.json();
            if(res.status==401) {setAuthError(data.error);}
            if(!res.ok){throw new Error(data.error || 'failed to change password');}
            toast.success(data.message);
        }catch(err) {toast.error(err.message);}
        finally{setLoading(false)}
    }
    
    const resetUserPIN = async ({id,pin,confirm,pin}) =>{
        let authErrors = validateAdminAuthPIN(pin)
        const validationErrors = validatePIN({pin,confirm});
        if(Object.keys(authErrors).length>0) {toast.error(authErrors.adminPin);return}
        if(Object.keys(validationErrors).length>0) {setErrors(validationErrors);return}
        setLoading(true);
        try{
            let res = await fetch(`${url.urlResetUserPIN}/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {'Content-Type':'application/json','x-admin-pin':pin},
                body: JSON.stringify({pin})
            });
            let data = await res.json();
            if(res.status==401) {setAuthError(data.error);}
            if(!res.ok){throw new Error(data.error || 'failed to change pin');}
            toast.success(data.message);
        }catch(err) {toast.error(err.message);}
        finally{setLoading(false)}
    }
    const toggleVerification = async ({id,verified},pin) =>{
        let authErrors = validateAdminAuthPIN(pin)
        if(Object.keys(authErrors).length>0) {toast.error(authErrors.adminPin);return}
        setLoading(true)
        try {       
            let res = await fetch(`${url.urlUserVerify}/${id}`,{
                method: 'PATCH',
                credentials: 'include',
                headers: {'Content-Type':'application/json','x-admin-pin':pin},
                body: JSON.stringify({verified})
            });
            let data = await res.json()
            if(!res.ok) {throw new Error(data.error||'failed to verify/unverify user');}
            toast.success(data.message)
        }catch(e) {toast.error(e.message)}
        finally{setLoading(false)}
    }
    
    const deleteUser = async ({id},pin) =>{
        let authErrors = validateAdminAuthPIN(pin)
        if(Object.keys(authErrors).length>0) {toast.error(authErrors.adminPin);return}
        try{
            let res = await fetch(`${url.urlManageUser}/${id}`,
                {
                    method:'DELETE',
                    credentials:'include',
                    headers:{'x-admin-pin':pin}
                }
            );
            let data = await res.json();
            if(!res.ok) throw new Error(data.error||'failed to delete user');
            toast.success(data.message)
        }catch(e) {toast.error(e.message)}
        finally{setLoading(false)}
    }
    const deleteUserDevice = async ({id,deviceId},pin) =>{
        let authErrors = validateAdminAuthPIN(pin)
        if(Object.keys(authErrors).length>0) {toast.error(authErrors.adminPin);return}
        try{
            let res = await fetch(`${url.urlUserDeviceAccess}/${id}`,
                {
                    method:'DELETE',
                    credentials:'include',
                    headers:{'Content-Type':'application/json','x-admin-pin':pin},
                    body:JSON.stringify({deviceId})
                }
            );
            let data = await res.json();
            if(!res.ok) throw new Error(data.error||'failed to delete device');
            toast.success(data.message)
        }catch(e) {toast.error(e.message)}
        finally{setLoading(false)}
    }
    
    const toggleUserDeviceAccess = async ({id,isDeviceLock},pin) =>{
        let authErrors = validateAdminAuthPIN(pin)
        if(Object.keys(authErrors).length>0) {toast.error(authErrors.adminPin);return}
        try{
            let res = await fetch(`${url.urlUserDeviceAccess}/${id}`,
                {
                    method:'PATCH',
                    credentials:'include',
                    headers:{'x-admin-pin':pin},
                    body:JSON.stringify({isDeviceLock})
                }
            );
            let data = await res.json();
            if(!res.ok) throw new Error(data.error||'failed to toggle user device access');
            toast.success(data.message)
        }catch(e) {toast.error(e.message)}
        finally{setLoading(false)}
    }
    
  return <UserContext.Provider value={{userData,fetchUsers,initFilterData,addUser,editUserAccess,modifyUserBalance,resetUserPassword,resetUserPIN,toggleVerification,deleteUser,deleteUserDevice,toggleUserDeviceAccess,authError,errors,loading}}>{children}</UserContext.Provider>;
}
export const useUser = () => useContext(UserContext);
