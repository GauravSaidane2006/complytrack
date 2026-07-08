import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetComplianceOptionsQuery, useSaveComplianceSelectionMutation, useAutoCreateCompliancesMutation } from '../store/api/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CATEGORY_LABELS = {
  registration: { label: 'Registration', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  licence: { label: 'License', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  filing: { label: 'Filing', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  payment: { label: 'Payment', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  audit: { label: 'Audit', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  other: { label: 'Other', color: 'bg-stone-100 text-stone-700 border-stone-200' },
};

const PRIORITY_LABELS = {
  critical: { label: 'Critical', color: 'bg-rose-500 text-white' },
  high: { label: 'High', color: 'bg-orange-500 text-white' },
  medium: { label: 'Medium', color: 'bg-amber-400 text-stone-900' },
  low: { label: 'Low', color: 'bg-stone-300 text-stone-700' },
};

const FREQUENCY_LABELS = {
  'one-time': 'One-time', monthly: 'Monthly', quarterly: 'Quarterly',
  'half-yearly': 'Half-Yearly', yearly: 'Yearly', 'event-based': 'Event-based',
};

const SECTOR_LABELS = {
  service: 'Service', manufacturing: 'Manufacturing', trading: 'Trading'
};

function ComplianceItem({ item, selected, onToggle }) {
  return (
    <div
      onClick={() => onToggle(item.id)}
      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
        selected
          ? 'border-orange-500 bg-orange-50/60 shadow-sm'
          : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
      }`}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggle(item.id)}
        className="w-5 h-5 mt-0.5 rounded border-stone-300 text-orange-600 focus:ring-orange-500 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-stone-900 text-sm">{item.title}</h4>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${PRIORITY_LABELS[item.priority]?.color || 'bg-stone-300 text-stone-700'}`}>
            {PRIORITY_LABELS[item.priority]?.label || item.priority}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${CATEGORY_LABELS[item.category]?.color || 'bg-stone-100 text-stone-700 border-stone-200'}`}>
            {CATEGORY_LABELS[item.category]?.label || item.category}
          </span>
        </div>
        <p className="text-xs text-stone-500 mt-1">{item.description}</p>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="text-xs text-stone-400">{item.law}</span>
          <span className="text-xs text-stone-400">•</span>
          <span className="text-xs text-stone-400">{FREQUENCY_LABELS[item.frequency]}</span>
        </div>
      </div>
    </div>
  );
}

function ComplianceSection({ title, icon, count, color, items, selectedIds, onToggle, onToggleAll, allSelected }) {
  return (
    <div className="mb-8 last:mb-0">
      <div className={`flex items-center gap-3 mb-3 p-3 rounded-xl ${color}`}>
        <span className="text-lg">{icon}</span>
        <h3 className="font-bold text-sm text-stone-900">{title}</h3>
        <span className="bg-white/80 text-stone-600 px-2 py-0.5 rounded-full text-xs font-semibold">
          {count} items
        </span>
        <button
          onClick={onToggleAll}
          className="ml-auto text-xs text-orange-600 hover:text-orange-700 font-semibold"
        >
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>
      <div className="space-y-2 ml-2">
        {items.map((item) => (
          <ComplianceItem
            key={item.id}
            item={item}
            selected={selectedIds.has(item.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

export default function ComplianceSetup() {
  const navigate = useNavigate();
  const { user, organization } = useSelector((state) => state.auth);
  const { data: optionsData, isLoading } = useGetComplianceOptionsQuery();
  const [saveSelection, { isLoading: saving }] = useSaveComplianceSelectionMutation();
  const [autoCreate, { isLoading: creating }] = useAutoCreateCompliancesMutation();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [step, setStep] = useState('select');

  useEffect(() => {
    if (optionsData?.selectedIds) {
      setSelectedIds(new Set(optionsData.selectedIds));
    }
  }, [optionsData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (optionsData?.complianceSetupComplete && step === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md border border-stone-200/60">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Compliance Setup Complete</h2>
          <p className="text-stone-500 mb-6">
            You have {optionsData?.selectedIds?.length || 0} compliances selected for your{' '}
            {SECTOR_LABELS[optionsData?.sector] || optionsData?.sector} — {optionsData?.industry} business.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setStep('select')}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-medium hover:from-orange-700 hover:to-orange-600 shadow-lg shadow-orange-500/25 transition-all duration-200"
            >
              Review & Update Selection
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 border border-stone-200 text-stone-700 rounded-xl font-medium hover:bg-stone-50 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const grouped = optionsData?.grouped || { common: [], sector: [], industry: [] };

  const filterItems = (items) => {
    return items.filter((item) => {
      const matchesSearch = !searchTerm ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.law.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  };

  const filteredCommon = filterItems(grouped.common);
  const filteredSector = filterItems(grouped.sector);
  const filteredIndustry = filterItems(grouped.industry);

  const totalFiltered = filteredCommon.length + filteredSector.length + filteredIndustry.length;
  const totalAll = grouped.common.length + grouped.sector.length + grouped.industry.length;

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGroup = (items) => {
    const ids = items.map(i => i.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = ids.every((id) => next.has(id));
      for (const id of ids) {
        if (allSelected) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  };

  const allFilteredIds = [...filteredCommon, ...filteredSector, ...filteredIndustry].map(i => i.id);
  const allFilteredSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.has(id));
  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = allFilteredIds.every(id => next.has(id));
      for (const id of allFilteredIds) {
        if (allSelected) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one compliance.');
      return;
    }
    try {
      await saveSelection({ complianceIds: Array.from(selectedIds) }).unwrap();
      toast.success(`${selectedIds.size} compliances saved!`);
      setStep('creating');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save selection.');
    }
  };

  const handleAutoCreate = async () => {
    try {
      const result = await autoCreate().unwrap();
      toast.success(result.message);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create compliance items.');
    }
  };

  if (step === 'creating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md border border-stone-200/60">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Create Compliance Items</h2>
          <p className="text-stone-500 mb-6">
            Auto-generate compliance tracking items based on your {selectedIds.size} selections?
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleAutoCreate}
              disabled={creating}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-medium hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all duration-200"
            >
              {creating ? <LoadingSpinner size="sm" /> : 'Yes, Create All Items'}
            </button>
            <button
              onClick={() => setStep('select')}
              className="w-full py-3 border border-stone-200 text-stone-700 rounded-xl font-medium hover:bg-stone-50 transition-colors"
            >
              Back to Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 mb-4 shadow-xl shadow-orange-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Select Your Compliances</h1>
          <p className="text-stone-400 mt-2">
            {SECTOR_LABELS[optionsData?.sector] || optionsData?.sector} — {optionsData?.industry}
          </p>
          <p className="text-stone-500 text-sm mt-1">Choose all compliance requirements applicable to your business</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-stone-200/60">
          <div className="p-6 border-b border-stone-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search compliances..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              >
                <option value="all">All Categories</option>
                <option value="registration">Registration</option>
                <option value="licence">License</option>
                <option value="filing">Filing</option>
                <option value="payment">Payment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-stone-700">Select all filtered ({totalFiltered})</span>
              </label>
              <div className="text-sm text-stone-500">
                <span className="font-semibold text-orange-600">{selectedIds.size}</span> of {totalAll} selected
              </div>
            </div>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {totalFiltered === 0 ? (
              <div className="text-center py-12 text-stone-500">No compliances match your search.</div>
            ) : (
              <>
                {filteredCommon.length > 0 && (
                  <ComplianceSection
                    title="Common for All Sectors & Industries"
                    icon="📋"
                    count={filteredCommon.length}
                    color="bg-orange-50 border border-orange-200"
                    items={filteredCommon}
                    selectedIds={selectedIds}
                    onToggle={toggleSelect}
                    onToggleAll={() => toggleGroup(filteredCommon)}
                    allSelected={filteredCommon.every(i => selectedIds.has(i.id))}
                  />
                )}

                {filteredSector.length > 0 && (
                  <ComplianceSection
                    title={`Common for ${SECTOR_LABELS[optionsData?.sector] || optionsData?.sector} Sector`}
                    icon="🏭"
                    count={filteredSector.length}
                    color="bg-blue-50 border border-blue-200"
                    items={filteredSector}
                    selectedIds={selectedIds}
                    onToggle={toggleSelect}
                    onToggleAll={() => toggleGroup(filteredSector)}
                    allSelected={filteredSector.every(i => selectedIds.has(i.id))}
                  />
                )}

                {filteredIndustry.length > 0 && (
                  <ComplianceSection
                    title={`Specific to ${optionsData?.industry}`}
                    icon="⚙️"
                    count={filteredIndustry.length}
                    color="bg-purple-50 border border-purple-200"
                    items={filteredIndustry}
                    selectedIds={selectedIds}
                    onToggle={toggleSelect}
                    onToggleAll={() => toggleGroup(filteredIndustry)}
                    allSelected={filteredIndustry.every(i => selectedIds.has(i.id))}
                  />
                )}
              </>
            )}
          </div>

          <div className="p-6 border-t border-stone-200 bg-stone-50/50 rounded-b-2xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSave}
                disabled={saving || selectedIds.size === 0}
                className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-medium text-sm hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all duration-200"
              >
                {saving ? <LoadingSpinner size="sm" /> : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Selection ({selectedIds.size})
                  </>
                )}
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-stone-200 text-stone-700 rounded-xl font-medium text-sm hover:bg-stone-50 transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
