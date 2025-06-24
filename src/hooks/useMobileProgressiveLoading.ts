
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
  const { maxLoadingTime = 2000 } = options; // Reduced default time
  const isMobile = useIsMobile();
  const startTime = useRef(Date.now());
  const hasShownInitialLoading = useRef(false);
  
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isInitialLoading: isMobile && !hasShownInitialLoading.current,
    showContent: !isMobile,
    dataLoaded: false,
    imagesLoaded: {},
    loadingProgress: 0,
  });

  // Timer to force show content after max loading time
  useEffect(() => {
    if (!isMobile || hasShownInitialLoading.current) {
      setLoadingState(prev => ({ ...prev, isInitialLoading: false, showContent: true }));
      return;
    }

    const timer = setTimeout(() => {
      console.log('Max loading time reached, showing content');
      hasShownInitialLoading.current = true;
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
    if (!loadingState.isInitialLoading) return;
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min((elapsed / maxLoadingTime) * 100, 100);
      
      setLoadingState(prev => ({ ...prev, loadingProgress: progress }));
      
      if (progress < 100) {
        requestAnimationFrame(updateProgress);
      }
    };
    
    requestAnimationFrame(updateProgress);
  }, [loadingState.isInitialLoading, maxLoadingTime]);

  const markDataLoaded = () => {
    console.log('Data loaded, checking if we should show content');
    setLoadingState(prev => {
      const newState = { ...prev, dataLoaded: true };
      
      // Show content if data is loaded and we're past minimum loading time
      const elapsed = Date.now() - startTime.current;
      if (elapsed >= 800 || !prev.isInitialLoading) { // Reduced minimum time
        hasShownInitialLoading.current = true;
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
