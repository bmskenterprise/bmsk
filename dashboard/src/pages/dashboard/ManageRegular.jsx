import {useEffect,useRef,useState} from 'react'
//import {useBlocker} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import {BsPlusLg} from 'react-icons/bs';
//import {toast } from 'react-toastify';
//import url from "../../config/url";
import {FlexH,Icon,TinyIcon,IconButton,Loader,Spinner} from '../../components/styles/Admin.style'
//import RegularForm from '../../components/RegularForm';
//import RegularList from './RegularList';
//import Pages from '../../components/Pagination'
import { useTheme } from '../../contexts/ThemeContext';
import { useTelecom } from '../../contexts/TelecomContext';
//import { usePack } from '../../contexts/PackContext';
import {getAheadLocalDate} from '../../utils/date';

export default () => {
    const init = {opt:'',icon:'',/*,expireDate:(new Date()).setDate((new Date()).getDate()+30).toISOString().slice(0, 10)*/};
    const navigate = useNavigate()    //
    const {themeData,modeData:{backPrimary,textPrimary}} = useTheme();
    const {fetchRegularSummary,regularSummary, } = useTelecom();
    //const {telecoms,icons} = useTelecom();
    const [hasStack, setHasStack] = useState(false);
    const [initData, setInitData] = useState(init);
    const [loading, setLoading] = useState(false);
    const [currentTelecom,setCurrentTelecom] = useState({name:'',icon:''});
    //const [regularSummary, setRegularSummary] = useState([]);
    //const [packList, setPackList] = useState({regulars:[],limit:20,currentPage:1,totalPage:1,query:''});
    const formData = {};
   
        /*const fetchRegularOpts = async () => {
            try {
                let res = await fetch(url.urlRegularSummary)
                let data = await res.json();
                if(!res.ok) throw new Error(data.message || 'failed to fetch opts');
                setRegularSummary(data.map(opt=>({opt,icon:telecoms[opt], active:packList.length>0})))
            }catch(err) toast.error(err.message)  
            }finally{setLoading(false)}
        }*/
        //const blocker = useBlocker(({currentLocation, nextLocation})=> hasStack && currentLocation.pathname!=nextLocation.pathname) 

    useEffect(()=>{
        /*const handleBeforeUnload = (event) => {
            if (!hasStack) return;
            //event.preventDefault();
            setHasStack(false); // শুধু state পরিবর্তন করবে
            window.history.pushState(null, '', window.location.href); // back block করে দিবে
        };*/
        //window.addEventListener('popstate', handleBeforeUnload);
        fetchRegularSummary() 
        //return () => window.removeEventListener('popstate', handleBeforeUnload);
    },[])

/*const addRegularPack = async (e) => {
    e.preventDefault();
    let validationErrors= validatePack(formData);
    if(Object.keys(validationErrors)){ setErrors(validationErrors);return}
    setLoading(true);
    try{
        let res = await fetch(url.urlRegular, {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(formData)
        });
        let data = await res.json();
        if(!res.ok){throw new Error(data.message || 'failed to add resource');}
        toast.success(data.message);
    } catch (err) {toast.error(err.message);}
    finally{setLoading(false)}
}

        const fetchRegular= async (opt)=>{
            try{
                let res = await fetch(`${url.urlRegular}/${opt}?user=$`)
                let data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'failed to fetch packs');
                }
                setPackList(data)
            }catch(err) { toast.error(err.message)}
            finally{setLoading(false)}
        }*/
    const getRegularsByOpt = (name,regularCount) =>{
        if(regularCount==0) return 
        /*initRegularFilter({opt:name,status:'active',limit:20,query:''});*/navigate(`/dashboard/manage-package/regular/${name}?status=active&category=bundle&search=&from=&to=&from-price=&to-price=&limit=20&page=1`)//
        //setCurrentTelecom({name,icon:telecoms[name]});
        //fetchRegulars({page:1})
    }
    const enableForm = (editData) => {
        setInitData(prev=>({...prev,...editData}));
        //setHasStack(false)
    }
    const initList = (opt,regularCount) =>{
        getRegularsByOpt(opt,regularCount);
        setInitData(prev=>({...prev,opt}))
        //setHasStack(true)
    }
    const cancelForm = ()=>{
        setInitData(prev=>({opt:prev.opt}))
        //setHasStack(true)  //window.removeEventListener('popstate', handleBeforeUnload);
    } 
    return <div style={{background:backPrimary, color:textPrimary,position:'relative'}}><h3 style={{marginBottom:'4rem'}}>Manage Regular</h3>
          <div>
            {regularSummary?.map(({icon,opt,active,regularCount},i)=> <FlexH x='space-between' key={i} style={{marginBottom:'2rem',color:active?textPrimary:'grey'}}>
                {/* <td>{icon}</td> */}
                <div onClick={e=>{getRegularsByOpt(opt,regularCount)}} style={{color:'#0000ff',cursor:'pointer'}}><TinyIcon src={icon}/>&nbsp;{opt}  <small>({regularCount})</small></div>
                {/* <td>{code}</td> 
                <div style={{width:'3%'}}></div>*/}
                <div ><IconButton onClick={e=>navigate('/dashboard/manage-package/regular/add',{state:{/*...init,*/operator:opt,id:null,title:'',price:'',category:'bundle',expireDate:getAheadLocalDate(30)}})} disabled={!active}><BsPlusLg style={{color:textPrimary,fontWeight:'bold'}}/></IconButton></div>
            </FlexH>)}
        </div>
            {/*<FlexH style={{marginBlock:'1rem'}}><Icon src={icons[initData.opt]} x='1.5'/> <h4>{initData.opt}</h4></FlexH>}
        {Object.keys(initData).includes('id') && <div>
            <div style={{marginBlock:'2rem'}}><MediumIcon src={icons[initData.opt]} /> {initData.opt}</div>
            <RegularForm initialData={initData}  handleCancel={cancelForm}/>
        </div>}*/}
        {/*(regularData.regulars[0]&&hasStack)&& <RegularList telecom={currentTelecom} enableForm={enableForm}/>*/}
        {loading && <Loader><Spinner  /></Loader>}
    </div>
}
