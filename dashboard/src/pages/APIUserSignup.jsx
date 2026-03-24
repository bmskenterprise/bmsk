import React,{useState} from 'react'
import {CenterCard,Loader} from '../components/styles/Admin.style'
import {Form,Button,Spinner} from 'react-bootstrap'
import {useTheme} from '../contexts/ThemeContext'
import {useUserAuth} from '../contexts/UserAuthContext'
import {validateAPIUser} from '../utils/validate'

export default ()=>{
    const {modeData:{backPrimary}} = useTheme()
    const {signup,loading} = useUserAuth()
    const [errors,setErrors] = useState({})
  
    const handleSubmit = (e) => {
      e.preventDefault()
      let data = {username:e.target.username.value.trim(), email:e.target.email.value.trim(), password:e.target.password.value.trim()}
      let validationErrors = validateAPIUser(data)
      if(Object.keys(validationErrors).length) return setErrors(validationErrors)
      signup(data)
    }
  
    return <div style={{background:backPrimary,position:'relative'}}>
        <CenterCard style={{}}>
            <Form onSubmit={handleSubmit}>
                <Form.Group>
                  <Form.Control type='tel' placeholder='username' />
                  <Form.Feedback type="invalid">{errors.username&&errors.username}</Form.Feedback>
                </Form.Group>
                <Form.Group>
                  <Form.Control type='email' placeholder='email' />
                  <Form.Feedback type="invalid">{errors.email&&errors.email}</Form.Feedback>
                </Form.Group>
                <Form.Group>
                  <Form.Control type='password' placeholder='password' />
                  <Form.Feedback type="invalid">{errors.password&&errors.password}</Form.Feedback>
                </Form.Group>
                <Button type='submit'>SIGNUP</Button>
            </Form>
        </CenterCard>
        {loading && <Loader><Spinner animation="border" role="status"></Spinner></Loader>}
    </div>
}