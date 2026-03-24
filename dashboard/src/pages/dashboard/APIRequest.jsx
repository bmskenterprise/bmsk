import React,{useEffect,useState,} from 'react';
import {Spinner} from 'react-bootstrap'
import {toast} from 'react-toastify'
import {formatDistanceToNow} from 'date-fns'
import url from '../../config/url';
import {useTheme} from '../../contexts/ThemeContext';
import {FlexH,InputField,Loader} from '../../components/styles/Admin.style'


export default () =>{
  const {themeData,modeData} = useTheme();
  const [loading,setLoading] = useState(false);
  const [APIs,setAPIs]=useState([])
  let filterData
  useEffect(()=>{fetchAPIRequests()},[])
  
  const fetchAPIRequests = async () =>{
    setLoading(true)
    try{
      let res= await fetch(`${url.urlAPIRequest}?status=${filterData.status}&domain=${filterData.domain}&user=${filterData.user}`,{credentials:'include'});
      let data= await res.json()
      if(!res.ok) throw new Error(data.error)
      setAPIs(data)
    }catch(e) {toast.error(e.message)}
    finally{setLoading(false)}
  }
  
  const allowAPI = async (id) =>{
    setLoading(true)
    try{
      let res= await fetch(`${url.urlAPIRequest}/grant/${id}`,{method:'PATCH',credentials:'include'})
      let data= await res.json()
      if(!res.ok) throw new Error(data.error)
      toast.success(data.message)
    }catch(e) {toast.error(e.message)}
    finally{setLoading(false)}
  }
  
  
  const denyAPI = async (id) =>{
    setLoading(true)
    try{
      let res= await fetch(`${url.urlAPIRequest}/deny/${id}`,{method:'PATCH',credentials:'include'})
      let data= await res.json()
      if(!res.ok) throw new Error(data.error)
      toast.success(data.message)
    }catch(e) {toast.error(e.message)}
    finally{setLoading(false)}
  }
  
  const filter=e=>{
    e.preventDefault();
    filterData={status:e.target.status.value,domain:e.target.domain.value,user:e.target.user.value}
    fetchAPIRequests()
  }
  
  return <div>
      <h3 style={{marginBottom:'3rem'}}>Requests</h3>
      <form onSubmit={filter}>
        <FlexH x='space-between' y='center'>
          <InputField x='6'  type="text" placeholder='user' name='user'/><InputField x='6'  type="text" placeholder='domain' name='domain'/>
          <select  name='status'>
            <option value="PENDING">Pending</option>
            <option value="ALLOWED">Allowed</option>
            <option value="DENIED">Denied</option>
          </select>
          <button type='submit'>filter</button>
        </FlexH>
      </form>
      <div><table>
            {/*<tr>{fields.map((f,i)=> <th key={i}>{f}</th>)}</tr>*/}
            <tbody>{APIs.map(({_id,createdAt,user, domain, apiType,status},i)=> <tr key={i}>
                <td>{formatDistanceToNow(createdAt)}</td>
                <td>{user}</td>
                <td>{domain}</td>
                <td>{apiType}</td>
                <td>{['PENDING','DENIED'].includes(status)?<button onClick={e=>allowAPI(_id)}>Allow</button>:<button onClick={e=>denyAPI(_id)}>Deny</button>}</td>
            </tr>)}</tbody>
        </table>
        </div>
        {loading&&<Loader><Spinner animation='border'/></Loader>}
    </div>
}