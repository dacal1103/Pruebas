import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HeartHandshake,
  MessageSquare,
  Sparkles,
  Send,
  Calendar,
  PhoneCall,
  Wind,
  Smile,
  Frown,
  Meh,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Lock,
  UserCheck
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  suggestedExercise?: {
    title: string;
    steps: string[];
  };
  actionableTip?: string;
  time: string;
}

const PSYCHOLOGISTS = [
  {
    id: 'psy-1',
    name: 'Dra. Valentina Henao Osorio',
    specialty: 'Psicología Clínica & Bienestar Laboral',
    experience: '8 años de experiencia',
    institution: 'Red de Salud Mental Risaralda',
    location: 'Pereira (Tele-orientación disponible)',
    availability: 'Hoy disponible 3:00 PM y 5:30 PM',
    verified: true,
    rating: 4.98
  },
  {
    id: 'psy-2',
    name: 'Dr. Jhon Jairo Palacios Mosquera',
    specialty: 'Orientación Vocacional & Manejo del Estrés',
    experience: '11 años de experiencia',
    institution: 'Alianza Bienestar Chocó',
    location: 'Quibdó / Teleconsulta Nacional',
    availability: 'Mañana disponible 9:00 AM y 2:00 PM',
    verified: true,
    rating: 4.95
  },
  {
    id: 'psy-3',
    name: 'Dra. Mariana Gómez Londoño',
    specialty: 'Psicología Ocupacional & Resiliencia Emprendedora',
    experience: '6 años de experiencia',
    institution: 'Colectivo Confianza & Vida',
    location: 'Eje Cafetero / Teleconsulta',
    availability: 'Jueves disponible 10:30 AM',
    verified: true,
    rating: 4.92
  }
];

