import {useEffect,useState} from 'react';
import {useNavigate} from 'react-router-dom'
//import {Form,Button,} from 'react-bootstrap';
import {BsPlusLg} from 'react-icons/bs';
//import Pages from "../../components/Pagination";
import { useTheme } from '../../contexts/ThemeContext';
import { useTelecom } from '../../contexts/TelecomContext';
import {FlexH,Icon,TinyIcon,IconButton,Loader,Spinner} from '../../components/styles/Admin.style'// 'react-toastify';
import {getAheadLocalDate} from '../../utils/date'
import DriveForm from './DriveForm';
import DriveList from './DriveList';
//import useArrayFetch from '../../hooks/useArrayFetch';

 export default () =>{
    const navigate = useNavigate() 
    const init = {opt:'',icon:''/*,expireDate:(new Date()).setDate((new Date()).getDate()+30).toISOString().slice(0, 10)title:'', price:'',  commission:'',  expireDate: new Date()*/};
    //const [queryRef,statusRef,limitRef] = [useRef(null),useRef(null),useRef(null)];
    const {themeData,modeData:{backPrimary,textPrimary}} = useTheme();
    const {fetchDriveSummary,driveSummary,loading} = useTelecom();
    //const {icons} = useTelecom();
    const [hasStack, setHasStack] = useState(false);
    //const {data} = useArrayFetch();
    const [initData,setInitData] = useState(init);
    const [currentTelecom, setCurrentTelecom] = useState({name:'',icon:''});
    //const [driveSummary, setDriveSummary] = useState([]);
    //const [packList, setPackList] = useState({drives:[],currentPage:1,totalPage:1,limit:20,query:''});
      

    useEffect(()=>{fetchDriveSummary();
        /*initDriveFilter({status:'active',limit:20,query:''});
        const handleBeforeUnload = (e) => {
            if (!hasStack) return;
            e.preventDefault();
            setHasStack(false); // শুধু state পরিবর্তন করবে
            window.history.pushState(null, '', window.location.href);
        };
        window.addEventListener('popstate', handleBeforeUnload);
        fetchDriveSummary();
        return () => window.removeEventListener('popstate', handleBeforeUnload);*/
    },[])
    //window.removeEventListener('popstate', handleBeforeUnload);
    /*const filter = e=>{
        e.preventDefault()
        fetchDrives({status:statusRef.current.value,limit:limitRef.current.value,query:queryRef.current.value})
    }*/
    const getDrivesByOpt = (name,driveCount)=>{
        if(driveCount==0){return}
        navigate(`/dashboard/manage-package/drive/${name}?status=active&category=bundle&search=&from=&to=&from-price=&to-price=&limit=20&page=1`)//fetchDrives({opt:name,limit:20,/*limitRef.current.value*/status:'active'});
        //setCurrentTelecom({name,icon:icons[name]});setHasStack(true)  // back block করে দিবে
    }

    const initList = (opt,driveCount) =>{
        getDrivesByOpt(opt,driveCount);
        setInitData(prev=>({...prev,opt}))
        setHasStack(true)
    }


    const enableForm = (editData) => {
        setInitData(prev=>({...prev,...editData}));
        //setHasStack(false)
    }
    
    return <div style={{background:backPrimary, color:textPrimary}}><h3 style={{marginBottom:'4rem'}}>Manage Drive</h3>
        {/* <Sidebar></Sidebar>
        <Col xs={9}> */}
        {/*(!Object.keys(initData).includes('id')&&!hasStack) ? <table><tbody>*/}
            <div>{driveSummary?.map(({icon,opt,active,driveCount},i)=> <FlexH x='space-between' key={i} style={{marginBottom:'2rem',color:active?textPrimary:'grey'}}>
                {/* <td>{icon}</td> */}
                <div onClick={e=>getDrivesByOpt(opt,driveCount)} style={{color:'#0000ff',cursor:'pointer'}}><TinyIcon src={icon}/>&nbsp;{opt}  <small>({driveCount})</small></div>
                {/* <td>{code}</td> 
                <div style={{width:'3%'}}>{driveCount}</div>*/}
                <div ><IconButton  onClick={e=>navigate('/dashboard/manage-package/drive/add',{state:{/*...init,*/operator:opt,id:null,title:'',price:'',category:'bundle',commission:'',expireDate:getAheadLocalDate(30)}})} disabled={!active}><BsPlusLg style={{color:textPrimary,fontWeight:'bold',float:'right'}}/></IconButton></div>
            </FlexH>)}
        </div>{/*</tbody></table>:
            <FlexH x='flex-start' style={{marginBlock:'2rem'}}><Icon src={icons[initData.opt]} x='1.5'/> <h4>{initData.opt}</h4></FlexH>*/}
        {/*Object.keys(initData).includes('id') && 
            <DriveForm initialData={initData}  handleCancel={()=> setInitData(init)}/>
        */}
            {/*<div><div style={{marginBlock:'2rem'}}><MediumIcon src={icons[initData.opt]}  />{initData.opt}</div></div>*/}
        {/*{driveData.drives[0] && <div>
            <h3><Icon src={initData.icon} size={4} />{initData.opt}</h3>
            <div>
            <form onSubmit={filter}>
                <Field   type="number" min="10" max='100' step='5' value={driveData.pagination.limit} ref={limitRef} />
                <div><input type="date" name="" ref={fromDateRef} /><input type="date" name="" ref={toDateRef} /></div>
                <div><input type="number" name="" ref={fromPriceRef} /><input type="number" name="" ref={toPriceRef} /></div>
                <input style={{width:'50%',padding:'1rem'}} type="text" placeholder="search pack" ref={queryRef}/>
                <select name="" ref={statusRef}>
                    <option value="active">active</option>
                    <option value="deactive">deactive</option>
                </select>
                <button type='submit'>filter</button>
            </form>
        </div>*/}
        {/*driveData.drives[0]&& <DriveList telecom={currentTelecom} enableForm={enableForm}/>*/}
        {/*{driveData.pagination.totalPage>1 && <Pages currentPage={driveData.pagination.currentPage} totalPage={driveData.pagination.totalPage} changePage={e=>fetchDrives({limit:driveData.pagination.limit,page:edriveData.currentPage-1})} handleNext={e=>fetchDrives({limit:driveData.limit,page:driveData.currentPage+1})} />}
        </div>}*/}
    {loading && <Loader><Spinner/></Loader>}  
    </div>
}
