import {useEffect,useState} from 'react'
//import {Container,Row,Col,} from 'react-bootstrap';
import {serviceTypes} from '../../Preferences.json';
import {FaEye,FaEyeSlash} from 'react-icons/fa';
import {ScrollViewV,FlexH,Col,GapV,ThemeButton,Select,InputField,ErrorText,Loader,Spinner } from '../components/styles/Admin.style'
import {useAdminAuth} from '../contexts/AdminAuthContext';
import {useTheme} from '../contexts/ThemeContext';
import {useUser} from '../contexts/UserContext';
import url from '../config/url';
import AdminPIN from './AdminPIN';
import SwitchItem from '../components/Switch'
    
export default ({user,handleCancel}) =>{
    const {thememode,themeData:{themeBackground}, modeData} = useTheme()
    const {admin,appData,sendRecoveryEmail} = useAdminAuth()
    const [loading,setLoading] = useState(false)
    const {addUser,editUserAccess,authError,errors,loading} = useUser()
    const [show,setShow] = useState(false)
    //let [services,accesses] = [[],['deposit','topup','drive','regular','bill','bank']]
    //const [serviceTypes,setServiceTypes]=useState([])
    const [accesses,setAccesses] = useState([])
    const {backPrimary,textPrimary} = modeData  //  
    /*useEffect(()=>{fetchGrantedServices()},[])
    const fetchGrantedServices = async () =>{
        setLoading(true)
        try{
            let res = await fetch(url.urlServices,{credentials:'include'});
            let data = await res.json();
            if(!res.ok) throw new Error(data.error)
            setServiceTypes(data);setAccesses(data)
        }catch(e) {toast.error(e.message)}
        finally{setLoading(false)}
    }*/
    
    let /*accesses*/handleSubmit = e=>{
        e.preventDefault();
        //Array.from(document.getElementsByName('service')).forEach((el)=>{if(el.checked){services.push(el.value)}})
        //Array.from(document.getElementsByName('access')).forEach((el)=>{if(el.checked)accesses.push(el.value)})  
        let formData ={level:e.target.level?.value,username:e.target.username?.value.trim(),phone:e.target.phone?.value.trim(),email:e.target.email?.value.trim(),nid:e.target.nid?.value.trim(),password:e.target.password?.value.trim(),pin:e.target.pin?.value.trim(),fullname:e.target.fullname?.value.trim()}
        user.id ? AdminPIN([thememode,themeBackground],{cb:editUserAccess,data:{id:user.id,accesses}},'EDIT') : AdminPIN([thememode,themeBackground],{cb:addUser,data:{formData,accesses}},'ADD')
    };
    
        const handleChange = (e/*checked,value*/)=> {
            if(e.target.checked) setAccesses(prev=>[...prev,e.target.value])
            else setAccesses(prev=>prev.filter(el=>el!==e.target.value))
                /*let index = setAccesses.indexOf(value);
                services.splice(index,1)
            }*/
        }
    
                           
                           
                           
                           
                          
                          
                          
                         
                           
                          
                          
                           
    return <div style={{width:'100%',height:'100%',position:'relative',fontSize:'1.2rem',background:backPrimary}}>
        <h4 style={{marginBottom:'2rem'}}> {user.username}</h4>
         <ScrollViewV style={{width:'100%',height:'80%'}}><form onSubmit={handleSubmit/*e=>{e.preventDefault();addUser()}*/}>
                 
                {!user.id&&<Col /*xs={12} md={4} lg={4} xl={3}*/>
                    <div>
                        <Select /*isInvalid={!!errors?.level}*/name='level'>
                            <option value=''>Select User Levels</option>{appData?.userLevels.map(({name},i)=><option key={i} value={name}>{name}</option>)}
                            {/*<option value="distributor">Distributor</option>
                            <option value="sr">SR</option>
                            <option value="retailer">Retailer</option>*/}
                        </Select>
                        <ErrorText>{errors?.level}</ErrorText>
                    </div><GapV x='3'/>
                    <div /*x="flex-start" y='flex-start'*/>
                        <InputField name='username' placeholder='Username'/>
                        <ErrorText>{errors?.username}</ErrorText>
                    </div><GapV x='3'/>
                    <div>
                        <InputField name='phone' placeholder='Mobile Number'/>
                        <ErrorText>{errors?.phone}</ErrorText>
                    </div><GapV x='3'/>
                    <div /*x='flex-start' y='flex-start'*/>
                        <InputField name='fullname' placeholder='Fullname'/>
                        <ErrorText>{errors?.fullname}</ErrorText>
                    </div><GapV x='3'/>
                    <div>
                        <InputField name='email' placeholder='Email'/>
                        <ErrorText>{errors?.email}</ErrorText>
                    </div><GapV x='3'/>
                    <div /*x='flex-start' y='flex-start'*/>
                        {/*<label htmlFor="nid">NID Number</label>*/}
                        <InputField name='nid' placeholder='NID Number'/>
                        <ErrorText>{errors?.nid}</ErrorText>
                    </div><GapV x='3'/>
                    <div /*x='flex-start' y='flex-start'*/>
                        {/*<label htmlFor="password">password</label>*/}
                        <div style={{position:'relative',width:'100%'}}>
                        <InputField type={show?'text':'password'} name='password' placeholder='password'/><span style={{color:textPrimary,position:'absolute',top:'10%',right:'0%',zIndex:10}} onClick={e=>setShow(prev=>!prev)}>{show?<FaEyeSlash/>:<FaEye/>}</span></div>
                        <ErrorText>{errors?.password}</ErrorText>
                        {/*<div className="input-group-text" id="toggle-icon"><i className="fas fa-eye"></i><i className="fas fa-eye-slash"></i></div>*/}
                    </div><GapV x='3'/>
                    <div /*x='flex-start' y='flex-start'*/>
                        {/*<label htmlFor="pin">PIN</label>*/}
                        <InputField name='pin' placeholder='pin'/>
                        <ErrorText>{errors?.pin}</ErrorText>
                    </div><GapV x='4'/>
                    {/*<FlexV x="flex-start" y='flex-start'>
                        <label htmlFor="admin-pin">Admin PIN</label>
                        <InputField   name="admin-pin" placeholder='admin-pin'/>
                        <ErrorText >{errors.adminPIN && errors.adminPIN}</ErrorText>
                    </FlexV>*/}<GapV x='4'/>
                    {/*authError&&admin.role=='admin'&&<FlexH><span style={{color:'cyan'}} onClick={sendRecoveryEmail}>Forgot PIN?</span></FlexH>*/}
            </Col>}{/*<Col xs={12} md={6}><UserAccess services={services} handleChange={handleChange}/></Col>*/}
        <Col /*xs={12} md={{span:6, offset:2}} lg={{span:4, offset:2}} xl={{span:3, offset:3}}*/><div>
                        {/*<h4>Reseller permission</h4>*/}
                        {serviceTypes.map((service,i)=> <FlexH x='flex-start' style={{marginBottom:'2rem'}} key={i}>
                            <SwitchItem v={service} check={accesses.includes(service)} identity={service} label={service} handleChange={handleChange} /> 
                        </FlexH>)}
                    </div>
                    {/*<div>
                        <h4>Reseller Access</h4>
                        {accessTypes.map((access,i)=> <div style={{marginBottom:'1rem'}} key={i}>
                            <input type="checkbox" checked={true} name="access" id={access} /><label htmlFor={access}>{access}</label>
                        </div>)}
                    </div>*/}
            </Col>
        
        <FlexH x='flex-end' y='center'><button onClick={handleCancel}>CANCEL</button><ThemeButton type='submit' style={{marginLeft:'2rem'}} disabled={loading}>{loading?<Spinner size='1'/>:'NEXT'}</ThemeButton></FlexH>
        {/*loading&&<Loader><Spinner /></Loader>*/}
            </form></ScrollViewV>
    </div>
}
