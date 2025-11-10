//frontend/src/context/ThemeContext.js
import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ThemeContext = createContext();

export const ThemeProvider = ({children})=>{
    const [darkMode, setDarkMode] = useState(false);

    useEffect(()=>{
        const loadTheme = async()=>{
            try{
                const theme = await AsyncStorage.getItem('theme');
                if(theme !== null){
                    setDarkMode(theme === 'dark');
                }
            }catch(error){
                console.log("Error loading theme: ", error);
            }
        };
        loadTheme();
    },[]);
    
    const toggleDarkMode = async()=>{
        const newTheme = !darkMode;
        setDarkMode(newTheme);

        try{
            await AsyncStorage.setItem('theme', newTheme.toString());
        }catch(error){
            console.log("Error saving theme: ", error);
        }
    };
    const theme = {
        darkMode, 
        toggleDarkMode,
        colors:{
            background: darkMode ? '#333' : '#F5F6F8',
            text: darkMode ? '#eceaeaff' : '#000000ff',
            primary: darkMode ? '#238f86ff' : '#35A69B',
            //primary: darkMode ? '#037a85ff' : '#037a85ff',
            secondary: darkMode ? '#037a85ff' : '#037a85ff',
            sub_background: darkMode ? '#424242ff' : '#ffffffff',
            inputBackground: darkMode ? '#444444ff' : '#F5F5F5',
            inputBorder: darkMode ? '#666' :'#E0E0E0',

            //buttonAdd: darkMode ? '#28a745' : '#47b661ff',
            buttonCrear: darkMode? '#F28B30':'#F28B30',
            cancelarbutton: darkMode ? '#c9874eff' :'#F28B30',
            
        }
    };
    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};
    