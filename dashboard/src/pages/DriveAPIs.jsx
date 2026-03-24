import {Row,Col,Form,Button,Spinner} from 'react-bootstrap'
import {FlexH,Loader} from '../components/styles/Admin.style'
import {useUserAuth} from '../contexts/UserAuthContext'
import APIRequest from '../components/user/APIRequest'

export default () => {
  const {user,loading} = useUserAuth()
  
  return <div>
    <h4>Drive API</h4>
    <APIRequest requests={user.apis.filter(api=>'drive'===api.apiType)} apiType='drive'/>
    {loading && <Loader><Spinner animation='border' role='status'/></Loader>}
  </div>
};