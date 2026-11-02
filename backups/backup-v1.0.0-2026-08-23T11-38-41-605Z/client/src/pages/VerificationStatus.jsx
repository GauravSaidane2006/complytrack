import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetVerificationStatusQuery } from '../store/api/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { LogoWithTagline } from '../components/common/Logo';

export default function VerificationStatus() {
  const navigate = useNavigate();
  const { user, organization } = useSelector((state) => state.auth);
  const { data: verificationData, isLoading } = useGetVerificationStatusQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen canvas-gradient flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const verificationStatus = verificationData?.verificationStatus || organization?.verificationStatus || 'pending';
  const documents = verificationData?.documents || organization?.documents || [];
  const missingDocs = verificationData?.missingDocuments || [];

  const getStatusConfig = (status) => {
    switch (status) {
      case 'verified':
        return {
          color: 'emerald',
          icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          title: 'Account Verified',
          description: 'Your account has been verified. You can now access all features.',
          action: 'Go to Dashboard',
          actionPath: '/dashboard'
        };
      case 'under_review':
        return {
          color: 'amber',
          icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: 'Under Review',
          description: 'Your documents are being reviewed. This usually takes 1-2 business days.',
          action: 'Back to Dashboard',
          actionPath: '/dashboard'
        };
      case 'rejected':
        return {
          color: 'rose',
          icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          title: 'Documents Rejected',
          description: 'Some documents were rejected. Please review and re-upload.',
          action: 'Re-upload Documents',
          actionPath: '/register/documents'
        };
      case 'documents_required':
        return {
          color: 'primary',
          icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          title: 'Documents Required',
          description: 'Please upload the required documents to complete verification.',
          action: 'Upload Documents',
          actionPath: '/register/documents'
        };
      default:
        return {
          color: 'slate',
          icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: 'Pending',
          description: 'Your verification is pending.',
          action: 'Upload Documents',
          actionPath: '/register/documents'
        };
    }
  };

  const config = getStatusConfig(verificationStatus);
  const colorClasses = {
    emerald: 'bg-success-100 text-success-600',
    amber: 'bg-warning-100 text-warning-600',
    rose: 'bg-danger-100 text-danger-500',
    orange: 'bg-primary-100 text-primary-500',
    stone: 'bg-slate-100 text-slate-600'
  };

  return (
    <div className="min-h-screen canvas-gradient p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <LogoWithTagline light className="mb-4" />
          <h1 className="text-3xl font-bold text-white tracking-tight">Verification Status</h1>
          <p className="text-slate-400 mt-2">Track your account verification progress</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-200/60">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-full ${colorClasses[config.color]} flex items-center justify-center mx-auto mb-4`}>
              {config.icon}
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{config.title}</h2>
            <p className="text-slate-500 mt-2">{config.description}</p>
          </div>

          {verificationStatus === 'under_review' && (
            <div className="mb-6 p-4 bg-warning-50 border border-warning-200/60 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-warning-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-medium text-warning-700">Review in Progress</h4>
                  <p className="text-sm text-warning-700 mt-1">
                    Our team is reviewing your documents. You will be notified once the review is complete.
                    Estimated time: 1-2 business days.
                  </p>
                </div>
              </div>
            </div>
          )}

          {verificationStatus === 'rejected' && missingDocs.length > 0 && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200/60 rounded-xl">
              <h4 className="font-medium text-rose-800 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Missing Documents
              </h4>
              <ul className="mt-2 space-y-1">
                {missingDocs.map((doc, i) => (
                  <li key={i} className="text-sm text-danger-600">• {doc.name}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Uploaded Documents</h3>
            {documents.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No documents uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        doc.status === 'approved' ? 'bg-success-100 text-success-600' :
                        doc.status === 'rejected' ? 'bg-danger-100 text-danger-500' :
                        'bg-warning-100 text-warning-600'
                      }`}>
                        {doc.status === 'approved' ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : doc.status === 'rejected' ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{doc.originalName}</p>
                        <p className="text-xs text-slate-500">{doc.documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                      doc.status === 'approved' ? 'bg-success-100 text-success-700' :
                      doc.status === 'rejected' ? 'bg-danger-100 text-danger-600' :
                      'bg-warning-100 text-warning-700'
                    }`}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(config.actionPath)}
              className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium text-sm hover:from-primary-600 hover:to-primary-700 flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all duration-200"
            >
              {config.action}
            </button>
            <button
              onClick={() => navigate('/register/help')}
              className="px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Need Help?
            </button>
            <button
              onClick={() => navigate('/contact-support')}
              className="px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Support
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
