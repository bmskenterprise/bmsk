import {toast} from 'react-toastify';
                  
export const fetchArray = async (url) =>{
    const [data,setData] = useState([])
    try{
        let res = await fetch(url, {credentials:'include'}); let arr = await res.json()
        if(!res.ok) throw new Error(arr.error||'Failed to Fetch')
         setData(arr)
    }catch(e) {toast.error(e.message)}
             return {data}
}   
 export const addData = async (url,formData,successMsg,errMsg) =>{
    try{
      let res = await fetch(url,{
        method:'POST',
        credentials:'include',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(formData)
      });
      let data = await res.json()
      if(!res.ok) throw new Error(data.error||errMsg)
      toaast.success(data.message||successMsg)
    }catch(e) {toast.error(e.message)}
  }
  
  //return {data,loading}
//}

export const editData = async (url,formData,successMsg,errMsg) =>{
    try{
      const res = await fetch(url,{
        method:'PATCH',
        credentials:'include',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(formData)
      });
      const data = await res.json()
      if(!res.ok) {throw new Error(data.error||errMsg)}
      toast.success(data.message||successMsg)
    }catch(e) {toast.error(e.message)}
}

export const deleteData = async (url,formData,successMsg,errMsg) =>{
  try{
      const res = await fetch(url,{
        method:'DELETE',
        credentials:'include'
      });
      const data = await res.json()
      if(!res.ok) {throw new Error(data.error||errMsg)}
      toast.success(data.message||successMsg)
    }catch(e) {toast.error(e.message)}
}
