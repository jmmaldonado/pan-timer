import { useState, useEffect, useCallback } from 'react';
import { Step, Program, BreadWeight } from '../types';

interface TimerState {
  startTime: number | null;
  programId: number;
  weight: BreadWeight;
  isActive: boolean;
  delayMins: number;
}

export function useTimer(programs: Program[]) {
  const [state, setState] = useState<TimerState>(() => {
    const saved = localStorage.getItem('panificadora_timer_state');
    if (!saved) return { startTime: null, programId: 1, weight: 1000, isActive: false, delayMins: 0 };
    try {
      const parsed = JSON.parse(saved);
      return parsed && typeof parsed === 'object' ? parsed : { startTime: null, programId: 1, weight: 1000, isActive: false, delayMins: 0 };
    } catch (e) {
      return { startTime: null, programId: 1, weight: 1000, isActive: false, delayMins: 0 };
    }
  });

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    localStorage.setItem('panificadora_timer_state', JSON.stringify(state));
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

  const start = (programId: number, weight: BreadWeight, delayHours: number = 0) => {
    setState({
      startTime: Date.now(),
      programId,
      weight,
      isActive: true,
      delayMins: delayHours * 60
    });
  };

  const stop = () => {
    setState({ startTime: null, programId: 1, weight: 1000, isActive: false, delayMins: 0 });
  };

  const getProgress = useCallback(() => {
    if (!state.startTime || !state.isActive) return null;

    const program = programs.find(p => p.id === state.programId);
    const config = program?.timings[state.weight];
    if (!config) return null;

    const elapsedMs = currentTime - state.startTime;
    const elapsedMins = elapsedMs / (1000 * 60);

    const totalMins = config.total + state.delayMins;
    const steps = state.delayMins > 0 
      ? [{ name: "Retraso", duration: state.delayMins }, ...config.steps] 
      : config.steps;

    if (elapsedMins < state.delayMins) {
      const addStepIdx = config.steps.findIndex(s => s.isAdd);
      const rmvStepIdx = config.steps.findIndex(s => s.isRmv);

      return {
        currentStep: { name: "Retraso", duration: state.delayMins },
        currentStepIndex: 0,
        elapsedMins,
        totalMins,
        timeInStep: elapsedMins,
        isFinished: false,
        addTime: addStepIdx >= 0 ? state.delayMins + config.steps.slice(0, addStepIdx + 1).reduce((a, b) => a + b.duration, 0) : -1,
        rmvTime: rmvStepIdx >= 0 ? state.delayMins + config.steps.slice(0, rmvStepIdx + 1).reduce((a, b) => a + b.duration, 0) : -1,
        steps,
        isDelaying: true
      };
    }

    const programElapsedMins = elapsedMins - state.delayMins;

    let accumulatedMins = 0;
    let stepIdx = -1;
    let timeInStep = 0;

    for (let i = 0; i < config.steps.length; i++) {
      const step = config.steps[i];
      if (programElapsedMins < accumulatedMins + step.duration) {
        stepIdx = i;
        timeInStep = programElapsedMins - accumulatedMins;
        break;
      }
      accumulatedMins += step.duration;
    }

    // Find ADD and RMV times
    let addTime = -1;
    let rmvTime = -1;
    let tempAcc = 0;
    config.steps.forEach(s => {
      if (s.isAdd) addTime = state.delayMins + tempAcc + s.duration;
      if (s.isRmv) rmvTime = state.delayMins + tempAcc + s.duration;
      tempAcc += s.duration;
    });

    const isFinished = elapsedMins >= totalMins;

    return {
      currentStep: stepIdx >= 0 ? config.steps[stepIdx] : (isFinished ? null : config.steps[config.steps.length - 1]),
      currentStepIndex: state.delayMins > 0 
        ? (stepIdx >= 0 ? stepIdx + 1 : (isFinished ? steps.length : steps.length - 1))
        : (stepIdx >= 0 ? stepIdx : (isFinished ? steps.length : steps.length - 1)),
      elapsedMins,
      totalMins,
      timeInStep,
      isFinished,
      addTime,
      rmvTime,
      steps,
      isDelaying: false
    };
  }, [state, currentTime, programs]);

  return { state, start, stop, progress: getProgress() };
}
