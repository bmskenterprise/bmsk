import React,{useEffect,useState} from 'react'
import {useLocation,useNavigate,useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import {useTheme} from '../../contexts/ThemeContext';
import {FlexH,FlexV,GapV,Icon,InputField,DatePicker,Select,ErrorText,ThemeButton,Spinner} from '../../components/styles/Admin.style';
//import {usePack} from '../../contexts/PackContext'
import {useTelecom} from '../../contexts/TelecomContext';

export default () =>{
    const categories = ['bundle','internet','minute','gift']
    const navigate = useNavigate()
    const location = useLocation()
    const {id} = useParams()
    const regular = {id:location.state?.id,operator:location.state?.operator,category:location.state?.category,title:location.state?.title,price:location.state?.price,expireDate:location.state?.expireDate}
    const [formData,setFormData] = useState(regular);
    const {icons,fetchRegular,addRegularPack,editRegularPack,errors,loading}=useTelecom()
    const {themeData,modeData} = useTheme()
    
    useEffect(e=>{
        if(!location.state){
            let data= fetchRegular(id)
            setFormData(data)
        }
    },[])
    const handleSubmit = e=>{
        e.preventDefault();
        const {id,operator,category,title,price,expireDate}=formData/* = {operator:opt,title:e.target.title.value.trim(),price:e.target.price.value.trim()//,expireDate:e.target.expire.value//};*/
        if(JSON.stringify(formData)==JSON.stringify(regular)) {toast.info('No Changes');return}
      //let validationErrors = validatePack(formData);
      //if(Object.keys(validationErrors).length>0){setErrors(validationErrors);return}
      if(id){
        editRegularPack(id,{category,title,price,expireDate});
        navigate(-1)
      }else addRegularPack({operator,category,title,price,expireDate})
    };
    const handleChange = e=>setFormData({...formData,[e.target.name]:e.target.value})
                       
                           
                      
                          
                         
                          
                      
    return <div>{formData.operator&& <div><h3><Icon src={icons[formData.operator]} x='1.5'/></h3><h4 style={{marginBottom:'4rem'}}>{formData.title?'Edit':'Add'} Package</h4></div>}
            <form onSubmit={/*e=>addRegularPack(formData)*/handleSubmit/*(formData)*/}>
                {/*operator? <h2>Edit {operator} package</h2>: <Flex>
                    {operators.map(({operatorName,icon},i)=> <div style={{marginRight:'3rem'}} key={i}><input type="radio" name="op" id={operatorName} hidden/><label htmlFor={operatorName}><img src={icon} alt="" />{operatorName}</label></div>)}
                </Flex>*/}
                <div /*x="flex-start" y='flex-start'*/>
                    <InputField style={{width:'100%'}} placeholder='Pack Title' value={formData.title} name='title' onChange={handleChange}/>
                    <ErrorText>{errors?.title}</ErrorText>
                </div><GapV x='3'/>
                <FlexH x='space-between' y='center'>
                    <div style={{width:'14rem'}} >
            {/*<InputGroup.Text>&#2547;</InputGroup.Text>*/}
                        <InputField  placeholder='Price' value={formData.price} name='price' onChange={handleChange}/>
                        <ErrorText>{errors?.price}</ErrorText>
                    </div>
                    <div style={{width:'14rem'}}>
                        <Select name='category' style={{width:'100%'}} value={formData.category} onChange={handleChange}>
                            {categories.map((c,i)=> <option key={i} value={c}>{c}</option>)}
                        </Select>
                    </div>
                    <div style={{width:'14rem'}}>
                        <DatePicker type='date' style={{width:'100%'}}   value={formData.expireDate} name='expireDate' onChange={handleChange}/>
                    </div>
                </FlexH><GapV x='5'/>
                {/*<InputGroup className="-">*/}
        {/*<InputGroup.Text>&#2547;</InputGroup.Text>
                    <Form.Control type="number" placeholder='commission' value={initData.commission} onBlur={e=>formData.commission=e.target.value} />
                    <Form.Feedback htmlFor="p-commission">{errors.commission && commission}</Form.Feedback>
                </InputGroup>*/}
                {/* </Form.Group> */}
                <FlexH x='flex-end' y='center'>
                    <button type='button' onClick={e=>navigate(-1)}>CANCEL</button>
                    <ThemeButton type='submit' style={{marginLeft:'1rem'}} disabled={loading}>{loading?<Spinner size='1'/>:formData.title?'EDIT':'ADD'}</ThemeButton>
                </FlexH>
            </form>
        </div>
}