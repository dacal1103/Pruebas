import { TrustEntity, JobOffer, TrainingCourse, ProductShowcase, CreditOption, SkillQuestion, TerritoryInfo } from '../types';

export const TERRITORIES_DATA: TerritoryInfo[] = [
  {
    id: 'pereira',
    name: 'Pereira & Área Metropolitana',
    shortName: 'Pereira',
    department: 'Risaralda',
    municipalities: ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia', 'Marsella'],
    highlight: 'Capital del Eje Cafetero, hub logístico, comercial y de innovación tecnológica.',
    chambers: 'Cámara de Comercio de Pereira por Risaralda & Cámara de Comercio de Dosquebradas',
    bannerGradient: 'from-emerald-900 via-teal-900 to-slate-900',
    jobCount: 48,
    producerCount: 135,
    creditFund: 'Fondo Reactiva Pereira & Risaralda (Tasa Blanda + 6m Gracia)',
    healthLine: 'Línea Amiga Pereira 106',
    healthPhone: '315 560 8888'
  },
  {
    id: 'risaralda',
    name: 'Departamento de Risaralda',
    shortName: 'Risaralda',
    department: 'Risaralda',
    municipalities: ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia', 'Belén de Umbría', 'Santuario', 'Apía', 'Guática', 'Quinchía', 'Pueblo Rico', 'Mistrató', 'Balboa', 'La Celia', 'Marsella'],
    highlight: 'Potencia agroindustrial cafetera, turismo de naturaleza y manufactura.',
    chambers: 'Cámara de Comercio de Pereira & Red Gremial Departamental',
    bannerGradient: 'from-green-900 via-emerald-950 to-slate-900',
    jobCount: 62,
    producerCount: 190,
    creditFund: 'Fondo Departamental de Desarrollo Risaralda Emprende',
    healthLine: 'Línea de Vida Risaralda',
    healthPhone: '106 / (606) 335 5600'
  },
  {
    id: 'quindio',
    name: 'Quindío & Cordillera Cafetera',
    shortName: 'Quindío',
    department: 'Quindío',
    municipalities: ['Armenia', 'Calarcá', 'Montenegro', 'Quimbaya', 'La Tebaida', 'Filandia', 'Salento', 'Circasia', 'Pijao', 'Génova', 'Córdoba', 'Buenavista'],
    highlight: 'Corazón del Paisaje Cultural Cafetero, cafés especiales, turismo internacional y agroindustria.',
    chambers: 'Cámara de Comercio de Armenia y del Quindío',
    bannerGradient: 'from-amber-950 via-emerald-950 to-slate-900',
    jobCount: 39,
    producerCount: 110,
    creditFund: 'Fondo Emprende Quindío & Fomipyme Cordillera',
    healthLine: 'Línea de la Esperanza Quindío',
    healthPhone: '106 / (606) 735 9950'
  },
  {
    id: 'caldas',
    name: 'Caldas & Subregiones Productivas',
    shortName: 'Caldas',
    department: 'Caldas',
    municipalities: ['Manizales', 'Villamaría', 'Chinchiná', 'Neira', 'Palestina', 'Riosucio', 'La Dorada', 'Anserma', 'Salamina', 'Aguadas', 'Supía', 'Pensilvania', 'Viterbo'],
    highlight: 'Ciudad universitaria, biosistemas, café de exportación y metalmecánica avanzada.',
    chambers: 'Cámara de Comercio de Manizales por Caldas & Cámara de Chinchiná',
    bannerGradient: 'from-sky-950 via-slate-900 to-emerald-950',
    jobCount: 44,
    producerCount: 125,
    creditFund: 'Innpulsa Caldas & Fondo de Reactivación Manizales',
    healthLine: 'Línea 106 Teleamiga Manizales',
    healthPhone: '106 / (606) 884 1060'
  },
  {
    id: 'eje_cafetero',
    name: 'Eje Cafetero (Región Integrada)',
    shortName: 'Eje Cafetero',
    department: 'Risaralda • Caldas • Quindío',
    municipalities: ['Área Metropolitana Centro Occidente', 'Subregión Centro Sur Caldas', 'Hoya del Quindío', 'Norte del Valle'],
    highlight: 'Ecosistema regional interconectado de talento, logística, turismo y encadenamientos productivos.',
    chambers: 'Alianza de Cámaras de Comercio del Eje Cafetero & RAP Eje Cafetero',
    bannerGradient: 'from-teal-950 via-emerald-900 to-amber-950',
    jobCount: 145,
    producerCount: 425,
    creditFund: 'Línea Unificada Eje Cafetero Fomenta con 6 Meses de Gracia',
    healthLine: 'Red Regional de Tele-orientación Emocional',
    healthPhone: '106 (Cualquier municipio del Eje)'
  },
  {
    id: 'cali_valle',
    name: 'Cali y Municipios Aledaños',
    shortName: 'Cali & Aledaños',
    department: 'Valle del Cauca',
    municipalities: ['Cali', 'Yumbo (Zona Industrial)', 'Jamundí', 'Palmira (Hub Logístico)', 'Candelaria', 'Puerto Tejada', 'Dagua', 'La Cumbre', 'Vijes'],
    highlight: 'Principal polo industrial, agroexportador, tecnológico y de servicios del suroccidente.',
    chambers: 'Cámara de Comercio de Cali & Cámara de Comercio de Palmira',
    bannerGradient: 'from-blue-950 via-slate-900 to-indigo-950',
    jobCount: 78,
    producerCount: 210,
    creditFund: 'Fondo Valle INN & Banco de las Oportunidades Cali',
    healthLine: 'Línea 106 Teleamiga Cali & Valle',
    healthPhone: '106 / (602) 486 5555'
  },
  {
    id: 'choco',
    name: 'Chocó & Región Pacífico',
    shortName: 'Chocó',
    department: 'Chocó',
    municipalities: ['Quibdó', 'Istmina', 'Tadó', 'Condoto', 'Bahía Solano', 'Nuquí', 'Acandí', 'Riosucio Chocó', 'Atrato'],
    highlight: 'Bioeconomía, orfebrería ancestral en filigrana, etnoturismo y superalimentos silvestres.',
    chambers: 'Cámara de Comercio del Chocó & Red Innova Pacífico',
    bannerGradient: 'from-amber-950 via-emerald-950 to-slate-900',
    jobCount: 29,
    producerCount: 95,
    creditFund: 'Fondo Pacífico Emprende & Crédito Étnico Solidario',
    healthLine: 'Línea de Atención Psicosocial Chocó',
    healthPhone: '106 / 321 450 7890'
  }
];

