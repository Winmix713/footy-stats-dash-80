import React from 'react'
import ReactDOM from 'react-dom/client'
import { HeroUIProvider, ToastProvider } from "@heroui/react"
import { BrowserRouter as Router } from "react-router-dom"
import { MatchDataProvider } from './hooks/use-match-data'
import App from './App.tsx'
import './index.css'

// Initialize theme from localStorage or system preference before rendering
const initializeTheme = () => {
  const storedTheme = localStorage.getItem('theme-preference');
  if (storedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (storedTheme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    // If no stored preference, use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }
};

// Call the function immediately
initializeTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <HeroUIProvider>
        <ToastProvider placement="top-right" />
        <MatchDataProvider>
          <App />
        </MatchDataProvider>
      </HeroUIProvider>
    </Router>
  </React.StrictMode>,
)
