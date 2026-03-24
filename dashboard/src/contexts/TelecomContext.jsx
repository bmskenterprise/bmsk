import {createContext,useContext,useEffect,useState} from "react";
import {useParams,useSearchParams} from 'react-router-dom';
import {toast} from 'react-toastify'
import {validateRegularPack,validateDrivePack} from '../utils/validate';
import {useSocket} from './SocketContext'
import url from '../config/url.js'

const TelecomContext = createContext();
export const TelecomProvider = ({children})=>{
    const [searchParams] = useSearchParams();
    let opts = localStorage.getItem('opts')
    let logos = localStorage.getItem('icons')
    let {socket} = useSocket();
    let [telecoms,setTelecoms]=useState(opts?JSON.parse(opts):[]);
    let [icons,setIcons]=useState(logos?JSON.parse(logos):{})
    const [loading,setLoading] = useState(false)
    const [errors,setErrors] = useState({});
    const [regularSummary,setRegularSummary] = useState([])
    const [regularData,setRegularData] = useState({regulars:[],pagination:{currentPage:1,totalPage:1,limit:20},search:''})
    const [driveData,setDriveData] = useState({drives:[],pagination:{currentPage:1,totalPage:1,limit:20},search:''})
    const [driveSummary,setDriveSummary] = useState([])
    const {opt} = useParams()
    let [driveFilter,setDriveFilter]=useState({})
    let [regularFilter,setRegularFilter]=useState({})
         
    const [status,category,search,fromPrice,toPrice,fromDate,toDate,limit,page] = [searchParams.get('status')||'active',searchParams.get('category')||'bundle',searchParams.get('search')||'',searchParams.get('fromPrice')||'',searchParams.get('toPrice')||'',searchParams.get('fromDate')||'',searchParams.get('toDate')||'',searchParams.get('limit')||'20',searchParams.get('page')||'1']  ;
         
         
         
         
         
         
         
    
    
    const fetchTelecoms = async () => {
        if(opts) setTelecoms(JSON.parse(opts))
        if(logos) setIcons(JSON.parse(logos))
        if(opts&&logos) return
        try{
            let res = await fetch(url.urlTelecom,{credentials:'include'})
            let data = await res.json();
            if(!res.ok) throw new Error(data.error);localStorage.setItem('opts',JSON.stringify(data))
            const logos = {};
            for(const element of data) logos[element.name] =element.icon
            localStorage.setItem('icons',JSON.stringify(logos))
            setTelecoms(data); setIcons(logos);
        }catch(err) {toast.error('failed');return null} 
    }
    
    const fetchRegularSummary = async () =>{
        setLoading(true)
        try{
            let res = await fetch(url.urlRegularSummary,{credentials:'include'});
            let data = await res.json();
            if(!res.ok) throw new Error(data.error)
            setRegularSummary(data.map(op=>({icon:icons[op.opt],...op,})))
        }catch(e){toast.error(e.message)}
        finally{setLoading(false)}
    }
    
    const fetchRegulars = async ({opt}) =>{
        setLoading(true)
        try{
            let res = await fetch(`${url.urlRegular}/${opt}?status=${status}&category=${category}&search=${search}&fromDate=${fromDate}&toDate=${toDate}&fromPrice=${fromPrice}&toPrice=${toPrice}&limit=${limit}&page=${page}`,{credentials:'include'});
            let data = await res.json()
            if(!res.ok) throw new Error(data.error)
            setRegularData(data);
        }catch(e) {toast.error(e.message)}
        finally{setLoading(false)}
    }
    
    const fetchRegular = async (id) =>{
        setLoading(true)
        try{
            let res = await fetch(`${url.urlRegular}/${id}`,{credentials:'include'});
            let data = await res.json()
            if(!res.ok) throw new Error(data.error)
            return {id:data._id,title:data.title,price:data.price,commission:data.commission}
        }catch(e) {toast.error(e.message)}
        finally{setLoading(false)}
    }
    
    const addRegularPack= async (formData) =>{
        let validationError=validateRegularPack(formData);
        if(Object.keys(validationError).length) {setErrors(validationError);return}
        console.log(formData)
        setLoading(true);
        try{
            setLoading(true);
            let res = await fetch(url.urlRegular, {
                method: 'POST',credentials:'include',
                headers: {'Content-Type':'application/json;charset=utf-8' },
                body: JSON.stringify({operator:formData.operator.toLowerCase(),title:formData.title, price: parseInt(formData.price),commission:parseInt(formData.commission)})
            })
            let data = await res.json();
            if(res.status==400) {setErrors(data.error);}
            if(!res.ok) throw new Error(data.error || 'Failed to Add Regular Pack');
            toast.success('Regular Pack Added');//handleCancel();
        }catch(err){toast.error(err.message||'Error ')}
        finally{setLoading(false)}
    }
    
    const editRegularPack = async (id,editData) => {
        setLoading(true);
        try {
            let res = await fetch(`${url.urlRegular}/${id}`, {
                method: 'PATCH',
                credentials:'include',
                headers: {'Content-Type':'application/json;charset=utf-8'},
                body: JSON.stringify(editData)
            });
            let data = await res.json();
            if(!res.ok){throw new Error(data.message ||'Failed to Edit Regular Pack');}
            toast.success(data.message);
        }catch(err) {toast.error(err.message);}
        finally{setLoading(false)}
    }
    
    const toggleRegularStatus = async (id) => {
        setLoading(true);
        try {
            let res = await fetch(`${url.urlRegular}/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {'Content-Type':'application/json'},
            });
            let data = await res.json();
            if(!res.ok){throw new Error(data.message ||'Failed to Toggle Regular Status');}
            toast.success(data.message);
        }catch(err) {toast.error(err.message);}
        finally{setLoading(false)}
    }
    
    const deleteRegularPack = async (ids) =>{
        setLoading(true);
        try{
            let res = await fetch(url.urlRegular, {
                method: 'DELETE',
                credentials:'include',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(ids)
            });
            let data = await res.json();
            if(!res.ok){throw new Error(data.message ||'failed to Delete Drive Pack');}
            toast.success(data.message);
        }catch(e) {toast.error(e.message);}
        finally{setLoading(false)}
    }
    
    
    const fetchDriveSummary = async () =>{
        setLoading(true)
        try{
            let res = await fetch(url.urlDriveSummary,{credentials:'include'});
            let data = await res.json();
            if(!res.ok) throw new Error(data.error)
            setDriveSummary(data.map(op=>({icon:icons[op.opt],...op,})))
        }catch(e) {toast.error(e.message)}// null
        finally{setLoading(false)}
    }
         
        
        
                
                
               
            
         
        
    
    
    const fetchDrive = async (id) =>{
        setLoading(true)
        try{
            let res = await fetch(`${url.urlDrive}/${id}`,{credentials:'include'});
            let data = await res.json()
            if(!res.ok) throw new Error(data.error)
            return {id:data._id,title:data.title,price:data.price,commission:data.commission}
        }catch(e) {toast.error(e.message)}
        finally{setLoading(false)}
    }
    
    const addDrivePack= async (formData) =>{
        let validationError=validateDrivePack(formData);
        if(Object.keys(validationError).length) {setErrors(validationError);return}
        console.log(formData)
        setLoading(true);
        try{
            setLoading(true);
            let res = await fetch(url.urlDrive, {
                method: 'POST',credentials:'include',
                headers: {'Content-Type':'application/json;charset=utf-8' },
                body: JSON.stringify({operator:formData.operator.toLowerCase(),title:formData.title, price: parseInt(formData.price),commission:parseInt(formData.commission)})
            })
            let data = await res.json();
            if(res.status==400) {setErrors(data.error);}
            if(!res.ok) throw new Error(data.error ||'Failed to Add Drive Pack');
            toast.success('Drive Pack Added');//handleCancel();
        }catch(err){toast.error(err.message||'Error ')}
        finally{setLoading(false)}
    }
    
    const editDrivePack = async (id,editData) => {
        setLoading(true);
        try {
            let res = await fetch(`${url.urlDrive}/${id}`, {
                method: 'PATCH',
                credentials:'include',
                headers: {'Content-Type':'application/json;charset=utf-8'},
                body: JSON.stringify(editData)
            });
            let data = await res.json();
            if(!res.ok){throw new Error(data.message ||'Failed to Edit Drive Pack');}
            toast.success(data.message);
        }catch(err) {toast.error(err.message);}
        finally{setLoading(false)}
    }
    
    const toggleDriveStatus = async (id) => {
        setLoading(true);
        try {
            let res = await fetch(`${url.urlDrive}/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {'Content-Type':'application/json'},
            });
            let data = await res.json();
            if(!res.ok){throw new Error(data.message ||'Failed to Toggle Drive Status');}
            toast.success(data.message);
        }catch(err) {toast.error(err.message);}
        finally{setLoading(false)}
    }
    
    const deleteDrivePack = async (ids) =>{
        setLoading(true);
        try{
            let res = await fetch(url.urlDrive, {
                method: 'DELETE',
                credentials:'include',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(ids)
            });
            let data = await res.json();
            if(!res.ok){throw new Error(data.message || 'Failed to Delete Drive Pack');}
            toast.success(data.message);
        }catch(e) {toast.error(e.message);}
        finally{setLoading(false)}
    }
    
    useEffect(()=>{
        ///*telecoms = */opts?setTelecoms(JSON.parse(opts)):fetchTelecoms();
        ///*icons = */logos?setIcons(JSON.parse(logos)):fetchTelecoms();
        socket.on('telecoms',data=>{fetchTelecoms();})
        return ()=> socket.off('telecoms')
    },[socket])
    return <TelecomContext.Provider value={{telecoms,icons,fetchTelecoms,fetchRegularSummary,regularSummary,fetchDriveSummary,driveSummary,fetchRegulars,regularData,fetchRegular,addRegularPack,editRegularPack,toggleRegularStatus,deleteRegularPack,driveData,fetchDrive,addDrivePack,editDrivePack,toggleDriveStatus,deleteDrivePack,errors,loading}}>{children}</TelecomContext.Provider>
}
export const useTelecom = () => useContext(TelecomContext);