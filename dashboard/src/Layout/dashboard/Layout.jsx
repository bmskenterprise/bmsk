import React,{useEffect,useState} from 'react';
import {toast} from 'react-toastify'
import {MdOutlineMenu,MdClose,MdLightMode,MdDarkMode,MdOutlineLogout} from "react-icons/md";
import {useAdminAuth} from '../../contexts/AdminAuthContext';
import {useSocket} from '../../contexts/SocketContext'
import {useTheme} from "../../contexts/ThemeContext";
import {useTelecom} from '../../contexts/TelecomContext';
import {ResponsiveLayout,Header,PageContent,IconButton,Avatar} from '../../components/styles/Admin.style';
import Sidebar from './Sidebar';
import AdminProfile from './AdminProfile';

export default  ({children}) =>{
    const {socket} = useSocket();
    const [sidebarToggler, setSidebarToggler] = useState(false);
    const {authentic,appData,admin,fetchAdminData,} = useAdminAuth();const [errors, setErrors] = useState({});
    const [adminProfileCard, setAdminProfileCard] = useState(false);
    const {themeData,modeData:{backPrimary,textPrimary}} = useTheme()
    const {fetchTelecoms} = useTelecom()
    
    useEffect(()=>{
        fetchTelecoms()
        socket.emit('admin:join',admin?.id)
    },[socket])
      
    useEffect(()=>{
        if(!authentic) fetchAdminData()
        const handleOnline = () => toast.success('Internet Connected')
        const handleOffline = () => toast.error('Internet Disconnected')
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    },[])
                
                 
      
    const handleSidebarToggle = e => setSidebarToggler(prev=> !prev)


    return <div /*x='flex-start' y='flex-start'*/ style={{background:backPrimary,/*color:textPrimary,*/width:'100%',height:'100%'}}>
      {/*<Col xs={3}></Col>*/}
        <Header  >
          <div  >
            <IconButton size='2' onClick={handleSidebarToggle}>{sidebarToggler?<MdClose/>:<MdOutlineMenu />}</IconButton>
          </div>
          <div>
            {/* <span onClick={e=>{setDark(!dark)}}>{dark?<MdLightMode />:<MdDarkMode />}</span> */}
            <Avatar src={appData?.avatar} onClick={e=>setAdminProfileCard(prev=> !prev)} />
          {adminProfileCard && <AdminProfile />}
          </div>
        </Header>
      <ResponsiveLayout onClick={e=>setAdminProfileCard(false)}>
        {sidebarToggler&&<Sidebar handleSidebarToggle={handleSidebarToggle}/>} 
      <PageContent sidebartoggler={sidebarToggler}/*style={{width:sidebarToggler?'85%':'100%',height:'100%',display:'flex',flexFlow:'column nowrap'}}*/>
        <div style={{width:'100%',height:'calc(100% - 4rem)!important',padding:'2rem',background:backPrimary,color:textPrimary}}>{children}</div>
      </PageContent>   
       </ResponsiveLayout>            
    </div>
}