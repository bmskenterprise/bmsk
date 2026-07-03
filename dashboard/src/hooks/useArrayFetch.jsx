import {useEffect,useState} from 'react'
import {toast} from 'react-toastify'

export default (url) =>{
  const [data,setData] = useState([])
  
  useEffect(()=>{fetchData()},[url])
  
  const fetchData = async () =>{
    try{
      let res = await fetch(url, {credentials:'include'});
      let arr = await res.json()
      if(!res.ok) throw new Error(arr.error||'Failed to Fetch')
      setData(arr)
    }catch(e) {toast.error(e.message)}
  }
   return {data}
}
