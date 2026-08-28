import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Gauge,
  Layers,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Boxes,
  ArrowRight,
  Info,
} from 'lucide-react';
import { LPModel, OptimizationResult, BusinessConstraint } from '../../types';

interface SlackAnalysisProps {
  model: LPModel;
  solution: OptimizationResult;
}

export const SlackAnalysis: React.FC<SlackAnalysisProps> = ({ model, solution }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'bottlenecks' | 'slacks'>('all');

  const bindingConstraints = solution.constraintResults.filter((c) => c.status === 'binding');
  const slackConstraints = solution.constraintResults.filter(
    (c) => c.status === 'slack' || c.status === 'surplus'
  );

  const highestShadowPriceConstraint = solution.constraintResults
    .filter((c) => c.shadowPrice > 0)
    .sort((a, b) => b.shadowPrice - a.shadowPrice)[0];

  const filteredConstraints = solution.constraintResults.filter((c) => {
    if (selectedFilter === 'bottlenecks') return c.status === 'binding';
    if (selectedFilter === 'slacks') return c.status === 'slack' || c.status === 'surplus';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Friendly Executive Explainer: What are Slacks & Bottlenecks */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/40 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-2xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
            ¿Cómo entender las Holguras y la Capacidad de tu Empresa?
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
          Diagnóstico de Uso de Recursos y Capacidad
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          En cualquier negocio, tus recursos (horas de trabajo, presupuesto, materia prima o capacidad de máquinas) pueden estar en uno de dos estados:
        </p>

        {/* 2 Easy Concept Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/80 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-900 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>1. Al 100% de Capacidad (Cuello de Botella o Saturado)</span>
            </div>
            <p className="text-amber-950/80 leading-relaxed">
              <strong>Holgura = 0.</strong> Usaste todo lo que tenías disponible. Si quieres ganar más dinero o producir más, <em>necesitas aumentar este recurso</em>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/80 text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>2. Por Debajo de Capacidad (Con Holgura o Sobrante)</span>
            </div>
            <p className="text-emerald-950/80 leading-relaxed">
              <strong>Holgura &gt; 0.</strong> Te sobró tiempo, espacio o presupuesto. La empresa puede atender imprevistos o reasignar ese sobrante sin frenar la producción.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Optimal Value */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Resultado Financiero
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
            ${solution.objectiveValue.toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {model.objective.type === 'maximize' ? 'Ganancia máxima posible' : 'Costo operativo mínimo'}
          </p>
        </div>

        {/* KPI 2: Bottlenecks / Active Constraints */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recursos al Límite (100%)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-mono tracking-tight">
            {bindingConstraints.length}{' '}
            <span className="text-xs font-normal text-slate-400">
              / {solution.constraintResults.length} recursos
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Frenan la expansión si no se amplían
          </p>
        </div>

        {/* KPI 3: Resources with Slack */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recursos con Sobrante
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-600 font-mono tracking-tight">
            {slackConstraints.length}{' '}
            <span className="text-xs font-normal text-slate-400">recursos</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Capacidad libre disponible para usar
          </p>
        </div>

        {/* KPI 4: Max Opportunity value */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Mayor Oportunidad de Ganancia
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-600 font-mono tracking-tight">
            {highestShadowPriceConstraint
              ? `+$${highestShadowPriceConstraint.shadowPrice.toFixed(2)}`
              : '$0.00'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            {highestShadowPriceConstraint ? `Por cada unidad extra de ${highestShadowPriceConstraint.name}` : 'Sin impacto adicional'}
          </p>
        </div>
      </div>

      {/* 3. Detailed Explanatory Cards for Each Resource */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Evaluación Detallada de Cada Recurso y Límite
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Revisa si estás al tope de capacidad, si te sobra recurso o si cumpliste las metas mínimas requeridas.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({solution.constraintResults.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('bottlenecks')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedFilter === 'bottlenecks'
                  ? 'bg-amber-100 text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Al 100% ({bindingConstraints.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('slacks')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedFilter === 'slacks'
                  ? 'bg-emerald-100 text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Con Sobrante ({slackConstraints.length})
            </button>
          </div>
        </div>

        {/* Constraint Cards */}
        <div className="space-y-4">
          {filteredConstraints.map((cons) => {
            const isBinding = cons.status === 'binding';
            const isSurplus = cons.status === 'surplus';
            const originalCons = model.constraints.find((c) => c.id === cons.id);
            const unit = originalCons?.unit || 'unidades';
            const isMaxLimit = originalCons?.operator === '<=';
            const isMinLimit = originalCons?.operator === '>=';

            // Natural human explanation of the status
            let plainStatusTitle = '';
            let plainStatusExplanation = '';

            if (isBinding) {
              if (isMaxLimit) {
                plainStatusTitle = 'Capacidad Utilizada al 100% (Límite Máximo Alcanzado)';
                plainStatusExplanation = `Has consumido exactamente todos los ${cons.rhs} ${unit} disponibles. No queda nada de holgura (sobrante = 0). Este recurso es un cuello de botella: si pudieras conseguir más ${unit}, tu ganancia crecería.`;
              } else if (isMinLimit) {
                plainStatusTitle = 'Cumplimiento Exacto de la Meta Mínima Requerida';
                plainStatusExplanation = `Alcanzaste exactamente el requisito mínimo de ${cons.rhs} ${unit}. No hubo exceso ni déficit (cumplimiento al 100%).`;
              } else {
                plainStatusTitle = 'Restricción Cumplida con Exactitud';
                plainStatusExplanation = `El valor alcanzado coincide exactamente con la cuota fijada de ${cons.rhs} ${unit}.`;
              }
            } else {
              // Has Slack or Surplus
              if (isMaxLimit) {
                plainStatusTitle = `Operando Por Debajo de la Capacidad Máxima (Holgura: ${cons.slack} ${unit})`;
                plainStatusExplanation = `De los ${cons.rhs} ${unit} que tenías disponibles, tu plan óptimo solo necesita usar ${cons.lhs} ${unit}. Te sobran ${cons.slack} ${unit} libres (un ${100 - cons.utilizationPercent}% de holgura libre para otros proyectos o imprevistos).`;
              } else if (isMinLimit) {
                plainStatusTitle = `Superando el Mínimo Requerido (Exceso Favorable: ${cons.slack} ${unit})`;
                plainStatusExplanation = `El plan requería al menos ${cons.rhs} ${unit}, pero la solución óptima entrega ${cons.lhs} ${unit} (${cons.slack} ${unit} por encima de la meta mínima).`;
              } else {
                plainStatusTitle = `Margen Disponible: ${cons.slack} ${unit}`;
                plainStatusExplanation = `Diferencia de ${cons.slack} ${unit} respecto a la meta estimada.`;
              }
            }

            return (
              <div
                key={cons.id}
                className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                  isBinding
                    ? 'border-amber-300 bg-amber-50/40 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                          isBinding
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-500 text-white'
                        }`}
                      >
                        {isBinding ? '!' : '✓'}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {cons.name}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 pl-8">
                      {originalCons?.description || `Control de ${cons.name}`}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 pl-8 sm:pl-0">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                        isBinding
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}
                    >
                      {isBinding ? (
                        <>
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />
                          <span>Al 100% (Cuello de Botella)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                          <span>Holgura Libre: {cons.slack} {unit}</span>
                        </>
                      )}
                    </span>

                    {cons.shadowPrice > 0 && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1">
                        <ArrowUpRight className="h-3.5 w-3.5 text-purple-700" />
                        <span>Ganas +${cons.shadowPrice.toFixed(2)} por cada +1 {unit} extra</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Plain Spanish Interpretation Highlight Box */}
                <div className="my-3 rounded-xl bg-white p-3.5 border border-slate-200/90 text-xs text-slate-700 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Info className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>{plainStatusTitle}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed pl-6">
                    {plainStatusExplanation}
                  </p>
                </div>

                {/* Visual Progress Bar of Capacity */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex flex-wrap items-center justify-between text-xs font-medium text-slate-600">
                    <span>
                      Uso en el Plan: <strong className="text-slate-900">{cons.lhs} {unit}</strong>
                    </span>
                    <span>
                      Capacidad Máxima: <strong className="text-slate-900">{cons.rhs} {unit}</strong>
                    </span>
                    <span
                      className={`font-bold ${
                        isBinding ? 'text-amber-700' : 'text-emerald-700'
                      }`}
                    >
                      {cons.utilizationPercent}% de Capacidad Empleada
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isBinding ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, cons.utilizationPercent))}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Decision Variables & Reduced Cost Section in Easy Language */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold">
              <Boxes className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Plan de Producción por Producto / Actividad
              </h3>
              <p className="text-xs text-slate-500">
                Explicación de por qué se produce cada producto o por qué se dejó en cero
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {solution.variableResults.map((v) => {
            const isProduced = v.value > 0;
            return (
              <div
                key={v.id}
                className={`p-4 rounded-xl border transition-all ${
                  isProduced
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{v.name}</h4>
                    <span className="text-[11px] text-slate-500">
                      Variable {v.symbol}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                      isProduced
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-mono text-sm'
                        : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    {isProduced ? `${v.value} ${v.unit}` : '0 unidades (No producir)'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80 mt-2">
                  {isProduced ? (
                    <span>
                      ✅ <strong>Decisión Recomendada:</strong> Conviene producir <strong>{v.value} {v.unit}</strong> porque genera una ganancia neta superior y aprovecha de forma equilibrada los recursos disponibles.
                    </span>
                  ) : (
                    <span>
                      ⚠️ <strong>No es rentable actualmente:</strong> Con los precios y costos de hoy, fabricar este producto te haría perder dinero o quitaría recursos a productos más rentables. Su margen de ganancia tendría que subir al menos <strong>${v.reducedCost.toFixed(2)} USD</strong> para que valga la pena producirlo.
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
