import {createContext,useContext,useEffect,useState} from 'react';
import {useNavigate} from 'react-router-dom'// 
import {toast} from 'react-toastify'         
import url from '../config/url';

const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(false)
    const [apiUser, setAPIUser] = useState({username:''})
    const [token, setToken] = useState(null) 
    const navigate = useNavigate()
              
    useEffect(() => {
      //fetchUser();
          //fetchUser();
    }, []);
    /*const fetchUser= async ()=>{
      try{
          let res = await fetch(url.urlAPIUser,{method:'GET',credentials:'include'})
          let data = await res.json();
          if (!res.ok) throw new Error(data.message || 'failed to fetch access');
          setUser(data)
      }catch(err) { toast.error(err.message)}
      finally{setLoading(false)}
    }
      const fetchUser = async ()=>{
        try {
          const res = await fetch(url.urlProtected, {method:'GET', credentials:'include',});
          //});
          if (res.ok){
            let data = await res.json();
            setUser(data.user);
          }
        }catch(err) {toast.error(err.message);}  
        finally {setLoading(false);}
                      
      };*/
                  
    const login =  (token) => {
      setToken(token);
      localStorage.setItem("token", JSON.stringify(token));
      //const fakeUser = { username: credentials.username, token: "fake-jwt-token" };
    };
    const handleLogin = async (loginData) => {
      setLoading(true);
      try{
        let res=await fetch(url.urlUserLogin,
        {
            method:'POST',
            /*credentials: "include",*/
            headers: { 'Content-Type':'application/json'}, // ,
            body: JSON.stringify(loginData/*{username:e.target[0].value,password:e.target[1].value}*/)
        })
        let data = await res.json();
        if (!res.ok) {throw new Error(data.error || 'Login failed');}
          // Refetch user data after login
          const protectedRes = await fetch(url.urlAPIUserAuth, {
            headers: {'Authorization':`Bearer ${token}`},
          });
          const protectedData = await protectedRes.json();
          setAPIUser(protectedData.apiUser);
        login(data.token)
        navigate('/user/dashboard')
    }catch(err){toast.error(err.message);}
    finally{setLoading(false);}
  }
        
            
      
  const apiRequest = async(domain,apiType) => {
    setLoading(true)
    try{
      let res = await fetch(url.urlAPIRequest,{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body:JSON.stringify({user:apiUser.username,domain,apiType})
      })
      let data = await res.json()
      if(!res.ok) throw new Error(data.error|| 'faied to request')
    }catch(err){toast.error(err.message)}
    finally{setLoading(false)}
  }
  
  return <UserAuthContext.Provider value={{apiUser,handleLogin,token,authentic:!!token,apiRequest,loading}}>{children}</UserAuthContext.Provider>;
}

export const useUserAuth = () => useContext(UserAuthContext);