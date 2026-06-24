import {useEffect,useState,} from 'react';
import {useNavigate,useSearchParams,} from 'react-router-dom';
import {toast} from 'react-toastify';
import {formatDistanceToNow} from 'date-fns';
import {useMediaQuery} from 'react-responsive';
import {balanceTypes} from '../../../Preferences.json'
import {useTheme} from '../../contexts/ThemeContext'
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {useNotification} from '../../contexts/NotificationContext';
import {useSocket} from '../../contexts/SocketContext'
import {FlexH,ScrollViewV,ScrollViewH,StripedList,Field,DatePicker,Select,TinyIcon,ApproveButton,RejectButton,PaginationBar,Center,Loader,Spinner} from '../../components/styles/Admin.style';
import {launchDate,getCurrentLocalDate,getLocalDateTimeFromUTC} from '../../utils/date';
import {fetchObject} from '../../hooks/useFetch'
import Pages from '../../components/Pagination'
import AdminPIN from '../../components/AdminPIN';
import Reject from '../../components/Reject' 
import url from '../../config/url';
            
                

export default  () =>{
    const navigate = useNavigate();
    const isMobile = useMediaQuery({maxWidth:768})
    const {appData,admin} = useAdminAuth();
    const accesses = admin?.accesses
    const {socket} = useSocket();
    const {thememode,themeData:{themeBackground},modeData:{backPrimary,backSecondary}} = useTheme();
    const {reducePendingCounts} = useNotification();
    const [searchParams] = useSearchParams()
    const [loading,setLoading] = useState(false)
    const [hovered,setHovered] = useState(false)
    const [failedId,setFailedId] = useState()
    const [status,user,search,gateway,from,to,limit,page] = [searchParams.get('status')||'pending',searchParams.get('user')||'',searchParams.get('search')||'',searchParams.get('gateway')||'',searchParams.get('from')||'',searchParams.get('to')||'',searchParams.get('limit')||'20',searchParams.get('page')||'1'];

    let [filterTerm,setFilterTerm]=useState({status,user,search,gateway,from,to,limit,page});
    let errorlist = {width:'100%',marginBottom:'1.5rem'} //Date()).toISOString().split('T')[0]
    const mbankIcons = appData?.mbanks ? Object.fromEntries(appData.mbanks.map(item=>[item.name,item.icon])) :{};
    const msg = 'You don\'t have modify permission'
    const hasAccess = accesses?.includes('modify-withdraw-history')
    const {data} = fetchObject(`${url.urlWithdrawHistory}?status=${status.toUpperCase()}&gateway=${gateway}&user=${user}&search=${search}&from=${from}&to=${to}&limit=${limit}&page=${page}`)  ;

    useEffect(()=>{
        reducePendingCounts('withdraw')
        navigate(`/dashboard/withdraw/history?status=${status}&gateway=${gateway}&user=${user}&search=${search}&from=${from}&to=${to}&limit=${limit}&page=1`)
    }, [])
    
    useEffect(()=>{
        if(admin) socket.emit('admin:withdraw-history:seen',admin?.id)
    }, [admin])
    
    useEffect(()=>{
        setFilterTerm ({status,user,search,gateway,from,to,limit,page});
    },[status,user,search,gateway,from,to,limit]);
    
    const onSuccess = (id) => 
        AdminPIN([thememode,themeBackground],{cb:changeStatus,data:{id,status:'SUCCESS'}},'OK')
                          if(!hasAccess) {toast.info(msg);return}
    }
    const onFailed = (id,feedback) => {
        setFailedId(null);
           if(!hasAccess) {toast.info(msg);return}
        AdminPIN([thememode,themeBackground],{cb:changeStatus,data:{id,status:'FAILED',feedback}},'REJECT')
    }
    const changeStatus = async ({id,status,feedback},pin)=>{
                       if(!hasAccess) {toast.info('you don\'t have modify permission');return}
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
        navigate(`/dashboard/withdraw/history?status=${e.target.status.value}&user=${e.target.user.value.trim()}&gateway=${e.target.gateway.value.trim()}&search=${e.target.search.value.trim()}&from=${e.target.fromDate.value}&to=${e.target.toDate.value}&limit=${e.target.limit.value.trim()}&page:1`);
    }
    const filterParams = e=> setFilterTerm(prev=>({...prev,[e.target.name]:e.target.value}))
    const pageNav = p=> navigate(`/dashboard/withdraw/history?status=${status}&user=${user}&gateway=${gateway}&search=${search}&from=${from}&to=${to}&limit=${limit}&page=${p}`)

    return !accesses?.includes('withdraw-history')?<Center><p>Don't have withdraw history permission</p></Center>:<div style={{background:backPrimary,position:'relative'}} onClick={e=>setFailedId(null)}><h4 style={{marginBottom:'4rem'}}>Withdraw History</h4>
                <form onSubmit={filter}>
                <FlexH x='space-between' y='center'>
                    <Field value={filterTerm.limit} name='limit' min='10' max='100' x='5' onChange={filterParams}/>
                    <div style={{minWidth:'5rem',height:'auto'}}>
                    <Field x='8' value={filterTerm.user} name='user' placeholder='user' list='levels' onChange={filterParams}/>
                    <datalist id='levels'>{appData?.userLevels?.map(l=><option key={l.name} value={l.name}/>)}</datalist>
                    </div>
                    <div style={{minWidth:'5rem',height:'auto'}}>
                    <Field x='8' value={filterTerm.search} name='search' placeholder='search' onChange={filterParams}/></div>
                    <div> <Field x='8' name='gateway' value={filterTerm.gateway} list='mbanks' placeholder='gateway' onChange={filterParams}/>
                    <datalist id='mbanks'>{appData?.mbanks.map(({_id,name})=> <option key={_id} value={name}/>)}</datalist></div>
                    {/*<div>  <Field x='8' list='types' name='type' placeholder='type' value={filterTerm.type} onChange={filterParams}/>
                    <datalist id='types'>{balanceTypes.map((mb,i)=> <option key={i} value={mb}/>)}</datalist></div>*/}
                    <div style={{minWidth:'5rem',height:'auto'}}>
                        <DatePicker  type='date' value={filterTerm.from} name='fromDate' min={launchDate} max={getCurrentLocalDate()} onChange={filterParams}/>
                        <DatePicker  type='date' value={filterTerm.to} name='toDate' min={launchDate} max={getCurrentLocalDate()} onChange={filterParams}/>
                    </div>
                    <div><Select value={filterTerm.status} name='status' onChange={filterParams} >
                            <option value='pending'>Pending</option>
                            <option value='success'>Success</option>
                            <option value='failed'>Failed</option>
                        </Select>
                    </div><button type='submit'>filter</button>
                    </FlexH> 
                </form>
                <ScrollViewV style={{width:'100%',height:'80%',marginTop:'4rem',fontSize:'1.2rem'}}>
                    <ScrollViewH style={{width:'100%'}}>
                        {data?.withdraws?.map(({_id,updatedAt,ref,user,amount,status,gateway},i)=> <StripedList  key={_id} style={{width:isMobile?'64rem':'87rem'}} >
                            <div style={{width:'25%'}} onMouseOver={e=>setHovered(true)} onMouseOut={e=>setHovered(false)}>{hovered?formatDistanceToNow(updatedAt,{addSuffix:true}): getLocalDateTimeFromUTC(updatedAt)}</div>
                            <div style={{width:'25%'}}>{ref||user?.username}</div>
                            <div style={{width:'25%'}}><TinyIcon src={mbankIcons[gateway]}/> {gateway}</div>
                    {/*<div style={{width:'15%'}}>{balanceType}</div>*/}
                            <div style={{width:'15%'}}>{Object.values(amount|| {}).reduce((sum,val)=>sum+val,0)} {/*<small>({extra})</small>*/}</div>
                            {status=='PENDING'&&<div style={{width:'10%',position:'relative'}}>
                        <ApproveButton disabled={!hasAccess} onClick={e=>onSuccess(_id)}>OK</ApproveButton><RejectButton disabled={!hasAccess} onClick={e=>{e.stopPropagation();setFailedId(_id)}}>Reject</RejectButton>
                        {failedId==_id&&<Reject belong={{id:_id,user}} handleFailed={onFailed}/>}
                            </div>}
                        </StripedList>)}
                    </ScrollViewH>
                </ScrollViewV>
            {data?.pagination?.totalPage>1 && <PaginationBar><Pages totalPage={data?.pagination?.totalPage} currentPage={data?.pagination?.currentPage} changePage={p=>pageNav(p)}/></PaginationBar>}
            {loading&&<Loader><Spinner/></Loader>}  
        </div>
}
