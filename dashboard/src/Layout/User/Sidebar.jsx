import {NavLink} from 'react-router-dom'
import {SidebarContainer} from '../../components/styles/Admin.style'
import {Avatar,InlineBadge} from '../../components/styles/Admin.style'
import logo from '../../assets/logo.svg'
import {useUserNotification} from '../../contexts/UserNotificationContext'
import {useTheme} from '../../contexts/ThemeContext'

export default ({sidebarToggler})=>{
    const {topup,regular,drive,bill,bank,deposit} = useUserNotification();
    const {themeData:{themeBackground,themeText}} = useTheme();
    const activeLink= ({isActive})=> isActive?'active':''
    return <SidebarContainer /*isSidebar={sidebarToggler} style={{background:themeBackground,color:themeText}}*/ >
          <div style={{height:'4rem'}}><Avatar src={logo} className=" " alt=" " /></div>
          <ul>
              {/*<li>
              <ul>*/}
              <li><NavLink to='/user/topup' className={activeLink}>Topup {topup>0&& <InlineBadge >{topup}</InlineBadge>}</NavLink></li>
              <li><NavLink to='/user/regular' className={activeLink}>Regular {regular>0&& <InlineBadge >{regular}</InlineBadge>}</NavLink></li>
              <li><NavLink to='/user/drive' className={activeLink}>Drive {drive>0&& <InlineBadge >{drive}</InlineBadge>}</NavLink></li>
              {/*<li><NavLink to='/user/bill'>Bill {bill>0&& <InlineBadge >{bill}</InlineBadge>}</NavLink></li>
              <li><NavLink to='/user/bank'>Bank {bank>0&& <InlineBadge >{bank}</InlineBadge>}</NavLink></li>
              <li><NavLink to='/user/deposit'>Deposit {deposit>0&& <InlineBadge >{deposit}</InlineBadge>}</NavLink></li>*/}
              {/*</ul>*/}
          </ul>
      </SidebarContainer>
}