export const TRUST_ENTITIES: TrustEntity[] = [
  {
    id: 'ent-1',
    name: 'Cámara de Comercio de Pereira por Risaralda',
    shortName: 'CCP Risaralda',
    category: 'Cámara de Comercio',
    region: 'Pereira & Risaralda',
    territoryKey: 'pereira',
    description: 'Entidad gremial y de fomento que valida formalidad, registro mercantil y promueve la marca territorial Hecho en Pereira y Risaralda.',
    logoBadge: '🏢 CCP Pereira',
    verifiedCount: 14200,
    contactUrl: 'https://camarapereira.org.co'
  },
  {
    id: 'ent-cc-quindio',
    name: 'Cámara de Comercio de Armenia y del Quindío',
    shortName: 'CC Quindío',
    category: 'Cámara de Comercio',
    region: 'Armenia & Quindío',
    territoryKey: 'quindio',
    description: 'Fomenta el desarrollo empresarial, formalización y sello de origen para los 12 municipios del Quindío.',
    logoBadge: '☕ CC Quindío',
    verifiedCount: 9800,
    contactUrl: 'https://camaraarmenia.org.co'
  },
  {
    id: 'ent-cc-caldas',
    name: 'Cámara de Comercio de Manizales por Caldas',
    shortName: 'CC Manizales',
    category: 'Cámara de Comercio',
    region: 'Manizales & Caldas',
    territoryKey: 'caldas',
    description: 'Acompañamiento a empresas, validación de capacidades tecnológicas, clúster de café y metalmecánica en Caldas.',
    logoBadge: '🏔️ CC Manizales',
    verifiedCount: 11400,
    contactUrl: 'https://ccmpc.org.co'
  },
  {
    id: 'ent-cc-cali',
    name: 'Cámara de Comercio de Cali',
    shortName: 'CC Cali & Aledaños',
    category: 'Cámara de Comercio',
    region: 'Cali, Yumbo, Jamundí, Palmira, Candelaria',
    territoryKey: 'cali_valle',
    description: 'Motor de crecimiento empresarial y de innovación para Cali y los municipios industriales y logísticos aledaños.',
    logoBadge: '🌴 CC Cali',
    verifiedCount: 28500,
    contactUrl: 'https://ccc.org.co'
  },
  {
    id: 'ent-2',
    name: 'Cámara de Comercio del Chocó & Red Innova',
    shortName: 'CC Chocó',
    category: 'Cámara de Comercio',
    region: 'Quibdó & Chocó',
    territoryKey: 'choco',
    description: 'Promotora de proyectos productivos, bioeconomía y artesanía con sello étnico de origen Chocó.',
    logoBadge: '🌴 CC Chocó',
    verifiedCount: 6850,
    contactUrl: 'https://camarachoco.org.co'
  },
  {
    id: 'ent-3',
    name: 'SENA Regionales Eje Cafetero, Valle & Chocó',
    shortName: 'SENA Nacional & Regional',
    category: 'Educación & Formación',
    region: 'Pereira, Armenia, Manizales, Cali, Quibdó',
    territoryKey: 'eje_cafetero',
    description: 'Entidad pública nacional de formación técnica y certificación oficial de competencias laborales.',
    logoBadge: '🎓 SENA Validador',
    verifiedCount: 65000,
    contactUrl: 'https://sena.edu.co'
  },
  {
    id: 'ent-4',
    name: 'Cooperativa Financiera Confiar & Banca Solidaria',
    shortName: 'Confiar Solidaria',
    category: 'Financiera & Cooperativa',
    region: 'Eje Cafetero, Valle, Chocó & Colombia',
    territoryKey: 'eje_cafetero',
    description: 'Operador de microfinanzas y créditos de fomento con tasas de interés blandas y 6 meses de período de gracia.',
    logoBadge: '🤝 Confianza Solidaria',
    verifiedCount: 22300,
    contactUrl: 'https://confiar.coop'
  },
  {
    id: 'ent-5',
    name: 'Red Territorial de Salud Mental & Tele-apoyo',
    shortName: 'Salud & Vida Regional',
    category: 'Salud & Bienestar',
    region: 'Risaralda, Quindío, Caldas, Valle, Chocó',
    territoryKey: 'nacional',
    description: 'Red articulada de líneas de atención psicológica 24/7 y orientadores clínicos certificados.',
    logoBadge: '💙 Bienestar Certificado',
    verifiedCount: 12400,
    contactUrl: 'https://minsalud.gov.co'
  }
];

