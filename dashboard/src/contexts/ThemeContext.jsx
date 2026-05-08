import {createContext,useContext,useState} from 'react';
//import { 
import getComplementaryColor from '../utils/complementaryColor'
const ThemeContext = createContext();

export const ThemeProvider = ({children})=>{
    let colorMode = localStorage.getItem('mode') || 'dark'
    const [thememode,setThememode] = useState(colorMode)
    const modes = {
        dark: {
            backPrimary:'#121212',
            backSecondary:'#1E1E1E',
            textPrimary:'#FFFFFF',
            textSecondary:'#D9D9D9',
            glassmorph:{
                back:'rgba(255,255,255,0.1)',
                shadow:'0 4px 6px rgba(0,0,0,0.4) 0 1px 3px rgba(0,0,0,0.3)'
            }
        },
        light: {
            backPrimary:'#FAFAFA',
            backSecondary:'#F9F9F9',
            textPrimary:'#212121',
            textSecondary:'#666666',
            glassmorph:{
                back:'rgba(255,255,255,0.1)',
                shadow:'0 4px 30px rgba(0, 0, 0, 0.1)'
            }
        },
    }
    const [themeData, setThemeData] = useState(JSON.parse(localStorage.getItem('theme')) || {themeBackground:'#373463', themeText:getComplementaryColor('#373463')});
    const [modeData, setModeData] = useState(modes[colorMode]);
    
    const toggleMode = (isDark)=>{
        localStorage.setItem('mode', JSON.stringify(isDark?'dark':'light'));
        setThememode(isDark?'dark':'light');
        setModeData(modes[isDark?'dark':'light']);
    };
    const toggleTheme = (themeSet) => {
    //const themeSet = (typeof c)=='object' ? c : {background:c, color:getComplementaryColor(c)};
        localStorage.setItem('theme', JSON.stringify(themeSet))
        setThemeData(themeSet)
    }
            
    return(
        <ThemeContext.Provider value={{thememode,modeData,toggleMode,themeData,toggleTheme}}>{children}</ThemeContext.Provider>
    )
};

export const useTheme = ()=> useContext(ThemeContext);
