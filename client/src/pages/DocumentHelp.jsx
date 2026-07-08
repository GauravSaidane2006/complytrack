import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetHelpContentQuery } from '../store/api/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SECTOR_INFO = {
  service: {
    title: 'Service Sector',
    description: 'IT, Telecom, BPO, Consulting, Digital Services',
    color: 'orange'
  },
  manufacturing: {
    title: 'Manufacturing Sector',
    description: 'Factories, Industrial, Production, Assembly',
    color: 'amber'
  },
  trading: {
    title: 'Trading Sector',
    description: 'Shops, Retail, Wholesale, Buying & Selling',
    color: 'amber'
  }
};

export default function DocumentHelp() {
  const navigate = useNavigate();
  const { user, organization } = useSelector((state) => state.auth);
  const sector = user?.sector || organization?.sector || 'service';
  const { data: helpData, isLoading } = useGetHelpContentQuery(sector);
  const sectorInfo = SECTOR_INFO[sector];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const colorClasses = {
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    teal: 'bg-teal-100 text-teal-800 border-teal-200'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 mb-4 shadow-xl shadow-orange-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Document Help Center</h1>
          <p className="text-stone-400 mt-2">Step-by-step guide to obtain required documents</p>
          <div className={`mt-3 inline-block px-3 py-1 rounded-full text-sm border ${colorClasses[sectorInfo.color]}`}>
            {sectorInfo.title}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-stone-200/60">
          {helpData && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-stone-900 mb-2">{helpData.title}</h2>
                <p className="text-stone-500">{helpData.description}</p>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-stone-900 mb-4">How to Obtain Required Documents</h3>
                <div className="space-y-6">
                  {helpData.steps.map((step, i) => (
                    <div key={i} className="border border-stone-200 rounded-2xl p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-bold flex-shrink-0">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-stone-900">{step.title}</h4>
                          <p className="text-sm text-stone-500 mt-1">{step.description}</p>
                          
                          <div className="mt-3 p-3.5 bg-stone-50 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              <span className="text-sm font-medium text-stone-700">{step.portal}</span>
                              <a
                                href={step.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                              >
                                Visit Portal →
                              </a>
                            </div>
                            <p className="text-xs text-stone-500 mb-2">Required documents:</p>
                            <div className="flex flex-wrap gap-2">
                              {step.documents.map((doc, j) => (
                                <span key={j} className="text-xs bg-white border border-stone-200 text-stone-600 px-2.5 py-1 rounded-lg">
                                  {doc}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-stone-500 mt-2">
                              <span className="font-medium">Estimated time:</span> {step.estimatedTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {helpData.faq && helpData.faq.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-stone-900 mb-4">Frequently Asked Questions</h3>
                  <div className="space-y-3">
                    {helpData.faq.map((item, i) => (
                      <div key={i} className="border border-stone-200 rounded-xl p-4">
                        <h4 className="font-medium text-stone-900">{item.question}</h4>
                        <p className="text-sm text-stone-600 mt-2">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="border-t border-stone-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Still Need Help?</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/contact-support')}
                className="p-4 border border-stone-200 rounded-2xl hover:border-orange-300 hover:bg-orange-50/30 transition-all duration-200 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-stone-900">Contact Support</h4>
                    <p className="text-xs text-stone-500">Get help from our team</p>
                  </div>
                </div>
              </button>

              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 border border-stone-200 rounded-2xl hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-stone-900">WhatsApp Support</h4>
                    <p className="text-xs text-stone-500">Chat with us instantly</p>
                  </div>
                </div>
              </a>
            </div>

            <div className="mt-4 p-4 bg-stone-50 rounded-xl">
              <h4 className="font-medium text-stone-900 mb-2">Customer Support Hours</h4>
              <p className="text-sm text-stone-600">Monday - Friday: 9:00 AM - 6:00 PM IST</p>
              <p className="text-sm text-stone-600">Saturday: 10:00 AM - 2:00 PM IST</p>
              <p className="text-sm text-stone-600">Email: support@complytrack.in</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/register/documents')}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-medium text-sm hover:from-orange-700 hover:to-orange-600 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Documents
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 border border-stone-200 text-stone-700 rounded-xl font-medium text-sm hover:bg-stone-50 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
