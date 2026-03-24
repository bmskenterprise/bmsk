import {useState} from 'react'
import {useLocation,useNavigate} from 'react-router-dom'
import {useMediaQuery} from 'react-responsive'
import {toast} from 'react-toastify'
import {FlexH,GapH,GapV,InputField,ErrorText,TA,DatePicker,ThemeButton,Loader,Spinner} from '../../components/styles/Admin.style';
import {useMessage} from '../../contexts/MessageContext';
import {useTheme} from '../../contexts/ThemeContext'
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {getCurrentLocalDateTime} from '../../utils/date'
import SwitchItem from '../../components/Switch';
import adminPIN from '../../components/AdminPIN'

export default  () =>{
        let location = useLocation()
        let navigate= useNavigate()
        let isMobile = useMediaQuery({maxWidth:768})
        let init = location?.state
        const {thememode,themeData} = useTheme()
        const {addNotice,editNotice,loading,errors} = useMessage();
        const {themeBackground,themeText}=themeData
        /*const [notificationInit,setNotificationInit] = useState(false);
        const [outgoings, setOutgoings] = useState([]{receipant:'notification',subject:'',message:''});*/const [noticeInit,setNoticeInit] = useState(init);
        const recipient = [];
        const medium = []
        let ahead=new Date((new Date()).setDate((new Date()).getDate()+2)).toISOString().slice(0,17)+'00'/*useEffect(()=> {
            durationRef.current.value = (new Date((new Date()).setDate((new Date()).getDate()+2)).toISOString()).slice(0,17)+'00'
        },[])*/
        const {appData} = useAdminAuth();
        const getTextValue = e=> setNoticeInit(prev=>({...prev,notice:{...prev.notice,[e.target.name]:e.target.value}}));
        const getBooleanValue = e=> setNoticeInit(prev=>({...prev,repeat:e.target.checked}));
        const mark = (selected,value,check) =>{
            if(check) setNoticeInit(prev=>({...prev,[selected]:[...prev[selected],value].sort()}));
            else setNoticeInit(prev=>({...prev,[selected]:prev[selected].filter(v=>v!=value).sort()}));
        }
        const handleForm = e=>{
            e.preventDefault()
            init.recipient.sort();init.medium.sort()//sendNotice({recipient,medium,notice:{title:e.target.title.value.trim(),description:e.target.description.value.trim()},duration:e.target.duration.value,repeat:e.target.repeat.checked})
            if(JSON.stringify(init)===JSON.stringify(noticeInit)) {toast.info('No Changes Made');return}
            if(init.id) adminPIN(thememode,{cb:editNotice,data:{id:init.id,noticeData:noticeInit}},'SEND')
            else adminPIN(thememode,{cb:addNotice,data:noticeInit},'SEND') //= notices.find(n=> n._id==msgId)
        };

        return <div>
            <h4 style={{marginBottom:'5rem'}}>Send Notice</h4>
            <form onSubmit={handleForm}><FlexH x='space-between' y='flex-start' style={{minHeight:'12rem'}}>
                    <div /*x='flex-start' y='space-between'*/ style={{width:isMobile?'100%':'45%'}}>
                        <FlexH x='space-between' y='center' style={{width:'100%'}}>
                            <FlexH x='flex-start'><SwitchItem label='Push' check={noticeInit.medium?.includes('push')} v='push' identity='push' handleChange={e=>mark('medium','push',e.target.checked)}/>    </FlexH>
                            <FlexH x='flex-start'><SwitchItem label='In App' check={noticeInit.medium?.includes('in-app')} v='in-app' identity='in-app' handleChange={e=>mark('medium','in-app',e.target.checked)}/>    </FlexH>
                            <FlexH x='flex-start'><SwitchItem label='Inbox' check={noticeInit.medium?.includes('inbox')} v='inbox' identity='inbox' handleChange={e=>mark('medium','inbox',e.target.checked)}/>   </FlexH>
                        </FlexH><GapV x='4'/>
                        <FlexH x='space-between' y='center' style={{width:'100%'}}>
                            <div><label htmlFor='duration'>Duration</label><GapH x='0.5'/><DatePicker type='datetime-local' value={noticeInit.noticeDuration} name='duration' id='duration' min={getCurrentLocalDateTime()} onChange={e=>setNoticeInit(prev=>({...prev,noticeDuration:e.target.value}))}/></div>
                            <FlexH x='flex-start'><SwitchItem check={noticeInit.repeat} label='Repeat' v='repeat' identity='repeat' n='repeat' handleChange={getBooleanValue}/></FlexH>
                        </FlexH>
                    </div> 
                    <div /*x='flex-start' y='space-between'*/ style={{marginTop:isMobile?'4rem':'0',width:isMobile?'100%':'20%'}}>    
                            {appData?.userLevels.map(({name},i)=> <FlexH x='flex-start' y='center' key={i} style={{marginBottom:'1rem'}}><SwitchItem check={noticeInit.recipient?.includes(name)} label={name} v={name} identity={name} handleChange={e=>mark('recipient',name,e.target.checked)}/> </FlexH>)}
                    </div>    
                </FlexH><GapV x='8'/>
                <div>
                    <div>
                        <InputField name='title' value={noticeInit.notice?.title} placeholder='Notice Title' onChange={getTextValue}/>
                        <ErrorText>{errors?.title}</ErrorText>
                    </div><GapV x='2'/>
                    <div>
                        <TA name='description' style={{width:'100%',minHeight:'6rem'}} value={noticeInit.notice?.description} placeholder='Notice Description' onChange={getTextValue}></TA>
                        <ErrorText>{errors?.description}</ErrorText>
                    </div>
                </div>
            {/*<ScrollViewV><div>{notices?.map(({_id,title,description,active},i)=> active&&<FlexH x='flex-start' key={i} style={getStyle(_id)} onClick={e=>setMsgId(_id)}><b>{title}</b>&nbsp;<p>{description}</p></FlexH>)}</div></ScrollViewV> */}
                <FlexH x='flex-end' y='center' style={{marginTop:'4rem'}}><button type='button' style={{marginRight:'2rem'}} onClick={e=>navigate(-1)}>CANCEL</button><ThemeButton  type='submit' disabled={loading}>{loading?<Spinner />:'SEND'}</ThemeButton></FlexH>
                </form>{/*notificationInit && <Form validated={validated} onSubmit={handleSubmit}>
                    {<Form.Group>
                        <Form.Label>Reseller</Form.Label>
                        <Form.Select onChange={e=>setNotification({...notification,receipant:e.target.value})}>
                            <option value="notification">App Notification</option>
                            <option value="text-msg">inbox</option>
                            <option value="reseller">In App</option>
                        </Form.Select>
                    </Form.Group>}
                    <Button type='reset' onClick={e=>setNotificationInit(false)}>cancel</Button>
                    <Button type='submit'>Send</Button></form>*/}
                {/*!notificationInit && <div>
                    <Button onClick={e=>setNotificationInit(true)}>New Message</Button>
                    <table>
                        <tr>
                            {fields.map(f=> <th>{f}</th>)}
                        </tr>
                        {<tr>
                            {fields.map(f=> <th>{f}</th>)}
                        </tr>}
                    </table></div>*/}
            {loading && <Loader><Spinner></Spinner></Loader>}
        </div>
}
