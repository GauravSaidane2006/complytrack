import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetComplianceOptionsQuery, useSaveComplianceSelectionMutation, useAutoCreateCompliancesMutation, useGetImpactQuery } from '../store/api/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner'
import Logo from '../components/common/Logo';

const CATEGORY_LABELS = {
  registration: { label: 'Registration', color: 'bg-primary-100 text-primary-700 border-blue-300' },
  licence: { label: 'License', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  filing: { label: 'Filing', color: 'bg-warning-100 text-warning-700 border-amber-300' },
  payment: { label: 'Payment', color: 'bg-danger-100 text-rose-800 border-danger-300' },
  audit: { label: 'Audit', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  other: { label: 'Other', color: 'bg-slate-100 text-slate-800 border-slate-300' },
};

const PRIORITY_LABELS = {
  critical: { label: 'CRITICAL', color: 'bg-red-600 text-white' },
  high: { label: 'HIGH', color: 'bg-primary-500 text-white' },
  medium: { label: 'MEDIUM', color: 'bg-warning-400 text-slate-900' },
  low: { label: 'LOW', color: 'bg-slate-300 text-slate-700' },
};

const FREQUENCY_LABELS = {
  'one-time': 'One-time', monthly: 'Monthly', quarterly: 'Quarterly',
  'half-yearly': 'Half-Yearly', yearly: 'Yearly', 'event-based': 'Event-based',
};

const SECTOR_LABELS = {
  service: 'Service', manufacturing: 'Manufacturing', trading: 'Trading'
};

const LAW_PENALTIES = {
  'GST Act': { section: 'Section 122-125 of CGST Act', authority: 'GST Council / State GST Department', maxFine: 'Up to ₹10,000 or 10% of tax due', imprisonment: 'None for most offences; 1-5 years for fraud', description: 'The Goods and Services Tax Act governs indirect taxation in India. Non-compliance can result in penalties, interest on unpaid taxes, and in severe cases of tax fraud, criminal prosecution.' },
  'Income Tax Act': { section: 'Section 234A-234E, 276B-276CC', authority: 'Income Tax Department / CBDT', maxFine: '₹5,000 to unlimited depending on evasion amount', imprisonment: 'Prosecution possible for non-filing (Sec 276CC) and tax evasion (Sec 276C)', description: 'The Income Tax Act governs direct taxation. Non-compliance includes late filing, non-payment of taxes, and tax evasion. Penalties range from interest charges to criminal prosecution.' },
  'PF Act': { section: 'Section 14 of EPF Act', authority: 'Employees Provident Fund Organisation (EPFO)', maxFine: 'Up to ₹5,000 per offence', imprisonment: 'Imprisonment up to 3 years for defaulting employers', description: 'The Employees Provident Fund Act mandates provident fund contributions for eligible employees. Non-compliance is a criminal offence with imprisonment provisions.' },
  'ESI Act': { section: 'Section 85 of ESI Act', authority: 'Employees State Insurance Corporation (ESIC)', maxFine: 'Up to ₹5,000 per offence', imprisonment: 'Imprisonment up to 2 years for serious violations', description: 'The ESI Act provides social security benefits to employees. Non-compliance can result in criminal prosecution and imprisonment.' },
  'Companies Act': { section: 'Section 450, 451 of Companies Act, 2013', authority: 'Ministry of Corporate Affairs (MCA) / Registrar of Companies', maxFine: '₹100/day to ₹10,00,000 depending on default', imprisonment: 'None for most filing defaults; prosecution for fraud (Sec 447)', description: 'The Companies Act governs company registration, management, and compliance. Late filings attract daily penalties, and fraud can lead to imprisonment.' },
  'Labour Laws': { section: 'Various Labour Acts', authority: 'Ministry of Labour / State Labour Departments', maxFine: '₹1,000 to ₹50,000 per offence', imprisonment: 'Up to 3 years under some labour laws', description: 'Labour laws protect worker rights including wages, safety, social security, and working conditions. Non-compliance can result in fines and imprisonment under various acts.' },
  'Factory Act': { section: 'Sections 92-94 of Factories Act, 1948', authority: 'Inspector of Factories / State Factory Department', maxFine: '₹10,000 to ₹5,00,000', imprisonment: 'Imprisonment up to 2 years for serious defaults', description: 'The Factories Act ensures safety, health, and welfare of factory workers. Non-compliance can lead to factory closure and criminal prosecution.' },
  'Environment Act': { section: 'Section 26 of Environment Protection Act', authority: 'CPCB / SPCB / MoEF&CC', maxFine: '₹1,00,000 per day to ₹5,00,00,000', imprisonment: 'Imprisonment up to 5 years for serious environmental violations', description: 'Environmental laws protect air, water, and land from pollution. Violations can result in massive daily fines, plant closure, and imprisonment.' },
  'Shop & Establishment Act': { section: 'State-specific provisions', authority: 'Municipal Corporation / State Labour Department', maxFine: '₹250 to ₹10,000 per day of violation', imprisonment: 'None', description: 'The Shops and Establishments Act regulates conditions of work including hours, holidays, and employment conditions in shops and commercial establishments.' },
  'Custom Act': { section: 'Sections 111-114 of Customs Act', authority: 'Central Board of Indirect Taxes (CBIC) / Customs Department', maxFine: 'Up to 5 times the value of goods', imprisonment: 'Imprisonment up to 5 years for smuggling and duty evasion', description: 'The Customs Act governs import and export of goods. Violations including smuggling and duty evasion attract severe penalties including goods seizure and imprisonment.' },
  'Professional Tax': { section: 'State-specific provisions', authority: 'State Tax / Revenue Department', maxFine: '₹1,000 to ₹5,000 + interest at 1.25% per month', imprisonment: 'None', description: 'Professional tax is a state-level tax on professions, trades, and employment. Non-compliance attracts penalties and interest charges.' },
  'RBI Act': { section: 'Section 58B of RBI Act', authority: 'Reserve Bank of India', maxFine: 'Up to ₹10 Crore or twice the amount involved', imprisonment: 'Imprisonment up to 3 years for serious violations', description: 'RBI regulations govern banking, financial services, and monetary policy compliance. Non-compliance can result in heavy fines and imprisonment.' },
  'Other': { section: 'Applicable provisions', authority: 'Relevant Regulatory Authority', maxFine: 'Varies by regulation', imprisonment: 'Varies by regulation', description: 'Various sector-specific regulations apply depending on your industry. Non-compliance may result in fines, license revocation, or criminal prosecution.' },
};

function ComplianceItem({ item, selected, onToggle, applicability }) {
  const penalty = item.penalties?.[0];
  const badgeConfig = {
    mandatory: { label: 'MANDATORY', color: 'bg-red-600 text-white' },
    recommended: { label: 'RECOMMENDED', color: 'bg-warning-500 text-white' }
  };
  const badge = applicability ? badgeConfig[applicability] : null;

  return (
    <div
      onClick={() => onToggle(item.id)}
      className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
        selected
          ? 'border-primary-500 bg-primary-50 shadow-md'
          : applicability === 'mandatory'
            ? 'border-red-300 bg-red-50/30 hover:border-red-400'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(item.id)}
          className="w-6 h-6 mt-1 rounded border-slate-300 text-primary-500 focus:ring-primary-500 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h4 className="font-bold text-slate-900 text-lg">{item.title}</h4>
            {badge && (
              <span className={`px-3 py-1 rounded text-xs font-bold ${badge.color}`}>
                {badge.label}
              </span>
            )}
            <span className={`px-3 py-1 rounded text-xs font-bold ${PRIORITY_LABELS[item.priority]?.color || 'bg-slate-300 text-slate-700'}`}>
              {PRIORITY_LABELS[item.priority]?.label || item.priority}
            </span>
            <span className={`px-3 py-1 rounded text-xs font-semibold border ${CATEGORY_LABELS[item.category]?.color || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
              {CATEGORY_LABELS[item.category]?.label || item.category}
            </span>
          </div>
          <p className="text-base text-slate-600 mt-2 leading-relaxed">{item.description}</p>
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <span className="text-sm font-medium text-slate-500">Law: {item.law}</span>
            <span className="text-slate-300">|</span>
            <span className="text-sm font-medium text-slate-500">Frequency: {FREQUENCY_LABELS[item.frequency]}</span>
          </div>
          {penalty && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-bold text-red-700 mb-1">NON-COMPLIANCE PENALTY:</p>
              <p className="text-sm text-red-600">{penalty.description}</p>
              <p className="text-sm font-semibold text-red-800 mt-1">Fine: {penalty.fine}</p>
              {penalty.imprisonment !== 'None' && (
                <p className="text-sm font-semibold text-red-800">Imprisonment: {penalty.imprisonment}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ComplianceSection({ title, icon, count, color, items, selectedIds, onToggle, onToggleAll, allSelected, impactMap }) {
  return (
    <div className="mb-10 last:mb-0">
      <div className={`flex items-center gap-4 mb-4 p-4 rounded-xl ${color}`}>
        <span className="text-2xl">{icon}</span>
        <h3 className="font-bold text-xl text-slate-900">{title}</h3>
        <span className="bg-white/80 text-slate-700 px-3 py-1 rounded-full text-sm font-bold">
          {count} items
        </span>
        <button
          onClick={onToggleAll}
          className="ml-auto text-base font-semibold text-primary-500 hover:text-primary-700 underline"
        >
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>
      <div className="space-y-3 ml-4">
        {items.map((item) => (
          <ComplianceItem
            key={item.id}
            item={item}
            selected={selectedIds.has(item.id)}
            onToggle={onToggle}
            applicability={impactMap?.[item.id]}
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
  const { data: impactData } = useGetImpactQuery();
  const [saveSelection, { isLoading: saving }] = useSaveComplianceSelectionMutation();
  const [autoCreate, { isLoading: creating }] = useAutoCreateCompliancesMutation();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [step, setStep] = useState('select');

  const canManage = user?.role === 'admin' || user?.role === 'developer' || user?.role === 'superadmin';

  useEffect(() => {
    if (!canManage && user) {
      navigate('/compliance');
    }
  }, [canManage, user, navigate]);

  useEffect(() => {
    if (optionsData?.selectedIds) {
      setSelectedIds(new Set(optionsData.selectedIds));
    }
  }, [optionsData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (impactData && !impactData.questionnaireCompleted && step === 'select') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-2xl border-2 border-slate-300">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-primary-300">
            <svg className="w-12 h-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">COMPLETE YOUR PROFILE FIRST</h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Before selecting compliances, please complete the <span className="font-bold text-primary-500">Compliance Profile Questionnaire</span> so we can identify which requirements are <span className="font-bold">mandatory</span> for your business.
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate('/questionnaire')}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-xl font-bold hover:from-primary-600 hover:to-primary-700 shadow-lg transition-all duration-200"
            >
              Start Questionnaire
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 border-2 border-slate-300 text-slate-700 rounded-xl text-xl font-bold hover:bg-slate-50 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (optionsData?.complianceSetupComplete && step === 'select') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-2xl border-2 border-slate-300">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-green-300">
            <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">COMPLIANCE SETUP COMPLETE</h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            You have <span className="font-bold text-primary-500">{optionsData?.selectedIds?.length || 0}</span> compliances selected for your{' '}
            <span className="font-bold">{SECTOR_LABELS[optionsData?.sector] || optionsData?.sector}</span> — <span className="font-bold">{optionsData?.industry}</span> business.
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setStep('select')}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-xl font-bold hover:from-primary-600 hover:to-primary-700 shadow-lg transition-all duration-200"
            >
              Review & Update Selection
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 border-2 border-slate-300 text-slate-700 rounded-xl text-xl font-bold hover:bg-slate-50 transition-colors"
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

  const impactMap = {};
  if (impactData?.impact) {
    (impactData.impact.mandatory || []).forEach((id) => { impactMap[id] = 'mandatory'; });
    (impactData.impact.recommended || []).forEach((id) => {
      if (!impactMap[id]) impactMap[id] = 'recommended';
    });
  }

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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-2xl border-2 border-slate-300">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-primary-300">
            <svg className="w-12 h-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">CREATE COMPLIANCE ITEMS</h2>
          <p className="text-xl text-slate-600 mb-8">
            Auto-generate compliance tracking items based on your <span className="font-bold text-primary-500">{selectedIds.size}</span> selections?
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={handleAutoCreate}
              disabled={creating}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-xl font-bold hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg transition-all duration-200"
            >
              {creating ? <LoadingSpinner size="sm" /> : 'Yes, Create All Items'}
            </button>
            <button
              onClick={() => setStep('select')}
              className="w-full py-4 border-2 border-slate-300 text-slate-700 rounded-xl text-xl font-bold hover:bg-slate-50 transition-colors"
            >
              Back to Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="w-full px-6 py-10 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Logo className="mx-auto mb-6" />
            <h1 className="text-5xl font-bold text-slate-900 tracking-tight mb-4">SELECT YOUR COMPLIANCES</h1>
            <p className="text-2xl text-slate-600">
              {SECTOR_LABELS[optionsData?.sector] || optionsData?.sector} — {optionsData?.industry}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-300 mb-12">
            <div className="p-8 border-b-2 border-slate-300 bg-slate-50">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">SECTION I — WHAT IS COMPLIANCE?</h2>
              <div className="space-y-4 text-lg text-slate-700 leading-relaxed">
                <p>
                  <strong>Compliance</strong> means following the laws, rules, and regulations that apply to your business. Every business in India — whether it is a small shop or a large factory — must comply with various central and state laws.
                </p>
                <p>
                  These laws exist to protect employees, consumers, the environment, and the public interest. <strong>If you do not comply, the government can impose heavy fines, seize your goods, shut down your operations, or even send you to prison.</strong>
                </p>
                <p>
                  The penalties for non-compliance are listed under each compliance item below. They are enforced by government authorities such as the Income Tax Department, GST Council, EPFO, ESIC, Pollution Control Boards, and others.
                </p>
              </div>
            </div>

            <div className="p-8 border-b-2 border-slate-300">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">SECTION II — KEY COMPLIANCE AREAS & PENALTIES</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(LAW_PENALTIES).filter(([key]) => key !== 'Other').map(([law, info]) => (
                  <div key={law} className="p-5 bg-slate-50 border-2 border-slate-200 rounded-xl">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{law}</h3>
                    <p className="text-base text-slate-600 mb-3 leading-relaxed">{info.description}</p>
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-500"><span className="font-bold text-slate-700">Authority:</span> {info.authority}</p>
                      <p className="text-slate-500"><span className="font-bold text-slate-700">Section:</span> {info.section}</p>
                      <p className="text-red-700 font-semibold">Max Fine: {info.maxFine}</p>
                      <p className="text-red-700 font-semibold">Imprisonment: {info.imprisonment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">SECTION III — SELECT APPLICABLE COMPLIANCES</h2>

              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search compliances..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-slate-300 rounded-xl text-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-6 py-4 border-2 border-slate-300 rounded-xl text-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                >
                  <option value="all">All Categories</option>
                  <option value="registration">Registration</option>
                  <option value="licence">License</option>
                  <option value="filing">Filing</option>
                  <option value="payment">Payment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex items-center justify-between mb-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleAll}
                    className="w-5 h-5 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-lg font-semibold text-slate-700">Select all filtered ({totalFiltered})</span>
                </label>
                <div className="text-xl text-slate-600">
                  <span className="font-bold text-primary-500">{selectedIds.size}</span> of {totalAll} selected
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {totalFiltered === 0 ? (
                  <div className="text-center py-16 text-slate-500 text-xl">No compliances match your search.</div>
                ) : (
                  <>
                    {filteredCommon.length > 0 && (
                      <ComplianceSection
                        title="COMMON FOR ALL SECTORS & INDUSTRIES"
                        icon="📋"
                        count={filteredCommon.length}
                        color="bg-primary-50 border-2 border-primary-200"
                        items={filteredCommon}
                        selectedIds={selectedIds}
                        onToggle={toggleSelect}
                        onToggleAll={() => toggleGroup(filteredCommon)}
                        allSelected={filteredCommon.every(i => selectedIds.has(i.id))}
                        impactMap={impactMap}
                      />
                    )}

                    {filteredSector.length > 0 && (
                      <ComplianceSection
                        title={`COMMON FOR ${SECTOR_LABELS[optionsData?.sector]?.toUpperCase() || optionsData?.sector?.toUpperCase()} SECTOR`}
                        icon="🏭"
                        count={filteredSector.length}
                        color="bg-primary-50 border-2 border-primary-200"
                        items={filteredSector}
                        selectedIds={selectedIds}
                        onToggle={toggleSelect}
                        onToggleAll={() => toggleGroup(filteredSector)}
                        allSelected={filteredSector.every(i => selectedIds.has(i.id))}
                        impactMap={impactMap}
                      />
                    )}

                    {filteredIndustry.length > 0 && (
                      <ComplianceSection
                        title={`SPECIFIC TO ${optionsData?.industry?.toUpperCase()}`}
                        icon="⚙️"
                        count={filteredIndustry.length}
                        color="bg-purple-50 border-2 border-purple-200"
                        items={filteredIndustry}
                        selectedIds={selectedIds}
                        onToggle={toggleSelect}
                        onToggleAll={() => toggleGroup(filteredIndustry)}
                        allSelected={filteredIndustry.every(i => selectedIds.has(i.id))}
                        impactMap={impactMap}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-300 p-8 mb-12">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSave}
                disabled={saving || selectedIds.size === 0}
                className="flex-1 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-xl font-bold hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg transition-all duration-200"
              >
                {saving ? <LoadingSpinner size="sm" /> : (
                  <>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    SAVE SELECTION ({selectedIds.size})
                  </>
                )}
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-xl text-xl font-bold hover:bg-slate-50 transition-colors"
              >
                SKIP FOR NOW
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
