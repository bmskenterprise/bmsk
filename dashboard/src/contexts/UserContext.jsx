import {createContext,useContext,useEffect,useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import {validateUser,validatePassword,validatePIN} from '../utils/validate';
import {useNotification} from '../contexts/NotificationContext';
import url from '../config/url';

const UserContext = createContext();

export const UserProvider = ({children}) =>{
    const [searchParams] = useSearchParams() 
    const {pendingCounts:{users}} = useNotification();
    const [status,user,fromDate,toDate,limit,page] = [searchParams.get('status')||users>0?'not-verified':'verified',searchParams.get('user')||'',searchParams.get('fromDate')||'',searchParams.get('toDate')||'',searchParams.get('limit')||'20',searchParams.get('page')||'1']  ;
         
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
    const editUserAccess = async ({id,accesses},adminPIN) =>{
        setLoading(true)
        try{
            let res = await fetch(`${url.urlManageUserAccess}/${id}`,{
                method: 'PATCH',
                credentials: 'include',
                headers: {'Content-Type':'application/json','x-admin-pin':adminPIN},
                body: JSON.stringify(accesses)
            });
            let data = await res.json();
            if(!res.ok) throw new Error(data.error||'failed to edit user access')
            toast.success(data.message||'user access edited')
        }catch(e) {toast.error(e.message)}
        finally{setLoading(false)}
    }
    
    const resetUserPassword = async ({id,password,confirm},adminPIN) => {
        //e.preventDefault();
        const validationErrors = validatePassword({password,confirm});
        if(Object.keys(validationErrors).length>0) {setErrors(validationErrors);return}  //
        setLoading(true);
        try {
            let res = await fetch(`${url.urlResetUserPassword}/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {'Content-Type':'application/json','x-admin-pin':adminPIN},
                body: JSON.stringify({password})
            });
            let data = await res.json();
            if(res.status==401) {setAuthError(data.error);}
            if(!res.ok){throw new Error(data.error || 'failed to change password');}
            toast.success(data.message);
        }catch(err) {toast.error(err.message);}
        finally{setLoading(false)}
    }
    
    const resetUserPIN = async ({id,pin,confirm,adminPIN}) =>{
        const validationErrors = validatePIN({pin,confirm});
        if (Object.keys(validationErrors).length) {return setErrors(validationErrors);}
        setLoading(true);
        try {
            let res = await fetch(`${url.urlResetUserPIN}/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {'Content-Type':'application/json','x-admin-pin':adminPIN},
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
    
  return <UserContext.Provider value={{userData,fetchUsers,initFilterData,addUser,editUserAccess,resetUserPassword,resetUserPIN,toggleVerification,deleteUser,deleteUserDevice,toggleUserDeviceAccess,authError,errors,loading}}>{children}</UserContext.Provider>;
}
export const useUser = () => useContext(UserContext);
