import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { SKILL_QUESTIONS } from '../../data/mockData';
import {
  Award,
  Sparkles,
  CheckCircle2,
  BrainCircuit,
  Briefcase,
  ArrowRight,
  RotateCcw,
  Zap,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  HelpCircle,
  Play,
  Square
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  speakText,
  stopSpeaking,
  defaultVoiceRecognizer,
  isSpeechSynthesisSupported,
  isSpeechRecognitionSupported,
  matchOptionFromVoice
} from '../../utils/voiceAssistant';

export const SkillsAssessmentSection: React.FC = () => {
  const { user, addValidatedSkills, setActiveTab } = useApp();
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [experienceText, setExperienceText] = useState('');
  const [loading, setLoading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [, setIsSaved] = useState(false);

  // Voice Interaction States
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [isSpeakingState, setIsSpeakingState] = useState(false);
  const [isListeningState, setIsListeningState] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [isDictatingExperience, setIsDictatingExperience] = useState(false);

  const autoAdvanceTimerRef = useRef<any>(null);

  const currentQ = SKILL_QUESTIONS[currentQuestionIdx];
  const allAnswered = SKILL_QUESTIONS.every(q => selectedAnswers[q.id] !== undefined);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      defaultVoiceRecognizer.stop();
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, []);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  // Read current question out loud
  const handleReadQuestion = (autoListenAfter: boolean = false) => {
    if (!currentQ) return;
    stopSpeaking();
    defaultVoiceRecognizer.stop();
    setIsListeningState(false);
    setIsSpeakingState(true);
    setVoiceFeedback('Leyendo pregunta en voz alta...');

    const optionsSpeech = currentQ.options
      .map((opt, i) => `Opción ${String.fromCharCode(65 + i)}: ${opt.label}.`)
      .join(' ');

    const fullPrompt = `Pregunta número ${currentQuestionIdx + 1} de ${SKILL_QUESTIONS.length}, área ${currentQ.category}. ${currentQ.question}. Las opciones son: ${optionsSpeech}. Para responder, puedes decir Opción A, Opción B, o contarme tu experiencia con tu propia voz.`;

    speakText(fullPrompt, {
      onStart: () => {
        setIsSpeakingState(true);
      },
      onEnd: () => {
        setIsSpeakingState(false);
        setVoiceFeedback(null);
        if (autoListenAfter) {
          handleStartListeningAnswer();
        }
      },
      onError: () => {
        setIsSpeakingState(false);
        setVoiceFeedback(null);
      }
    });
  };

  // Start speech recognition for answering current question
  const handleStartListeningAnswer = () => {
    stopSpeaking();
    setIsSpeakingState(false);
    setVoiceTranscript('');
    setVoiceFeedback('🎙️ Escuchando... Habla ahora (Ej: "Opción A", "La primera", o cuéntame tu oficio)');

    defaultVoiceRecognizer.start({
      onResult: (transcript, isFinal) => {
        setVoiceTranscript(transcript);

        if (transcript.trim().length > 0) {
          const matchedIdx = matchOptionFromVoice(transcript, currentQ.options);
          if (matchedIdx !== -1) {
            handleSelectOption(currentQ.id, matchedIdx);
            defaultVoiceRecognizer.stop();
            setIsListeningState(false);

            const optLetter = String.fromCharCode(65 + matchedIdx);
            const optLabel = currentQ.options[matchedIdx].label;
            const successMsg = `¡Entendido! Seleccionaste la Opción ${optLetter}: "${optLabel}".`;
            setVoiceFeedback(`✅ ${successMsg}`);

            speakText(`${successMsg} Pasemos a la siguiente pregunta.`, {
              onEnd: () => {
                if (currentQuestionIdx < SKILL_QUESTIONS.length - 1) {
                  setCurrentQuestionIdx(prev => prev + 1);
                  setVoiceTranscript('');
                  setVoiceFeedback(null);
                  if (voiceModeActive) {
                    setTimeout(() => {
                      // Read next question automatically if voice mode is on
                      // handleReadQuestion will be triggered by effect or next action
                    }, 500);
                  }
                } else {
                  setVoiceFeedback('¡Has completado todas las preguntas! Ahora puedes finalizar la evaluación.');
                  speakText('¡Has completado todas las preguntas vocales! Toca el botón verde para obtener tu perfil de habilidades.');
                }
              }
            });
          } else if (isFinal && transcript.trim().length > 10) {
            // User gave a descriptive answer: save to experienceText
            setExperienceText(prev => (prev ? `${prev}. ${transcript}` : transcript));
            setVoiceFeedback(`📝 Registramos tu respuesta en tu experiencia: "${transcript}"`);
          }
        }
      },
      onEnd: () => {
        setIsListeningState(false);
      },
      onError: (err) => {
        console.warn('Voice listener error:', err);
        setIsListeningState(false);
        setVoiceFeedback('No pudimos escuchar con claridad. Toca el micrófono para intentar de nuevo.');
      }
    });

    setIsListeningState(true);
  };

  const handleStopListening = () => {
    defaultVoiceRecognizer.stop();
    setIsListeningState(false);
    setVoiceFeedback(null);
  };

  const handleToggleVoiceMode = () => {
    if (!voiceModeActive) {
      setVoiceModeActive(true);
      speakText('Modo de voz activado. Te leeré cada pregunta y podrás responder hablando directamente con tu micrófono.', {
        onEnd: () => {
          handleReadQuestion(true);
        }
      });
    } else {
      setVoiceModeActive(false);
      stopSpeaking();
      defaultVoiceRecognizer.stop();
      setIsSpeakingState(false);
      setIsListeningState(false);
      setVoiceFeedback(null);
    }
  };

  // Voice dictation for experience summary
  const handleDictateExperience = () => {
    if (isDictatingExperience) {
      defaultVoiceRecognizer.stop();
      setIsDictatingExperience(false);
      setVoiceFeedback(null);
      return;
    }

    stopSpeaking();
    setIsSpeakingState(false);
    setIsDictatingExperience(true);
    setVoiceFeedback('🎙️ Dictando experiencia... Cuéntame qué trabajos has realizado o qué herramientas manejas');

    defaultVoiceRecognizer.start({
      onResult: (transcript) => {
        setExperienceText(transcript);
      },
      onEnd: () => {
        setIsDictatingExperience(false);
        setVoiceFeedback('Dictado finalizado.');
        setTimeout(() => setVoiceFeedback(null), 3000);
      },
      onError: () => {
        setIsDictatingExperience(false);
        setVoiceFeedback(null);
      }
    });
  };

  const handleRunAssessment = async () => {
    stopSpeaking();
    defaultVoiceRecognizer.stop();
    setLoading(true);

    try {
      const answersPayload = Object.entries(selectedAnswers).map(([qId, optIdx]) => {
        const q = SKILL_QUESTIONS.find(sq => sq.id === qId);
        const index = Number(optIdx);
        return {
          category: q?.category,
          question: q?.question,
          selected: q?.options[index]?.label,
          skillTag: q?.options[index]?.skillTag
        };
      });

      const res = await fetch('/api/ai/skills-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: user,
          workStatus: user.role,
          answers: answersPayload,
          interests: user.skills,
          experienceSummary: experienceText
        })
      });

      const data = await res.json();
      if (data && typeof data === 'object' && Array.isArray(data.topSkills) && data.topSkills.length > 0) {
        setAssessmentResult(data);
        addValidatedSkills(data.topSkills);
        setIsSaved(true);
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch (_) {}

        // Read results if voice mode was active
        if (voiceModeActive) {
          const skillsList = data.topSkills.join(', ');
          const topRole = data.recommendedRoles?.[0]?.title || 'Operaciones y Servicios';
          const spokenSummary = `¡Evaluación completada con éxito! Tus principales habilidades detectadas son: ${skillsList}. El cargo más recomendado para ti es: ${topRole}. ${data.vocationalProfile}`;
          setTimeout(() => {
            speakText(spokenSummary);
          }, 800);
        }
      } else {
        const fallback = {
          topSkills: ["Gestión Operativa", "Resolución de Problemas", "Comunicación Asertiva", "Adaptabilidad"],
          vocationalProfile: "Perfil dinámico con habilidades prácticas y técnicas orientadas a resultados.",
          recommendedRoles: [
            { title: "Coordinador Operativo / Logístico", matchScore: 92, category: "Operaciones" },
            { title: "Técnico Especialista en Mantenimiento y Servicios", matchScore: 88, category: "Técnico" }
          ],
          strengths: ["Capacidad analítica", "Trabajo colaborativo", "Iniciativa práctica"],
          improvementPlan: ["Certificar competencias SENA", "Postular a vacantes afines"],
          customEncouragement: "Tus habilidades tienen alta demanda en la región."
        };
        setAssessmentResult(fallback);
        addValidatedSkills(fallback.topSkills);
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Error in assessment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReadResultsOutLoud = () => {
    if (!assessmentResult) return;
    if (isSpeakingState) {
      stopSpeaking();
      setIsSpeakingState(false);
      return;
    }

    const skills = assessmentResult.topSkills?.join(', ') || '';
    const roles = assessmentResult.recommendedRoles?.map((r: any) => `${r.title} con un ${r.matchScore}% de compatibilidad`).join('. ') || '';
    const advice = assessmentResult.customEncouragement || assessmentResult.vocationalProfile || '';

    const textToSpeak = `Este es el resultado de tu validación laboral. Tus mayores habilidades comprobadas son: ${skills}. Los empleos recomendados para ti son: ${roles}. Consejo para tu crecimiento: ${advice}. Puedes postularte a estos empleos en la sección de Bolsa de Empleo usando también tu voz.`;

    speakText(textToSpeak, {
      onStart: () => setIsSpeakingState(true),
      onEnd: () => setIsSpeakingState(false),
      onError: () => setIsSpeakingState(false)
    });
  };

  const handleReset = () => {
    stopSpeaking();
    defaultVoiceRecognizer.stop();
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setAssessmentResult(null);
    setIsSaved(false);
    setVoiceTranscript('');
    setVoiceFeedback(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-emerald-800/40 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Herramienta Laboral & Validación Oficial
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
              Detector y Validador de Habilidades Laborales
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Descubre y certifica tus competencias laborales con ayuda de Inteligencia Artificial y metodologías del SENA. Diseñado con <strong>asistencia por voz</strong> para que cualquier persona pueda realizar su prueba hablando.
            </p>
          </div>

          {/* Voice Mode Main Switch */}
          <div className="flex flex-col gap-2 shrink-0">
            <button
              id="toggle-voice-assistant-mode-btn"
              onClick={handleToggleVoiceMode}
              className={`px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 transition shadow-md cursor-pointer ${
                voiceModeActive
                  ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/30 animate-pulse'
                  : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
              }`}
            >
              <Mic className="w-4 h-4 text-amber-950" />
              <span>{voiceModeActive ? '🎙️ Modo Voz Activado' : '🎙️ Activar Asistente por Voz'}</span>
            </button>
            <span className="text-[11px] text-slate-300 text-center">
              {voiceModeActive ? 'Escucha y responde hablando' : 'Ideal para quienes prefieren escuchar y hablar'}
            </span>
          </div>
        </div>

        {/* Current user validated skills chips */}
        {user.skills.length > 0 && (
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-emerald-200 font-semibold mr-1">Tus habilidades validadas:</span>
            {user.skills.map((sk, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 font-medium">
                ✓ {sk}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Voice Control Bar (Active when Voice Mode is ON or when interacting) */}
      <div className={`p-4 rounded-2xl border transition-all duration-300 ${
        voiceModeActive || isListeningState || isSpeakingState
          ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-sm'
          : 'bg-slate-50 border-slate-200 text-slate-700'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isListeningState
                ? 'bg-rose-500 text-white animate-bounce shadow-md'
                : isSpeakingState
                ? 'bg-emerald-600 text-white animate-pulse'
                : 'bg-slate-200 text-slate-700'
            }`}>
              {isListeningState ? (
                <Mic className="w-5 h-5" />
              ) : isSpeakingState ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <Radio className="w-5 h-5 text-slate-500" />
              )}
            </div>

            <div>
              <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                <span>Interacción por Voz para Pruebas Vocales</span>
                {isListeningState && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold animate-pulse">
                    EN VIVO - GRABANDO
                  </span>
                )}
                {isSpeakingState && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                    REPRODUCIENDO AUDIO
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600">
                {voiceFeedback || (voiceModeActive 
                  ? 'El asistente leerá cada pregunta y escuchará tu respuesta hablada.' 
                  : 'Toca los botones de altavoz o micrófono para escuchar o responder hablando.')}
              </p>
            </div>
          </div>

          {/* Quick Audio Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="read-current-question-btn"
              onClick={() => handleReadQuestion(voiceModeActive)}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {isSpeakingState ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeakingState ? 'Detener Audio' : '🔊 Escuchar Pregunta'}</span>
            </button>

            {isListeningState ? (
              <button
                id="stop-listening-btn"
                onClick={handleStopListening}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer animate-pulse"
              >
                <MicOff className="w-3.5 h-3.5" />
                <span>Detener Micrófono</span>
              </button>
            ) : (
              <button
                id="start-listening-btn"
                onClick={handleStartListeningAnswer}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 text-slate-950" />
                <span>🎙️ Responder Hablando</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Audio Transcript Box if listening or transcribed */}
        {(voiceTranscript || isListeningState) && (
          <div className="mt-3 p-3 rounded-xl bg-white border border-amber-200 text-xs flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="font-bold text-amber-900 shrink-0">Tu voz:</span>
              <span className="text-slate-800 italic truncate">
                {voiceTranscript || 'Esperando tu voz... Di "Opción A", "La primera", etc.'}
              </span>
            </div>
            {isListeningState && (
              <div className="flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-4 bg-amber-500 rounded-full animate-pulse" />
                <span className="w-1.5 h-6 bg-rose-500 rounded-full animate-pulse" />
                <span className="w-1.5 h-3 bg-amber-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Assessment Body */}
      {!assessmentResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Question Step Card (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    Pregunta {currentQuestionIdx + 1} de {SKILL_QUESTIONS.length} &bull; {currentQ.category}
                  </span>
                  <button
                    onClick={() => handleReadQuestion(false)}
                    title="Escuchar esta pregunta en voz alta"
                    className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2 font-display">
                  {currentQ.question}
                </h3>
              </div>
            </div>

            {/* Options list */}
            <div className="space-y-3">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentQ.id] === optIdx;
                const letter = String.fromCharCode(65 + optIdx);
                return (
                  <button
                    key={optIdx}
                    id={`opt-q${currentQ.id}-${optIdx}`}
                    onClick={() => {
                      handleSelectOption(currentQ.id, optIdx);
                      if (voiceModeActive) {
                        speakText(`Seleccionaste Opción ${letter}: ${opt.label}`);
                      }
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 text-slate-900 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full mt-0.5 flex items-center justify-center border text-xs shrink-0 font-bold ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-300 bg-slate-100 text-slate-600'
                        }`}
                      >
                        {letter}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-medium leading-relaxed">{opt.label}</p>
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded inline-block">
                          Competencia: {opt.skillTag}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(`Opción ${letter}: ${opt.label}`);
                      }}
                      title="Escuchar esta opción"
                      className="p-2 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 shrink-0"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </button>
                );
              })}
            </div>

            {/* Vocal Response Guide Banner */}
            <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>¿Cómo responder por voz?</strong> Di en voz alta <em>"Opción A"</em>, <em>"La segunda"</em> o cuéntale al micrófono cómo haces tú ese trabajo.
                </span>
              </div>
              <button
                onClick={handleStartListeningAnswer}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <Mic className="w-3 h-3" />
                <span>Hablar</span>
              </button>
            </div>

            {/* Question Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
              >
                &larr; Anterior
              </button>

              <div className="flex gap-1.5">
                {SKILL_QUESTIONS.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setCurrentQuestionIdx(dotIdx)}
                    className={`w-2.5 h-2.5 rounded-full transition ${
                      currentQuestionIdx === dotIdx
                        ? 'bg-emerald-600 w-6'
                        : selectedAnswers[SKILL_QUESTIONS[dotIdx].id] !== undefined
                        ? 'bg-emerald-300'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {currentQuestionIdx < SKILL_QUESTIONS.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                >
                  Siguiente &rarr;
                </button>
              ) : (
                <button
                  id="finish-questions-btn"
                  disabled={!allAnswered || loading}
                  onClick={handleRunAssessment}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Analizando competencias...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Finalizar y Detectar con IA</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Additional Experience & Context (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-emerald-600" />
                  Dictar Experiencia con tu Voz
                </h3>
                <button
                  type="button"
                  onClick={handleDictateExperience}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                    isDictatingExperience
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isDictatingExperience ? 'Detener' : '🎙️ Dictar'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Si no deseas escribir, toca <strong>"Dictar"</strong> y cuéntanos qué trabajos has hecho, herramientas que usas o tu oficio:
              </p>

              <textarea
                id="assessment-experience-input"
                rows={4}
                value={experienceText}
                onChange={(e) => setExperienceText(e.target.value)}
                placeholder="Ej: He trabajado 3 años en obras civiles de albañilería, sé de plomería y manejo de taladros..."
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-emerald-500"
              />

              <p className="text-[11px] text-slate-400">
                La Inteligencia Artificial tomará en cuenta tu testimonio verbal para perfilar tus habilidades.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <Zap className="w-4 h-4 text-amber-600" />
                Inclusión y Accesibilidad Regional
              </div>
              <p className="leading-relaxed text-[11px] text-amber-900">
                Esta herramienta fue diseñada especialmente para trabajadores y artesanos de Pereira, Quindío, Caldas, Cali y Chocó que deseen certificar sus saberes prácticos sin barreras de lectoescritura.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-8 shadow-sm animate-in fade-in">
          {/* Header of results */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Detección de Habilidades Completada Exitosamente
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                Perfil de Fortalezas de {user.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                {assessmentResult.vocationalProfile}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                id="listen-full-results-btn"
                onClick={handleReadResultsOutLoud}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isSpeakingState ? 'Detener Audio' : '🔊 Escuchar Mis Resultados'}</span>
              </button>

              <button
                id="assessment-reset-btn"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Repetir Test</span>
              </button>

              <button
                id="assessment-go-jobs-btn"
                onClick={() => setActiveTab('empleo')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Ver Empleos Compatibles</span>
              </button>
            </div>
          </div>

          {/* Top Skills Detected */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                Tus Principales Habilidades Detectadas ("En qué eres bueno")
              </h3>
              <button
                onClick={() => {
                  const txt = `Tus habilidades son: ${assessmentResult.topSkills?.join(', ')}`;
                  speakText(txt);
                }}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" /> Escuchar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {assessmentResult.topSkills?.map((skill: string, sIdx: number) => (
                <div
                  key={sIdx}
                  className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex items-center gap-2.5"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {sIdx + 1}
                  </div>
                  <span className="font-bold text-xs">{skill}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Roles Matching */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              Cargos y Roles Recomendados según tu Perfil
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {assessmentResult.recommendedRoles?.map((role: any, rIdx: number) => (
                <div
                  key={rIdx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">{role.category}</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {role.matchScore}% Match
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{role.title}</div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => {
                        speakText(`Cargo recomendado: ${role.title}, con un ${role.matchScore}% de compatibilidad para el área de ${role.category}`);
                      }}
                      className="text-[11px] font-bold text-slate-500 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" /> Escuchar
                    </button>
                    <button
                      onClick={() => setActiveTab('empleo')}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <span>Buscar vacantes</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Improvement Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-emerald-800">
                ✨ Fortalezas Clave
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {assessmentResult.strengths?.map((st: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-indigo-800">
                🚀 Ruta de Crecimiento & Mejora
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {assessmentResult.improvementPlan?.map((plan: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span>{plan}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action banner */}
          <div className="p-4 rounded-xl bg-emerald-950 text-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <p className="font-bold text-white text-sm">¿Deseas certificar estas habilidades con cursos virtuales?</p>
              <p className="text-emerald-200/80">Accede a módulos en Construcción, Electricidad y Tecnología con certificación SENA/CCP.</p>
            </div>
            <button
              onClick={() => setActiveTab('capacitacion')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl whitespace-nowrap cursor-pointer"
            >
              Ir a Capacitaciones Gratuitas
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
