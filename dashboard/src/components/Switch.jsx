import {useRef} from 'react';
import {GapH,Switch} from '../components/styles/Admin.style';

export default ({v,identity,label,check,handleChange,n}) => {
  const chb = useRef(null);
  
  const defaultHandleChange = e=>{};
  const toggleCheckbox = e=>{handleChange?.({target: {checked:!check, value:v??'',name:n??''}});
    //chb.current.checked = !chb.current.checked;
    //chb.current.dispatchEvent(new Event('change'));
  };
  
  return <>
  <Switch style={{display:'inline-block'}} onClick={toggleCheckbox}><input ref={chb} type='checkbox' checked={check??false} value={v??''} id={identity??''} onChange={handleChange} name={n??''}/><div></div></Switch>
  {label&&<><GapH x='1'/><label style={{cursor:'pointer'}} htmlFor={identity}>{label}</label></>}
</>
}