export const PsychologicalSupportSection: React.FC = () => {
  const { user } = useApp();
  const [selectedMood, setSelectedMood] = useState<string>('Esperanzado pero con incertidumbre');
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [scheduledAppointment, setScheduledAppointment] = useState<string | null>(null);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhala' | 'Sostén' | 'Exhala'>('Inhala');
  const [breathingSeconds, setBreathingSeconds] = useState(4);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hola ${user.name.split(' ')[0]}, bienvenido(a) a este espacio seguro y confidencial. Sabemos que el trabajo, la búsqueda de empleo o la gestión de un negocio traen momentos de sobrecarga o incertidumbre. Aquí puedes desahogarte con calma, explorar ejercicios de respiración o agendar una cita con nuestros psicólogos aliados. ¿Cómo te sientes el día de hoy?`,
      time: 'Justo ahora',
      suggestedExercise: {
        title: 'Pausa Consciente de 2 Minutos',
        steps: [
          'Siéntate cómodamente con la espalda recta y pies apoyados en el suelo.',
          'Lleva tu atención al aire que entra suave por tu nariz.',
          'Suelta la tensión en hombros y mandíbula con cada exhalación.'
        ]
      }
    }
  ]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: userText, time: timeNow }
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/psychological-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          userMood: selectedMood,
          situation: `Usuario con rol ${user.role} en ${user.city}`
        })
      });

      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || 'Estoy contigo para acompañarte paso a paso.',
          suggestedExercise: data.suggestedExercise,
          actionableTip: data.actionableTip,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Respira profundo. Recuerda que no estás solo(a) en este camino. Tómate una pausa de 5 minutos, toma agua y recuerda que tus talentos tienen un valor inmenso.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startBreathingGuide = () => {
    setBreathingActive(true);
    let phase: 'Inhala' | 'Sostén' | 'Exhala' = 'Inhala';
    let count = 4;

    const interval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        if (phase === 'Inhala') {
          phase = 'Sostén';
          count = 4;
        } else if (phase === 'Sostén') {
          phase = 'Exhala';
          count = 4;
        } else {
          phase = 'Inhala';
          count = 4;
        }
        setBreathingPhase(phase);
      }
      setBreathingSeconds(count);
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
      setBreathingActive(false);
    }, 36000); // 3 full cycles
  };

  const handleBookAppointment = (psychologistName: string) => {
    setScheduledAppointment(psychologistName);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-rose-800/30 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-semibold">
              <HeartHandshake className="w-3.5 h-3.5" />
              Apoyo Emocional & Salud Mental Comunitaria
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
              Orientación Psicológica Virtual & Bienestar
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Un entorno seguro respaldado por entidades de salud de Risaralda y Chocó. Brindamos acompañamiento en manejo del estrés, ansiedad por búsqueda de empleo, presión financiera y equilibrio de vida.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-xs space-y-1.5 shrink-0 self-start sm:self-auto">
            <div className="flex items-center gap-2 font-bold text-rose-300">
              <Lock className="w-4 h-4" /> 100% Confidencial y Gratuito
            </div>
            <p className="text-slate-300 text-[11px]">Protegido por secreto profesional y normas éticas de salud.</p>
          </div>
        </div>

        {/* Mood selector pills */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-300 font-semibold mr-1">¿Cómo te sientes hoy?</span>
          {[
            { label: 'Ansioso(a) o con estrés', icon: '😟' },
            { label: 'Esperanzado(a) pero con dudas', icon: '🌱' },
            { label: 'Agobiado(a) por finanzas', icon: '📉' },
            { label: 'Cansado(a) o sin motivación', icon: '🔋' },
            { label: 'Motivado(a) y listo(a)', icon: '✨' }
          ].map((m) => (
            <button
              key={m.label}
              onClick={() => setSelectedMood(m.label)}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition cursor-pointer text-xs ${
                selectedMood === m.label
                  ? 'bg-rose-500 text-white font-bold shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Chat & Wellbeing Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Virtual Empathy Chat (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 flex flex-col h-[620px] shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  Orientador Virtual de Bienestar
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <p className="text-[11px] text-slate-500">Escucha activa empática &bull; Técnicas de regulación emocional</p>
              </div>
            </div>
            <span className="text-[11px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-semibold border border-rose-200">
              {selectedMood.split(' ')[0]}
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-xs'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/80'
                  }`}
                >
                  <p className="whitespace-pre-line text-xs">{msg.content}</p>

                  {/* If assistant included an exercise */}
                  {msg.suggestedExercise && (
                    <div className="mt-3 p-3 bg-white/90 text-slate-800 rounded-xl border border-slate-200/90 shadow-xs">
                      <div className="font-bold text-rose-700 flex items-center gap-1.5 mb-1.5">
                        <Wind className="w-4 h-4 text-rose-600" />
                        {msg.suggestedExercise.title}
                      </div>
                      <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-600">
                        {msg.suggestedExercise.steps.map((st, sIdx) => (
                          <li key={sIdx}>{st}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {msg.actionableTip && (
                    <div className="mt-2 text-[11px] font-semibold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200/60">
                      💡 Tip del día: {msg.actionableTip}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
                <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                <span>Generando orientación comprensiva...</span>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              'Tengo mucha ansiedad por una entrevista',
              'Siento sobrecarga con las deudas de mi negocio',
              '¿Cómo mantengo la calma ante el desempleo?',
              'Necesito un ejercicio rápido de relajación'
            ].map((quick, qIdx) => (
              <button
                key={qIdx}
                onClick={() => {
                  setInputMessage(quick);
                }}
                className="whitespace-nowrap text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 transition cursor-pointer"
              >
                {quick}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex items-center gap-2">
            <input
              id="psych-chat-input"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Escribe lo que sientes o lo que te preocupa con total tranquilidad..."
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-rose-500 focus:bg-white transition"
            />
            <button
              id="psych-chat-send-btn"
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="p-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl transition shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Column: Tele-orientation directory & Breathing Tool (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Guided Breathing Widget */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-900 to-emerald-950 text-white shadow-md border border-teal-800/40">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Wind className="w-4 h-4 text-teal-300" />
                Técnica de Regulación Emocional 4-4-4
              </h3>
              {breathingActive && (
                <span className="text-[10px] bg-teal-500/30 text-teal-200 px-2 py-0.5 rounded-full animate-pulse">
                  En curso
                </span>
              )}
            </div>

            <p className="text-xs text-teal-100/80 mb-4 leading-relaxed">
              Disminuye el ritmo cardíaco y la tensión muscular activando el sistema nervioso parasimpático en menos de un minuto.
            </p>

            {breathingActive ? (
              <div className="flex flex-col items-center justify-center p-6 bg-white/10 rounded-xl backdrop-blur-xs border border-white/10 space-y-2">
                <div className="text-xs font-semibold text-teal-300 uppercase tracking-widest">
                  Fase: {breathingPhase}
                </div>
                <div className="text-4xl font-extrabold text-white font-display">
                  {breathingSeconds}s
                </div>
                <div className="text-[11px] text-teal-200">
                  {breathingPhase === 'Inhala' && 'Toma aire despacio por la nariz...'}
                  {breathingPhase === 'Sostén' && 'Mantén el aire y relaja los hombros...'}
                  {breathingPhase === 'Exhala' && 'Suelta todo el aire por la boca...'}
                </div>
              </div>
            ) : (
              <button
                id="start-breathing-btn"
                onClick={startBreathingGuide}
                className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <Wind className="w-4 h-4" />
                <span>Iniciar Ejercicio Guiado (1 min)</span>
              </button>
            )}
          </div>

          {/* Directory of Certified Psychologists */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Psicólogos Aliados para Tele-orientación
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                Convenio Salud
              </span>
            </div>

            {scheduledAppointment && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold">¡Solicitud de cita confirmada con {scheduledAppointment}!</span>
                  <p className="text-[11px] text-emerald-700">Te llegará el enlace seguro de teleconsulta a tu WhatsApp o correo.</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {PSYCHOLOGISTS.map((psy) => (
                <div
                  key={psy.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-300 transition text-xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{psy.name}</div>
                      <div className="text-emerald-700 font-medium text-[11px]">{psy.specialty}</div>
                    </div>
                    <span className="text-[11px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                      ★ {psy.rating}
                    </span>
                  </div>

                  <div className="text-slate-500 text-[11px] space-y-0.5">
                    <div>🏛️ {psy.institution} &bull; {psy.experience}</div>
                    <div className="text-emerald-800 font-medium">🕒 {psy.availability}</div>
                  </div>

                  <button
                    id={`book-psych-${psy.id}`}
                    onClick={() => handleBookAppointment(psy.name)}
                    className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agendar Sesión Gratuita</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Emergency Hotline Banner */}
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-rose-800">
                <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
                Líneas Gratuitas de Salud Mental y Apoyo 24/7 por Territorio:
              </div>
              <div className="space-y-1 text-rose-800 text-[11px] leading-tight">
                <div>&bull; <strong>Pereira & Risaralda:</strong> Línea 106 / WhatsApp 315 560 8888</div>
                <div>&bull; <strong>Quindío (Armenia):</strong> Línea de la Esperanza 106 / (606) 735 9950</div>
                <div>&bull; <strong>Caldas (Manizales):</strong> Línea 106 Teleamiga / (606) 884 1060</div>
                <div>&bull; <strong>Cali y Municipios Aledaños:</strong> Línea 106 Teleamiga Cali / (602) 486 5555</div>
                <div>&bull; <strong>Chocó (Quibdó & Pacífico):</strong> Línea Psicosocial 321 450 7890</div>
                <div>&bull; <strong>Nacional:</strong> Línea 192 opción 4 / Línea Púrpura 018000 112 137</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
