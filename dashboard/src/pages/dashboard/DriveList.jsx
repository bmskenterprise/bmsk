import {useEffect,useState} from 'react';
import {useNavigate,useParams,useSearchParams} from 'react-router-dom'
import {FaPen,FaTrash} from 'react-icons/fa';
import {formatDistanceToNow} from 'date-fns'
import {toast} from 'react-toastify'
import {useMediaQuery} from 'react-responsive';
import {useTheme} from '../../contexts/ThemeContext';
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {useTelecom} from '../../contexts/TelecomContext'
import {ScrollViewV,ScrollViewH,FlexH,StripedList,IconButton,Field,DatePicker,Select,TH,TR,PaginationBar,Center} from '../../components/styles/Admin.style';
import {launchDate,getLocalDateFromUTC,getCurrentLocalDate} from '../../utils/date'
import {editData} from '../../hooks/useModify';
import useObjectFetch from '../../hooks/useFetch'
import deleteConfirmation from '../../components/Confirmation';
import Pages from '../../components/Pagination'
import SwitchItem from '../../components/Switch';
import url from '../../config/url'

export default  (/*{telecom,enableForm}*/) =>{
    const isMobile = useMediaQuery({maxWidth:768})
    const fields = ['Date','ID','Price','Commission','Pack','Expire','Sold','Action'];
    const {opt} = useParams()
    const {admin} = useAdminAuth() 
    const navigate = useNavigate();
    const {thememode,themeData:{themeBackground,themeText},modeData:{textPrimary}} = useTheme();
    const {telecomCategories} = useTelecom()
    const [searchParams] = useSearchParams();
    const [status,category,search,fromPrice,toPrice,fromDate,toDate,limit,page] = [searchParams.get('status')||'active',searchParams.get('category')||categories[0],searchParams.get('search')||'',searchParams.get('from-price')||'',searchParams.get('to-price')||'',searchParams.get('from')||'',searchParams.get('to')||'',searchParams.get('limit')||'20',searchParams.get('page')||'1'];
    const [selected,setSelected] = useState([]);
    const [hovered,setHovered] = useState(false);
    const [filterTerm,setFilterTerm] = useState({status,category,search,fromPrice,toPrice,fromDate,toDate,limit,page});
         const [loading,setLoading] = useState(false);
    const accesses = admin?.accesses;
    
    const {data} = useObjectFetch(`${url.urlDrive}/${opt}?status=${status}&category=${category}&search=${search}&from=${fromDate}&to=${toDate}&fromPrice=${fromPrice}&toPrice=${toPrice}&limit=${limit}&page=${page}`)   //
    /*const selectedPacks = packList.map(pack=>({id:pack.id,selected:false}))
    };*/
    /*const check = (id)=>{
        let i=selected.indexOf(id)
        if(0<=i){setSelected(prev=> prev.filter(i=>i!=id))}
        else{setSelected(prev=> [...prev,String(id)]);}//  
    };
    let {start,clear} =useLongPress(check)
    const onClickOrHold = (id) =>{
        if(selected[0]) check(id)
        else {start(id)}
    }*/
    useEffect(()=>{
        //fetchDrives({opt}) //Date().toISOString().split('T')[0]);
        setFilterTerm({status,category,search,fromPrice,toPrice,fromDate,toDate,limit,page}) //Date().toISOString().split('T')[0]);
    },[status,category,search,fromPrice,toPrice,fromDate,toDate,limit,page])
    
    
    const toggleStatus = (id,status) =>{
        if(!accesses?.includes('modify-drive')) {toast.info('You don\'t have modify permission');return}
        //const selectedIDs = selectedPacks.filter(pack=>pack.selected).map(pack=>pack.id);
          editData(`${url.urlDriveStatus}/${id}`,{status},'Pack Status Toggled','Failed to Toggle Pack Status')
            /*fetchDrives({opt});*/
    };
        
        
              
                 
                
                
            
                
                 
        
        /*if(toggleStatus(selected,e.target.checked)){setSelected([])}*/


    const deleteDrivePack = async selected =>{
        if(!accesses?.includes('modify-drive')) {toast.info('You don\'t have modify permission');return}
        //const selectedIDs = selectedPacks.filter(pack=>pack.selected).map(pack=>pack.id);
        try{
            let res =await fetch(url.urlDrive,{
                method:'DELETE',credentials:'include',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({ids:selected})
            })
            let data = await res.json();
            if(!res.ok) throw new Error(data.error||'Failed to delete drive pack') //
            /*setSelected([]);fetchDrives({opt});*/toast.success(data.message)  //toast.success('Pack Deleted')//:toast.error('Something went wrong');
        }catch(e) {toast.error(e.message||'selectat least one pack');}
        finally{setLoading(false);}
        //if(deletePack(selected)) setSelected([])   //toast.info('select at least one pack');
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
        if(selectedIDs.length==1){
           setPack(selectedIDs[0]) 
        }else{toast.info('select one pack');}
        
    };*/

    const filter = e=>{e.preventDefault()
        /*let filtered = packList.filter(({status,createdAt})=>{
            let [createDate,state,fromDate,toDate] = [new Date(createdAt),Boolean(statusRef.current.value),fromDateRef.current.value,toDateRef.current.value]
            if(fromDate && toDate)return status==state && createDate>=new Date(fromDate) && createDate<=new Date(toDate)
            else if(fromDate)return status==state && createDate>=new Date(fromDate)
            else if(toDate)return status==state && createDate<=new Date(toDate)
                  
            else{return status==state}
        });
        setPackList(filtered)*/navigate(`/dashboard/manage-package/drive/${opt}?status=${e.target.status.value}&category=${e.target.category.value}&search=${e.target.search.value.trim()}&from-price=${e.target.fromPrice.value.trim()}&to-price=${e.target.toPrice.value.trim()}&from=${e.target.fromDate.value}&to=${e.target.toDate.value}&limit=${e.target.limit.value.trim()}&page=1`);//fetchDrives()
    }
    const filterParams = e=> setFilterTerm(prev=>({...prev,[e.target.name]:e.target.value}))
    const pageNav = p=> navigate(`/dashboard/manage-package/drive/${opt}?status=${status}&category=${category}&search=${search}&from-price=${fromPrice}&to-price=${toPrice}&from=${fromDate}&to=${toDate}&limit=${limit}&page=${p}`)
    
    //const markedRowText = id => selected.includes(String(id))?themeText:''
    const markedRow = id => ({background:selected.includes(String(id))?themeBackground:'',color:selected.includes(String(id))?themeText:'',width:isMobile?'64rem':'87rem'});
    
                  
                  
                 
                  
                 
                  
                 
    return !accesses?.includes('manage-drive')?<Center><p>Dont have Manage Drive Permission</p></Center>:<div style={{width:'100%',height:'70%',marginTop:'3rem'}}>
                {/*<h3><MediumIcon src={telecom.icon}  />{telecom.name}</h3>*/}
            {/*<div><label htmlFor=""></label>
                <select ref={statusRef} onChange={e=>{console.log(e.target.value);}}>
                    <option value="active">Active</option>
                    <option value="deactive">Deactive</option>*/}
                    {/*operators.map(({operatorName})=> <option value={operatorName}>{operatorName}</option>)*/}
                {/*</select>
            </div>
            <div>*/}{/*<label htmlFor="">Action</label>*/}
                    {/*<input type="date" min="" ref={fromDateRef}/>*/}
                    {/* <label></label> */}
                    {/*<input type="date" min="" ref={toDateRef}></input>*/}
                {/* <select name="" onChange={changeStatus}>
                </select> */}
            {/*</div><Button onClick={filter}>filter</Button>*/}
            {selected[0] ? <FlexH x='flex-end' y='center'>
                    <IconButton style={{color:'red',fontSize:'1.5rem',marginRight:'1rem'}} onClick={e=>deleteConfirmation(selected,deleteDrivePack)}><FaTrash/></IconButton>{/*<Form.Check type='switch' checked={driveData.drives[0].active} onChange={toggleDriveStatus}/>
                <span onClick={deletePack}><FaDelete /></span>
                <Form.Check type='switch' checked={false} onChange={toggleDriveStatus} />*/}
            </FlexH>:
            <form onSubmit={filter}><FlexH x='space-between' y='center'>
                <Field value={filterTerm.limit} min='10' max='100' step='5' x='5' name='limit' />
                {/*<Field x='5' list="cat" name='category' value={filterTerm.category} onChange={filterParams}/>*/}
                <Select value={filterTerm.category} name='category' onChange={filterParams}>{telecomCategories?.map(({id,category})=> <option key={id} style={{textTransform:'capitalize'}} value={category}>{category}</option>)}</Select>
                <div><Field value={filterTerm.fromPrice} name='fromPrice' placeholder='price from' x='6'/>
                <Field value={filterTerm.toPrice} name='toPrice' placeholder='price to' x='6'/></div>
                <div>
                <DatePicker type='date' name='fromDate' value={filterTerm.fromDate} min={launchDate} max={getCurrentLocalDate()} onChange={filterParams}/>
                <DatePicker type='date' name='toDate' value={filterTerm.toDate} min={launchDate} max={getCurrentLocalDate()} onChange={filterParams}/></div>
                <Field x='10' value={filterTerm.search} placeholder='search pack' name='search' onChange={filterParams}/>
                <Select  name='status' value={filterTerm.status} onChange={filterParams}>
                    <option value='active'>Active</option>
                    <option value='deactive'>Deactive</option>
                </Select>
                <button type='submit'>filter</button>
            </FlexH>
            </form>}
        <ScrollViewV style={{width:'100%',height:'80%',minWidth:'60rem',marginTop:'4rem'}}>
        <ScrollViewH style={{width:'100%'}}>
            {/*</thead><table><thead><tr>{fields.map((f,i)=> <TH key={i}>{f}</TH>)}</tr></thead><tbody>*/}
                {/* <th>Packe</th>
                <th>Price</th>
                <th>Commission</th>
                <th>Action</th> */}
            {/*list*/data?.drives?.map(({_id,updatedAt,id,operator,active,category,title,price,commission,expire,sold})=> <StripedList key={_id} style={markedRow(_id)} /*onMouseDown={e=>onClickOrHold(String(_id))} onMouseUp={clear} onMouseLeave={clear} /*onTouchStart={e=>start(_id,e.target)} onTouchEnd={clear} onTouchCancel={clear} /*onClick={e=>{selected[0] &&check(_id,e.target)}}*/>
                {/* <td><input type="checkbox" name="" onInput={e=>{selectedPacks.find(pack=>pack.id===id).selected=e.target.checked}} /></td> */}
                <div style={{width:'8%'}} onMouseOver={e=>setHovered(true)} onMouseOut={e=>setHovered(false)}>{hovered?formatDistanceToNow(updatedAt,{addSuffix:true}):getLocalDateFromUTC(updatedAt)}</div>
                <div style={{width:'10%'}}>{id}</div>
                <div style={{width:'5%'}}>{price}</div>
                <div style={{width:'5%'}}>{commission}</div>
                <div style={{width:'49%'}}>{title}</div>
                <div style={{width:'8%'}}>{expire??''}</div>
                <div style={{width:'5%'}}>{sold}</div>
                <div style={{width:'10%'}}><SwitchItem check={active} handleChange={e=>toggleStatus(_id,e.target.checked)}  />&nbsp;<IconButton style={{color:textPrimary}} onClick={e=>navigate(`/dashboard/manage-package/drive/edit/${_id}`,{state:{id:_id,operator,category,title,price,commission}})}><FaPen/></IconButton>&nbsp;<IconButton /*style={{color:'red'}}*/ onClick={e=>deleteConfirmation(thememode,deleteDrivePack,[_id])}><FaTrash/></IconButton></div>
            </StripedList>)}
        </ScrollViewH>
        </ScrollViewV>
          {data?.pagination?.totalPage>1 &&  <PaginationBar> <Pages totalPage={data?.pagination?.totalPage} currentPage={data?.pagination?.currentPage} changePage={e=>pageNav(e)} /*handleNext={e=>setPackList(fetchRegulars({limit:packList.limit,page:packList.currentPage+1}))}*/ /></PaginationBar>}
        {/*loading&&<Spinner animation="border" role="status"></Spinner>*/}
        </div>
}
