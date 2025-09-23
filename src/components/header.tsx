import React, { useState, useEffect, useCallback } from 'react';
import { Button, Switch, Tooltip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link, useLocation } from 'react-router-dom';

// Types
interface HeaderProps {
  className?: string;
}

interface NavigationItem {
  path: string;
  labelKey: string;
  icon?: string;
}

// Theme management hook for better separation of concerns
const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem('theme-preference');
      if (stored) {
        return stored === 'dark';
      }
      return document.documentElement.classList.contains('dark');
    } catch (error) {
      console.warn('Failed to read theme preference from localStorage:', error);
      return document.documentElement.classList.contains('dark');
    }
  });

  const toggleTheme = useCallback(() => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    // Apply or remove dark class on html element
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Store preference in localStorage with error handling
    try {
      localStorage.setItem('theme-preference', newIsDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, [isDark]);

  // Initialize theme from localStorage on component mount
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('theme-preference');
      if (storedTheme) {
        const shouldBeDark = storedTheme === 'dark';
        setIsDark(shouldBeDark);
        
        if (shouldBeDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (error) {
      console.warn('Failed to initialize theme from localStorage:', error);
    }
  }, []);

  return { isDark, toggleTheme };
};

// Translation hook (placeholder for i18n implementation)
const useTranslation = () => {
  // This would be replaced with actual i18n implementation
  const translations = {
    'header.home': 'Főoldal',
    'header.teams': 'Csapatok', 
    'header.stats': 'Statisztikák',
    'header.results': 'Eredmények',
    'header.toggleTheme': 'Téma váltás',
    'header.switchToLight': 'Váltás világos módra',
    'header.switchToDark': 'Váltás sötét módra',
    'header.menu': 'Menü',
    'header.closeMenu': 'Menü bezárása'
  };

  const t = useCallback((key: string) => {
    return translations[key as keyof typeof translations] || key;
  }, []);

  return { t };
};

// Mobile menu hook
const useMobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeMenu]);

  return { isOpen, toggleMenu, closeMenu };
};

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { isOpen, toggleMenu, closeMenu } = useMobileMenu();
  const location = useLocation();

  // Navigation items configuration
  const navigationItems: NavigationItem[] = [
    { path: '/', labelKey: 'header.home' },
    { path: '/teams', labelKey: 'header.teams' },
    { path: '/stats', labelKey: 'header.stats' },
    { path: '/results', labelKey: 'header.results' }
  ];

  // Helper function to check if a link is active
  const isActive = useCallback((path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  }, [location.pathname]);

  return (
    <header 
      className={`relative z-50 sticky top-0 backdrop-blur-xl bg-background/80 border-b border-white/5 ${className}`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg p-1"
            aria-label="WinMix főoldal"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-[0_0_0_2px_rgba(255,255,255,0.06)_inset]">
              <Icon icon="lucide:asterisk" className="text-white" width={16} height={16} />
            </span>
            <span className="text-lg font-semibold tracking-tight">WinMix</span>
          </Link>

          {/* Desktop Navigation */}
          <nav 
            className="hidden md:flex gap-1 border border-white/5 rounded-full px-3 items-center"
            role="navigation"
            aria-label="Főnavigáció"
          >
            {navigationItems.map(({ path, labelKey }) => (
              <Link 
                key={path}
                to={path}
                onClick={closeMenu}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-transparent ${
                  isActive(path) 
                    ? 'text-white bg-white/10' 
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
                aria-current={isActive(path) ? 'page' : undefined}
              >
                {t(labelKey)}
              </Link>
            ))}
          </nav>

          {/* Controls */}
          <div className="flex gap-2 items-center">
            {/* Theme Toggle */}
            <Tooltip content={t(isDark ? 'header.switchToLight' : 'header.switchToDark')}>
              <div className="hidden sm:flex items-center gap-1 mr-2">
                <Icon 
                  icon="lucide:sun" 
                  className={`transition-colors duration-200 ${isDark ? 'text-zinc-400' : 'text-amber-400'}`} 
                  width={16} 
                  height={16}
                  aria-hidden="true"
                />
                <Switch 
                  size="sm"
                  color="primary"
                  isSelected={isDark}
                  onValueChange={toggleTheme}
                  aria-label={t(isDark ? 'header.switchToLight' : 'header.switchToDark')}
                  classNames={{
                    wrapper: "focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-transparent"
                  }}
                />
                <Icon 
                  icon="lucide:moon" 
                  className={`transition-colors duration-200 ${isDark ? 'text-violet-400' : 'text-zinc-400'}`} 
                  width={16} 
                  height={16}
                  aria-hidden="true"
                />
              </div>
            </Tooltip>

            {/* Mobile Menu Button */}
            <Button
              className="md:hidden"
              variant="flat"
              color="default"
              size="sm"
              isIconOnly
              onPress={toggleMenu}
              aria-label={isOpen ? t('header.closeMenu') : t('header.menu')}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <Icon 
                icon={isOpen ? "lucide:x" : "lucide:menu"} 
                width={20} 
                height={20}
              />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav 
            id="mobile-menu"
            className="md:hidden border-t border-white/5 py-4"
            role="navigation"
            aria-label="Mobil navigáció"
          >
            <div className="flex flex-col space-y-2">
              {navigationItems.map(({ path, labelKey }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={closeMenu}
                  className={`px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-transparent ${
                    isActive(path)
                      ? 'text-white bg-white/10'
                      : 'text-zinc-300 hover:text-white hover:bg-white/5'
                  }`}
                  aria-current={isActive(path) ? 'page' : undefined}
                >
                  {t(labelKey)}
                </Link>
              ))}
              
              {/* Mobile Theme Toggle */}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-zinc-300">
                  {t('header.toggleTheme')}
                </span>
                <div className="flex items-center gap-2">
                  <Icon 
                    icon="lucide:sun" 
                    className={`transition-colors duration-200 ${isDark ? 'text-zinc-400' : 'text-amber-400'}`} 
                    width={16} 
                    height={16}
                    aria-hidden="true"
                  />
                  <Switch 
                    size="sm"
                    color="primary"
                    isSelected={isDark}
                    onValueChange={toggleTheme}
                    aria-label={t(isDark ? 'header.switchToLight' : 'header.switchToDark')}
                  />
                  <Icon 
                    icon="lucide:moon" 
                    className={`transition-colors duration-200 ${isDark ? 'text-violet-400' : 'text-zinc-400'}`} 
                    width={16} 
                    height={16}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};