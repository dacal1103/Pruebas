import React from 'react';
import { ProductShowcase } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  ShoppingBag,
  Star,
  MapPin,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  Truck,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProductDetailModalProps {
  product: ProductShowcase | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart } = useApp();

  if (!product) return null;

  const handleBuy = () => {
    addToCart(product);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (_) {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
          {/* Image & Badges */}
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 relative shadow-sm">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span
                className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-bold rounded-lg shadow-md ${
                  product.badge === 'Hecho en Pereira'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {product.badge}
              </span>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1 text-emerald-800">
                <Truck className="w-4 h-4 text-emerald-600" /> Envío a toda Colombia
              </div>
              <p className="text-[11px] text-emerald-700">Empacado con altos estándares de conservación y sello de autenticidad.</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center gap-2 text-slate-500 font-semibold mb-1">
                <span>{product.category}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> {product.originRegion}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 font-display">
                {product.name}
              </h2>
              <p className="text-emerald-800 font-bold mt-0.5">
                Marca: {product.brandName} &bull; Por {product.artisanOrCreator}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-slate-800 text-sm">{product.rating}</span>
              </div>
              <span className="text-slate-400">({product.reviewsCount} opiniones de compradores verificados)</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Precio Oficial</div>
              <div className="text-2xl font-extrabold text-slate-900 font-display">
                ${product.price.toLocaleString('es-CO')} COP
              </div>
            </div>

            <div className="space-y-1.5 text-slate-700">
              <h4 className="font-bold text-slate-900">Descripción:</h4>
              <p className="leading-relaxed">{product.description}</p>
            </div>

            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
              <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Historia de Origen & Impacto Social:
              </h4>
              <p className="text-amber-900 leading-relaxed text-[11px]">
                {product.story}
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleBuy}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Agregar al Carrito de Compras</span>
              </button>

              <a
                href={`https://wa.me/${product.whatsappContact.replace('+', '')}?text=Hola,%20vi%20tu%20producto%20"${encodeURIComponent(product.name)}"%20en%20la%20vitrina%20de%20Impulsa%20Regional%20y%20quiero%20hacer%20un%20pedido.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Hablar Directamente con el Productor (WhatsApp)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
