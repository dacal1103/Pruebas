/**
 * Data structures for Impulsa & OptiLogic Regional
 * Unified Platform: Operations Research, Decision Intelligence & Regional Socioeconomic Ecosystem
 */

// ==========================================
// 1. OPERATIONS RESEARCH & LINEAR PROGRAMMING
// ==========================================

export type VariableType = 'continuous' | 'integer' | 'binary';
export type OptimizationType = 'maximize' | 'minimize';
export type ConstraintOperator = '<=' | '>=' | '==';
export type ConstraintStatus = 'binding' | 'slack' | 'surplus' | 'infeasible';

export interface SetDefinition {
  id: string;
  name: string;
  symbol: string;
  description: string;
  elements: string[];
}

export interface ParameterDefinition {
  id: string;
  name: string;
  symbol: string;
  value: number;
  unit: string;
  description: string;
  category: 'cost' | 'revenue' | 'capacity' | 'technical' | 'demand' | 'time' | 'other';
  min?: number;
  max?: number;
  step?: number;
}

export interface DecisionVariable {
  id: string;
  name: string;
  symbol: string;
  unit: string;
  description: string;
  type: VariableType;
  lowerBound: number;
  upperBound?: number;
  optimalValue?: number;
  reducedCost?: number;
}

export interface ObjectiveFunction {
  type: OptimizationType;
  name: string;
  description: string;
  expressionLatex: string;
  coefficients: Record<string, number>; // variableId -> coefficient
  constant?: number;
}

export interface BusinessConstraint {
  id: string;
  name: string;
  description: string;
  category: 'capacity' | 'demand' | 'material_balance' | 'quality' | 'financial' | 'policy';
  expressionLatex: string;
  coefficients: Record<string, number>; // variableId -> coefficient
  operator: ConstraintOperator;
  rhs: number;
  unit: string;
  lhsValue?: number;
  slackValue?: number;
  shadowPrice?: number;
  status?: ConstraintStatus;
  utilizationPercent?: number;
  explanation?: string;
}

export interface LPModel {
  id: string;
  problemTitle: string;
  problemSummary: string;
  businessContext: string;
  sets: SetDefinition[];
  parameters: ParameterDefinition[];
  variables: DecisionVariable[];
  objective: ObjectiveFunction;
  constraints: BusinessConstraint[];
  orToolsPythonCode: string;
  orToolsSolverName: 'GLOP' | 'CBC' | 'SCIP';
}

export interface OptimizationResult {
  status: 'OPTIMAL' | 'FEASIBLE' | 'INFEASIBLE' | 'UNBOUNDED' | 'ERROR';
  objectiveValue: number;
  variableResults: Array<{
    id: string;
    symbol: string;
    name: string;
    value: number;
    unit: string;
    reducedCost: number;
  }>;
  constraintResults: Array<{
    id: string;
    name: string;
    operator: ConstraintOperator;
    rhs: number;
    lhs: number;
    slack: number;
    shadowPrice: number;
    status: ConstraintStatus;
    utilizationPercent: number;
    unit: string;
    interpretation: string;
  }>;
  bottlenecks: string[];
  availableResources: string[];
  executiveSummary: string;
  managerialRecommendations: string[];
  solvedAt: string;
}

export interface AgentLog {
  agentName: string;
  role: string;
  avatar: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message: string;
  details?: string;
  timestamp: string;
}

export interface GraphicalMethodPoint {
  x: number;
  y: number;
  zValue: number;
  isFeasible: boolean;
  isOptimal: boolean;
  intersectingConstraints: string[];
  label?: string;
}

export interface PresetBusinessProblem {
  id: string;
  title: string;
  industry: string;
  difficulty: 'Básico (2 Variables)' | 'Intermedio (3-4 Variables)' | 'Avanzado (Cadena/Finanzas)';
  shortDescription: string;
  fullNarrative: string;
  tags: string[];
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  importance: 'critical' | 'recommended' | 'optional';
  context: string;
  suggestedOptions: string[];
  defaultAssumption: string;
  userAnswer?: string;
}

