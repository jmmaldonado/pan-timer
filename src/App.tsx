import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Timer, 
  Settings, 
  BookOpen, 
  Plus, 
  Play, 
  Square, 
  ChevronRight, 
  Bell, 
  Download, 
  Upload,
  Trash2,
  Info,
  AlertTriangle,
  CheckCircle2,
  X,
  AlertCircle
} from 'lucide-react';
import { DEFAULT_PROGRAMS, BreadWeight, UserRecipe, Program, FlourType } from './types';
import { useTimer } from './hooks/useTimer';
import { cn } from './lib/utils';

// --- UI Components ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  confirmVariant?: 'primary' | 'danger';
}

const Modal = ({ isOpen, onClose, title, children, onConfirm, confirmText, confirmVariant = 'primary' }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl z-10"
          >
            <div className="px-6 pt-6 pb-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">{title}</h3>
              <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 pb-6 text-stone-600 text-sm">
              {children}
            </div>
            {onConfirm && (
              <div className="px-6 pb-6 flex gap-3">
                <button 
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-bold bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => { onConfirm(); onClose(); }}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-white transition-all",
                    confirmVariant === 'danger' ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-100" : "bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-100"
                  )}
                >
                  {confirmText || 'Confirmar'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  const [view, setView] = useState<'home' | 'timer' | 'recipes' | 'admin' | 'add-recipe' | 'edit-program'>('home');
  const [programs, setPrograms] = useState<Program[]>(() => {
    const saved = localStorage.getItem('panificadora_programs');
    if (!saved) return DEFAULT_PROGRAMS;
    try {
      const parsed = JSON.parse(saved);
      if (!parsed || !Array.isArray(parsed)) return DEFAULT_PROGRAMS;
      const validPrograms = parsed.filter(p => p && typeof p === 'object' && typeof p.id === 'number');
      // Merge with default programs to ensure all are present
      const existingIds = new Set(validPrograms.map((p: any) => p.id));
      const missing = DEFAULT_PROGRAMS.filter(p => !existingIds.has(p.id));
      return [...validPrograms, ...missing].sort((a, b) => a.id - b.id);
    } catch (e) {
      return DEFAULT_PROGRAMS;
    }
  });
  const [recipes, setRecipes] = useState<UserRecipe[]>(() => {
    const saved = localStorage.getItem('panificadora_recipes');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(r => r && typeof r === 'object' && typeof r.id === 'string') : [];
    } catch (e) {
      return [];
    }
  });

  const { state, start, stop, progress } = useTimer(programs);
  const [selectedProgramId, setSelectedProgramId] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState<BreadWeight>(1000);
  const [selectedDelay, setSelectedDelay] = useState(0);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<UserRecipe | null>(null);
  const [stepsOpen, setStepsOpen] = useState(false);

  // Modal & Toast state
  const [modal, setModal] = useState<{ type: 'stop' | 'delete-recipe' | 'import-success' | 'import-error', data?: any } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('panificadora_programs', JSON.stringify(programs));
  }, [programs]);

  useEffect(() => {
    localStorage.setItem('panificadora_recipes', JSON.stringify(recipes));
  }, [recipes]);

  // Notifications
  useEffect(() => {
    if (progress && !progress.isFinished) {
      if (progress.addTime > 0) {
        const diff = progress.addTime - progress.elapsedMins;
        if (Math.abs(diff) < 0.1) {
          sendNotification("¡Añadir ingredientes!", "Es el momento de añadir los extras a tu pan.");
        }
      }
      if (progress.rmvTime > 0) {
        const diff = progress.rmvTime - progress.elapsedMins;
        if (Math.abs(diff) < 0.1) {
          sendNotification("¡Retirar palas!", "Retira las palas de amasado ahora para un mejor resultado.");
        }
      }
    }
  }, [progress]);

  const sendNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  };

  const handleExport = () => {
    const data = { programs, recipes };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `panificadora_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.programs) setPrograms(data.programs);
        if (data.recipes) setRecipes(data.recipes);
        addToast("Importación exitosa", "success");
      } catch (err) {
        addToast("Error al importar el archivo", "error");
      }
    };
    reader.readAsText(file);
  };

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    const s = Math.floor((mins * 60) % 60);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    if (h === 0) return `${m} min`;
    return `${h}h ${m}min`;
  };

  const calculateHydration = (recipe: Partial<UserRecipe>) => {
    if (!recipe || !recipe.flours) return 0;
    const totalFlour = (Object.values(recipe.flours) as (number | undefined)[]).reduce<number>((acc, val) => acc + (val || 0), 0);
    if (totalFlour === 0) return 0;
    return ((recipe.water || 0) / totalFlour) * 100;
  };

  return (
    <div className="fixed inset-0 bg-stone-50 text-stone-900 font-sans selection:bg-orange-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2" onClick={() => setView('home')}>
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-200">
            <Timer size={20} />
          </div>
          <h1 className="font-bold text-lg tracking-tight">Panificadora<span className="text-orange-500">Pro</span></h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {view === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {state.isActive && progress && (
                  <div 
                    onClick={() => setView('timer')}
                    className="bg-orange-500 p-4 rounded-2xl text-white shadow-xl shadow-orange-200 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-medium opacity-80 uppercase tracking-wider">Programa en curso</p>
                      <p className="font-bold text-lg">{programs.find(p => p.id === state.programId)?.name}</p>
                      <div className="flex items-center gap-2 mt-1 opacity-80 text-[10px] font-bold uppercase">
                        <span>Total: {formatDuration(progress.totalMins)}</span>
                        <span>•</span>
                        <span>Fin: {new Date(Date.now() + (progress.totalMins - progress.elapsedMins) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-mono font-bold">{formatTime(progress.totalMins - progress.elapsedMins)}</p>
                      <p className="text-xs opacity-80">restante</p>
                    </div>
                  </div>
                )}

                <section className="space-y-4">
                  <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-widest px-1">Nuevo Proceso</h2>
                  
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 space-y-4">
                    <div>
                      <label className="text-xs font-medium text-stone-500 mb-2 block">Programa</label>
                      <select 
                        value={selectedProgramId}
                        onChange={(e) => setSelectedProgramId(Number(e.target.value))}
                        className="w-full bg-stone-50 border-none rounded-xl p-3 text-stone-900 focus:ring-2 focus:ring-orange-500 transition-all appearance-none"
                      >
                        {programs.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.id}. {p.name} ({formatDuration(p.timings[selectedWeight]?.total || 0)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[1000, 1250, 1500].map(w => (
                        <button
                          key={w}
                          onClick={() => setSelectedWeight(w as BreadWeight)}
                          className={cn(
                            "py-2 rounded-xl text-sm font-medium transition-all border",
                            selectedWeight === w 
                              ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-100" 
                              : "bg-white border-stone-200 text-stone-600 hover:border-orange-300"
                          )}
                        >
                          {w}g
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-stone-500">Retraso de inicio</label>
                        <span className="text-xs font-bold text-orange-600">{selectedDelay}h</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="15" 
                        step="1" 
                        value={selectedDelay}
                        onChange={(e) => setSelectedDelay(Number(e.target.value))}
                        className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                      <div className="flex justify-between items-center px-1">
                        <p className="text-[10px] text-stone-400">Inicia en {selectedDelay}h</p>
                        {(() => {
                          const program = programs.find(p => p.id === selectedProgramId);
                          const duration = program?.timings[selectedWeight]?.total || 0;
                          if (duration === 0) return null;
                          const finishTime = new Date(Date.now() + (selectedDelay * 60 + duration) * 60000);
                          return (
                            <p className="text-[10px] font-bold text-stone-500">
                              Duración: {formatDuration(duration)} • Finaliza: {finishTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          );
                        })()}
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        start(selectedProgramId, selectedWeight, selectedDelay);
                        setStepsOpen(false);
                        setView('timer');
                      }}
                      className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 active:scale-95 transition-all"
                    >
                      <Play size={20} fill="currentColor" />
                      Iniciar Programa
                    </button>
                  </div>
                </section>
              </motion.div>
            )}

            {view === 'timer' && progress && (
              <motion.div 
                key="timer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <p className="text-stone-400 font-medium uppercase tracking-widest text-xs">
                    {programs.find(p => p.id === state.programId)?.name} • {state.weight}g
                  </p>
                  <h2 className="text-6xl font-mono font-bold tracking-tighter">
                    {formatTime(progress.totalMins - progress.elapsedMins)}
                  </h2>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center justify-center gap-2 text-orange-500 font-medium">
                      <span className="animate-pulse">●</span>
                      {progress.currentStep?.name || "Finalizado"}
                    </div>
                    <p className="text-[10px] text-stone-400 font-mono">
                      Transcurrido: {formatTime(progress.elapsedMins)}
                    </p>
                  </div>
                </div>

                <div className="relative h-3 bg-stone-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(progress.elapsedMins / progress.totalMins) * 100}%` }}
                  />
                  {progress.addTime > 0 && (
                    <div 
                      className="absolute top-0 w-1 h-full bg-white/50 z-10" 
                      style={{ left: `${(progress.addTime / progress.totalMins) * 100}%` }}
                    />
                  )}
                  {progress.rmvTime > 0 && (
                    <div 
                      className="absolute top-0 w-1 h-full bg-white/50 z-10" 
                      style={{ left: `${(progress.rmvTime / progress.totalMins) * 100}%` }}
                    />
                  )}
                </div>

                <div className={cn(
                  "grid gap-4",
                  progress.addTime > 0 && progress.rmvTime > 0 ? "grid-cols-2" : "grid-cols-1"
                )}>
                  {progress.addTime > 0 && (
                    <div className={cn(
                      "p-4 rounded-2xl border transition-all",
                      progress.elapsedMins > progress.addTime
                        ? "bg-red-50 border-red-100 text-red-700"
                        : "bg-white border-stone-100"
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <Plus size={16} />
                        <span className="text-xs font-bold uppercase">Añadir</span>
                      </div>
                      <p className="text-lg font-mono font-bold">
                        {progress.elapsedMins > progress.addTime ? `+${formatTime(progress.elapsedMins - progress.addTime)}` : formatTime(progress.addTime - progress.elapsedMins)}
                      </p>
                      <p className="text-[10px] opacity-70">
                        {progress.elapsedMins > progress.addTime ? "Tiempo pasado" : "Faltan"}
                      </p>
                    </div>
                  )}

                  {progress.rmvTime > 0 && (
                    <div className={cn(
                      "p-4 rounded-2xl border transition-all",
                      progress.elapsedMins > progress.rmvTime
                        ? "bg-red-50 border-red-100 text-red-700"
                        : "bg-white border-stone-100"
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <Trash2 size={16} />
                        <span className="text-xs font-bold uppercase">Palas</span>
                      </div>
                      <p className="text-lg font-mono font-bold">
                        {progress.elapsedMins > progress.rmvTime ? `+${formatTime(progress.elapsedMins - progress.rmvTime)}` : formatTime(progress.rmvTime - progress.elapsedMins)}
                      </p>
                      <p className="text-[10px] opacity-70">
                        {progress.elapsedMins > progress.rmvTime ? "Tiempo pasado" : "Faltan"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
                  <button 
                    onClick={() => setStepsOpen(!stepsOpen)}
                    className="w-full p-4 flex items-center justify-between bg-stone-50/50 hover:bg-stone-100/50 transition-colors"
                  >
                    <h3 className="text-xs font-bold uppercase text-stone-400 tracking-widest">Pasos del Proceso</h3>
                    <motion.div
                      animate={{ rotate: stepsOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight size={16} className="text-stone-400" />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {stepsOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-stone-100">
                          {progress.steps.map((step, idx) => {
                            const stepStart = progress.steps.slice(0, idx).reduce((acc, s) => acc + s.duration, 0);
                            const isPast = progress.elapsedMins >= stepStart + step.duration;
                            const isCurrent = idx === progress.currentStepIndex;

                            return (
                              <div key={idx} className={cn(
                                "p-4 flex items-center justify-between border-b border-stone-50 last:border-0",
                                isCurrent && "bg-orange-50/50",
                                isPast && "opacity-40"
                              )}>
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                                    isCurrent ? "bg-orange-500 text-white" : "bg-stone-100 text-stone-400"
                                  )}>
                                    {isPast ? <CheckCircle2 size={14} /> : idx + 1}
                                  </div>
                                  <div>
                                    <p className={cn("text-sm font-medium", isCurrent && "text-orange-600")}>{step.name}</p>
                                    <p className="text-[10px] text-stone-400">{step.duration} min</p>
                                  </div>
                                </div>
                                {isCurrent && (
                                  <div className="text-xs font-mono font-bold text-orange-500">
                                    {formatTime(step.duration - progress.timeInStep)}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={() => setModal({ type: 'stop' })}
                  className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
                >
                  <Square size={20} fill="currentColor" />
                  Detener Proceso
                </button>
              </motion.div>
            )}

            {view === 'recipes' && (
              <motion.div 
                key="recipes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xl font-bold">Mis Recetas</h2>
                  <button onClick={() => setView('add-recipe')} className="bg-orange-500 text-white p-2 rounded-full shadow-lg shadow-orange-200">
                    <Plus size={24} />
                  </button>
                </div>

                {recipes.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-stone-300">
                    <BookOpen size={48} className="mx-auto text-stone-200 mb-4" />
                    <p className="text-stone-400 text-sm">No tienes recetas guardadas</p>
                    <button onClick={() => setView('add-recipe')} className="mt-4 text-orange-500 font-bold text-sm">Crear mi primera receta</button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {recipes.map(recipe => (
                      <div key={recipe.id} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-lg">{recipe.name}</h3>
                            <p className="text-xs text-stone-500">{programs.find(p => p.id === recipe.programId)?.name} • {recipe.weight}g</p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setEditingRecipe(recipe);
                                setView('add-recipe');
                              }}
                              className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-stone-500"
                            >
                              <Settings size={14} />
                            </button>
                            <button 
                              onClick={() => setModal({ type: 'delete-recipe', data: recipe.id })}
                              className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedProgramId(recipe.programId);
                                setSelectedWeight(recipe.weight);
                                setView('home');
                                addToast("Receta cargada. Ajusta el retraso si lo deseas.", "info");
                              }}
                              className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-md shadow-orange-100"
                            >
                              <Play size={18} fill="currentColor" />
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-4 text-[10px] font-bold uppercase text-stone-400 border-t border-stone-50 pt-3">
                          <span>Hidratación: <span className="text-orange-500">{calculateHydration(recipe).toFixed(1)}%</span></span>
                          <span>Harina: {(Object.values(recipe.flours || {}) as (number | undefined)[]).reduce<number>((a, b) => a + (b || 0), 0)}g</span>
                          <span>Agua: {recipe.water}ml</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {view === 'admin' && (
              <motion.div 
                key="admin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold">Administración</h2>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 space-y-4">
                  <h3 className="text-sm font-bold uppercase text-stone-400 tracking-widest">Datos y Backup</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleExport} className="flex flex-col items-center justify-center p-4 rounded-xl border border-stone-100 hover:bg-stone-50 transition-colors gap-2">
                      <Download size={24} className="text-orange-500" />
                      <span className="text-xs font-medium">Exportar</span>
                    </button>
                    <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-stone-100 hover:bg-stone-50 transition-colors gap-2 cursor-pointer">
                      <Upload size={24} className="text-orange-500" />
                      <span className="text-xs font-medium">Importar</span>
                      <input type="file" className="hidden" onChange={handleImport} accept=".json" />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase text-stone-400 tracking-widest">Editar Programas</h3>
                  <div className="grid gap-2">
                    {programs.map(p => (
                      <button 
                        key={p.id} 
                        onClick={() => {
                          setEditingProgram(p);
                          setView('edit-program');
                        }}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between text-left"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold">{p.id}. {p.name}</span>
                          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                            Duración: {formatDuration(p.timings[1000]?.total || 0)}
                          </span>
                        </div>
                        <ChevronRight size={20} className="text-stone-300" />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'edit-program' && editingProgram && (
              <motion.div 
                key="edit-program"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Editar: {editingProgram.name}</h2>
                  <button onClick={() => setView('admin')} className="text-stone-400">Volver</button>
                </div>

                <div className="space-y-4">
                  {editingProgram.timings[1000]?.steps.map((step, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-stone-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-stone-400">Paso {idx + 1}</span>
                        <div className="flex gap-2">
                          {step.isAdd && <span className="bg-orange-100 text-orange-600 text-[10px] px-2 py-0.5 rounded-full font-bold">ADD</span>}
                          {step.isRmv && <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold">RMV</span>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-stone-400 block mb-1">Nombre</label>
                          <input 
                            value={step.name}
                            onChange={(e) => {
                              const newPrograms = [...programs];
                              const progIdx = newPrograms.findIndex(p => p.id === editingProgram.id);
                              // Update all weights for simplicity in this admin view
                              [1000, 1250, 1500].forEach(w => {
                                const weightTimings = newPrograms[progIdx].timings[w as BreadWeight];
                                if (weightTimings && weightTimings.steps[idx]) {
                                  weightTimings.steps[idx].name = e.target.value;
                                }
                              });
                              setPrograms(newPrograms);
                            }}
                            className="w-full bg-stone-50 border-none rounded-lg p-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-stone-400 block mb-1">Duración (min)</label>
                          <input 
                            type="number"
                            value={step.duration}
                            onChange={(e) => {
                              const newPrograms = [...programs];
                              const progIdx = newPrograms.findIndex(p => p.id === editingProgram.id);
                              const newDuration = Number(e.target.value);
                              [1000, 1250, 1500].forEach(w => {
                                const weightTimings = newPrograms[progIdx].timings[w as BreadWeight];
                                if (weightTimings && weightTimings.steps[idx]) {
                                  weightTimings.steps[idx].duration = newDuration;
                                  weightTimings.total = weightTimings.steps.reduce((acc, s) => acc + s.duration, 0);
                                }
                              });
                              setPrograms(newPrograms);
                            }}
                            className="w-full bg-stone-50 border-none rounded-lg p-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {view === 'add-recipe' && (
              <motion.div 
                key="add-recipe"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{editingRecipe ? 'Editar Receta' : 'Nueva Receta'}</h2>
                  <button onClick={() => { setView('recipes'); setEditingRecipe(null); }} className="text-stone-400">Cancelar</button>
                </div>

                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const flours: any = {};
                  ['Normal', 'Integral', 'Fuerza', 'Mixta', 'Espelta', 'Centeno'].forEach(f => {
                    const val = Number(formData.get(`flour_${f}`));
                    if (val > 0) flours[f] = val;
                  });

                  const recipeData: UserRecipe = {
                    id: editingRecipe ? editingRecipe.id : Date.now().toString(),
                    name: formData.get('name') as string,
                    programId: Number(formData.get('programId')),
                    weight: Number(formData.get('weight')) as BreadWeight,
                    crust: formData.get('crust') as any,
                    water: Number(formData.get('water')),
                    flours,
                    yeast: Number(formData.get('yeast')),
                    salt: Number(formData.get('salt')),
                    otherIngredients: formData.get('otherIngredients') as string,
                    notes: formData.get('notes') as string,
                    createdAt: editingRecipe ? editingRecipe.createdAt : Date.now()
                  };

                  if (editingRecipe) {
                    setRecipes(recipes.map(r => r.id === editingRecipe.id ? recipeData : r));
                  } else {
                    setRecipes([...recipes, recipeData]);
                  }
                  
                  setEditingRecipe(null);
                  setView('recipes');
                }}>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 space-y-4">
                    <div>
                      <label className="text-xs font-medium text-stone-500 mb-2 block">Nombre de la receta</label>
                      <input name="name" required defaultValue={editingRecipe?.name} className="w-full bg-stone-50 border-none rounded-xl p-3" placeholder="Ej: Mi Pan Favorito" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-stone-500 mb-2 block">Programa</label>
                        <select name="programId" defaultValue={editingRecipe?.programId || 1} className="w-full bg-stone-50 border-none rounded-xl p-3">
                          {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-stone-500 mb-2 block">Peso</label>
                        <select name="weight" defaultValue={editingRecipe?.weight || 1000} className="w-full bg-stone-50 border-none rounded-xl p-3">
                          <option value="1000">1000g</option>
                          <option value="1250">1250g</option>
                          <option value="1500">1500g</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-stone-500 mb-2 block">Tostado</label>
                      <div className="flex gap-2">
                        {['Claro', 'Media', 'Oscuro'].map(c => (
                          <label key={c} className="flex-1">
                            <input type="radio" name="crust" value={c} defaultChecked={editingRecipe?.crust === c || (!editingRecipe && c === 'Media')} className="sr-only peer" />
                            <div className="text-center py-2 rounded-xl bg-stone-50 text-xs font-bold peer-checked:bg-orange-500 peer-checked:text-white transition-colors cursor-pointer">
                              {c}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-stone-50 pt-4">
                      <h3 className="text-xs font-bold uppercase text-stone-400 tracking-widest">Ingredientes Base</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-stone-400 block mb-1">Agua (ml)</label>
                          <input type="number" name="water" required defaultValue={editingRecipe?.water} className="w-full bg-stone-50 border-none rounded-lg p-2 text-sm" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-stone-400 block mb-1">Levadura (g)</label>
                          <input type="number" step="0.1" name="yeast" required defaultValue={editingRecipe?.yeast} className="w-full bg-stone-50 border-none rounded-lg p-2 text-sm" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-stone-400 block mb-1">Sal (g)</label>
                          <input type="number" step="0.1" name="salt" required defaultValue={editingRecipe?.salt} className="w-full bg-stone-50 border-none rounded-lg p-2 text-sm" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-stone-50 pt-4">
                      <h3 className="text-xs font-bold uppercase text-stone-400 tracking-widest">Harinas (g)</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {['Normal', 'Integral', 'Fuerza', 'Mixta', 'Espelta', 'Centeno'].map(f => (
                          <div key={f}>
                            <label className="text-[10px] font-bold text-stone-400 block mb-1">{f}</label>
                            <input 
                          type="number" 
                          name={`flour_${f}`} 
                          defaultValue={editingRecipe?.flours?.[f as FlourType]} 
                          className="w-full bg-stone-50 border-none rounded-lg p-2 text-sm" 
                        />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-stone-500 mb-2 block">Otros (Semillas, etc.)</label>
                      <textarea name="otherIngredients" rows={2} defaultValue={editingRecipe?.otherIngredients} className="w-full bg-stone-50 border-none rounded-xl p-3 text-sm" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-200">
                    {editingRecipe ? 'Actualizar Receta' : 'Guardar Receta'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-t border-stone-200 px-6 py-3 flex items-center justify-around pb-8 shrink-0">
        <button 
          onClick={() => setView('home')}
          className={cn("flex flex-col items-center gap-1 transition-colors", view === 'home' ? "text-orange-500" : "text-stone-400")}
        >
          <Timer size={24} />
          <span className="text-[10px] font-bold uppercase">Inicio</span>
        </button>
        <button 
          onClick={() => setView('recipes')}
          className={cn("flex flex-col items-center gap-1 transition-colors", ['recipes', 'add-recipe'].includes(view) ? "text-orange-500" : "text-stone-400")}
        >
          <BookOpen size={24} />
          <span className="text-[10px] font-bold uppercase">Recetas</span>
        </button>
        <button 
          onClick={() => setView('admin')}
          className={cn("flex flex-col items-center gap-1 transition-colors", ['admin', 'edit-program'].includes(view) ? "text-orange-500" : "text-stone-400")}
        >
          <Settings size={24} />
          <span className="text-[10px] font-bold uppercase">Ajustes</span>
        </button>
      </nav>

      {/* Modals & Overlays */}
      <Modal 
        isOpen={modal?.type === 'stop'} 
        onClose={() => setModal(null)} 
        title="Detener Proceso"
        confirmText="Detener"
        confirmVariant="danger"
        onConfirm={() => {
          stop();
          setView('home');
          addToast("Programa detenido", "info");
        }}
      >
        ¿Estás seguro de que quieres detener el programa actual? Se perderá el progreso.
      </Modal>

      <Modal 
        isOpen={modal?.type === 'delete-recipe'} 
        onClose={() => setModal(null)} 
        title="Eliminar Receta"
        confirmText="Eliminar"
        confirmVariant="danger"
        onConfirm={() => {
          if (modal?.data) {
            setRecipes(recipes.filter(r => r.id !== modal.data));
            addToast("Receta eliminada", "success");
          }
        }}
      >
        ¿Estás seguro de que quieres eliminar esta receta? Esta acción no se puede deshacer.
      </Modal>

      {/* Toasts */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-xs px-4">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "p-4 rounded-2xl shadow-xl flex items-center gap-3 border",
                toast.type === 'success' ? "bg-white border-green-100 text-green-800" :
                toast.type === 'error' ? "bg-white border-red-100 text-red-800" :
                "bg-white border-blue-100 text-blue-800"
              )}
            >
              {toast.type === 'success' && <CheckCircle2 className="text-green-500 shrink-0" size={20} />}
              {toast.type === 'error' && <AlertCircle className="text-red-500 shrink-0" size={20} />}
              {toast.type === 'info' && <Info className="text-blue-500 shrink-0" size={20} />}
              <p className="text-sm font-bold">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
