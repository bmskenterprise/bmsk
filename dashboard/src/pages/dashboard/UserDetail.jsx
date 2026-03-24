import {useEffect,useState} from 'react';
import {useLocation,useNavigate,useParams} from 'react-router-dom';
import {Container,Row,Col,Form,Button,/*Spinner,*/Accordion} from 'react-bootstrap';
import {toast} from 'react-toastify'
import {getLocalDateFromUTC} from '../../utils/date';
import {FlexH,GapH,GapV,RejectButton,Loader,Spinner} from '../../components/styles/Admin.style'
import {useTheme} from '../../contexts/ThemeContext'
import url from '../../config/url' 
import AdminPIN from '../../components/AdminPIN' //let services

export default  () =>{
    const navigate = useNavigate();
    const {thememode} = useTheme()      //setLoading(true)
    const {id} = useParams();
    const location = useLocation();
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
    
    const deleteUser = async (data,pin) =>{
        /*e.preventDefault()
        if(JSON.stringify(user.accesses)==JSON.stringify(services)) return toast.success('updated')
        setLoading(true)*/
        try{
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
    }
    const initDelete = ()=> AdminPIN(thememode,{cb:deleteUser,data:null},'DELETE')
        /*if(checked) services.push(value)
        else{
            let index = services.indexOf(value)
            services.splice(index,1)
        }
    }*/
    
    return <div>      <GapV x='5'/>
        <Container fluid><Row>
                    
     <Col xs={12} md={6} style={{minHeight:'80vh'}}>
                <div x='flex-start' y='space-around' style={{height:'60%'}} ><FlexH x='flex-start' y='flex-end'><h4>{user.username}</h4><GapH x='1'/><h5 style={{textTransform:'uppercase'}}>{user.level}</h5></FlexH><GapV x='3'/>
                        <p>{user.fullname}</p><GapV x='3'/>
                        <p>{user.nid}</p><GapV x='3'/>
                        <p>{getLocalDateFromUTC(user.createdAt)}</p><GapV x='4.5'/>
                        <div>{/*<RejectButton onClick={}>LOGOUT</RejectButton>*/} <Button variant='danger' onClick={initDelete}>DELETE</Button></div>
                    </div>
            </Col>
                <Col xs={12} md={6}>
            {user.accesses.map((a,i)=> <div key={i}>{a}<GapV x='1'/></div>)}
        {/*<Form onSubmit={updateUserAccess}>
            <FlexH x='flex-end' style={{marginTop:'4rem'}}><ThemeButton  type='submit' disabled={loading}>{loading?<Spinner />:'SAVE'}</ThemeButton></FlexH>
        </Form>*/}
                </Col></Row>
        </Container>
        {loading&&<Loader><Spinner  ></Spinner></Loader>}
    </div>
}
