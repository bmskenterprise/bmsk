import {useEffect,useState} from 'react'
import {useLocation,useNavigate,useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import {useAdminAuth} from '../../contexts/AdminAuthContext';
import {useTelecom} from '../../contexts/TelecomContext';
import {FlexH,FlexV,GapV,Icon,InputField,DatePicker,Select,ErrorText,ThemeButton,Spinner} from '../../components/styles/Admin.style';
//import {validatePack} from '../../utils/validate'
import {fetchObject} from '../../hooks/useFetch'
import {addData,editData} from '../../hooks/useModify'
import {validateRegularPack} from '../../utils/validate'
import url from '../../config/url'

export default () =>{
    const navigate = useNavigate()
    const location = useLocation()
    const {id} = useParams()
    const regular = {id:location.state?.id,operator:location.state?.operator,category:location.state?.category,title:location.state?.title,price:location.state?.price,expireDate:location.state?.expireDate}
    const {icons,telecomCategories,loading}=useTelecom()
    const {admin:{accesses}} = useAdminAuth()
    const [formData,setFormData] = useState(regular);
    const [errors,setErrors] = useState({});
    const hasAccess = accesses?.includes('modify-regular')
               const msg = 'You don\'t have modify permission'
    
    useEffect(e=>{
        if(!location?.state){
            let {data}= fetchObject(`${url.urlRegular}/${id}`)
            setFormData(data)
        }
    },[])
    const handleSubmit = e=>{
        e.preventDefault();
                   if(!hasAccess) {toast.info('You don\'t have modify permission');return}
        const {id,operator,category,title,price,expireDate} = formData/*{operator:opt,title:e.target.title.value.trim(),price:e.target.price.value.trim()//,expireDate:e.target.expire.value//};*/
        if(JSON.stringify(formData)==JSON.stringify(regular)) {toast.info('No Changes');return}
        let validationErrors = validateRegularPack(formData);
        if(Object.keys(validationErrors).length>0){setErrors(validationErrors);return}
        if(id){
            editData(`${url.urlRegular}/${id}`,{category,title,price,expireDate},'Pack Edited','Failed to Edit Pack');
        }else addData(url.urlRegular,{operator,category,title,price,expireDate},'Pack Added','Failed to Add Pack')
        navigate(-1)
    };
    const handleChange = e=>setFormData({...formData,[e.target.name]:e.target.value})
                       
                           
                          
                         
                          
    return !hasAccess?<Center>{msg}</Center>:<div>{formData.operator&& <div><h3><Icon src={icons[formData.operator]} x='1.5'/></h3><h4 style={{marginBottom:'4rem'}}>{formData.title?'Edit':'Add'} Package</h4></div>}
            <form onSubmit={/*e=>addRegularPack(formData)*/handleSubmit/*(formData)*/}>
                {/*operator? <h2>Edit {operator} package</h2>: <Flex>
                    {operators.map(({operatorName,icon},i)=> <div style={{marginRight:'3rem'}} key={i}><input type="radio" name="op" id={operatorName} hidden/><label htmlFor={operatorName}><img src={icon} alt="" />{operatorName}</label></div>)}
                </Flex>*/}
                <div /*x="flex-start" y='flex-start'*/>
                    <InputField style={{width:'100%'}} placeholder='Pack Title' value={formData.title} name='title' onChange={handleChange}/>
                    <ErrorText>{errors?.title}</ErrorText>
                </div><GapV x='3'/>
                <FlexH x='space-between' y='center'>
                    <div style={{width:'12rem'}} >
            {/*<InputGroup.Text>&#2547;</InputGroup.Text>*/}
                        <InputField  placeholder='Price' value={formData.price} name='price' onChange={handleChange}/>
                        <ErrorText>{errors?.price}</ErrorText>
                    </div>
                    <div style={{width:'12rem'}}>
                        <Select name='category' style={{width:'100%'}} value={formData.category} onChange={handleChange}>
                            {telecomCategories?.map(({id,category})=> <option key={id} style={{textTransform:'capitalize'}} value={category}>{category}</option>)}
                        </Select>
                    </div>
                    <div style={{width:'12rem'}}>
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
