import {useEffect,useState,} from 'react';
import {useNavigate,useSearchParams,} from 'react-router-dom';
import {toast} from 'react-toastify';
import {formatDistanceToNow} from 'date-fns';
import {FaCheck} from 'react-icons/fa';
import {balanceTypes} from '../../../Preferences.json'
import {FlexH,ScrollViewV,ScrollViewH,StripedList,Field,DatePicker,Select,TinyIcon,ApproveButton,RejectButton,PaginationBar,Center,Loader,Spinner} from '../../components/styles/Admin.style';
import {useTheme} from '../../contexts/ThemeContext'
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {useNotification} from '../../contexts/NotificationContext';
import {useSocket} from '../../contexts/SocketContext'
import {launchDate,getCurrentLocalDate,getLocalDateTimeFromUTC} from '../../utils/date';
import Pages from '../../components/Pagination'
import useFetch from '../../hooks/useFetch'
import AdminPIN from '../../components/AdminPIN';
import Reject from '../../components/Reject' 
import url from '../../config/url';

export default  () =>{
    const navigate = useNavigate();
    const {appData,admin} = useAdminAuth();
    const accesses = admin?.accesses
    const {socket} = useSocket();
    const {thememode,themeData:{themeBackground},modeData:{backPrimary,backSecondary}} = useTheme();
    const {reducePendingCounts} = useNotification();
    const [searchParams] = useSearchParams()
    const [loading,setLoading] = useState(false)
    const [hovered,setHovered] = useState(false)
    const [failedId,setFailedId] = useState()
    const [status,user,search,gateway,fromDate,toDate,limit,page] = [searchParams.get('status')||'pending',searchParams.get('user')||'',searchParams.get('search')||'',searchParams.get('gateway')||'',searchParams.get('fromDate')||'',searchParams.get('toDate')||'',searchParams.get('limit')||'20',searchParams.get('page')||'1'];

    const mbankIcons = appData?.mbanks ? Object.fromEntries(appData.mbanks.map(item=>[item.name,item.icon])) :{};
    let [filterData,setFilterData]=useState({status,user,search,gateway,fromDate,toDate,limit,page});
    let errorlist = {width:'100%',marginBottom:'1.5rem'} //Date()).toISOString().split('T')[0]
    const {data} = useFetch(`${url.urlWithdrawHistory}?status=${status.toUpperCase()}&gateway=${gateway}&user=${user}&search=${search}&from=${fromDate}&to=${toDate}&limit=${limit}&page=${page}`)  ;

    useEffect(()=>{
        reducePendingCounts('withdraw')
        navigate(`/dashboard/withdraw/history?status=${status}&gateway=${gateway}&user=${user}&search=${search}&fromDate=${fromDate}&toDate=${toDate}&limit=${limit}&page=1`)
    }, [])
    
    useEffect(()=>{
        if(admin) socket.emit('admin:withdraw-history:seen',admin?.id)
    }, [admin])
    
    useEffect(()=>{
        setFilterData ({status,user,search,gateway,fromDate,toDate,limit,page});
    },[status,user,search,gateway,fromDate,toDate,limit]);
    
    const onSuccess = (id) => AdminPIN([thememode,themeBackground],{cb:changeStatus,data:{id,status:'SUCCESS'}},'OK')
    const onFailed = (id,feedback) => {
        setFailedId(null);
        AdminPIN([thememode,themeBackground],{cb:changeStatus,data:{id,status:'FAILED',feedback}},'REJECT')
    }
    const changeStatus = async ({id,status,feedback},pin)=>{
                            
                       if(!accesses?.includes('modify-withdraw-history')) {toast.info('you don\'t have modify permission');return}
        setLoading(true)
        try{
            let res = await fetch(`${url.urlWithdraw}/${id}`,{
                method: 'PATCH',
                credentials: 'include',
                headers: {'Content-Type':'application/json','x-admin-pin':pin},
                body: JSON.stringify({status,feedback})
            })
            let data = await res.json()
            if(!res.ok) throw new Error(data.error||'failed to change status')
            toast.success(data.message);//fetchWithdrawHistory()
        }catch(e) {toast.error(e.message)}
        finally{setLoading(false)}
    }
    
    const filter = (e) =>{e.preventDefault()
        navigate(`/dashboard/withdraw/history?status=${e.target.status.value}&user=${e.target.user.value.trim()}&gateway=${e.target.gateway.value.trim()}&search=${e.target.search.value.trim()}&fromDate=${e.target.fromDate.value}&toDate=${e.target.toDate.value}&limit=${e.target.limit.value.trim()}&page:1`);
    }
    const filterParams = e=> setFilterData(prev=>({...prev,[e.target.name]:e.target.value}))
    const pageNav = p=> navigate(`/dashboard/withdraw/history?status=${status}&user=${user}&gateway=${gateway}&search=${search}&fromDate=${fromDate}&toDate=${toDate}&limit=${limit}&page=${p}`)

    return !accesses?.includes('withdraw-history')?<Center><p>don't have withdraw history permission</p></Center>:<div style={{background:backPrimary,position:'relative'}} onClick={e=>setFailedId(null)}><h4 style={{marginBottom:'4rem'}}>Withdraw History</h4>
                <form onSubmit={filter}>
                <FlexH x='space-between' y='center'>
                    <Field value={filterData.limit} name='limit' min='10' max='100' x='5' onChange={filterParams}/>
                    <div style={{minWidth:'5rem',height:'auto'}}>
                    <Field x='8' value={filterData.user} name='user' placeholder="user" list='levels' onChange={filterParams}/>
                    <datalist id='levels'>{appData?.userLevels?.map(l=><option key={l.name} value={l.name}/>)}</datalist>
                    </div>
                    <div style={{minWidth:'5rem',height:'auto'}}>
                    <Field x='8' value={filterData.search} name='search' placeholder='search' onChange={filterParams}/></div>
                    <div> <Field x='8' name='gateway' value={filterData.gateway} list='mbanks' placeholder='gateway' onChange={filterParams}/>
                    <datalist id='mbanks'>{appData?.mbanks.map(({_id,name})=> <option key={_id} value={name}/>)}</datalist></div>
                    {/*<div>  <Field x='8' list="types" name='type' placeholder="type" value={filterData.type} onChange={filterParams}/>
                    <datalist id="types">{balanceTypes.map((mb,i)=> <option key={i} value={mb}/>)}</datalist></div>*/}
                    <div style={{minWidth:'5rem',height:'auto'}}>
                        <DatePicker  type='date' value={filterData.fromDate} name='fromDate' min={launchDate} max={getCurrentLocalDate()} onChange={filterParams}/>
                        <DatePicker  type='date' value={filterData.toDate} name='toDate' min={launchDate} max={getCurrentLocalDate()} onChange={filterParams}/>
                    </div>
                    <div><Select value={filterData.status} name='status' onChange={filterParams} >
                            <option value='pending'>Pending</option>
                            <option value='success'>Success</option>
                            <option value='failed'>Failed</option>
                        </Select>
                    </div><button type='submit'>filter</button>
                    </FlexH> 
                </form>
            
            
                <ScrollViewV style={{width:'100%',height:'80%',marginTop:'4rem',fontSize:'1.3rem'}}>
                    <ScrollViewH style={{width:'100%'}}>
                        {data?.withdraws?.map(({_id,updatedAt,ref,user,amount,status,gateway},i)=> <StripedList  key={_id} style={{width:'87rem'}} >
                            <div style={{width:'25%'}} onMouseOver={e=>setHovered(true)} onMouseOut={e=>setHovered(false)}>{hovered?formatDistanceToNow(updatedAt,{addSuffix:true}): getLocalDateTimeFromUTC(updatedAt)}</div>
                            <div style={{width:'25%'}}>{ref||user?.username}</div>
                            <div style={{width:'25%'}}><TinyIcon src={mbankIcons[gateway]}/> {gateway}</div>
                    {/*<div style={{width:'15%'}}>{balanceType}</div>*/}
                            <div style={{width:'15%'}}>{Object.values(amount|| {}).reduce((sum,val)=>sum+val,0)} {/*<small>({extra})</small>*/}</div>
                            {status=='PENDING'&&<div style={{width:'10%',position:'relative'}}>
                        <ApproveButton disabled={!accesses?.includes('modify-withdraw-history')} onClick={e=>onSuccess(_id)}>OK</ApproveButton><RejectButton disabled={!accesses?.includes('modify-withdraw-history')} onClick={e=>{e.stopPropagation();setFailedId(_id)}}>Reject</RejectButton>
                        {failedId==_id&&<Reject belong={{id:_id,user}} handleFailed={onFailed}/>}
                            </div>}
                        </StripedList>)}
                    </ScrollViewH>
                
                </ScrollViewV>
            {data?.pagination?.totalPage>1 && <PaginationBar><Pages totalPage={data?.pagination?.totalPage} currentPage={data?.pagination?.currentPage} changePage={p=>pageNav(p)}/></PaginationBar>}
            {loading&&<Loader><Spinner/></Loader>}  
        </div>
}