export interface ProblemAudit {
  completenessScore: number;
  summaryOfUnderstanding: string;
  detectedObjective: string;
  detectedVariables: Array<{
    name: string;
    estimatedUnit: string;
    role: string;
  }>;
  detectedConstraints: Array<{
    name: string;
    resourceType: string;
    isComplete: boolean;
  }>;
  clarificationQuestions: ClarificationQuestion[];
  isReadyToFormulate: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  quickSuggestions?: string[];
  extractionState?: ExtractionState;
  retrievedVectors?: Array<{
    title: string;
    category?: string;
    similarity?: number;
    matchedSnippet?: string;
  }>;
  savedVectorFacts?: Array<{
    id: string;
    title: string;
    category: string;
    content: string;
  }>;
}

export interface ExtractionState {
  completenessScore: number;
  detectedObjective: string;
  detectedVariables: Array<{
    name: string;
    unit?: string;
    coefficientEstimate?: string;
  }>;
  detectedConstraints: Array<{
    name: string;
    limit?: string;
    type?: string;
  }>;
  missingInfoPoints: string[];
  quickSuggestions: string[];
  isReadyToFormulate: boolean;
}

// ==========================================
// 2. VECTOR DATABASE & RAG MEMORY
// ==========================================

export type VectorCategory =
  | 'profile'
  | 'resource'
  | 'product'
  | 'financial'
  | 'constraint'
  | 'policy'
  | 'document'
  | 'scenario'
  | 'conversation';

export interface VectorRecord {
  id: string;
  title: string;
  category: VectorCategory;
  content: string;
  embedding?: number[];
  dimensions: number;
  similarityScore?: number;
  metadata: {
    companyName?: string;
    unit?: string;
    value?: number;
    tags?: string[];
    source?: string;
    dateAdded: string;
  };
}

export interface CompanyPlant {
  id: string;
  name: string;
  capacityHoursPerWeek: number;
  laborWorkers: number;
  operatingCostPerHour: number;
}

export interface CompanyProduct {
  id: string;
  name: string;
  sku?: string;
  sellingPrice: number;
  directCost: number;
  netMargin: number;
  maxWeeklyDemand?: number;
  minWeeklyCommitment?: number;
}

export interface CompanyResource {
  id: string;
  name: string;
  totalAvailableWeekly: number;
  unit: string;
  costPerUnit: number;
  criticality: 'Alta' | 'Media' | 'Baja';
}

export interface CompanyProfile {
  id: string;
  companyName: string;
  industry: string;
  businessSummary: string;
  headquarters?: string;
  currency: string;
  plants: CompanyPlant[];
  products: CompanyProduct[];
  resources: CompanyResource[];
  strategicPriorities: string;
  customPolicies: string;
  updatedAt: string;
}

export interface VectorDatabaseStats {
  totalVectors: number;
  categoriesCount: Record<string, number>;
  embeddingModel: string;
  dimensions: number;
  lastSyncAt: string;
  companyName: string;
}

export interface VectorSearchResult {
  record: VectorRecord;
  similarity: number;
  matchedSnippet: string;
}

// ==========================================
// 3. SOCIOECONOMIC & PRODUCTIVE ECOSYSTEM
// ==========================================

export type UserRole = 
  | 'empleado' 
  | 'desempleado' 
  | 'independiente' 
  | 'pequeno_negocio' 
  | 'pyme' 
  | 'gran_empresa';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  department: string;
  role: UserRole;
  verifiedEntityId?: string;
  isVerified: boolean;
  avatarUrl?: string;
  bio?: string;
  skills: string[];
  registeredAt: string;
}

export interface TrustEntity {
  id: string;
  name: string;
  shortName: string;
  category: 'Cámara de Comercio' | 'Educación & Formación' | 'Financiera & Cooperativa' | 'Salud & Bienestar' | 'Gubernamental';
  region: string;
  territoryKey?: string;
  description: string;
  logoBadge: string;
  verifiedCount: number;
  contactUrl: string;
}