export const JOB_OFFERS: JobOffer[] = [
  {
    id: 'job-1',
    title: 'Desarrollador Frontend React & TypeScript (Remoto Global)',
    company: 'Andes Cloud Technologies',
    city: 'Remoto Internacional',
    department: 'Remoto Global',
    territoryKey: 'remoto_global',
    country: 'Estados Unidos / Colombia',
    isRemote: true,
    isInternational: true,
    contractType: 'Tiempo Completo',
    salary: '$2.800 - $3.800 USD / mes',
    currency: 'USD',
    category: 'Tecnología',
    skillsRequired: ['React', 'TypeScript', 'Tailwind CSS', 'Git', 'Inglés Intermedio'],
    experienceLevel: 'Intermedio (2-4 años)',
    description: 'Buscamos talento en Pereira, Cali, Manizales, Armenia, Quibdó o cualquier región de Colombia para desarrollo de plataformas web modernas con clientes internacionales. Flexibilidad horaria total.',
    benefits: ['100% Remoto', 'Pago en USD', 'Bono de equipamiento', 'Capacitaciones continuas'],
    postedAt: 'Hace 2 horas',
    isUrgent: true
  },
  {
    id: 'job-2',
    title: 'Técnico Electricista Industrial & Residencial RETIE',
    company: 'Soluciones Energéticas del Otún',
    city: 'Pereira',
    department: 'Risaralda',
    territoryKey: 'pereira',
    country: 'Colombia',
    isRemote: false,
    isInternational: false,
    contractType: 'Tiempo Completo',
    salary: '$2.400.000 - $2.900.000 COP',
    currency: 'COP',
    category: 'Electricidad',
    skillsRequired: ['Norma RETIE', 'Tableros Eléctricos', 'Mantenimiento Preventivo', 'Lectura de Planos'],
    experienceLevel: 'Junior (1-2 años)',
    description: 'Empresa líder en Pereira y Dosquebradas requiere técnicos electricistas con conocimientos en montajes residenciales, comerciales y paneles solares.',
    benefits: ['Prestaciones de ley completas', 'Auxilio de transporte', 'Seguro de riesgos laborales nivel alto'],
    postedAt: 'Hace 3 horas'
  },
  {
    id: 'job-quindio-1',
    title: 'Supervisor de Obras & Acabados Paisaje Cafetero',
    company: 'Constructora Cordillera Viva',
    city: 'Armenia / Calarcá',
    department: 'Quindío',
    territoryKey: 'quindio',
    country: 'Colombia',
    isRemote: false,
    isInternational: false,
    contractType: 'Tiempo Completo',
    salary: '$3.100.000 - $3.800.000 COP',
    currency: 'COP',
    category: 'Construcción',
    skillsRequired: ['Mampostería Sismorresistente', 'Encofrados', 'Supervisión de Obra', 'Lectura de Planos'],
    experienceLevel: 'Intermedio (2-4 años)',
    description: 'Coordinación de cuadrillas de construcción para proyectos campestres y hoteleros en Armenia, Calarcá y Filandia.',
    benefits: ['Bono por entrega a tiempo', 'Afiliación ARL integral', 'Auxilio de movilidad'],
    postedAt: 'Hace 4 horas',
    isUrgent: true
  },
  {
    id: 'job-caldas-1',
    title: 'Técnico en Mantenimiento de Plantas Industriales & Agroindustria',
    company: 'Agroprocesos del Ruiz & Manizales',
    city: 'Manizales / Chinchiná',
    department: 'Caldas',
    territoryKey: 'caldas',
    country: 'Colombia',
    isRemote: false,
    isInternational: false,
    contractType: 'Tiempo Completo',
    salary: '$2.600.000 - $3.200.000 COP',
    currency: 'COP',
    category: 'Electricidad',
    skillsRequired: ['Automatización Básica', 'Motores Trifásicos', 'Mantenimiento Mecánico', 'RETIE'],
    experienceLevel: 'Junior (1-2 años)',
    description: 'Mantenimiento de líneas de tostión, trilla y empaque en el corredor industrial Manizales - Villamaría - Chinchiná.',
    benefits: ['Casino y transporte corporativo', 'Fondo de empleados', 'Capacitación técnica'],
    postedAt: 'Hace 5 horas'
  },
  {
    id: 'job-cali-1',
    title: 'Coordinador de Logística & Despachos Zona Industrial',
    company: 'Alianza Logística del Valle & Pacífico',
    city: 'Yumbo / Cali / Palmira',
    department: 'Valle del Cauca',
    territoryKey: 'cali_valle',
    country: 'Colombia',
    isRemote: false,
    isInternational: false,
    contractType: 'Tiempo Completo',
    salary: '$2.800.000 - $3.600.000 COP',
    currency: 'COP',
    category: 'Administrativo',
    skillsRequired: ['WMS / ERP', 'Control de Inventarios', 'Manejo de Excel', 'Liderazgo'],
    experienceLevel: 'Intermedio (2-4 años)',
    description: 'Gestión de operaciones de almacenamiento y distribución en el parque industrial de Yumbo y centro logístico de Palmira.',
    benefits: ['Ruta empresarial desde Cali y Jamundí', 'Seguro de vida colectivo', 'Oportunidades de ascenso'],
    postedAt: 'Hace 6 horas',
    isUrgent: true
  },
  {
    id: 'job-cali-2',
    title: 'Ejecutivo Comercial & Expansión de Clientes',
    company: 'Soluciones Tecnológicas del Valle',
    city: 'Cali / Jamundí / Candelaria',
    department: 'Valle del Cauca',
    territoryKey: 'cali_valle',
    country: 'Colombia',
    isRemote: false,
    isInternational: false,
    contractType: 'Tiempo Completo',
    salary: '$2.200.000 COP + Comisiones ($4M+)',
    currency: 'COP',
    category: 'Ventas & Comercio',
    skillsRequired: ['Negociación', 'Ventas B2B', 'Servicio al Cliente', 'Prospección'],
    experienceLevel: 'Junior (1-2 años)',
    description: 'Atención a pequeños negocios y PYMEs en Cali, Yumbo y Jamundí para soluciones de facturación y pagos digitales.',
    benefits: ['Comisiones sin techo', 'Auxilio de rodamiento', 'Plan de bienestar'],
    postedAt: 'Ayer'
  },
  {
    id: 'job-3',
    title: 'Maestro de Obra y Acabados de Construcción Sismorresistente',
    company: 'Constructora Eje & Pacífico',
    city: 'Pereira / Dosquebradas',
    department: 'Risaralda',
    territoryKey: 'pereira',
    country: 'Colombia',
    isRemote: false,
    isInternational: false,
    contractType: 'Por Proyecto',
    salary: '$3.200.000 - $4.000.000 COP',
    currency: 'COP',
    category: 'Construcción',
    skillsRequired: ['Mampostería Estructural', 'Encofrados', 'Seguridad en Alturas', 'Liderazgo de Cuadrilla'],
    experienceLevel: 'Senior (5+ años)',
    description: 'Supervisión y ejecución de obras civiles en proyectos residenciales. Se valorará certificación del SENA o validación de habilidades en la plataforma.',
    benefits: ['Bonos por cumplimiento de metas', 'Dotación y EPP certificados', 'Caja de compensación'],
    postedAt: 'Ayer'
  },
  {
    id: 'job-4',
    title: 'Especialista en Marketing Digital & E-commerce Regional',
    company: 'Colectivo Hecho en Colombia',
    city: 'Pereira / Quibdó / Cali (Híbrido)',
    department: 'Eje Cafetero & Pacífico',
    territoryKey: 'eje_cafetero',
    country: 'Colombia',
    isRemote: true,
    isInternational: false,
    contractType: 'Prestación de Servicios',
    salary: '$2.600.000 COP / mes',
    currency: 'COP',
    category: 'Tecnología',
    skillsRequired: ['Meta Ads', 'Shopify / WooCommerce', 'Creación de Contenido', 'SEO'],
    experienceLevel: 'Junior (1-2 años)',
    description: 'Apoyo en la aceleración de ventas digitales para marcas de café, confección y artesanías de Risaralda, Quindío, Caldas, Valle y Chocó.',
    benefits: ['Trabajo flexible', 'Comisión sobre ventas generadas', 'Oportunidades de viaje'],
    postedAt: 'Hace 2 días'
  },
  {
    id: 'job-5',
    title: 'Asistente Virtual Bilingüe & Soporte de Operaciones',
    company: 'Global Staffing Partners',
    city: 'Remoto Internacional',
    department: 'Remoto Global',
    territoryKey: 'remoto_global',
    country: 'Canadá / LATAM',
    isRemote: true,
    isInternational: true,
    contractType: 'Tiempo Completo',
    salary: '$1.400 - $1.800 USD / mes',
    currency: 'USD',
    category: 'Administrativo',
    skillsRequired: ['Inglés Avanzado (B2/C1)', 'Gestión de Correo', 'Excel / Google Sheets', 'Atención al Cliente'],
    experienceLevel: 'Sin experiencia previa',
    description: 'Excelente oportunidad para personas en Colombia que buscan ingresos en dólares desde casa coordinando agendas y atención de usuarios.',
    benefits: ['Contrato a término indefinido internacional', 'Capacitación paga', 'Días libres adicionales'],
    postedAt: 'Hace 3 días'
  },
  {
    id: 'job-6',
    title: 'Instalador de Sistemas Solares Fotovoltaicos',
    company: 'Energías Verdes del Chocó & Eje',
    city: 'Quibdó / Istmina',
    department: 'Chocó',
    territoryKey: 'choco',
    country: 'Colombia',
    isRemote: false,
    isInternational: false,
    contractType: 'Tiempo Completo',
    salary: '$2.700.000 - $3.400.000 COP',
    currency: 'COP',
    category: 'Electricidad',
    skillsRequired: ['Energía Solar', 'Inversores y Baterías', 'Trabajo en Alturas', 'Normas Técnicas'],
    experienceLevel: 'Intermedio (2-4 años)',
    description: 'Despliegue de microrredes solares para comunidades y empresas en el Chocó y el Eje Cafetero.',
    benefits: ['Viáticos y hospedaje cubiertos', 'Prima extralegal', 'Entrenamiento especializado'],
    postedAt: 'Hace 4 días'
  }
];

