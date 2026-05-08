import {useEffect,useState} from 'react';
import {useLocation,useNavigate,useParams} from 'react-router-dom';
import {Container,Row,Col,Form,Button,/*Spinner,*/Accordion} from 'react-bootstrap';
import {toast} from 'react-toastify'
import {getLocalDateFromUTC} from '../../utils/date';
import {FlexH,GapH,GapV,RejectButton,Loader,Spinner} from '../../components/styles/Admin.style'
import {useTheme} from '../../contexts/ThemeContext'
import {useUser} from '../../contexts/UserContext'
import url from '../../config/url' 
import AdminPIN from '../../components/AdminPIN'

export default  () =>{
    const navigate = useNavigate();
    const {thememode,themeData:{themeBackground}} = useTheme()      //setLoading(true)
    const {id} = useParams();
    const location = useLocation();
    const {toggleUserDeviceAccess,deleteUserDevice,deleteUser} = useUser();
    const [user,setUser] = useState(location.state?.user || null);
    const [loading,setLoading] = useState(false);
    let services = user?.accesses

    useEffect(()=> {
        const fetchUser = async () => {
            setLoading(true)
            try {
                let res = await fetch(`${url.urlManageUser}/${id}`,{credentials:'include'});
                let data = await res.json()
                if(!res.ok) throw new Error(data.error || 'failed to fetch user');
                setUser(data)
                services=data.accesses
            }catch(err) {toast.error(err.message)}
            finally{setLoading(false)}
        }
        !user && fetchUser();
    },[/*id,user*/])
    
    /*const deleteUser = async (data,pin) =>{
        /*e.preventDefault()
        if(JSON.stringify(user.accesses)==JSON.stringify(services)) return toast.success('updated')
        setLoading(true)*/
        /*try{
            let res = await fetch(
                `${url.urlManageUser}/${id}`,
                {
                    method:'DELETE',
                    credentials:'include',
                    headers:{'x-admin-pin':pin},
                    //body:JSON.stringify(services)
                }
            );
            let data = await res.json();
            if(!res.ok) throw new Error(data.error||'failed to delete user');
              toast.success(data.message)
            navigate(-1)
        }catch(err) {toast.error(err.message)}
        finally{setLoading(false)}
    }*/
    const initDelete = (id) => AdminPIN([thememode,themeBackground],{cb:deleteUser,data:null},'DELETE')
    const initDeleteUserDevice = deviceId => AdminPIN([thememode,themeBackground],{cb:deleteUserDevice,data:{id,deviceId}},'DELETE')
    const initToggleDeviceLock = isDeviceLock => AdminPIN([thememode,themeBackground],{cb:toggleUserDeviceAccess,data:{id,isDeviceLock}},'DELETE')
            /*let index = services.indexOf(value)
            services.splice(index,1)
        }
    }*/
    
    return <div>      <GapV x='3'/>
        <FlexH x='space-between'>
                    
     <Col /*xs={12} md={6} style={{minHeight:'80vh'}}*/>
                <div /*x='flex-start' y='space-around' style={{height:'60%'}}*/ ><FlexH x='flex-start' y='flex-end'><h4>{user?.phone}</h4><GapH x='1'/><h5 style={{textTransform:'uppercase'}}>{user?.level}</h5></FlexH><GapV x='3'/>
                    {/*<p>{user?.level}</p><GapV x='2'/>*/}
                        <p>{user?.fullname}</p><GapV x='2'/>
                        <p>{user?.email}</p><GapV x='2'/>
                        <p>{user?.nid}</p><GapV x='2'/>
                        <p>{getLocalDateFromUTC(user?.createdAt??(new Date()).toISOString())}</p><GapV x='2'/>
                        <p>{user?.regFeeRef??'N/A'}</p><GapV x='4.5'/>
                        <div>
                            <IconButton onClick={e=>navigate(`balance/${user?._id}`,{state:{username:user?.username}})}><MdWallet/></IconButton>
                            <IconButton onClick={e=>navigate('reset-credential',{state:{id:user?._id,username:user?.username,credentialType:'password'}})}><MdPassword/></IconButton>
                            <IconButton onClick={e=>navigate('reset-credential',{state:{id:user?._id,username:user?.username,credentialType:'pin'}})}><FaLock/></IconButton>
                            <IconButton variant='danger' onClick={e=>initDelete(_id)}><FaTrash/></Button>
                        </div><GapV x='4.5'/>
                        <SwitchItem label='Device Lock' check={user?.device.lock} identity='lock' handleChange={e=>initToggleDeviceLock(e.target.checked)}/><GapV x='3.5'/>
                        <div>
                            <h5>Devices</h5><GapV x='1'/>
                            <div>{user?.device?.allowed.map(d=> <FlexH x='space-between' y='center' style={{marginTop:'1.5rem'}}><p>{getLocalDateTimeFromUTC((new Date(Number(d)).toISOString()))}</p><IconButton onClick={e=>initDeleteUserDevice(d)} disabled={loading}><FaTrash/></IconButton></FlexH>)}</div>
                        </div>
                    
                    </div><GapV x='5'/>
            </Col>
                <Col /*xs={12} md={6}*/>
            {user?.accesses?.map((a,i)=> <div key={i}>{a}<GapV x='1'/></div>)}
        {/*<Form onSubmit={updateUserAccess}>
            <FlexH x='flex-end' style={{marginTop:'4rem'}}><ThemeButton  type='submit' disabled={loading}>{loading?<Spinner />:'SAVE'}</ThemeButton></FlexH>
        </Form>*/}
                </Col></FlexH>
        
        {loading&&<Loader><Spinner  /></Loader>}
    </div>
}
