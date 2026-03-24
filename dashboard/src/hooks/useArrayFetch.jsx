import {useEffect,useState} from 'react';
import {toast} from 'react-toastify';

export default (url) =>{
  const [data,setData] = useState([])
  const [loading,setLoading] = useState(false)
  
  useEffect(()=>{fetchData()}, [url])
  
  const fetchData = async () =>{
    try{
      let res = await fetch(url,{credentials:'include'});
      let data = await res.json()
      if(!res.ok) throw new Error(data.error)
      setData(data)
    }catch(e) {toast.error(e.message)}
    finally {setLoading(false)}
  }
  
  return {data,loading}
}