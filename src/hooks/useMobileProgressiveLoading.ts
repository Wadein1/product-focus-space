
import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";

interface LoadingState {
  isInitialLoading: boolean;
  showContent: boolean;
  dataLoaded: boolean;
  imagesLoaded: Record<string, boolean>;
  loadingProgress: number;
}

interface ProgressiveLoadingOptions {
  maxLoadingTime?: number;
  onDataLoaded?: () => void;
  onAllLoaded?: () => void;
}

export const useMobileProgressiveLoading = (options: ProgressiveLoadingOptions = {}) => {
  const { maxLoadingTime = 3000 } = options;
  const isMobile = useIsMobile();
  const startTime = useRef(Date.now());
  
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isInitialLoading: isMobile,
    showContent: false,
    dataLoaded: false,
    imagesLoaded: {},
    loadingProgress: 0,
  });

  // Timer to force show content after max loading time
  useEffect(() => {
    if (!isMobile) {
      setLoadingState(prev => ({ ...prev, isInitialLoading: false, showContent: true }));
      return;
    }

    const timer = setTimeout(() => {
      console.log('Max loading time reached, showing content');
      setLoadingState(prev => ({ 
        ...prev, 
        isInitialLoading: false, 
        showContent: true 
      }));
    }, maxLoadingTime);

    return () => clearTimeout(timer);
  }, [isMobile, maxLoadingTime]);

  // Progress calculation
  useEffect(() => {
    const elapsed = Date.now() - startTime.current;
    const progress = Math.min((elapsed / maxLoadingTime) * 100, 100);
    
    if (loadingState.isInitialLoading) {
      setLoadingState(prev => ({ ...prev, loadingProgress: progress }));
    }
  }, [loadingState.isInitialLoading, maxLoadingTime]);

  const markDataLoaded = () => {
    console.log('Data loaded, checking if we should show content');
    setLoadingState(prev => {
      const newState = { ...prev, dataLoaded: true };
      
      // Show content if data is loaded and we're past minimum loading time or max time
      const elapsed = Date.now() - startTime.current;
      if (elapsed >= 1000 || !prev.isInitialLoading) {
        newState.isInitialLoading = false;
        newState.showContent = true;
        options.onDataLoaded?.();
      }
      
      return newState;
    });
  };

  const markImageLoaded = (imageId: string) => {
    setLoadingState(prev => ({
      ...prev,
      imagesLoaded: { ...prev.imagesLoaded, [imageId]: true }
    }));
  };

  const markImageError = (imageId: string) => {
    setLoadingState(prev => ({
      ...prev,
      imagesLoaded: { ...prev.imagesLoaded, [imageId]: false }
    }));
  };

  return {
    ...loadingState,
    isMobile,
    markDataLoaded,
    markImageLoaded,
    markImageError,
  };
};
