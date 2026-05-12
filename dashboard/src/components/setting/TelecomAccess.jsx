import {useEffect,useState} from 'react'
//import {Accordion,Container,Row,Col,Form,
import {useMediaQuery} from 'react-responsive';
import {toast} from 'react-toastify';
import {useTheme} from '../../contexts/ThemeContext';
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {Col,FlexH,GapV,ThemeButton,Spinner} from '../styles/Admin.style'
import url from '../../config/url'
import Accordion from './Accordion'
import RadioItem from '../Radio';
import SwitchItem from '../Switch'
const opts = ['airtel','banglalink','grameenphone','robi','teletalk'];

export default   () =>{
    const [telecomAccesses, setTelecomAccesses] = useState({driveAccess:[],regularAccess:[],topupAccess:[]});
    const isMobile = useMediaQuery({maxWidth: 768});
    const {appData} = useAdminAuth()        //    
    //const {topupAccess, regularAccess,driveAccess} = telecomAccesses;
    const [switchRegularPack, setSwitchRegularPack] = useState(false);
    const [switchTopup, setSwitchTopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const {modeData:{backSecondary, textSecondary}} = useTheme()
    const [modifiedTopupAccess,setModifiedTopupAccess] = useState([])
    const [modifiedDriveAccess,setModifiedDriveAccess] = useState([])
    const [modifiedRegularAccess,setModifiedRegularAccess] = useState([]);
    const [topupMethod,setTopupMethod] = useState(appData?.methods.topup)     

    useEffect(()=> {
            fetch(url.urlTopupMethod,{credentials:'include'}).then(res=> res.json())
            .then(data=> setTopupMethod(data.topupMethod))
            .catch(er => toast.error('failed to fetch topup method '))

        fetch(url.urlTelecomAccess,{credentials:'include'})
            .then(res => res.json())
            .then(data => {
                setTelecomAccesses(data)
                setModifiedTopupAccess(data.topupAccess)
                setModifiedDriveAccess(data.driveAccess)
                setModifiedRegularAccess(data.regularAccess)
            })
            .catch(e => toast.error('failed to fetch telecom  permission'))
    },[])
    const modifyDriveTelecomAccess = async e => {
        e.preventDefault();
        if(JSON.stringify(telecomAccesses.driveAccess.sort()) == JSON.stringify(modifiedDriveAccess.sort())) return toast.info('no changes')
        setLoading(true);
        try{
            const res = await fetch(url.urlDriveTelecomAccess, {
                method: 'PATCH',
                credentials: 'include',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(modifiedDriveAccess)
            })
            const data = await res.json();
            if(!res.ok) throw new Error(data.error||'failed to update drive pack permission')
            toast.success('drive telecom access updated')
        }catch(err) {toast.error(err.message)}
        finally{setLoading(false);}
    }

    const modifyRegularTelecomAccess = async e => {
        e.preventDefault();
        if(JSON.stringify(telecomAccesses.regularAccess.sort()) == JSON.stringify(modifiedRegularAccess.sort())) return toast.info('no changes')
        setLoading(true);
        try{
            const res = await fetch(url.urlRegularTelecomAccess, {
                method: 'PATCH',
                credentials: 'include',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(modifiedRegularAccess)
            })
            const data = await res.json();
            if(!res.ok) throw new Error(data.error||'failed to update regular pack permission')
            toast.success('regular telecom access updated')
        }catch(err) {toast.error(err.message)}
        finally{setLoading(false);}
    }
    const modifyTopupTelecomAccess = async e => {
        e.preventDefault();
        if(JSON.stringify(telecomAccesses.topupAccess.sort()) == JSON.stringify(modifiedTopupAccess.sort())) return toast.info('no changes')
        setLoading(true);
        try{
            const res = await fetch(url.urlTopupTelecomAccess, {
                method: 'PATCH',
                credentials: 'include',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(modifiedTopupAccess)
            })
            const data = await res.json();
            if(!res.ok) throw new Error(data.error||'failed to update top up permission')
            toast.success('topup telecom access updated')
        }catch(err) {toast.error(err.message)}
        finally{setLoading(false);}
    }
    const toggleTopupAccess = (status,opt) =>{
        if(status) setModifiedTopupAccess(prev=>[...prev,opt])
        else setModifiedTopupAccess(prev=>prev.filter(el=>el!=opt))
    }
    const toggleDriveAccess = (status,opt) =>{
        if(status) setModifiedDriveAccess(prev=>[...prev,opt])
        else setModifiedDriveAccess(prev=>prev.filter(el=>el!=opt))
    }
    const toggleRegularAccess = (status,opt) => {
        if(status) setModifiedRegularAccess(prev=>[...prev,opt])
        else setModifiedRegularAccess(prev=>prev.filter(el=>el!=opt))
    }
    const changeTopupMethod = async (e)=>{
        try{
            let res= await fetch(`${url.urlTopup}/method/${e.target.value}`,{method:'PATCH',credentials:'include'})
            let data = await res.json()
            if(!res.ok) throw new Error(data.error)
            //setTopupGateway(data.topupMethod)
            toast.success(data.message) 
        }catch(err) {toast.error(err.message);setTopupMethod(prev=>prev)}
    }

    let content= <FlexH x='space-between' style={{background:backSecondary,color:textSecondary,width:'100%',padding:'0.5rem'}}>
     
        <Col /*xs={12} xl={4}*//*{span:6, offset:1}*/>
                <FlexH x='flex-start' y='center'>
                    <h5 style={{marginBottom: '2rem'}}> topup Permission</h5>{/*<Form.Check type='switch' onInput={e=>setSwitchTopup(e.target.checked)}/>*/}
                </FlexH>
            {/*<FlexH x='flex-start' y='center'>
                <h5>Topup Method</h5>*/}
                <FlexH style={{marginBottom:'3rem'}} x='space-between' y='center'>
                    <div><RadioItem style={{width:'24%'}} check={topupMethod=='manual'} n='method' identity='manual' v='manual' label='Manual' handleChange={changeTopupMethod}/></div>
                    <div><RadioItem style={{width:'24%'}} check={topupMethod=='retail'} n='method' identity='retail' v='retail' label='Retail' handleChange={changeTopupMethod}/></div>
                    <div><RadioItem style={{width:'24%'}} check={topupMethod=='mbank'} n='method' identity='mbank' v='mbank' label='MBank' handleChange={changeTopupMethod}/></div>
                    <div><RadioItem style={{width:'24%'}} check={topupMethod=='api'} n='method' identity='api' v='api' label='API' handleChange={changeTopupMethod}/></div>
                </FlexH>
            {/*</Col></FlexH>*/}
            <Form onSubmit={modifyTopupTelecomAccess}>
                <div>
                    {opts?.map((opt,i) => <FlexH x='space-between' y='center' style={{minWidth:'30%',marginBottom:'1rem'}} key={i}> <SwitchItem label={opt} check={modifiedTopupAccess?.includes(opt)} identity={`topup-${opt}`} handleChange={e=>toggleTopupAccess(e.target.checked,opt)}/></FlexH>)}
                    {/*switchTopup&& <Stack/>*/}
                </div>
                      <FlexH x='flex-end' y='center'><ThemeButton  type="submit">{loading?<Spinner  size="1"/>:'SAVE'}</ThemeButton></FlexH>
            </Form>
        </Col>
        <Col /*xs={12} xl={4}*/>
            <Form onSubmit={modifyDriveTelecomAccess}>
                <FlexH x='flex-start' y='center'>
                    <h5 style={{marginBottom: '2rem'}}>Drive Pack Permission</h5>{/*<Form.Check type='switch' onInput={e=>setSwitchDrivePack(e.target.checked)}/>*/}
                </FlexH>
                <div style={{position: 'relative'}}>
                    {opts?.map((opt,i) => <FlexH x='space-between' y='center' style={{minWidth:'30%',marginBottom:'1rem'}} key={i}> <SwitchItem label={opt} check={modifiedDriveAccess?.includes(opt)} identity={`drive-${opt}`} handleChange={e=>toggleDriveAccess(e.target.checked,opt)}/></FlexH>)}
                    {/*switchDrivePack&& <Stack></Stack>*/}
                </div>
                          <FlexH x='flex-end' y='center'><ThemeButton  type='submit'>{loading?<Spinner  size='1'/>: 'SAVE'}</ThemeButton></FlexH>
            </Form>
        </Col>
        <Col /*xs={12} xl={4}*//*{span:6, offset:1}*/>
            <Form onSubmit={modifyRegularTelecomAccess}>
                <FlexH x='flex-start' y='center'>
                    <h5 style={{marginBottom: '2rem'}}>Regular Pack Permission</h5>{/*<Form.Check type='switch' onInput={e=>setSwitchRegularPack(e.target.checked)}/>*/}
                </FlexH>
                <div>
                    {opts?.map((opt,i) => <FlexH x='space-between' y='center' style={{minWidth:'30%',marginBottom:'1rem'}} key={i}> <SwitchItem label={opt} check={modifiedRegularAccess?.includes(opt)} identity={`regular-${opt}`} handleChange={e=>toggleRegularAccess(e.target.checked,opt)}/></FlexH>)}
                    {/*switchRegularPack&& <Stack/>*/}
                </div>
                      <FlexH x='flex-end' y='center'><ThemeButton  type='submit'>{loading?<Spinner  size='1'/>: 'SAVE'}</ThemeButton></FlexH>
            </Form>
        </Col>
    </FlexH>
    

    return <>{isMobile ? (
        <Col /*xs={12}*/>
          <Accordion title='Telecom Settings' content={content}/>
        </Col>
      ) : <div /*md={10} xl={8}*/>{content}</div>}</>
}

           
            
          
