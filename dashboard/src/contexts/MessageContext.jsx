import {createContext,useContext,useEffect,useState} from 'react';
import {toast} from 'react-toastify';
import url from '../config/url';
import {useAdminAuth} from '../contexts/AdminAuthContext'//     const [msgId,setMsgId]=useState(null);

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
        const [loading,setLoading] = useState(false);
        const {appData} = useAdminAuth();
        const [notices, setNotices] = useState([]/*appData?.notices*//*{receipant:'notification',subject:'',message:''}*/);
        const recipient = [];
        const medium = []
        useEffect(()=>{fetchNotices()},[])
        
        const fetchNotices =async () => {
            setLoading(true)
            try {
                let res = await fetch(url.urlNotice,{credentials:'include'})//'/api/notification')
                let data = await res.json()
                if(!res.ok) throw new Error(data.error|| 'failed to fetch')
                setNotices(data)
            }catch(err){toast.error(err.message)}
            finally{setLoading(false);}
        }
        
        const addNotice = async (noticeData,pin)=>{
            setLoading(true)
            try{
                let res= await fetch(url.urlNotice, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {'Content-Type':'application/json;charset=utf-8','x-admin-pin':pin},
                    body: JSON.stringify(noticeData)/*{notice: e.target[0].value}*/
                })
                let data = await res.json();//setEditInit('')})
                if(!res.ok) throw new Error(data.error|| 'failed to add notice')
                setNotices(data.notices)
                toast.success(data.message)
            }catch(err){toast.error(err.message)}
            finally{setLoading(false)}    
        };
        const editNotice = async ({id,noticeData},pin) =>{
            setLoading(true)
            try{
                let res= await fetch(`${url.urlNotice}/${id}`,
                    {
                        method:'PATCH',
                        credentials:'include',
                        headers:{'Content-Type':'application/json;charset=utf-8','x-admin-pin':pin},
                        body:JSON.stringify(noticeData)
                    }
                );
                let data=await res.json()
                if(!res.ok) throw new Error(data.error||'failed to edit notice')
                toast.success(data.message);setNotices(data.notices);
            }catch(err) {toast.error(err.message)}
            finally {setLoading(false)}
        }    
        const sendNotice =async ({recipient,medium,msgId,duration,repeat}) => {
            //const form = e.currentTarget;
            /*if (form.checkValidity() === false) {
                e.preventDefault();
                e.stopPropagation();return
            }*/
            if(!msgId) return toast.info('select a message')
            setLoading(true);
            try {
                let res = await fetch(url.urlSendNotice/*'/api/notification'*/, {
                        method: 'POST',
                        headers: {'Content-Type':'application/json'},
                        body: JSON.stringify({recipient,medium,msgId,duration,repeat})
                })
                let data = await res.json()
                if(!res.ok) throw new Error(data.error|| 'failed to send notice')
                toast.success('send successfully')
            }catch(err){toast.error(err.message)}
            finally{setLoading(false);}
        };
        const toggleNoticeStatus = async (id,status) =>{
            try{
                let res = await fetch(`${url.urlToggleNotice}/${id}`,
                    {
                        method:'PATCH',
                        credentials:'include',
                        headers:{'Content-Type':'application/json'},
                        body:JSON.stringify({status})
                    }
                );
                let data = await res.json();
                if(!res.ok) throw new Error(data.error||'failed to toggle')
                toast.success(data.message); setNotices(data.notices);
            }catch(err) {toast.error(err.message)}
        }
        const deleteNotice = async ids=>{
            try {
                let res = await fetch(`${url.urlNotice}`,{method:'DELETE',credentials:'include',body:JSON.stringify(ids)});
                let data = await res.json();
                if(!res.ok){throw new Error(data.error||'failed to delete')}
                toast.success('Notice Deleted')
                setNotices(data.notices);
            }catch(err) {toast.error(err.message)}
            finally{setLoading(false)}
        }
            /*else{
                fetch(urlNotice, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({notice: e.target[0].value})
                })
                .then(res=>res.json())
                .then(data=> data)
                .catch(err=>console.error(err))
                .finally(()=>setLoading(false))
            }*/

  return <MessageContext.Provider value={{notices,addNotice,editNotice,toggleNoticeStatus,deleteNotice,sendNotice,loading}}>{children}</MessageContext.Provider>;
  }

export const useMessage = () => useContext(MessageContext);