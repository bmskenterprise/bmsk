import React,{useEffect,useState} from 'react';
import {useMediaQuery} from 'react-responsive';
import {toast} from 'react-toastify';
import {useTheme} from '../../contexts/ThemeContext'
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {ScrollViewV,Col,FlexH,GapV,ThemeButton,ErrorText,TA,Spinner} from '../styles/Admin.style';
import Accordion from './Accordion';
import url from '../../config/url';

export default ()=>{
    const isMobile = useMediaQuery({maxWidth:768})
    const {admin} = useAdminAuth()
    const accesses = admin?.accesses
  const [banks,setBanks] = useState();
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(false);
  const {modeData:{backSecondary,textSecondary}} = useTheme();
  
  useEffect(()=>{fetchBankNames()},[])
  
  const fetchBankNames = async e=>{
    try{
      let res = await fetch(url.urlBankNames,{credentials:'include'});
      let data = await res.json();
      if(!res.ok) throw new Error('')
      setBanks(data.bankNames)
    }catch(e) {toast.error(e.message)}
  }
  const saveBankNames = async(e) =>{
    e.preventDefault();
    if(!accesses?.includes('modify-setting')) {toast.info('you don\'t have modify permission');return}
    let names = e.target['bank-names'].value.trim()
    if(names.length>500) {setError('Too many characters');return} //
    if(!names) {toast.info('Enter Bank Names');return}
    names.split(/[,\n]/).map(n=>{if(n.length>50) {setError('A bank name is greater than 50 chars');return}});
    
    setLoading(true)
    try{
      let res = await fetch(url.urlBankNames,
        {
          method:'PATCH',
          credentials:'include',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({banks:names})
        }
      );
      let data = await res.json();
      if(!res.ok) throw new Error(data.error)
      toast.success('Bank names saved')
    }catch(e) {toast.error(e.message)}
    finally{setLoading(false)}
  }
  
  let content = <div style={{background:backSecondary,color:textSecondary,padding:'0.5rem'}}>
    <h4 style={{marginBottom:'2rem'}}>Bank Names</h4>
    <form onSubmit={saveBankNames}>
      <ScrollViewV style={{height:'13rem',width:'100%'}}><TA  style={{width:'100%',height:'100%'}} name='bank-names' value={banks} onChange={e=>setBanks(e.target.value)}></TA></ScrollViewV>
      <ErrorText>{error&&error}</ErrorText><GapV x='2'/>
      <FlexH x='flex-end' y='center'><ThemeButton  type='submit' disabled={loading}>{loading?<Spinner  size='1'/>:'SAVE'}</ThemeButton></FlexH>
    </form><GapV x='2'/>
  </div>
  
  return <>{isMobile?<Col /*xs={12}*/>
              <Accordion title='Banks' content={content} />
              </Col>:<Col /*md={6} xl={4}*/>{content}</Col>
      }</>
}
              
                
                  
                   
