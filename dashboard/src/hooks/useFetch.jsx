import {useEffect,useState} from 'react'
import {toast} from 'react-toastify'
   export const fetchObject = async (/*{page}*/) =>{
    const [data,setData] = useState({})
    try{
        let res = await fetch(url, {credentials:'include'});let data = await res.json()
                      
                  if(!res.ok) throw new Error(data.error || 'failed');
                  //if(data.length)cache[status]=data;
                  setData(data/*.filter(d=>d.status==statusRef.current.value)*/);
              }catch(e) {toast.error(e.message);}// (err) {  }
      
  return {data}
}
  

                      
                       
                  
export const fetchArray = async (url) =>{
    const [data,setData] = useState([])
    try{
        let res = await fetch(url, {credentials:'include'}); let data = await res.json()
        if(!res.ok) throw new Error(data.error||'Failed to Fetch')
         setData(data)
    }catch(e) {toast.error(e.message)}
             return {data}
}
