import {useEffect,useState} from 'react' 
import {useMediaQuery} from 'react-responsive'
import {toast} from 'react-toastify'
import {useTheme} from '../../contexts/ThemeContext' 
import {useTelecom} from '../../contexts/TelecomContext'
import {useAdminAuth} from '../../contexts/AdminAuthContext'    //
import {Col,FlexH,GapV,Field,ThemeButton,TinyIcon,Select,ThemeSpinner} from '../styles/Admin.style';
import Accordion from './Accordion'
import url from '../../config/url'

export default  () =>{
    const {modeData:{backSecondary,textSecondary}} =useTheme()
    const isMobile = useMediaQuery({maxWidth:768})
    const [modemRouting,setModemRouting] = useState([]);
    const [modified,setModified] = useState([])
    const [loading,setLoading] = useState(false) 
    const {icons} = useTelecom()
    const {admin} = useAdminAuth()
    const accesses = admin?.accesses
    
    useEffect(()=>{fetchRouting()}, [])  //
    const fetchRouting = async e =>{
        try{
            let res = await fetch(url.urlModemRouting,{credentials:'include'})
            let data = await res.json()
            if(!res.ok) throw new Error('failed modem routing')
            setModemRouting(data)
        }catch(e) {toast.error(e.message)}
    }
                 
                
              
    const saveRouting = async (e) => {
        e.preventDefault();
        if(!accesses?.includes('modify-setting')) {toast.info('you don\'t have modify permission');return}
        //let form=e.target;
        /*let edited={
            airtel:{ip:form['airtel-ip'].value.trim(),slot:form['airtel-slot'].value},
            banglalink:{ip:form['banglalink-ip'].value.trim(),slot:form['banglalink-slot'].value},
            grameenphone:{ip:form['grameenphone-ip'].value.trim(),slot:form['grameenphone-slot'].value},
            robi:{ip:form['robi-ip'].value.trim(),slot:form['robi-slot'].value},
            teletalk:{ip:form['teletalk-ip'].value.trim(),slot:form['teletalk-slot'].value},
        }*/
        if(JSON.stringify(modemRouting)===JSON.stringify(modified)) {toast.info('No Changes');return;}
        //Object.keys(routing)?.map(opt=> {if(JSON.stringify(routing[opt])===JSON.stringify({ip:form[`${opt}-ip`].value.trim(),slot:form[`${opt}-slot`].value})) delete modemRouting[opt]});
        setLoading(true);
        try{
            let res = await fetch(
                url.urlModemRouting,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({updatedRouting:modified})
                }
            )
            let data = await res.json();
            if(!res.ok) throw new Error(data.error||'failed');setModemRouting(data.routing);toast.success(data.message)
        }catch(err) {toast.error(err.message);}
        finally {setLoading(false)}
    }
    const changeSlot = (id,slot) =>{
        setModified(prev=> prev.find(b=>b._id==id) ? prev.map(b=>b._id==id?{...b,slot}:b) : [...prev,{_id:id,slot}]);
        setModemRouting(prev=> prev.map(b=>b._id==id?{...b,slot}:b))
    }
    const changeIP = (id,ip) =>{
        setModified(prev=> prev.find(b=> b._id==id) ? prev.map(b=>b._id==id?{...b,ip}:b) : [...prev,{_id:id,ip}])
        setModemRouting(prev=> prev.map(b=>b._id==id?{...b,ip}:b))
    }
    let content = <div style={{background:backSecondary,color:textSecondary,padding:'0.5rem'}}>
        <h4>Modem Routing</h4><GapV x='2'/>
        <form onSubmit={saveRouting}>
        {modemRouting?.map(({_id,operator,ip,slot})=> <FlexH x='space-between' y='center' style={{width:'100%',marginBottom:'1rem'}} key={_id}>
            <div style={{width:'25%'}}><TinyIcon src={icons[operator]}/></div>
            <FlexH x='flex-end' style={{width:'72%'}}>
                <Field x='10' name={`${operator}-ip`} value={ip} onChange={e=>changeIP(_id,e.target.value)}/>
                <Select style={{width:'18%'}} name={`${operator}-slot`} onChange={e=>changeSlot(_id,e.target.value)} value={slot}>
                    <option value='0'>1</option>
                    <option value='1'>2</option>
                </Select>
            </FlexH>
        </FlexH>)}
        <GapV x='1'/><FlexH x='flex-end'><ThemeButton  type='submit' disabled={loading}>{loading?<ThemeSpinner  size='1'/>:'save'}</ThemeButton></FlexH><GapV x='4'/>
    </form>
    </div>
            
    return <>{isMobile ? (
            <Col >
              <Accordion title='Routing' content={content}/>
            </Col>
          ) :<Col /*md={6} xl={4}*/>{content}</Col>}</>
}
