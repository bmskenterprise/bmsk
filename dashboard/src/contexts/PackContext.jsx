import {useEffect,createContext,useContext,useState,useRef} from "react";
import {useNavigate,useParams,useSearchParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import {validateDrivePack,validateRegularPack} from '../utils/validate';
import {useTelecom} from '../contexts/TelecomContext'
import url from '../config/url';

const PackContext = createContext();

export const PackProvider = ({children}) =>{
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const isFirstRender = useRef(true);
    const [loading,setLoading] = useState(false);
    const [errors,setErrors] = useState({})
    const [driveData, setDriveData] = useState({drives:[],pagination:{currentPage:1,totalPage:1,limit:20},query:''});
    const [regularData, setRegularData] = useState({regulars:[],pagination:{currentPage:1,totalPage:1,limit:20},query:''});
    let [driveSummary,setDriveSummary] = useState([])
    let [regularSummary,setRegularSummary] = useState([])
    let validationErrors
    let {icons} = useTelecom()
    const {opt} = useParams()
    let [driveFilter,setDriveFilter]=useState({})
    let [regularFilter,setRegularFilter]=useState({})
    const status = searchParams.get('status') || 'active';
    const query = searchParams.get('query') || '';
    const fromPrice = searchParams.get('fromPrice') || '';
    const toPrice = searchParams.get('toPrice') || '';
    const fromDate = searchParams.get('fromDate') || '';
    const toDate = searchParams.get('toDate') || '';
    const limit = searchParams.get('limit') || '20';
    const page = searchParams.get('page') || '1';
    /*useEffect(e=>{
        if(isFirstRender.current){
            isFirstRender.current=false
            return
        }
        fetchRegulars()
        
    },[status,query,toPrice,fromPrice,fromDate,toDate,limit,page])*/
    /*useEffect(e=>{
        if(isFirstRender.current){
            isFirstRender.current=false
            return
        }
        fetchDrives();
    },[status,query,toPrice,fromPrice,fromDate,toDate,limit,page])      */      
    let currentOpt
    let currentStatus
   
    const fetchDriveSummary = async () => {
            setLoading(true)
            try {
                let res = await fetch(url.urlDriveSummary,{credentials:'include'})
                let data = await res.json();
                if(!res.ok) throw new Error(data.error || 'failed to fetch drive opts');
                 setDriveSummary(data.summary.map(op=>({icon:icons[op.opt],...op, /*active:packList.length>0*/})))
            }catch(err) {toast.error(err.message)}
            finally{setLoading(false)}
    }
    const initDriveFilter = filter => setDriveFilter(filter)       

        const fetchDrives= async (/*{opt,status,limit,query,page}*/)=>{
            //let driveOpt=opt?opt:currentOpt;currentOpt=driveOpt;
            //let driveStatus=status?status:currentStatus;currentStatus=driveStatus;
            try{
                let res = await fetch(`${url.urlDrive}/${opt}?status=${status}&query=${query}&fromDate=${fromDate}&toDate=${toDate}&fromPrice=${fromPrice}&toPrice=${toPrice}&limit=${limit}&page=${page}`,{credentials:'include'})
                let data = await res.json();
                if (!res.ok) {throw new Error(data.error || 'failed to fetch packs');}
                setDriveData(data);//navigate(`${opt}?status=${status}&query=${query}&limit=${limit}&page=${page}`)//return data
            }catch(err) { toast.error(err.message)}
            finally{setLoading(false)}
        }

    const fetchDrive = async id =>{  //
        setLoading(true)
        try{
            let res = await fetch(`${url.urlDrive}/${id}`,{credentials:'include'})
            let data = await res.json()
            if(!res.ok) throw new Error(data.error)
            return {id:data._id,title:data.title,price:data.price,commission:data.commission}
        }catch(er) {toast.error(er.message)}
        finally{setLoading(false)}
    }
                    
    const addDrivePack= async (formData) =>{
        let validationError=validateDrivePack(formData);
        if(Object.keys(validationError).length) {setErrors(validationError);return}
        console.log(formData)/*if(!formData.title) error.title='required';
        //setPackList([{...formData, id: uuidv4()}, ...packList]);
        if(Object.keys(error).length){setErrors(error);return}*/
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
            if(!res.ok) throw new Error(data.error || 'failed to add pack');
            toast.success('pack Added successfully');//handleCancel();
        }catch(err){toast.error(err.message||'Error adding')}
        finally{/*setInitData({});*/setLoading(false)}
    }
        const toggleDriveStatus = async (ids,status)=>{
            /*const selectedIDs = selectedPacks.filter(pack=>pack.selected).map(pack=>pack.id);
            if(selectedIDs.length>0){*/setLoading(true);
            try{
                let res=await fetch(url.urlDriveStatus,{
                    method:'PATCH',
                    credentials: 'include',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({ids,status})
                })
                let data = await res.json();
                if(!res.ok) throw new Error(data.error || 'failed');
            fetchDrives(/*{page:driveData.pagination.currentPage}*/);return true;
            }catch(err){toast.error(err.message);}
            finally{setLoading(false);}
        };
                //toast.info('select at least one pack');
    
    const editDrivePack = async (id,editData) => {
        validationErrors = validateDrivePack(editData)
        if(Object.keys(validationErrors).length) {setErrors(validationErrors);return}          //   
        setLoading(true);
        try {
            let res = await fetch(`${url.urlDrive}/${id}`, {
                method: 'PATCH',
                credentials:'include',
                headers: {'Content-Type':'application/json;charset=utf-8'},
                body: JSON.stringify(editData)
            });
            let data = await res.json();
            if(res.status==400) {setErrors(data.errors);}
            if(!res.ok){throw new Error(data.error || 'failed to edit drive pack');}
            toast.success(data.message);fetchDrives(/*{page:driveData.pagination.currentPage}*/);
        } catch (err) {toast.error(err.message);}
        finally{setLoading(false)}
    }


    const deleteDrivePack = async ids=>{
        //const selectedIDs = selectedPacks.filter(pack=>pack.selected).map(pack=>pack.id);
        try{
            let res =await fetch(url.urlDrive,{
                method:'DELETE',credentials:'include',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify(ids)
            })
        let data = await res.json()
        if(!res.ok) throw new Error(data.error||'failed to delete') 
        fetchDrives(/*{page:driveData.pagination.currentPage}*/) ; toast.success('Pack Deleted')//:toast.error('Something went wrong');
        }catch(err){toast.error(err.message/*'select at least one pack'*/);return false}
        finally{setLoading(false)}
    };
        const fetchRegular = async id=>{
            setLoading(true);
            try{
                let res = await fetch(`${url.urlRegular}/${id}`,{credentials:'include'})
                let data = await res.json();
                if(!res.ok) throw new Error(data.error)
                return {id:data._id,title:data.title,price:data.price};
            }catch(e) {toast.error(e.message)}
            finally{setLoading(false);}
        }

        const fetchRegularSummary = async () => {
            try {
                let res = await fetch(url.urlRegularSummary,{credentials:'include'})
                let data = await res.json();
                if(!res.ok) throw new Error(data.error || 'failed to fetch opts');
                 setRegularSummary(data.summary.map(op=>({icon:icons[op.opt],...op, /*active:packList.length>0*/})))//setRegularSummary(data.map(opt=>({opt,icon:telecoms[opt], active:packList.length>0})))
            }catch(err) {toast.error(err.message)}// (err) {toast.error(err.message)}
            finally{setLoading(false)}
        }

        const initRegularFilter = filter => setRegularFilter(prev=>({...prev,...filter}))       //throw new Error(data.error || 'failed to fetch packs');
        const fetchRegulars= async ({opt/*,status,limit,query,page*/})=>{console.log(opt,status);
            /*let regularOpt=opt?opt:currentOpt;currentOpt=regularOpt;*/
            //let regularStatus=status?status:currentStatus;currentStatus=regularStatus;
            try{
                let res = await fetch(`${url.urlRegular}/${opt}?status=${status}&query=${query}&fromDate=${fromDate}&toDate=${toDate}&fromPrice=${fromPrice}&toPrice=${toPrice}&limit=${limit}&page=${page}`,{credentials:'include'})
                let data = await res.json();
                if (!res.ok) {throw new Error(data.error || 'failed to fetch packs');}
                setRegularData(data);//navigate(`${regularFilter.opt}?status=${regularFilter.status}&limit=${regularFilter.limit}&query=${regularFilter.query}&page=${page}`);
            }catch(err) { toast.error(err.message)}
            finally{setLoading(false)}
        }

    const addRegularPack= async (formData)=> {
        let validationError=validateRegularPack(formData);
        if(Object.keys(validationError).length) {setErrors(validationError);return}
        console.log(formData)/*if(!formData.title) error.title='required';
        //setPackList([{...formData, id: uuidv4()}, ...packList]);
        if(Object.keys(error).length){setErrors(error);return}*/
        setLoading(true);
        try{
            let res = await fetch(url.urlRegular, {
                method: 'POST',credentials:'include',
                headers: {'Content-Type':'application/json;charset=utf-8' },
                body: JSON.stringify({operator:formData.operator.toLowerCase(),title:formData.title, price: parseInt(formData.price)})
            })
            let data = await res.json();
            if(res.status==400) {setErrors(data.error);}
            if(!res.ok) throw new Error(data.error || 'failed to add pack');
            toast.success('Regular Pack added');fetchRegulars();
        }catch(err){toast.error('Error adding')}
        finally{/*setInitData({});*/setLoading(false)}
    }
    const editRegularPack = async (id,editData) => {
        validationErrors = validateRegularPack(editData)
        if(Object.keys(validationErrors).length) {setErrors(validationErrors);return}     
        //e.preventDefault();
        setLoading(true);
        try {
            let res = await fetch(`${url.urlRegular}/${id}`, {
                method: 'PATCH',
                credentials:'include',
                headers: {'Content-Type':'application/json;charset=utf-8'},
                body: JSON.stringify(editData)
            });
            let data = await res.json();
            if(!res.ok){throw new Error(data.error || 'failed to edit regular pack');}
            if(res.status==400) setErrors(data.errors)
            toast.success(data.message);fetchRegulars(/*{page:regularData.pagination.currentPage}*/);
        }catch(err) {toast.error(err.message)}// (err) {toast.error(err.message);}
        finally{setLoading(false)}
    }
    const toggleRegularStatus = async (ids,status)=>{
        /*const selectedIDs = selectedPacks.filter(pack=>pack.selected).map(pack=>pack.id);
        if(selectedIDs.length>0){*/setLoading(true);
        try{
            let res=await fetch(url.urlRegularStatus,{
                method:'PATCH',
                credentials: 'include',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({ids,status})
            })
            let data = await res.json();
            if(!res.ok) throw new Error(data.error || 'failed');
            toast.success('status updated');
            fetchRegulars(/*{page:regularData.pagination.currentPage}*/);
        
        }catch(err){toast.error(err.message);}
        finally{setLoading(false);}
    };
                 //   
            //toast.info('select at least one pack');


    const deleteRegularPack = async ids=>{
        //const selectedIDs = selectedPacks.filter(pack=>pack.selected).map(pack=>pack.id);
        try{
            let res =await fetch(url.urlRegular,{
                method:'DELETE',credentials:'include',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify(ids)
                    
            })
            let data = await res.json()
            if(!res.ok) throw new Error(data.error||'Failed to Delete');
            toast.success('Regular Pack Deleted');
            fetchRegulars(/*{page:regularData.pagination.currentPage}*/);
        }catch(err) {toast.error(err.message/*'select at least one pack'*/);}
            //toast.info('select at least one pack');
        //}
    };


  return <PackContext.Provider value={{driveData,driveSummary,fetchDriveSummary,fetchDrives,fetchDrive,initDriveFilter,addDrivePack,editDrivePack,toggleDriveStatus,deleteDrivePack,regularData,fetchRegularSummary,regularSummary,fetchRegular,fetchRegulars,initRegularFilter,addRegularPack,editRegularPack,toggleRegularStatus,deleteRegularPack,errors,loading}}>{children}</PackContext.Provider>
}

export const usePack = ()=> useContext(PackContext);