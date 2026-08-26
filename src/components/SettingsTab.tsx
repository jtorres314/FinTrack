import React from 'react';
import { Category, RecurringBill, BillFrequency } from '../types';
import { Plus, Trash2, Edit2, RotateCcw, Check, ChevronRight, X } from 'lucide-react';
import { formatCurrency } from '../utils/finance';
import { UserAvatar } from './UserAvatar';

interface SettingsTabProps {
  categories: Category[];
  onAddCategory: (cat: Omit<Category, 'id'>) => void;
  onEditCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
  baseIncome: number;
  baseFixedExpenses: number;
  onUpdateBaseFinances: (income: number, fixed: number) => void;
  cardHolder: string;
  cardNumber: string;
  cardExpiry: string;
  cardFrom: string;
  onUpdateCardDetails: (holder: string, number: string, expiry: string, fromDate: string) => void;
  simulatedDate: string;
  onSetSimulatedDate: (date: string) => void;
  onResetApp: () => void;
  onSimulateBudgetExceeded: () => void;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#EC4899', // Pink
  '#8B5CF6', // Violet
  '#EF4444', // Red
  '#14B8A6', // Teal
  '#64748B', // Slate
];

const PRESET_ICONS = ['Home', 'Utensils', 'Car', 'Tv', 'Zap', 'ShoppingBag', 'Heart', 'Award'];

