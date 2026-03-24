import React,{useEffect,useState,useRef} from 'react';
import {useNavigate,useSearchParams,} from 'react-router-dom';
import {toast} from 'react-toastify';
import {FaTrash} from 'react-icons/fa'
import {formatDistanceToNow} from 'date-fns';
//import {MdPending} from 'react-icons/md'
import url from '../../config/url';
import {useTheme} from '../../contexts/ThemeContext'
import {validateTxn} from '../../utils/validate'
import Pages from '../../components/Pagination'
import {FlexH,FlexV,ScrollViewV,GapV,Field,InputField,ErrorText,DatePicker,TinyIcon,ThemeButton,IconButton,TR,Loader,Spinner,PaginationBar} from '../../components/styles/Admin.style';
//import Dashboard from './Dashboard';
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import useLongPress from '../../hooks/longPress'
import AdminPIN from '../../components/AdminPIN'
const txnFields=['Date','TxnId','User','Message'];

export default  () =>{
        const navigate = useNavigate()
        const [searchParams] = useSearchParams()  //
        const {appData,admin} = useAdminAuth()
        const accesses = admin?.accesses 
        const status = searchParams.get('status') || 'pending';
        const user = searchParams.get('user') || '';
        const txn = searchParams.get('txn') || '';
        const gateway = searchParams.get('gateway') || '';
        const fromDate = searchParams.get('fromDate') || '';
        const toDate = searchParams.get('toDate') || '';
        const limit = searchParams.get('limit') || '20';
        const page = searchParams.get('page') || '1';
    const [userRef,gatewayRef,txnRef,toDateRef,fromDateRef]=[useRef(null),useRef(null),useRef(null),useRef(null),useRef(null)]
        const [txnReports, setTxnReports] = useState({depositInits:[],pagination:{totalPage:1,currentPage:1,limit:20}});
        const [selected, setSelected] = useState([]);
        const [loading, setLoading] = useState(true);
        const [init, setInit] = useState(false);
        const [errors, setErrors] = useState({});
        const {themeData, modeData} = useTheme()
        const mbankIcons = appData?.mbanks ? Object.fromEntries(appData.mbanks.map(item=> [item.name,item.icon])) : {}
        let [filterData,setFilterData] = useState({status,txn,user,gateway,fromDate,toDate,limit,page})
        const {backPrimary,textPrimary} = modeData
        const check = (id)=>{
            let i=selected.indexOf(id)
            if(0<=i){setSelected(prev=> prev.filter(i=>i!=id))}
            else{setSelected(prev=> [...prev,id]);}
        };
        const {start,clear} = useLongPress(check/*(id,row)=>{check(id,row)},1000*/)
        const onClickOrHold = (id)=>{
            if(selected[0]) check(id)
            else{start(id)}
        };
        useEffect(() =>{
            fetchTxn(/*{page:1}*/)
            setFilterData({status,txn,user,gateway,fromDate,toDate,limit,page})
        },[status,txn,user,gateway,toDate,fromDate,limit,page])
        const fetchTxn= async (/*{page}*/) =>{
            setLoading(true)
            try {
                let res=await fetch(
                    `${url.urlDepositInit}?status=${status.toUpperCase()}&txn=${txn}&user=${user}&gateway=${gateway}&to=${toDate}&from=${fromDate}&limit=${limit}&page=${page}`,
                    {credentials:'include'}
                )
                let data=await res.json()
                if(!res.ok) throw new Error(data.error||'Error Fetching Data')
                setTxnReports(data);
            }catch(err) {toast.error(err.message);/*setServerError(true)*/}  
            finally{setLoading(false)}
        }        
        const deleteTxn = async ({ids},pin)=>{
            setLoading(true)
            try{ //res.json())
                let res= await fetch(
                    url.urlDepositInit,
                    {
                        method:'DELETE',
                        headers:{'Content-Type':'application/json','x-admin-pin':pin},
                        body:JSON.stringify(ids)
                    }
                );
                let data= await res.json();
                if(!res.ok) throw new Error(data.error||'Error Fetching Data')
                toast.success(data.message||'Transaction Deleted ');fetchTxn(/*{page:1}*/)
            }catch(err){toast.error(err.message)}
            finally{setLoading(false)}
        }

        const addTxn = async ({formData},pin) =>{
            setLoading(true);
            try{
                const res =await fetch(url.urlDepositInit, {
                    method: 'POST',
                    headers: {'Content-Type':'application/json;','x-admin-pin':pin},// 
                    body: JSON.stringify(formData)
                })
                let data = await res.json()
                if(!res.ok) throw new Error(data.error||'Error adding TXN')
                toast.success(data.message||'Transaction Added Successfully');fetchTxn(/*{page:1}*/)
            }catch(err){toast.error(err.message)}
            finally{setLoading(false)}
        }
        const handleSubmit = async (e) =>{
            e.preventDefault();
            let formData={txn:e.target.txn.value.trim(),amount:parseInt(e.target.amount.value.trim()),user:e.target.user.value.trim()}
            const validationErrors = validateTxn(formData) 
            if(Object.keys(validationErrors).length) return setErrors(validationErrors)//      
            //const data = new FormData(e.target);
            AdminPIN({cb:addTxn,data:formData},'ADD')//const value = Object.fromEntries(data.entries());
        }
        const filter=e=>{
            e.preventDefault();
            navigate(`/dashboard/deposit-init?txn=${e.target.txn.value.trim()}&gateway=${e.target.gateway.value.trim()}&user=${e.target.user.value.trim()}&fromDate=${e.target.fromDate.value}&toDate=${e.target.toDate.value}&limit=${e.target.limit.value.trim()}&page=1`)
        }
        const pageNav = p=> navigate(`/dashboard/deposit-init?txn=${txn}&gateway=${gateway}&user=${user}&limit=${limit}&page=${p}`)
        const markedRowBg = id => selected.includes(String(id))?themeData.themeBackground:''
        const markedRowText = id => selected.includes(String(id))?themeData.themeText:''
        const filterParams = e=> setFilterData(prev=>({...prev,[e.target.name]:e.target.value}))
    const markRow = id=> ({background:markedRowBg(id),color:markedRowText(id)})
                      
                      
                      
                  
                  
                  
                      
        return !accesses?.includes('deposit-init')?<Loader/>:<div style={{background:backPrimary, color:textPrimary}}>
            {init && <form onSubmit={handleSubmit}>
                {/*<Form.Group>
                    <Form.Label>Sender </Form.Label>
                    <Form.Select type="" placeholder="  " name='sender'>
                        {banks.map((b,i)=> <option key={i} value={b}>{b}</option>)}
                    </Form.Select>
                </Form.Group>*/}
                {/*<Form.Group>
                    <Form.Label>Ref </Form.Label>
                    <Form.Control name='ref'/>
                    <Form.Feedback>{errors.ref && errors.ref}</Form.Feedback>
                </Form.Group>*/}
                <FlexV x='flex-start' y='flex-start'>
                    {/*<Form.Label>Transaction ID</Form.Label>*/}
                    <InputField name='txn' placeholder="Transaction ID"/>
                    <ErrorText>{errors?.txn}</ErrorText>
                </FlexV><GapV x='4'/>
                <FlexV x='flex-start' y='flex-start'>
                    <InputField type="number" placeholder="Transaction Amount" name='amount'/>
                    <ErrorText>{errors?.amount }</ErrorText>
                </FlexV><GapV x='4'/>
                <FlexV x='flex-start' y='flex-start'>
                    <InputField placeholder="Username" name='user'/>
                    <ErrorText>{errors?.user }</ErrorText>
                </FlexV><GapV x='6'/>
                {/*<FlexV x='flex-start' y='flex-start'>
                    <Form.Label>Admin PIN</Form.Label>
                    <InputField  placeholder="Admin PIN" />
                    <ErrorText>{errors.adminPIN && errors.adminPIN}</ErrorText>
                </FlexV>*/}
                <FlexH x='flex-end'><button onClick={e=>setInit(false)}>CANCEL</button><ThemeButton  type="submit" disabled={loading}>{loading?<Spinner />:'NEXT'} </ThemeButton></FlexH>
            </form>}
            {/*!init && */}
            {!init && <><FlexH x='flex-end'><ThemeButton  onClick={e=>setInit(true)}>Add Txn</ThemeButton></FlexH>
            <div style={{marginTop:'3rem',marginBottom:'2rem'}}>
                <form onSubmit={filter}><FlexH x='space-between' y='center'>
                <Field x='5' value={filterData.limit} name='limit' onChange={filterParams}/>
                <Field x='8' value={filterData.txn} name='txn' placeholder='txn' onChange={filterParams}/>
                <Field x='8' name='user' placeholder='01***' value={filterData.user} onChange={filterParams}/>  
                <Field x='8' value={filterData.gateway} name='gateway' list="mbanks" placeholder='gateway' onChange={filterParams}/>
                <datalist id='mbanks'>{appData?.mbanks?.map((b,i)=> <option key={i} value={b}/>)}</datalist>
                <div><DatePicker  type="date" name="fromDate" value={filterData.fromDate} onChange={filterParams}/><DatePicker  type="date" name="toDate" value={filterData.toDate} onChange={filterParams}/></div>
                <button type='submit'>filter</button></FlexH>
                </form>
            </div></>}
            {selected[0]&&<FlexH ><IconButton style={{color:'red'}} onClick={e=>AdminPIN({cb:deleteTxn,data:{ids:selected}},'DELETE')}><FaTrash/></IconButton></FlexH>}
            <ScrollViewV style={{width:'100%',height:'80%'}}><table>
                {/*<thead><tr>{txnFields.map((f,i)=> <th key={i}>{f}</th>)}</tr></thead>*/}
                <tbody>
                {txnReports.depositInits.map(({_id,createdAt,txn,gateway, amount, user, message, status,})=> <TR  key={_id} onMouseDown={e=>onClickOrHold(String(_id))} onMouseUp={clear} onMouseLeave={clear} /*onTouchStart={e=>start(_id,e.target)}*/ onTouchEnd={clear} onTouchCancel={clear} /*onClick={e=>{selected[0] &&check(_id)}}*/style={markRow(_id)}>
                    <td style={{width:'15%'}}>{formatDistanceToNow(createdAt)}</td>
                    <td style={{width:'20%'}}><TinyIcon src={mbankIcons[gateway]}/>{txn}</td>
                    <td style={{width:'10%'}}>{amount}</td>
                    <td style={{width:'10%'}}>{user}</td>
                    <td style={{width:'45%'}}>{message}</td>
                    {/*<td>{status=='SUCCESS'?<FaCheck/>:<MdPending/>}</td>*/}
                    <td style={{width:'5%'}}><IconButton onClick={e=>AdminPIN({cb:deleteTxn,data:{id:_id}},'DELETE')}><FaTrash/></IconButton></td>
                </TR>)}
                </tbody>
            </table></ScrollViewV>
            {txnReports.pagination.totalPage>1&&<PaginationBar><Pages totalPage={txnReports.pagination.totalPage} currentPage={txnReports.pagination.currentPage} changePage={e=>pageNav(e)}/></PaginationBar>}
            
        {loading&& <Loader><Spinner/></Loader>}    
        </div>
    
}