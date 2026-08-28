import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BusinessOptimizationResult } from '../../types';
import {
  TrendingUp,
  Sparkles,
  Calculator,
  Percent,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Building,
  DollarSign,
  Package,
  RotateCcw,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const BusinessOptimizerSection: React.FC = () => {
  const { lastOptimization, setLastOptimization, setActiveTab } = useApp();
  const [businessName, setBusinessName] = useState('Taller Artesanal & Confección');
  const [businessType, setBusinessType] = useState('Microempresa / Emprendimiento');
  const [sector, setSector] = useState('Confección & Textil');
  const [monthlyRevenue, setMonthlyRevenue] = useState(8500000);
  const [fixedCosts, setFixedCosts] = useState(3200000);
  const [variableCosts, setVariableCosts] = useState(2600000);
  const [currentProducts, setCurrentProducts] = useState('Prendas de vestir personalizadas, uniformes y accesorios de tela');
  const [bottlenecks, setBottlenecks] = useState('Altos costos de telas por comprar en pocas cantidades, demoras en atención por WhatsApp y falta de diversificación');
  const [goal, setGoal] = useState('Reducir costos de insumos, automatizar pedidos y lanzar línea con marca propia Hecho en Pereira');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ai/business-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          businessType,
          sector,
          monthlyRevenue,
          fixedCosts,
          variableCosts,
          currentProducts,
          bottlenecks,
          goal
        })
      });

      const data = await res.json();
      if (data && typeof data === 'object' && (data.financialSummary || data.costOptimizations)) {
        setLastOptimization(data);
        try {
          confetti({ particleCount: 70, spread: 75, origin: { y: 0.6 } });
        } catch (_) {}
      } else {
        throw new Error('Formato de optimización no válido');
      }
    } catch (err: any) {
      console.error("Error running optimization:", err);
      setErrorMessage('Hubo una demora temporal en el cálculo con IA. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setLastOptimization(null);
    setErrorMessage(null);
  };

  // Safe check if lastOptimization has valid structure
  const isValidOptimization = Boolean(lastOptimization && lastOptimization.financialSummary);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 border border-teal-800/30 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              Optimizador Empresarial con Inteligencia Artificial
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
              Optimización de Costos, Procesos y Diversificación
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Diseñado para independientes, pequeños negocios, PYMEs y grandes empresas. Ingresa la información general de tu negocio y obtén un diagnóstico estratégico para reducir costos, optimizar tiempos y diversificar tus líneas de productos y servicios.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-xs space-y-1 shrink-0 text-teal-200">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Diagnóstico Financiero & Operativo
            </div>
            <p className="text-slate-300 text-[11px]">Ahorro potencial promedio de 15% a 30% en costos.</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Form vs Results */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs font-bold text-rose-700 hover:text-rose-900 underline cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {!isValidOptimization || !lastOptimization ? (
        <form onSubmit={handleOptimize} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base font-display flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              Datos Generales y Estructura de Costos del Negocio
            </h3>
            <p className="text-xs text-slate-500">
              Todos los datos son tratados con estricta confidencialidad para generar tu plan de optimización personalizado.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Nombre del Negocio o Marca:</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Tipo de Empresa:</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
              >
                <option>Independiente / Freelance</option>
                <option>Microempresa / Emprendimiento</option>
                <option>Pequeña Empresa (PYME)</option>
                <option>Mediana o Gran Empresa</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Sector Económico:</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
              >
                <option>Confección & Textil</option>
                <option>Café & Agroindustria</option>
                <option>Construcción & Obras Civiles</option>
                <option>Electricidad & Mantenimiento</option>
                <option>Tecnología, Software & Servicios</option>
                <option>Gastronomía & Alimentos</option>
                <option>Comercio Minorista / Tienda</option>
              </select>
            </div>
          </div>

          {/* Financial Breakdown Inputs */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Cifras Financieras Mensuales Estimadas (COP)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Ingresos Mensuales Promedio:</label>
                <input
                  type="number"
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Costos Fijos (Arriendo, nómina, servicios):</label>
                <input
                  type="number"
                  value={fixedCosts}
                  onChange={(e) => setFixedCosts(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Costos Variables (Materia prima, insumos, fletes):</label>
                <input
                  type="number"
                  value={variableCosts}
                  onChange={(e) => setVariableCosts(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Qualitative Info */}
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Productos o Servicios Actuales:</label>
              <input
                type="text"
                value={currentProducts}
                onChange={(e) => setCurrentProducts(e.target.value)}
                placeholder="¿Qué vendes u ofreces hoy en día?"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Cuellos de Botella o Fugas de Dinero:</label>
              <textarea
                rows={2}
                value={bottlenecks}
                onChange={(e) => setBottlenecks(e.target.value)}
                placeholder="¿Dónde sientes que se pierde tiempo, dinero o ventas?"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Objetivo Principal de Optimización:</label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Ej: Reducir costos en un 20%, automatizar procesos y expandirme a otras ciudades..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              id="run-optimizer-btn"
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analizando procesos y costos con IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generar Diagnóstico y Plan de Diversificación</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Results View */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-8 shadow-xs animate-in fade-in">
          {/* Top Bar of results */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded">
                Diagnóstico Estratégico Generado
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display mt-1.5">
                Plan de Optimización: {businessName}
              </h2>
              <p className="text-xs text-slate-500 font-medium">Sector: {sector} &bull; {businessType}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Nuevo Análisis</span>
              </button>

              <button
                onClick={() => setActiveTab('creditos')}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Crédito Blando (6m Gracia)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Financial Health Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
              <div className="text-[11px] font-semibold text-emerald-800">Margen Operativo Estimado</div>
              <div className="text-xl font-extrabold text-emerald-950 font-display mt-1">
                {lastOptimization?.financialSummary?.estimatedMargin ?? "18%"}
              </div>
              <div className="text-[10px] text-emerald-700 mt-0.5">Rentabilidad actual</div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200">
              <div className="text-[11px] font-semibold text-blue-800">Punto de Equilibrio</div>
              <div className="text-xl font-extrabold text-blue-950 font-display mt-1">
                {lastOptimization?.financialSummary?.breakEvenPoint ?? "$4.500.000 COP"}
              </div>
              <div className="text-[10px] text-blue-700 mt-0.5">Ventas mínimas mes</div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200">
              <div className="text-[11px] font-semibold text-amber-800">Ahorro Potencial</div>
              <div className="text-xl font-extrabold text-amber-950 font-display mt-1">
                {lastOptimization?.financialSummary?.potentialSavingsPercent ?? "15% - 22%"}
              </div>
              <div className="text-[10px] text-amber-700 mt-0.5">Optimizando insumos</div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200">
              <div className="text-[11px] font-semibold text-indigo-800">Diagnóstico de Salud</div>
              <div className="text-xs font-bold text-indigo-950 mt-1 leading-snug">
                {lastOptimization?.financialSummary?.healthStatus ?? "Operación sostenible con oportunidad de reducción de costos"}
              </div>
            </div>
          </div>

          {/* Cost Reductions & Process Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cost Optimization */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                1. Acciones Concretas de Reducción de Costos
              </h3>

              <div className="space-y-3">
                {lastOptimization?.costOptimizations?.map((cost, idx) => (
                  <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200/80 text-xs space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{cost.area}</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Ahorro: {cost.potentialSavings}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {cost.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Process Improvements */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                2. Mejora y Automatización de Procesos
              </h3>

              <div className="space-y-3">
                {lastOptimization?.processImprovements?.map((proc, idx) => (
                  <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200/80 text-xs space-y-1.5 shadow-xs">
                    <div className="font-bold text-slate-800">{proc.processName}</div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {proc.improvement}
                    </p>
                    <div className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 p-1.5 rounded">
                      ⚡ Impacto: {proc.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Diversification Matrix */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950 to-slate-900 text-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2 font-display text-white">
                <Sparkles className="w-5 h-5 text-amber-400" />
                3. Oportunidades de Diversificación & Marca Propia
              </h3>
              <button
                onClick={() => setActiveTab('vitrina')}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer"
              >
                Publicar en Vitrina "Hecho en Pereira & Chocó" &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lastOptimization?.diversificationOpportunities?.map((div, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/10 border border-white/15 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-sm">{div.idea}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                      Plazo: {div.estimatedImplementationTime}
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed text-[11px]">{div.description}</p>
                  <div className="text-[10px] text-emerald-200">
                    🎯 Público Objetivo: <strong>{div.targetAudience}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Executive Advice */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              Recomendación Estratégica Ejecutiva:
            </div>
            <p className="text-amber-900 leading-relaxed">
              {lastOptimization?.executiveAdvice ?? "Aprovecha los créditos blandos institucionales para optimizar maquinaria y materias primas sin comprometer el capital de trabajo."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
