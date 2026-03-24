import React,{useState} from 'react'
//import {toast} from 'react-toastify'
//import url from '../config/url'
//import {FaCopy} from 'react-icons/fa'
import {Row,Col,Form,Button,Spinner} from 'react-bootstrap'
import {FlexH,Loader} from '../components/styles/Admin.style'
import {useUserAuth} from '../contexts/UserAuthContext'
import APIRequest from '../components/user/APIRequest'

export default () => {
  //const [loading,setLoading] = useState(false)
  //const [errors,setErrors] = useState({})
  const {user,loading} = useUserAuth()
  
  return <div>
    <h4>Topup API</h4>
    <APIRequest requests={user.apis.filter(api=>'topup'===api.apiType)} apiType='topup'/>
    {loading && <Loader><Spinner animation='border' role='status'/></Loader>}
  </div>
};