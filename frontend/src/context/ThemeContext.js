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
            background: darkMode ? '#333' : '#fcfcfcff',
            text: darkMode ? '#fff' : '#030d69ff',
            primary: darkMode ? '#61dafb' : '#007bff',
            secondary: darkMode ? '#f0f0f0' : '#6c757d',
            sub_background: darkMode ? '#515155a4' : '#e8eaecff',
            button: darkMode ? '#5962b9ff' : '#030d69ff',
            buttonText: darkMode ? '#fff' : '#fff',
            editbutton: darkMode ? '#ffd965ff':'#ffc107',
            deletebutton: darkMode ? '#ff4d4d' :'#dc3545',
            
        }
    };
    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};
    