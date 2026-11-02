import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetOnboardingHelpQuery } from '../store/api/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Logo from '../components/common/Logo';

const PRIORITY_COLORS = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-primary-100 text-primary-700',
  medium: 'bg-warning-100 text-warning-700',
  low: 'bg-slate-100 text-slate-600'
};

export default function DocumentHelp() {
  const navigate = useNavigate();
  const { user, organization } = useSelector((state) => state.auth);
  const sector = user?.sector || organization?.sector || 'service';
  const industry = organization?.industry || '';
  const [expandedDoc, setExpandedDoc] = useState(null);

  const { data: helpData, isLoading } = useGetOnboardingHelpQuery({ sector, industry });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const allDocs = helpData?.allDocs || [];

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="w-full px-4 py-8 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <Logo className="mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">Document Help Center</h1>
            <p className="text-xl text-slate-600">
              Complete guide to obtain all required documents for your {helpData?.sectorLabel || sector} business
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-300 mb-8">
            <div className="p-6 border-b-2 border-slate-300 bg-slate-50">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{helpData?.sectorLabel} Sector Requirements</h2>
              <p className="text-slate-600">
                {allDocs.length} documents required for {industry || 'your business'}
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {allDocs.map((doc, index) => (
                  <div
                    key={doc.type}
                    className={`border-2 rounded-xl overflow-hidden transition-all duration-200 ${
                      expandedDoc === doc.type ? 'border-primary-300' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div
                      onClick={() => setExpandedDoc(expandedDoc === doc.type ? null : doc.type)}
                      className="flex items-center gap-4 p-5 cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        {doc.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900">{doc.name}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${PRIORITY_COLORS[doc.priority] || PRIORITY_COLORS.medium}`}>
                            {doc.priority?.toUpperCase() || 'REQUIRED'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-1">{doc.description}</p>
                      </div>
                      <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedDoc === doc.type ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {expandedDoc === doc.type && (
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
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-300 p-6 mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Still Need Help?</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/contact-support')}
                className="p-4 border-2 border-slate-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/30 transition-all duration-200 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 text-primary-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Contact Support</h4>
                    <p className="text-xs text-slate-500">Get help from our team</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/onboarding')}
                className="p-4 border-2 border-slate-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/30 transition-all duration-200 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 text-primary-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Upload Documents</h4>
                    <p className="text-xs text-slate-500">Upload your required documents</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-4 p-4 bg-slate-50 rounded-xl">
              <h4 className="font-medium text-slate-900 mb-2">Customer Support Hours</h4>
              <p className="text-sm text-slate-600">Monday - Friday: 9:00 AM - 6:00 PM IST</p>
              <p className="text-sm text-slate-600">Saturday: 10:00 AM - 2:00 PM IST</p>
              <p className="text-sm text-slate-600">Email: support@complytrack.in</p>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
