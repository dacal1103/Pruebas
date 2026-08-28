import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, ProductShowcase, BusinessOptimizationResult } from '../types';

interface AppContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  switchRole: (role: UserRole) => void;
  selectedTerritory: 'pereira' | 'choco' | 'colombia';
  setSelectedTerritory: (territory: 'pereira' | 'choco' | 'colombia') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  selectedProduct: ProductShowcase | null;
  setSelectedProduct: (prod: ProductShowcase | null) => void;
  appliedJobs: string[];
  applyToJob: (jobId: string) => boolean;
  enrolledCourses: Record<string, number>;
  enrollInCourse: (courseId: string) => void;
  completeLesson: (courseId: string, lessonId: string) => void;
  cart: Array<{ product: ProductShowcase; quantity: number }>;
  addToCart: (product: ProductShowcase) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  customProducts: ProductShowcase[];
  addCustomProduct: (product: ProductShowcase) => void;
  validatedSkills: string[];
  addValidatedSkills: (skills: string[]) => void;
  lastOptimization: BusinessOptimizationResult | null;
  setLastOptimization: (res: BusinessOptimizationResult | null) => void;
  savedSimulations: any[];
  addSimulation: (sim: any) => void;
}

const defaultUser: UserProfile = {
  id: 'usr-1',
  name: 'Carolina Orozco',
  email: 'carolina.orozco@impulsa.co',
  phone: '+57 312 456 7890',
  city: 'Pereira',
  department: 'Risaralda',
  role: 'independiente',
  isVerified: true,
  verifiedEntityId: 'ent-1',
  skills: ['Ventas & Comunicación', 'Instalaciones Eléctricas Básicas', 'Gestión de Costos', 'Optimización de Procesos'],
  registeredAt: '2026-01-15'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('impulsa_user');
    return saved ? JSON.parse(saved) : defaultUser;
  });

  const [selectedTerritory, setSelectedTerritory] = useState<'pereira' | 'choco' | 'colombia'>('pereira');
  const [activeTab, setActiveTab] = useState<string>('inicio');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductShowcase | null>(null);

  const [appliedJobs, setAppliedJobs] = useState<string[]>(() => {
    const saved = localStorage.getItem('impulsa_applied_jobs');
    return saved ? JSON.parse(saved) : ['job-1'];
  });

  const [enrolledCourses, setEnrolledCourses] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('impulsa_courses');
    return saved ? JSON.parse(saved) : { 'course-tech-1': 35 };
  });

  const [cart, setCart] = useState<Array<{ product: ProductShowcase; quantity: number }>>(() => {
    const saved = localStorage.getItem('impulsa_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [customProducts, setCustomProducts] = useState<ProductShowcase[]>(() => {
    const saved = localStorage.getItem('impulsa_custom_prods');
    return saved ? JSON.parse(saved) : [];
  });

  const [validatedSkills, setValidatedSkills] = useState<string[]>(() => {
    const saved = localStorage.getItem('impulsa_skills');
    return saved ? JSON.parse(saved) : ['Organización de Procesos', 'Atención al Cliente'];
  });

  const [lastOptimization, setLastOptimization] = useState<BusinessOptimizationResult | null>(() => {
    try {
      const saved = localStorage.getItem('impulsa_opt');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.financialSummary) {
          return parsed;
        }
      }
    } catch (_) {}
    return null;
  });

  const [savedSimulations, setSavedSimulations] = useState<any[]>(() => {
    const saved = localStorage.getItem('impulsa_sims');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('impulsa_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('impulsa_applied_jobs', JSON.stringify(appliedJobs));
  }, [appliedJobs]);

  useEffect(() => {
    localStorage.setItem('impulsa_courses', JSON.stringify(enrolledCourses));
  }, [enrolledCourses]);

  useEffect(() => {
    localStorage.setItem('impulsa_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('impulsa_custom_prods', JSON.stringify(customProducts));
  }, [customProducts]);

  useEffect(() => {
    localStorage.setItem('impulsa_skills', JSON.stringify(validatedSkills));
  }, [validatedSkills]);

  useEffect(() => {
    if (lastOptimization) {
      localStorage.setItem('impulsa_opt', JSON.stringify(lastOptimization));
    }
  }, [lastOptimization]);

  useEffect(() => {
    localStorage.setItem('impulsa_sims', JSON.stringify(savedSimulations));
  }, [savedSimulations]);

  const switchRole = (role: UserRole) => {
    setUser(prev => ({ ...prev, role }));
  };

  const applyToJob = (jobId: string) => {
    if (appliedJobs.includes(jobId)) return false;
    setAppliedJobs(prev => [...prev, jobId]);
    return true;
  };

  const enrollInCourse = (courseId: string) => {
    if (!enrolledCourses[courseId]) {
      setEnrolledCourses(prev => ({ ...prev, [courseId]: 10 }));
    }
  };

  const completeLesson = (courseId: string, _lessonId: string) => {
    setEnrolledCourses(prev => {
      const current = prev[courseId] || 0;
      const updated = Math.min(100, current + 25);
      return { ...prev, [courseId]: updated };
    });
  };

  const addToCart = (product: ProductShowcase) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as Array<{ product: ProductShowcase; quantity: number }>;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const addCustomProduct = (product: ProductShowcase) => {
    setCustomProducts(prev => [product, ...prev]);
  };

  const addValidatedSkills = (skills: string[]) => {
    setValidatedSkills(prev => Array.from(new Set([...prev, ...skills])));
    setUser(prev => ({
      ...prev,
      skills: Array.from(new Set([...prev.skills, ...skills]))
    }));
  };

  const addSimulation = (sim: any) => {
    setSavedSimulations(prev => [sim, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        switchRole,
        selectedTerritory,
        setSelectedTerritory,
        activeTab,
        setActiveTab,
        isCartOpen,
        setIsCartOpen,
        selectedProduct,
        setSelectedProduct,
        appliedJobs,
        applyToJob,
        enrolledCourses,
        enrollInCourse,
        completeLesson,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        customProducts,
        addCustomProduct,
        validatedSkills,
        addValidatedSkills,
        lastOptimization,
        setLastOptimization,
        savedSimulations,
        addSimulation
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
