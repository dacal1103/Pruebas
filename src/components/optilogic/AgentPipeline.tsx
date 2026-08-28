import React, { useState } from 'react';
import { Cpu, Brain, Variable, CheckCircle2, ChevronRight, Activity, Terminal, ShieldAlert, Sparkles } from 'lucide-react';
import { LPModel, OptimizationResult } from '../../types';

interface AgentPipelineProps {
  model: LPModel;
  solution: OptimizationResult;
  isTranslating: boolean;
  activeAgentIndex: number;
}

export const AgentPipeline: React.FC<AgentPipelineProps> = ({
  model,
  solution,
  isTranslating,
  activeAgentIndex,
}) => {
  const [expandedAgent, setExpandedAgent] = useState<number | null>(null);

  const agents = [
    {
      id: 0,
      name: 'Agente 1: Extractor de Dominio',
      role: 'Extracción de Conjuntos, Parámetros y Variables de Negocio',
      icon: Brain,
      color: 'bg-blue-600',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
      badge: `${model.variables.length} Variables | ${model.parameters.length} Parámetros`,
      details: `Identificó ${model.sets.length} conjuntos de negocio (${model.sets.map((s) => s.name).join(', ') || 'N/A'}), ${model.parameters.length} parámetros cuantitativos y ${model.variables.length} variables de decisión con cotas físicas.`,
    },
    {
      id: 1,
      name: 'Agente 2: Formulación & Google OR-Tools',
      role: 'Síntesis Matemática y Generador de Código Python (GLOP/CBC)',
      icon: Variable,
      color: 'bg-amber-600',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-200',
      bgColor: 'bg-amber-50',
      badge: `${model.constraints.length} Restricciones | ${model.objective.type.toUpperCase()}`,
      details: `Estructuró la función objetivo '${model.objective.name}' y ${model.constraints.length} restricciones lineales. Generó script compatible con pywraplp.Solver.CreateSolver('${model.orToolsSolverName || 'GLOP'}').`,
    },
    {
      id: 2,
      name: 'Agente 3: Motor Solver & Holguras',
      role: 'Simplex Primal-Dual, Precios Sombra y Región Factible',
      icon: Activity,
      color: 'bg-emerald-600',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      bgColor: 'bg-emerald-50',
      badge: `Status: ${solution.status} | Z* = $${solution.objectiveValue.toLocaleString()}`,
      details: `Resolución matemática óptima en milisegundos. Calculó ${solution.bottlenecks.length} cuellos de botella (restricciones activas) y ${solution.availableResources.length} recursos con holgura/excedente.`,
    },
    {
      id: 3,
      name: 'Agente 4: Asesor Ejecutivo What-If',
      role: 'Traducción a Decisiones Gerenciales y Retorno de Inversión',
      icon: Sparkles,
      color: 'bg-indigo-600',
      textColor: 'text-indigo-700',
      borderColor: 'border-indigo-200',
      bgColor: 'bg-indigo-50',
      badge: `${solution.managerialRecommendations.length} Recomendaciones`,
      details: `Sintetizó el impacto gerencial y trade-offs: determinó prioridades de inversión según los precios sombra de mayor retorno unitario.`,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-blue-600" />
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
            Pipeline Multi-Agente de Optimización
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            4 Agentes Coordinados
          </span>
          <span>•</span>
          <span className="font-mono text-slate-400">Google OR-Tools pywraplp</span>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {agents.map((agent, idx) => {
          const Icon = agent.icon;
          const isCurrentActive = isTranslating && activeAgentIndex === idx;
          const isExpanded = expandedAgent === idx;

          return (
            <div
              key={agent.id}
              onClick={() => setExpandedAgent(isExpanded ? null : idx)}
              className={`cursor-pointer rounded-xl border p-3.5 transition-all relative overflow-hidden ${
                isCurrentActive
                  ? `${agent.borderColor} ${agent.bgColor} ring-2 ring-blue-500/40 shadow-md`
                  : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white hover:shadow-sm'
              }`}
            >
              {/* Agent header */}
              <div className="flex items-start justify-between mb-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${agent.color} text-white shadow-sm`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${agent.borderColor} ${agent.textColor} ${agent.bgColor}`}>
                  {agent.badge}
                </span>
              </div>

              {/* Title & Role */}
              <h3 className="text-xs font-bold text-slate-900 mb-0.5">
                {agent.name}
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                {agent.role}
              </p>

              {/* Expansion Details */}
              <p className="text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed shadow-xs">
                {agent.details}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
