import {useEffect,useState,} from 'react';
import {useNavigate,useSearchParams,} from 'react-router-dom';
import {toast} from 'react-toastify';
import {formatDistanceToNow} from 'date-fns';
import {FaCheck} from 'react-icons/fa';
import {MdCancel} from 'react-icons/md';
import {useMediaQuery} from 'react-responsive'
import {balanceTypes} from '../../../Preferences.json'
import {useTheme} from '../../contexts/ThemeContext'
import {useSocket} from '../../contexts/SocketContext'
import {useNotification} from '../../contexts/NotificationContext';
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {launchDate,getCurrentLocalDate,getLocalDateTimeFromUTC} from '../../utils/date';
import {ScrollViewV,ScrollViewH,FlexH,GapH,StripedList,Field,DatePicker,Select,TinyIcon,ApproveButton,RejectButton,PaginationBar,Center,Loader,Spinner} from '../../components/styles/Admin.style';
import url from '../../config/url';
import useFetch from '../../hooks/useFetch'
import Reject from '../../components/Reject'
import AdminPIN from '../../components/AdminPIN';
import Pages from '../../components/Pagination'

export default  () =>{
    const navigate = useNavigate();
    const isMobile = useMediaQuery({maxWidth:768});
    const {appData,admin} = useAdminAuth();
    const accesses = admin?.accesses
    const {socket} = useSocket()  ;
    const {thememode,themeData:{themeBackground},modeData} = useTheme();
    const {backPrimary,textPrimary} = modeData
    const {failedCounts:{deposit},reducePendingCounts} = useNotification();
    const [searchParams] = useSearchParams()
    const [status,user,txn,gateway,type,fromDate,toDate,limit,page] = [searchParams.get('status')||'pending',searchParams.get('user')||'',searchParams.get('txn')||'',searchParams.get('gateway')||'',searchParams.get('type')||'',searchParams.get('fromDate')||'',searchParams.get('toDate')||'',searchParams.get('limit')||'20',searchParams.get('page')||'1']  ;
    //const gateway = searchParams.get('gateway') || '';
    //const type = searchParams.get('type') || '';
    //const fromDate = searchParams.get('fromDate') || '';
    const [hovered,setHovered] = useState(false);
    const fields = ['','',''];
    const [failedId,setFailedId] = useState(null);
    const [loading,setLoading] = useState(false);
    const [depositHistory, setDepositHistory] = useState({deposits:[],pagination:{totalPage:1,currentPage:1,limit:20}});
    const mbankIcons = appData?.mbanks ? Object.fromEntries(appData.mbanks.map(item=>[item.name,item.icon])) :{};
    const errorlist = {width:'100%',marginBottom:'1rem'}
    const [init,setInit] = useState(false)
    const [selected,setSelected] = useState([])
    let [filterData,setFilterData]=useState({status,user,txn,gateway,type,fromDate,toDate,limit,page});
    //let today = (new Date()).toISOString().split('T')[0]
    /*const check = (id)=>{
        let i=selected.indexOf(id)
        if(0<=i){setSelected(prev=> prev.filter(i=>i!=id))}
        else{setSelected(prev=> [...prev,String(id)]);}
    };*/
    //const {start,clear} = useLongPress(check)//if(data.length)cache[status]=data;
    const {data} = useFetch(`${url.urlDepositHistory}?status=${status.toUpperCase()}&user=${user}&txn=${txn}&gateway=${gateway}&type=${type}&from=${fromDate}&to=${toDate}&limit=${limit}&page=${page}`)  ;

    useEffect(()=>{
        reducePendingCounts('deposit')
        socket.emit('admin:deposit-history:seen',null)
        navigate(`/dashboard/deposit/history?status=${status}&txn=${txn}&gateway=${gateway}&user=${user}&type=${type}&fromDate=${fromDate}&toDate=${toDate}&limit=${limit}&page=1`)
    }, [])
    
    useEffect(()=>{
        setFilterData ({status,user,txn,gateway,type,fromDate,toDate,limit,page});
    },[status,user,txn,gateway,type,fromDate,toDate,limit]);
    
    const fetchDepositHistory = async (/*{page}*/) =>{ 
            setLoading(true)
            try {
                let res = await fetch(`${url.urlDepositHistory}?status=${status.toUpperCase()}&user=${user}&txn=${txn}&gateway=${gateway}&type=${type}&from=${fromDate}&to=${toDate}&limit=${limit}&page=${page}`,{credentials:'include'});
                let data = await res.json();
                if(!res.ok) throw new Error(data.error||'failed to fetch history');
                setDepositHistory(data/*.filter(d=>d.status==statusRef.current.value)*/);
            }catch(err) {toast.error(err.message)}
            finally { setLoading(false); }
        }
    const changeStatus = async ({id,username,status,feedback},pin)=>{
        setLoading(true)
        try{
            let res = await fetch(`${url.urlDeposit}/${id}`,{
                method: 'PATCH',
                credentials: 'include',
                headers: {'Content-Type':'application/json','x-admin-pin':pin},
                body: JSON.stringify({username,status,feedback})
            })
            let data = await res.json()
            if(!res.ok) throw new Error(data.error||'failed to change status')
            toast.success(data.message);//fetchDepositHistory()
        }catch(e) {toast.error(e.message)}
        finally{setLoading(false)}
    }
    /*deleteTXN    setLoading(true)
        try{//res.json())
                        let res= await fetch(
                            url.urlDepositInit,
                            {
                                method:'DELETE',
                                headers:{'Content-Type':'application/json','x-admin-pin':admin.adminPIN},
                                body:JSON.stringify({ids:selected})
                            }
                        );
                        let data= await res.json();
                        if(!res.ok) throw new Error(data.error||'Error Fetching Data')
                        toast.success('Transaction Deleted Successfully')
                    }catch(err){toast.error(err.message)}
                    finally{setLoading(false)}
                }*/
                      
    const onSuccess = (id,user) => AdminPIN([thememode,themeBackground],{cb:changeStatus,data:{id,username:user,status:'SUCCESS'}},'OK');
    const onFailed = (id,user,feedback) => {
        setFailedId(null);
        AdminPIN([thememode,themeBackground],{cb:changeStatus,data:{id,username:user,status:'FAILED',feedback}},'REJECT')
    }
                          
    const filter = (e) =>{e.preventDefault()
        navigate(`/dashboard/deposit/history?status=${e.target.status.value}&user=${e.target.user.value.trim()}&txn=${e.target.txn.value.trim()}&gateway=${e.target.gateway.value.trim()}&type=${e.target.type.value.trim()}&fromDate=${e.target.fromDate.value}&toDate=${e.target.toDate.value}&limit=${e.target.limit.value.trim()}&page:1`);/*let filtered=cache[statusRef.current.value].filter(d=>{
            for(let j in filterObj){
                if(!d[j].includes(filterObj[j]))return false;}
            if(fromDateRef.current.value && d.createdAt<fromDateRef.current.value)return false;
            if(toDateRef.current.value && d.createdAt>toDateRef.current.value)return false;
            return true;
        });setDepositHistory(filtered)*///fetchDepositHistory({page:1});
    }
    const filterParams = e=> setFilterData(prev=>({...prev,[e.target.name]:e.target.value}))    // (err) { toast.error(err.message); }
    const pageNav = p=> navigate(`/dashboard/deposit/history?status=${status}&user=${user}&txn=${txn}&gateway=${gateway}&type=${type}&fromDate=${fromDate}&toDate=${toDate}&limit=${limit}&page=${p}`)
                      
    return !accesses?.includes('deposit-history')?<Center><p>don't have deposit history permission</p></Center>:<div style={{background:backPrimary,position:'relative'}} onClick={e=>setFailedId(null)}><h4 style={{marginBottom:'6rem'}}>Deposit History</h4>
                {/*!init&&statusRef.current.value=='PENDING' && <div><Button onClick={e=>setInit(true)}>Add Tnx</Button></div>*/}
                {/*{selected[0]?<button onClick={e=>deleteInit(selected,deleteTxn)}><FaTrash/></button> :*/}<form onSubmit={filter}>
                <FlexH x='space-between' y='center'>
                    <Field value={filterData.limit} name='limit' min='10' max='100' x='5' onChange={filterParams}/>
                    <div style={{minWidth:'5rem',height:'auto'}}>
                    <Field x='8' value={filterData.user} name='user' placeholder='user' list='levels' onChange={filterParams}/>
                    <datalist id='levels'>{appData?.userLevels?.map(l=><option key={l.name} value={l.name}/>)}</datalist>
                    </div>
                    <div style={{minWidth:'5rem',height:'auto'}}>
                    <Field x='8' value={filterData.txn} name='txn' placeholder='txn' onChange={filterParams}/></div>
                    <div> <Field x='8' name='gateway' value={filterData.gateway} list='mbanks' placeholder='gateway' onChange={filterParams}/>
                    <datalist id='mbanks'>{appData?.mbanks.map((mb,i)=> <option key={i} value={mb.name}/>)}</datalist></div>
                    {/*<div>  <Field x='8' list='types' name='type' placeholder='type' value={filterData.type} onChange={filterParams}/>
                    <datalist id='types'>{balanceTypes.map((mb,i)=> <option key={i} value={mb}/>)}</datalist></div>*/}
                    <div style={{minWidth:'5rem',height:'auto'}}>
                        {/*<label htmlFor="from">from</label><br/>*/}<DatePicker  type='date' value={filterData.fromDate} name='fromDate' min={launchDate} max={getCurrentLocalDate()} onChange={filterParams}/>
                        {/*<label htmlFor="to">to</label><br/>*/}<DatePicker  type='date' value={filterData.toDate} name='toDate' min={launchDate} max={getCurrentLocalDate()} onChange={filterParams}/>
                    </div>
                    <div><Select value={filterData.status} name='status' onChange={filterParams}  /*onChange={e=>setStatus(e.target.value){cache[e.target.value]?setDepositHistory(cache[e.target.value]):fetchDepositHistory(e.target.value)}}*/ >
                            <option value='pending'>Pending</option>
                            <option value='success'>Success</option>
                            <option value='failed'>Failed</option>
                        </Select>
                    </div><button type='submit'>filter</button>
                    </FlexH> 
                </form>
            {/*init&& <Form>
                <Form.Group>
                    <Form.Control type="text" placeholder="Ref" />
                    <Form.Control.Feedback>{errors?.ref }</Form.Control.Feedback>
                </Form.Group>
                <Form.Group>
                    <Form.Control type="text" placeholder="Username" />
                        <Form.Control.Feedback>{errors?.username }</Form.Control.Feedback>
                </Form.Group>
                <Form.Group>
                    <Form.Control type="text" placeholder="Transaction ID" />
                    <Form.Control.Feedback>{errors?.txn }</Form.Control.Feedback>
                </Form.Group>
                <Form.Group>
                    <Form.Control type="number" placeholder="Transaction Amount" />
                    <Form.Control.Feedback>{errors?.amount }</Form.Control.Feedback>
                </Form.Group>
                <Form.Group>
                    <Form.Control type="number" placeholder="Admin PIN" />
                    <Form.Control.Feedback>{errors?.adminPIN }</Form.Control.Feedback>
                </Form.Group></Form>*/}
            <ScrollViewV style={{width:'100%',height:'80%',marginTop:'4rem'}}>
            <ScrollViewH style={{width:'100%'}}>
                {/*<thead><tr>{fields.map((f,i)=> <th key={i}>{f}</th>)}</tr></thead><tbody>*/}
                {data?.deposits?.map(({_id,updatedAt,txn,screenshot,user,amount,extra,status,gateway})=> <StripedList style={{width:isMobile?'64rem':'87rem',fontSize:'1.2rem'}} key={_id}/*onMouseDown={e=>start(_id)} onMouseUp={clear} onMouseLeave={clear} onTouchStart={e=>start(_id)} onTouchEnd={clear} onTouchCancel={clear} style={{marginBottom:'1rem'}}*/ >
                    <div style={{width:'25%'}} onMouseOver={e=>setHovered(true)} onMouseOut={e=>setHovered(false)}>{hovered?formatDistanceToNow(updatedAt,{addSuffix:true}): getLocalDateTimeFromUTC(updatedAt)}</div>
                    <div style={{width:'20%'}}>{user}</div>
                    <FlexH y='center' style={{width:'30%'}}><TinyIcon src={mbankIcons[gateway]}/><GapH x='0.5'/>{txn||(screenshot&&<TinyIcon src={screenshot} onClick={e=>window.open(screenshot)}/>)}</FlexH>
                    {/*<div style={{width:'15%'}}>{balanceType}</div>*/}
                    <div style={{width:'15%'}}>&#2547;{amount} {/*<small>({extra})</small>*/}</div>
                    {/*<td>{billMonth}</td>
                    <td>{username}</td>*/}
                    {status=='PENDING'&&<div style={{width:'10%',position:'relative'}}>
                        <ApproveButton  onClick={e=>onSuccess(_id,user)}>OK</ApproveButton><RejectButton  onClick={e=>{e.stopPropagation();setFailedId(_id)}}>Reject</RejectButton>
                        {failedId==_id&&<Reject belong={{id:_id,user}} handleFailed={onFailed}/>}
                            
                            
                            
                        
                    </div>}
                </StripedList>)}{/*</tbody>*/}</ScrollViewH>
                </ScrollViewV>
            {data?.pagination?.totalPage>1 && <PaginationBar><Pages totalPage={data?.pagination?.totalPage} currentPage={data?.pagination?.currentPage} changePage={e=>pageNav(e)}/></PaginationBar>}
            {loading&&<Loader><Spinner/></Loader>}  
        </div>
}
