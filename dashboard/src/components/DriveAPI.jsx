import React,{useState} from 'react'
import {Row,Col,Form,Button,Spinner} from 'react-bootstrap'
import {FlexH,Loader} from '../components/styles/Admin.style'
//import {Loader} from "../components/styles/Admin.style";
import {toast} from 'react-toastify'
import url from '../config/url'
import {FaCopy} from 'react-icons/fa'
import {useUserAuth} from '../contexts/UserAuthContext'
import APIRequest from '../components/user/APIRequest'

export default () => {
  //const [loading,setLoading] = useState(false)
  //const [errors,setErrors] = useState({})
  const {user,loading} = useUserAuth()
  
  /*const handleSubmit = (e) => {
    e.preventDefault()
    if(!e.target.domain.value) return setErrors({domain:'Domain is required'})
    else if(driveAPIs.some(({domain}) => domain==e.target.domain.value)){return setErrors({domain:'Domain already exists'})}
    apiRequest({email,domain:e.target.domain.value})
  }
  
  const apiRequest = async(requestData) => {
    setLoading(true)
    try{
      let res = await fetch(url.urlAPIRequest,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(requestData)
      })
      let data = await res.json()
      if(!res.ok) throw new Error(data.message|| 'faied to request')
    }catch(err){toast.error(err.message)}
    finally{setLoading(false)}
  }*/
  
  return <div>
    <h4>Drive API</h4>
    <APIRequest requests={user.apis.filter(api=>'drive'===api.apiType)} apiType='drive'/>
    {loading && <Loader><Spinner animation='border' role='status'/></Loader>}
  </div>
};