import React,{useEffect,useState} from 'react';
import {Accordion,Col} from 'react-bootstrap';
import {useMediaQuery} from 'react-responsive';
import {toast} from 'react-toastify';
import {FlexH,ScrollViewV,ThemeButton,ErrorText,TA,Spinner} from '../styles/Admin.style';
import url from '../../config/url';
import {useTheme} from '../../contexts/ThemeContext'

export default ()=>{
  const [banks,setBanks] = useState();
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(false);
  const {modeData:{backSecondary,textSecondary}} = useTheme();
  const {isMobile} =useMediaQuery({maxWidth:768})
  useEffect(()=>{fetchBanks()},[])
  const fetchBanks = async e=>{
    try{
      let res = await fetch(url.urlBankNames,{credentials:'include'});
      let data = await res.json();
      if(!res.ok) throw new Error('')
      setBanks(data)
    }catch(e) {toast.error(e.message)}
  }
  const saveBankNames = async(e) =>{
    e.preventDefault();
    let names = e.target['bank-names'].value.trim()
    if(names.length>500) {setError('Too many characters');return}  //
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
  
  let content= <div style={{background:backSecondary,color:textSecondary}}>
    <h4 style={{marginBottom:'2rem'}}>Bank Names</h4>
    <form onSubmit={saveBankNames}>
      <ScrollViewV style={{height:'15rem',width:'100%'}}><TA  style={{width:'100%',height:'100%'}} name="bank-names" value={banks} onChange={e=>setBanks(e.target.value)}></TA></ScrollViewV>
      <ErrorText>{error&&error}</ErrorText>
      <FlexH x='flex-end' y='center'><ThemeButton  type="submit" disabled={loading}>{loading?<Spinner  size='1'/>:'SAVE'}</ThemeButton></FlexH>
    </form>
  </div>
  
  return <>{isMobile?<Col xs={12}>
              <Accordion>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Banks </Accordion.Header>
                  <Accordion.Body>{content}</Accordion.Body>
                </Accordion.Item>
              </Accordion>
              </Col>:<Col md={6} xl={4}>{content}</Col>
      }</>
}