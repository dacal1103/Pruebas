import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DIGITAL_SHOWCASE_PRODUCTS } from '../../data/mockData';
import { ProductShowcase } from '../../types';
import {
  ShoppingBag,
  Sparkles,
  MapPin,
  Heart,
  PlusCircle,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Filter,
  Search,
  Award,
  Star,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DigitalShowcaseSectionProps {
  onOpenProductDetail: (product: ProductShowcase) => void;
}

export const DigitalShowcaseSection: React.FC<DigitalShowcaseSectionProps> = ({ onOpenProductDetail }) => {
  const { customProducts, addCustomProduct, addToCart } = useApp();
  const [selectedRegion, setSelectedRegion] = useState<string>('todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegisteringProduct, setIsRegisteringProduct] = useState(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // New product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdCreator, setNewProdCreator] = useState('');
  const [newProdRegion, setNewProdRegion] = useState<string>('Pereira');
  const [newProdCategory, setNewProdCategory] = useState<any>('Café & Agroindustria');
  const [newProdPrice, setNewProdPrice] = useState(45000);
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdStory, setNewProdStory] = useState('');
  const [newProdWhatsapp, setNewProdWhatsapp] = useState('+573001234567');

  const allProducts = [...customProducts, ...DIGITAL_SHOWCASE_PRODUCTS];

  const filteredProducts = allProducts.filter(p => {
    const matchesRegion = selectedRegion === 'todos' ||
      p.territoryKey === selectedRegion ||
      (selectedRegion === 'pereira' && (p.originRegion === 'Pereira' || p.badge?.includes('Pereira') || p.territoryKey === 'pereira')) ||
      (selectedRegion === 'quindio' && (p.originRegion === 'Quindío' || p.badge?.includes('Quindío') || p.territoryKey === 'quindio')) ||
      (selectedRegion === 'caldas' && (p.originRegion === 'Caldas' || p.badge?.includes('Caldas') || p.territoryKey === 'caldas')) ||
      (selectedRegion === 'cali' && (p.originRegion.includes('Cali') || p.originRegion.includes('Valle') || p.badge?.includes('Cali') || p.territoryKey === 'cali')) ||
      (selectedRegion === 'choco' && (p.originRegion === 'Chocó' || p.badge?.includes('Chocó') || p.territoryKey === 'choco')) ||
      (selectedRegion === 'eje_cafetero' && (p.territoryKey === 'eje_cafetero' || p.territoryKey === 'pereira' || p.territoryKey === 'quindio' || p.territoryKey === 'caldas'));

    const matchesCat = selectedCategory === 'todos' || p.category === selectedCategory;

    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.originRegion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesRegion && matchesCat && matchesSearch;
  });

  const handleAddToCart = (product: ProductShowcase, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setAddedToast(`¡"${product.name}" agregado a tu pedido!`);
    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    } catch (_) {}
    setTimeout(() => setAddedToast(null), 3000);
  };

  const getRegionBadge = (regionName: string) => {
    switch (regionName) {
      case 'Pereira': return 'Hecho en Pereira';
      case 'Quindío': return 'Hecho en Quindío';
      case 'Caldas': return 'Hecho en Caldas';
      case 'Cali & Valle': return 'Hecho en Cali & Valle';
      case 'Chocó': return 'Hecho en Chocó';
      default: return `Hecho en ${regionName}`;
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const badgeName = getRegionBadge(newProdRegion);
    const newProduct: ProductShowcase = {
      id: `custom-prod-${Date.now()}`,
      name: newProdName,
      brandName: newProdBrand || `Marca Propia de ${newProdCreator}`,
      artisanOrCreator: newProdCreator,
      originRegion: newProdRegion as any,
      territoryKey: newProdRegion === 'Cali & Valle' ? 'cali' : newProdRegion.toLowerCase(),
      category: newProdCategory,
      price: Number(newProdPrice),
      description: newProdDesc,
      story: newProdStory || 'Creado con orgullo por manos emprendedoras de nuestra región.',
      imageUrl: newProdRegion === 'Pereira' 
        ? 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
        : newProdRegion === 'Chocó'
        ? 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80',
      badge: badgeName,
      rating: 5.0,
      reviewsCount: 1,
      whatsappContact: newProdWhatsapp,
      tags: ['Marca Propia', newProdRegion, newProdCategory],
      inStock: true
    };

    addCustomProduct(newProduct);
    setIsRegisteringProduct(false);
    setAddedToast(`¡Tu producto con sello "${newProduct.badge}" ha sido publicado en la vitrina!`);
    try {
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    } catch (_) {}
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 border border-emerald-700/40 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Comercio Digital & Marca Propia Regional
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
              Vitrina de Origen: Eje Cafetero, Cali y Chocó
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              Descubre, apoya y compra creaciones auténticas elaboradas por emprendedores y artesanos de <strong>Pereira, Quindío, Caldas, Risaralda, Cali y Chocó</strong>. Envíos nacionales e internacionales con sello de origen.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <button
              id="open-register-product-modal-btn"
              onClick={() => setIsRegisteringProduct(true)}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publicar Mi Producto Regional</span>
            </button>
            <p className="text-[11px] text-emerald-200 text-center">Con sello de origen certificado</p>
          </div>
        </div>

        {/* Region and Search Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'todos', label: 'Todos los Territorios', icon: '🇨🇴' },
              { id: 'pereira', label: 'Pereira', icon: '☕' },
              { id: 'quindio', label: 'Quindío', icon: '🌴' },
              { id: 'caldas', label: 'Caldas', icon: '🌋' },
              { id: 'cali', label: 'Cali y Valle', icon: '💃' },
              { id: 'choco', label: 'Chocó', icon: '🌊' }
            ].map((reg) => (
              <button
                key={reg.id}
                id={`filter-reg-${reg.id}`}
                onClick={() => setSelectedRegion(reg.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer ${
                  selectedRegion === reg.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <span>{reg.icon}</span>
                <span>{reg.label}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar café, filigrana, sombreros, calzado..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-hidden focus:bg-white/20"
            />
          </div>
        </div>
      </div>

      {/* Added Toast Notification */}
      {addedToast && (
        <div className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>{addedToast}</span>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
        <span className="text-slate-500 font-bold mr-1 shrink-0">Categoría:</span>
        {[
          'todos',
          'Café & Agroindustria',
          'Joyas & Filigrana',
          'Artesanías & Moda',
          'Alimentos Típicos',
          'Tecnología & Servicios'
        ].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {cat === 'todos' ? 'Ver Todas' : cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            onClick={() => onOpenProductDetail(prod)}
            className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition flex flex-col justify-between overflow-hidden group cursor-pointer"
          >
            <div>
              {/* Product Image and Badge */}
              <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  <span
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shadow-md ${
                      prod.badge === 'Hecho en Pereira'
                        ? 'bg-amber-400 text-slate-950'
                        : prod.badge === 'Hecho en Chocó'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-white'
                    }`}
                  >
                    {prod.badge}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-800 flex items-center gap-1 shadow-xs">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{prod.rating}</span>
                  <span className="text-slate-400 font-normal">({prod.reviewsCount})</span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-emerald-800">{prod.category}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> {prod.originRegion}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug font-display group-hover:text-emerald-700 transition">
                  {prod.name}
                </h3>

                <p className="text-xs text-slate-500 font-medium">
                  Por: <strong>{prod.artisanOrCreator}</strong> ({prod.brandName})
                </p>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {prod.description}
                </p>
              </div>
            </div>

            {/* Price & Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Precio Directo</div>
                <div className="text-base font-extrabold text-slate-900 font-display">
                  ${prod.price.toLocaleString('es-CO')} COP
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href={`https://wa.me/${prod.whatsappContact.replace('+', '')}?text=Hola,%20vi%20tu%20producto%20"${encodeURIComponent(prod.name)}"%20en%20Impulsa%20Regional%20y%20quiero%20comprarlo.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition"
                  title="Contactar al productor por WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>

                <button
                  id={`add-cart-btn-${prod.id}`}
                  onClick={(e) => handleAddToCart(prod, e)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Comprar</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Registering a New Regional Product */}
      {isRegisteringProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded">
                  Registro de Marca Propia
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-display mt-2">
                  Publica tu Producto "Hecho en Pereira" o "Hecho en Chocó"
                </h3>
                <p className="text-xs text-slate-500">Expón tus creaciones a compradores nacionales e internacionales.</p>
              </div>
              <button
                onClick={() => setIsRegisteringProduct(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nombre del Producto:</label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Ej: Café Especial Tostión Miel"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nombre de tu Marca:</label>
                  <input
                    type="text"
                    required
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    placeholder="Ej: Café Otún Real"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Región de Origen:</label>
                  <select
                    value={newProdRegion}
                    onChange={(e) => setNewProdRegion(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  >
                    <option value="Pereira">Pereira (Risaralda)</option>
                    <option value="Quindío">Quindío (Armenia & Municipios)</option>
                    <option value="Caldas">Caldas (Manizales & Municipios)</option>
                    <option value="Cali & Valle">Cali y Municipios Aledaños</option>
                    <option value="Chocó">Chocó (Pacífico & Quibdó)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Categoría:</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  >
                    <option>Café & Agroindustria</option>
                    <option>Joyas & Filigrana</option>
                    <option>Artesanías & Moda</option>
                    <option>Alimentos Típicos</option>
                    <option>Tecnología & Servicios</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Precio (COP):</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nombre del Productor / Artesano:</label>
                <input
                  type="text"
                  required
                  value={newProdCreator}
                  onChange={(e) => setNewProdCreator(e.target.value)}
                  placeholder="Tu nombre o el de la familia productora"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Descripción del Producto:</label>
                <textarea
                  rows={2}
                  required
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Materiales, notas de sabor, tallas, acabado..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Historia detrás de tu marca (Impacto social/cultural):</label>
                <textarea
                  rows={2}
                  value={newProdStory}
                  onChange={(e) => setNewProdStory(e.target.value)}
                  placeholder="¿Por qué es especial? ¿A cuántas familias beneficia en Pereira o Chocó?"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">WhatsApp para pedidos:</label>
                <input
                  type="text"
                  required
                  value={newProdWhatsapp}
                  onChange={(e) => setNewProdWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegisteringProduct(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs"
                >
                  Publicar con Sello Oficial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
