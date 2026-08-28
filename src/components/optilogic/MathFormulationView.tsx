import React, { useState } from 'react';
import {
  Layers,
  Database,
  Calculator,
  Target,
  Sparkles,
  DollarSign,
  Clock,
  Boxes,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Sliders,
  HelpCircle,
  FileCode,
  ArrowRight,
  Info,
} from 'lucide-react';
import { LPModel } from '../../types';
import { LatexRenderer } from '../common/LatexRenderer';

interface MathFormulationViewProps {
  model: LPModel;
}

export const MathFormulationView: React.FC<MathFormulationViewProps> = ({ model }) => {
  const [showFormulas, setShowFormulas] = useState(false);
  const isMax = model.objective.type === 'maximize';

  // Group parameters by category for visual cards
  const categorizedParams = React.useMemo(() => {
    const costParams = model.parameters.filter(
      (p) =>
        p.category === 'cost' ||
        p.unit.includes('$') ||
        p.unit.toLowerCase().includes('usd') ||
        p.name.toLowerCase().includes('precio') ||
        p.name.toLowerCase().includes('ganancia') ||
        p.name.toLowerCase().includes('costo')
    );

    const timeParams = model.parameters.filter(
      (p) =>
        p.category === 'capacity' ||
        p.category === 'time' ||
        p.unit.toLowerCase().includes('h') ||
        p.unit.toLowerCase().includes('min') ||
        p.name.toLowerCase().includes('tiempo') ||
        p.name.toLowerCase().includes('hora') ||
        p.name.toLowerCase().includes('capacidad')
    );

    const otherParams = model.parameters.filter(
      (p) => !costParams.includes(p) && !timeParams.includes(p)
    );

    return { costParams, timeParams, otherParams };
  }, [model.parameters]);

  return (
    <div className="space-y-6">
      {/* Top Banner: Overview with View Toggle */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                <Sparkles className="h-3 w-3" /> Parámetros y Reglas del Negocio
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {model.problemTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {model.problemSummary}
            </p>
          </div>

          {/* Toggle: Visual Mode vs Mathematical Formula Mode */}
          <div className="flex items-center self-start md:self-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setShowFormulas(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !showFormulas
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Vista Visual Explicativa</span>
            </button>
            <button
              type="button"
              onClick={() => setShowFormulas(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                showFormulas
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="h-3.5 w-3.5 text-indigo-600" />
              <span>Ver Fórmulas (LaTeX)</span>
            </button>
          </div>
        </div>

        {/* Business Context Box */}
        {model.businessContext && (
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-slate-700 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-blue-950 font-bold">Contexto Operativo: </strong>
              <span>{model.businessContext}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Mode View */}
      {!showFormulas ? (
        <div className="space-y-6">
          {/* 1. Decision Variables / Products to Decide */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold">
                  <Boxes className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    1. Decisiones a Tomar (Productos o Actividades)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Qué elementos o líneas de producción debe programar tu empresa
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                {model.variables.length} Decisiones
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {model.variables.map((v) => {
                const coeff = model.objective.coefficients[v.id] ?? 0;
                return (
                  <div
                    key={v.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {v.type === 'integer' ? 'Unidades Enteras' : 'Cantidad Continua'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{v.name}</h4>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                        {isMax ? '+' : '-'} ${coeff} USD / {v.unit || 'unidad'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                      {v.description || `Cantidad a producir de ${v.name}.`}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-700">
                      <span className="bg-white px-2 py-1 rounded-md border border-slate-200 font-medium">
                        Mínimo a producir: <strong>{v.lowerBound} {v.unit}</strong>
                      </span>
                      {v.upperBound && v.upperBound > 0 && (
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-200 font-medium text-amber-800">
                          Tope de mercado: <strong>{v.upperBound} {v.unit}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Visual Parameter Cards (Precios, Tiempos, Costos) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    2. Parámetros Cuantitativos y Costos Operativos ({model.parameters.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Valores económicos, tasas de consumo y capacidades clave
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {model.parameters.map((p) => {
                const isCostOrProfit =
                  p.unit.includes('$') ||
                  p.name.toLowerCase().includes('precio') ||
                  p.name.toLowerCase().includes('ganancia') ||
                  p.name.toLowerCase().includes('costo');

                const isTime =
                  p.unit.toLowerCase().includes('h') ||
                  p.name.toLowerCase().includes('tiempo') ||
                  p.name.toLowerCase().includes('hora');

                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-amber-300 transition-all shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {p.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                            isCostOrProfit
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isTime
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}
                        >
                          {p.category || 'Dato'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">
                        Valor Asignado:
                      </span>
                      <span className="text-sm font-extrabold text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                        {p.value.toLocaleString()} {p.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Business Constraints & Limits Explained in Plain Spanish */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    3. Reglas y Límites de Capacidad de la Empresa ({model.constraints.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Límites de tiempo, mano de obra y metas de mercado explicados
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {model.constraints.map((c, idx) => {
                const isMax = c.operator === '<=';
                const isMin = c.operator === '>=';

                // Human-friendly interpretation of consumption
                const consumptionSummary = model.variables
                  .filter((v) => (c.coefficients[v.id] ?? 0) !== 0)
                  .map((v) => `${c.coefficients[v.id]} ${c.unit || ''} por cada ${v.name}`)
                  .join(' + ');

                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-purple-300 transition-all shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-200 text-purple-900 text-xs font-bold">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {c.name}
                        </h4>
                      </div>
                      <span
                        className={`self-start text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 border ${
                          isMax
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : isMin
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                      >
                        {isMax
                          ? `Tope Máximo Disponible: ${c.rhs} ${c.unit}`
                          : isMin
                          ? `Requerimiento Mínimo: ${c.rhs} ${c.unit}`
                          : `Límite Exacto: ${c.rhs} ${c.unit}`}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                      {c.description}
                    </p>

                    {consumptionSummary && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                        <span className="font-semibold text-slate-800">
                          📊 Tasa de uso de recursos:
                        </span>
                        <span className="font-medium text-purple-950">
                          {consumptionSummary}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Canonical LaTeX Formal View */
        <div className="space-y-6">
          {/* Sets */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Layers className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                1. Conjuntos del Negocio (Sets)
              </h3>
            </div>
            {model.sets.length > 0 ? (
              <div className="space-y-3">
                {model.sets.map((s) => (
                  <div key={s.id} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">
                        {s.name} (<span className="font-mono text-blue-600">{s.symbol}</span>)
                      </span>
                      <span className="text-[10px] rounded bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 font-medium">
                        {s.elements.length} Elementos
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2">{s.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.elements.map((el, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-xs text-slate-700 font-mono shadow-2xs"
                        >
                          {el}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No se definieron conjuntos explícitos.</p>
            )}
          </div>

          {/* Decision Variables Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Calculator className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                2. Variables de Decisión ({model.variables.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                    <th className="py-2.5 px-3 font-semibold">Símbolo</th>
                    <th className="py-2.5 px-3 font-semibold">Nombre</th>
                    <th className="py-2.5 px-3 font-semibold">Unidad</th>
                    <th className="py-2.5 px-3 font-semibold">Tipo</th>
                    <th className="py-2.5 px-3 font-semibold">Cota Inferior</th>
                    <th className="py-2.5 px-3 font-semibold">Cota Superior</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {model.variables.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{v.symbol}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{v.name}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono">{v.unit}</td>
                      <td className="py-2.5 px-3 font-mono uppercase">{v.type}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{v.lowerBound}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {v.upperBound !== undefined ? v.upperBound : '∞'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Objective Function (LaTeX) */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-blue-950">
                3. Función Objetivo ({model.objective.type.toUpperCase()})
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-3">{model.objective.description}</p>
            <div className="rounded-xl border border-blue-200 bg-white p-4 text-center shadow-xs">
              <LatexRenderer
                latex={model.objective.expressionLatex}
                displayMode={true}
                className="text-base sm:text-lg text-blue-900 font-bold"
              />
            </div>
          </div>

          {/* Constraints (LaTeX) */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                4. Restricciones Matemáticas ({model.constraints.length})
              </h3>
            </div>
            <div className="space-y-3">
              {model.constraints.map((c, idx) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 hover:border-slate-300 hover:bg-white transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-900">
                      {idx + 1}. {c.name}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider rounded bg-indigo-50 text-indigo-700 px-2 py-0.5 border border-indigo-200">
                      {c.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-slate-200 shadow-2xs">
                    <LatexRenderer
                      latex={c.expressionLatex}
                      className="text-xs sm:text-sm font-semibold text-slate-800"
                    />
                    <span className="font-mono text-xs text-blue-600 font-bold">
                      {c.operator} {c.rhs} {c.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
