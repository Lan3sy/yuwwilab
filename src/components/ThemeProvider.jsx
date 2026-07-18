import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'snow')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('app-theme', theme)

    // Синхронизируем цвет статус-бара iOS/Android с темой
    const bgColor = theme === 'charcoal' ? '#1e2023' : '#FFFFF7'
    const barStyle = theme === 'charcoal' ? 'black-translucent' : 'default'

    const themeColorMeta = document.getElementById('theme-color-meta')
    if (themeColorMeta) themeColorMeta.setAttribute('content', bgColor)

    const appleStatusBarMeta = document.getElementById('apple-status-bar-meta')
    if (appleStatusBarMeta) appleStatusBarMeta.setAttribute('content', barStyle)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}