import {useTheme} from '../contexts/ThemeContext'

export default ({belong,handleFailed}) =>{
                    const {modeData} = useTheme()
  const errorlist = {cursor:'pointer',width:'100%',marginBottom:'1rem'}
    
  return <ul style={{background:modeData.backSecondary,width:'200%',padding:'0.5rem',top:'0',right:'0',position:'absolute',zIndex:'100'}}>
             <li style={errorlist} onClick={e=>handleFailed(belong.id,belong.user,'unavailable')}>Unavailable</li>
                          <li style={errorlist} onClick={e=>handleFailed(belong.id,belong.user,'invalid')}>Invalid</li>
                          <li style={errorlist} onClick={e=>handleFailed(belong.id,belong.user,'error')}>Error</li>
                        </ul>
}