import {useState,useEffect } from 'react';
import {useNavigate,Link} from 'react-router-dom';
//import {Container,Row,Col,} from 'react-bootstrap';
import {format} from 'date-fns';
import {FaBrave} from 'react-icons/fa6'
import {IoLogoAndroid} from 'react-icons/io'
import {FaApple,FaChrome,FaEdge,FaFirefoxBrowser,FaLinux,FaLock,FaOpera,FaSafari,FaWindows,FaEye,FaEyeSlash} from 'react-icons/fa'
import {MdEdit,MdAdminPanelSettings,MdPassword} from 'react-icons/md';
//import {useSocket} from "../../contexts/SocketContext";
import {useTheme} from '../../contexts/ThemeContext';
import {useAdminAuth} from '../../contexts/AdminAuthContext';
import {ScrollViewV,ScrollViewH,FlexH,Col,GapV,GapH,StripedList,ThemeButton,IconButton,InputField,ErrorText,Loader,Spinner} from '../../components/styles/Admin.style';
import {adminAccess} from '../../../Preferences';
import dminPIN from '../../components/AdminPIN';
import SwitchItem from '../../components/Switch';

export default  () =>{
    //const init = {id:null,username:'admin'/*,accesses:[]*/};
    const navigate = useNavigate();
    const systemIcon = {
      android: <IoLogoAndroid/>,
      brave: <FaBrave/>,
      chrome: <FaChrome/>,
      edge: <FaEdge/>,
      firefox: <FaFirefoxBrowser/>,
      ios: <FaApple/>,
      linux: <FaLinux/>,
      opera: <FaOpera/>,
      safari: <FaSafari/>,
      windows: <FaWindows/>,
    }
    const {thememode,modeData:{textPrimary}} = useTheme()
    const [editedAccesses,setEditedAccesses] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [addInit, setAddInit] = useState(false);
    //const [editedData, setEditedData] = useState(null);
    const [editAccess, setEditAccess] = useState(false);
    const [adminData, setAdminData] = useState({});
    const [authError, setAuthError] = useState(null);
    const [show, setShow] = useState(false);
    const [deviceRequest, setDeviceRequest] = useState({socketId:'',device:''})
    const {admin,admins,toggleSubAdminStatus,fetchAdmins,addSubAdmin,editSubAdmin,editSubAdminAccess,sendRecoveryEmail,errors,loading} = useAdminAuth()     

    useEffect(()=> {fetchAdmins();},[])
    /*useEffect(e =>{
        const handlePopState = e =>{
            window.history.pushState(null, '', window.location.href);
            if(editedData||editAccess){
                window.history.pushState(null, '', window.location.href);
                setEditAccess(false);setEditedData(null)
            }
        }
        window.addEventListener('popstate',handlePopState)
        return () => window.removeEventListener('popstate',handlePopState)
    }, [editAccess,editedData])*/
    /*useEffect(()=>{socket.on('device-request',(data)=>{setDeviceRequest(data)});return},[socket])*/
    
    //const allowDevice = ()=> socket.emit('allow-device',deviceRequest.socketId)
    /*const allowDevice =async () =>{
        setLoading(true)
        try{            
            let res = await fetch(`${url.urlDevices}/${deviceRequest.socketId}/allow`,{
                method: 'POST',
                credentials: 'include',
            })      
            let data = await res.json()
            if(!res.ok) throw new Error(data.error || 'failed to allow device')
            toast.success('device allowed')
        }catch(err) {toast.error(err.message)}
        finally{setLoading(false)}
    }*/
    /*const fetchAdmins = async () => {
        setLoading(true)
        try {
            let res = await fetch(url.urlAdmin,{credentials:'include'});
                let data = await res.json()
                if (!res.ok) {throw new Error(data.error || 'failed to fetch admins');}
                setAdmins(data)
        }catch(err) {toast.error()}
        finally{setLoading(false)}
    }*/

    /*const addAdmin = async (e) => {
        const form = e.target;
        form.preventDefault();
        const addData = {username:form['username'].value.trim(), password:form['password'].value, pin:form['pin'].value, adminPin:form['adminPin'].value};
        let validationErrors=validateAdminLogin(addData)
        if(Object.keys(validationErrors).length>0) setErrors(validationErrors)
        setLoading(true);
        try {
            let res = await fetch(url.urlAdmin, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {'Content-Type':'application/json','x-admin-pin':form['adminPin'].value.trim()},
                    body: JSON.stringify(addData)
            })
            let data = await res.json();
            //if (!res.ok) {
                if (data.message === 'admin pin is incorrect') {validationErrors.adminPIN= 'admin pin is incorrect';}
                if (data.message === 'username is already taken') {validationErrors.pin= 'username is already taken';}
                throw new Error(data.error || 'failed to add admin');
            }//
            if(res.status==401) {setAuthError(data.error);}
            if(!res.ok) throw new Error(data.error||'failed to add admin');
            toast.success('added successfully')
            setAddInit(false);
        }catch(err) {toast.error(err.message);}// (err) {toast.error(err.message);}
        finally {setLoading(false);}
    }*/

    /*const editAdmin = async (e) => {
        const form = e.target;
        form.preventDefault();
        const editData = {username:form['username'].value.trim(), password:form['password'].value, pin:form['pin'].value, adminPIN:form['adminPin'].value.trim()}     //}
        //let validationErrors=validateAdminLogin(editData)
        //if(Object.keys(validationErrors).length>0) {setErrors(validationErrors);return}
        setLoading(true);
        try {
            let res = await fetch(`${url.urlManageAdmin}/${editInit.id}`, {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {'Content-Type':'application/json','x-admin-pin':form['adminPin'].adminPIN},
                    body: JSON.stringify(editData)
            })
            let data = await res.json();
            if (!res.ok) {throw new Error(data.error || 'failed to edit admin');}
            toast.success('edited successfully')
            setAddInit(false);
        }catch(err) {toast.error(err.message);}
        finally {setLoading(false);}
    }*/
    /*const handleChange = (e) =>{
        if(e.target.checked) setEditedAccesses(prev=>[...prev,e.target.value])
        else setEditedAccesses(prev=>prev.filter(access=>access!==e.target.value))
    }*/
    //const handleForm = (e) =>{
        //e.preventDefault()
        //let formData ={username:e.target.username.value.trim(),password:e.target.password.value.trim(),pin:e.target.pin.value.trim()/*,adminPIN:e.target['admin-pin'].value.trim()*/}
        //if(!editedData?.id && editAccess) {adminPIN(thememode,{cb:addSubAdmin,data:{formData,accesses:editedAccesses,cancelForm}},'ADD');return}
        //if(editAccess) {adminPIN(thememode,{cb:editSubAdminAccess,data:{id:editedData?.id,editedAccesses,cancelForm}},'EDIT');setEditAccess(false);return}
        //if(editedData?.id) {adminPIN(thememode,{cb:editSubAdmin,data:{admin:{id:editedData?.id,username:editedData?.username},formData,cancelForm}},'EDIT');return}
        //cancelForm()
    //}

    //const formInit = (admin,accesses) =>{
        //setOpenForm(true);
        //setEditedData(admin/*{id,username,accesses,accesses}*/)
        //setEditedAccesses(accesses)
    //}
    //const cancelForm = e =>{setEditAccess(false);setOpenForm(false);setEditedData(null)}

                           
                           
                           
                           
                           
    return <div style={{width:'100%',height:'100%',position:'relative'}}>
        <h4>Admins</h4><GapV x='5'/>
              <><FlexH x='flex-end'><ThemeButton onClick={e=>{navigate('add',{state:{admin:{id:null,username:'admin'},accesses:adminAccess}})}}>Add Admin</ThemeButton></FlexH> <GapV x='3'/>
                <ScrollViewV style={{width:'100%',height:'80%'}}><ScrollViewH style={{width:'100%'}}>
                    {admins.map(({_id,username,email,phone,nid,device,loginStatus,status,accesses} ) => <StripedList key={_id} style={{width:'70rem'}}>
                        <div style={{width:'25%',fontSize:'1.2rem'}}>{username}&nbsp;{loginStatus&&<svg height='8' width='8' xmlns='http://www.w3.org/2000/svg'><circle r='4' cx='4' cy='4' fill='lightgreen'/></svg>}</div>
                        <div style={{color:textPrimary,width:'50%'/*,fontSize:'2rem'*/}}>{systemIcon[device[0].toLowerCase()]} {systemIcon[device[1].toLowerCase()]}</div>
                        {/*<div style={{width:'20%'}}>{format(loginAt,'dd/MM/yyyy hh:mm aa')}</div>*/}
                        <FlexH x='flex-end' style={{width:'25%'}}>
                            <SwitchItem check={status} handleChange={e=>toggleSubAdminStatus(_id,e.target.checked)}/><GapH x='1'/>
                            <IconButton onClick={e=>{navigate('edit',{state:{admin:{id:_id,username},adminData:{phone,email,nid},accesses:[]}})}}><MdEdit/></IconButton><GapH x='1'/>
                            <IconButton onClick={e=>{navigate('edit',{state:{admin:{id:_id,username},adminData:null,accesses}})}} ><MdAdminPanelSettings/></IconButton><IconButton onClick={e=>navigate('reset-credential',{state:{id:_id,username,credentialType:'password'}})}><MdPassword/></IconButton><GapH x='1'/>
                            <IconButton onClick={e=>navigate('reset-credential',{state:{id:_id,username,credentialType:'pin'}})}><FaLock/></IconButton> 
                        </FlexH>
                    </StripedList>)}
                </ScrollViewH></ScrollViewV></>
            
            
            {/*editInit.admin && <Form onSubmit={editAdmin}>
                <FlexV x='flex-start'>
                    <label>username</label>
                    <Form.Control value={editInit.admin}></Form.Control>
                    <Form.Control.Feedback type='invalid'>{errors.username && errors.username}</Form.Control.Feedback>
                </FlexV x='flex-start'>
                <FlexV x='flex-start'>
                    <label>Status</label>
                    <SwitchItem type='switch' checked={editInit.activeStatus}/>
                </FlexV x='flex-start'>
                <FlexH><Button onClick={e=>setEditInit(init)}>CANCEL</Button><Button type='submit'>SAVE</Button></FlexH>
                </Form>
            */}
        {loading && <Loader><Spinner/></Loader>}  
    </div>
}
