import {useEffect,useState} from 'react';
import {useNavigate,useSearchParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import {FaCheck} from 'react-icons/fa';
import {MdCancel} from 'react-icons/md';
import {formatDistanceToNow} from 'date-fns';
import {useTheme} from '../../contexts/ThemeContext'
import {useSocket} from '../../contexts/SocketContext'
import {useNotification} from '../../contexts/NotificationContext';
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {useTelecom} from '../../contexts/TelecomContext';
import {ScrollViewV,ScrollViewH,FlexH,GapV,GapH,StripedList,Field,Select,DatePicker,ApproveButton,RejectButton,TinyIcon,Center,Loader,Spinner} from '../../components/styles/Admin.style';
import {launchDate,getCurrentLocalDate,getLocalDateTimeFromUTC} from '../../utils/date';
import url from '../../config/url';
import Pages from '../../components/Pagination';
import useFetch from '../../hooks/useFetch';
import Reject from '../../components/Reject'
import AdminPIN from '../../components/AdminPIN' //searchParams.get('user') || '';

export default  () =>{
    const {failedCounts:{topup},reducePendingCounts} = useNotification()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const {thememode,themeData:{themeBackground},modeData} = useTheme()
    const {backPrimary,textPrimary} = modeData
    const {socket} = useSocket()
    const [status,user,telecom,recipient,fromDate,toDate,limit,page] = [searchParams.get('status')||'pending',searchParams.get('user')||'',searchParams.get('telecom')||'',searchParams.get('recipient')||'',searchParams.get('fromDate')||'',searchParams.get('toDate')||'',searchParams.get('limit')||'20',searchParams.get('page')||'1']  ;
    //const telecom = searchParams.get('telecom') || '';
    //const recipient = searchParams.get('recipient') || '';
    const fields = ['','','',''];
    const {icons} = useTelecom();
    const errorlist = {width:'100%',marginBottom:'1.5rem'};
    const [hovered,setHovered] = useState(false);
    const [loading,setLoading] = useState(false);
    const [topupHistory, setTopupHistory] = useState({topups:[],pagination:{totalPage:1,currentPage:1,limit:20}});
    const [failedID,setFailedID] = useState(null);
    const filterObj = {};const {appData,admin} = useAdminAuth();
    let [filterData,setFilterData]=useState({status,recipient,telecom,fromDate,toDate,user,limit,page});
    const accesses = admin?.accesses
    const {data} = useFetch(`${url.urlTopupHistory}?status=${status.toUpperCase()}&user=${user}&recipient=${recipient}&telecom=${telecom}&from=${fromDate}&to=${toDate}&limit=${limit}&page=${page}`)  ;
    //let today = (new Date()).toISOString().split('T')[0];
    useEffect(()=>{
        //socket.emit('admin:topup-history:seen', null);
        navigate(`/dashboard/topup/history?status=${status}&recipient=${recipient}&telecom=${telecom}&user=${user}&fromDate=${fromDate}&toDate=${toDate}&limit=${limit}&page=1`)
    }, [])
    useEffect(()=>{
        reducePendingCounts('topup') ;
        if(admin) socket.emit('admin:topup-history:seen',admin?.id)
    }, [admin])

    useEffect(()=>{
        setFilterData({status,recipient,telecom,fromDate,toDate,user,limit,page})
    },[status,user,recipient,telecom,fromDate,toDate,limit,page])
    
    const filterParams = e=> setFilterData(prev=>({...prev,[e.target.name]:e.target.value})) //Date()).toISOString().split('T')[0]);
    const changeStatus = async ({id,status,feedback},pin)=>{
        if(!accesses?.includes('modify-topup-history')) {toast.info('you don\'t have modify permission');return}
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
    const onSuccess = (id) => AdminPIN([thememode,themeBackground],{cb:changeStatus,data:{id,status:'SUCCESS'}},'OK');
    const onFailed = (id,feedback)=>{
        setFailedID(null);
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
        navigate(`/dashboard/topup/history?status=${e.target.status.value}&recipient=${e.target.recipient.value.trim()}&telecom=${e.target.telecom.value.trim()}&user=${e.target.user.value.trim()}&fromDate=${e.target.fromDate.value}&toDate=${e.target.toDate.value}&limit=${e.target.limit.value.trim()}&page=1`);
        /*let filtered=cache[statusRef.current.value].filter(d=>{
            for(let j in filterObj){
                if(!d[j].includes(filterObj[j]))return false;}
            if(fromDateRef.current.value && d.createdAt<fromDateRef.current.value)return false;
            if(toDateRef.current.value && d.createdAt>toDateRef.current.value)return false;
            return true;
        });*///fetchTopupHistory({page:1})
    }
    const pageNav = p=> navigate(`/dashboard/topup/history?status=${status}&recipient=${recipient}&telecom=${telecom}&user=${user}&fromDate=${fromDate}&toDate=${toDate}&limit=${limit}&page=${p}`)
                              
                              
    return !accesses?.includes('topup-history')?<Center><p>don't have topup history permission</p></Center>:<div style={{background:backPrimary,color:textPrimary}} onClick={e=>setFailedID(null)}>
                <h4>Topup History</h4><GapV x='4'/>
                <form onSubmit={filter}><FlexH x='space-between' y='center'>
                    <Field value={filterData.limit} x='4' name='limit' onChange={filterParams}/>
                    {/*<Field   value={filterData.limit} name='limit'*/}
                    <div style={{minWidth:'5rem',height:'auto'}}>
                    <datalist id='levels'>{appData?.userLevels.map((l,i)=> <option key={i} value={l.name}/>)}</datalist><Field  x='8' value={filterData.user} placeholder='user' name='user' onChange={filterParams} list='levels'/></div>
                    <div style={{minWidth:'5rem',height:'auto'}}>
                    <datalist id='telecoms'>{['airtel','banglalink','grameenphone','robi','teletalk'].map((t,i)=> <option key={i} value={t}/>)}</datalist><Field   x='8' value={filterData.telecom} placeholder='telecom'name='telecom' onChange={filterParams} list='telecoms'/></div>
                    <div style={{minWidth:'5rem',height:'auto'}}>{/*<label htmlFor=""> Number</label><br />*/}<Field   x='8' value={filterData.recipient} name='recipient' onChange={filterParams} placeholder='recipient'/></div>
                    <div style={{minWidth:'5rem',height:'auto'}}>
                        {/*<label htmlFor="from">from</label><br/>*/}<DatePicker type='date' name='fromDate' value={filterData.fromDate} min={launchDate} max={getCurrentLocalDate()} onChange={filterParams}/>
                        {/*<label htmlFor="to">to</label><br/>*/}<DatePicker type='date' name='toDate' value={filterData.toDate} min={launchDate} max={getCurrentLocalDate()} onChange={filterParams}/>
                    </div>     <div><Select  name='status' value={filterData.status} onChange={filterParams}>
                            {/*<option value="pending">pending</option>*/}
                            <option value='pending'>Pending</option>
                            <option value='success'>Success</option>
                            <option value='failed'>Failed</option>
                        </Select>
                    </div><button type='submit'>filter</button>
                    </FlexH> 
                </form>
            {/*<List collection={history}>*/}{/*loading?<Spinner animation="border" role="status"></Spinner>:*/}<ScrollViewV style={{width:'100%',height:'80%',marginTop:'4rem',fontSize:'1.2rem'}}>
                <ScrollViewH style={{width:'100%'}}>
                {/*<tr>{fields.map((f,i)=> <th key={i}>{f}</th>)}</tr></thead>*/}
                    {data?.topups?.map(({_id,updatedAt,recipient,amount,operator,user,status})=> <StripedList key={_id} style={{width:'80rem',fontSize:'1.2rem'}}>
                        <div style={{width:'25%'}} onMouseOver={e=>setHovered(true)} onMouseOut={e=>setHovered(false)}>{hovered?formatDistanceToNow(updatedAt,{addSuffix:true}): getLocalDateTimeFromUTC(updatedAt)}</div>
                        <FlexH y='center' style={{width:'25%'}}><TinyIcon src={icons[operator]}/><GapH x='0.5'/>{recipient}</FlexH>
                        <div style={{width:'25%'}}>&#2547;{amount}</div>
                    {/*<td>{billMonth}</td>
                    <td>{billExpire}</td>*/}
                        <div style={{width:'15%'}}>{user?.username}</div>
                        {status=='PENDING'&&<div style={{width:'10%',position:'relative'}}>
                        <ApproveButton disabled={!accesses?.includes('modify-topup-history')} onClick={e=>onSuccess(_id)}>OK</ApproveButton><RejectButton disabled={!accesses?.includes('modify-topup-history')} onClick={e=>{e.stopPropagation();setFailedID(_id)}}>Reject</RejectButton>
                        {failedID==_id&&<Reject belong={{id:_id,user}} handleFailed={onFailed}/>}
                              
                        </div>}
                    </StripedList>)}
                </ScrollViewH></ScrollViewV>
                {data?.pagination?.totalPage>1 && <Pages totalPage={data?.pagination?.totalPage} currentPage={data?.pagination?.currentPage} changePage={e=>pageNav(e)}/>}
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
                        <option value="expired">unavailable</option>
                        <option value="invalid">invalid</option>
                        <option value="error">error</option>
                    </Select><br />
                </Col><FlexH>
                    <Button onClick={e=>setCancel(false)}>cancel</Button>
                    <Button onClick={e=>changeStatus(ID,'FAILED',feedbackRef.current.value)}>ok</Button>
                </FlexH>
            </Row></div>*/}
}
