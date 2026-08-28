import React from 'react';
import { Sliders, RotateCcw, TrendingUp, DollarSign, Layers, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { LPModel, OptimizationResult } from '../../types';

interface SensitivitySandboxProps {
  model: LPModel;
  originalModel: LPModel;
  solution: OptimizationResult;
  originalSolution: OptimizationResult;
  onUpdateConstraintRhs: (constraintId: string, newRhs: number) => void;
  onUpdateObjectiveCoeff: (varId: string, newCoeff: number) => void;
  onResetModel: () => void;
}

export const SensitivitySandbox: React.FC<SensitivitySandboxProps> = ({
  model,
  originalModel,
  solution,
  originalSolution,
  onUpdateConstraintRhs,
  onUpdateObjectiveCoeff,
  onResetModel,
}) => {
  const deltaZ = solution.objectiveValue - originalSolution.objectiveValue;
  const percentChangeZ = originalSolution.objectiveValue !== 0
    ? (deltaZ / originalSolution.objectiveValue) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header & Delta Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-blue-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Simulador de Sensibilidad & Escenarios What-If
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Mueve los deslizadores de capacidad y precios para evaluar el impacto en tiempo real sobre la función objetivo y holguras.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Delta Badge */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-right shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-500">
                Variación en Función Objetivo
              </div>
              <div className="flex items-center gap-2 font-mono text-sm font-bold">
                <span className="text-slate-500">
                  ${originalSolution.objectiveValue.toLocaleString()}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                <span
                  className={`${
                    deltaZ > 0
                      ? 'text-emerald-600'
                      : deltaZ < 0
                      ? 'text-red-600'
                      : 'text-slate-900'
                  }`}
                >
                  ${solution.objectiveValue.toLocaleString()}
                </span>
                {deltaZ !== 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-sans font-medium ${
                      deltaZ > 0
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {deltaZ > 0 ? '+' : ''}
                    {percentChangeZ.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={onResetModel}
              title="Restablecer valores originales"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Sliders: Capacities (RHS) & Profit/Cost Coefficients (c_j) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Constraints RHS (Capacities & Demands) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                1. Capacidades de Recursos & Límites (RHS)
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">
              {model.constraints.length} Restricciones
            </span>
          </div>

          <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
            {model.constraints.map((cons) => {
              const origCons = originalModel.constraints.find((c) => c.id === cons.id);
              const origRhs = origCons?.rhs ?? cons.rhs;
              const minVal = Math.max(0, Math.floor(origRhs * 0.2));
              const maxVal = Math.ceil(origRhs * 2.5) || 100;
              const isModified = cons.rhs !== origRhs;

              // Find current constraint report
              const report = solution.constraintResults.find((r) => r.id === cons.id);

              return (
                <div
                  key={cons.id}
                  className={`rounded-lg border p-3.5 transition-all ${
                    isModified
                      ? 'border-blue-300 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="text-xs font-bold text-slate-900">
                        {cons.name}
                      </span>
                      <span className="ml-2 text-[10px] text-slate-500 uppercase font-mono">
                        ({cons.operator} RHS)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isModified && (
                        <span className="text-[10px] font-medium text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                          Modificado
                        </span>
                      )}
                      <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                        {cons.rhs} {cons.unit}
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={minVal}
                    max={maxVal}
                    step={origRhs > 100 ? 5 : 1}
                    value={cons.rhs}
                    onChange={(e) => onUpdateConstraintRhs(cons.id, parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg mt-2"
                  />

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
                    <span>Mín: {minVal}</span>
                    <span>
                      Estado:{' '}
                      <strong
                        className={
                          report?.status === 'binding' ? 'text-amber-600' : 'text-emerald-600'
                        }
                      >
                        {report?.status === 'binding' ? 'Cuello de Botella' : `Holgura: ${report?.slack}`}
                      </strong>
                    </span>
                    <span>Máx: {maxVal}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Objective Function Coefficients (c_j) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                2. Márgenes de Ganancia / Costos Unitarios (c_j)
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">
              {model.variables.length} Variables
            </span>
          </div>

          <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
            {model.variables.map((v) => {
              const currentCoeff = model.objective.coefficients[v.id] ?? 0;
              const origCoeff = originalModel.objective.coefficients[v.id] ?? 0;
              const minVal = Math.max(0, Math.floor(origCoeff * 0.2));
              const maxVal = Math.ceil(origCoeff * 2.5) || 200;
              const isModified = currentCoeff !== origCoeff;
              const varResult = solution.variableResults.find((vr) => vr.id === v.id);

              return (
                <div
                  key={v.id}
                  className={`rounded-lg border p-3.5 transition-all ${
                    isModified
                      ? 'border-emerald-300 bg-emerald-50/40 shadow-xs'
                      : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{v.name}</span>
                      <span className="ml-2 font-mono text-xs font-bold text-blue-600">
                        ({v.symbol})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isModified && (
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Modificado
                        </span>
                      )}
                      <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                        ${currentCoeff} USD/{v.unit}
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={minVal}
                    max={maxVal}
                    step={origCoeff > 50 ? 5 : 1}
                    value={currentCoeff}
                    onChange={(e) => onUpdateObjectiveCoeff(v.id, parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg mt-2"
                  />

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
                    <span>Mín: ${minVal}</span>
                    <span>
                      Producción Óptima:{' '}
                      <strong className="text-emerald-700">
                        {varResult?.value} {v.unit}
                      </strong>
                    </span>
                    <span>Máx: ${maxVal}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
