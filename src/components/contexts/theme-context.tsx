import {createContext, useEffect, useLayoutEffect, useState, FC, ReactNode} from "react";
import {storage} from "../../constants/local-storage";
import {of} from "rxjs";

type Dict = {
    [key: string]: string
}

const THEME: Dict = {
    LIGHT: 'light',
    DARK: 'dark'
}

interface IThemeContext {
    theme: string,
    toggleTheme: () => void
}

const ThemeContext = createContext<IThemeContext>({theme: THEME.LIGHT, toggleTheme: () => null})

const ThemeProvider: FC<{children: ReactNode}> = ({children}) => {
    const [theme, setTheme] = useState({theme: THEME.LIGHT});

    const toggleTheme = () => {
        const newTheme = theme.theme === THEME.LIGHT ? THEME.DARK : THEME.LIGHT
        setTheme({theme: newTheme})
        localStorage.setItem(storage.THEME, newTheme)
    }

    useLayoutEffect( () => {
        of(localStorage.getItem(storage.THEME)).subscribe( (value) =>{
            if(value) setTheme({theme: value})
        }).unsubscribe()
    }, [])

    useEffect(() => {
        document.documentElement.className = theme.theme
    },[theme])

    return (
        <ThemeContext.Provider value={{theme: theme.theme, toggleTheme: toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};

export {ThemeContext, ThemeProvider, THEME}
