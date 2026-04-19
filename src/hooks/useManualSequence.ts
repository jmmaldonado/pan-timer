import { useState, useEffect, useCallback } from 'react';
import { ManualSequenceState, ManualStep } from '../types';

const INITIAL_STEPS: ManualStep[] = [
  { id: 'fold-1', name: 'Primer Pliegue y Reposo', duration: 60, type: 'fold' },
  { id: 'fold-2', name: 'Segundo Pliegue y Reposo', duration: 60, type: 'fold' },
  { id: 'final-shaping', name: 'Enrollado de Fuerza y Reposo Final', duration: 180, type: 'shaping' },
];

export function useManualSequence() {
  const [state, setState] = useState<ManualSequenceState>(() => {
    const saved = localStorage.getItem('panificadora_manual_sequence');
    if (!saved) return { 
      isActive: false, 
      startTime: null, 
      currentStepIndex: 0, 
      steps: INITIAL_STEPS,
      notifiedSteps: [] 
    };
    try {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        steps: parsed.steps || INITIAL_STEPS,
        notifiedSteps: parsed.notifiedSteps || []
      };
    } catch {
      return { 
        isActive: false, 
        startTime: null, 
        currentStepIndex: 0, 
        steps: INITIAL_STEPS,
        notifiedSteps: [] 
      };
    }
  });

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    localStorage.setItem('panificadora_manual_sequence', JSON.stringify(state));
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

  const startSequence = () => {
    setState(prev => ({
      ...prev,
      isActive: true,
      startTime: Date.now(),
      currentStepIndex: 0,
      notifiedSteps: []
    }));
  };

  const stopSequence = () => {
    setState(prev => ({
      ...prev,
      isActive: false,
      startTime: null,
      currentStepIndex: 0,
      notifiedSteps: []
    }));
  };

  const nextStep = () => {
    setState(prev => {
      const isLast = prev.currentStepIndex >= prev.steps.length - 1;
      if (isLast) {
        return {
          ...prev,
          isActive: false,
          startTime: null,
          currentStepIndex: 0,
          notifiedSteps: []
        };
      }
      return {
        ...prev,
        currentStepIndex: prev.currentStepIndex + 1,
        startTime: Date.now(),
      };
    });
  };

  const updateSteps = (steps: ManualStep[]) => {
    setState(prev => ({ ...prev, steps }));
  };

  const getProgress = useCallback(() => {
    if (!state.isActive || state.startTime === null) return null;

    const currentStep = state.steps[state.currentStepIndex];
    if (!currentStep) return null;

    const elapsedMs = currentTime - state.startTime;
    const elapsedMins = elapsedMs / (1000 * 60);
    const durationMins = currentStep.duration;
    const remainingMins = durationMins - elapsedMins;
    const isExpired = remainingMins <= 0;

    // Handle notification
    if (isExpired && !state.notifiedSteps.includes(currentStep.id)) {
      const title = currentStep.type === 'fold' ? "¡Hora de plegar!" : "¡Hora de hornear!";
      const body = `El tiempo de reposo para "${currentStep.name}" ha finalizado. Realiza la acción y confirma en la app.`;
      
      if (Notification.permission === "granted") {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
              body,
              icon: './pantimerLogo2.png',
              vibrate: [200, 100, 200],
              badge: './pantimerLogo2.png',
              tag: `manual-step-${currentStep.id}`
            } as any);
          });
        } else {
          new Notification(title, { body, icon: './pantimerLogo2.png' });
        }
      }
      setState(prev => ({ ...prev, notifiedSteps: [...prev.notifiedSteps, currentStep.id] }));
    }

    return {
      currentStep,
      elapsedMins,
      remainingMins: Math.abs(remainingMins),
      isExpired,
      currentStepIndex: state.currentStepIndex,
      totalSteps: state.steps.length
    };
  }, [state, currentTime]);

  return {
    manualState: state,
    startSequence,
    stopSequence,
    nextStep,
    updateSteps,
    manualProgress: getProgress()
  };
}
