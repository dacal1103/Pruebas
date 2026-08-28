import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Cpu,
  Layers,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Zap,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Check,
  BarChart2,
  ChevronRight,
  Database,
  Building2,
  ShieldCheck,
  Volume2,
  VolumeX,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { ChatMessage, ExtractionState, PresetBusinessProblem } from '../../types';
import { PRESET_PROBLEMS } from '../../data/presets';
import { generateLocalConversationalReply } from '../../utils/localAssistant';

interface InitialChatScreenProps {
  onFormulateAndSolve: (
    fullNarrative: string,
    clarifications?: Array<{ question: string; answer: string }>
  ) => Promise<void>;
  onSelectPreset: (preset: PresetBusinessProblem) => void;
  onOpenExistingDashboard?: () => void;
  onOpenVectorDb?: () => void;
  hasActiveModel?: boolean;
  isFormulating: boolean;
}

export const InitialChatScreen: React.FC<InitialChatScreenProps> = ({
  onFormulateAndSolve,
  onSelectPreset,
  onOpenExistingDashboard,
  onOpenVectorDb,
  hasActiveModel = false,
  isFormulating,
}) => {
  const initialGreeting: ChatMessage = {
    id: 'msg_1',
    role: 'assistant',
    content:
      '¡Hola! Qué gusto saludarte. Soy Sofia, tu asesora de operaciones y rentabilidad de planta.\n\nEstoy aquí para ayudarte a encontrar la mejor manera de organizar tus máquinas, recursos y pedidos para que tu empresa gaste lo mínimo y gane lo máximo posible, sin complicaciones técnicas.\n\nCuéntame sobre tu fábrica o negocio con tus propias palabras: ¿cuántas máquinas o productos tienes, cuánto te cuesta fabricar cada uno y cuántos pedidos necesitas entregar?',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    quickSuggestions: [
      'Tengo 3 máquinas de helado (costos 2, 5, 3; límites 20, 50, 30; demanda 70)',
      'Optimizar producción de muebles con horas de carpintería y acabado',
      'Minimizar el costo de una mezcla de ingredientes para concentrados',
    ],
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [inputText, setInputText] = useState('');
  const [isLoadingReply, setIsLoadingReply] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [companyName, setCompanyName] = useState<string>('Industrias Manufacturas Andinas S.A.');
  const [vectorCount, setVectorCount] = useState<number>(12);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  // Audio Speech Synthesis Player
  const togglePlayAudio = (messageId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Tu navegador no soporta reproducción de voz.');
      return;
    }

    if (playingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setPlayingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown and formatting symbols for natural spoken flow
    const cleanText = text
      .replace(/[*#_`>]/g, '')
      .replace(/•/g, '')
      .replace(/[-]{2,}/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Try finding a natural Spanish voice
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(
      (v) => v.lang.startsWith('es') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Paulina') || v.name.includes('Mónica') || v.name.includes('Helena'))
    ) || voices.find((v) => v.lang.startsWith('es'));

    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    utterance.onend = () => {
      setPlayingMessageId(null);
    };

    utterance.onerror = () => {
      setPlayingMessageId(null);
    };

    setPlayingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  // Cleanup speech when component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Fetch company profile & vector stats for header
  useEffect(() => {
    fetch('/api/vector-db/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.profile) {
          if (data.profile.companyName) setCompanyName(data.profile.companyName);
          if (data.stats && typeof data.stats.totalVectors === 'number') {
            setVectorCount(data.stats.totalVectors);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Live Accumulated Extraction State
  const [extraction, setExtraction] = useState<ExtractionState>({
    completenessScore: 0,
    detectedObjective: 'Por definir (ej. Minimizar costos o Maximizar utilidades)',
    detectedVariables: [],
    detectedConstraints: [],
    missingInfoPoints: [
      'Decisiones a tomar (qué máquinas usar o cuántas unidades producir)',
      'Costos o precios por unidad de cada producto',
      'Límites de capacidad o demanda total a satisfacer',
    ],
    quickSuggestions: [],
    isReadyToFormulate: false,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoadingReply]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Send message and get structured AI response
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoadingReply || isFormulating) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsLoadingReply(true);

    try {
      // Build API payload from conversation history
      const payloadMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      let data: any = null;
      try {
        const res = await fetch('/api/optimize/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: payloadMessages }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          data = await res.json();
        }
      } catch (networkErr) {
        clearTimeout(timeoutId);
        console.warn('Network fetch issue, engaging conversational fallback:', networkErr);
      }

      if (data && data.success && data.assistantMessage) {
        const assistantMsg: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: data.assistantMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickSuggestions: data.quickSuggestions || [],
          retrievedVectors: data.retrievedVectors || [],
          savedVectorFacts: data.savedVectorFacts || [],
        };

        if (data.stats && typeof data.stats.totalVectors === 'number') {
          setVectorCount(data.stats.totalVectors);
        }

        setMessages((prev) => [...prev, assistantMsg]);

        // Update extraction state
        setExtraction({
          completenessScore: data.completenessScore ?? 90,
          detectedObjective: data.detectedObjective || 'Maximizar beneficio o Minimizar costo',
          detectedVariables: data.detectedVariables || [],
          detectedConstraints: data.detectedConstraints || [],
          missingInfoPoints: data.missingInfoPoints || [],
          quickSuggestions: data.quickSuggestions || [],
          isReadyToFormulate: data.isReadyToFormulate ?? true,
        });
      } else {
        // Deterministic intelligent local assistant fallback
        const fallback = generateLocalConversationalReply(text);
        const assistantMsg: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: fallback.assistantMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickSuggestions: fallback.quickSuggestions || [],
          retrievedVectors: [],
          savedVectorFacts: (data && data.savedVectorFacts) || [],
        };

        if (data && data.stats && typeof data.stats.totalVectors === 'number') {
          setVectorCount(data.stats.totalVectors);
        }

        setMessages((prev) => [...prev, assistantMsg]);

        setExtraction({
          completenessScore: fallback.completenessScore,
          detectedObjective: fallback.detectedObjective,
          detectedVariables: fallback.detectedVariables,
          detectedConstraints: fallback.detectedConstraints,
          missingInfoPoints: fallback.missingInfoPoints,
          quickSuggestions: fallback.quickSuggestions,
          isReadyToFormulate: fallback.isReadyToFormulate,
        });
      }
    } catch (err: any) {
      console.warn('Chat interaction handled gracefully:', err);
      const fallback = generateLocalConversationalReply(text);
      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: fallback.assistantMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickSuggestions: fallback.quickSuggestions || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setExtraction(fallback);
    } finally {
      setIsLoadingReply(false);
    }
  };

  // Trigger building and solving the LP Model
  const handleLaunchSolution = async () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    const fullConversationText = messages
      .map((m) => `${m.role === 'user' ? 'USUARIO' : 'AGENTE'}: ${m.content}`)
      .join('\n\n');

    await onFormulateAndSolve(fullConversationText);
  };

  // Reset conversation
  const handleResetChat = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setPlayingMessageId(null);
    setMessages([initialGreeting]);
    setExtraction({
      completenessScore: 0,
      detectedObjective: 'Por definir (ej. Minimizar costos o Maximizar utilidades)',
      detectedVariables: [],
      detectedConstraints: [],
      missingInfoPoints: [
        'Decisiones a tomar (qué máquinas usar o cuántas unidades producir)',
        'Costos o precios por unidad de cada producto',
        'Límites de capacidad o demanda total a satisfacer',
      ],
      quickSuggestions: [],
      isReadyToFormulate: false,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col">
      {/* Top Bar Navigation */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900">
                  Asesor de Optimización & Simplex con IA
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                  <Sparkles className="h-2.5 w-2.5" />
                  Voz & Análisis Empático
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Explicaciones 100% habladas en lenguaje natural · Sin fórmulas matemáticas complicadas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Vector DB Trigger Button */}
            <button
              onClick={onOpenVectorDb}
              title="Abrir Base de Datos Vectorial de la Empresa"
              className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 transition-all shadow-2xs cursor-pointer"
            >
              <Database className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden md:inline">Base de Datos Vectorial</span>
              <span className="rounded-full bg-emerald-200/80 px-1.5 py-0.2 text-[10px] font-mono font-bold text-emerald-900">
                {vectorCount}
              </span>
            </button>

            <button
              onClick={() => setShowPresetsModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <BookOpen className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Casos de Ejemplo</span>
              <span className="sm:hidden">Casos</span>
            </button>

            {hasActiveModel && onOpenExistingDashboard && (
              <button
                onClick={onOpenExistingDashboard}
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
              >
                <BarChart2 className="h-3.5 w-3.5" />
                <span>Ver Dashboard Actual</span>
              </button>
            )}

            <button
              onClick={handleResetChat}
              title="Reiniciar conversación"
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Enterprise Data Context Ribbon */}
        <div className="bg-slate-50 border-t border-slate-200/80 px-4 sm:px-6 py-1.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2 overflow-hidden">
              <Building2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span className="text-3xs sm:text-xs font-medium text-slate-500">Empresa Conectada:</span>
              <strong className="text-slate-800 font-semibold truncate text-xs">
                {companyName}
              </strong>
              <span className="hidden sm:inline-flex items-center gap-1 text-3xs rounded-md bg-slate-200/80 px-2 py-0.5 font-mono text-slate-700">
                <Database className="h-2.5 w-2.5 text-emerald-600" />
                {vectorCount} vectores indexados (768-D)
              </span>
            </div>

            <button
              onClick={onOpenVectorDb}
              className="text-3xs sm:text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Editar Datos de Empresa</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Layout: Chat Canvas (Left/Center) + Live Extraction Panel (Right) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Center: Chat Interface (7 or 8 columns on large screens) */}
        <main className="lg:col-span-8 flex flex-col h-[calc(100vh-165px)] rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Chat Stream Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800">
                Canal de Diálogo con el Agente de Modelado
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {messages.length} {messages.length === 1 ? 'mensaje' : 'mensajes'}
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Retrieved Vector Facts Badge if any */}
                {msg.role === 'assistant' && msg.retrievedVectors && msg.retrievedVectors.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-1.5 px-1 text-3xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg py-1 px-2.5 max-w-[85%]">
                    <Database className="h-3 w-3 text-emerald-600 shrink-0" />
                    <span>Conocimiento Vectorial Recuperado:</span>
                    <div className="flex flex-wrap gap-1">
                      {msg.retrievedVectors.map((v, vIdx) => (
                        <span
                          key={vIdx}
                          className="bg-white border border-emerald-200 rounded px-1.5 py-0.2 text-3xs text-emerald-900 font-medium"
                        >
                          {v.title} {v.similarity ? `(${Math.round(v.similarity * 100)}%)` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`relative max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-line font-normal">{msg.content}</p>

                  {/* Saved Vector Facts Ingestion Badge */}
                  {msg.role === 'assistant' && msg.savedVectorFacts && msg.savedVectorFacts.length > 0 && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-left">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                          <Database className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>
                            {msg.savedVectorFacts.length === 1
                              ? 'Dato clave guardado en la Base Vectorial (768-D)'
                              : `${msg.savedVectorFacts.length} datos clave guardados en la Base Vectorial (768-D)`}
                          </span>
                        </div>
                        {onOpenVectorDb && (
                          <button
                            type="button"
                            onClick={onOpenVectorDb}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-950 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <span>Ver en Base</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {msg.savedVectorFacts.map((fact, fIdx) => (
                          <div
                            key={fact.id || fIdx}
                            className="text-[11px] text-slate-800 bg-white/90 rounded-lg p-2 border border-emerald-200/80 shadow-2xs flex items-start gap-2"
                          >
                            <span className="shrink-0 mt-0.5 inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-emerald-100 text-emerald-700">
                              <Check className="h-2.5 w-2.5" />
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5">
                                <strong className="font-bold text-emerald-950">{fact.title}</strong>
                                <span className="text-3xs uppercase font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                                  {fact.category}
                                </span>
                              </div>
                              <p className="text-slate-600 text-3xs mt-0.5">{fact.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Audio Speech Player Button for Assistant Messages */}
                  {msg.role === 'assistant' && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => togglePlayAudio(msg.id, msg.content)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
                          playingMessageId === msg.id
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 animate-pulse'
                            : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80'
                        }`}
                      >
                        {playingMessageId === msg.id ? (
                          <>
                            <VolumeX className="h-3.5 w-3.5" />
                            <span>Pausar Voz</span>
                            <span className="flex gap-0.5 ml-1">
                              <span className="h-2 w-0.5 bg-white animate-bounce" />
                              <span className="h-3 w-0.5 bg-white animate-bounce delay-75" />
                              <span className="h-2 w-0.5 bg-white animate-bounce delay-150" />
                            </span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3.5 w-3.5 text-blue-600" />
                            <span>Escuchar Explicación Hablada</span>
                          </>
                        )}
                      </button>

                      <span className="text-[10px] text-slate-400 font-medium">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                )}

                {/* Interactive Quick Suggestions under assistant messages */}
                {msg.role === 'assistant' && msg.quickSuggestions && msg.quickSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                    {msg.quickSuggestions.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendMessage(suggestion)}
                        disabled={isLoadingReply || isFormulating}
                        className="text-[11px] bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer group disabled:opacity-50"
                      >
                        <Lightbulb className="h-3 w-3 text-amber-500 group-hover:text-blue-600" />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Thinking / Agent Processing Bubble */}
            {isLoadingReply && (
              <div className="flex flex-col items-start">
                <div className="rounded-2xl rounded-bl-none bg-blue-50 border border-blue-200 p-3.5 text-xs text-blue-800 flex items-center gap-2 shadow-2xs">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span>El Agente de Modelado está analizando tu negocio y extrayendo variables...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-3 sm:p-4 border-t border-slate-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe aquí tu problema (ej. 'Fabricamos 2 productos A y B con 100h de máquina y 150h de personal...')"
                disabled={isLoadingReply || isFormulating}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors shadow-2xs"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoadingReply || isFormulating}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
              >
                {isLoadingReply ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
              <span>Presiona Enter para enviar al agente</span>
              <span>Gemini 3.7 Flash + Google OR-Tools</span>
            </div>
          </div>
        </main>

        {/* Right Sidebar: Live Extraction Progress & Quick Launch (4 columns) */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Card: Live Extraction State */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Extracción en Tiempo Real
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Estructura detectada por el agente
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-700 font-mono">
                {extraction.completenessScore}%
              </span>
            </div>

            {/* Completeness Bar */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                <span>Completitud de Requerimientos</span>
                <span>{extraction.completenessScore >= 70 ? 'Listo para Compilar' : 'En Captura'}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    extraction.completenessScore >= 70
                      ? 'bg-emerald-600'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.max(5, extraction.completenessScore)}%` }}
                />
              </div>
            </div>

            {/* Objective */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                🎯 Objetivo Identificado
              </span>
              <p className="text-xs font-semibold text-slate-800">
                {extraction.detectedObjective}
              </p>
            </div>

            {/* Variables */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                📦 Variables de Decisión ({extraction.detectedVariables.length})
              </span>
              {extraction.detectedVariables.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {extraction.detectedVariables.map((v, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200/70 text-[11px] shadow-2xs"
                    >
                      <span className="font-semibold text-slate-800">{v.name}</span>
                      {v.coefficientEstimate && (
                        <span className="text-blue-600 font-mono font-medium">
                          {v.coefficientEstimate}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-slate-400 italic">
                  Escribe sobre tus productos o decisiones para que el agente los detecte...
                </p>
              )}
            </div>

            {/* Constraints */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                ⚖️ Restricciones Detectadas ({extraction.detectedConstraints.length})
              </span>
              {extraction.detectedConstraints.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {extraction.detectedConstraints.map((c, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200/70 text-[11px] shadow-2xs"
                    >
                      <span className="font-semibold text-slate-800">{c.name}</span>
                      {c.limit && (
                        <span className="text-slate-500 font-mono">{c.limit}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-slate-400 italic">
                  Menciona tus límites de horas, materia prima o presupuesto...
                </p>
              )}
            </div>

            {/* Missing Info / Advice */}
            {extraction.missingInfoPoints.length > 0 && extraction.completenessScore < 85 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 space-y-1.5">
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                  <span>Sugerencias para mayor precisión:</span>
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-amber-800">
                  {extraction.missingInfoPoints.slice(0, 3).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Enterprise Vector Database Grounding Card */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <Database className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Base Vectorial de la Empresa</span>
                </div>
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-3xs font-mono font-bold text-emerald-800">
                  {vectorCount} vectores
                </span>
              </div>
              <p className="text-3xs text-emerald-800 leading-relaxed">
                El agente recupera automáticamente recursos de planta, márgenes y políticas corporativas usando búsqueda semántica (RAG).
              </p>
              <button
                type="button"
                onClick={onOpenVectorDb}
                className="w-full flex items-center justify-center gap-1 rounded-lg bg-white border border-emerald-200 py-1.5 text-3xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
              >
                <span>Administrar Base Vectorial</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {/* Action Button: Formulate and Solve */}
            <div className="pt-2">
              <button
                id="btn-launch-solve"
                onClick={handleLaunchSolution}
                disabled={isFormulating || messages.length < 2}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold transition-all shadow-sm cursor-pointer ${
                  extraction.completenessScore >= 60 || messages.length >= 2
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
              >
                {isFormulating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Optimizando en Google OR-Tools...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Construir y Resolver Modelo</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-2">
                Generará la formulación canónica, método gráfico 2D y script en Python.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Preset Problems Modal (for quick starter cases) */}
      {showPresetsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Casos de Estudio Preconfigurados
                </h3>
              </div>
              <button
                onClick={() => setShowPresetsModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {PRESET_PROBLEMS.map((preset) => (
                <div
                  key={preset.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2 hover:border-blue-400 hover:bg-white transition-all shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{preset.title}</span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium border border-blue-200">
                        {preset.industry}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {preset.shortDescription}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onSelectPreset(preset);
                      setShowPresetsModal(false);
                    }}
                    className="w-full flex items-center justify-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 transition-colors cursor-pointer shadow-2xs mt-2"
                  >
                    <span>Cargar este Caso</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