export function SettingsTab({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  baseIncome,
  baseFixedExpenses,
  onUpdateBaseFinances,
  cardHolder,
  cardNumber,
  cardExpiry,
  cardFrom,
  onUpdateCardDetails,
  simulatedDate,
  onSetSimulatedDate,
  onResetApp,
  onSimulateBudgetExceeded,
}: SettingsTabProps) {
  const [editingCatId, setEditingCatId] = React.useState<string | null>(null);

  // Form State - Category
  const [catName, setCatName] = React.useState('');
  const [catColor, setCatColor] = React.useState(PRESET_COLORS[0]);
  const [catIcon, setCatIcon] = React.useState(PRESET_ICONS[0]);
  const [catBudget, setCatBudget] = React.useState('');

  // Form State - Finances
  const [formIncome, setFormIncome] = React.useState(baseIncome.toString());
  const [formFixed, setFormFixed] = React.useState(baseFixedExpenses.toString());

  // Form State - User profile & Card Customization
  const [formHolder, setFormHolder] = React.useState(cardHolder);
  const [formNumber, setFormNumber] = React.useState(cardNumber);
  const [formExpiry, setFormExpiry] = React.useState(cardExpiry);
  const [formFrom, setFormFrom] = React.useState(cardFrom);

  // Synchronize form inputs with props if updated externally (like resetting)
  React.useEffect(() => {
    setFormHolder(cardHolder);
  }, [cardHolder]);

  React.useEffect(() => {
    setFormNumber(cardNumber);
  }, [cardNumber]);

  React.useEffect(() => {
    setFormExpiry(cardExpiry);
  }, [cardExpiry]);

  React.useEffect(() => {
    setFormFrom(cardFrom);
  }, [cardFrom]);

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCatId) {
      onEditCategory({
        id: editingCatId,
        name: catName.trim(),
        color: catColor,
        icon: catIcon,
        budget: catBudget ? parseFloat(catBudget) : undefined,
      });
      setEditingCatId(null);
    } else {
      onAddCategory({
        name: catName.trim(),
        color: catColor,
        icon: catIcon,
        budget: catBudget ? parseFloat(catBudget) : undefined,
      });
    }

    // Reset Form
    setCatName('');
    setCatColor(PRESET_COLORS[0]);
    setCatIcon(PRESET_ICONS[0]);
    setCatBudget('');
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatColor(cat.color);
    setCatIcon(cat.icon);
    setCatBudget(cat.budget?.toString() || '');
  };

  const handleCancelEdit = () => {
    setEditingCatId(null);
    setCatName('');
    setCatColor(PRESET_COLORS[0]);
    setCatIcon(PRESET_ICONS[0]);
    setCatBudget('');
  };

  return (
    <div className="p-6 space-y-6 pb-24">
      {/* Tab Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Ajustes</h2>
        <p className="text-xs text-slate-500">Configura tus presupuestos, categorías y perfil</p>
      </div>

      {/* Profile & Card Customization */}
      <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Mi Perfil y Tarjeta</h3>
        
        {/* Avatar Display Card */}
        <div className="flex flex-col items-center justify-center py-2 border-b border-slate-50 pb-4">
          <UserAvatar className="w-20 h-20 rounded-full border-2 border-white shadow-lg bg-slate-50 mb-3" />
          <h4 className="text-sm font-bold text-slate-800">{formHolder || 'Titular de Cuenta'}</h4>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Plan FinTrack Standard</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Nombre del Titular</label>
            <input
              type="text"
              value={formHolder}
              onChange={(e) => setFormHolder(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-100 focus:bg-white outline-none font-semibold"
              placeholder="Ej. Anna Kapustina"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Número de Tarjeta</label>
              <input
                type="text"
                value={formNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').substring(0, 16);
                  const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                  setFormNumber(formatted);
                }}
                className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-100 focus:bg-white outline-none font-mono font-bold"
                placeholder="4532 8765 4321 8635"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Vencimiento</label>
              <input
                type="text"
                value={formExpiry}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').substring(0, 4);
                  if (val.length > 2) {
                    setFormExpiry(`${val.substring(0, 2)}/${val.substring(2)}`);
                  } else {
                    setFormExpiry(val);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-100 focus:bg-white outline-none font-semibold text-center"
                placeholder="MM/YY (Ej. 10/30)"
              />
            </div>
          </div>

          <button
            onClick={() => onUpdateCardDetails(formHolder, formNumber, formExpiry, formFrom)}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            Guardar Datos de Tarjeta
          </button>
        </div>
      </div>

      {/* Base Finances Configuration */}
      <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ingresos y Gastos Fijos Base</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Ingreso Fijo Base</label>
            <input
              type="number"
              value={formIncome}
              onChange={(e) => setFormIncome(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Gasto Fijo Base</label>
            <input
              type="number"
              value={formFixed}
              onChange={(e) => setFormFixed(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-100 outline-none"
            />
          </div>
        </div>
        <button
          onClick={() => onUpdateBaseFinances(parseFloat(formIncome) || 0, parseFloat(formFixed) || 0)}
          className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-white text-xs font-semibold rounded-xl"
        >
          Guardar Ingresos y Gastos Fijos
        </button>
      </div>

      {/* Category CRUD Management */}
      <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {editingCatId ? '✏️ Editar Categoría' : '📂 Nueva Categoría'}
        </h3>
        
        <form onSubmit={handleSaveCategory} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Nombre</label>
              <input
                type="text"
                required
                placeholder="Ej. Regalos"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-100 outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Presupuesto ($)</label>
              <input
                type="number"
                placeholder="Límite mensual"
                value={catBudget}
                onChange={(e) => setCatBudget(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-100 outline-none focus:bg-white"
              />
            </div>
          </div>

          {/* Color preset selector */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCatColor(c)}
                  className="w-6 h-6 rounded-full border border-white flex items-center justify-center relative transition-all active:scale-90"
                  style={{ backgroundColor: c }}
                >
                  {catColor === c && <Check size={12} className="text-white drop-shadow-sm font-bold" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
            >
              {editingCatId ? 'Actualizar' : 'Crear Categoría'}
            </button>
            {editingCatId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3.5 py-2 bg-slate-100 text-slate-500 text-xs font-medium rounded-xl hover:bg-slate-200"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="border-t border-slate-100 pt-4 mt-2">
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Categorías Activas</label>
          <div className="space-y-1.5">
            {categories.map(cat => (
              <div key={cat.id} className="flex justify-between items-center p-2 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                  <span className="text-xs font-bold text-slate-700">{cat.name}</span>
                  {cat.budget && (
                    <span className="text-[9px] text-slate-400 font-medium">
                      (Presupuesto: {formatCurrency(cat.budget)})
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleStartEdit(cat)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Danger Zone / Reset App */}
      <div className="bg-rose-50/50 border border-rose-100 rounded-[24px] p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800">Zona de Peligro</h3>
        <p className="text-[11px] text-rose-600/80 leading-relaxed">
          Esto restablecerá la aplicación a su estado predeterminado y borrará todos los datos locales.
        </p>
        <button
          onClick={onResetApp}
          className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <RotateCcw size={12} />
          Reiniciar Aplicación
        </button>
      </div>
    </div>
  );
}
