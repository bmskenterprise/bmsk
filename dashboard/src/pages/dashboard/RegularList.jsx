import {useEffect,useState} from 'react';
import {useNavigate,useParams,useSearchParams} from 'react-router-dom'
import {toast} from 'react-toastify';
import {FaPen,FaTrash} from 'react-icons/fa'
import {formatDistanceToNow} from 'date-fns'
import {useTheme} from '../../contexts/ThemeContext';
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {useTelecom} from '../../contexts/TelecomContext'
import {ScrollViewV,ScrollViewH,StripedList,FlexH,IconButton,Field,TH,Center,Select,DatePicker,PaginationBar,Loader,Spinner} from '../../components/styles/Admin.style';
import {launchDate,getCurrentLocalDate,getLocalDateFromUTC} from '../../utils/date';
 import {editData} from '../../hooks/useModify'
import useObjectFetch from '../../hooks/useFetch';
import url from '../../config/url';
import Pages from '../../components/Pagination'
import deleteConfirmation from '../../components/Confirmation'
import SwitchItem from '../../components/Switch';

export default  () =>{const [selected,setSelected] = useState([]);
    const {admin:{accesses}} = useAdminAuth()
    let navigate = useNavigate()
    let {opt} = useParams()
    const {thememode,themeData:{themeBackground,themeText}} =useTheme();
    const {/*regularData,fetchRegulars,*/telecomCategories} = useTelecom();
    let [searchParams,setSearchParams] = useSearchParams();
    const [status,category,search,fromPrice,toPrice,fromDate,toDate,limit,page] = [searchParams.get('status')||'active',searchParams.get('category')||'bundle',searchParams.get('search')||'',searchParams.get('from-price')||'',searchParams.get('to-price')||'',searchParams.get('from')||'',searchParams.get('to')||'',searchParams.get('limit')||'20',searchParams.get('page')||'1'];
    const [hovered,setHovered] = useState(false);
    const [filterTerm,setFilterTerm] = useState({status,category,search,fromDate,toDate,fromPrice,toPrice,limit,page});
    const [loading,setLoading] = useState(false);
    const fields = ['Date','ID','Price','Pack','Expire','Sold','Action'];
    
    /*const selectedPacks = packList.map(pack=>{{id:pack.id,selected:false}})*/
       const {data} = useObjectFetch(`${url.urlRegular}/${opt}?status=${status}&category=${category}&search=${search}&from=${fromDate}&to=${toDate}&fromPrice=${fromPrice}&toPrice=${toPrice}&limit=${limit}&page=${page}`,{credentials:'include'})
    //let today = (new Date).toISOString().split('T')[0]
    /*const check = (id)=>{
        let i=selected.indexOf(id)
        if(0<=i){setSelected(prev=> prev.filter(i=>i!=id))}
        else{setSelected(prev=> [...prev,String(id)]);}//  
    };
    const onClickOrHold = (id)=>{
        if(selected[0]) check(id)
        else{start(id)}
    }
    let {start,clear} =useLongPress(check)*/
    useEffect(()=>{
        /*initRegularFilter({opt,status:searchParams.get('status'),search:searchParams.get('search'),fromDate:searchParams.get('fromDate'),toDate:searchParams.get('toDate'),fromPrice:searchParams.get('fromPrice'),toPrice:searchParams.get('toPrice'),limit:searchParams.get('limit'),page:searchParams.get('page')});fetchRegulars({opt});*/ setFilterTerm({status,category,search,fromDate,toDate,fromPrice,toPrice,limit,page});
        //toDateRef.current.setAttribute('max',new Date().toISOString().split('T')[0]);
    },[status,category,search,fromDate,toDate,fromPrice,toPrice,limit,page])
        
                
    const toggleStatus = (id,status) =>{
                if(!accesses?.includes('modify-regular')) {toast.info('You don\'t have modify permission');return}
        /*const selectedIDs = selectedPacks.filter(pack=>pack.selected).map(pack=>pack.id);
        if(selectedIDs.length>0){*/
        editData(`${url.urlRegularStatus}/${id}`,{status},'Pack Status Toggled','Failed to Toggle Pack Status')
                //body:JSON.stringify({ids:selected,status})
            //toast.info('select at least one pack');
    };
                 
                
                
            
                
                   
            
        
        


    const deleteRegularPack = async e=>{
            if(!accesses?.includes('modify-regular')) {toast.info('You don\'t have modify permission');return}
        //const selectedIDs = selectedPacks.filter(pack=>pack.selected).map(pack=>pack.id);
        try{
            let res =await fetch(url.urlRegular,{
                method:'DELETE',credentials:'include',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({ids:selected})
                    
                //},
            })
            let data = await res.json();
            if(!res.ok) throw new Error(data.error||'Failed to Delete');
            toast.success(data.message||'Regular Pack Deleted');setSelected([])  //
            fetchRegulars({opt})
        }catch(e) {toast.error(e.message);}
        finally{setLoading(false);}
    };


    /*const editPack = async e=>{
        await fetch(`/${pack}`,{
                method:'PATCH',
                // headers:{'Content-Type':'application/json'},
                body:JSON.stringify({title,price,commission,expire,status})
        })
        toast.success('Pack Updated');
    };*/

    /*const editInit = e=>{
        const selectedIDs = selectedPacks.filter(pack=>pack.selected).map(pack=>pack.id);
        if(selectedIDs.length==1){setPack(selectedIDs[0])
        }else{toast.info('select one pack');}
        
    };*/

    /*const changeOperator = e=>{setPackList(packList.filter(pack=>pack.operatorName===e.target.value))}*/
    
    const filter = e=>{e.preventDefault()
        /*let filtered = packList.filter(({status,createdAt})=>{
            let [createDate,state,fromDate,toDate] = [new Date(createdAt),Boolean(statusRef.current.value),fromDateRef.current.value,toDateRef.current.value]
            if(fromDate && toDate)return status==state && createDate>=new Date(fromDate) && createDate<=new Date(toDate)
            else if(fromDate)return status==state && createDate>=new Date(fromDate)
            else if(toDate)return status==state && createDate<=new Date(toDate)
            else{return status==state}
        });*/
        let fd={status:e.target.status.value,category:e.target.category.value,limit:e.target.limit.value.trim(),search:e.target.search.value.trim(),fromDate:e.target.fromDate.value,toDate:e.target.toDate.value,fromPrice:e.target.fromPrice.value.trim(),toPrice:e.target.toPrice.value.trim()};
        navigate(`/dashboard/manage-package/regular/${opt}?status=${fd.status}&category=${fd.category}&search=${fd.search}&from-price=${fd.fromPrice}&to-price=${fd.toPrice}&from=${fd.fromDate}&to=${fd.toDate}&limit=${fd.limit||'20'}&page=1`);//initRegularFilter(fd);//fetchRegulars({page:1})
    }
    const pageNav = p=> navigate(`/dashboard/manage-package/regular/${opt}?status=${status}&category=${category}&search=${search}&from=${fromDate}&to=${toDate}&from-price=${fromPrice}&to-price=${toPrice}&limit=${limit||'20'}&page=${p}`)
    const filterParams = e=> setFilterTerm(prev=>({...prev,[e.target.name]:e.target.value}))    
            //toast.info('select one pack');
    const markedRowText = id => selected.includes(String(id))?themeText:''
    const markedRow = id => ({baxckground:selected.includes(String(id))?themeBackground:'',color:selected.includes(String(id))?themeText:'',width:isMobile?'64rem':'87rem'})
                  
                 
                  
    return !accesses?.includes('manage-regular')?<Center><p>Don't have Manage Regular Permission</p></Center>:<div style={{width:'100%',height:'70%',marginTop:'3rem'}}> 
            {/*<h3><MediumIcon src={telecom.icon}  />{telecom.name}</h3>*/}
            {/*<div><label htmlFor=''></label>
                <Select  onChange={e=>{console.log(e.target.value);}}>
                    <option value='active'>Active</option>
                    <option value='deactive'>Deactive</option>*/}
                    {/*operators.map(({operatorName})=> <option value={operatorName}>{operatorName}</option>)*/}
                {/*</Select>
            </div>
            <div>*/}{/*<label htmlFor=''>Action</label>*/}
                    {/*<input type='date' min='' ref={fromDateRef}/>*/}
                    {/* <label></label> */}
                    {/*<input type='date' min='' ref={toDateRef}></input>*/}
                {/* <Select name='' onChange={changeStatus}>
                </Select> */}
            {/*</div><Button onClick={filter}>filter</Button>*/}
            {selected[0] ? <FlexH x='flex-end' y='center'>
                    <IconButton style={{color:'red',fontSize:'1.5rem',marginRight:'1rem'}} onClick={e=>deleteConfirmation(thememode,deleteDrivePack,selected)}><FaTrash/></IconButton>
                {/*<span onClick={deletePack}><FaDelete /></span>*/}
                {/*<Form.Check type='switch' checked={regularData.regulars[0]?.active} onChange={e=>toggleStatus(e.target.checked)}/>*/}{/*statusRef.current.value=='active'?<Form.Check type='switch' checked={true} onChange={e=>toggleStatus(e.target.checked)}/>:<Form.Check type='switch' checked={false} onChange={e=>toggleStatus(e.target.checked)} />*/}
            </FlexH>:
            <form onSubmit={filter}><FlexH x='space-between' y='center'>
                <Field value={filterTerm.limit} min='10' max='100' step='5' x='5' name='limit' onChange={filterParams}/>
                {/*<Field x='5' list='cat' name='category' value={regularFilter.category} onChange={filterParams}/>*/}
                <Select name='category' value={filterTerm.category} onChange={filterParams}>{telecomCategories?.map(({id,category})=> <option style={{textTransform:'capitalize'}} value={category} key={id}>{category}</option>)}</Select>
                {/*<div><DatePicker type='date' value={regularFilter.toDate} name='toDate'  onChange={filterParams}/></div>*/}
                <div>  
                <Field value={filterTerm.fromPrice} name='fromPrice' placeholder='price from' x='6' onChange={filterParams}/>  
                <Field value={filterTerm.toPrice} name='toPrice' placeholder='price to' x='6' onChange={filterParams}/></div>
                <Field x='10'/*style={{width:'50%',padding:'0.5rem'}}*/ value={filterTerm.search} placeholder='search pack' name='search' onChange={filterParams}/>
                <div><DatePicker  type='date' name='fromDate' min={launchDate} max={getCurrentLocalDate()} onChange={filterParams}/><DatePicker  type='date' name='toDate' min={launchDate} max={getCurrentLocalDate()} onChange={filterParams}/></div>
                <Select  name='status' value={filterTerm.status} onChange={filterParams}>
                    <option value='active'>Active</option>
                    <option value='deactive'>Deactive</option>
                </Select>
                <button type='submit'>filter</button>
            </FlexH></form>}
        <ScrollViewV style={{width:'100%',height:'80%',minWidth:'60rem',marginTop:'4rem'}}>
        <ScrollViewH style={{width:'100%'}}>
            {/*</thead><table><thead><tr>{fields.map((f,i)=> <TH key={i}>{f}</TH>)}</tr></thead><tbody>*/}
                  
                {/* <th>Packe</th>
                <th>Commission</th>
                <th>Action</th> */}
            
            {/*list*/data?.regulars?.map(({_id,updatedAt,id,title,price,operator,active,category,expire,sold},i)=> <StripedList style={markedRow(_id)} key={_id} /*onMouseDown={e=>onClickOrHold(String(_id))} onMouseUp={clear} onMouseLeave={clear} /*onTouchStart={e=>start(_id,e.target)} onTouchEnd={clear} onTouchCancel={clear}*/ /*onClick={e=>{selected[0] &&check(_id)}}*/>
                {/* <td><input type='checkbox' name='' onInput={e=>{selectedPacks.find(pack=>pack.id===id).selected=e.target.checked}} /></td> */}
                <div style={{width:'8%'}} onMouseOver={e=>setHovered(true)} onMouseOut={e=>setHovered(false)}>{hovered?formatDistanceToNow(updatedAt,{addSuffix:true}):getLocalDateFromUTC(updatedAt)}</div>
                <div style={{width:'10%'}}>{id}</div>
                <div style={{width:'5%'}}>{price}</div>
                <div style={{width:'54%'}}>{title}</div>
                {/*<td>{commission}</td>*/}
                <div style={{width:'8%'}}>{expire??''}</div>
                <div style={{width:'5%'}}>{sold}</div>
                <div style={{width:'10%'}}><SwitchItem check={active} handleChange={e=>toggleStatus(_id,e.target.checked)}/>&nbsp;<IconButton onClick={e=>navigate(`/dashboard/manage-package/regular/edit/${_id}`,{state:{id:_id,operator,category,title,price}})}><FaPen/></IconButton><IconButton onClick={e=>deleteConfirmation(thememode,deleteRegularPack,[_id])}><FaTrash/></IconButton></div>  
            </StripedList>)}{/*</tbody></table>*/}
        </ScrollViewH>
        </ScrollViewV>
          {data?.pagination?.totalPage>1 &&  <PaginationBar> <Pages totalPage={data?.pagination?.totalPage} currentPage={data?.pagination?.currentPage} changePage={e=>pageNav(e)} /*handleNext={e=>setPackList(fetchRegulars({limit:packList.limit,page:packList.currentPage+1}))}*/ /></PaginationBar>}
        {loading&&<Loader><Spinner  ></Spinner></Loader>}
        {/*<Loader><Spinner  ></Spinner></Loader>*/}
    </div>
}
