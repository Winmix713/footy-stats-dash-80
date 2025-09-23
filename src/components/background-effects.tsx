import React from 'react';
import { Icon } from '@iconify/react';

export const BackgroundEffects: React.FC = () => {
  // Add lazy loading for the 3D background
  const [iframeLoaded, setIframeLoaded] = React.useState(false);
  const [iframeError, setIframeError] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Delay loading the iframe to improve initial page load performance
    const timer = setTimeout(() => {
      setIframeLoaded(true);
    }, isMobile ? 2000 : 1000); // Longer delay on mobile for better performance
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Handle iframe load error
  const handleIframeError = () => {
    console.error('Failed to load Spline 3D background');
    setIframeError(true);
  };

  // Fallback background when iframe fails to load
  const renderFallbackBackground = () => (
    <div 
      className="w-full h-full bg-background flex flex-col items-center justify-center"
      data-testid="background-fallback"
    >
      {iframeError ? (
        <div className="text-center">
          <Icon 
            icon="lucide:alert-triangle" 
            className="text-amber-400 mx-auto mb-2" 
            width={24} 
            height={24} 
            aria-hidden="true"
          />
          <p className="text-zinc-400 text-sm">
            <span className="sr-only">Error:</span> 3D háttér betöltése sikertelen
          </p>
        </div>
      ) : (
        <div 
          className="flex items-center justify-center" 
          aria-live="polite" 
          role="status"
        >
          <div 
            className="inline-flex h-10 w-10 rounded-full border-2 border-white/20 border-t-violet-400 animate-spin"
            aria-hidden="true"
          ></div>
          <span className="sr-only">3D háttér betöltése folyamatban</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Background 3D Spline - with lazy loading and error handling */}
      <div 
        className="spline-container fixed top-0 w-full h-screen -z-10"
        data-testid="background-container"
      >
        {iframeLoaded && !iframeError ? (
          <iframe 
            src="https://my.spline.design/aidatamodelinteraction-mdTL3FktFVHgDvFr5TKtnYDV" 
            width="100%" 
            height="100%" 
            id="aura-spline"
            title="3D Background Animation"
            loading="lazy"
            onError={handleIframeError}
            onLoad={() => console.log('3D background loaded successfully')}
            className={isMobile ? 'mobile-optimized' : ''}
            data-testid="background-iframe"
          />
        ) : renderFallbackBackground()}
      </div>

      {/* Background glows - responsive with min() function */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-35 bg-[radial-gradient(closest-side,rgba(138,92,246,0.5),rgba(10,10,18,0))]"
          style={{ width: 'min(1100px, 90vw)', height: 'min(1100px, 90vw)' }}
          data-testid="primary-glow"
        ></div>
        <div 
          className="absolute bottom-0 right-0 rounded-full blur-3xl opacity-30 bg-[radial-gradient(closest-side,rgba(99,102,241,0.4),rgba(10,10,18,0))]"
          style={{ 
            width: 'min(800px, 70vw)', 
            height: 'min(800px, 70vw)',
            transform: 'translate(min(10%, 40px), min(10%, 40px))' 
          }}
          data-testid="secondary-glow"
        ></div>
      </div>
    </>
  );
};