export interface JobOffer {
  id: string;
  title: string;
  company: string;
  city: string;
  department?: string;
  territoryKey?: string;
  country: string;
  isRemote: boolean;
  isInternational: boolean;
  contractType: 'Tiempo Completo' | 'Medio Tiempo' | 'Prestación de Servicios' | 'Por Proyecto';
  salary: string;
  currency: 'COP' | 'USD';
  category: 'Tecnología' | 'Construcción' | 'Electricidad' | 'Ventas & Comercio' | 'Administrativo' | 'Operativo';
  skillsRequired: string[];
  experienceLevel: 'Sin experiencia previa' | 'Junior (1-2 años)' | 'Intermedio (2-4 años)' | 'Senior (5+ años)';
  description: string;
  benefits: string[];
  postedAt: string;
  isUrgent?: boolean;
}

export interface CourseLesson {
  id: string;
  title: string;
  durationMinutes: number;
  type: 'video' | 'lectura' | 'taller_practico';
  contentSummary: string;
  keyTakeaways: string[];
  completed?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

export interface TrainingCourse {
  id: string;
  title: string;
  category: 'construccion' | 'electricidad' | 'tecnologia' | 'gestion_negocios';
  badgeLabel: string;
  durationHours: number;
  totalLessons: number;
  level: 'Básico / Inicial' | 'Intermedio' | 'Avanzado Profesional';
  instructor: {
    name: string;
    role: string;
    institution: string;
  };
  description: string;
  learningOutcomes: string[];
  modules: CourseModule[];
  certificateAvailable: boolean;
  enrolledStudents: number;
  rating: number;
}

export interface ProductShowcase {
  id: string;
  name: string;
  brandName: string;
  artisanOrCreator: string;
  originRegion: string;
  territoryKey?: string;
  category: 'Café & Agroindustria' | 'Artesanías & Moda' | 'Joyas & Filigrana' | 'Tecnología & Servicios' | 'Alimentos Típicos';
  price: number;
  originalPrice?: number;
  description: string;
  story: string;
  imageUrl: string;
  badge: string;
  rating: number;
  reviewsCount: number;
  whatsappContact: string;
  tags: string[];
  inStock: boolean;
}

export interface CartItem {
  product: ProductShowcase;
  quantity: number;
}

export interface TerritoryInfo {
  id: string;
  name: string;
  shortName: string;
  department: string;
  municipalities: string[];
  highlight: string;
  chambers: string;
  bannerGradient: string;
  jobCount: number;
  producerCount: number;
  creditFund: string;
  healthLine: string;
  healthPhone: string;
}

export interface CreditOption {
  id: string;
  name: string;
  targetRole: 'Emprendedor Independiente' | 'Microempresa & Negocio' | 'PYME & Gran Empresa';
  category: 'microcredito' | 'credito_blando';
  minAmount: number;
  maxAmount: number;
  interestRateMonthly: number;
  gracePeriodMonths: number;
  termMonthsOptions: number[];
  requirements: string[];
  features: string[];
  backedBy: string;
}

export interface BusinessOptimizationResult {
  financialSummary: {
    estimatedMargin: string;
    breakEvenPoint: string;
    potentialSavingsPercent: string;
    healthStatus: string;
  };
  costOptimizations: Array<{
    area: string;
    suggestion: string;
    potentialSavings: string;
  }>;
  processImprovements: Array<{
    processName: string;
    improvement: string;
    impact: string;
  }>;
  diversificationOpportunities: Array<{
    idea: string;
    description: string;
    targetAudience: string;
    estimatedImplementationTime: string;
  }>;
  executiveAdvice: string;
}

export interface SkillQuestion {
  id: string;
  category: 'Construcción' | 'Electricidad' | 'Tecnología' | 'Resolución de Problemas' | 'Liderazgo & Comunicación';
  question: string;
  options: {
    label: string;
    skillTag: string;
    weight: number;
  }[];
}