export const TRAINING_COURSES: TrainingCourse[] = [
  {
    id: 'course-const-1',
    title: 'Fundamentos de Construcción Moderna y Seguridad en Obra',
    category: 'construccion',
    badgeLabel: '🏗️ Construcción',
    durationHours: 36,
    totalLessons: 12,
    level: 'Básico / Inicial',
    instructor: {
      name: 'Ing. Carlos Mario Restrepo',
      role: 'Especialista en Estructuras',
      institution: 'SENA Regional & Sociedad de Ingenieros'
    },
    description: 'Domina los conceptos clave de cimentación, mampostería sismorresistente NSR-10, lectura técnica de planos y prevención de riesgos laborales.',
    learningOutcomes: [
      'Interpretación técnica de planos arquitectónicos y estructurales',
      'Proporciones y mezclas de concreto de alta resistencia',
      'Normas de seguridad y trabajo seguro en alturas',
      'Cálculo de presupuestos de materiales e insumos de obra'
    ],
    modules: [
      {
        id: 'mod-1',
        title: 'Módulo 1: Introducción a la Construcción y Planos',
        lessons: [
          {
            id: 'l-1',
            title: '1.1 Lectura de cotas, ejes y simbología técnica',
            durationMinutes: 45,
            type: 'video',
            contentSummary: 'Cómo interpretar planos arquitectónicos y estructurales según la norma colombiana NSR-10.',
            keyTakeaways: ['Diferencia entre plano de cimentación y cortes', 'Escalas 1:50 y 1:100', 'Símbolos universales de obra'],
            completed: true
          },
          {
            id: 'l-2',
            title: '1.2 Seguridad industrial y EPP en el sitio de trabajo',
            durationMinutes: 30,
            type: 'lectura',
            contentSummary: 'Protocolos de protección personal para evitar accidentes comunes.',
            keyTakeaways: ['Casco dieléctrico, botas con puntera y arnés', 'Señalización obligatoria de obra']
          }
        ]
      },
      {
        id: 'mod-2',
        title: 'Módulo 2: Mezclas, Muros y Mampostería',
        lessons: [
          {
            id: 'l-3',
            title: '2.1 Dosificación de morteros y concretos 3000 PSI',
            durationMinutes: 50,
            type: 'taller_practico',
            contentSummary: 'Taller de cálculo para mezclar arena, gravilla, cemento y agua en proporciones ideales.',
            keyTakeaways: ['Prueba de asentamiento (Slump)', 'Relación agua-cemento para evitar fisuras']
          }
        ]
      }
    ],
    certificateAvailable: true,
    enrolledStudents: 1240,
    rating: 4.9
  },
  {
    id: 'course-elec-1',
    title: 'Instalaciones Eléctricas Residenciales y Certificación RETIE',
    category: 'electricidad',
    badgeLabel: '⚡ Electricidad',
    durationHours: 42,
    totalLessons: 14,
    level: 'Intermedio',
    instructor: {
      name: 'Tecnól. Andrés Valencia',
      role: 'Perito Eléctrico RETIE',
      institution: 'Colegio de Técnicos Electricistas'
    },
    description: 'Aprende a diseñar, dimensionar e instalar circuitos eléctricos seguros, cuadros de distribución, sistemas de puesta a tierra y normas de protección.',
    learningOutcomes: [
      'Dimensionamiento de calibres de conductores según norma AWG',
      'Instalación de interruptores termomagnéticos y diferenciales GFCI',
      'Diseño y medición de pozos a tierra con telurómetro',
      'Cumplimiento de la norma técnica RETIE para aprobación oficial'
    ],
    modules: [
      {
        id: 'mod-e1',
        title: 'Módulo 1: Circuitos Eléctricos y Seguridad',
        lessons: [
          {
            id: 'le-1',
            title: '1.1 Ley de Ohm, potencia y cálculo de carga total',
            durationMinutes: 40,
            type: 'video',
            contentSummary: 'Fórmulas esenciales para no sobrecargar las líneas de una vivienda.',
            keyTakeaways: ['Cálculo de Amperaje = Vatios / Voltios', 'Selección de breakers según amperaje nominal']
          },
          {
            id: 'le-2',
            title: '1.2 Tableros de distribución y balanceo de fases',
            durationMinutes: 55,
            type: 'taller_practico',
            contentSummary: 'Montaje de caja de breakers y conexión de barra neutra y tierra física.',
            keyTakeaways: ['Código de colores: Fase (Negro/Rojo), Neutro (Blanco), Tierra (Verde/Desnudo)']
          }
        ]
      }
    ],
    certificateAvailable: true,
    enrolledStudents: 1890,
    rating: 4.95
  },
  {
    id: 'course-tech-1',
    title: 'Habilidades Digitales, Programación Web e Inteligencia Artificial',
    category: 'tecnologia',
    badgeLabel: '💻 Tecnología',
    durationHours: 48,
    totalLessons: 16,
    level: 'Básico / Inicial',
    instructor: {
      name: 'Ing. Sofía Quintero Gómez',
      role: 'Lead Tech Developer',
      institution: 'Pereira Tech Hub'
    },
    description: 'Aprende las competencias tecnológicas más demandadas en el mercado nacional y global: herramientas no-code, desarrollo web moderno y uso de IA para automatizar tareas.',
    learningOutcomes: [
      'Creación de sitios web y tiendas virtuales funcionales',
      'Uso de herramientas de Inteligencia Artificial para aumentar la productividad 3x',
      'Manejo de bases de datos y automatizaciones de procesos',
      'Preparación para aplicar a trabajos remotos internacionales en USD'
    ],
    modules: [
      {
        id: 'mod-t1',
        title: 'Módulo 1: Productividad e Inteligencia Artificial Aplicada',
        lessons: [
          {
            id: 'lt-1',
            title: '1.1 IA Generativa para agilizar cotizaciones, emails y análisis',
            durationMinutes: 35,
            type: 'video',
            contentSummary: 'Cómo usar prompts precisos para resolver problemas de negocio en minutos.',
            keyTakeaways: ['Estructura de un prompt profesional', 'Automatización de redacción y análisis de datos']
          }
        ]
      }
    ],
    certificateAvailable: true,
    enrolledStudents: 3100,
    rating: 4.98
  }
];

