import {useTheme} from '../../contexts/ThemeContext';
import {ScrollViewV,FlexH} from '../../components/styles/Admin.style';
import PGW from '../../components/setting/PaymentGateways';
import SMSGateways from '../../components/setting/SMSGateways';

export default () =>{
  const {modeData:{backPrimary}} = useTheme()
  
  return <ScrollViewV style={{width:'100%',height:'100%',position:'relative'}}><div style={{background:backPrimary,width:'100%'}}>
    <FlexH>
      <PGW/>
      <SMSGateways/>
    </FlexH>
  </div>
  </ScrollViewV>
}
