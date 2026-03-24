import {useEffect,useState,useRef,memo} from 'react'
import {NavLink,useLocation} from 'react-router-dom';
import {useMediaQuery} from 'react-responsive';
import {BsChevronUp,BsChevronRight} from 'react-icons/bs';
//import logo from '../../assets/logo.svg';
import bell from '../../assets/audio/notification-sound-349341.mp3';
import {useAdminAuth} from '../../contexts/AdminAuthContext';
import {ScrollViewV,InlineBadge,SidebarContainer,Rotate} from '../../components/styles/Admin.style';
import {useTheme} from '../../contexts/ThemeContext';
import {useNotification} from '../../contexts/NotificationContext';
import navs from './Navs'

const Sidebar = ({handleSidebarToggle}) =>{
    const location = useLocation();
    const bellRef = useRef(null);
    const isMobile = useMediaQuery({maxWidth:768});
    const [currentNavIndex,setCurrentNavIndex] = useState(-1);
    const [nesting,setNesting] = useState(false) 
    const {admin}= useAdminAuth();
    let accesses = admin?.accesses
    const {pendingCounts:{drive,bank,bill,user},failedCounts:{deposit,topup,regular},isPending} = useNotification();
    const activeLink= ({isActive})=> isActive?'active':''
    useEffect(()=>{
        if(isPending){bellRef.current.click();}
    },[isPending])
    
    const handleNavClick = (i) =>{
        if(isMobile) handleSidebarToggle()   //
        if(currentNavIndex==i) setNesting(prev=>!prev)
        setCurrentNavIndex(i);
    }
    
    return <SidebarContainer /*sidebarToggler={sidebarToggler}*/  >
        <div style={{height:'4rem'}}>{/*<img src={logo} className=" " style={{width:'auto',height:'3rem'}}/>*/}<button ref={bellRef} onClick={e=>{(new Audio(bell)).play()}} hidden></button></div>
        <ScrollViewV style={{height:'calc(100vh - 4rem)'}}>
        <ul className='sidebar'>
            {/*<li><NavLink to='/dashboard' className={activeLink}>Dashboard</NavLink></li>
            {accesses?.includes('drive-request') && <li><NavLink to='/dashboard/drive' className={activeLink}>Drive {drive>0&& <InlineBadge >{drive}</InlineBadge>}</NavLink></li>}
            {accesses?.includes('bill-request') && <li><NavLink to='/dashboard/utility-bill' className={activeLink}>Bill {bill>0&& <InlineBadge >{bill}</InlineBadge>}</NavLink></li>}
            {accesses?.includes('bank-request') && <li><NavLink to='/dashboard/bank' className={activeLink}>Bank {bank>0&& <InlineBadge >{bank}</InlineBadge>}</NavLink></li>}
            {accesses?.includes('deposit-history') && <li><NavLink to='/dashboard/deposit/history' className={activeLink}>Deposit {deposit>0&& <InlineBadge >{deposit}</InlineBadge>}</NavLink></li>}
            {accesses?.includes('deposit-init')&& <li><NavLink to='/dashboard/deposit-init' className={activeLink}>TxnId</NavLink></li>}
            {accesses?.includes('topup-history') && <li><NavLink to='/dashboard/topup/history' className={activeLink}>Topup {topup>0&& <InlineBadge >{topup}</InlineBadge>}</NavLink></li>}
            accesses.includes('regular-history') && <li><NavLink to='/dashboard/regular' className={activeLink}>Regular {regular>0&& <InlineBadge >{regular}</InlineBadge>}</NavLink></li>
            {accesses?.includes('manage-drive') && <li><NavLink to='/dashboard/manage-package/drive' className={activeLink}>Manage Drive</NavLink></li>}
            {accesses?.includes('manage-regular') && <li><NavLink to='/dashboard/manage-package/regular' className={activeLink}>Manage Regular</NavLink></li>}
            {accesses?.includes('manage-user') && <li><NavLink to='/dashboard/manage-user' className={activeLink}>Users {user>0&& <InlineBadge >{user}</InlineBadge>}</NavLink></li>}
            {accesses?.includes('manage-admin') && <li><NavLink to='/dashboard/manage-admins' className={activeLink}>Admins </NavLink></li>}
            {accesses?.includes('deposit-setup') && <li><NavLink to='/dashboard/deposit-setup' className={activeLink}>Manage Deposit</NavLink></li>}
            {accesses?.includes('setup')&& <li><NavLink to='/dashboard/setup'>Setup</NavLink></li>}
            {accesses?.includes('notice') && <li onClick={e=>setExpand(prev=> !prev)}>Notice<Rotate $collapse={expand}><BsChevronRight/></Rotate>
                <ul style={{display:expand?'block':'none'}}>
                    <li><NavLink to='/dashboard/notice/manage' className={activeLink}>Manage</NavLink></li>
                    <li><NavLink to='/dashboard/notice/send' className={activeLink}>Send</NavLink></li>
                </ul>
            </li>}
            {accesses?.includes('manage-api') && <li onClick={e=>setExpand(prev=> !prev)}>API<Rotate $collapse={expand}><BsChevronRight/></Rotate>
                <ul style={{display:expand?'block':'none'}}>
                    <li><NavLink to='/dashboard/api-request' className={activeLink}>Request</NavLink></li>
                    <li><NavLink to='/dashboard/api-setup' className={activeLink}>Setup</NavLink></li>
                </ul>
            </li>}
            {accesses?.includes('feedback') && <li><NavLink to='/dashboard/feedback' className={activeLink}>Feedback </NavLink></li>}*/}
            {/*</ul>
            </li>*/}
            {/*navs.map((nav,i)=> <li key={i} onClick={e=>setExpand(!expand)}>
                {(typeof Dashboard[nav])==='string'? <NavLink to={ path} className={({isActive})=> isActive?'active':''}>{nav}</NavLink>:nav}
                {Array.isArray(Dashboard[nav]) && (expand&&<Rotate expand={expand}> <BsChevronRight/></Rotate>)}
                {Array.isArray(Dashboard[nav]) && <ul className={expand?'':'d-none'}>
                    {Dashboard[nav].map(({text,url},i)=> <li key={i}>
                        <NavLink to={url} className={({isActive})=> isActive?'active-sub':''}>{text}</NavLink>
                    </li>)}
                </ul>}
            </li>)*/}
            {navs().map(({text,path,access},i)=> accesses?.includes(access)&&<li key={i} id={location.pathname.includes(path)?'active':''} onClick={e=>handleNavClick(i)}>{Array.isArray(path)?<NavLink to=''>{text}<Rotate collapse={(Array.isArray(path)&&currentNavIndex==i&&nesting)}><BsChevronRight/></Rotate></NavLink>:<NavLink to={path}>{text}</NavLink>}
                {Array.isArray(path)&&currentNavIndex==i&&nesting&&<ul>{path.map(({text,path},i)=><li key={i} id={location.pathname.includes(path)?'active':''}><NavLink to={path}>{text}</NavLink></li>)}</ul>}
            </li>)}
            {/*<li onClick={()=>{localStorage.removeItem('token');navigate('/login')}}>logout</li>*/}
        </ul></ScrollViewV>
    </SidebarContainer>
}
export default memo(Sidebar);