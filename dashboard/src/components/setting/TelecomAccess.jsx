import {useEffect,useState} from 'react'
import {useMediaQuery} from 'react-responsive';
import {toast} from 'react-toastify';
import {useTheme} from '../../contexts/ThemeContext';
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {useTelecom} from '../../contexts/TelecomContext'
import {Col,FlexH,GapV,ThemeButton,ThemeSpinner} from '../styles/Admin.style'
import url from '../../config/url'
import Accordion from './Accordion'
import RadioItem from '../Radio';
import SwitchItem from '../Switch'
import AdminPIN from './AdminPIN';

export default   () =>{
     const {thememode,modeData:{backSecondary,textSecondary},themeData:{themeBackground}} = useTheme()
    const {telecoms} = useTelecom()
    const isMobile = useMediaQuery({maxWidth:768});
    const {appData,admin} = useAdminAuth()        //    
    const accesses = admin?.accesses
    //const {topupAccess, regularAccess,driveAccess} = telecomAccesses;
    const [telecomAccesses, setTelecomAccesses] = useState({driveAccess:[],regularAccess:[],topupAccess:[]});
    const [switchRegularPack, setSwitchRegularPack] = useState(false);
    const [switchTopup, setSwitchTopup] = useState(false);
    const [loading,setLoading] = useState(false);
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
            .catch(e => toast.error('Failed to fetch telecom  permission'))
    },[])
    const modifyAccess = async ({url,modified},pin) => {
        setLoading(true);
        try{
            const res = await fetch(url, {
                method: 'PATCH',
                credentials: 'include',
                headers: {'Content-Type':'application/json','x-admin-pin':pin},
                body: JSON.stringify(modified)
            })
            const data = await res.json();
            if(!res.ok) throw new Error(data.error||'Failed to update pack permission ')
            toast.success(datra.message|| 'telecom access updated')
        }catch(e) {toast.error(e.message)}
        finally{setLoading(false);}
    }
    const modifyTopupTelecomAccess =  e => {
        e.preventDefault();
        if(!accesses?.includes('modify-setting')) {toast.info('You don\'t have modify permission');return}
        if(JSON.stringify(telecomAccesses.topupAccess.sort()) == JSON.stringify(modifiedTopupAccess.sort())) return toast.info('no changes')
        AdminPIN([thememode,themeBackground],{cb:modifyAccess,data:{url:url.urlTopupTelecomAccess,modified:modifiedTopupAccess}},'MODIFY');
        /*try{
            const res = await fetch(url.urlTopupTelecomAccess, {
     
                method: 'PATCH',
                credentials: 'include',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(modifiedTopupAccess)
            })
            const data = await res.json();
            if(!res.ok) throw new Error(data.error||'failed to update top up permission')
            toast.success('topup telecom access updated')
        }catch(err) {toast.error(err.message)}*/
    }
    const modifyDriveTelecomAccess = (status,opt) =>{
        e.preventDefault();
        if(!accesses?.includes('modify-setting')) {toast.info('You don\'t have modify permission');return}
        if(JSON.stringify(telecomAccesses.driveAccess.sort()) == JSON.stringify(modifiedDriveAccess.sort())) return toast.info('No changes')
        AdminPIN([thememode,themeBackground],{cb:modifyAccess,data:{url:url.urlDriveTelecomAccess,modified:modifiedDriveAccess}},'MODIFY')
    }

    const modifyRegularTelecomAccess =  e => {
        e.preventDefault();
        if(!accesses?.includes('modify-setting')) {toast.info('You don\'t have modify permission');return}
        if(JSON.stringify(telecomAccesses.regularAccess.sort()) == JSON.stringify(modifiedRegularAccess.sort())) return toast.info('No changes')
        AdminPIN([thememode,themeBackground],{cb:modifyAccess,data:{url:url.urlRegularTelecomAccess,modified:modifiedRegularAccess}},'MODIFY');
        /*try{
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
        finally{setLoading(false);}*/
    }
    const toggleTopupAccess = (status,opt) =>{
        if(!accesses?.includes('modify-setting')) {toast.info('You don\'t have modify permission');return}
        if(status) setModifiedTopupAccess(prev=>[...prev,opt])
        else setModifiedTopupAccess(prev=>prev.filter(el=>el!=opt))
    }
    const toggleDriveAccess = (status,opt) =>{
        if(!accesses?.includes('modify-setting')) {toast.info('You don\'t have modify permission');return}
        if(status) setModifiedDriveAccess(prev=>[...prev,opt])
        else setModifiedDriveAccess(prev=>prev.filter(el=>el!=opt))
    }
    const toggleRegularAccess = (status,opt) => {
        if(!accesses?.includes('modify-setting')) {toast.info('You don\'t have modify permission');return}
        if(status) setModifiedRegularAccess(prev=>[...prev,opt])
        else setModifiedRegularAccess(prev=>prev.filter(el=>el!=opt))
    }
    const changeTopupMethod = async (e)=>{

        if(!accesses?.includes('modify-setting')) {toast.info('You don\'t have modify permission');return}
        try{
            let res= await fetch(`${url.urlTopup}/method/${e.target.value}`,{method:'PATCH',credentials:'include'})
            let data = await res.json()
            if(!res.ok) throw new Error(data.error)
            //setTopupGateway(data.topupMethod)
            toast.success(data.message) 
        }catch(e) {toast.error(e.message);setTopupMethod(prev=>prev)}
    }

    let content= <FlexH x='space-between' style={{background:backSecondary,color:textSecondary,gap:'3rem 0',width:'100%',padding:'0.5rem'}}>
        <Col /*xs={12} xl={4}*//*{span:6, offset:1}*/>
                    <h5 style={{marginBottom: '2rem'}}> Topup Permission</h5>{/*<Form.Check type='switch' onInput={e=>setSwitchTopup(e.target.checked)}/>*/}
            {/*<FlexH x='flex-start' y='center'>
                <FlexH x='flex-start' y='center'>
                </FlexH>
                <h5>Topup Method</h5>*/}
                <FlexH style={{marginBottom:'3rem',gap:'2rem 0'}} x='space-between'>
                    <div><RadioItem style={{width:'24%'}} check={topupMethod=='manual'} n='method' identity='manual' v='manual' label='Manual' handleChange={changeTopupMethod}/></div>
                    <div><RadioItem style={{width:'24%'}} check={topupMethod=='retail'} n='method' identity='retail' v='retail' label='Retail' handleChange={changeTopupMethod}/></div>
                    <div><RadioItem style={{width:'24%'}} check={topupMethod=='mbank'} n='method' identity='mbank' v='mbank' label='MBank' handleChange={changeTopupMethod}/></div>
                    <div><RadioItem style={{width:'24%'}} check={topupMethod=='api'} n='method' identity='api' v='api' label='API' handleChange={changeTopupMethod}/></div>
                </FlexH>
            {/*</Col></FlexH>*/}
            <form onSubmit={modifyTopupTelecomAccess}>
                <div>
                    {telecoms?.map(({_id,name}) => <div /*x='space-between' y='center'*/ style={{minWidth:'30%',marginBottom:'1rem'}} key={_id}> <SwitchItem label={name} check={modifiedTopupAccess?.includes(name)} identity={`topup-${name}`} handleChange={e=>toggleTopupAccess(e.target.checked,name)}/></div>)}
                    {/*switchTopup&& <Stack/>*/}
                </div>
                      <FlexH x='flex-end' y='center'><ThemeButton  type="submit">{loading?<ThemeSpinner  />:'SAVE'}</ThemeButton></FlexH>
            </form>
        </Col>
        <Col /*xs={12} xl={4}*/>
            <form onSubmit={modifyDriveTelecomAccess}>
                <FlexH x='flex-start' y='center'>
                    <h5 style={{marginBottom: '2rem'}}>Drive Pack Permission</h5>{/*<Form.Check type='switch' onInput={e=>setSwitchDrivePack(e.target.checked)}/>*/}
                </FlexH>
                <div style={{position: 'relative'}}>
                    {telecoms?.map(({_id,name}) => <div /*x='space-between' y='center'*/ style={{minWidth:'30%',marginBottom:'1rem'}} key={_id}> <SwitchItem label={name} check={modifiedDriveAccess?.includes(name)} identity={`drive-${name}`} handleChange={e=>toggleDriveAccess(e.target.checked,name)}/></div>)}
                    {/*switchDrivePack&& <Stack></Stack>*/}
                </div>
                <FlexH x='flex-end' y='center'><ThemeButton type='submit'>{loading?<ThemeSpinner />:'SAVE'}</ThemeButton></FlexH>             
            </form>
        </Col>
        <Col /*xs={12} xl={4}*//*{span:6, offset:1}*/>
            <form onSubmit={modifyRegularTelecomAccess}>
                <FlexH x='flex-start' y='center'>
                    <h5 style={{marginBottom: '2rem'}}>Regular Pack Permission</h5>{/*<Form.Check type='switch' onInput={e=>setSwitchRegularPack(e.target.checked)}/>*/}
                </FlexH>
                <div>
                    {telecoms?.map(({_id,name}) => <div /*x='space-between' y='center'*/ style={{minWidth:'30%',marginBottom:'1rem'}} key={_id}> <SwitchItem label={name} check={modifiedRegularAccess?.includes(name)} identity={`regular-${name}`} handleChange={e=>toggleRegularAccess(e.target.checked,name)}/></div>)}
                    {/*switchRegularPack&& <Stack/>*/}
                </div>
                <FlexH x='flex-end' y='center'><ThemeButton type='submit'>{loading?<ThemeSpinner />:'SAVE'}</ThemeButton></FlexH>
            </form>
        </Col>
                        <GapV x='4'/>
    </FlexH>
    

    return <>{isMobile ? (
        <Col /*xs={12}*/>
          <Accordion title='Telecom Settings' content={content}/>
        </Col>
      ) : <div style={{width:'100%'}} /*xl={8}*/>{content}</div>}</>
}
