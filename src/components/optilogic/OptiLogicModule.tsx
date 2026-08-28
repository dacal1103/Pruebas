import React, { useState, useMemo } from 'react';
import { InitialChatScreen } from './InitialChatScreen';
import { AgentPipeline } from './AgentPipeline';
import { MathFormulationView } from './MathFormulationView';
import { GraphicalMethod } from './GraphicalMethod';
import { SlackAnalysis } from './SlackAnalysis';
import { SensitivitySandbox } from './SensitivitySandbox';
import { OrToolsCodeView } from './OrToolsCodeView';
import { DecisionAdvisorView } from './DecisionAdvisorView';
import { ProblemInputModal } from './ProblemInputModal';
import { VectorDbManagerModal } from './VectorDbManagerModal';
import { INITIAL_DEFAULT_MODEL } from '../../data/presets';
import { LPModel, OptimizationResult, PresetBusinessProblem } from '../../types';
import { solveLPModel } from '../../utils/solver';
import {
  Compass,
  Gauge,
  Layers,
  Sliders,
  Terminal,
  Sparkles,
  AlertCircle,
  MessageSquareText,
  Database,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

export const OptiLogicModule: React.FC = () => {
  // Screen View Mode: 'chat' | 'dashboard'
  const [viewMode, setViewMode] = useState<'chat' | 'dashboard'>('chat');
  const [hasFormulatedOnce, setHasFormulatedOnce] = useState(false);

  // Active LP model
  const [model, setModel] = useState<LPModel>(INITIAL_DEFAULT_MODEL);
  // Baseline model (for What-If delta comparison)
  const [originalModel, setOriginalModel] = useState<LPModel>(INITIAL_DEFAULT_MODEL);

  // Active Main Navigation Tab in Dashboard
  const [activeTab, setActiveTab] = useState<
    'graph' | 'slack' | 'formulation' | 'sensitivity' | 'ortools' | 'advisor'
  >('graph');

  // Modal State
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [isVectorDbModalOpen, setIsVectorDbModalOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [activeAgentIndex, setActiveAgentIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute live solution in microseconds with pure TypeScript Two-Phase Simplex engine
  const solution: OptimizationResult = useMemo(() => {
    return solveLPModel(model);
  }, [model]);

  // Compute original baseline solution
  const originalSolution: OptimizationResult = useMemo(() => {
    return solveLPModel(originalModel);
  }, [originalModel]);

  // Handle Natural Language Translation from Conversational Chat or Modal
  const handleTranslateProblem = async (
    narrative: string,
    clarifications?: Array<{ question: string; answer: string }>
  ) => {
    setIsTranslating(true);
    setErrorMessage(null);
    setActiveAgentIndex(0);

    const interval = setInterval(() => {
      setActiveAgentIndex((prev) => (prev + 1) % 4);
    }, 1200);

    try {
      const res = await fetch('/api/optimize/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ narrative, clarifications }),
      });

      const data = await res.json();
      clearInterval(interval);

      if (!res.ok || !data.success || !data.model) {
        throw new Error(data.error || 'No se pudo estructurar el modelo lineal.');
      }

      setModel(data.model);
      setOriginalModel(data.model);
      setHasFormulatedOnce(true);
      setIsProblemModalOpen(false);
      setViewMode('dashboard');
      setActiveTab('graph');
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      setErrorMessage(err.message || 'Ocurrió un error al contactar al equipo de agentes.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Handle Preset Case Selection
  const handleSelectPreset = (preset: PresetBusinessProblem) => {
    handleTranslateProblem(preset.fullNarrative);
  };

  // Handle What-If Constraint RHS Adjustment
  const handleUpdateConstraintRhs = (constraintId: string, newRhs: number) => {
    setModel((prev) => ({
      ...prev,
      constraints: prev.constraints.map((c) =>
        c.id === constraintId ? { ...c, rhs: newRhs } : c
      ),
    }));
  };

  // Handle What-If Objective Coefficient Adjustment
  const handleUpdateObjectiveCoeff = (varId: string, newCoeff: number) => {
    setModel((prev) => ({
      ...prev,
      objective: {
        ...prev.objective,
        coefficients: {
          ...prev.objective.coefficients,
          [varId]: newCoeff,
        },
      },
    }));
  };

  // Reset Model to Baseline
  const handleResetModel = () => {
    setModel(originalModel);
  };

  // Full Reset to Default Initial Factory Case & return to chat
  const handleResetToDefault = () => {
    setModel(INITIAL_DEFAULT_MODEL);
    setOriginalModel(INITIAL_DEFAULT_MODEL);
    setErrorMessage(null);
    setViewMode('chat');
  };

  // Refine Model via AI Advisor Agent
  const handleRefineModel = async (instruction: string) => {
    setIsRefining(true);
    try {
      const res = await fetch('/api/optimize/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentModel: model,
          userInstruction: instruction,
          currentSolution: solution,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.updatedModel) {
        throw new Error(data.error || 'Error al procesar la modificación.');
      }

      setModel(data.updatedModel);
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsRefining(false);
    }
  };

  if (viewMode === 'chat') {
    return (
      <div className="space-y-6">
        <InitialChatScreen
          onFormulateAndSolve={handleTranslateProblem}
          onSelectPreset={handleSelectPreset}
          onOpenExistingDashboard={
            hasFormulatedOnce ? () => setViewMode('dashboard') : undefined
          }
          onOpenVectorDb={() => setIsVectorDbModalOpen(true)}
          hasActiveModel={hasFormulatedOnce}
          isFormulating={isTranslating}
        />
        <VectorDbManagerModal
          isOpen={isVectorDbModalOpen}
          onClose={() => setIsVectorDbModalOpen(false)}
        />
      </div>
    );
  }

  const tabs = [
    { id: 'graph', label: 'Método Gráfico 2D', icon: Compass, badge: 'Interactivo' },
    {
      id: 'slack',
      label: 'Holguras y Capacidad',
      icon: Gauge,
      badge: `${solution.bottlenecks.length} Cuellos`,
    },
    { id: 'formulation', label: 'Parámetros y Reglas', icon: Layers },
    { id: 'sensitivity', label: 'Simulador What-If', icon: Sliders },
    { id: 'ortools', label: 'Google OR-Tools Python', icon: Terminal },
    { id: 'advisor', label: 'Asesor de Decisiones', icon: Sparkles, badge: 'AI' },
  ];

  return (
    <div className="space-y-6">
      {/* Action header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold text-slate-900">
                {model.problemTitle}
              </h2>
              <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {solution.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-1">
              {model.problemSummary}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setViewMode('chat')}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition cursor-pointer border border-blue-200"
          >
            <MessageSquareText className="w-3.5 h-3.5" />
            <span>Chat con Sofía</span>
          </button>

          <button
            onClick={() => setIsProblemModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Casos Tipo</span>
          </button>

          <button
            onClick={() => setIsVectorDbModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Memoria RAG</span>
          </button>

          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-3 py-2 rounded-xl transition cursor-pointer"
            title="Restablecer caso inicial"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>

      {/* Error banner */}
      {errorMessage && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Multi-Agent Orchestration Pipeline */}
      <AgentPipeline
        model={model}
        solution={solution}
        isTranslating={isTranslating}
        activeAgentIndex={activeAgentIndex}
      />

      {/* Navigation Tabs */}
      <div className="border border-slate-200 bg-white shadow-xs rounded-2xl p-1.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-blue-700 text-blue-100'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab View Contents */}
      <div className="transition-opacity duration-200">
        {activeTab === 'graph' && (
          <GraphicalMethod model={model} solution={solution} />
        )}

        {activeTab === 'slack' && (
          <SlackAnalysis model={model} solution={solution} />
        )}

        {activeTab === 'formulation' && (
          <MathFormulationView model={model} />
        )}

        {activeTab === 'sensitivity' && (
          <SensitivitySandbox
            model={model}
            originalModel={originalModel}
            solution={solution}
            originalSolution={originalSolution}
            onUpdateConstraintRhs={handleUpdateConstraintRhs}
            onUpdateObjectiveCoeff={handleUpdateObjectiveCoeff}
            onResetModel={handleResetModel}
          />
        )}

        {activeTab === 'ortools' && (
          <OrToolsCodeView model={model} />
        )}

        {activeTab === 'advisor' && (
          <DecisionAdvisorView
            model={model}
            solution={solution}
            onRefineModel={handleRefineModel}
            isRefining={isRefining}
          />
        )}
      </div>

      {/* Problem Input Modal */}
      <ProblemInputModal
        isOpen={isProblemModalOpen}
        onClose={() => setIsProblemModalOpen(false)}
        onSubmitNarrative={handleTranslateProblem}
        onSelectPreset={handleSelectPreset}
        isLoading={isTranslating}
      />

      {/* Vector DB Manager Modal */}
      <VectorDbManagerModal
        isOpen={isVectorDbModalOpen}
        onClose={() => setIsVectorDbModalOpen(false)}
      />
    </div>
  );
};
