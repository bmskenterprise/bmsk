import {useEffect,useState,} from 'react';
import {useNavigate,useSearchParams} from 'react-router-dom'
import {toast} from 'react-toastify';
import {formatDistanceToNow} from 'date-fns';
import {FaCheck} from 'react-icons/fa';
import {useTheme} from '../../contexts/ThemeContext';
import {useNotification} from '../../contexts/NotificationContext';
import {useSocket} from '../../contexts/SocketContext'
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {launchDate,getCurrentLocalDate,getLocalDateTimeFromUTC} from '../../utils/date';
import {ScrollViewV,ScrollViewH,FlexH,StripedList,PaginationBar,Field,Select,DatePicker,TinyIcon,ApproveButton,RejectButton,Spinner, Center} from '../../components/styles/Admin.style';
import url from '../../config/url';
import useFetch from '../../hooks/useFetch'
import AdminPIN from '../../components/AdminPIN' //searchParams.get('page') || '1';
import Reject from '../../components/Reject';
import Pages from '../../components/Pagination'
const fields = ['','date','mbank','recipient','amount','user','status'];

export default () =>{ 
    const {appData,admin} = useAdminAuth()
    const accesses = admin?.accesses
    const {socket} = useSocket()
    const {pendingCounts:{mbank},reducePendingCounts} = useNotification()
    const {thememode,themeData:{themeBackground}} = useTheme();
    const [searchParams,] = useSearchParams();
    const navigate = useNavigate()
    const [status,user,recipient,gateway,fromDate,toDate,limit,page] = [searchParams.get('status')||'pending',searchParams.get('user')||'',searchParams.get('recipient')||'',searchParams.get('gateway')||'',searchParams.get('fromDate')||'',searchParams.get('toDate')||'',searchParams.get('limit')||'20',searchParams.get('page')||'1']  ;
    const mbankIcon = appData?.mbanks ? Object.fromEntries(appData.mbanks.map(item=>[item.name,item.icon])):{};
    //const recipient = searchParams.get('recipient') || '';
    //const fromDate = searchParams.get('fromDate') || '';

    const [loading,setLoading] = useState(false);
    const [failedID,setFailedID] = useState(null);
    const [history,setHistory] = useState({banks:[],pagination:{totalPages:1,currentPage:1}});
    const [hovered,setHovered] = useState(false)
    let errorlist= {width:'100%',marginBottom:'1.5rem'};
    let [filterData,setFilterData] = useState({status,recipient,gateway,fromDate,toDate,user,limit,page});
    const {data} = useFetch(`${url.urlMBankHistory}?status=${status.toUpperCase()}&mbankType=${gateway}&user=${user}&recipient=${recipient}&from=${fromDate}&to=${toDate}&limit=${limit}&page=${page}`)  ;
    
    useEffect(()=>{
        //document.addEventListener('click',e=>{if(failedID){setFailedID(null)}})
        navigate(`/dashboard/mbank/history?status=${status}&gateway=${gateway}&recipient=${recipient}&user=${user}&fromDate=${fromDate}&toDate=${toDate}&limit=${limit}&page=1`)
    },[]);
    useEffect(()=>{
        reducePendingCounts('mbank')
        if(admin) socket.emit('admin:mbank-history:seen', admin?.id);
    },[admin]);
    useEffect(()=>{
        setFilterData({status,recipient,gateway,fromDate,toDate,user,limit,page})
    },[status,user,recipient,gateway,fromDate,toDate,limit,page]);
        
        
    const fetchMBankHistory = async (/*{page}*/) => {setLoading(true);
        try {
            let res = await fetch(`${url.urlMBankHistory}?status=${status.toUpperCase()}&user=${user}&recipient=${recipient}&from=${fromDate}&to=${toDate}&limit=${limit}&page=${page}`,{credentials:'include'});
            let data = await res.json();
            if(!res.ok) throw new Error(data.error ||'failed to fetch mbank history');
            setHistory(data/*.filter(d=>d.status==statusRef.current.value)*/);
        } catch (e) {toast.error(e.message);}
        finally{setLoading(false);}
    }
            
            
    const changeStatus= async ({id,status,feedback},pin) =>{
        if(!accesses?.includes('modify-mbank-history')) {toast.info('you don\'t have modify permission');return}
        setLoading(true);
        try {
            let res = await fetch(
                `${url.urlMBank}/${id}`,
                {
                    method: 'PATCH',
                    credentials: 'include',headers:{'Content-Type':'application/json','x-admin-pin':pin},
                    body: JSON.stringify({status,feedback})
                }
            )
            let data = await res.json();
            if(!res.ok) throw new Error(data.error ||'')//Error(data.error || '');
            toast.success(data.message);//fetchMBankHistory(/*{page:history.pagination.currentPage}*/);
        }catch(e) {toast.error(e.message)}
        finally{setLoading(false);}
    }    
            
            
    const filter = e =>{
        e.preventDefault();let fd={status:e.target.status.value,recipient:e.target.recipient.value.trim(),gateway:e.target.gateway.value.trim(),fromDate:e.target.fromDate.value,toDate:e.target.toDate.value,user:e.target.user.value.trim(),limit:e.target.limit.value.trim()}
        navigate(`/dashboard/mbank/history?status=${fd.status}&gateway=${gateway}&recipient=${fd.recipient}&user=${fd.user}&fromDate=${fd.fromDate}&toDate=${fd.toDate}&limit=${fd.limit||'20'}&page=1`)  //  
    }
            
    const filterParams = e=> setFilterData(prev=>({...prev,[e.target.name]:e.target.value}))
    const pageNav = p=> navigate(`/dashboard/mbank/history?status=${status}&gateway=${gateway}&recipient=${recipient}&user=${user}&fromDate=${fromDate}&toDate=${toDate}&limit=${limit}&page=${p}`);
                    {/*<FlexH x='space-between' y='center'>*/}
    const onSuccess = (id) => AdminPIN([thememode,themeBackground],{cb:changeStatus,data:{id,status:'SUCCESS'}},'OK');
    const onFailed = (id,feedback)=>{
        setFailedID(null);
        AdminPIN([thememode,themeBackground],{cb:changeStatus,data:{id,status:'FAILED',feedback}},'REJECT')
    }
                      
                      
    return !accesses?.includes('mbank-history')?<Center><p>don't have MBank permission</p></Center>:<div style={{width:'100%', height:'100%'}} onClick={e=>setFailedID(null)}>
        <h4 style={{marginBottom:'6rem'}}>MBank History</h4>
            <form  onSubmit={filter}>
                <FlexH x='space-between' y='center'>
                    <Field value={filterData.limit} name='limit' x='4' min='10' max='100' step='5' onChange={filterParams}/>
                    <Field x='8' value={filterData.user} name='user' placeholder='user' onChange={filterParams}/>
                    <Field x='8' value={filterData.recipient} name='recipient' placeholder='recipient' onChange={filterParams}/>
                    <Field x='8' value={filterData.gateway} name='gateway' placeholder='gateway' onChange={filterParams} list='gateways'/>
                    <datalist id='gateways'>{appData?.mbanks?.map((g,i)=> <option key={i} value={g.name}/>)}</datalist>  
                    <div style={{minWidth:'5rem',height:'auto'}}>
                        <DatePicker value={filterData.fromDate}  type='date' name='fromDate' min={launchDate} max={getCurrentLocalDate()} onChange={filterParams}/>
                        <DatePicker value={filterData.toDate}  type='date' name='toDate' min={launchDate} max={getCurrentLocalDate()} onChange={filterParams}/>
                    </div>
                    <div>
                        <Select name='status' value={filterData.status} onChange={filterParams}>
                            <option value='pending'>Pending</option>
                            <option value='success'>Success</option>
                            <option value='failed'>Failed</option>
                        </Select>
                    </div>
                    <button type='submit'>filter</button>
                </FlexH>
            </form>
            <ScrollViewV style={{width:'100%',height:'80%',marginTop:'4rem'}}>
                <ScrollViewH style={{width:'100%'}}>{data?.mbanks?.map(({_id,updatedAt,mbankType,recipient,amount,transactionType,user,status})=> <StripedList   key={_id} style={{width:'87rem',fontSize:'1.3rem'}}>
                    <div style={{width:'20%'}} onMouseOver={e=>setHovered(true)} onMouseOut={e=>setHovered(false)}>{hovered?formatDistanceToNow(updatedAt,{addSuffix:true}): getLocalDateTimeFromUTC(updatedAt)}</div>
                    <div style={{width:'20%'}}><TinyIcon src={mbankIcon[mbankType]}/> {transactionType}</div>
                    <div style={{width:'20%'}}>{recipient}</div>
                    <div style={{width:'15%'}}>&#2547;{amount}</div>
                    <div style={{width:'15%'}}>{user?.username}</div>
                    {status=='PENDING' && <div style={{width:'10%',position:'relative'}}><ApproveButton onClick={e=>onSuccess(_id)} disabled={!accesses?.includes('modify-mbank-history')}>OK</ApproveButton><RejectButton onClick={e=>{e.stopPropagation();setFailedID(_id)}} disabled={!accesses?.includes('modify-mbank-history')}>Reject</RejectButton>
                        {failedID==_id && <Reject belong={{id:_id,user}} handleFailed={onFailed}/>}
                          
                              
                              
                              
                        
                    </div>}
                </StripedList>)}
            </ScrollViewH></ScrollViewV>
        
        {data?.pagination?.totalPages>1 && <PaginationBar><Pages totalPage={data?.pagination?.totalPage} currentPage={data?.pagination?.currentPage} changePage={e=>pageNav(e)}/></PaginationBar>}
        {/*</List>*/}{loading && <Spinner  ></Spinner>}
                                                                                                        </div>
}