export const DIGITAL_SHOWCASE_PRODUCTS: ProductShowcase[] = [
  {
    id: 'prod-1',
    name: 'Café Especial Geisha y Castillo "Montaña Dorada"',
    brandName: 'Café Origen Pereira',
    artisanOrCreator: 'Familia Morales Echeverri (Vereda La Florida)',
    originRegion: 'Pereira',
    territoryKey: 'pereira',
    category: 'Café & Agroindustria',
    price: 38000,
    originalPrice: 45000,
    description: 'Café 100% arábica de altura (1.750 msnm), proceso Honey con notas a caramelo, jazmín y frutos rojos. Tostión media artesanal con sello Hecho en Pereira.',
    story: 'Cultivado por 3 generaciones de caficultores en las faldas del Parque Nacional Los Nevados, empacado en empaque biodegradable que conserva todo el aroma.',
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
    badge: 'Hecho en Pereira',
    rating: 4.9,
    reviewsCount: 142,
    whatsappContact: '+573105550192',
    tags: ['Café Especial', 'Exportación', 'Orgánico', 'Pereira', 'Risaralda'],
    inStock: true
  },
  {
    id: 'prod-quindio-1',
    name: 'Café de Origen Cordillera & Panela Granulada Agroecológica',
    brandName: 'Hacienda San Jerónimo Filandia',
    artisanOrCreator: 'Asociación de Caficultores de Salento & Filandia',
    originRegion: 'Quindío',
    territoryKey: 'quindio',
    category: 'Café & Agroindustria',
    price: 42000,
    originalPrice: 48000,
    description: 'Taza limpia con notas a panela, naranja y chocolate amargo. Cosechado a mano en el corazón del Paisaje Cultural Cafetero del Quindío.',
    story: 'Emprendimiento campesino que promueve el comercio justo y el turismo regenerativo en Salento, Filandia y Calarcá.',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    badge: 'Hecho en Quindío',
    rating: 4.95,
    reviewsCount: 118,
    whatsappContact: '+573125550233',
    tags: ['Café Quindío', 'Salento', 'Filandia', 'Comercio Justo'],
    inStock: true
  },
  {
    id: 'prod-caldas-1',
    name: 'Sombreros de Aguadas Tejidos a Mano en Palma de Iraca',
    brandName: 'Artesanas de la Niebla Aguadas',
    artisanOrCreator: 'Cooperativa de Tejedoras de Aguadas y Salamina',
    originRegion: 'Caldas',
    territoryKey: 'caldas',
    category: 'Artesanías & Moda',
    price: 165000,
    originalPrice: 195000,
    description: 'Sombrero aguadeño tradicional de ala ancha con denominación de origen protegida. Tejido en hebras extrafinas de iraca.',
    story: 'Tradición de más de un siglo que sustenta a más de 300 familias rurales en las montañas del norte de Caldas.',
    imageUrl: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=600&q=80',
    badge: 'Hecho en Caldas',
    rating: 5.0,
    reviewsCount: 92,
    whatsappContact: '+573155550344',
    tags: ['Sombrero Aguadeño', 'Iraca', 'Aguadas', 'Caldas'],
    inStock: true
  },
  {
    id: 'prod-cali-1',
    name: 'Manjar Blanco Tradicional y Dulces Vallecaucanos',
    brandName: 'Dulces & Sabores del Valle',
    artisanOrCreator: 'Tradición Palmira y El Cerrito',
    originRegion: 'Cali & Valle',
    territoryKey: 'cali_valle',
    category: 'Alimentos Típicos',
    price: 28000,
    originalPrice: 32000,
    description: 'Receta ancestral en paila de cobre con leche entera y azúcar de caña virgen. Acompañado de colaciones y desamargado.',
    story: 'Microempresa familiar del Valle del Cauca que abastece a Cali, Yumbo, Jamundí y Palmira conservando la gastronomía auténtica.',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    badge: 'Hecho en Cali & Valle',
    rating: 4.88,
    reviewsCount: 164,
    whatsappContact: '+573175550455',
    tags: ['Manjar Blanco', 'Cali', 'Palmira', 'Valle del Cauca'],
    inStock: true
  },
  {
    id: 'prod-cali-2',
    name: 'Calzado y Bolsos en Cuero Genuino Hecho en Cali',
    brandName: 'Marroquinería San Nicolás Cali',
    artisanOrCreator: 'Taller de Zapateros del Barrio Obrero & San Nicolás',
    originRegion: 'Cali & Valle',
    territoryKey: 'cali_valle',
    category: 'Artesanías & Moda',
    price: 135000,
    originalPrice: 160000,
    description: 'Calzado ergonómico y accesorios en cuero de curtiembre certificada con costuras reforzadas.',
    story: 'Gremio de artesanos del calzado caleño reactivando el empleo de jóvenes y adultos mayores con diseño contemporáneo.',
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
    badge: 'Hecho en Cali & Valle',
    rating: 4.92,
    reviewsCount: 105,
    whatsappContact: '+573165550566',
    tags: ['Cuero', 'Calzado Cali', 'San Nicolás', 'Jamundí'],
    inStock: true
  },
  {
    id: 'prod-2',
    name: 'Aretes y Collar en Filigrana de Plata y Oro Ancestral',
    brandName: 'Joyería Étnica Atrato',
    artisanOrCreator: 'Maestros Joyeros de Condoto y Quibdó',
    originRegion: 'Chocó',
    territoryKey: 'choco',
    category: 'Joyas & Filigrana',
    price: 185000,
    originalPrice: 220000,
    description: 'Piezas únicas tejidas a mano hilo por hilo utilizando la técnica tradicional de la filigrana chocoana declarada patrimonio inmaterial.',
    story: 'Elaboradas por mujeres y hombres orfebres del Chocó utilizando metales éticos y técnicas transmitidas de generación en generación que celebran la biodiversidad del río Atrato.',
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    badge: 'Hecho en Chocó',
    rating: 5.0,
    reviewsCount: 88,
    whatsappContact: '+573145550183',
    tags: ['Filigrana', 'Plata 925', 'Artesanía Étnica', 'Chocó'],
    inStock: true
  },
  {
    id: 'prod-3',
    name: 'Cesto Tradicional Tejido en Palma de Werregue',
    brandName: 'Artesanías Wounaan del Chocó',
    artisanOrCreator: 'Comunidad Indígena Wounaan Phubur',
    originRegion: 'Chocó',
    territoryKey: 'choco',
    category: 'Artesanías & Moda',
    price: 145000,
    description: 'Cesto decorativo tejido a mano con fibras de palma de werregue teñidas naturalmente con cortezas, semillas y hojas de la selva tropical.',
    story: 'Cada patrón geométrico representa historias de la cosmogonía indígena, los ríos y los espíritus protectores de la selva del Pacífico colombiano.',
    imageUrl: 'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?auto=format&fit=crop&w=600&q=80',
    badge: 'Hecho en Chocó',
    rating: 4.9,
    reviewsCount: 64,
    whatsappContact: '+573125550144',
    tags: ['Werregue', 'Tejido Indígena', 'Decoración', 'Chocó'],
    inStock: true
  },
  {
    id: 'prod-4',
    name: 'Chaqueta en Dril y Bordado Paisaje Cafetero',
    brandName: 'Moda Pereira Urbana',
    artisanOrCreator: 'Taller de Confecciones Las Camelias',
    originRegion: 'Pereira',
    territoryKey: 'pereira',
    category: 'Artesanías & Moda',
    price: 125000,
    originalPrice: 150000,
    description: 'Chaqueta de diseño contemporáneo confeccionada en algodón 100% con bordados representativos de la arquitectura de la colonización antioqueña y el café.',
    story: 'Taller fundado por 12 madres cabeza de familia en el barrio Cuba de Pereira, produciendo moda ética con acabado de calidad internacional.',
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
    badge: 'Hecho en Pereira',
    rating: 4.8,
    reviewsCount: 95,
    whatsappContact: '+573185550119',
    tags: ['Moda', 'Confección Pereira', 'Algodón', 'Bordados'],
    inStock: true
  },
  {
    id: 'prod-5',
    name: 'Mermelada y Pulpa Concentrada de Borojó & Chontaduro',
    brandName: 'Frutos del Pacífico Bio',
    artisanOrCreator: 'Asociación Agroecológica del Medio San Juan',
    originRegion: 'Chocó',
    territoryKey: 'choco',
    category: 'Alimentos Típicos',
    price: 24000,
    description: 'Superalimento natural sin conservantes químicos. Alto contenido energético, fósforo y vitaminas, endulzado suavemente con panela orgánica.',
    story: 'Recolectado de manera silvestre y sostenible bajo el dosel selvático del Chocó biogeográfico, apoyando la economía de familias afrodescendientes.',
    imageUrl: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=600&q=80',
    badge: 'Hecho en Chocó',
    rating: 4.9,
    reviewsCount: 110,
    whatsappContact: '+573135550125',
    tags: ['Borojó', 'Chontaduro', 'Superalimento', 'Pacífico'],
    inStock: true
  },
  {
    id: 'prod-6',
    name: 'Software POS y Facturación Electrónica para Comercios',
    brandName: 'Pereira Digital Solutions',
    artisanOrCreator: 'Ing. Mateo Ceballos & Equipo',
    originRegion: 'Pereira',
    territoryKey: 'pereira',
    category: 'Tecnología & Servicios',
    price: 89000,
    description: 'Sistema en la nube para control de inventarios, ventas e integración automática con DIAN para micro y pequeñas empresas del Eje Cafetero y Valle.',
    story: 'Desarrollado en Pereira por jóvenes egresados de la UTP para ayudar a tenderos y comerciantes a modernizar su negocio sin complicaciones.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    badge: 'Hecho en Pereira',
    rating: 4.95,
    reviewsCount: 76,
    whatsappContact: '+573165550177',
    tags: ['Software', 'Facturación', 'POS', 'Pereira Tech'],
    inStock: true
  }
];

