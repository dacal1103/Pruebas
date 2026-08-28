import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { JOB_OFFERS } from '../../data/mockData';
import { JobOffer } from '../../types';
import {
  Briefcase,
  Globe,
  MapPin,
  Clock,
  DollarSign,
  Search,
  CheckCircle2,
  Filter,
  Sparkles,
  Building,
  Send,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Radio,
  FileAudio,
  Check,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  speakText,
  stopSpeaking,
  defaultVoiceRecognizer,
  soundFX
} from '../../utils/voiceAssistant';

export const JobsSection: React.FC = () => {
  const { user, appliedJobs, applyToJob, setActiveTab } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedTerritory, setSelectedTerritory] = useState<string>('todos');
  const [onlyRemote, setOnlyRemote] = useState(false);
  const [onlyInternational, setOnlyInternational] = useState(false);
  const [selectedJobDetail, setSelectedJobDetail] = useState<JobOffer | null>(null);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  // Voice Interaction States for Jobs
  const [isSpeakingJobId, setIsSpeakingJobId] = useState<string | null>(null);
  const [voiceSearchActive, setVoiceSearchActive] = useState(false);
  const [voiceApplyJob, setVoiceApplyJob] = useState<JobOffer | null>(null);
  const [voiceApplicantName, setVoiceApplicantName] = useState(user.name || '');
  const [voiceApplicantPhone, setVoiceApplicantPhone] = useState(user.phone || '');
  const [voiceApplicantExperience, setVoiceApplicantExperience] = useState('');
  const [isRecordingField, setIsRecordingField] = useState<'name' | 'phone' | 'experience' | 'search' | null>(null);
  const [voiceModalFeedback, setVoiceModalFeedback] = useState<string | null>(null);

  const categories = ['Todos', 'Tecnología', 'Electricidad', 'Construcción', 'Administrativo', 'Ventas & Comercio'];

  const territoriesList = [
    { id: 'todos', label: 'Todos los Territorios' },
    { id: 'pereira', label: 'Pereira' },
    { id: 'risaralda', label: 'Risaralda' },
    { id: 'quindio', label: 'Quindío' },
    { id: 'caldas', label: 'Caldas' },
    { id: 'eje_cafetero', label: 'Eje Cafetero' },
    { id: 'cali', label: 'Cali y Aledaños' },
    { id: 'choco', label: 'Chocó' },
    { id: 'global', label: '100% Remoto Global' },
  ];

  useEffect(() => {
    return () => {
      stopSpeaking();
      defaultVoiceRecognizer.stop();
    };
  }, []);

  const filteredJobs = JOB_OFFERS.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skillsRequired.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      job.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.department && job.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'Todos' || job.category === selectedCategory;
    const matchesRemote = !onlyRemote || job.isRemote;
    const matchesInt = !onlyInternational || job.isInternational;

    const matchesTerritory = selectedTerritory === 'todos' ||
      job.territoryKey === selectedTerritory ||
      (selectedTerritory === 'pereira' && (job.city.toLowerCase().includes('pereira') || job.territoryKey === 'pereira')) ||
      (selectedTerritory === 'risaralda' && ((job.department && job.department.toLowerCase().includes('risaralda')) || job.territoryKey === 'risaralda' || job.territoryKey === 'pereira')) ||
      (selectedTerritory === 'quindio' && ((job.department && job.department.toLowerCase().includes('quindío')) || job.city.toLowerCase().includes('armenia') || job.territoryKey === 'quindio')) ||
      (selectedTerritory === 'caldas' && ((job.department && job.department.toLowerCase().includes('caldas')) || job.city.toLowerCase().includes('manizales') || job.territoryKey === 'caldas')) ||
      (selectedTerritory === 'eje_cafetero' && (job.territoryKey === 'eje_cafetero' || job.territoryKey === 'pereira' || job.territoryKey === 'quindio' || job.territoryKey === 'caldas')) ||
      (selectedTerritory === 'cali' && ((job.department && job.department.toLowerCase().includes('valle')) || job.city.toLowerCase().includes('cali') || job.city.toLowerCase().includes('yumbo') || job.city.toLowerCase().includes('palmira') || job.territoryKey === 'cali')) ||
      (selectedTerritory === 'choco' && ((job.department && job.department.toLowerCase().includes('chocó')) || job.city.toLowerCase().includes('quibdó') || job.territoryKey === 'choco')) ||
      (selectedTerritory === 'global' && (job.isRemote || job.isInternational || job.territoryKey === 'global'));

    return matchesSearch && matchesCat && matchesRemote && matchesInt && matchesTerritory;
  });

  const handleApply = (job: JobOffer) => {
    const success = applyToJob(job.id);
    if (success) {
      setAppliedNotice(`¡Te has postulado con éxito a "${job.title}" en ${job.company}!`);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch (_) {}
      setTimeout(() => setAppliedNotice(null), 6000);
    }
  };

  // Read job out loud
  const handleSpeakJob = (job: JobOffer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (isSpeakingJobId === job.id) {
      stopSpeaking();
      setIsSpeakingJobId(null);
      return;
    }

    stopSpeaking();
    defaultVoiceRecognizer.stop();
    setIsSpeakingJobId(job.id);

    const remoteText = job.isRemote ? 'Trabajo cien por ciento remoto desde casa.' : `Trabajo presencial en ${job.city}.`;
    const skillsText = job.skillsRequired.join(', ');
    const textToRead = `Oferta de empleo: ${job.title}, en la empresa ${job.company}. ${remoteText}. Salario ofrecido: ${job.salary}. Tipo de contrato: ${job.contractType}. Habilidades buscadas: ${skillsText}. Descripción: ${job.description}. Para postularte usando tu voz, toca el botón amarillo de Postularme por Voz.`;

    speakText(textToRead, {
      onStart: () => setIsSpeakingJobId(job.id),
      onEnd: () => setIsSpeakingJobId(null),
      onError: () => setIsSpeakingJobId(null)
    });
  };

  // Voice Search
  const handleStartVoiceSearch = () => {
    if (voiceSearchActive) {
      defaultVoiceRecognizer.stop();
      setVoiceSearchActive(false);
      return;
    }

    stopSpeaking();
    setVoiceSearchActive(true);

    defaultVoiceRecognizer.start({
      onResult: (transcript) => {
        setSearchQuery(transcript);
      },
      onEnd: () => {
        setVoiceSearchActive(false);
      },
      onError: () => {
        setVoiceSearchActive(false);
      }
    });
  };

  // Open Voice Application Modal
  const handleOpenVoiceApplyModal = (job: JobOffer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    stopSpeaking();
    defaultVoiceRecognizer.stop();
    setVoiceApplyJob(job);
    setVoiceModalFeedback('Toca el micrófono para dictar tus datos o experiencia con tu voz.');

    // Welcome voice guidance
    speakText(`Postulación por voz para ${job.title} en ${job.company}. Puedes decir tu nombre, tu teléfono de WhatsApp y tu experiencia laboral.`, {
      onEnd: () => {}
    });
  };

  // Record a specific field in Voice Apply Modal
  const handleRecordField = (field: 'name' | 'phone' | 'experience') => {
    if (isRecordingField === field) {
      defaultVoiceRecognizer.stop();
      setIsRecordingField(null);
      setVoiceModalFeedback(null);
      return;
    }

    stopSpeaking();
    setIsRecordingField(field);

    const promptText = field === 'name' 
      ? '🎙️ Di tu nombre completo claro y despacio...'
      : field === 'phone'
      ? '🎙️ Di tu número de celular o WhatsApp...'
      : '🎙️ Cuéntanos en qué has trabajado, tus oficios o herramientas que sabes manejar...';

    setVoiceModalFeedback(promptText);

    defaultVoiceRecognizer.start({
      onResult: (transcript) => {
        if (field === 'name') setVoiceApplicantName(transcript);
        if (field === 'phone') setVoiceApplicantPhone(transcript);
        if (field === 'experience') setVoiceApplicantExperience(transcript);
      },
      onEnd: () => {
        setIsRecordingField(null);
        setVoiceModalFeedback(`¡Grabado con éxito!`);
        setTimeout(() => setVoiceModalFeedback(null), 3000);
      },
      onError: () => {
        setIsRecordingField(null);
        setVoiceModalFeedback('No pudimos escuchar. Toca el botón para intentar de nuevo.');
      }
    });
  };

  // Submit Voice Application
  const handleSubmitVoiceApplication = () => {
    if (!voiceApplyJob) return;

    applyToJob(voiceApplyJob.id);
    const applicantName = voiceApplicantName.trim() || 'Candidato';
    const jobTitle = voiceApplyJob.title;
    const company = voiceApplyJob.company;

    soundFX.playSuccess();
    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } catch (_) {}

    const confirmationMsg = `¡Excelente ${applicantName}! Tu postulación por voz para ${jobTitle} en ${company} ha sido enviada exitosamente. La empresa revisará tu mensaje y te contactará a tu número telefónico.`;

    setAppliedNotice(`¡Postulación por voz enviada a "${jobTitle}"!`);
    setVoiceApplyJob(null);
    setIsRecordingField(null);

    speakText(confirmationMsg);
  };

  const getMatchScore = (skillsRequired: string[]) => {
    if (!user.skills.length) return 70;
    const common = skillsRequired.filter(req => 
      user.skills.some(userSkill => userSkill.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(userSkill.toLowerCase()))
    );
    const score = Math.min(98, 65 + (common.length * 15));
    return score;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 border border-blue-800/30 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5" />
              Bolsa de Empleo con Asistencia y Postulación por Voz
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
              Oportunidades Laborales & Trabajo Remoto
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Encuentra empleos presenciales en Pereira, Chocó y el Eje Cafetero, o vacantes remotas. Si prefieres no leer o no escribir tu currículum, puedes <strong>escuchar las ofertas y postularte hablando con tu voz</strong>.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-xs space-y-1 shrink-0">
            <div className="text-emerald-300 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Postulaciones Activas: {appliedJobs.length}
            </div>
            <p className="text-slate-300 text-[11px]">Postulaciones por voz válidas para todas las empresas.</p>
          </div>
        </div>

        {/* Search and Filters bar */}
        <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                id="job-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cargo, ciudad (Pereira, Quibdó), habilidad..."
                className="w-full pl-10 pr-12 py-2.5 text-xs rounded-xl bg-white/10 text-white placeholder-slate-400 border border-white/20 focus:outline-hidden focus:bg-white/20"
              />
              <button
                type="button"
                onClick={handleStartVoiceSearch}
                title="Buscar hablando con la voz"
                className={`absolute right-2 px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  voiceSearchActive
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-white/20 hover:bg-white/30 text-amber-300'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px]">{voiceSearchActive ? 'Grabando...' : 'Voz'}</span>
              </button>
            </div>

            <div className="sm:col-span-3">
              <select
                id="job-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-800 text-white border border-white/20 focus:outline-hidden"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'Todos' ? 'Todas las Categorías' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3 flex items-center gap-2">
              <button
                id="filter-only-remote-btn"
                onClick={() => setOnlyRemote(!onlyRemote)}
                className={`flex-1 py-2.5 px-2 text-xs font-semibold rounded-xl border transition cursor-pointer flex items-center justify-center gap-1 ${
                  onlyRemote ? 'bg-blue-500 text-slate-950 border-blue-400 font-bold' : 'bg-white/10 text-slate-200 border-white/20'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Remoto</span>
              </button>

              <button
                id="filter-only-int-btn"
                onClick={() => setOnlyInternational(!onlyInternational)}
                className={`flex-1 py-2.5 px-2 text-xs font-semibold rounded-xl border transition cursor-pointer flex items-center justify-center gap-1 ${
                  onlyInternational ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold' : 'bg-white/10 text-slate-200 border-white/20'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Internacional</span>
              </button>
            </div>
          </div>

          {/* Territory Pills selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold whitespace-nowrap mr-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" /> Territorio:
            </span>
            {territoriesList.map((terr) => {
              const isSelected = selectedTerritory === terr.id;
              return (
                <button
                  key={terr.id}
                  id={`filter-terr-${terr.id}`}
                  onClick={() => setSelectedTerritory(terr.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-400 text-slate-950 font-bold shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200'
                  }`}
                >
                  {terr.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Voice Accessibility Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm text-slate-900">
              ¿Dificultad para leer o escribir tu currículum?
            </div>
            <p className="text-[11px] text-slate-600">
              Toca <strong>"🔊 Escuchar"</strong> en cualquier oferta para oír los detalles, o usa <strong>"🎙️ Postularme por Voz"</strong> para enviar tu postulación hablando.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            speakText("Bienvenido a la bolsa de empleo con asistencia vocal. En cada oferta encontrarás un botón para escuchar la descripción del trabajo y otro botón amarillo para postularte hablando con tu voz sin necesidad de escribir.");
          }}
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Volume2 className="w-4 h-4" />
          <span>Escuchar Instrucciones</span>
        </button>
      </div>

      {/* Postulation Alert Notice */}
      {appliedNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{appliedNotice}</span>
          </div>
          <button
            onClick={() => setAppliedNotice(null)}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Jobs Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold">
            Mostrando {filteredJobs.length} ofertas laborales verificadas
          </span>
          <button
            onClick={() => setActiveTab('habilidades')}
            className="text-emerald-700 hover:underline font-bold flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            ¿Quieres mejorar tu match? Valida tus habilidades con voz aquí
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => {
            const isApplied = appliedJobs.includes(job.id);
            const isSpeakingThis = isSpeakingJobId === job.id;
            const matchScore = getMatchScore(job.skillsRequired);

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-400 hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {job.category}
                        </span>
                        {job.isRemote && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
                            <Globe className="w-3 h-3" /> 100% Remoto
                          </span>
                        )}
                        {job.isInternational && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full">
                            🌍 Internacional
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight font-display">
                        {job.title}
                      </h3>
                      <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1 mt-0.5">
                        <Building className="w-3.5 h-3.5" />
                        {job.company}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 block">
                        {matchScore}% Match
                      </span>
                      {/* Audio Button for this card */}
                      <button
                        type="button"
                        onClick={(e) => handleSpeakJob(job, e)}
                        title="Escuchar esta oferta laboral"
                        className={`p-2 rounded-xl transition flex items-center gap-1 text-[11px] font-bold cursor-pointer ${
                          isSpeakingThis
                            ? 'bg-emerald-600 text-white animate-pulse'
                            : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800'
                        }`}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span className="text-[10px]">{isSpeakingThis ? 'Pausar' : 'Escuchar'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.city} ({job.country})
                    </span>
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      {job.salary}
                    </span>
                    <span className="text-slate-400">&bull; {job.contractType}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {job.description}
                  </p>

                  {/* Required Skills tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.skillsRequired.map((skill, sIdx) => {
                      const userHas = user.skills.some(us => us.toLowerCase().includes(skill.toLowerCase()));
                      return (
                        <span
                          key={sIdx}
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                            userHas
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {userHas ? '✓ ' : ''}{skill}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Publicado: {job.postedAt}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Voice Apply Button */}
                    <button
                      onClick={(e) => handleOpenVoiceApplyModal(job, e)}
                      disabled={isApplied}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5 text-slate-950" />
                      <span>Postular por Voz</span>
                    </button>

                    <button
                      onClick={() => setSelectedJobDetail(job)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    >
                      Detalle
                    </button>

                    <button
                      id={`apply-job-btn-${job.id}`}
                      disabled={isApplied}
                      onClick={() => handleApply(job)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                        isApplied
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Postulado</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Postularme</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Voice Application Modal ("Audio CV") */}
      {voiceApplyJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-amber-300 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-1">
                  <Mic className="w-3.5 h-3.5 text-amber-700" />
                  Postulación Vocal / Audio CV
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 font-display">
                  {voiceApplyJob.title}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">{voiceApplyJob.company} &bull; {voiceApplyJob.city}</p>
              </div>
              <button
                onClick={() => {
                  stopSpeaking();
                  defaultVoiceRecognizer.stop();
                  setVoiceApplyJob(null);
                  setIsRecordingField(null);
                }}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              No necesitas redactar un currículum escrito. Simplemente presiona los botones de micrófono para <strong>decir tu nombre, WhatsApp y tu experiencia laboral con tu voz</strong>.
            </p>

            {voiceModalFeedback && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center gap-2 animate-pulse">
                <Radio className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold">{voiceModalFeedback}</span>
              </div>
            )}

            {/* Vocal fields */}
            <div className="space-y-4">
              {/* Field 1: Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>1. Tu Nombre Completo</span>
                  <span className="text-[10px] text-slate-400 font-normal">Hablado o escrito</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={voiceApplicantName}
                    onChange={(e) => setVoiceApplicantName(e.target.value)}
                    placeholder="Ej: Wilson Mena Córdoba"
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRecordField('name')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      isRecordingField === 'name'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isRecordingField === 'name' ? 'Detener' : 'Hablar'}</span>
                  </button>
                </div>
              </div>

              {/* Field 2: Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>2. Tu Celular o WhatsApp</span>
                  <span className="text-[10px] text-slate-400 font-normal">Para que la empresa te llame</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={voiceApplicantPhone}
                    onChange={(e) => setVoiceApplicantPhone(e.target.value)}
                    placeholder="Ej: 312 456 7890"
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRecordField('phone')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      isRecordingField === 'phone'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isRecordingField === 'phone' ? 'Detener' : 'Hablar'}</span>
                  </button>
                </div>
              </div>

              {/* Field 3: Spoken Experience / Audio CV */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>3. Cuéntanos tu experiencia y oficios (Vocal)</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Audio CV</span>
                </label>
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={voiceApplicantExperience}
                    onChange={(e) => setVoiceApplicantExperience(e.target.value)}
                    placeholder="Toca el botón 'Hablar mi experiencia' y cuéntanos qué sabes hacer (ej: he trabajado en construcción, manejo de pulidora y pintura)..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-amber-500"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleRecordField('experience')}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        isRecordingField === 'experience'
                          ? 'bg-rose-600 text-white animate-pulse shadow-md'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      <span>{isRecordingField === 'experience' ? '🔴 Grabando tu voz... Toca para finalizar' : '🎙️ Toca aquí y habla tu experiencia de trabajo'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  defaultVoiceRecognizer.stop();
                  setVoiceApplyJob(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={!voiceApplicantName || !voiceApplicantPhone}
                onClick={handleSubmitVoiceApplication}
                className="px-6 py-2.5 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Postulación por Voz</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Job Details */}
      {selectedJobDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded">
                  {selectedJobDetail.category}
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-display mt-2">
                  {selectedJobDetail.title}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">{selectedJobDetail.company} &bull; {selectedJobDetail.city}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSpeakJob(selectedJobDetail)}
                  title="Escuchar toda la oferta"
                  className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isSpeakingJobId === selectedJobDetail.id ? 'Pausar' : 'Escuchar'}</span>
                </button>
                <button
                  onClick={() => {
                    stopSpeaking();
                    setSelectedJobDetail(null);
                  }}
                  className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="font-bold text-slate-900 text-sm">{selectedJobDetail.salary}</div>
              <div className="text-slate-600">Modalidad: {selectedJobDetail.isRemote ? '100% Remoto' : 'Presencial'} &bull; Tipo: {selectedJobDetail.contractType}</div>
              <div className="text-slate-600">Nivel de experiencia: {selectedJobDetail.experienceLevel}</div>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <h4 className="font-bold text-slate-900">Descripción del Puesto:</h4>
              <p className="leading-relaxed whitespace-pre-line">{selectedJobDetail.description}</p>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900">Beneficios ofrecidos:</h4>
              <ul className="space-y-1 list-disc list-inside text-slate-600">
                {selectedJobDetail.benefits.map((b, idx) => (
                  <li key={idx}>{b}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900">Habilidades requeridas:</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedJobDetail.skillsRequired.map((s, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-800 font-semibold rounded-md">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  const job = selectedJobDetail;
                  setSelectedJobDetail(null);
                  handleOpenVoiceApplyModal(job);
                }}
                className="px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Postularme con Voz</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    stopSpeaking();
                    setSelectedJobDetail(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  disabled={appliedJobs.includes(selectedJobDetail.id)}
                  onClick={() => {
                    handleApply(selectedJobDetail);
                    setSelectedJobDetail(null);
                  }}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {appliedJobs.includes(selectedJobDetail.id) ? 'Ya te has postulado' : 'Confirmar Postulación'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
