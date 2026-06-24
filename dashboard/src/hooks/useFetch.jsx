import {useEffect,useState} from 'react'
import {toast} from 'react-toastify'
   export const fetchObject = async (url) =>{
    const [data,setData] = useState({})
    try{
        let res = await fetch(url, {credentials:'include'});let obj = await res.json()
                      
                  if(!res.ok) throw new Error(obj.error || 'failed');
                  //if(data.length)cache[status]=data;
                  setData(obj/*.filter(d=>d.status==statusRef.current.value)*/);
              }catch(e) {toast.error(e.message);}// (err) {  }
      
  return {data}
}
  

                      
                       
                  
export const fetchArray = async (url) =>{
    const [data,setData] = useState([])
    try{
        let res = await fetch(url, {credentials:'include'}); let arr = await res.json()
        if(!res.ok) throw new Error(arr.error||'Failed to Fetch')
         setData(arr)
    }catch(e) {toast.error(e.message)}
             return {data}
}