export const CREDIT_PROGRAMS: CreditOption[] = [
  {
    id: 'cred-micro-1',
    name: 'Microcrédito Semilla Independiente',
    targetRole: 'Emprendedor Independiente',
    category: 'microcredito',
    minAmount: 500000,
    maxAmount: 15000000,
    interestRateMonthly: 1.15,
    gracePeriodMonths: 2,
    termMonthsOptions: [6, 12, 18, 24, 36],
    requirements: [
      'Cédula de ciudadanía colombiana o permiso de permanencia.',
      'Descripción de la actividad independiente o idea de negocio en Quindío, Risaralda, Caldas, Valle o Chocó.',
      'Sin requerimiento de historial crediticio bancario previo.',
      'Validación de identidad por entidad de confianza aliada (Cámaras de Comercio / SENA).'
    ],
    features: [
      'Desembolso rápido en 24 a 48 horas tras aprobación.',
      'Hasta 2 meses de período de gracia en capital para iniciar compras.',
      'Acompañamiento y asesoría gratuita en finanzas básicas.'
    ],
    backedBy: 'Fondo de Emprendimiento Solidario & Confiar'
  },
  {
    id: 'cred-blando-1',
    name: 'Crédito Empresarial con 6 Meses de Gracia (Tasa Blanda)',
    targetRole: 'Microempresa & Negocio',
    category: 'credito_blando',
    minAmount: 5000000,
    maxAmount: 120000000,
    interestRateMonthly: 0.78, // Tasa blanda preferencial
    gracePeriodMonths: 6, // 6 MESES DE GRACIA EXACTOS
    termMonthsOptions: [18, 24, 36, 48, 60],
    requirements: [
      'Negocio en funcionamiento mínimo de 4 a 6 meses en Pereira, Risaralda, Quindío, Caldas, Cali o Chocó.',
      'RUT o registro de Cámara de Comercio (o acompañamiento para formalización).',
      'Reporte simple de ingresos y egresos de los últimos meses.',
      'Plan de inversión (maquinaria, nómina, insumos o diversificación).'
    ],
    features: [
      '✨ PERÍODO DE GRACIA DE 6 MESES: Comienzas a pagar tu primera cuota de amortización en el mes 7.',
      'Tasa de interés preferencial subsidiada por convenios regionales del Eje Cafetero y Valle.',
      'Diagnóstico gratuito con el Optimizador de Negocios de la plataforma.',
      'Sin penalidad por pago anticipado o abonos extraordinarios.'
    ],
    backedBy: 'Banca de Fomento Regional, CCP, Cámaras Aliadas & Red Solidaria'
  },
  {
    id: 'cred-pyme-exp',
    name: 'Crédito de Expansión PYME y Gran Empresa Regional',
    targetRole: 'PYME & Gran Empresa',
    category: 'credito_blando',
    minAmount: 30000000,
    maxAmount: 500000000,
    interestRateMonthly: 0.65,
    gracePeriodMonths: 6,
    termMonthsOptions: [24, 36, 48, 60, 72],
    requirements: [
      'Estados financieros de los últimos 2 periodos.',
      'Cámara de Comercio vigente (Pereira, Manizales, Armenia, Cali o Quibdó).',
      'Proyecto de ampliación de planta, tecnología o exportación.'
    ],
    features: [
      '6 meses de gracia para puesta en marcha de infraestructura.',
      'Línea especial para proyectos que generen empleo en Pereira, Risaralda, Quindío, Caldas, Cali y Chocó.',
      'Asesoría técnica para certificaciones de calidad y marca de origen.'
    ],
    backedBy: 'Fondo Nacional de Garantías, Banca Regional & Red Empresarial'
  }
];

