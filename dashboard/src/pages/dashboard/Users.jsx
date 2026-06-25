import {useEffect,useState} from 'react'
import {Link,useNavigate,useSearchParams} from 'react-router-dom';
import {formatDistanceToNow} from 'date-fns'
import {useMediaQuery} from 'react-responsive';
import {FaTrash,FaLock,FaPen} from 'react-icons/fa'
   import {toast} from 'react-toastify'
import {useTheme} from '../../contexts/ThemeContext';
import {useSocket} from '../../contexts/SocketContext'
import {useNotification} from '../../contexts/NotificationContext';
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {useUser} from '../../contexts/UserContext'
import {ScrollViewV,ScrollViewH,FlexH,GapV,GapH,Center,StripedList,PaginationBar,ThemeButton,Field,Select,DatePicker,IconButton,Loader,Spinner} from '../../components/styles/Admin.style'
import {serviceTypes,accessTypes} from '../../../Preferences.json';
import {launchDate,getCurrentLocalDate} from '../../utils/date';
import useObjectFetch from '../../hooks/useFetch';
import url from '../../config/url'
import useLongPress from '../../hooks/longPress'
import UserForm from '../../components/UserForm';
import Pages from '../../components/Pagination'
import SwitchItem from '../../components/Switch'
import AdminPIN from '../../components/AdminPIN'

