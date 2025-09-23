import React, { useCallback } from 'react';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { FeedbackForm } from './feedback-form';

// TypeScript interface a komponens props-jaihoz
interface FooterProps {
  className?: string;
  companyName?: string;
  year?: number;
}

// Translations object (később i18n-nel helyettesíthető)
const translations = {
  hu: {
    copyright: '© {year} {company}',
    feedback: 'Visszajelzés',
    feedbackButton: 'Visszajelzés űrlap megnyitása',
    privacy: 'Adatvédelem',
    terms: 'Felhasználási feltételek',
    contact: 'Kapcsolat'
  }
};

export const Footer: React.FC<FooterProps> = ({ 
  className = '',
  companyName = 'winmix.hu',
  year = new Date().getFullYear()
}) => {
  const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(false);
  
  // Teljesítmény optimalizálás - useCallback a callback függvényekhez
  const handleFeedbackOpen = useCallback(() => {
    setIsFeedbackOpen(true);
  }, []);
  
  const handleFeedbackClose = useCallback(() => {
    setIsFeedbackOpen(false);
  }, []);
  
  // Keyboard navigation támogatás
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleFeedbackOpen();
    }
  }, [handleFeedbackOpen]);
  
  const t = translations.hu; // Később useTranslation hook-kal helyettesíthető
  
  return (
    <footer 
      className={`relative z-10 border-t border-white/10 ${className}`}
      role="contentinfo"
      aria-label="Oldal lábrész"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo és copyright */}
          <div className="flex items-center gap-3">
            <span 
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600"
              role="img"
              aria-label="Cég logo"
            >
              <Icon 
                icon="lucide:asterisk" 
                className="text-white" 
                width={16} 
                height={16}
                aria-hidden="true"
              />
            </span>
            <span className="text-sm font-medium text-zinc-300">
              {t.copyright.replace('{year}', year.toString()).replace('{company}', companyName)}
            </span>
          </div>
          
          {/* Visszajelzés gomb - hozzáférhetőségi fejlesztésekkel */}
          <div className="flex items-center gap-2 sm:order-3">
            <Button
              variant="flat"
              color="default"
              size="sm"
              className="text-zinc-300 border border-white/10 hover:border-white/20 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
              onPress={handleFeedbackOpen}
              onKeyDown={handleKeyPress}
              aria-label={t.feedbackButton}
              startContent={
                <Icon 
                  icon="lucide:message-square" 
                  width={16} 
                  height={16}
                  aria-hidden="true"
                />
              }
            >
              {t.feedback}
            </Button>
          </div>
          
          {/* Navigációs linkek */}
          <nav className="flex items-center gap-4 text-sm text-zinc-400" role="navigation" aria-label="Lábrész navigáció">
            <a 
              href="/privacy" 
              className="hover:text-zinc-200 focus:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-900 rounded px-1"
              aria-label="Adatvédelmi szabályzat megtekintése"
            >
              {t.privacy}
            </a>
            <a 
              href="/terms" 
              className="hover:text-zinc-200 focus:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-900 rounded px-1"
              aria-label="Felhasználási feltételek megtekintése"
            >
              {t.terms}
            </a>
            <a 
              href="/contact" 
              className="hover:text-zinc-200 focus:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-900 rounded px-1"
              aria-label="Kapcsolat felvétele"
            >
              {t.contact}
            </a>
          </nav>
        </div>
      </div>
      
      {/* FeedbackForm komponens */}
      <FeedbackForm 
        isOpen={isFeedbackOpen} 
        onClose={handleFeedbackClose}
        aria-describedby="feedback-form-description"
      />
    </footer>
  );
};