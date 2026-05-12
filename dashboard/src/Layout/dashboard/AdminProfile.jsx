import {useRef,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import { FaChevronLeft,FaChevronRight } from 'react-icons/fa6';
import { MdOutlineLogout, } from 'react-icons/md';
import Swal from 'sweetalert2'
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {useTheme} from '../../contexts/ThemeContext';
import { ScrollViewH,FlexH,GapV,GapH,ProfileCard,SecondaryButton,ThemeUnit,IconButton } from '../../components/styles/Admin.style';
import {themeColors} from '../../../Preferences.json';
import getComplementaryColor from '../../utils/complementaryColor';
import SwitchItem from '../../components/Switch';

export default  () =>{
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const {toggleTheme,thememode,toggleMode,modeData:{backSecondary,textPrimary},themeData:{themeBackground}} = useTheme();
    const {admin,logout} = useAdminAuth();
    const [adminProfileCard,setAdminProfileCard] = useState(false);
    const scrollRight=e=>scrollRef.current.scrollTo({left:480,top:0,behavior:'smooth'})//let mode = localStorage.getItem('mode');
    const scrollLeft=e=>scrollRef.current.scrollTo({left:0,top:0,behavior:'smooth'})//let theme = localStorage.getItem('theme');
    
       
    const confirm = e =>{
        Swal.fire({
            title: 'Want to logout?',
            background: backSecondary,
            confirmButtonText: 'LOGOUT',
            showCancelButton: true,
            confirmButtonColor: themeBackground
        }).then(result=>{if(result.isConfirmed) logout()})
    }
    
                                        
    return <ProfileCard >
            <ScrollViewH ref={scrollRef}  style={{width:'100%',height:'100%'}}>
                <FlexH x='flex-start' y='flex-start' style={{width:'200%',height:'100%'}}>
                    <div /*x='flex-start'y='space-between'*/ style={{/*display:'flex',flexFlow:'column nowrap',*/width:'50%',height:'100%'}}>
                        {admin.role=='admin' && <FlexH x='space-around' y='center'>
                        <SecondaryButton onClick={e=>{setAdminProfileCard(false);navigate('/dashboard/change-password',{state:{type:'password'}});}}>Change password</SecondaryButton><GapH x='2'/>
                        <SecondaryButton onClick={e=>{setAdminProfileCard(false);navigate('/dashboard/change-pin',{state:{type:'pin'}});}}>Change pin</SecondaryButton>
                        </FlexH>}<GapV x='4'/>
                        <FlexH x='space-between' y='center' style={{cursor:'pointer',width:'100%',fontSize:'1.3rem'}} onClick={scrollRight}>Theme & Mode<FaChevronRight/></FlexH><GapV x='4'/>
                        <FlexH x='space-between' y='center' style={{color:'red',cursor:'pointer',width:'100%',fontSize:'1.3rem'}} onClick={confirm}><span>  Logout  </span><MdOutlineLogout /></FlexH>
                    </div>
                    <div /*x='flex-start'y='space-between'*/ style={{width:'50%',height:'100%' }}>
                        <IconButton  onClick={scrollLeft}><FaChevronLeft/></IconButton>
                        <div /*style={{marginTop:'3rem'}}*/>
                            <h5> Theme</h5>
                            <FlexH x='flex-start' y='center'>
                                {themeColors.map((c,i)=> {
                                    let themeSet = (typeof c)=='object'? c: {themeBackground:c, themeText:getComplementaryColor(c)};
                                    return <ThemeUnit key={i} color={c} onClick={e=>toggleTheme(themeSet)}/>
                                })}
                            </FlexH>
                        </div>
                        <div /*style={{marginTop:'3rem'}}*/>
                            <h5> Mode</h5>
                            <FlexH x='flex-start' y='center' style={{background:backSecondary, color:textPrimary}}>
                                <SwitchItem check={thememode=='dark'} label='Dark' n='mode' v='dark' identity='dark' handleChange={e=>toggleMode(e.target.checked)}/> <GapV x='2'/>
                                {/*<div><SwitchItem check={thememode=='light'} label='Light' n='mode' v='light' identity='light' handleChange={e=>toggleMode(e.target.value)}/> </div>*/}
                            </FlexH>
                        </div>
                    </div>
                </FlexH>
            </ScrollViewH>
        </ProfileCard>
}