export default () =>{ 
    const isMobile = useMediaQuery({maxWidth:768});
    const {thememode,themeData:{themeBackground},modeData:{textPrimary}} = useTheme();
    const {socket} = useSocket();
    const {pendingCounts:{users},reducePendingCounts} = useNotification();
    const {appData,admin} = useAdminAuth();
    const accesses = admin?.accesses
    const navigate = useNavigate();
    const {toggleVerification,deleteUser} = useUser()
    const [searchParams] = useSearchParams()
    const [status,user,fromDate,toDate,limit,page] = [searchParams.get('status')||'not-verified',searchParams.get('user')||'',searchParams.get('from')||'',searchParams.get('to')||'',searchParams.get('limit')||'',searchParams.get('page')||'']  ;
    const [formInit,setFormInit] = useState(false);
    const [filterTerm,setFilterTerm] = useState({status,user,fromDate,toDate,limit,page});// || '';
    const [userDetail,setUserDetail]= useState(null);
         
    const getMainBalance = balanceMain => Object.values(balanceMain|| {}).reduce((sum,val)=>sum+val,0)
    const initUser = {username:'',name:'',nid:'',password:'',pin:'',services:serviceTypes,accesses:accessTypes};
    const msg = 'You don\'t have modify permission'
    let hasAccess = accesses?.includes('modify-user');
    const {/*fetchUsers,initFilterTerm,addUser,userLevels,*/data,loading} = useObjectFetch(`${url.urlManageUser}?status=${status.toLowerCase()}&user=${user}&from=${fromDate}&to=${toDate}&limit=${limit}&page=${page}`);
    useEffect(e=>{
            reducePendingCounts('user')
    },[])
    useEffect(e=>{
        if(admin) {
            socket.emit('admin:user-history:seen',admin?.id);
        }
    },[admin])
    
    useEffect(e=>{
        setFilterTerm({status,user,fromDate,toDate,limit,page})
    },[status,user,fromDate,toDate,limit,page])
    
    useEffect(()=>{
        window.history.pushState(null,'',window.location.href)
        const handlePopState = e =>{
            if(formInit){
                window.history.pushState(null,'',window.location.href);setFormInit(false) //<th key={i}>{f}</th>)}
            }
        }
        window.addEventListener('popstate',handlePopState)
        return ()=> window.removeEventListener('popstate',handlePopState)
    },[formInit])
    const initToggle = (id,verified) => {
        if(!hasAccess) {toast.info('You don\'t have modify permission');return}
          AdminPIN([thememode,themeBackground],{cb:toggleVerification,data:{id,verified}},'VERIFY');
    };
    const initDelete = id => {
        if(!hasAccess) {toast.info(msg);return}
        AdminPIN([thememode,themeBackground],{cb:deleteUser,data:{id}},'DELETE');
    }
    /*const check = (id)=>{
    let i=selected.indexOf(id)
        if(0<=i){setSelected(selected.filter(i=>i!=id))}
      else{setSelected([...selected,String(id)]);}}
    let {start,clear} =useLongPress(check)*/
    const handleCancel = e => {
        setFormInit(false);setUserDetail(null);
    };
    const filter = e => {
        e.preventDefault();//fetchUsers();
        let form = e.target
        navigate(`/dashboard/manage-user?status=${form.status.value}&user=${form.user.value.trim()}&from=${form.fromDate.value}&to=${form.toDate.value}&limit=${form.limit.value.trim()}&page=1`)/*users.filter(({username,status})=> i.)*/
    };
    const pageNav = p=> navigate(`/dashboard/manage-user?status=${status}&user=${user}&from=${fromDate}&to=${toDate}&limit=${limit}&page=${p}`)
    const filterParams = e=> setFilterTerm(prev=>({...prev,[e.target.name]:e.target.value}));
    
    return !accesses?.includes('manage-user')?<Center><p>Don't have manage user permission</p></Center>:<div style={{width:'100%',height:'100%',position:'relative'}}><div>
                <h4>Manage User</h4><GapV x='4'/>
            {/*<form onSubmit={fetchUsers}>
                <FlexH x='space-between' y='center'><div>
                    <label htmlFor='username'>username</label>
                    <input type='text' name='username' />
                </div>
                <div>
                    <label htmlFor='level'>level</label>
                    <Select name='level'>
                        {userLevels.map((level,i)=> <option key={i} value={level}>{level}</option>)}
                    </Select>
                </div>
                <div>
                    <label>status</label>
                    <Select name='status'>
                        <option value='pending'>pending</option>
                        <option value='active'>active</option>
                        <option value='deactive'>deactive</option>
                    </Select>
                </div>
                <Button type='submit'>filter</Button>
                </FlexH>
            </form>*/}
        {formInit? <UserForm user={userDetail} handleCancel={handleCancel} />: <div><FlexH x='flex-end' ><ThemeButton  onClick={e=>{setUserDetail({id:null,username:''});setFormInit(true)}}>Add User</ThemeButton></FlexH><GapV x='4'/>
            <form onSubmit={filter} >
                <FlexH x='space-between' y='center'>
                <Field   value={filterTerm.limit} name='limit' x='4' min='10' max='100' onChange={filterParams}/>
                <Field   x='6' list='levels' name='user' placeholder='user' value={filterTerm.user} onChange={filterParams}/>
                <datalist id='levels'>{appData?.userLevels.map(({name},i)=> <option key={i} value={name} />)}</datalist>{/*<div><input type='date'/><input type='date'/></div>*/}
                <div><DatePicker  type='date' value={filterTerm.fromDate} name='fromDate' min={launchDate} max={getCurrentLocalDate()} onChange={filterParams}/><DatePicker  type='date' value={filterTerm.toDate} name='toDate' min={launchDate} max={getCurrentLocalDate()} onChange={filterParams}/></div>
                <Select name='status' value={filterTerm.status}  onChange={filterParams} >
                        {/*<option value='PENDING'>Pending</option>*/}
                        <option value='verified'>Verified</option>
                        <option value='not-verified'>Not Verified</option>
                </Select>
                <button  type='submit' disabled={loading}>{loading?<Spinner size='1'/>:'filter'}</button>
                </FlexH>
            </form>{/*<div><Link to={'user/chat'}><MdMessage/></Link></div>*/}<GapV x='4'/>
             <ScrollViewV style={{height:'80%'}}><ScrollViewH style={{width:'100%'}}><div style={{width:'100%'}}>
                <FlexH x='flex-start' style={{width:isMobile?'64rem':'87rem',fontSize:'1.2rem'}}>
                    <div style={{width:'20%'}}>Username</div>
                  <div style={{width:'12%'}}>Main Bal.</div>
                  <div style={{width:'12%'}}>Topup Bal.</div>
                  <div style={{width:'12%'}}>Drive Bal.</div>
                  <div style={{width:'12%'}}>MBank Bal.</div>
                  <div style={{width:'20%'}}>Last Active</div>
                  <div style={{width:'12%'}}>Action</div>
                </FlexH>
                <div style={{width:'100%'}}>{data?.users?.map(({_id,userid,level,username,fullname,nid,balance,verified,lastActiveAt,createdAt,status,accesses})=> <StripedList key={_id} style={{width:isMobile?'64rem':'87rem',fontSize:'1.2rem'/*,paddingBlock:'0.5rem'*/}}  /*onMouseDown={e=>start(_id)} onMouseUp={clear} onMouseLeave={clear} onTouchStart={e=>start(_id)} onTouchEnd={clear}*/>
                    {/*<td>{userid}</td>*/}
                    <div style={{width:'20%',position:'relative'}}   ><Link to={`${_id}`} state={{ user: {level,username,fullname,nid,createdAt,accesses}}}>{username}</Link><GapH x='1'/><sub>({level})</sub></div>
                    <div style={{width:'12%'}}>&#2547;{getMainBalance(balance.main)}</div> 
                    <div style={{width:'12%'}}>&#2547;{balance.topup}</div>
                    <div style={{width:'12%'}}>&#2547;{balance.drive}</div>
                    <div style={{width:'12%'}}>&#2547;{balance.mbank}</div>
                    <div style={{width:'20%'}}>{formatDistanceToNow(lastActiveAt??(new Date()).toISOString(),{addSuffix:true})}</div>
                    {/*<td>{status}</td>*/}
                    <div style={{width:'12%'}}>
                        <SwitchItem check={verified} handleChange={e=>initToggle(_id,e.target.checked)}/><GapH x='1'/>
                        <IconButton disabled={!hasAccess} onClick={e=>{setUserDetail({id:_id,username});setFormInit(true)}}><FaPen/></IconButton><GapH x='0.5'/>
                        <IconButton disabled={!hasAccess} onClick={e=>initDelete(_id)}><FaTrash/></IconButton> {/*onClick={e=>{setUserDetail({id:_id,username});setFormInit(true)}`manage-users/${_id}`}><FaPen/></IconButton><Link to='reset-credential' state={{id:_id,username,credentialType:'password'}}><FaLock/></Link>&nbsp;<Link to='reset-credential' state={{id:_id,username,credentialType:'pin'}}><MdPassword/></Link>*/}{/*<Link to=''><FaHistory/></Link>*/}{/*<Link to={}>Message</Link>*/}<Link to=''></Link>
        </div>
                    {/*<td></td>*/}
                    {/* <td><Link to='access'>modify</Link></td> */}
                </StripedList>)}</div></div>
            </ScrollViewH></ScrollViewV>
        {data?.pagination?.totalPage>1 && <PaginationBar><Pages currentPage={data?.pagination?.currentPage} totalPage={data?.pagination?.totalPage} changePage={e=>pageNav(e)} /></PaginationBar>}
        </div>}
        {/*sendInit && <div style={{width:'100%',height:'100%',position:'fixed',top:0,left:0,backgroundColor:'rgba(0,0,0,.5)',display:'grid',zIndex:'99'}}>
            {messages.map((m,i)=> <FlexH x='flex-start' y='center' style={{marginBottom:'1rem'}} key={i}>
                <div style={{width:'2rem',height:'auto',display:'grid',placeItems:'center'}}><input type='checkbox' name='' onChange={e=>select(e.target,m._id)} /></div><div>{m.title && <h5>{m.title}</h5>}<p>{m.description}</p></div></FlexH>)}
            <FlexH x='flex-end' y='center'><Button disabled={!selected.length} onClick={send}>send</Button></FlexH>
        </div>*/}
    </div>
    {loading&& <Loader><Spinner  ></Spinner></Loader>}
    </div>
}
