import {useEffect,useState} from 'react';
import {Navigate} from 'react-router-dom'
import {toast} from 'react-toastify'
import {MdOutlineMenu,MdClose,MdLightMode,MdDarkMode,MdOutlineLogout} from 'react-icons/md';
import {useMediaQuery} from 'react-responsive'
import {useTheme} from '../../contexts/ThemeContext';
import {useAdminAuth} from '../../contexts/AdminAuthContext';
import {useNotification} from '../../contexts/NotificationContext'
import {useSocket} from '../../contexts/SocketContext'
import {useTelecom} from '../../contexts/TelecomContext';
import {ResponsiveLayout,Header,PageContent,MenuTogglerButton,Avatar,Badge} from '../../components/styles/Admin.style';
import Sidebar from './Sidebar';
import AdminProfile from './AdminProfile';

export default  ({children}) =>{
    const isMobile = useMediaQuery({maxWidth:768});
    const {socket} = useSocket();
    const {pendingCounts,isPending} = useNotification()
    const total = Object.values(pendingCounts || {}).reduce((sum,val)=> sum+val,0)
    const {themeData,modeData:{backPrimary,textPrimary}} = useTheme()
    const {authentic,appData,admin,fetchAdminData,} = useAdminAuth();const [errors, setErrors] = useState({});
    const {fetchTelecoms} = useTelecom()
    const [sidebarToggler, setSidebarToggler] = useState(false);
    const [adminProfileCard, setAdminProfileCard] = useState(false);
    
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
                 
    if(!admin) return <Navigate to='/login'/>
    const handleSidebarToggle = e => setSidebarToggler(prev=> !prev)


    return <div /*x='flex-start' y='flex-start'*/ style={{background:backPrimary,/*color:textPrimary,*/width:'100%',height:'100%'}}>
      {/*<Col xs={3}></Col>*/}
        <Header  >
          <div style={{position:'relative'}}>{total>0&& <Badge>{total}</Badge>}
            <MenuTogglerButton size='2' onClick={handleSidebarToggle}>{sidebarToggler?<MdClose/>:<MdOutlineMenu />}</MenuTogglerButton>
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
        <div style={{width:'100%',height:'calc(100% - 4rem)!important',padding:isMobile?'1rem':'2rem',background:backPrimary,color:textPrimary}}>{children}</div>
      </PageContent>   
       </ResponsiveLayout>            
    </div>
}
