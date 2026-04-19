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
      const title = "Fermentación Finalizada";
      const body = `El tiempo de fermentación (${state.durationMins} min) ha terminado.`;
      
      if (Notification.permission === "granted") {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
              body,
              icon: './pantimerLogo256.png',
              vibrate: [200, 100, 200],
              badge: './pantimerLogo256.png',
              tag: 'fermentation-notification'
            } as any);
          });
        } else {
          new Notification(title, { body, icon: './pantimerLogo256.png' });
        }
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
