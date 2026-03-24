import React,{ useEffect,useState } from 'react';
import { MdOutlineMenu,MdClose,MdLightMode,MdDarkMode,MdOutlineLogout } from "react-icons/md";
//import { 
import {useUserAuth} from '../../contexts/UserAuthContext';
import { useTheme  } from "../../contexts/ThemeContext";
import {FlexH,Header,IconButton,Avatar} from '../../components/styles/Admin.style';
import Sidebar from './Sidebar';
import ProfileCard from '../dashboard/AdminProfile';

export default  ({children}) =>{
    const [sidebarToggler, setSidebarToggler] = useState(true);
    const {user,authentic,fetchUserData} = useUserAuth();const [errors, setErrors] = useState({});
    const [userProfileCard, setUserProfileCard] = useState(false);
    //const {logout} = useAuth()
    const {modeData:{backPrimary,textPrimary}} = useTheme()
    
                 
    
    useEffect(()=>{if(!authentic) fetchUserData()},[])           
    return <FlexH x='flex-start' y='flex-start' style={{width:'100vw',height:'100vh'}}>
      {/* <Row>
      <Col xs={3}>
      </Col> */}
      {sidebarToggler && <Sidebar sidebarToggler={sidebarToggler} />}
      <div style={{width:sidebarToggler?'80vw':'100vw',height:'100%'/*,paddingLeft:'2rem'*/}}>
        <Header  >
          <div  >
            <IconButton onClick={e=>setSidebarToggler(!sidebarToggler)}>{sidebarToggler?<MdClose style={{color:textPrimary,fontSize:'2rem'}}/>:<MdOutlineMenu style={{color:textPrimary,fontSize:'2rem'}}/>}</IconButton>
          </div>
          <div>
            {/* <span onClick={e=>{setDark(!dark)}}>{dark?<MdLightMode />:<MdDarkMode />}</span> */}
            <Avatar src={user?.avatar} onClick={e=>setUserProfileCard(!userProfileCard)} />
          {userProfileCard && <ProfileCard ></ProfileCard>}
          </div>

        </Header>

        <div style={{background:backPrimary,color:textPrimary,height:'calc(100vh-4rem)', padding:'2rem'}}>
      {children}
        </div>
      </div>
      {/* </Row>            */}
      {/*credential.type &&  */}
    </FlexH>
}