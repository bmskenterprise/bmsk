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
import deleteConfirmation from '../../components/Confirmation';
import useLongPress from '../../hooks/longPress';
import useFetch from '../../hooks/useFetch'
import Pages from '../../components/Pagination'
import url from '../../config/url'
import SwitchItem from '../../components/Switch';

export default  (/*{telecom,enableForm}*/) =>{
    const isMobile = useMediaQuery({maxWidth:768})
    const fields = ['Date','ID','Price','Commission','Pack','Expire','Sold','Action'];
    const {opt} = useParams()
    const {admin} = useAdminAuth() 
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {telecomCategories} = useTelecom()
    const {thememode,themeData:{themeBackground,themeText},modeData:{textPrimary}} = useTheme();
    const [status,category,search,fromPrice,toPrice,fromDate,toDate,limit,page] = [searchParams.get('status')||'active',searchParams.get('category')||categories[0],searchParams.get('search')||'',searchParams.get('fromPrice')||'',searchParams.get('toPrice')||'',searchParams.get('fromDate')||'',searchParams.get('toDate')||'',searchParams.get('limit')||'20',searchParams.get('page')||'1'];
    const [selected,setSelected] = useState([]);
    const [hovered,setHovered] = useState(false);
    //const {driveData,fetchDrives,/*,toggleDriveStatus,deleteDrivePack*/} = useTelecom();
    const [filterData,setFilterData] = useState({status,category,search,fromPrice,toPrice,fromDate,toDate,limit,page});
         const [loading,setLoading] = useState(false);
    
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
        setFilterData({status,category,search,fromPrice,toPrice,fromDate,toDate,limit,page}) //Date().toISOString().split('T')[0]);
    },[status,category,search,fromPrice,toPrice,fromDate,toDate,limit,page])
    
    const {data} = useFetch(`${url.urlDrive}/${opt}?status=${status}&category=${category}&search=${search}&from=${fromDate}&to=${toDate}&fromPrice=${fromPrice}&toPrice=${toPrice}&limit=${limit}&page=${page}`)   //
    
    const toggleStatus = async (id,status)=>{
        if(!accesses?.includes('modify-drive')) {toast.info('you don\'t have modify permission');return}
        //const selectedIDs = selectedPacks.filter(pack=>pack.selected).map(pack=>pack.id);
        setLoading(true);
        try{
            let res=await fetch(`${url.urlDriveStatus}/${id}`,{
                method:'PATCH',
                credentials: 'include',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({status})
            })
            let data = await res.json();
            if(!res.ok) throw new Error(data.error || 'failed');
            setSelected([]);/*fetchDrives({opt});*/toast.success(data.message)
        }catch(e){toast.error(e.message);}
        finally{setLoading(false);}/*if(toggleStatus(selected,e.target.checked)){setSelected([])}*/
    };


    const deleteDrivePack = async e=>{
        if(!accesses?.includes('modify-drive')) {toast.info('you don\'t have modify permission');return}
        //const selectedIDs = selectedPacks.filter(pack=>pack.selected).map(pack=>pack.id);
        try{
            let res =await fetch(url.urlDrive,{
                method:'DELETE',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({ids:selected})
            })
            let data = await res.json();
            if(!res.ok) throw new Error(data.error||'failed to delete drive pack) //
            setSelected([]);/*fetchDrives({opt});*/toast.success(data.message)  //toast.success('Pack Deleted')//:toast.error('Something went wrong');
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
        setPackList(filtered)*/navigate(`/dashboard/manage-package/drive/${opt}?status=${e.target.status.value}&category=${e.target.category.value}&search=${e.target.search.value.trim()}&fromPrice=${e.target.fromPrice.value.trim()}&toPrice=${e.target.toPrice.value.trim()}&fromDate=${e.target.fromDate.value}&toDate=${e.target.toDate.value}&limit=${e.target.limit.value.trim()}&page=1`);//fetchDrives()
    }
    const filterParams = e=> setFilterData(prev=>({...prev,[e.target.name]:e.target.value}))
    const pageNav = p=> navigate(`/dashboard/manage-package/drive/${opt}?status=${status}&category=${category}&search=${search}&fromPrice=${fromPrice}&toPrice=${toPrice}&fromDate=${fromDate}&toDate=${toDate}&limit=${limit}&page=${p}`)
    
    //const markedRowText = id => selected.includes(String(id))?themeText:''
    const markedRow = id => ({background:selected.includes(String(id))?themeBackground:'',color:selected.includes(String(id))?themeText:'',width:isMobile?'64rem':'87rem'});
    
                  
                  
                 
                  
                 
                  
                 
    return !admin?.accesses?.includes('manage-drive')?<Center><p>Dont have Manage Drive Permission</p></Center>:<div style={{width:'100%',height:'70%',marginTop:'3rem'}}>
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
                <Field value={filterData.limit} min='10' max='100' step='5' x='5' name='limit' />
                {/*<Field x='5' list="cat" name='category' value={filterData.category} onChange={filterParams}/>*/}
                <Select value={filterData.category} name='category' onChange={filterParams}>{telecomCategories.map((c,i)=> <option key={i} value={c}>{c}</option>)}</Select>
                <div><Field value={filterData.fromPrice} name='fromPrice' placeholder='price from' x='6'/>
                <Field value={filterData.toPrice} name='toPrice' placeholder='price to' x='6'/></div>
                <div>
                <DatePicker type='date' name='fromDate' value={filterData.fromDate} min={launchDate} max={getCurrentLocalDate()} onChange={filterParams}/>
                <DatePicker type='date' name='toDate' value={filterData.toDate} min={launchDate} max={getCurrentLocalDate()} onChange={filterParams}/></div>
                <Field x='10' value={filterData.search} placeholder='search pack' name='search' onChange={filterParams}/>
                <Select  name='status' value={filterData.status} onChange={filterParams}>
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
