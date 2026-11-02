import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useUploadDocumentMutation, useGetOnboardingRequirementsQuery, useDevBypassMutation } from '../store/api/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Logo from '../components/common/Logo';

const PRIORITY_COLORS = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  high: 'bg-primary-100 text-primary-700 border-primary-300',
  medium: 'bg-warning-100 text-warning-700 border-amber-300',
  low: 'bg-slate-100 text-slate-600 border-slate-300'
};

const STATUS_ICONS = {
  approved: { color: 'text-success-600', bg: 'bg-success-100', label: 'Approved' },
  pending: { color: 'text-warning-600', bg: 'bg-warning-100', label: 'Under Review' },
  rejected: { color: 'text-red-600', bg: 'bg-red-100', label: 'Rejected' }
};

function DocumentCard({ doc, index, isExpanded, onToggle, uploaded, status, onUpload, uploading, panNumber, gstinNumber }) {
  const hasUpload = uploaded || status;

  return (
    <div className={`border-2 rounded-xl overflow-hidden transition-all duration-200 ${
      hasUpload ? 'border-success-200 bg-success-50/30' : 'border-slate-200 hover:border-primary-300'
    }`}>
      <div
        onClick={onToggle}
        className="flex items-center gap-4 p-5 cursor-pointer"
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
          hasUpload ? 'bg-success-100' : 'bg-slate-100'
        }`}>
          {hasUpload ? '✓' : doc.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-900">{doc.name}</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${PRIORITY_COLORS[doc.priority] || PRIORITY_COLORS.medium}`}>
              {doc.priority?.toUpperCase() || 'REQUIRED'}
            </span>
            {status && (
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${STATUS_ICONS[status]?.bg} ${STATUS_ICONS[status]?.color}`}>
                {STATUS_ICONS[status]?.label}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1 line-clamp-1">{doc.description}</p>
        </div>
        <svg className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 border-t border-slate-200">
          <div className="pt-4 space-y-4">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h4 className="font-bold text-blue-900 mb-2">Why is this required?</h4>
              <p className="text-sm text-primary-700 leading-relaxed">{doc.whyNeeded}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-bold text-slate-900 mb-2">How to obtain</h4>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-slate-600">Official Portal:</span>
                <a
                  href={doc.portal?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-primary-500 hover:text-primary-700 underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {doc.portal?.name || 'Government Portal'} ↗
                </a>
              </div>
              {doc.process && (
                <ol className="space-y-2">
                  {doc.process.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-slate-700">{step}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h4 className="font-bold text-slate-900 mb-2">Documents Required</h4>
                <ul className="space-y-1.5">
                  {(doc.documentsRequired || []).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-primary-500 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h4 className="font-bold text-slate-900 mb-2">Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Processing Time:</span>
                      <span className="font-medium text-slate-700">{doc.estimatedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Estimated Cost:</span>
                      <span className="font-medium text-slate-700">{doc.estimatedCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Validity:</span>
                      <span className="font-medium text-slate-700">{doc.validity}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-warning-700">
                    <span className="font-bold">Legal Reference:</span> {doc.officialRef}
                  </p>
                </div>
              </div>
            </div>

            {!hasUpload && (
              <div className="pt-2 space-y-3">
                {(doc.type === 'pan_card' || doc.type === 'gst_certificate') && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      {doc.type === 'pan_card' ? 'PAN Number' : 'GSTIN Number'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={doc.type === 'pan_card' ? panNumber : gstinNumber}
                        onChange={(e) => doc.type === 'pan_card' ? null : null}
                        placeholder={doc.type === 'pan_card' ? 'e.g., ABCDE1234F' : 'e.g., 22AAAAA0000A1Z5'}
                        readOnly
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                      />
                      <span className="text-xs text-slate-500 self-center">Enter in fields below</span>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  id={`file-${doc.type}`}
                  onChange={(e) => onUpload(doc.type, e.target.files[0])}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <label
                  htmlFor={`file-${doc.type}`}
                  className={`w-full py-3 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {uploading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload Document
                    </>
                  )}
                </label>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, organization } = useSelector((state) => state.auth);
  const [uploadDocument, { isLoading: uploading }] = useUploadDocumentMutation();
  const { data: onboardingData, isLoading: loadingRequirements } = useGetOnboardingRequirementsQuery();
  const [devBypass, { isLoading: bypassing }] = useDevBypassMutation();

  const [expandedDoc, setExpandedDoc] = useState(null);
  const [activeTab, setActiveTab] = useState('common');
  const [panNumber, setPanNumber] = useState(organization?.pan || '');
  const [gstinNumber, setGstinNumber] = useState(organization?.gstin || '');

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  const verificationStatus = onboardingData?.verificationStatus || organization?.verificationStatus;

  if (loadingRequirements) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (verificationStatus === 'verified') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-2xl border-2 border-slate-300">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-green-300">
            <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">You're All Set!</h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Your account has been verified. Welcome to ComplyTrack India!
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-xl font-bold hover:from-primary-600 hover:to-primary-700 shadow-lg transition-all duration-200"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleFileUpload = async (docType, file) => {
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only PDF, JPG, and PNG are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    if (docType === 'pan_card' && panNumber && !panRegex.test(panNumber.toUpperCase())) {
      toast.error('Invalid PAN format. Must be 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F).');
      return;
    }

    if (docType === 'gst_certificate' && gstinNumber && !gstRegex.test(gstinNumber.toUpperCase())) {
      toast.error('Invalid GSTIN format. Must be 15 characters (e.g., 22AAAAA0000A1Z5).');
      return;
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', docType);
    formData.append('sector', onboardingData?.sector || 'service');
    if (docType === 'pan_card' && panNumber) {
      formData.append('panNumber', panNumber.toUpperCase());
    }
    if (docType === 'gst_certificate' && gstinNumber) {
      formData.append('gstinNumber', gstinNumber.toUpperCase());
    }

    try {
      await uploadDocument(formData).unwrap();
      toast.success('Document uploaded successfully!');
    } catch (err) {
      toast.error(err?.data?.message || 'Upload failed');
    }
  };

  const handleDevBypass = async () => {
    try {
      await devBypass().unwrap();
      toast.success('DEV bypass successful! Account verified.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.data?.message || 'DEV bypass failed');
    }
  };

  const commonDocs = onboardingData?.commonDocs || [];
  const industryDocs = onboardingData?.industryDocs || [];
  const stats = onboardingData?.stats || { total: 0, uploaded: 0, approved: 0, rejected: 0, pending: 0, missing: 0 };
  const progress = stats.total > 0 ? (stats.uploaded / stats.total) * 100 : 0;

  const docsToShow = activeTab === 'common' ? commonDocs : industryDocs;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="w-full px-4 py-8 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <Logo className="mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">COMPLETE YOUR ONBOARDING</h1>
            <p className="text-xl text-slate-600">
              {onboardingData?.sectorLabel} — {onboardingData?.industry}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-300 mb-8">
            <div className="p-6 border-b-2 border-slate-300 bg-slate-50">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Business Identification Numbers</h2>
              <p className="text-sm text-slate-600 mb-4">Enter your PAN and GSTIN numbers for document verification and compliance tracking.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase().slice(0, 10))}
                    placeholder="e.g., ABCDE1234F"
                    className={`w-full px-4 py-3 border-2 rounded-xl text-base font-mono tracking-wider focus:ring-2 focus:ring-primary-500/20 transition-all ${
                      panNumber && panRegex.test(panNumber) ? 'border-green-400 bg-green-50' : panNumber ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    }`}
                    maxLength={10}
                  />
                  {panNumber && (
                    <p className={`text-xs mt-1 font-medium ${panRegex.test(panNumber) ? 'text-green-600' : 'text-red-500'}`}>
                      {panRegex.test(panNumber) ? 'Valid PAN format' : 'Invalid: 5 letters + 4 digits + 1 letter'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={gstinNumber}
                    onChange={(e) => setGstinNumber(e.target.value.toUpperCase().slice(0, 15))}
                    placeholder="e.g., 22AAAAA0000A1Z5"
                    className={`w-full px-4 py-3 border-2 rounded-xl text-base font-mono tracking-wider focus:ring-2 focus:ring-primary-500/20 transition-all ${
                      gstinNumber && gstRegex.test(gstinNumber) ? 'border-green-400 bg-green-50' : gstinNumber ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    }`}
                    maxLength={15}
                  />
                  {gstinNumber && (
                    <p className={`text-xs mt-1 font-medium ${gstRegex.test(gstinNumber) ? 'text-green-600' : 'text-red-500'}`}>
                      {gstRegex.test(gstinNumber) ? 'Valid GSTIN format' : 'Invalid: 15 character GSTIN format'}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-b-2 border-slate-300 bg-slate-50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900">Required Documents</h2>
                <div className="text-lg">
                  <span className="font-bold text-primary-500">{stats.uploaded}</span>
                  <span className="text-slate-500"> of {stats.total} uploaded</span>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary-400 to-primary-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex gap-4 mt-3 text-sm">
                {stats.approved > 0 && (
                  <span className="text-success-600 font-medium">✓ {stats.approved} approved</span>
                )}
                {stats.pending > 0 && (
                  <span className="text-warning-600 font-medium">◷ {stats.pending} under review</span>
                )}
                {stats.rejected > 0 && (
                  <span className="text-red-600 font-medium">✗ {stats.rejected} rejected</span>
                )}
                {stats.missing > 0 && (
                  <span className="text-slate-500 font-medium">○ {stats.missing} remaining</span>
                )}
              </div>
            </div>

            {industryDocs.length > 0 && (
              <div className="flex border-b-2 border-slate-300">
                <button
                  onClick={() => { setActiveTab('common'); setExpandedDoc(null); }}
                  className={`flex-1 py-4 px-6 font-bold text-center transition-colors ${
                    activeTab === 'common'
                      ? 'text-primary-500 border-b-3 border-primary-600 bg-primary-50'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Common Documents ({commonDocs.length})
                </button>
                <button
                  onClick={() => { setActiveTab('industry'); setExpandedDoc(null); }}
                  className={`flex-1 py-4 px-6 font-bold text-center transition-colors ${
                    activeTab === 'industry'
                      ? 'text-primary-500 border-b-3 border-primary-600 bg-primary-50'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Industry-Specific ({industryDocs.length})
                </button>
              </div>
            )}

            <div className="p-6">
              <div className="space-y-4">
                {docsToShow.map((doc, index) => (
                  <DocumentCard
                    key={doc.type}
                    doc={doc}
                    index={index}
                    isExpanded={expandedDoc === doc.type}
                    onToggle={() => setExpandedDoc(expandedDoc === doc.type ? null : doc.type)}
                    uploaded={doc.uploaded}
                    status={doc.status}
                    onUpload={handleFileUpload}
                    uploading={uploading}
                    panNumber={panNumber}
                    gstinNumber={gstinNumber}
                  />
                ))}
                {docsToShow.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <p className="text-lg">No additional documents required for this industry.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-300 p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              {user?.isDev && (
                <button
                  onClick={handleDevBypass}
                  disabled={bypassing}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md transition-all duration-200"
                >
                  {bypassing ? <LoadingSpinner size="sm" /> : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      DEV Bypass
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => navigate('/compliance-setup')}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Select Compliances
              </button>

              <button
                onClick={() => navigate('/verification-status')}
                className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View Status
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
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
