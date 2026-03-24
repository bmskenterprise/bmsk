import { useRef,useState } from 'react';
import {useNavigate} from 'react-router-dom';
import { FaChevronLeft,FaChevronRight } from 'react-icons/fa6';
import { MdOutlineLogout, } from 'react-icons/md';
import { ScrollViewH,FlexH,FlexV,GapH,ProfileCard,PrimaryButton,ThemeUnit,IconButton } from '../../components/styles/Admin.style';
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {useTheme} from '../../contexts/ThemeContext';
import getComplementaryColor from '../../utils/complementaryColor';
import {themeColors} from '../../../Preferences.json';
import SwitchItem from '../../components/Switch';

export default  () =>{
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const scrollRight=e=>scrollRef.current.scrollTo({left:480,top:0,behavior:'smooth'})//let mode = localStorage.getItem('mode');
    const scrollLeft=e=>scrollRef.current.scrollTo({left:0,top:0,behavior:'smooth'})//let theme = localStorage.getItem('theme');
    const {modeData:{backSecondary,textPrimary},toggleTheme,thememode,toggleMode} = useTheme();
       
    const [adminProfileCard,setAdminProfileCard] = useState(false);
    const {admin,logout} = useAdminAuth();
    
                                        
    return <ProfileCard >
            <ScrollViewH ref={scrollRef}  style={{width:'100%',height:'100%'}}>
                <FlexH x='flex-start' y='flex-start' style={{width:'200%',height:'100%'}}>
                    <FlexV x='flex-start'y='space-between' style={{/*display:'flex',flexFlow:'column nowrap',*/width:'50%',height:'100%'}}>
                        {admin.role=='admin' && <FlexH x='space-around' y='center'>
                        <PrimaryButton onClick={e=>{setAdminProfileCard(false);navigate('/dashboard/change-password',{state:{type:'password'}});}}>Change password</PrimaryButton><GapH x='2'/>
                        <PrimaryButton onClick={e=>{setAdminProfileCard(false);navigate('/dashboard/change-pin',{state:{type:'pin'}});}}>Change pin</PrimaryButton>
                        </FlexH>}
                        <FlexH x='space-between' y='center' style={{cursor:'pointer',width:'100%',fontSize:'1.3rem'}} onClick={scrollRight}>Theme & Mode<FaChevronRight/></FlexH>
                        <FlexH x='space-between' y='center' style={{color:'red',cursor:'pointer',width:'100%',fontSize:'1.3rem'}} onClick={logout}><span>  Logout  </span><MdOutlineLogout /></FlexH>
                    </FlexV>
                    <FlexV x='flex-start'y='space-between' style={{width:'50%',height:'100%' }}>
                        <IconButton style={{color:textPrimary}} onClick={scrollLeft}><FaChevronLeft/></IconButton>
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
                                <div><SwitchItem check={thememode=='dark'} label='Dark' n='mode' v='dark' identity='dark' handleChange={e=>toggleMode(e.target.value)}/> </div><GapH x='2'/>
                                <div><SwitchItem check={thememode=='light'} label='Light' n='mode' v='light' identity='light' handleChange={e=>toggleMode(e.target.value)}/> </div>
                            </FlexH>
                        </div>
                    </FlexV>
                </FlexH>
            </ScrollViewH>
        </ProfileCard>
}
