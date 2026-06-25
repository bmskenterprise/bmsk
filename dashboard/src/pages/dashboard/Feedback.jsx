import {useEffect,useState} from 'react'
import {useNavigate,useSearchParams} from 'react-router-dom'
import {toast} from 'react-toastify';
import {useMediaQuery} from 'react-responsive';
import {formatDistanceToNow} from 'date-fns'
import {FaTrash} from 'react-icons/fa';
import {useTheme} from '../../contexts/ThemeContext';
import {useAdminAuth} from '../../contexts/AdminAuthContext';
import {Center,ScrollViewV,TR,IconButton,Loader,Spinner} from '../../components/styles/Admin.style';
import useObjectFetch from '../../hooks/useFetch'
import Pages from '../../components/Pagination';
import url from '../../config/url';

export default () =>{
    const navigate = useNavigate()
    const isMobile = useMediaQuery({maxWidth:768})
    const {admin} = useAdminAuth();
    const {themeData,modeData:{textPrimary}} = useTheme()
    const [searchParams] = useSearchParams()
    const [page,limit] = [searchParams.get('page')||'1',searchParams.get('limit')||'20'];
    const [loading,setLoading] = useState(false);
    const [feedbackData,setFeedbackData] = useState({feedbacks:[],pagination:{limit:20,currentPage:1,totalPage:1}});
    const {data} = useObjectFetch(`${url.urlFeedback}?limit=${limit}&page=${page}`)
  
    useEffect(()=>{navigate(`/dashboard/feedback?page=${page}&limit=${limit}`)},[])
  
  
  /*const fetchFeedbacks = async ({limit,page})=>{
    setLoading(true)
    try {
      const res = await fetch(`${url.urlFeedback}?limit=${limit}&page=${page}`,{credentials:'include'})
      const data = await res.json();
      if(!res.ok) throw new Error(data.error|| 'failed to fetch feedbacks')
      setFeedbackData(data)
    }catch(err) {toast.error(err.message)}
    finally {setLoading(false)}
  }*/
  
  const deleteFeedback = async (id)=>{
      setLoading(true)
      try {
        let res = await fetch(`${url.urlFeedback}/${id}`,{
          method:'DELETE',
          credentials:'include'
        })
        let data = await res.json();
        if(!res.ok) throw new Error(data.error|| 'failed to delete feedback')
        toast.success(data.message)
      }catch(e) {toast.error(e.message)}
      finally{setLoading(false)}
  }
    const pageNav = p=> navigate(`/dashboard/feedback?page=${p}&limit=${limit}`)
  /*const handleSubmit= e=>{
    e.preventDefault()
    fetchFeedbacks(limitRef.current.value,feedbackData.currentPage,userRef.current.value)
  }*/
  return <div>
    <h4 style={{marginBottom:'5rem'}}>User Feedbacks</h4>
    {data?.feedbacks?.length>0? <div>
              {/*<div>
                <form onSubmit={handleSubmit}>
                <Field   type="number" min="10" max='100' step='5' value='20' ref={limitRef} />
                <input style={{width:'50%',padding:'1rem'}} type="text" placeholder="user " ref={userRef} list='users'/>
                <datalist id='users'>
                    {admin.levels.map((l,i)=> <option key={i} value={l.name}/>)}
                </datalist>
                <button type='submit'>filter</button>
                </form>
            </div>*/}
            <ScrollViewV style={{width:'100%',height:'80vh'}}><table><tbody>
            {data?.feedbacks?.map(({_id,createdAt,user,description})=> <TR key={_id} style={{width:isMobile?'64rem':'87rem'}}>
              <td style={{width:'15%'}}>{formatDistanceToNow(createdAt,{addSuffix:true})}</td>
              <td style={{width:'18%'}}>{user}</td>
              <td style={{width:'62%'}}>{description}</td>
              <td style={{width:'5%'}}><IconButton style={{color:textPrimary}} onClick={e=>{deleteFeedback(_id)}}><FaTrash/></IconButton></td>
            </TR>)}
            </tbody></table></ScrollViewV>
                    {data?.pagination?.totalPage>1 && <Pages totalPage={data?.pagination?.totalPage} currentPage={data?.pagination?.currentPage} changePage={p=>pageNav(p/*,userRef.current.value*/)} />}
          </div>:<Center><p>No Feedback Yet</p></Center>}
          {loading&&<Loader><Spinner /></Loader>}
  </div>
}
