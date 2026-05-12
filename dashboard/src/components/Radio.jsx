import {useRef} from 'react'
import {GapH,Switch} from './styles/Admin.style'

export default ({label,check,v,n,identity,handleChange}) =>{
  const chb = useRef(null);
  const toggleCheckbox = e=>{handleChange?.({target: {checked:!check, value:v??'',name:n??''}});};
  
  return <div>
  <Switch /*style={{display:'inline-block'}}*/ onClick={toggleCheckbox}><input ref={chb} type='radio' checked={check??false} value={v??''} id={identity??''} onChange={handleChange} name={n??''}/><div></div></Switch>
  {label&&<><GapH x='0.8'/><label style={{cursor:'pointer'}} htmlFor={identity}>{label}</label></>}
</div>
}