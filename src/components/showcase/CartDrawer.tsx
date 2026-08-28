import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  Trash2,
  X,
  Plus,
  Minus,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Truck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateCartQuantity, clearCart, user } = useApp();
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'success'>('cart');
  const [shippingAddress, setShippingAddress] = useState('Carrera 7 # 19-45, Pereira');
  const [paymentMethod, setPaymentMethod] = useState<'nequi' | 'pse' | 'card'>('pse');

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shippingCost = subtotal > 100000 || cart.length === 0 ? 0 : 12000;
  const total = subtotal + shippingCost;

  const handleFinishPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep('success');
    try {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
    } catch (_) {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base font-display">
              Tu Pedido Regional ({cart.reduce((a, b) => a + b.quantity, 0)})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {checkoutStep === 'success' ? (
            <div className="py-12 flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 font-display">
                ¡Gracias por apoyar a nuestra gente!
              </h4>
              <p className="text-slate-600 leading-relaxed text-xs">
                Tu pedido ha sido confirmado. Los productores y artesanos de Pereira y Chocó están preparando tus productos con dedicación.
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl w-full text-left space-y-1 text-[11px] text-slate-700">
                <div>📦 Guía de rastreo: <strong>IMP-{Math.floor(100000 + Math.random() * 900000)}</strong></div>
                <div>📍 Dirección de entrega: {shippingAddress}</div>
                <div>💳 Método de pago: {paymentMethod.toUpperCase()}</div>
              </div>
              <button
                onClick={() => {
                  clearCart();
                  setCheckoutStep('cart');
                  onClose();
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
              >
                Seguir Explorando
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <p className="font-semibold text-slate-600">Tu carrito está vacío</p>
              <p className="text-[11px]">Explora los productos de Pereira y Chocó para agregarlos.</p>
            </div>
          ) : checkoutStep === 'cart' ? (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex gap-3 items-center"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-14 h-14 object-cover rounded-lg shrink-0"
                  />
                  <div className="flex-1 space-y-0.5">
                    <span className="text-[10px] font-bold text-emerald-700">{item.product.badge}</span>
                    <h5 className="font-bold text-slate-900 line-clamp-1">{item.product.name}</h5>
                    <div className="text-slate-500 text-[11px]">
                      ${item.product.price.toLocaleString('es-CO')} COP
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="p-0.5 text-slate-500 hover:text-slate-900"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-xs px-1">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="p-0.5 text-slate-500 hover:text-slate-900"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Shipping and Payment Form */
            <form id="checkout-form" onSubmit={handleFinishPurchase} className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nombre del Destinatario:</label>
                <input
                  type="text"
                  defaultValue={user.name}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Dirección de Entrega:</label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700">Método de Pago:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'pse', label: 'PSE / Bancolombia' },
                    { id: 'nequi', label: 'Nequi / Daviplata' },
                    { id: 'card', label: 'Tarjeta Crédito' }
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-2 rounded-xl text-center font-bold text-[11px] border cursor-pointer ${
                        paymentMethod === pm.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Pago 100% protegido con transferencia directa al artesano.</span>
              </div>
            </form>
          )}
        </div>

        {/* Drawer Footer / Summary */}
        {cart.length > 0 && checkoutStep !== 'success' && (
          <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-3 text-xs">
            <div className="space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-900">${subtotal.toLocaleString('es-CO')} COP</span>
              </div>
              <div className="flex justify-between">
                <span>Envío Nacional:</span>
                <span className="font-bold text-emerald-700">
                  {shippingCost === 0 ? '¡Gratis!' : `$${shippingCost.toLocaleString('es-CO')} COP`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                <span>Total a Pagar:</span>
                <span className="text-emerald-700">${total.toLocaleString('es-CO')} COP</span>
              </div>
            </div>

            {checkoutStep === 'cart' ? (
              <button
                id="go-to-checkout-btn"
                onClick={() => setCheckoutStep('shipping')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Proceder al Pago</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600"
                >
                  Atrás
                </button>
                <button
                  form="checkout-form"
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Confirmar Compra
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
