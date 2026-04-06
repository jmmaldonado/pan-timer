import { useState, useEffect, useCallback } from 'react';

export type FermentationTemp = 'Ambient' | 'Fridge';

interface FermentationState {
  startTime: number | null;
  durationMins: number;
  tempType: FermentationTemp;
  isActive: boolean;
  notified: boolean;
}

export function useFermentationTimer() {
  const [state, setState] = useState<FermentationState>(() => {
    const saved = localStorage.getItem('panificadora_fermentation_state');
    if (!saved) return { startTime: null, durationMins: 60, tempType: 'Ambient', isActive: false, notified: false };
    try {
      const parsed = JSON.parse(saved);
      return parsed && typeof parsed === 'object' ? parsed : { startTime: null, durationMins: 60, tempType: 'Ambient', isActive: false, notified: false };
    } catch (e) {
      return { startTime: null, durationMins: 60, tempType: 'Ambient', isActive: false, notified: false };
    }
  });

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    localStorage.setItem('panificadora_fermentation_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    let interval: number;
    if (state.isActive) {
      interval = window.setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.isActive]);

  const start = (durationMins: number, tempType: FermentationTemp) => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    setState({
      startTime: Date.now(),
      durationMins,
      tempType,
      isActive: true,
      notified: false
    });
  };

  const stop = () => {
    setState(prev => ({ ...prev, startTime: null, isActive: false, notified: false }));
  };

  const getProgress = useCallback(() => {
    if (!state.startTime || !state.isActive) return null;

    const elapsedMs = currentTime - state.startTime;
    const elapsedMins = elapsedMs / (1000 * 60);
    const remainingMins = state.durationMins - elapsedMins;
    const isExpired = remainingMins <= 0;

    // Handle notification
    if (isExpired && !state.notified) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Fermentación Finalizada", {
          body: `El tiempo de fermentación (${state.durationMins} min) ha terminado.`,
          icon: './pantimerLogo256.png'
        });
      }
      setState(prev => ({ ...prev, notified: true }));
    }

    return {
      elapsedMins,
      remainingMins: Math.abs(remainingMins),
      isExpired,
      durationMins: state.durationMins,
      tempType: state.tempType
    };
  }, [state, currentTime]);

  return { 
    fermentationState: state, 
    startFermentation: start, 
    stopFermentation: stop, 
    fermentationProgress: getProgress() 
  };
}
