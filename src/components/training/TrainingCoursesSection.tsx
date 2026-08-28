import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TRAINING_COURSES } from '../../data/mockData';
import { TrainingCourse, CourseLesson } from '../../types';
import {
  GraduationCap,
  Hammer,
  Zap,
  Laptop,
  PlayCircle,
  BookOpen,
  CheckCircle2,
  Award,
  Clock,
  Users,
  Star,
  FileCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TrainingCoursesSection: React.FC = () => {
  const { user, enrolledCourses, enrollInCourse, completeLesson } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [activeCourse, setActiveCourse] = useState<TrainingCourse | null>(null);
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);
  const [certificateIssued, setCertificateIssued] = useState(false);

  const categories = [
    { id: 'todos', label: 'Todos los Cursos', icon: GraduationCap },
    { id: 'construccion', label: 'Construcción', icon: Hammer },
    { id: 'electricidad', label: 'Electricidad (RETIE)', icon: Zap },
    { id: 'tecnologia', label: 'Tecnología & IA', icon: Laptop }
  ];

  const filteredCourses = TRAINING_COURSES.filter(c => 
    selectedCategory === 'todos' || c.category === selectedCategory
  );

  const handleOpenCourse = (course: TrainingCourse) => {
    enrollInCourse(course.id);
    setActiveCourse(course);
    if (course.modules[0]?.lessons[0]) {
      setActiveLesson(course.modules[0].lessons[0]);
    }
  };

  const handleCompleteActiveLesson = () => {
    if (!activeCourse || !activeLesson) return;
    completeLesson(activeCourse.id, activeLesson.id);
    const newProgress = (enrolledCourses[activeCourse.id] || 0) + 25;
    if (newProgress >= 100) {
      setCertificateIssued(true);
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch (_) {}
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 border border-indigo-800/30 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5" />
              Aula Virtual Gratuita con Certificación Oficial
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
              Capacitaciones en Construcción, Electricidad y Tecnología
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Programas formativos estructurados con el SENA y agremiaciones técnicas. Adquiere habilidades prácticas de alta demanda para conseguir mejores empleos o emprender tus proyectos.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-xs space-y-1 shrink-0 text-indigo-200">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" /> Certificado de Competencias
            </div>
            <p className="text-slate-300 text-[11px]">Válido para postularse a vacantes nacionales e internacionales.</p>
          </div>
        </div>

        {/* Category filters */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-course-btn-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-500 text-white font-bold shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const progress = enrolledCourses[course.id] || 0;
          return (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                    {course.badgeLabel}
                  </span>
                  <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {course.rating}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition font-display leading-tight">
                  {course.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {course.description}
                </p>

                <div className="space-y-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {course.durationHours} horas totales
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {course.enrolledStudents} alumnos
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-700">
                    👨‍🏫 {course.instructor.name} &bull; {course.instructor.institution}
                  </div>
                </div>

                {progress > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>Progreso:</span>
                      <span className="text-indigo-600 font-bold">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700">100% Gratuito</span>
                <button
                  id={`enter-course-${course.id}`}
                  onClick={() => handleOpenCourse(course)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>{progress > 0 ? 'Continuar Clase' : 'Iniciar Curso'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Viewer Modal (Virtual Classroom) */}
      {activeCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded">
                  {activeCourse.badgeLabel} &bull; Nivel {activeCourse.level}
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-display mt-1.5">
                  {activeCourse.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Instructor: {activeCourse.instructor.name} ({activeCourse.instructor.institution})</p>
              </div>
              <button
                onClick={() => setActiveCourse(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Classroom Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left: Interactive Lesson Content (7 cols) */}
              <div className="md:col-span-7 space-y-4">
                <div className="aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white p-6 text-center space-y-3 relative overflow-hidden">
                  <div className="w-14 h-14 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition">
                    <PlayCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{activeLesson?.title}</h4>
                    <p className="text-xs text-slate-300 mt-1">Duración: {activeLesson?.durationMinutes} min &bull; Clase práctica interactiva</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm">Resumen de la Lección:</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {activeLesson?.contentSummary}
                  </p>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Conceptos Clave que Aprenderás:
                    </h5>
                    <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                      {activeLesson?.keyTakeaways.map((k, kIdx) => (
                        <li key={kIdx}>{k}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={handleCompleteActiveLesson}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Marcar Lección como Completada (+25% Progreso)</span>
                  </button>
                </div>
              </div>

              {/* Right: Modules & Syllabus (5 cols) */}
              <div className="md:col-span-5 space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Progreso del Curso:</span>
                    <span className="font-extrabold text-indigo-600">{enrolledCourses[activeCourse.id] || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${enrolledCourses[activeCourse.id] || 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                    Módulos y Lecciones
                  </h4>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {activeCourse.modules.map((mod) => (
                      <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                        <div className="bg-slate-100 p-2.5 font-bold text-slate-800">
                          {mod.title}
                        </div>
                        <div className="divide-y divide-slate-100">
                          {mod.lessons.map((les) => (
                            <button
                              key={les.id}
                              onClick={() => setActiveLesson(les)}
                              className={`w-full text-left p-2.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                                activeLesson?.id === les.id ? 'bg-indigo-50 text-indigo-900 font-bold' : 'text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <PlayCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span className="truncate">{les.title}</span>
                              </div>
                              <span className="text-[10px] text-slate-400">{les.durationMinutes}m</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certificate badge */}
                {(enrolledCourses[activeCourse.id] || 0) >= 100 ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl space-y-2 text-xs">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      ¡Certificado Oficial Desbloqueado!
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Has completado el 100% del programa. Tu certificado ha sido emitido con firma del SENA y la Alianza Regional.
                    </p>
                    <button
                      onClick={() => alert(`Certificado emitido a nombre de ${user.name} para el curso "${activeCourse.title}".`)}
                      className="w-full py-1.5 bg-emerald-700 text-white font-bold rounded-lg text-xs"
                    >
                      Descargar Certificado PDF
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                    🎓 Completa todas las lecciones para obtener tu constancia digital de competencias laborales.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
