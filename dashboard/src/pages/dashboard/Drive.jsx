import {useEffect,useState} from 'react'
import {useNavigate,useSearchParams} from 'react-router-dom'
import {toast} from 'react-toastify';
import {useMediaQuery} from 'react-responsive';
import {formatDistanceToNow} from 'date-fns';
import {useTheme} from '../../contexts/ThemeContext';
import {useSocket} from '../../contexts/SocketContext'
import {useNotification} from '../../contexts/NotificationContext';
import {useAdminAuth} from '../../contexts/AdminAuthContext';
import {useTelecom} from '../../contexts/TelecomContext';
import {ScrollViewV,ScrollViewH,FlexH,GapH,Center,StripedList,Field,Select,DatePicker,ApproveButton,RejectButton,TinyIcon,PaginationBar,Loader,Spinner, } from '../../components/styles/Admin.style';
import {launchDate,getCurrentLocalDate,getLocalDateTimeFromUTC} from '../../utils/date';
import {fetchObject} from '../../hooks/useFetch'
import url from '../../config/url'
import copyToClipboard from '../../utils/copyToClipboard'
import Pages from '../../components/Pagination';
import AdminPIN from '../../components/AdminPIN';
import Reject from '../../components/Reject'   

export default () => {
    const isMobile = useMediaQuery({maxWidth:768})
    const {admin} = useAdminAuth()
    const accesses = admin?.accesses
    const navigate = useNavigate()
    const {telecoms,icons} = useTelecom();
    const {socket} = useSocket()
    const {thememode,modeData,themeData:{themeBackground}} = useTheme();
    const {pendingCounts:{drive},reducePendingCounts} = useNotification();
    const [searchParams] = useSearchParams()
    const [status,user,telecom,recipient,fromDate,toDate,limit,page] = [searchParams.get('status')||'pending',searchParams.get('user')||'',searchParams.get('telecom')||'',searchParams.get('recipient')||'',searchParams.get('fromDate')||'',searchParams.get('toDate')||'',searchParams.get('limit')||'20',searchParams.get('page')||'1']  ;
    const errorlist = {width:'100%',marginBottom:'1.5rem'}  ;
         
    const [hovered,setHovered] = useState(false);
    //const [hitData, setHitData] = useState({hits:[],pagination:{limit:20,currentPage:1,totalPage:1}});
    const [loading, setLoading] = useState(false);
    const [ID, setID] = useState(null);const [failedID,setFailedID] = useState(null);
    //let today = (new Date()).toISOString().split('T')[0];
    let [filterTerm,setFilterTerm]= useState({status,telecom,user,fromDate,toDate,recipient,limit,page})
    let hasAccess = accesses?.includes('modify-drive-history')
    const {data} = fetchObject(`${url.urlDriveHit}?status=${status.toUpperCase()}&telecom=${telecom}&user=${user}&recipient=${recipient}&to=${toDate}&from=${fromDate}&page=${page}&limit=${limit}`)  

    useEffect(e=>{
        reducePendingCounts('drive')
        navigate(`/dashboard/drive/history?status=${status}&recipient=${recipient}&user=${user}&telecom=${telecom}&from=${fromDate}&to=${toDate}&limit=${limit}&page=${p}`);//document.addEventListener('click',e=>{if(failedID)setFailedID(null)})
    },[]);
    useEffect(e=>{
        setFilterTerm({status,telecom,user,fromDate,toDate,recipient,limit,page})       //<td>{}</td>
    }, [status,telecom,user,recipient,fromDate,toDate,limit,page])
    useEffect(()=>{
        //filterTerm = {status:'PENDING',telecom:form.telecom.value,user:form.user.value,fromDate:form['from-date'].value,toDate:form['to-date'].value,recipient:form.recipient.value,limit:20}
        if(admin) socket.emit('admin:drive-history:seen',admin?.id)
    },[admin]);
    
    const fetchDriveHits = async (/*{page}*/)=>{
        setLoading(true)
        try{
            let res = await fetch(`${url.urlDriveHit}?status=${status.toUpperCase()}&telecom=${telecom}&user=${user}&recipient=${recipient}&to=${toDate}&from=${fromDate}&page=${page}&limit=${limit}`,{credentials: 'include'})
            let data = await res.json();
            if(!res.ok) throw new Error(data.error || 'failed')
            //setHitData(data/*hits.map(i=> ({...i,selected:false}))*/)
            //if(data.length)cache[statusRef.current.value] = data;setDrives(cache[statusRef.current.value])
        }catch(e){toast.error(e.message)}
        finally{setLoading(false)}
    };

    const changeStatus = async ({id,status,feedback},pin) =>{
        if(!accesses?.includes('modify-drive-history')) {toast.info('you don\'t have modify permission');return}
        try{
            let res = await fetch(
                `${url.urlDriveHit}/${id}`,
                {
                    method: 'PATCH',
                    credentials: 'include',headers:{'Content-Type':'application/json','x-admin-pin':pin},
                    body: JSON.stringify({status,feedback})
                }
            )
            let data = await res.json();
            if(!res.ok) throw new Error(data.error || 'failed')
            //let moved = cache['pending'].splice(cache['pending'].findIndex(i=>i.id===hitId),1)[0]
            //if(cache[status]) cache[status].unshift(moved)
            /*setHitData(cache['pending'])*///setHitData(data);setID(null)
        }catch(e){toast.error(e.message)}
        finally{setLoading(false)}
    }
    const onSuccess = (id) => AdminPIN([thememode,themeBackground],{cb:changeStatus,data:{id,status:'SUCCESS'}},'OK')
    const onFailed = async (id,feedback)=>{
        setFailedID(null)
        AdminPIN([thememode,themeBackground],{cb:changeStatus,data:{id,status:'FAILED',feedback}},'REJECT')
    }
        
        /*try{
            await navigator.clipboard.writeText(`${operator} ${recipient}\n${pack}`) 
            toast.success('copied to clipboard')
        }catch(err) { toast.error('failed to copy to clipboard') }
    };*/
    const filter = (e)=> {
        e.preventDefault();
        let form=e.target
        navigate(`/dashboard/drive/history?status=${form.status.value.trim()}&telecom=${form.telecom.value.trim()}&user=${form.user.value.trim()}&recipient=${form.recipient.value.trim()}&from=${form.fromDate.value}&to=${form.toDate.value}&limit=${form.limit.value.trim()||'20'}&page=1`);//fetchDriveHits({page:1})
            /*for(let j in filterObj){
                if(!d[j].includes(filterObj[j]))return false;}
            if(fromDateRef.current.value && d.createdAt<fromDateRef.current.value)return false;
            if(toDateRef.current.value && d.createdAt>toDateRef.current.value)return false;
            return true;
        });setHits(filtered)*/
    }
    const filterParams = e=> setFilterTerm(prev=>({...prev,[e.target.name]:e.target.value}))
    const pageNav = p=> navigate(`/dashboard/drive/history?status=${status}&recipient=${recipient}&user=${user}&telecom=${telecom}&from=${fromDate}&to=${toDate}&limit=${limit}&page=${p}`)

                  
                  
    return !accesses?.includes('drive-history')?<Center><p>don't have drive history permission</p></Center>:<div style={{position:'relative'/*, color:textPrimary*/}}>
       <div><h4 style={{marginBottom:'4rem'}}>Drive</h4>{/*<IconButton style={{float: 'right'}}><BsPrinter/></IconButton>*/}</div>
        <form  onSubmit={filter}>
            <FlexH x='space-between' style={{gap:'0.5rem'}}>
                     <Field value={filterTerm.limit} name='limit' x='5' min='10' max='100' onChange={filterParams}/>
                <Field x='8' name='user' placeholder='username' value={filterTerm.user} onChange={filterParams}/> <Field   x='8' name='recipient' placeholder='recipient' value={filterTerm.recipient} onChange={filterParams}/>
                   
                <Field x='8' name='telecom' value={filterTerm.telecom} placeholder='telecom' list='telecoms' onChange={filterParams}/><datalist id='telecoms'>{telecoms?.map(({name},i)=> <option key={i} value={name}/>)}</datalist>
                <div><DatePicker  type='date' value={filterTerm.fromDate} name='fromDate' max={getCurrentLocalDate()} min={launchDate} onChange={filterParams}/><DatePicker  type='date' value={filterTerm.toDate} name='toDate' max={getCurrentLocalDate()} min={launchDate} onChange={filterParams}/></div>
                    {/*<Button onClick={filter}>filter</Button>*/}
                    <Select  name='status' value={filterTerm.status} onChange={filterParams} /*onChange={e=>{cache[e.target.value]?setHits(cache[e.target.value]):fetchDriveHits()}}*/>
                        <option value='pending'>Pending</option>
                        <option value='success'>Success</option>
                        <option value='failed'>Failed</option>
                    </Select>
                
                <button type='submit'>filter</button>
            </FlexH>
        </form>
        <ScrollViewV style={{width:'100%',height:'80%',marginTop:'4rem'}}>
            <ScrollViewH style={{width:'100%'}}>
                {/*<tr>*/}
                    {/* <th><input type='checkbox' name='' id='' /></th> */}
                    {/*fields.map(f=> <th>{f}</th>)</tr>*/}
                
                {data?.hits?.map(({_id,updatedAt,drive,recipient,user,status})=> <StripedList style={{width:isMobile?'64rem':'87rem',fontSize:'1.2rem'}}  key={_id}>
                    <div style={{width:'20%'}} onMouseOver={e=>setHovered(true)} onMouseOut={e=>setHovered(false)}>{hovered?formatDistanceToNow(updatedAt,{addSuffix:true}):getLocalDateTimeFromUTC(updatedAt)}</div>
                    {/*<td><Button></Button><Button onClick={} id=''> </Button></td>*/}
                    <div style={{width:'15%'}}><TinyIcon src={icons[drive.operator]}/><GapH x='0.5'/>{recipient} </div>
                    <div style={{width:'33%'}} onClick={e=>copyToClipboard(`${drive.operator} ${recipient} ${drive.title}`)}>{drive.title}</div>
                    {/*<div>{drive.title}</div>*/}
                    <div style={{width:'10%'}}>{drive.price-drive.commission}</div>
                    <div style={{width:'12%'}}>{user?.username}</div>
                    {status=='PENDING' && <div style={{width:'10%',position:'relative'}}><ApproveButton disabled={!hasAccess} onClick={e=>onSuccess(_id)}>OK</ApproveButton><RejectButton disabled={!hasAccess} onClick={e=>{e.stopPropagation();setFailedID(_id);setID({id:_id,user})}}>Reject</RejectButton>
                        {failedID==_id && <Reject belong={{id:_id,user}} handleFailed={onFailed}/>}
                              
                                  
                                  
                                  
                            
                        
                    </div>}
                    {/*<td>{}</td>*/}
                </StripedList>)}
            </ScrollViewH></ScrollViewV>
        {data?.pagination?.totalPage>1 && <PaginationBar><Pages totalPage={data?.pagination?.totalPage} currentPage={data?.pagination?.currentPage} changePage={e=>pageNav(e)} /></PaginationBar>}
        {loading&&<Loader><Spinner/></Loader>}  
    </div>
}
