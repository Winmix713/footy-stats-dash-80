import { useEffect, useCallback, useState } from 'react';

interface KeyboardNavigationOptions {
  enabled?: boolean;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onTab?: (shift: boolean) => void;
  onHome?: () => void;
  onEnd?: () => void;
  onPageUp?: () => void;
  onPageDown?: () => void;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export const useKeyboardNavigation = (options: KeyboardNavigationOptions = {}) => {
  const {
    enabled = true,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onEnter,
    onEscape,
    onTab,
    onHome,
    onEnd,
    onPageUp,
    onPageDown,
    preventDefault = true,
    stopPropagation = true
  } = options;

  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const handlers: Record<string, () => void> = {
      'ArrowUp': onArrowUp || (() => {}),
      'ArrowDown': onArrowDown || (() => {}),
      'ArrowLeft': onArrowLeft || (() => {}),
      'ArrowRight': onArrowRight || (() => {}),
      'Enter': onEnter || (() => {}),
      'Escape': onEscape || (() => {}),
      'Home': onHome || (() => {}),
      'End': onEnd || (() => {}),
      'PageUp': onPageUp || (() => {}),
      'PageDown': onPageDown || (() => {})
    };

    if (event.key === 'Tab' && onTab) {
      onTab(event.shiftKey);
      if (preventDefault) event.preventDefault();
      if (stopPropagation) event.stopPropagation();
      return;
    }

    const handler = handlers[event.key];
    if (handler) {
      handler();
      if (preventDefault) event.preventDefault();
      if (stopPropagation) event.stopPropagation();
    }
  }, [
    enabled,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onEnter,
    onEscape,
    onTab,
    onHome,
    onEnd,
    onPageUp,
    onPageDown,
    preventDefault,
    stopPropagation
  ]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  const navigateToIndex = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  const navigateUp = useCallback((maxIndex: number) => {
    setFocusedIndex(prev => {
      if (prev <= 0) return maxIndex;
      return prev - 1;
    });
  }, []);

  const navigateDown = useCallback((maxIndex: number) => {
    setFocusedIndex(prev => {
      if (prev >= maxIndex) return 0;
      return prev + 1;
    });
  }, []);

  const reset = useCallback(() => {
    setFocusedIndex(-1);
  }, []);

  return {
    focusedIndex,
    navigateToIndex,
    navigateUp,
    navigateDown,
    reset,
    handleKeyDown
  };
};