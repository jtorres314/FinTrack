import React from 'react';
import { Search, Filter, Trash2, Plus, ArrowUpRight, ArrowDownLeft, X, Calendar } from 'lucide-react';
import { Transaction, Category, TransactionType } from '../types';
import { formatCurrency } from '../utils/finance';

interface TransactionsTabProps {
  transactions: Transaction[];
  categories: Category[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

export function TransactionsTab({ transactions, categories, onAddTransaction, onDeleteTransaction }: TransactionsTabProps) {
  const [search, setSearch] = React.useState('');
  const [filterType, setFilterType] = React.useState<'all' | TransactionType>('all');
  const [filterCategory, setFilterCategory] = React.useState<string>('all');
  const [showAddModal, setShowAddModal] = React.useState(false);

  // New Transaction Form State
  const [newTitle, setNewTitle] = React.useState('');
  const [newAmount, setNewAmount] = React.useState('');
  const [newDate, setNewDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [newCategoryId, setNewCategoryId] = React.useState(categories[0]?.id || '');
  const [newType, setNewType] = React.useState<TransactionType>('expense');

  // Sync default category when categories list changes or modal opens
  React.useEffect(() => {
    if (categories.length > 0 && !newCategoryId) {
      setNewCategoryId(categories[0].id);
    }
  }, [categories, showAddModal]);

  // Filter transactions
  const filtered = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCat = filterCategory === 'all' || t.categoryId === filterCategory;
    return matchesSearch && matchesType && matchesCat;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount) return;

    onAddTransaction({
      title: newTitle.trim(),
      amount: parseFloat(newAmount),
      date: newDate,
      categoryId: newCategoryId,
      type: newType,
    });

    // Reset Form & Close
    setNewTitle('');
    setNewAmount('');
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewType('expense');
    setShowAddModal(false);
  };

  return (
    <div className="p-6">
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Transacciones</h2>
          <p className="text-xs text-slate-500">Historial completo de tus finanzas</p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all"
        >
          <Plus size={14} />
          Agregar
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 mb-5">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Buscar por descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-100 focus:bg-white text-slate-800 text-xs rounded-xl border border-transparent focus:border-slate-200 outline-none transition-all"
          />
        </div>

        {/* Quick Type Filter Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all shrink-0 ${filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all shrink-0 ${filterType === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            Ingresos
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all shrink-0 ${filterType === 'expense' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            Gastos Var.
          </button>
          <button
            onClick={() => setFilterType('fixed_expense')}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all shrink-0 ${filterType === 'fixed_expense' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            Gastos Fijos
          </button>
        </div>

        {/* Category dropdown filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Filtrar Categoría:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-lg border-none outline-none cursor-pointer transition-colors"
          >
            <option value="all">Todas</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-400">No se encontraron transacciones con los filtros seleccionados.</p>
          </div>
        ) : (
          filtered.map(t => {
            const cat = categories.find(c => c.id === t.categoryId);
            const isIncome = t.type === 'income';
            const isFixed = t.type === 'fixed_expense';

            return (
              <div 
                key={t.id} 
                className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all hover:border-slate-200"
              >
                <div className="flex items-center gap-3">
                  {/* Icon indicator */}
                  <div 
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isIncome 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : isFixed 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {isIncome ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>

                  {/* Title and Date */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{t.title}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                      <span className="font-semibold px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded text-[9px]">
                        {cat ? cat.name : 'Varios'}
                      </span>
                      <span>•</span>
                      <span>{t.date}</span>
                    </div>
                  </div>
                </div>

                {/* Amount & delete button */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-xs font-bold ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                    <p className="text-[9px] text-slate-400 capitalize">
                      {isFixed ? 'Gasto Fijo' : isIncome ? 'Ingreso' : 'Variable'}
                    </p>
                  </div>

                  <button
                    onClick={() => onDeleteTransaction(t.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    title="Eliminar"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end md:items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-white rounded-t-3xl md:rounded-3xl p-6 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Nueva Transacción</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Tipo</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setNewType('expense')}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${newType === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Variable
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('fixed_expense')}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${newType === 'fixed_expense' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Fijo
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('income')}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${newType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Ingreso
                  </button>
                </div>
              </div>

              {/* Title / Description */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Descripción</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Súper, Alquiler, Salario"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 focus:bg-white text-xs text-slate-800 rounded-xl border border-slate-100 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Importe ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 focus:bg-white text-xs text-slate-800 rounded-xl border border-slate-100 focus:border-blue-500 outline-none transition-all font-semibold"
                />
              </div>

              {/* Category */}
              {newType !== 'income' && (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Categoría</label>
                  {categories.length === 0 ? (
                    <div className="text-[10px] text-rose-500 font-bold bg-rose-50 px-3 py-2 rounded-xl border border-rose-100">
                      ⚠️ No tienes categorías. Créalas primero en la sección de Ajustes (⚙️).
                    </div>
                  ) : (
                    <select
                      value={newCategoryId}
                      onChange={(e) => setNewCategoryId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 focus:bg-white text-xs text-slate-800 rounded-xl border border-slate-100 focus:border-blue-500 outline-none transition-all cursor-pointer font-medium"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                  <Calendar size={12} />
                  Fecha
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 focus:bg-white text-xs text-slate-800 rounded-xl border border-slate-100 focus:border-blue-500 outline-none transition-all font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={newType !== 'income' && categories.length === 0}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-98"
              >
                Agregar Transacción
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
