import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useRegisterMutation } from '../store/api/api';
import { setCredentials } from '../store/slices/authSlice';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const INDUSTRIES_BY_SECTOR = {
  service: [
    'Information Technology (IT)',
    'IT-ITeS / BPO / KPO',
    'Telecom',
    'Consulting & Advisory',
    'Digital Marketing & Media',
    'Financial Services & FinTech',
    'Banking & Insurance',
    'Healthcare Services',
    'Education & EdTech',
    'Hospitality & Tourism',
    'Logistics & Supply Chain',
    'Real Estate & Construction',
    'Legal & Accounting Services',
    'Architecture & Interior Design',
    'Advertising & PR',
    'Transportation & Courier',
    'Other Service'
  ],
  manufacturing: [
    'Automobile & Auto Components',
    'Pharmaceuticals & Medical Devices',
    'Textiles & Garments',
    'Food & Beverage Processing',
    'Chemicals & Petrochemicals',
    'Electronics & IT Hardware',
    'Metals, Steel & Foundries',
    'Cement & Building Materials',
    'Plastics & Rubber',
    'Paper & Printing',
    'Engineering & Machinery',
    'Defense & Aerospace',
    'Shipbuilding & Repair',
    'FMCG (Fast Moving Consumer Goods)',
    'Furniture & Wood Products',
    'Other Manufacturing'
  ],
  trading: [
    'Retail (General Store / Kirana)',
    'Grocery & Supermarket',
    'Electronics & Appliances',
    'Clothing & Footwear',
    'Jewellery & Accessories',
    'Furniture & Home Décor',
    'Building Materials & Hardware',
    'Pharmacy & Medical Store',
    'Stationery & Office Supplies',
    'Auto Parts & Accessories',
    'Wholesale / Distribution',
    'E-Commerce & Online Trading',
    'Import & Export Trading',
    'Agricultural Inputs (Seeds, Fertilizers)',
    'Petroleum & Fuel Dealers',
    'Other Trading / Retail'
  ]
};

const COMPANY_TYPES = [
  { id: 'private_limited', name: 'Private Limited (Pvt Ltd)' },
  { id: 'public_limited', name: 'Public Limited (Ltd)' },
  { id: 'one_person', name: 'One Person Company (OPC)' },
  { id: 'llp', name: 'Limited Liability Partnership (LLP)' },
  { id: 'sole_proprietorship', name: 'Sole Proprietorship' },
  { id: 'partnership', name: 'Partnership Firm' },
  { id: 'huf', name: 'Hindu Undivided Family (HUF)' },
  { id: 'society', name: 'Society / Trust / NGO' },
];

const SECTORS = [
  {
    id: 'service',
    name: 'Service Sector',
    description: 'IT, Telecom, BPO, Consulting, Digital Services',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    docs: ['Company Registration Certificate', 'GST Certificate', 'PAN Card']
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing Sector',
    description: 'Factories, Industrial, Production, Assembly',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    docs: ['Company Registration Certificate', 'Factory License', 'Pollution Board Consent', 'PAN Card']
  },
  {
    id: 'trading',
    name: 'Trading Sector',
    description: 'Shops, Retail, Wholesale, Buying & Selling',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    ),
    docs: ['GST Certificate', 'Shop & Establishment License', 'PAN Card']
  }
];

