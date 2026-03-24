import {FaChevronLeft,FaChevronRight} from 'react-icons/fa';
import {Pagination} from '../components/styles/Admin.style';
import {useTheme} from '../contexts/ThemeContext';

export default ({totalPage,currentPage,changePage})=>{
    const {themeData:{themeBackground,themeText},modeData} = useTheme()// => {
    const {backPrimary,textPrimary} = modeData;
     const items = [];
    if(currentPage>1) items.push(  <li key='prev' onClick={e=>changePage(currentPage-1)}><button><FaChevronLeft/></button></li> )
        for (let i = 1; i <= totalPage; ++i) {
         items.push(<li onClick={e=>changePage(i)} data-page={i} key={i}><button style={{background:i==currentPage?themeBackground:backPrimary,color:i==currentPage?themeText:textPrimary}}>{i}</button></li>);
        }
        //return items;
    //}
    
    if(currentPage<totalPage) items.push(  <li key='next' onClick={e=>changePage(currentPage+1)}><button><FaChevronRight/></button></li> )
    return <Pagination >{items}</Pagination>
        {/*range().map(i=> <Pagination.Item key={i}>{i}</Pagination.Item>)*/}
    
}
