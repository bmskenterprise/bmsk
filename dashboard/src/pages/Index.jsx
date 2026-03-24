import React,{useEffect} from 'react';
import {Link} from 'react-router-dom'
import {Button} from 'react-bootstrap'
import {FlexH} from '../components/styles/Admin.style'
import {useUserAuth} from '../contexts/UserAuthContext'

export default ()=>{
    const {authentic} = useUserAuth();
  /*useEffect(()=>{
    socket.on('set:device',(value)=>{
      localStorage.setItem('device',value)
    })
    return ()=> socket.off('set:device')
  })*/
  return <div><FlexH x='flex-end' y='center'>
    {authentic? <Button><Link to='/user/dashboard'>Dashboard</Link></Button> :<div><button><Link to='/user/login'>LOGIN</Link></button><button><Link to='user/signup'>SIGNUP</Link></button></div>}
    </FlexH>
  </div>
}