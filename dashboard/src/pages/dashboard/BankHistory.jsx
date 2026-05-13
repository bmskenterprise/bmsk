import {useEffect,useState,} from 'react';
import {useNavigate,useSearchParams} from 'react-router-dom'
import {toast} from 'react-toastify';
import {formatDistanceToNow} from 'date-fns';
import {FaCheck} from 'react-icons/fa';
import {MdCancel} from 'react-icons/md';
import {useTheme} from '../../contexts/ThemeContext';
import {useNotification} from '../../contexts/NotificationContext';
import {useSocket} from '../../contexts/SocketContext'
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {ScrollViewV,ScrollViewH,FlexH,Field,Center,StripedList,PaginationBar,ApproveButton,RejectButton,Select,DatePicker,Spinner, Loader} from '../../components/styles/Admin.style';
import {launchDate,getCurrentLocalDate,getLocalDateTimeFromUTC} from '../../utils/date';
import useFetch from '../../hooks/useFetch'
import AdminPIN from '../../components/AdminPIN'
import Reject from '../../components/Reject'
import Pages from '../../components/Pagination'
import url from '../../config/url';
const fields = ['','date','bank','ac','amount','user','status'];

export default () =>{ 
    const {admin} = useAdminAuth()
    const accesses = admin?.accesses
    const {socket} = useSocket()
    const {pendingCounts:{bank},reducePendingCounts} = useNotification()
    const {thememode,modeData} = useTheme();
    const [searchParams,] = useSearchParams();
    const navigate = useNavigate()
    const [status,user,ac,fromDate,toDate,limit,page] = [searchParams.get('status')||'pending',searchParams.get('user')||'',searchParams.get('ac')||'',searchParams.get('fromDate')||'',searchParams.get('toDate')||'',searchParams.get('limit')||'20',searchParams.get('page')||'1']  
         
    const [loading,setLoading] = useState(false);
    const [failedID,setFailedID] = useState(null);
    const [history,setHistory] = useState({banks:[],pagination:{totalPages:1,currentPage:1}});
    const [hovered,setHovered] = useState(false)  //(err) {toast.error(err.message)}
    //let today=(new Date()).toISOString().split('T')[0];
    let [filterData,setFilterData] = useState({status,ac,fromDate,toDate,user,limit,page});

    useEffect(()=>{
        fetchBankHistory()
        setFilterData({status,ac,fromDate,toDate,user,limit,page})
    },[status,user,ac,fromDate,toDate,limit,page]);
         
    useEffect(()=>{
        reducePendingCounts('bank')
        //filterData= {status:'PENDING',ac:'',fromDate:'',toDate:'',user:'',limit:20};
        socket.emit('admin:bank-history:seen', null);
        navigate(`/dashboard/bank/history?status=${status}&user=${user}&ac=${ac}&fromDate=${fromDate}&toDate=${toDate}&limit=${limit}&page=${page}`)
    },[]);


        const fetchBankHistory = async (/*{page}*/) => {setLoading(true);
            try {
                let res = await fetch(`${url.urlBankHistory}?status=${status.toUpperCase()}&user=${user}&ac=${ac}&from=${fromDate}&to=${toDate}&limit=${limit}&page=${page}`,{credentials:'include'});
                let data = await res.json();
                if(!res.ok) throw new Error(data.error || 'failed to fetch banks');
                //if(data.length)cache[status] = data;
                setHistory(data/*.filter(d=>d.status==statusRef.current.value)*/);
            } catch (err) {toast.error(err.message);}
            finally{setLoading(false);}
        }


    const changeStatus= async (id,status,username,feedback) =>{
        setLoading(true);
        try {
            let res = await fetch(
                `${url.urlBank}/${id}`,
                {
                    method: 'PATCH',
                    credentials: 'include',headers:{'Content-Type':'application/json'},
                    body: JSON.stringify({status,feedback,username})
                }
            )
            let data = await res.json();
            if(!res.ok) throw new Error(data.error ||'')//Error(data.error || '');
            //let moved = cache['pending'].splice(cache['pending'].findIndex(i=>i.id===hitId),1)[0]//   'failed')
            //cache[status] && cache[status].unshift(moved)
            toast.success(data.message);fetchBankHistory(/*{page:history.pagination.currentPage}*/);
        }catch(err) {toast.error(err.message)}
        finally{setLoading(false);}
    }    


        const filter = e =>{
            e.preventDefault();let fd={status:e.target.status.value,ac:e.target.ac.value.trim(),fromDate:e.target.fromDate.value,toDate:e.target.toDate.value,user:e.target.user.value.trim(),limit:e.target.limit.value.trim()}
            navigate(`/dashboard/bank/history?status=${fd.status}&ac=${fd.ac}&user=${fd.user}&fromDate=${fd.fromDate}&toDate=${fd.toDate}&limit=${fd.limit||'20'}&page=1`)  //  
        }

    const {data} = useFetch(`${url.urlBankHistory}?status=${status.toUpperCase()}&user=${user}&ac=${ac}&from=${fromDate}&to=${toDate}&limit=${limit}&page=${page}`)

     const filterParams = e=> setFilterData(prev=>({...prev,[e.target.name]:e.target.value}))
         
    const pageNav = p=> navigate(`/dashboard/bank/history?status=${status}&ac=${ac}&user=${user}&fromDate=${fromDate}&toDate=${toDate}&limit=${limit}&page=${p}`);

    const onSuccess = (id,user) => AdminPIN(thememode,{cb:changeStatus,data:{id,user,status:'SUCCESS'}},'OK');
    const onFailed = (id,user,feedback)=>{
        setFailedID(null);//changeStatus(id,'FAILED',feedback,user)
         AdminPIN(thememode,{cb:changeStatus,data:{id,username:user,status:'FAILED',feedback}},'REJECT')
    }
                      
                      
                          
                             
                             
                             
        
    return !accesses?.includes('bank-history')?<Center><p>don't have bank history permission</p></Center>:<div style={{width:'100%', height:'100%'}} onClick={e=>setFailedID(null)}>
        <h4 style={{marginBottom:'6rem'}}>Bank History</h4>
        {/*<FlexH x='space-between' y='center'>*/}
            <form  onSubmit={filter}>
                <FlexH x='space-between' y='center'>
                    {/*<div style={{minWidth:'5rem',height:'auto'}}>
                    </div>*/}
                    <Field value={filterData.limit} name='limit' x='4' min='10' max='100' step='5' onChange={filterParams}/>  
                    <Field x='8' value={filterData.user} name='user' placeholder='user' onChange={filterParams}/>
                    {/*<div style={{minWidth:'5rem',height:'auto'}}><label htmlFor="ac">AC Number</label><br />
                    </div>*/}
                    <Field x='8' value={filterData.ac} name='ac' placeholder='AC' onChange={filterParams}/>
                    <div style={{minWidth:'5rem',height:'auto'}}>
                        {/*<label htmlFor="from">from</label><br/>*/} <DatePicker type='date' value={filterData.fromDate} name='fromDate' min={launchDate} max={getCurrentLocalDate()} onChange={filterParams}/>
                        {/*<label htmlFor="to">to</label><br/>*/} <DatePicker type='date' value={filterData.toDate} name='toDate' min={launchDate} max={getCurrentLocalDate()} onChange={filterParams}/>
                    </div>
                <div>
                    <Select name='status' value={filterData.status} onChange={filterParams} /*onChange={e=>{cache[e.target.value]?setHistory(cache[e.target.value]):fetchBankHistory(e.target.value)}}*/ >
                        <option value='pending'>Pending</option>
                        <option value='success'>Success</option>
                        <option value='failed'>Failed</option>
                    </Select>
                </div>
                <button type='submit'>filter</button>
                </FlexH>
            </form>{/*</FlexH>*/}
        {/*<List collection={history}>*/}{/*loading?<Spinner animation="border" role="status"></Spinner>:*/}<ScrollViewV style={{width:'100%',height:'80%',marginTop:'4rem'}}>
                <ScrollViewH style={{width:'100%'}}>
            {/*<FlexH x='flex-start' y='center'>{fields.map((f,i)=> <div key={i}>{f}</div>)}</FlexH>*/}
                    {history?.banks?.map(({_id,updatedAt,bank,acNumber,amount,acName,user,status},i)=> <StripedList /*x='flex-start' y='center'*/ key={i} style={{width:'87rem',fontSize:'1.2rem'}}>
                        <div style={{width:'15%'}} onMouseOver={e=>setHovered(true)} onMouseOut={e=>setHovered(false)}>{hovered?formatDistanceToNow(updatedAt,{addSuffix:true}):getLocalDateTimeFromUTC(updatedAt)}</div>
                        <div style={{width:'25%'}}>{bank}</div>
                        <div style={{width:'25%'}}>{acNumber} {acName}</div>
                        <div style={{width:'15%'}}>{Object.values(amount||{}).reduce((a,b)=>a+b,0)}</div>
                {/*<div style={{width:'10%'}}>{acName}</div>*/}
                        <div style={{width:'10%'}}>{user}</div>
                        {status=='PENDING' && <div style={{width:'10%',position:'relative'}}><ApproveButton onClick={e=>onSuccess(_id,user)}>OK</ApproveButton><RejectButton onClick={e=>{e.stopPropagation();setFailedID(_id)}}>Reject</RejectButton>  
                        {failedID==_id&&<Reject belong={{id:_id,user}} handleFailed={onFailed}/>}
                        </div>}
                    </StripedList>)}
                </ScrollViewH>
            </ScrollViewV>
        
            {history.pagination.totalPages>1 && <PaginationBar><Pages totalPage={history.pagination.totalPage} currentPage={history.pagination.currentPage} changePage={e=>pageNav(e)}/></PaginationBar>}
        {/*</List>*/}{loading && <Spinner></Spinner>}  
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
                <Select >
                    <option value="expired">unavailable</option>
                    <option value="invalid">invalid</option>
                    <option value="error">error</option>
                </Select><br />
            </Col><FlexH>
                <Button onClick={e=>setCancel(false)}>cancel</Button>
                <Button onClick={e=>changeStatus(ID,'failed',feedbackRef.current.value)}>ok</Button>
            </FlexH>
        </Row></div>*/}
}