export const SKILL_QUESTIONS: SkillQuestion[] = [
  {
    id: 'q1',
    category: 'Construcción',
    question: 'Cuando se presenta una remodelación o trabajo físico en una vivienda o local, ¿qué tanta familiaridad tienes?',
    options: [
      { label: 'Puedo interpretar planos, calcular mezclas y coordinar el proceso constructivo con seguridad.', skillTag: 'Construcción Avanzada & Supervisión', weight: 4 },
      { label: 'Tengo experiencia práctica pegando ladrillos, pintando o realizando acabados básicos.', skillTag: 'Albañilería & Acabados', weight: 3 },
      { label: 'Conozco las herramientas básicas y aprendo rápido siguiendo instrucciones.', skillTag: 'Ayudante de Obra & Operativo', weight: 2 },
      { label: 'Poca experiencia física, me enfoco más en la gestión y planificación.', skillTag: 'Gestión y Planificación', weight: 1 }
    ]
  },
  {
    id: 'q2',
    category: 'Electricidad',
    question: 'Frente a una falla eléctrica (corto circuito, cambio de interruptores o instalación de luces):',
    options: [
      { label: 'Sé diagnosticar con multímetro, balancear cargas en el tablero y aplicar normas RETIE.', skillTag: 'Electricidad Técnica & RETIE', weight: 4 },
      { label: 'Puedo cambiar tomas, interruptores y cablear circuitos sencillos con seguridad.', skillTag: 'Instalaciones Eléctricas Básicas', weight: 3 },
      { label: 'Entiendo la teoría pero prefiero trabajar bajo supervisión de un técnico.', skillTag: 'Mantenimiento Electromecánico Inicial', weight: 2 },
      { label: 'No tengo experiencia con voltajes, prefiero otras áreas.', skillTag: 'Sin afinidad eléctrica', weight: 0 }
    ]
  },
  {
    id: 'q3',
    category: 'Tecnología',
    question: 'En el manejo de computadores, internet, aplicaciones y herramientas digitales:',
    options: [
      { label: 'Manejo programación, herramientas web, análisis de datos o soporte técnico avanzado.', skillTag: 'Tecnología & Desarrollo Web', weight: 4 },
      { label: 'Uso con fluidez hojas de cálculo (Excel), redes sociales comerciales y herramientas en la nube.', skillTag: 'Habilidades Digitales & Operaciones', weight: 3 },
      { label: 'Manejo lo básico en el celular (WhatsApp, correo) y tengo mucho interés en aprender más.', skillTag: 'Alfabetización Digital', weight: 2 },
      { label: 'Se me dificulta la tecnología, pero quiero capacitarme paso a paso.', skillTag: 'Iniciación Digital', weight: 1 }
    ]
  },
  {
    id: 'q4',
    category: 'Resolución de Problemas',
    question: 'Cuando surge un imprevisto difícil o se retrasa un proyecto:',
    options: [
      { label: 'Analizo la causa raíz, organizo al equipo y propongo 2 o 3 alternativas de solución de inmediato.', skillTag: 'Liderazgo & Solución de Problemas', weight: 4 },
      { label: 'Mantengo la calma, busco ayuda experta y me pongo manos a la obra para corregirlo.', skillTag: 'Resiliencia & Trabajo en Equipo', weight: 3 },
      { label: 'Sigo el protocolo establecido al pie de la letra para evitar errores mayores.', skillTag: 'Apego a Procesos & Calidad', weight: 3 },
      { label: 'A veces me estreso, pero cumplo con lo que me soliciten.', skillTag: 'Ejecución Operativa', weight: 2 }
    ]
  },
  {
    id: 'q5',
    category: 'Liderazgo & Comunicación',
    question: 'En tus relaciones de trabajo y trato con clientes o compañeros:',
    options: [
      { label: 'Tengo facilidad para vender ideas, negociar con clientes y motivar a otras personas.', skillTag: 'Ventas & Comunicación Persuasiva', weight: 4 },
      { label: 'Escucho con atención, explico con claridad y brindo un excelente servicio.', skillTag: 'Servicio al Cliente & Empatía', weight: 4 },
      { label: 'Prefiero tareas técnicas individuales donde el resultado hable por sí solo.', skillTag: 'Enfoque Técnico Individual', weight: 3 },
      { label: 'Me adapto rápidamente al ambiente y colaboro con buena actitud.', skillTag: 'Adaptabilidad & Colaboración', weight: 3 }
    ]
  }
];
