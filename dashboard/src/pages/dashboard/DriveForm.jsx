import {useState} from 'react';
//import { 
import {useLocation,useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import {FlexH,FlexV,GapV,ThemeButton,Icon,DatePicker,ErrorText,Spinner, InputField,Select} from '../../components/styles/Admin.style';
import {useTelecom} from '../../contexts/TelecomContext'
//import {usePack} from '../../contexts/PackContext';
import { useTheme } from '../../contexts/ThemeContext';

export default  (/*{initialData:{id,opt,title,price,commission,expireDate},handleCancel}*/) =>{
    let location = useLocation()
    let navigate = useNavigate();
    let drive= {id:location.state?.id,operator:location.state?.operator,category:location.state?.category,title:location.state?.title,price:location.state?.price,commission:location.state?.commission,expireDate:location.state?.expireDate}
    const [formData, setFormData] = useState(drive);
    let {themeData,modeData} = useTheme();
    const categories = ['bundle','internet','minute','gift'];
    const {icons,addDrivePack,editDrivePack,errors,loading} = useTelecom();
    
    const handleSubmit=e=>{
        e.preventDefault();
    const {id,operator,category,title,price,commission,expireDate}=formData/* = {operator:opt,title:e.target.title.value.trim(),price:e.target.price.value.trim(),commission:e.target.commission.value.trim()//,expireDate:e.target.expire.value//};*/
        if(JSON.stringify(formData)==JSON.stringify(drive)) {toast.info('No Changes');return}
        //let validationErrors = validatePack(formData);
        //if(Object.keys(validationErrors).length>0){setErrors(validationErrors);return}
        if(id){
            editDrivePack(id,{category,title,price,commission,expireDate})
            navigate(-1)
        }else addDrivePack({operator,category,title,price,commission,expireDate});
    }
    const handleChange = e=> setFormData({...formData,[e.target.name]:e.target.value})
                       
                               
                               
                              
                              
                          
                      
                         
                      
    return <div>
      <div>{formData.operator&& <div><Icon src={icons[formData.operator]} x='1.5'/><h3 style={{marginBottom:'4rem'}}>{formData.title?'Edit':'Add'}  Package</h3></div>}
            <form onSubmit={/*e=>addDrivePack(formData)*/handleSubmit}>
                {/*operator? <h2>Edit {operator} package</h2>: <Flex>
                    {operators.map(({operatorName,icon},i)=> <div style={{marginRight:'3rem'}} key={i}><input type="radio" name="op" id={operatorName} hidden/><label htmlFor={operatorName}><img src={icon} alt="" />{operatorName}</label></div>)}
                </Flex>*/}
                <div /*x="flex-start" y='flex-start'*/>
                    <InputField style={{width:'100%'}} placeholder='Pack Title' value={formData.title} onChange={handleChange} name='title'/>
                    <ErrorText>{errors?.title}</ErrorText>
                </div><GapV x='3'/>
                <FlexH x='space-between' y='center'>
                        <div   style={{width:'14rem'}}>
                {/*<InputGroup.Text>&#2547;</InputGroup.Text>*/}
                            <InputField  name='price' value={formData.price} onChange={handleChange} placeholder='Price'/>
                            <ErrorText>{errors?.price}</ErrorText>
                        </div>
                        <div   style={{width:'14rem'}}>
                {/*<InputGroup.Text>&#2547;</InputGroup.Text>*/}
                            <InputField  name='commission' value={formData.commission} onChange={handleChange} placeholder='Commission'/>
                            <ErrorText>{errors?.commission}</ErrorText>
                        </div>
                    {/* </FlexV> */}
                    <div   style={{width:'14rem'}}>
                        <DatePicker type='date' name='expireDate' style={{width:'100%'}}  value={formData.expireDate} onChange={handleChange} />
                    </div>
                    <div style={{width:'14rem'}}>
                        <Select name='category' style={{width:'100%'}} value={formData.category} onChange={handleChange}>
                            {categories.map((c,i)=> <option key={i} value={c}>{c}</option>)}
                        </Select>
                    </div>
                </FlexH><GapV x='5'/>
                <FlexH x='flex-end' y='center'>
                    <button type='button' onClick={e=>navigate(-1)}>CANCEL</button>
                    <ThemeButton type='submit' style={{marginLeft:'1rem'}} disabled={loading}>{loading?<Spinner size='1'/>:formData.title?'EDIT':'ADD'}</ThemeButton>
                </FlexH>
            </form>
        </div>
        {/*loading && <Spinner animation='border' role='status'></Spinner>*/}
        </div>
}
