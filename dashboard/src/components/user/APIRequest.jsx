import React,{useState} from 'react'
import {Row,Col,Form,Button} from 'react-bootstrap'
import {FaCopy} from 'react-icons/fa'
import copyToClipboard from '../../utils/copyToClipboard'
import {useUserAuth} from '../../contexts/UserAuthContext'
import {FlexH,IconButton} from '../../components/styles/Admin.style'

export default ({requests,apiType})=>{
  const [errors,setErrors] = useState({})
  const {apiRequest} = useUserAuth()
  
  const handleSubmit = (e) => {
    e.preventDefault()
    let requestedDomain=e.target.domain.value.trim()
    if(!requestedDomain) return setErrors({domain:'Domain is required'})
    else if(requests.some(({domain}) => domain==requestedDomain)){return setErrors({domain:'Domain already exists'})}
    apiRequest(requestedDomain,apiType)
  }
  
  return <Row>
      <Col xs={12} md={6}>
        <div><span style={{marginRight:'1rem'}}>tannimtelecom.shop/api/drive</span><IconButton onClick={e=>copyToClipboard('tannimtelecom.shop/api/drive')}><FaCopy/></IconButton></div>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Control type='url' name='domain' placeholder='Domain'></Form.Control>
            <Form.Control.Feedback type='invalid'>{errors.domain && errors.domain}</Form.Control.Feedback>
          </Form.Group>
          <Button type='submit'>Request</Button>
        </Form>
      </Col>
      <Col xs={12} md={6}>
        {requests.map(({updatedAt,domain,key},i)=> <FlexH x='space-between' y='center' key={i}>
          <span>{updatedAt}</span>
          <span>{domain}</span>
          {key&&<><span onClick={e=>copyToClipboard(key)}>{key}</span>
          <button onClick={e=>apiRequest(domain,apiType)}>Request New Key</button></>}
        </FlexH>)}
      </Col>
    </Row>
}