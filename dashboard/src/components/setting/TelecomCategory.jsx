import {useEffect,useState,useRef} from 'react';
import {useLocation} from 'react-router-dom';
import {useMediaQuery} from 'react-responsive';
import {BsPlusLg} from 'react-icons/bs'
import {FaPen,FaTrash} from 'react-icons/fa';
import {toast} from 'react-toastify';
import {Col,FlexH,GapV,GapH,ScrollViewV,InputField,ErrorText,Stack,ThemeButton,IconButton,Spinner} from '../styles/Admin.style'
import {useTheme} from '../../contexts/ThemeContext';
import Accordion from './Accordion'
import url from '../../config/url';
import validURL from '../../utils/validURL';
import SwitchItem from '../Switch'

export default  () =>{
    let init = {id:null,category:''}
    let location = useLocation();
    const isMobile = useMediaQuery({ maxWidth: 768 });
    let [categoriesRef,linkRef]=[useRef(null),useRef(null)];
    const [categories,setCategories] = useState([]);
        const [telecomCategory,setTelecomCategory] = useState(init);
        const [editMode,setEditMode] = useState(false);
        const {modeData:{backSecondary,textSecondary}} = useTheme();
    const [loading,setLoading]=useState(false)
const [error,setError]=useState('');
const [hover,setHover]=useState(false);
    useEffect(()=> {fetchCategories()},[])
    const fetchCategories = async e=>{
        try{
            let res = await fetch(url.urlTelecomCategory,{credentials:'include'})
            let data = await res.json()
            if(!res.ok) throw new Error('failed to fetch categories')
            setCategories(data);
        }catch(e) {toast.error(e.message)}
    }

    const addTelecomCategory = async () =>{
        setLoading(true)
        try{
            let res= await fetch(url.urlTelecomCategory, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type':'application/json' },
                body: JSON.stringify({category:telecomCategory.category,active:true})
            })
            let data = await res.json()
            if(!res.ok) throw new Error(data.error||'failed to add image link')
            setCategories(data.categories);
            toast.success(data.message)
        }catch(e) {toast.error(e.message)}
        finally{setLoading(false);setTelecomCategory(init);setEditMode(false)}
    };    

    const editTelecomCategory = async (id,category,active) =>{
        setLoading(true)
        try{
            let res= await fetch(`${url.urlTelecomCategory}/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type':'application/json' },
                body: JSON.stringify({category,active})
           })
           let data = await res.json()
           if(!res.ok) throw new Error(data.error||'failed to update image link')
           setCategories(data.categories)
        }catch(e) {toast.error(e.message)}
        finally{setLoading(false);setTelecomCategory(init);setEditMode(false)}
    };



    const deleteTelecomCategory = async categoryId =>{
            setLoading(true);
        try{
            let res= await fetch(`${url.urlTelecomCategory}/${categoryId}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            let data = await res.json()
            if(!res.ok) throw new Error(data.error)
            setCategories(data.categories);toast.success(data.message)
        }catch(e) {toast.error(e.message)}   
        finally{setLoading(false)}
    };
        const handleSubmit = e =>{
            e.preventDefault()
            if(telecomCategory.category.length>20) {setError('category is too long');return}
            if(telecomCategory.some(l=>l.category==telecomCategory.category))return setError('category already exists');
            if(telecomCategory.id) editTelecomCategory(telecomCategory.id,telecomCategory.category)
            else addTelecomCategory()
        }

        let content = <div style={{background:backSecondary,color:textSecondary,padding:'0.5rem',minHeight:'48rem'}}>
                <h4 style={{marginBottom:'2rem'}}>Telecom Category</h4>
                <ScrollViewV style={{maxHeight:'32rem'}}>{!editMode&&<FlexH x='space-between' y='center' ref={categoriesRef}>
                    <FlexH x='flex-end' style={{width:'100%'}}><IconButton onClick={e=>{setEditMode(true);setTelecomCategory(init)}}><BsPlusLg/></IconButton></FlexH>
                    {categories?.map(({_id,category,active}) => <FlexH x='space-between' y='center' key={_id} style={{width:'100%'}}>
                        <div>{category}</div>
                      <FlexH x='space-between' y='center' style={{width:'40%'}}>
                            <SwitchItem  check={active} handleChange={e=>editTelecomCategory(_id,undefined,e.target.checked)} />
                            <IconButton onClick={e=> {setEditMode(true);setTelecomCategory({id:_id,category})}}><FaPen /></IconButton>
                            <IconButton onClick={e=>deleteTelecomCategory(_id)}><FaTrash /></IconButton>
                        </FlexH>
                        </FlexH>
                    )}
                </FlexH>}
                {editMode&&<form onSubmit={handleSubmit}>
                    <div>
                        <div /*x='flex-start' y='flex-start'*/><InputField style={{width:'100%'}} value={telecomCategory.category} placeholder='telecom category' onChange={e=>setTelecomCategory({...telecomCategory,category:e.target.value})}/><ErrorText style={{color:'red'}}>{error}</ErrorText></div><GapV x='1.5'/>
                        <FlexH x='flex-end'><button type='button' onClick={e=>setEditMode(false)}>CANCEL</button><GapH x='1'/><ThemeButton type='submit' disabled={loading}>{loading?<Spinner size='1'/>:'SAVE'}</ThemeButton></FlexH>
                    </div>
                </form>}</ScrollViewV>
        </div>

    return <>{isMobile ? (
        <Col>
          <Accordion title='Telecom Category' content={content}/>
        </Col>
      ) : <Col>{content}</Col>}</>
}
