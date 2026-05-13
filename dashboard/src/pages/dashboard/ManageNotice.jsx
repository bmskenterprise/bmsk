import {useEffect,useState} from 'react'
import {useNavigate} from 'react-router-dom';
import {formatDistanceToNow} from 'date-fns';
import {FaPen,FaTrash} from 'react-icons/fa';
import {useTheme} from '../../contexts/ThemeContext';
import {useMessage} from '../../contexts/MessageContext'
import {ScrollViewH,ScrollViewV,FlexH,StripedList,ThemeButton,IconButton,Loader,Spinner} from '../../components/styles/Admin.style'
import {getAheadLocalDateTime,renderLocalTimeFromUTC,getLocalDateTimeFromUTC} from '../../utils/date'
import useLongPress from '../../hooks/longPress';
import SwitchItem from '../../components/Switch'
import deleteConfirm from '../../components/Confirmation'
import useArrayFetch from '../../hooks/useArrayFetch'
import url from '../../config/url'  

export default  ({}) =>{
    const {data} = useArrayFetch(url.urlNotice)
    const navigate = useNavigate()
    const ahead = new Date((new Date()).setDate((new Date()).getDate()+2)).toISOString().slice(0,16)  
    const formInit = {id:null,recipient:[],medium:[],noticeDuration:getAheadLocalDateTime(2),repeat:false,notice:{title:'',description:''}};
    const {thememode,modeData:{backSecondary,textPrimary}} = useTheme();
    const {notices,addNotice,editNotice,toggleNoticeStatus, deleteNotice,loading} = useMessage();
    const [errors,setErrors] = useState({})
    const [selected,setSelected] = useState([]);
     const [hovered, setHovered] = useState(false);
    const [modifiedNotices,setModifiedNotices] = useState(data)
    const fields = [ 'Date', 'Notice','Status','Action'  ];
    const [init, setInit] = useState(formInit);
    const [form,setForm] = useState(false)
    
    useEffect(()=> {
        if(data?.length>0) setModifiedNotices(data)
    },[data])
    
    const check = (id)=>{
      let i=selected.indexOf(id)
      if(0<=i){setSelected(selected.filter(i=>i!=id))}
      else{setSelected([...selected,id]);}
    };
    const {start,clear} = useLongPress(check)
    const onClickOrHold = id =>{
        if(selected[0]) check(id)
        else start(id) // {/* </Col> */}
    }
    /*const handleSubmit=e=>{
        e.preventDefault()
        if(init.id) {editNotice(init.id,init);setForm(false)}
        else addNotice(init)
    }*/
    //const {notices,loading} = useMessage()
    const toggleNotice =async (id,status)=>{
        setModifiedNotices(prev=> prev.map(n=>n._id==id?{...n,active:status}:n));
            /*let data=await */toggleNoticeStatus(id,status);//setModifiedNotices(data)
        } // 
    return <div >  
        {/*<Col xs={12}>
          <Accordion.Item eventKey="0">*/}
            <h4>Manage Notice</h4><GapV x='4'/>
            <div>
            {/* <Sidebar></Sidebar> */}
                {/*<h4 style={{marginBottom: '3rem'}}>Notice</h4>*/}
                {/*!init && <Button onClick={e=>setInit(formInit)}>Add Notice</Button>*/}
                {/*form && <form onSubmit={handleSubmit}>
                    <FlexV x='flex-start' y='flex-start'>
                        <InputField   value={init.title} placeholder='Notice Title' onChange={e=>setInit({...init,title:e.target.value})}/>
                        <ErrorText>{errors?.title}</ErrorText>
                    </FlexV><GapV x='1'/>
                    <FlexV x='flex-start' y='flex-start'>
                        <TA   placeholder='Notice Description' rows={4} cols={50} value={init.description} onChange={e=>setInit({...init,description:e.target.value})}></TA>
                        <ErrorText>{errors?.description}</ErrorText>
                    </FlexV>
                    <FlexH x='flex-end' y='center'><button onClick={e=>setForm(false)}>CANCEL</button><ThemeButton   type='submit' disabled={loading}>{loading?<Spinner  size="1"/>:init.id?'Edit Notice':'Add Notice' }</ThemeButton></FlexH>
                </form>*/}
                  <><FlexH x='flex-end'><ThemeButton  onClick={e=>{navigate('/dashboard/notice/add',{state:formInit})}}>Add Notice</ThemeButton></FlexH>
                    <div style={{marginTop:'2rem'}}>{/*selected[0]&&<FlexH x='flex-end' y='center'><IconButton style={{color:textPrimary}} onClick={e=>deleteNotice(selected)}>  <FaTrash/></IconButton></FlexH>*/}
                        
                        {/*<table><thead><tr>{fields.map((f,i)=> <th key={i}>{f}</th>)}</tr></thead><tbody>*/}
                              
                        <ScrollViewV><ScrollViewH style={{width:'100%'}}>
                        {modifiedNotices?.map(({_id,updatedAt,notice,recipients,receiveMedium,duration,repeat,active})=> <StripedList style={{width:'88rem'}}  key={_id} onMouseDown={e=>onClickOrHold(String(_id))} onMouseUp={clear} onMouseLeave={clear} /*onTouchStart={e=>start(_id)}*/ onTouchEnd={clear} onTouchCancel={clear} /*onClick={e=>{selected[0] &&check(_id)}}*/>
                            {/*<td style={{width:'5%'}}>{i+1}</td>*/}
                            {/*<td>{(n.createdAt).slice(0,10).split('-').reverse().join('-')}</td>*/}
                            <div style={{width:'15%'}} onMouseOver={e=>setHovered(true)} onMouseOut={e=>setHovered(false)}>{hovered?formatDistanceToNow(updatedAt,{addSuffix:true}):getLocalDateTimeFromUTC(updatedAt)}</div>
                            <div style={{width:'75%'}}><b>{notice.title}</b> {notice.description}</div>
                            <div style={{width:'5%'}}><SwitchItem  check={active} handleChange={e=>toggleNotice(_id,e.target.checked)}/></div>
                            <div style={{width:'5%'}}>
                                <IconButton  onClick={e=>{navigate('/dashboard/notice/edit',{state:{id:_id,notice,recipient:recipients,medium:receiveMedium,noticeDuration:renderLocalTimeFromUTC(duration),repeat}})}}><FaPen/></IconButton>
                                <IconButton onClick={e=>deleteConfirm(thememode,deleteNotice,[_id])}><FaTrash/></IconButton>
                            </div>
                        </StripedList>)}
                    {/*</tbody></table>*/}</ScrollViewH></ScrollViewV>
                    </div>
                </>
        </div>
        {loading&& <Loader><Spinner></Spinner></Loader>}  
      </div>
}
