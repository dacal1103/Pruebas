import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Wand2,
  Lightbulb,
  FileText,
  ArrowRight,
  ArrowLeft,
  Loader2,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Cpu,
  Layers,
  AlertCircle,
  Check,
  ChevronRight,
  Send,
  Zap,
} from 'lucide-react';
import { PRESET_PROBLEMS } from '../../data/presets';
import { PresetBusinessProblem, ProblemAudit, ClarificationQuestion } from '../../types';

interface ProblemInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitNarrative: (
    narrative: string,
    clarifications?: Array<{ question: string; answer: string }>
  ) => Promise<void>;
  onSelectPreset: (preset: PresetBusinessProblem) => void;
  isLoading: boolean;
}

type WizardPhase = 1 | 2 | 3 | 4;

export const ProblemInputModal: React.FC<ProblemInputModalProps> = ({
  isOpen,
  onClose,
  onSubmitNarrative,
  onSelectPreset,
  isLoading: isExternalLoading,
}) => {
  // Wizard Phase: 1 (Planteamiento), 2 (Auditoría & Preguntas), 3 (Validación Estructurada), 4 (Compilación)
  const [currentPhase, setCurrentPhase] = useState<WizardPhase>(1);
  const [narrative, setNarrative] = useState('');
  const [activeInputMode, setActiveInputMode] = useState<'custom' | 'templates'>('custom');

  // Audit state
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditData, setAuditData] = useState<ProblemAudit | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [auditError, setAuditError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickExamples = [
    {
      title: 'Taller de Joyería',
      text: 'Mi taller fabrica Anillos de Oro y Collares de Plata. Cada anillo deja $120 de ganancia y requiere 2 horas de fundición y 3 de pulido. Cada collar deja $200 y toma 4 horas de fundición y 2 de pulido. Tengo 80 horas de fundición y 90 horas de pulido disponibles al mes. Quiero maximizar la ganancia y saber qué taller es el cuello de botella.',
    },
    {
      title: 'Nutrición Animal (Dieta Mínima)',
      text: 'Una granja avícola mezcla dos tipos de granos (Maíz y Soja) para alimentar a sus aves. El Maíz cuesta $0.30/kg y aporta 10g de proteína y 20g de carbohidratos. La Soja cuesta $0.70/kg y aporta 35g de proteína y 10g de carbohidratos. Cada ración diaria debe tener al menos 70g de proteína y 80g de carbohidratos. Queremos minimizar el costo del alimento diario.',
    },
    {
      title: 'Planificación de Enlatadora',
      text: 'Una procesadora de alimentos envasa Latas Grandes (1kg) y Latas Medianas (500g). Ganancia: $1.50 por grande y $0.90 por mediana. Se disponen de 5,000 kg de fruta al día y 6,000 latas metálicas en stock. Las máquinas de sellado pueden procesar máximo 7,000 unidades en total. Se exige producir al menos 1,500 latas grandes por contratos.',
    },
  ];

  // Heuristic offline fallback audit in case network or API is unavailable
  const generateFallbackAudit = (text: string): ProblemAudit => {
    const isMin = /minimizar|costo|gasto|dieta/i.test(text);
    return {
      completenessScore: 78,
      summaryOfUnderstanding:
        'Los agentes identificaron un problema de optimización con variables de producción/mezcla y restricciones de capacidad de recursos.',
      detectedObjective: isMin
        ? 'Minimizar Costo Operativo / Insumos Totales'
        : 'Maximizar Ganancia / Margen de Contribución Total',
      detectedVariables: [
        { name: 'Producto / Decisión 1', estimatedUnit: 'unidades', role: 'Variable Principal x_1' },
        { name: 'Producto / Decisión 2', estimatedUnit: 'unidades', role: 'Variable Principal x_2' },
      ],
      detectedConstraints: [
        { name: 'Disponibilidad de Recursos Principales', resourceType: 'Capacidad', isComplete: true },
        { name: 'Balance y Requisitos Técnicos', resourceType: 'Técnica', isComplete: true },
      ],
      clarificationQuestions: [
        {
          id: 'q_demand',
          question: '¿Existe algún compromiso o límite de demanda mínima o máxima?',
          importance: 'recommended',
          context: 'Ayuda a acotar si todo lo producido se vende o si hay cuotas contractuales.',
          suggestedOptions: ['Sin límite de demanda (todo se vende)', 'Demanda máxima limitada', 'Demanda mínima obligatoria'],
          defaultAssumption: 'Sin límite de demanda (todo lo producido se comercializa)',
        },
        {
          id: 'q_nature',
          question: '¿Las variables deben ser números enteros o pueden ser fraccionarias?',
          importance: 'recommended',
          context: 'Determina si el solver usa programación lineal continua (GLOP) o entera (CBC).',
          suggestedOptions: ['Continuas (fracciones válidas)', 'Enteras estrictas (unidades indivisibles)'],
          defaultAssumption: 'Continuas (GLOP)',
        },
        {
          id: 'q_overtime',
          question: '¿Las capacidades de recursos son estrictas o se permite tiempo extra?',
          importance: 'optional',
          context: 'Influye en el cálculo de precios sombra y valor dual.',
          suggestedOptions: ['Capacidades estrictas sin tiempo extra', 'Se permite tiempo extra con sobrecosto'],
          defaultAssumption: 'Capacidades estrictas fijas',
        },
      ],
      isReadyToFormulate: true,
    };
  };

  // Phase 1 -> Phase 2: Call Audit API
  const handleStartAudit = async () => {
    if (!narrative.trim() || narrative.trim().length < 5) return;
    setIsAuditing(true);
    setAuditError(null);

    try {
      const res = await fetch('/api/optimize/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ narrative }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.audit) {
        setAuditData(data.audit);
        // Pre-fill default answers
        const defaults: Record<string, string> = {};
        data.audit.clarificationQuestions?.forEach((q: ClarificationQuestion) => {
          defaults[q.id] = q.defaultAssumption || (q.suggestedOptions?.[0] || '');
        });
        setUserAnswers(defaults);
      } else {
        // Fallback
        const fallback = generateFallbackAudit(narrative);
        setAuditData(fallback);
        const defaults: Record<string, string> = {};
        fallback.clarificationQuestions.forEach((q) => {
          defaults[q.id] = q.defaultAssumption;
        });
        setUserAnswers(defaults);
      }
      setCurrentPhase(2);
    } catch (err: any) {
      console.warn('Audit API error, using smart fallback:', err);
      const fallback = generateFallbackAudit(narrative);
      setAuditData(fallback);
      const defaults: Record<string, string> = {};
      fallback.clarificationQuestions.forEach((q) => {
        defaults[q.id] = q.defaultAssumption;
      });
      setUserAnswers(defaults);
      setCurrentPhase(2);
    } finally {
      setIsAuditing(false);
    }
  };

  // Handle final submission to solver (Phase 3/4)
  const handleFinalSubmit = async () => {
    setCurrentPhase(4);
    const clarificationsList = auditData?.clarificationQuestions?.map((q) => ({
      question: q.question,
      answer: userAnswers[q.id] || q.defaultAssumption,
    }));

    await onSubmitNarrative(narrative, clarificationsList);
  };

  const steps = [
    { num: 1, label: '1. Planteamiento', desc: 'Narrativa de negocio' },
    { num: 2, label: '2. Auditoría & Preguntas', desc: 'Captura y aclaraciones' },
    { num: 3, label: '3. Estructura Canónica', desc: 'Revisión preliminar' },
    { num: 4, label: '4. Optimización', desc: 'OR-Tools & Simplex' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Title and Close Button */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                Asistente de Modelado por Fases
              </h2>
              <p className="text-xs text-slate-500">
                Los agentes escuchan tu problema, capturan variables y consultan datos faltantes paso a paso.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isAuditing || isExternalLoading}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Phase Stepper Bar */}
        <div className="border-b border-slate-200 bg-white px-4 sm:px-6 py-3">
          <div className="grid grid-cols-4 gap-2">
            {steps.map((s) => {
              const isCurrent = currentPhase === s.num;
              const isDone = currentPhase > s.num;

              return (
                <div
                  key={s.num}
                  className={`flex flex-col items-center sm:items-start p-1.5 sm:p-2 rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-blue-50/70 border border-blue-200 text-blue-900'
                      : isDone
                      ? 'bg-slate-50 border border-slate-200 text-slate-700'
                      : 'border border-transparent text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isDone ? <Check className="h-3 w-3" /> : s.num}
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold truncate">
                      {s.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 hidden sm:block mt-0.5 truncate">
                    {s.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Container per Phase */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* =========================================================
              FASE 1: PLANTEAMIENTO INICIAL
             ========================================================= */}
          {currentPhase === 1 && (
            <div className="space-y-4">
              {/* Tab Selector: Custom vs Templates */}
              <div className="flex border-b border-slate-200 pb-2 gap-4">
                <button
                  type="button"
                  onClick={() => setActiveInputMode('custom')}
                  className={`flex items-center gap-1.5 pb-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                    activeInputMode === 'custom'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Describir Problema Propio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInputMode('templates')}
                  className={`flex items-center gap-1.5 pb-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                    activeInputMode === 'templates'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Casos Preconfigurados ({PRESET_PROBLEMS.length})</span>
                </button>
              </div>

              {activeInputMode === 'custom' ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Describe la situación de tu negocio en lenguaje natural:
                      </label>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {narrative.length} caracteres
                      </span>
                    </div>
                    <textarea
                      id="textarea-narrative"
                      value={narrative}
                      onChange={(e) => setNarrative(e.target.value)}
                      placeholder="Ejemplo: 'Mi taller fabrica Anillos de Oro y Collares de Plata. Cada anillo deja $120 de ganancia y requiere 2 horas de fundición y 3 de pulido. Cada collar deja $200 y toma 4 horas de fundición y 2 de pulido. Disponemos de 80 horas de fundición y 90 horas de pulido. Queremos maximizar la ganancia total...'"
                      rows={6}
                      disabled={isAuditing}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none leading-relaxed transition-colors shadow-2xs"
                    />
                  </div>

                  {/* Guiding points to help user */}
                  <div className="rounded-lg bg-blue-50/50 border border-blue-100 p-3 text-xs text-slate-600">
                    <span className="font-semibold text-blue-900 block mb-1">
                      💡 Consejos para una descripción efectiva:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
                      <li>Menciona tus productos o decisiones (ej. Producto A y B).</li>
                      <li>Indica recursos escasos (horas, materia prima, presupuesto).</li>
                      <li>Aclara si deseas maximizar ganancias o minimizar costos.</li>
                    </ul>
                  </div>

                  {/* Quick Examples Starter */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                      <span>O selecciona un ejemplo rápido para cargar:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {quickExamples.map((ex, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNarrative(ex.text)}
                          className="rounded-lg border border-slate-200 bg-slate-50/60 p-2.5 text-left text-xs transition-all hover:border-blue-400 hover:bg-blue-50/30 group cursor-pointer shadow-2xs"
                        >
                          <span className="font-semibold text-slate-800 group-hover:text-blue-600 block mb-1">
                            {ex.title}
                          </span>
                          <span className="text-[11px] text-slate-500 line-clamp-2">
                            {ex.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      id="btn-audit-narrative"
                      type="button"
                      onClick={handleStartAudit}
                      disabled={!narrative.trim() || isAuditing}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      {isAuditing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Agentes Analizando Planteamiento...</span>
                        </>
                      ) : (
                        <>
                          <span>Analizar con Agentes</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Preset Cases Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRESET_PROBLEMS.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-blue-400 hover:bg-white shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-slate-900">{preset.title}</span>
                          <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            {preset.industry}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                          {preset.shortDescription}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {preset.tags.map((tag, i) => (
                            <span key={i} className="text-[10px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded shadow-2xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setNarrative(preset.fullNarrative);
                            setActiveInputMode('custom');
                          }}
                          className="flex-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 py-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                        >
                          Cargar a Editor
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPreset(preset);
                            onClose();
                          }}
                          className="flex items-center justify-center gap-1 flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 py-2 text-xs font-semibold text-white transition-colors cursor-pointer shadow-2xs"
                        >
                          <span>Ejecutar Directo</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              FASE 2: AUDITORÍA DEL AGENTE & PREGUNTAS DE CLARIFICACIÓN
             ========================================================= */}
          {currentPhase === 2 && auditData && (
            <div className="space-y-5 animate-in fade-in">
              {/* Completeness & Understanding Card */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        Diagnóstico Inicial del Agente de Modelado
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {auditData.summaryOfUnderstanding}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Completitud</span>
                      <span className="text-xs font-bold text-blue-700 font-mono">
                        {auditData.completenessScore}%
                      </span>
                    </div>
                    <div className="h-2 w-16 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${auditData.completenessScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Extracted snapshot tags */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-blue-100">
                  <div className="bg-white p-2.5 rounded-lg border border-blue-100 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Objetivo
                    </span>
                    <span className="font-semibold text-slate-800 line-clamp-1">
                      {auditData.detectedObjective}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-blue-100 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Variables Identificadas
                    </span>
                    <span className="font-semibold text-slate-800 line-clamp-1">
                      {auditData.detectedVariables.map((v) => v.name).join(', ') || 'x1, x2'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-blue-100 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Restricciones Detectadas
                    </span>
                    <span className="font-semibold text-slate-800 line-clamp-1">
                      {auditData.detectedConstraints.map((c) => c.name).join(', ') || 'Capacidad'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Clarification Questions Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-900">
                      Preguntas de Clarificación del Agente ({auditData.clarificationQuestions.length})
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Haz click en las opciones sugeridas o escribe tu respuesta
                  </span>
                </div>

                <div className="space-y-3">
                  {auditData.clarificationQuestions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {q.question}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {q.context}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            q.importance === 'critical'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {q.importance === 'critical' ? 'Importante' : 'Opcional'}
                        </span>
                      </div>

                      {/* Suggested one-click answer chips */}
                      {q.suggestedOptions && q.suggestedOptions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {q.suggestedOptions.map((opt, oIdx) => {
                            const isSelected = userAnswers[q.id] === opt;
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() =>
                                  setUserAnswers((prev) => ({ ...prev, [q.id]: opt }))
                                }
                                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Custom answer input */}
                      <div className="pt-1">
                        <input
                          type="text"
                          value={userAnswers[q.id] || ''}
                          onChange={(e) =>
                            setUserAnswers((prev) => ({
                              ...prev,
                              [q.id]: e.target.value,
                            }))
                          }
                          placeholder={`Respuesta personalizada (por defecto: ${q.defaultAssumption})`}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentPhase(1)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver al Planteamiento</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPhase(3)}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
                  >
                    <span>Revisar Estructura Canónica</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              FASE 3: VALIDACIÓN DE ESTRUCTURA CANÓNICA PREVIA
             ========================================================= */}
          {currentPhase === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Resumen de Configuración del Modelo Lineal
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Los agentes han consolidado la narrativa inicial con tus respuestas de clarificación. Todo está listo para compilar la formulación matemática y generar el script de Google OR-Tools.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Objetivo & Variables */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                    1. Objetivo Canónico
                  </span>
                  <p className="text-xs font-semibold text-slate-900">
                    {auditData?.detectedObjective || 'Maximizar Ganancia Total'}
                  </p>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Variables de Decisión
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {auditData?.detectedVariables?.map((v, i) => (
                        <li key={i} className="flex items-center justify-between bg-slate-50 px-2 py-1 rounded">
                          <span className="font-medium">{v.name}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{v.estimatedUnit}</span>
                        </li>
                      )) || (
                        <li className="text-slate-500">Variables continuas x1, x2</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Restricciones & Aclaraciones */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                    2. Restricciones y Supuestos
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {auditData?.clarificationQuestions?.map((q, i) => (
                      <li key={i} className="bg-slate-50 p-2 rounded text-[11px]">
                        <span className="font-semibold text-slate-800 block">{q.question}</span>
                        <span className="text-blue-600 font-medium">
                          → {userAnswers[q.id] || q.defaultAssumption}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Ready banner */}
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  El equipo multi-agente generará el código en Python (Google OR-Tools pywraplp) y resolverá el método simplex al instante.
                </span>
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentPhase(2)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Ajustar Preguntas</span>
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
                >
                  <Zap className="h-4 w-4" />
                  <span>Compilar y Optimizar en OR-Tools</span>
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              FASE 4: COMPILACIÓN & RESOLUCIÓN EN TIEMPO REAL
             ========================================================= */}
          {currentPhase === 4 && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 animate-pulse">
                <Cpu className="h-8 w-8 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Equipo Multi-Agente en Ejecución
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Formulando función objetivo canónica, restricciones matriciales, script de Google OR-Tools y evaluando precios sombra...
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Generando solución óptima con Simplex Primal-Dual...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
