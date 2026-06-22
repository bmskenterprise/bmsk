import {useEffect,useState} from 'react'
import {useNavigate,useSearchParams} from 'react-router-dom';
import {useMediaQuery} from 'react-responsive';
import {toast} from 'react-toastify';
import {MdCancel} from 'react-icons/md';
import {formatDistanceToNow} from 'date-fns';
import {useTheme} from '../../contexts/ThemeContext';
import {useSocket} from '../../contexts/SocketContext'
import {useNotification} from '../../contexts/NotificationContext'
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {FlexH,ScrollViewV,ScrollViewH,StripedList,PaginationBar,ApproveButton,RejectButton,Field,DatePicker,Select,Center,Loader,Spinner} from '../../components/styles/Admin.style';
import {launchDate,getCurrentLocalDate,getLocalDateTimeFromUTC} from '../../utils/date';
import {fetchObject} from '../../hooks/useFetch'
import copyToClipboard from '../../utils/copyToClipboard';
import url from '../../config/url';
import Pages from '../../components/Pagination'
import Reject from '../../components/Reject'
import AdminPIN from '../../components/AdminPIN';
const fields = ['','',''];
const billTypes = ['Electricity','Internet','Cable TV','Gas','Water'];

export default () =>{ 
    const navigate = useNavigate()
    const isMobile = useMediaQuery({maxWidth:768}) //|| '';
    const {admin} = useAdminAuth()
    const accesses = admin?.accesses             //
    const {socket} = useSocket()
    const [searchParams] = useSearchParams()
    const {thememode,themeData:{themeBackground},modeData} = useTheme();
    const {pendingCounts:{bill},reducePendingCounts} = useNotification();
    const [status,user,type,ac,fromDate,toDate,limit,page] = [searchParams.get('status')||'pending',searchParams.get('user')||'',searchParams.get('type')||'',searchParams.get('ac')||'',searchParams.get('fromDate')||'',searchParams.get('toDate')||'',searchParams.get('limit')||'',searchParams.get('page')||'1']  ;
    //const type = searchParams.get('type') || '';
    //const ac = searchParams.get('ac') || '';
    const errorlist = {width:'100%',marginBottom:'1.5rem'}  ;
    const [hovered,setHovered] = useState(false);
    const [loading,setLoading] = useState(false);
    const [failedID,setFailedID] = useState(null);
    const [history,setHistory] = useState({bills:[],pagination:{totalPage:1,currentPage:1}});
    const [filterData,setFilterData] = useState({status,user,type,ac,fromDate,toDate,limit,page});
    //const today = (new Date()).toISOString().split('T')[0]
    const [hover,setHover] = useState(false);
    let hasAccess = accesses?.includes('modify-bill-history');
    const msg = 'You don\'t have modify permission'
    const {data} = fetchObject(`${url.urlBillHistory}?status=${status.toUpperCase()}&user=${user}&ac=${ac}&type=${type}&from=${fromDate}&to=${toDate}&limit=${limit}&page=${page}`)  ;

    useEffect(()=>{
        reducePendingCounts('bill')
        navigate(`/dashboard/utility-bill/history?status=${status}&user=${user}&ac=${ac}&type=${type}&fromDate=${fromDate}&toDate=${toDate}&limit=${limit}&page=${page}`)
        //return ()=>document.removeEventListener('click',removePop)
    },[]);
    useEffect(()=>{
        if(admin) socket.emit('admin:bill-history:seen', admin?.id);
    },[admin]);
    useEffect(()=>{
        //fetchBillHistory(/*{page:1}*/);
        setFilterData( {status,user,type,ac,fromDate,toDate,limit,page});
    }, [status,user,type,ac,fromDate,toDate,limit,page]) 
        const fetchBillHistory = async (/*{page}*/) => {setLoading(true);
            try {
                let res = await fetch(`${url.urlBillHistory}?status=${status.toUpperCase()}&user=${user}&type=${type.toLowerCase()}&ac=${ac}&from=${fromDate}&to=${toDate}&limit=${limit}&page=${page}`,{credentials:'include'});
                let data = await res.json();
                if(!res.ok) throw new Error(data.error || 'failed');
                //if(data.length)caches[status] = data;
                setHistory(data/*.filter(d=>d.status==statusRef.current.value)*/);
            }catch(e) {toast.error(e.message)}
            finally{setLoading(false);}
        }

    const changeStatus = async ({id,status,feedback},pin) =>{
          if(!accesses?.includes('modify-bill-history')) {toast.info('you don\'t have bill modify permission');return}
        setLoading(true)
        try {
            let res = await fetch(`${url.urlBill}/${id}`,{
                    method: 'PATCH',
                    credentials: 'include',
                    headers:{'Content-Type':'application/json','x-admin-pin':pin},
                    body: JSON.stringify({status,feedback}),
            })
            let data = await res.json();
            if(!res.ok) throw new Error(data.error|| 'failed to change bill status');
            //let moved = cache['pending'].splice(cache['pending'].findIndex(i=>i.id===hitId),1)[0]     //'failed')
            //cache[status] && cache[status].unshift(moved)
            toast.success(data.message);//fetchBillHistory(/*{page:history.pagination.currentPage}*/);
        }catch(e) {toast.error(e.message)}
        finally{setLoading(false);}
    }
    const filter = (e) =>{
        e.preventDefault();let fd={status:e.target.status.value.trim(),user:e.target.user.value.trim(),type:e.target.type.value.toLowerCase(),ac:e.target.ac.value.trim(),fromDate:e.target.fromDate.value,toDate:e.target.toDate.value,limit:e.target.limit.value.trim(),page:1}
        navigate(`/dashboard/utility-bill/history?status=${fd.status}&ac=${fd.ac}&user=${fd.user}&type=${fd.type}&fromDate=${fd.fromDate}&toDate=${fd.toDate}&limit=${fd.limit||'20'}&page=1`)
    }
    const filterParams = e=> setFilterData(prev=>({...prev,[e.target.name]:e.target.value}));
    const onSuccess = (id) => 
               if(!hasAccess) {toast.info(msg);return}
        AdminPIN([thememode,themeBackground],{cb:changeStatus,data:{id,status:'SUCCESS'}},'OK');
    }
                      
    const onFailed = (id,feedback) =>{
        setFailedID(null);
               if(!hasAccess) {toast.info(msg);return}
        AdminPIN([thememode,themeBackground],{cb:changeStatus,data:{id,status:'FAILED',feedback}},'REJECT')
    }
    const pageNav = p=> navigate(`/dashboard/utility-bill/history?status=${status}&ac=${ac}&user=${user}&type=${type}&fromDate=${fromDate}&toDate=${toDate}&limit=${limit}&page=${p}`)
                          
                      
    return !accesses?.includes('bill-history')?<Center><p>don't have bill history permission</p></Center>:<div style={{width:'100%', height:'100%'}} onClick={e=>setFailedID(null)}>
        <h4 style={{marginBottom:'6rem'}}>Utility-Bill History</h4>
        {/*<FlexH x='space-between' y='center'>*/}
            <form  onSubmit={filter}>
                <FlexH x='space-between' y='center' style={{width:'100%'}}>
                <div>  <Field value={filterData.limit} name='limit' x='4' min='10' max='100' step='5' onChange={filterParams}/></div>
                    {/*<div style={{minWidth:'5rem',height:'auto'}}><label htmlFor="reseller">reseller</label><br /></div>*/}
                    
                    <Field x='8' value={filterData.user} name='user' placeholder='user' onChange={filterParams}/>
                    <div>
                        <Field x='8' name='type' value={filterData.type} list='bill-types' placeholder='Bill Types' onChange={filterParams}/>
                        <datalist id='bill-types'>
                            {/*<option value="">bill type</option>*/}
                            {billTypes.map((type,i)=> <option key={i} value={type}/>)}
                        </datalist>
                    </div>
                    {/*<div style={{minWidth:'5rem',height:'auto'}}><label htmlFor="ac">AC Number</label><br /></div>*/}
                    <Field x='8' value={filterData.ac} name='ac' placeholder='AC' onChange={filterParams}/>
                    <div style={{minWidth:'5rem',height:'auto'}}>
                        {/*<label htmlFor="from">from</label><br/>*/}<DatePicker onChange={filterParams} value={filterData.fromDate}  type='date' name='fromDate' min={launchDate} max={getCurrentLocalDate()}/>
                        {/*<label htmlFor="to">to</label><br/>*/}<DatePicker onChange={filterParams} value={filterData.toDate}  type='date' name='toDate' min={launchDate} max={getCurrentLocalDate()}/>
                    </div>
                <div>
                    <Select name='status' onChange={filterParams} value={filterData.status} /*onChange={e=>{cache[e.target.value]?setHistory(cache[e.target.value]):fetchBillHistory(e.target.value)}}*/ >
                        <option value='pending'>Pending</option>
                        <option value='success'>Success</option>
                        <option value='failed'>Failed</option>
                    </Select>
                </div>
            <button type='submit'>filter</button>
                </FlexH>
        
            </form>{/*</FlexH>*/}
        {/*<List collection={history}>*/}{/*loading?<Spinner animation="border" role="status"></Spinner>:*/}<ScrollViewV style={{width:'100%',height:'80%',marginTop:'4rem'}}>
            <ScrollViewH style={{width:'100%'}}>{/*<FlexH x='flex-start' y='center'>{fields.map((f,i)=> <div key={i}>{f}</div>)}</FlexH>*/}
                {data?.bills?.map(({_id,billType,updatedAt,acNumber,amount,expireDate,user,status},i)=> <StripedList  style={{width:isMobile?'64rem':'87rem',fontSize:'1.2rem'}} key={i}>
                    <div style={{width:'20%'}} onMouseOver={e=>setHovered(true)} onMouseOut={e=>setHovered(false)}>{hovered?formatDistanceToNow(updatedAt,{addSuffix:true}): getLocalDateTimeFromUTC(updatedAt)}</div>
                    <div onMouseOver={e=>setHover(true)} onMouseOut={e=>setHover(false)} onClick={e=>copyToClipboard(acNumber)} style={{width:'25%'}}>{hover?billType:acNumber}</div>
                    <div style={{width:'15%'}}>{Object.values(amount||{}).reduce((a,b)=>a+b,0)}</div>
                {/*<div>{billMonth}</div>*/}
                    <div style={{width:'15%'}}>{expireDate}</div>
                    <div style={{width:'15%'}}>{user?.username}</div>
                    {status=='PENDING' && <div style={{width:'10%',position:'relative'}}><ApproveButton onClick={e=>onSuccess(_id)} disabled={!hasAccess}>OK</ApproveButton><RejectButton onClick={e=>{e.stopPropagation();setFailedID(_id)/*setID(_id)*/}} disabled={!hasAccess}>Reject</RejectButton>
                    {failedID==_id&&<Reject belong={{id:_id,user}} handleFailed={onFailed}/>}
                      </div>}
                      
                      
                
                </StripedList>)}
            
            </ScrollViewH></ScrollViewV>
            {data?.pagination?.totalPage>1 && <PaginationBar><Pages totalPage={data?.pagination?.totalPage} currentPage={data?.pagination?.currentPage} changePage={e=>pageNav(e)} /></PaginationBar>}
        {/*</List>*/}{loading && <Loader><Spinner></Spinner></Loader>}  
    </div>
    {/*:<div style={{background:backPrimary, color:textPrimary}}><Row>
            <Col xs={6} md={3}>
                <span>recipient</span><br /><br />
                <span>amount</span><br /><br />
                <span>feedback</span><br />
            </Col>
            <Col xs={6} md={3}>
                <span>{customer}</span><br /><br />
                <span>{amount}</span><br /><br />
                <select ref={feedbackRef}>
                    <option value="expired">unavailable</option>
                    <option value="invalid">invalid</option>
                    <option value="error">error</option>
                </select><br />
            </Col><FlexH>
                <Button onClick={e=>setCancel(false)}>cancel</Button>
                <Button onClick={e=>changeStatus(ID,'failed',feedbackRef.current.value)}>ok</Button>
            </FlexH>
        </Row></div>*/}
}