export default function RegistrationFlow() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [register, { isLoading }] = useRegisterMutation();
  
  const [step, setStep] = useState(1);
  const [selectedSector, setSelectedSector] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
    companyType: '',
    phone: '',
    industry: '',
    employeeCount: ''
  });
  const [errors, setErrors] = useState({});

  if (isAuthenticated || sessionStorage.getItem('user')) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleSectorSelect = (sector) => {
    setSelectedSector(sector);
    setStep(2);
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.password || form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (form.password && !/[A-Z]/.test(form.password)) newErrors.password = 'Password must contain an uppercase letter';
    if (form.password && !/[0-9]/.test(form.password)) newErrors.password = 'Password must contain a number';
    if (form.password && !/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) newErrors.password = 'Password must contain a special character';
    if (!form.organizationName.trim()) newErrors.organizationName = 'Company name is required';
    if (!form.companyType) newErrors.companyType = 'Please select company type';
    if (!form.industry) newErrors.industry = 'Please select an industry';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    const payload = {
      ...form,
      sector: selectedSector.id
    };
    Object.keys(payload).forEach(key => {
      if (payload[key] === '' || payload[key] === null) {
        delete payload[key];
      }
    });
    if (payload.employeeCount) {
      payload.employeeCount = Number(payload.employeeCount);
    }

    try {
      const result = await register(payload).unwrap();
      dispatch(setCredentials(result));
      
      if (result.requiresVerification) {
        toast.success('Account created! Let\'s complete your onboarding.');
        navigate('/onboarding');
      } else {
        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Registration failed');
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2].map((s) => (
        <div key={s} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
            step >= s ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30' : 'bg-stone-100 text-stone-500'
          }`}>
            {s}
          </div>
          {s < 2 && (
            <div className={`w-16 h-1 mx-2 rounded-full transition-all duration-300 ${step > s ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-stone-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 mb-4 shadow-xl shadow-orange-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ComplyTrack India</h1>
          <p className="text-stone-400 mt-2">Create your organization account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-stone-200/60">
          {renderStepIndicator()}

          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-stone-900 mb-2">Select Your Sector</h2>
              <p className="text-stone-500 text-sm mb-6">Choose your business sector to get tailored compliance requirements</p>
              
              <div className="grid gap-4">
                {SECTORS.map((sector) => (
                  <button
                    key={sector.id}
                    onClick={() => handleSectorSelect(sector)}
                    className={`w-full p-5 border-2 rounded-2xl text-left transition-all duration-200 ${
                      selectedSector?.id === sector.id
                        ? 'border-orange-500 bg-orange-50/60 shadow-md shadow-orange-500/10'
                        : 'border-stone-200 hover:border-orange-300 hover:bg-orange-50/30'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                        {sector.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-stone-900">{sector.name}</h3>
                        <p className="text-sm text-stone-500 mt-1">{sector.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {sector.docs.map((doc, i) => (
                            <span key={i} className="text-xs bg-stone-100 text-stone-600 px-2.5 py-1 rounded-lg">
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-stone-900">Account Details</h2>
                  <p className="text-sm text-stone-500">Sector: <span className="font-medium text-orange-600">{selectedSector?.name}</span></p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-stone-500 hover:text-stone-700 flex items-center gap-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Change
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${errors.name ? 'border-rose-300' : 'border-stone-200'}`}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="text-xs text-rose-500 mt-1.5">{errors.name}</p>}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${errors.email ? 'border-rose-300' : 'border-stone-200'}`}
                      placeholder="john@company.com"
                    />
                    {errors.email && <p className="text-xs text-rose-500 mt-1.5">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Password *</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${errors.password ? 'border-rose-300' : 'border-stone-200'}`}
                    placeholder="Min 8 chars, uppercase, number, special char"
                  />
                  {errors.password && <p className="text-xs text-rose-500 mt-1.5">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Company Name *</label>
                  <input
                    type="text"
                    value={form.organizationName}
                    onChange={(e) => handleChange('organizationName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${errors.organizationName ? 'border-rose-300' : 'border-stone-200'}`}
                    placeholder="Your company name"
                  />
                  {errors.organizationName && <p className="text-xs text-rose-500 mt-1.5">{errors.organizationName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Company Type *</label>
                  <select
                    value={form.companyType}
                    onChange={(e) => handleChange('companyType', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-white ${errors.companyType ? 'border-rose-300' : 'border-stone-200'}`}
                  >
                    <option value="">Select company type</option>
                    {COMPANY_TYPES.map((ct) => (
                      <option key={ct.id} value={ct.id}>{ct.name}</option>
                    ))}
                  </select>
                  {errors.companyType && <p className="text-xs text-rose-500 mt-1.5">{errors.companyType}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      placeholder="+91 74994 7550"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Industry *</label>
                    <select
                      value={form.industry}
                      onChange={(e) => handleChange('industry', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-white ${errors.industry ? 'border-rose-300' : 'border-stone-200'}`}
                    >
                      <option value="">Select your industry</option>
                      {(INDUSTRIES_BY_SECTOR[selectedSector?.id] || []).map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                    {errors.industry && <p className="text-xs text-rose-500 mt-1.5">{errors.industry}</p>}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-3 border border-stone-200 text-stone-700 rounded-xl font-medium text-sm hover:bg-stone-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-medium text-sm hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all duration-200"
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-stone-500">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-600 hover:text-orange-700 font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
