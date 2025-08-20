// src/app/components/ThemeToggle.tsx
'use client'
import { useTheme } from '../context/ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="theme-switch">
      <div className="theme-switch-container">
        <label className="theme-switch-label">
          <input 
            type="checkbox" 
            checked={theme === 'dark'}
            onChange={toggleTheme}
            aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
          />
          <span className="theme-switch-slider"></span>
        </label>
        <span className="theme-icon">
          {theme === 'dark' ? '🌙' : '☀️'} 
        </span>
      </div>
    </div>
  )
}