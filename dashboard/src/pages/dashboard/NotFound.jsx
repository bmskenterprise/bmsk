import {FlexH} from '../../components/styles/Admin.style';
import {useTheme} from '../../contexts/ThemeContext'

export default function NotFound (){
    const {modeData:{backPrimary,textPrimary}} = useTheme();

    return <FlexH x='center' y='center' style={{background:backPrimary,color:textPrimary,height:'100vh'}}>
        <h2>Not Found</h2>
    </FlexH>
}