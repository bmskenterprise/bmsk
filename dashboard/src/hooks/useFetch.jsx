import {useEffect,useState} from 'react'
import {toast} from 'react-toastify'

export default (url) =>{
    const [data,setData] = useState({})
    const [loading,setLoading] = useState(false)    //
  
    useEffect(()=>{fetchData()}, [url])
    const fetchData = async (/*{page}*/) =>{
        setLoading(true)          
        try {
            let res = await fetch(url,{credentials: 'include'});
                  let data = await res.json();
                  if(!res.ok) throw new Error(data.error || 'failed');
                  //if(data.length)cache[status]=data;
                  setData(data/*.filter(d=>d.status==statusRef.current.value)*/);
              }catch(err) {toast.error(err.message);}// (err) {  }
              finally{setLoading(false);}
      }
  return {data,loading}
}
                      
                      
                  
