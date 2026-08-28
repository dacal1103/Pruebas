import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MessageSquare,
  Send,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Lightbulb,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { LPModel, OptimizationResult } from '../../types';

interface DecisionAdvisorViewProps {
  model: LPModel;
  solution: OptimizationResult;
  onRefineModel: (instruction: string) => Promise<void>;
  isRefining: boolean;
}

export const DecisionAdvisorView: React.FC<DecisionAdvisorViewProps> = ({
  model,
  solution,
  onRefineModel,
  isRefining,
}) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent'; text: string; time: string }>>([
    {
      role: 'agent',
      text: `¡Hola! Soy Sofia, tu asesora de operaciones. He preparado este diagnóstico en lenguaje claro y hablado sobre tu caso '${model.problemTitle}'. Puedes preguntarme lo que gustes sobre cómo organizar a tu equipo, reducir costos o aprovechar la capacidad libre de tus máquinas.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickQuestions = [
    '¿En qué máquina o área es más rentable invertir horas extra?',
    '¿Cuánta capacidad libre tenemos y cómo podemos aprovecharla?',
    '¿Qué pasa si ampliamos la capacidad de la máquina principal en un 20%?',
  ];

  // Speech Narration of the Executive Summary and Recommendations
  const toggleSpeechNarration = () => {
    if (!('speechSynthesis' in window)) {
      alert('Tu navegador no soporta síntesis de voz.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();

    const fullSpokenText = `Resumen Estratégico para tu empresa. ${solution.executiveSummary}. Recomendaciones clave: ${solution.managerialRecommendations.join('. ')}`;

    const cleanText = fullSpokenText
      .replace(/[*#_`>]/g, '')
      .replace(/•/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(
      (v) => v.lang.startsWith('es') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Paulina') || v.name.includes('Mónica') || v.name.includes('Helena'))
    ) || voices.find((v) => v.lang.startsWith('es'));

    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || userPrompt;
    if (!text.trim() || isRefining) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { role: 'user', text, time: timeNow }]);
    setUserPrompt('');

    try {
      await onRefineModel(text);
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          text: `¡Listo! Evalué tu consulta y ajusté la asignación óptima en tiempo real. Todos los resultados y holguras se han recalculado automáticamente para tu empresa.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          text: `Hubo una pequeña dificultad al procesar la solicitud: ${err.message || 'Error desconocido'}.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary Narrative */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Resumen Ejecutivo Hablado & Diagnóstico Estratégico
              </h2>
              <span className="text-xs text-blue-700 font-semibold">
                Explicación 100% amigable y empática generada con IA
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleSpeechNarration}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              isPlayingAudio
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 animate-pulse'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="h-4 w-4" />
                <span>Pausar Lectura con Voz</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" />
                <span>Escuchar Diagnóstico con Voz</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-white p-4 rounded-lg border border-blue-200 shadow-2xs">
          {solution.executiveSummary}
        </p>
      </div>

      {/* Strategic Managerial Recommendations */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <ShieldCheck className="h-5 w-5 text-purple-600" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Recomendaciones de Acción para la Dirección ({solution.managerialRecommendations.length})
          </h3>
        </div>

        <div className="space-y-3">
          {solution.managerialRecommendations.map((rec, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 hover:border-slate-300 hover:bg-white transition-all shadow-2xs"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 font-mono mt-0.5">
                {idx + 1}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {rec}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Business Decision Chat with Agents */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col h-[460px]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Consultor de Decisiones & Modificación Asistida
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Pregunta o solicita ajustes al modelo PL
          </span>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                    : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-none shadow-2xs'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
            </div>
          ))}
          {isRefining && (
            <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200 max-w-[70%]">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span>El Agente de Optimización está evaluando los cambios en el modelo...</span>
            </div>
          )}
        </div>

        {/* Quick Question Pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(q)}
              disabled={isRefining}
              className="text-[11px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
            >
              <Lightbulb className="h-3 w-3 text-amber-500" />
              <span>{q}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 pt-2 border-t border-slate-100"
        >
          <input
            type="text"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Ej: 'Añade una restricción de que las horas de ensamble aumentan a 150h' o '¿Qué pasa si compro más madera?'"
            disabled={isRefining}
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!userPrompt.trim() || isRefining}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isRefining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
