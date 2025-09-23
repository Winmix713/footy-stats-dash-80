import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { Languages } from 'lucide-react';

export function LanguageToggle() {
  const { language, changeLanguage, t } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => changeLanguage(language === 'en' ? 'hu' : 'en')}
      className="flex items-center gap-2"
    >
      <Languages className="h-4 w-4" />
      {language === 'en' ? t('ui.hungarian') : t('ui.english')}
    </Button>
  );
}