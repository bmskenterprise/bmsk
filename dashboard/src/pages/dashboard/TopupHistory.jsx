import {useEffect,useState} from 'react';
import {useNavigate,useSearchParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import {useMediaQuery} from 'react-responsive';
import {MdCancel} from 'react-icons/md';
import {formatDistanceToNow} from 'date-fns';
import {useTheme} from '../../contexts/ThemeContext'
import {useSocket} from '../../contexts/SocketContext'
import {useNotification} from '../../contexts/NotificationContext';
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {useTelecom} from '../../contexts/TelecomContext';
import {ScrollViewV,ScrollViewH,FlexH,GapV,GapH,StripedList,Field,Select,DatePicker,ApproveButton,RejectButton,TinyIcon,Center,Loader,Spinner,PaginationBar} from '../../components/styles/Admin.style';
import {launchDate,getCurrentLocalDate,getLocalDateTimeFromUTC} from '../../utils/date';
import useObjectFetch from '../../hooks/useFetch';
import url from '../../config/url';
import Pages from '../../components/Pagination';
import Reject from '../../components/Reject'
import AdminPIN from '../../components/AdminPIN' //searchParams.get('user') || '';

export default  () =>{
    const isMobile = useMediaQuery({maxWidth:768})
    const {failedCounts:{topup},reducePendingCounts} = useNotification()
    const {appData,admin} = useAdminAuth();
    const accesses = admin?.accesses
    const navigate = useNavigate()
    const {thememode,themeData:{themeBackground},modeData:{backPrimary,textPrimary}} = useTheme()
    const {icons} = useTelecom();
    const {socket} = useSocket()
    const [searchParams,setSearchParams] = useSearchParams()
    const [status,user,telecom,recipient,fromDate,toDate,limit,page] = [searchParams.get('status')||'pending',searchParams.get('user')||'',searchParams.get('telecom')||'',searchParams.get('recipient')||'',searchParams.get('from')||'',searchParams.get('to')||'',searchParams.get('limit')||'20',searchParams.get('page')||'1']  ;
    const [hovered,setHovered] = useState(false);
    const [loading,setLoading] = useState(false);
    const [topupHistory, setTopupHistory] = useState({topups:[],pagination:{totalPage:1,currentPage:1,limit:20}});
    const [failedID,setFailedID] = useState(null);
    const filterObj = {};
    let [filterTerm,setFilterTerm]=useState({status,recipient,telecom,fromDate,toDate,user,limit,page});
    const hasAccess = accesses?.includes('modify-topup-history');
    const msg = 'You don\'t have modify permission';
    const {data} = useObjectFetch(`${url.urlTopupHistory}?status=${status.toUpperCase()}&user=${user}&recipient=${recipient}&telecom=${telecom}&from=${fromDate}&to=${toDate}&limit=${limit}&page=${page}`)  ;
    //let today = (new Date()).toISOString().split('T')[0];
    useEffect(()=>{
        reducePendingCounts('topup') ;
        setSearchParams(prev=>{prev.set('status',status);prev.set('limit',limit);prev.set('page',page);return prev},{replace:true})
    }, [])
    useEffect(()=>{
        if(admin) socket.emit('admin:topup-history:seen',admin?.id)
    }, [admin])

    useEffect(()=>{
        setFilterTerm({status,recipient,telecom,fromDate,toDate,user,limit,page})
    },[status,user,recipient,telecom,fromDate,toDate,limit,page])
    
    const filterParams = e=> setFilterTerm(prev=>({...prev,[e.target.name]:e.target.value})) //Date()).toISOString().split('T')[0]);
    const changeStatus = async ({id,status,feedback},pin)=>{
        //if(!hasAccess) {toast.info('You don\'t have modify permission');return}
        setLoading(true)
        try{
            let res = await fetch(`${url.urlTopup}/${id}`,{
                method:'PATCH',
                credentials:'include',headers:{'Content-Type':'application/json','x-admin-pin':pin},
                body:JSON.stringify({status,feedback})
            });
            let data = await res.json();
            if(!res.ok) throw new Error(data.error)
            toast.success(data.message);
        }catch(e) {toast.error(e.message)}
        finally{setLoading(false)}
    }
    const onSuccess = (id) => {
        if(!hasAccess) {toast.info(msg);return}
        AdminPIN([thememode,themeBackground],{cb:changeStatus,data:{id,status:'SUCCESS'}},'OK');
    }
    const onFailed = (id,feedback)=>{
        setFailedID(null);
        if(!hasAccess) {toast.info(msg);return}
        AdminPIN([thememode,themeBackground],{cb:changeStatus,data:{id,status:'FAILED',feedback}},'REJECT')
    }
    const fetchTopupHistory = async (/*{page}*/) => {
            try {
                let res = await fetch(
                    `${url.urlTopupHistory}?status=${status.toUpperCase()}&user=${user}&recipient=${recipient}&telecom=${telecom}&from=${fromDate}&to=${toDate}&limit=${limit}&page=${page}`,
                    {credentials: 'include'}
                );
                let data = await res.json();
                if(!res.ok) throw new Error(data.error || 'failed');
                //if(data.length)cache[status]=data;
                setTopupHistory(data/*.filter(d=>d.status==statusRef.current.value)*/);
            }catch(e) {toast.error(e.message);}// (err) {  }
            finally{setLoading(false);}
    }
    const filter = (e)=> {e.preventDefault()
        setSearchParams(prev=>{prev.set('recipient',e.target.recipient.value.trim());prev.set('telecom',e.target.telecom.value.trim());prev.set('user',e.target.user.value.trim());prev.set('from',e.target.fromDate.value);prev.set('to',e.target.toDate.value);prev.set('limit',e.target.limit.value.trim());return prev},{replace:true});
        /*let filtered=cache[statusRef.current.value].filter(d=>{
            for(let j in filterObj){
                if(!d[j].includes(filterObj[j]))return false;}
            if(fromDateRef.current.value && d.createdAt<fromDateRef.current.value)return false;
            if(toDateRef.current.value && d.createdAt>toDateRef.current.value)return false;
            return true;
        });*///fetchTopupHistory({page:1})
    }
    const pageNav = p=> setSearchParams(prev=>{prev.set('page',p);return prev})
    const handleStatusChange = e => setSearchParams(prev=>{prev.set('status',e.target.value);return prev});
                              
                              
    return !accesses?.includes('topup-history')?<Center><p>Don't have topup history permission</p></Center>:<div style={{background:backPrimary,height:'calc(100vh - 4rem)'}} onClick={e=>setFailedID(null)}>
                <h4>Topup History</h4><GapV x='4'/>
                         <FlexH x='space-between'><Select style={{width:'10rem'}} value={status} onChange={handleStatusChange}>
                            <option value='pending'>Pending</option>
                            <option value='success'>Success</option>
                            <option value='failed'>Failed</option>
                        </Select>
                <form onSubmit={filter}><FlexH x='space-between' y='center'>
                    <Field value={filterTerm.limit} x='4' name='limit' onChange={filterParams}/>
                    {/*<Field   value={filterTerm.limit} name='limit'*/}
                    <div style={{minWidth:'5rem',height:'auto'}}>
                    <datalist id='levels'>{appData?.userLevels.map((l,i)=> <option key={i} value={l.name}/>)}</datalist><Field  x='8' value={filterTerm.user} placeholder='user' name='user' onChange={filterParams} list='levels'/></div>
                    <div style={{minWidth:'5rem',height:'auto'}}>
                    <datalist id='telecoms'>{['airtel','banglalink','grameenphone','robi','teletalk'].map((t,i)=> <option key={i} value={t}/>)}</datalist><Field   x='8' value={filterTerm.telecom} placeholder='telecom'name='telecom' onChange={filterParams} list='telecoms'/></div>
                    <div style={{minWidth:'5rem',height:'auto'}}>{/*<label htmlFor=''> Number</label><br />*/}<Field   x='8' value={filterTerm.recipient} name='recipient' onChange={filterParams} placeholder='recipient'/></div>
                    <div style={{minWidth:'5rem',height:'auto'}}>
                        {/*<label htmlFor='from'>from</label><br/>*/}<DatePicker type='date' name='fromDate' value={filterTerm.fromDate} min={launchDate} max={getCurrentLocalDate()} onChange={filterParams}/>
                        {/*<label htmlFor='to'>to</label><br/>*/}<DatePicker type='date' name='toDate' value={filterTerm.toDate} min={launchDate} max={getCurrentLocalDate()} onChange={filterParams}/>
                            {/*<option value='pending'>pending</option>*/}
                    <button type='submit'>filter</button>
                    </FlexH> 
                </form></FlexH>
            {/*<List collection={history}>*/}{/*loading?<Spinner animation='border' role='status'></Spinner>:*/}<ScrollViewV style={{width:'100%',height:'70%',marginTop:'4rem',fontSize:'1.2rem'}}>
                <ScrollViewH style={{width:'100%',height:'100%'}}>
                {/*<tr>{fields.map((f,i)=> <th key={i}>{f}</th>)}</tr></thead>*/}
                    {data?.topups?.map(({_id,updatedAt,recipient,amount,operator,user,status})=> <StripedList key={_id} style={{width:'80rem',fontSize:'1.2rem'}}>
                        <div style={{width:'25%'}} onMouseOver={e=>setHovered(true)} onMouseOut={e=>setHovered(false)}>{hovered?formatDistanceToNow(updatedAt,{addSuffix:true}): getLocalDateTimeFromUTC(updatedAt)}</div>
                        <FlexH y='center' style={{width:'25%'}}><TinyIcon src={icons[operator]}/><GapH x='0.5'/>{recipient}</FlexH>
                        <div style={{width:'25%'}}>&#2547;{amount}</div>
                    {/*<td>{billMonth}</td>
                    <td>{billExpire}</td>*/}
                        <div style={{width:'15%'}}>{user?.username}</div>
                        {status=='PENDING'&&<div style={{width:'10%',position:'relative'}}>
                        <ApproveButton disabled={!hasAccess} onClick={e=>onSuccess(_id)}>OK</ApproveButton><RejectButton disabled={!hasAccess} onClick={e=>{e.stopPropagation();setFailedID(_id)}}>Reject</RejectButton>
                        {failedID==_id&&<Reject belong={{id:_id,user}} handleFailed={onFailed}/>}
                              
                        </div>}
                    </StripedList>)}
                </ScrollViewH></ScrollViewV>
                <GapV x='2'/>{data?.pagination?.totalPage>1&& <PaginationBar><Pages totalPage={data?.pagination?.totalPage} currentPage={data?.pagination?.currentPage} changePage={e=>pageNav(e)}/></PaginationBar>}
            {loading && <Loader><Spinner  /></Loader>}
        </div>
        {/*:<div style={{background:backPrimary, color:textPrimary}}><Row>
                <Col xs={6} md={3}>
                    <span>recipient</span><br /><br />
                    <span>amount</span><br /><br />
                    <span>feedback</span><br /></Col>
                <Col xs={6} md={3}>
                    <span>{customer}</span><br /><br />
                    <span>{amount}</span><br /><br />
                    <Select >
                        <option value='expired'>unavailable</option>
                        <option value='invalid'>invalid</option>
                        <option value='error'>error</option>
                    </Select><br />
                </Col><FlexH>
                    <Button onClick={e=>setCancel(false)}>cancel</Button>
                    <Button onClick={e=>changeStatus(ID,'FAILED',feedbackRef.current.value)}>ok</Button>
                </FlexH>
            </Row></div>*/}
}
