import React from 'react';
import { RecurringBill, BillFrequency, Category } from '../types';
import { Plus, X, Calendar, DollarSign, RefreshCw, CheckCircle2, ChevronRight, AlertCircle, Tag, Save, Trash2 } from 'lucide-react';
import { formatToDayMonth, daysBetween, parseDate, formatCurrency, getTodayDateString } from '../utils/finance';

interface SchedulePaymentsWidgetProps {
  bills: RecurringBill[];
  categories: Category[];
  simulatedDateStr: string;
  onAddBill: (bill: Omit<RecurringBill, 'id' | 'isPaid'>) => void;
  onPayBill: (id: string, isLastPayment?: boolean, paymentDate?: string) => void;
  onDeleteBill: (id: string) => void;
  onAddCategory: (cat: Omit<Category, 'id'>) => void;
}

export function SchedulePaymentsWidget({
  bills,
  categories,
  simulatedDateStr,
  onAddBill,
  onPayBill,
  onDeleteBill,
  onAddCategory,
}: SchedulePaymentsWidgetProps) {
  const [showAddModal, setShowAddModal] = React.useState(false);

  // Pay Bill Modal State (Allows selecting the exact payment date)
  const [payModalData, setPayModalData] = React.useState<{
    bill: RecurringBill;
    isLastPayment: boolean;
  } | null>(null);
  const [paymentDate, setPaymentDate] = React.useState<string>(simulatedDateStr || getTodayDateString());

  // Open Pay Modal Handler
  const handleOpenPayModal = (bill: RecurringBill, isLastPayment: boolean) => {
    setPayModalData({ bill, isLastPayment });
    setPaymentDate(simulatedDateStr || getTodayDateString());
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalData) return;
    const finalDate = paymentDate || simulatedDateStr || getTodayDateString();
    onPayBill(payModalData.bill.id, payModalData.isLastPayment, finalDate);
    setPayModalData(null);
  };

  // New Bill Form State
  const [title, setTitle] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [dueDate, setDueDate] = React.useState(getTodayDateString());
  const [frequency, setFrequency] = React.useState<BillFrequency>('monthly');
  const [notifyDays, setNotifyDays] = React.useState('3');
  const [logoType, setLogoType] = React.useState<'netflix' | 'paypal' | 'spotify' | 'other'>('other');
  const [selectedCategoryId, setSelectedCategoryId] = React.useState('');

  // Unified presets / subscriptions templates stored in localStorage (including default ones so they can be deleted too)
  const [presets, setPresets] = React.useState<{ type: string; label: string; amount: string; logoType: 'netflix' | 'spotify' | 'paypal' | 'other' }[]>(() => {
    const saved = localStorage.getItem('fin_presets_unified_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback below
      }
    }
    return [
      { type: 'netflix', label: 'Netflix', amount: '39900', logoType: 'netflix' },
      { type: 'spotify', label: 'Spotify', amount: '16900', logoType: 'spotify' },
      { type: 'paypal', label: 'Paypal', amount: '15000', logoType: 'paypal' }
    ];
  });

  const handleRestoreDefaults = () => {
    const defaults = [
      { type: 'netflix', label: 'Netflix', amount: '39900', logoType: 'netflix' as const },
      { type: 'spotify', label: 'Spotify', amount: '16900', logoType: 'spotify' as const },
      { type: 'paypal', label: 'Paypal', amount: '15000', logoType: 'paypal' as const }
    ];
    // Keep custom presets
    const customs = presets.filter(p => !['netflix', 'spotify', 'paypal'].includes(p.type));
    const restored = [...defaults, ...customs];
    setPresets(restored);
    localStorage.setItem('fin_presets_unified_v2', JSON.stringify(restored));
  };

  // Track previous categories length to auto-select the latest one when added
  const prevCategoriesLengthRef = React.useRef(categories.length);
  React.useEffect(() => {
    if (categories.length > prevCategoriesLengthRef.current) {
      const latestCat = categories[categories.length - 1];
      if (latestCat) {
        setSelectedCategoryId(latestCat.id);
      }
    }
    prevCategoriesLengthRef.current = categories.length;
  }, [categories]);

  // Inline Category Creation State
  const [showNewCategoryForm, setShowNewCategoryForm] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [newCategoryLimit, setNewCategoryLimit] = React.useState('');
  const [newCategoryColor, setNewCategoryColor] = React.useState('#3B82F6');

  const handleCreateCategoryInline = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    onAddCategory({
      name: newCategoryName.trim(),
      budget: parseFloat(newCategoryLimit) || 100,
      color: newCategoryColor,
      icon: 'Tag'
    });

    setNewCategoryName('');
    setNewCategoryLimit('');
    setShowNewCategoryForm(false);
  };

  // Custom subscription preset creation
  const [showNewPresetForm, setShowNewPresetForm] = React.useState(false);
  const [newPresetName, setNewPresetName] = React.useState('');
  const [newPresetAmount, setNewPresetAmount] = React.useState('');

  const handleCreatePresetInline = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newPresetName.trim() || !newPresetAmount) return;

    const newPreset = {
      type: `custom-${Date.now()}`,
      label: newPresetName.trim(),
      amount: parseFloat(newPresetAmount).toFixed(2),
      logoType: 'other' as const,
    };

    const updated = [...presets, newPreset];
    setPresets(updated);
    localStorage.setItem('fin_presets_unified_v2', JSON.stringify(updated));

    // Instantly select it
    setLogoType('other');
    setTitle(newPreset.label);
    setAmount(newPreset.amount);

    setNewPresetName('');
    setNewPresetAmount('');
    setShowNewPresetForm(false);
  };

  const handleDeletePreset = (e: React.MouseEvent, type: string, label: string) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = presets.filter(p => p.type !== type);
    setPresets(updated);
    localStorage.setItem('fin_presets_unified_v2', JSON.stringify(updated));
    if (logoType === type) {
      setLogoType('other');
    }
  };

  // Sync default category when categories list changes or modal opens
  React.useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, showAddModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    if (categories.length === 0) {
      alert('Por favor crea una categoría primero.');
      return;
    }

    const catId = selectedCategoryId || categories[0]?.id || '';

    // If logoType is custom, map it to other for standard model storage
    const normalizedLogoType = logoType.startsWith('custom-') ? 'other' : logoType;

    onAddBill({
      title: title.trim(),
      amount: parseFloat(amount),
      dueDate,
      frequency,
      notifyDaysBefore: parseInt(notifyDays) || 3,
      logoType: normalizedLogoType as any,
      categoryId: catId,
    });

    // Reset and Close
    setTitle('');
    setAmount('');
    setDueDate(getTodayDateString());
    setFrequency('monthly');
    setNotifyDays('3');
    setLogoType('other');
    if (categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
    setShowAddModal(false);
  };

  // Sort bills by closest due date
  const sortedBills = [...bills].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Facturas Programadas</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all active:scale-95"
        >
          <Plus size={13} />
          Programar
        </button>
      </div>

      {/* Bill List */}
      <div className="space-y-3">
        {sortedBills.length === 0 ? (
          <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-400">No hay facturas programadas.</p>
          </div>
        ) : (
          sortedBills.map(bill => {
            const daysLeft = daysBetween(parseDate(simulatedDateStr), parseDate(bill.dueDate));
            const isNear = daysLeft >= 0 && daysLeft <= bill.notifyDaysBefore;
            const isOverdue = daysLeft < 0;

            const billCategory = categories.find(c => c.id === bill.categoryId);

            // Determine Logo or visual container
            let logoBg = 'bg-slate-100 text-slate-600';
            let logoContent = bill.title.substring(0, 2).toUpperCase();

            if (bill.logoType === 'netflix') {
              logoBg = 'bg-[#E50914] text-white';
              logoContent = 'N';
            } else if (bill.logoType === 'paypal') {
              logoBg = 'bg-[#003087] text-white';
              logoContent = 'P';
            } else if (bill.logoType === 'spotify') {
              logoBg = 'bg-[#1DB954] text-white';
              logoContent = 'S';
            }

            return (
              <div 
                key={bill.id} 
                className={`flex items-center justify-between p-3.5 bg-white border rounded-2xl shadow-xs transition-all hover:border-slate-200 ${
                  isOverdue 
                    ? 'border-rose-100 bg-rose-50/10' 
                    : isNear 
                      ? 'border-amber-100 bg-amber-50/10' 
                      : 'border-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Brand Logo Avatar */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shadow-xs ${logoBg}`}>
                    {logoContent}
                  </div>

                  {/* Title and payment date */}
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-800">{bill.title}</h4>
                      {billCategory && (
                        <span 
                          className="inline-flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.2 rounded"
                          style={{ backgroundColor: `${billCategory.color}15`, color: billCategory.color }}
                        >
                          {billCategory.name}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Próximo Pago:{' '}
                      <span className="font-semibold text-slate-700">
                        {formatToDayMonth(bill.dueDate)}
                      </span>
                    </p>

                    {/* Notification Alert Indicators */}
                    {isOverdue ? (
                      <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-rose-600 bg-rose-100/50 px-1.5 py-0.2 mt-1 rounded">
                        <AlertCircle size={8} /> Vencido
                      </span>
                    ) : isNear ? (
                      <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-amber-600 bg-amber-100/50 px-1.5 py-0.2 mt-1 rounded animate-pulse">
                        ⚠️ Alerta: Vence en {daysLeft} {daysLeft === 1 ? 'día' : 'días'}
                      </span>
                    ) : (
                      <span className="inline-block text-[8px] font-semibold text-slate-400 mt-1 capitalize">
                        Frecuencia: {bill.frequency === 'monthly' ? 'mensual' : bill.frequency === 'quarterly' ? 'trimestral' : 'anual'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount and actions */}
                <div className="flex items-center gap-2">
                  <div className="text-right space-y-1">
                    <p className="text-xs font-extrabold text-slate-900">{formatCurrency(bill.amount)}</p>
                    <div className="flex flex-col items-end gap-1">
                      <button
                        onClick={() => handleOpenPayModal(bill, false)}
                        className="text-[9px] text-blue-600 font-extrabold hover:underline tracking-tight flex items-center justify-end gap-0.5"
                      >
                        <CheckCircle2 size={10} />
                        Marcar Pago
                      </button>
                      <button
                        onClick={() => handleOpenPayModal(bill, true)}
                        className="text-[9px] text-rose-600 font-extrabold hover:underline tracking-tight flex items-center justify-end gap-0.5"
                        title="Registrar último pago y eliminar programación"
                      >
                        <X size={10} className="text-rose-600" />
                        Último Pago
                      </button>
                    </div>
                  </div>

                  {/* Options: Delete */}
                  <button
                    onClick={() => {
                      onDeleteBill(bill.id);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shrink-0 self-center"
                    title="Eliminar programación"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pay Bill Confirmation Modal (With Payment Date Selector) */}
      {payModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end md:items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-t-3xl md:rounded-3xl p-6 shadow-2xl animate-slide-up border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  payModalData.isLastPayment ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  <Calendar size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    {payModalData.isLastPayment ? 'Registrar Último Pago' : 'Registrar Pago de Factura'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Selecciona la fecha del pago</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setPayModalData(null)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Bill Info Card */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Factura</span>
                <h4 className="text-sm font-extrabold text-slate-800">{payModalData.bill.title}</h4>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Vence: <span className="font-bold text-slate-700">{formatToDayMonth(payModalData.bill.dueDate)}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Importe</span>
                <p className="text-base font-black text-blue-600">{formatCurrency(payModalData.bill.amount)}</p>
              </div>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              {/* Payment Date Field */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] uppercase font-bold text-slate-500">
                    Fecha en que se realiza el pago
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPaymentDate(getTodayDateString())}
                      className="text-[9px] font-bold text-blue-600 hover:underline bg-blue-50 px-1.5 py-0.5 rounded"
                    >
                      Hoy
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentDate(payModalData.bill.dueDate)}
                      className="text-[9px] font-bold text-slate-600 hover:underline bg-slate-100 px-1.5 py-0.5 rounded"
                    >
                      Vencimiento
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white text-xs text-slate-800 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-bold cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 pl-0.5">
                  Esta fecha se registrará en el historial de transacciones y balance.
                </p>
              </div>

              {/* Payment Mode Toggle */}
              <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1.5 px-1">
                  Modalidad de Pago
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPayModalData(prev => prev ? { ...prev, isLastPayment: false } : null)}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all ${
                      !payModalData.isLastPayment
                        ? 'bg-white text-blue-600 shadow-xs border border-blue-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Pago Periódico
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayModalData(prev => prev ? { ...prev, isLastPayment: true } : null)}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all ${
                      payModalData.isLastPayment
                        ? 'bg-white text-rose-600 shadow-xs border border-rose-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Último Pago
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 mt-1.5 px-1 font-medium">
                  {payModalData.isLastPayment 
                    ? '⚠️ Registra el gasto y finaliza la suscripción (se eliminará de facturas programadas).' 
                    : '🔄 Registra el gasto y avanza automáticamente al siguiente período.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPayModalData(null)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`w-2/3 py-2.5 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                    payModalData.isLastPayment 
                      ? 'bg-rose-600 hover:bg-rose-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <CheckCircle2 size={13} />
                  Confirmar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bill Modal */}
      {showAddModal && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end md:items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-white rounded-t-3xl md:rounded-3xl p-6 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Programar Gasto Recurrente</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-6 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  ⚠️ No tienes categorías de presupuesto configuradas para asociar con este gasto.
                </p>
                <p className="text-[11px] text-slate-400">
                  Por favor, ve a la pestaña de Ajustes (⚙️) para crear al menos una categoría primero.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Preset Service quick-select */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] uppercase font-bold text-slate-400">Suscripción / Plantilla</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowNewPresetForm(!showNewPresetForm)}
                        className="text-[10px] text-blue-600 font-extrabold hover:underline"
                      >
                        {showNewPresetForm ? 'Volver' : '+ Crear Plantilla'}
                      </button>
                    </div>
                  </div>

                  {showNewPresetForm ? (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 space-y-2.5 animate-fade-in text-left">
                      <p className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wide">Crear plantilla de suscripción</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Nombre (ej. Disney+)"
                          value={newPresetName}
                          onChange={(e) => setNewPresetName(e.target.value)}
                          className="px-2.5 py-1.5 bg-white text-xs text-slate-800 rounded-xl border border-slate-100 outline-none focus:border-blue-500 font-semibold"
                        />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Importe ($)"
                          value={newPresetAmount}
                          onChange={(e) => setNewPresetAmount(e.target.value)}
                          className="px-2.5 py-1.5 bg-white text-xs text-slate-800 rounded-xl border border-slate-100 outline-none focus:border-blue-500 font-bold"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleCreatePresetInline}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-extrabold shadow-xs transition-colors"
                      >
                        Crear e Instanciar
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto pb-1">
                      {presets.map(p => {
                        const isActive = logoType === p.type || (p.logoType !== 'other' && logoType === p.logoType);
                        return (
                          <div
                            key={p.type}
                            onClick={() => {
                              setLogoType(p.logoType);
                              setTitle(p.label);
                              setAmount(p.amount);
                            }}
                            className={`relative py-1.5 pl-2.5 pr-7 rounded-xl text-[10px] font-bold border cursor-pointer transition-all flex items-center gap-1.5 ${
                              isActive
                                ? 'border-blue-600 bg-blue-50 text-blue-600 font-extrabold shadow-sm'
                                : 'border-slate-100 bg-slate-50/50 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <span>{p.label}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleDeletePreset(e, p.type, p.label);
                              }}
                              className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all z-10"
                              title="Eliminar plantilla"
                            >
                              <X size={10} strokeWidth={2.5} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Title / Description */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Nombre del Servicio / Gasto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Seguro de Coche, Membresía"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 focus:bg-white text-xs text-slate-800 rounded-xl border border-slate-100 focus:border-blue-500 outline-none transition-all font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Amount */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Importe ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 focus:bg-white text-xs text-slate-800 rounded-xl border border-slate-100 focus:border-blue-500 outline-none transition-all font-bold"
                    />
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Vencimiento</label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 focus:bg-white text-xs text-slate-800 rounded-xl border border-slate-100 focus:border-blue-500 outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 relative">
                  {/* Category Selection with inline creator */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] uppercase font-bold text-slate-400">Categoría</label>
                      <button
                        type="button"
                        onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
                        className="text-[9px] text-blue-600 font-extrabold hover:underline"
                      >
                        {showNewCategoryForm ? 'Cancelar' : '+ Nueva'}
                      </button>
                    </div>

                    {!showNewCategoryForm ? (
                      <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 focus:bg-white text-xs text-slate-800 rounded-xl border border-slate-100 focus:border-blue-500 outline-none transition-all cursor-pointer font-semibold"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="absolute left-0 right-0 bottom-full mb-2 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xl space-y-3 z-50 text-left animate-fade-in">
                        <p className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wide">Nueva Categoría de Gasto</p>
                        
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Nombre de Categoría"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-100 outline-none font-semibold focus:bg-white focus:border-blue-500"
                          />

                          <input
                            type="number"
                            placeholder="Límite Presupuesto ($)"
                            value={newCategoryLimit}
                            onChange={(e) => setNewCategoryLimit(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-100 outline-none font-semibold focus:bg-white focus:border-blue-500"
                          />

                          <div className="flex items-center gap-1 justify-between bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                            {['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B'].map(color => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setNewCategoryColor(color)}
                                className={`w-5 h-5 rounded-full transition-transform ${newCategoryColor === color ? 'scale-125 ring-2 ring-slate-400' : 'hover:scale-110'}`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleCreateCategoryInline}
                          className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                        >
                          Crear y Seleccionar
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Frecuencia</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as BillFrequency)}
                      className="w-full px-3 py-2 bg-slate-50 focus:bg-white text-xs text-slate-800 rounded-xl border border-slate-100 focus:border-blue-500 outline-none transition-all cursor-pointer font-semibold"
                    >
                      <option value="monthly">Mensual</option>
                      <option value="quarterly">Trimestral</option>
                      <option value="annual">Anual</option>
                    </select>
                  </div>
                </div>

                {/* Days to notify in advance */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Notificar antes (días)</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    required
                    value={notifyDays}
                    onChange={(e) => setNotifyDays(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 focus:bg-white text-xs text-slate-800 rounded-xl border border-slate-100 focus:border-blue-500 outline-none transition-all font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-98"
                >
                  Guardar Recordatorio
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

