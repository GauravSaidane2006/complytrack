import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useUploadDocumentMutation, useGetVerificationStatusQuery, useDevBypassMutation } from '../store/api/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SECTOR_DOCS = {
  service: [
    { type: 'company_registration', name: 'Company Registration Certificate', description: 'Certificate of incorporation from MCA', icon: '📄', required: true },
    { type: 'gst_certificate', name: 'GST Certificate', description: 'GST registration certificate', icon: '📋', required: true },
    { type: 'pan_card', name: 'PAN Card', description: 'Company PAN card from NSDL/UTIITSL', icon: '💳', required: true }
  ],
  manufacturing: [
    { type: 'company_registration', name: 'Company Registration Certificate', description: 'Certificate of incorporation from MCA', icon: '📄', required: true },
    { type: 'factory_license', name: 'Factory License', description: 'License from State Labour Department', icon: '🏭', required: true },
    { type: 'pollution_consent', name: 'Pollution Board Consent', description: 'CTE/CTO from State Pollution Control Board', icon: '🌿', required: true },
    { type: 'pan_card', name: 'PAN Card', description: 'Company PAN card from NSDL/UTIITSL', icon: '💳', required: true }
  ],
  trading: [
    { type: 'gst_certificate', name: 'GST Certificate', description: 'GST registration certificate', icon: '📋', required: true },
    { type: 'shop_establishment', name: 'Shop & Establishment License', description: 'License from State Labour Department', icon: '🏪', required: true },
    { type: 'pan_card', name: 'PAN Card', description: 'PAN card from NSDL/UTIITSL', icon: '💳', required: true }
  ]
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, organization } = useSelector((state) => state.auth);
  const [uploadDocument, { isLoading: uploading }] = useUploadDocumentMutation();
  const { data: verificationData, isLoading: loadingStatus } = useGetVerificationStatusQuery();
  const [devBypass, { isLoading: bypassing }] = useDevBypassMutation();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [completedSteps, setCompletedSteps] = useState([]);

  const sector = user?.sector || organization?.sector || 'service';
  const requiredDocs = SECTOR_DOCS[sector] || [];
  const verificationStatus = verificationData?.verificationStatus || organization?.verificationStatus;

  if (loadingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (verificationStatus === 'verified') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md border border-stone-200/60">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">You're All Set!</h2>
          <p className="text-stone-500 mb-6">Your account has been verified. Welcome to ComplyTrack India!</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-medium hover:from-orange-700 hover:to-orange-600 shadow-lg shadow-orange-500/25 transition-all duration-200"
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

    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', docType);
    formData.append('sector', sector);

    try {
      await uploadDocument(formData).unwrap();
      setUploadedFiles({ ...uploadedFiles, [docType]: file.name });
      setCompletedSteps([...completedSteps, currentStep]);
      toast.success('Document uploaded successfully!');
      
      if (currentStep < requiredDocs.length - 1) {
        setTimeout(() => setCurrentStep(currentStep + 1), 1000);
      }
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

  const allUploaded = requiredDocs.every(doc => uploadedFiles[doc.type]);
  const progress = (completedSteps.length / requiredDocs.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 mb-4 shadow-xl shadow-orange-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome to ComplyTrack!</h1>
          <p className="text-stone-400 mt-2">Let's complete your onboarding by uploading required documents</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-stone-200/60">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-stone-700">Onboarding Progress</span>
              <span className="text-sm text-stone-500">{completedSteps.length} of {requiredDocs.length} documents</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {requiredDocs.map((doc, index) => (
              <button
                key={doc.type}
                onClick={() => setCurrentStep(index)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentStep === index
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/25'
                    : completedSteps.includes(index)
                    ? 'bg-orange-50 text-orange-700 border border-orange-200/60'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                {completedSteps.includes(index) ? '✓' : index + 1} {doc.name.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </div>

          <div className="max-w-2xl mx-auto">
            {requiredDocs[currentStep] && (
              <div className="text-center">
                <div className="text-6xl mb-4">{requiredDocs[currentStep].icon}</div>
                <h2 className="text-2xl font-bold text-stone-900 mb-2">
                  {requiredDocs[currentStep].name}
                </h2>
                <p className="text-stone-500 mb-6">
                  {requiredDocs[currentStep].description}
                </p>

                {uploadedFiles[requiredDocs[currentStep].type] ? (
                  <div className="p-6 bg-emerald-50 border-2 border-emerald-200/60 rounded-2xl">
                    <div className="flex items-center justify-center gap-3 text-emerald-700">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium">Uploaded: {uploadedFiles[requiredDocs[currentStep].type]}</span>
                    </div>
                    {currentStep < requiredDocs.length - 1 && (
                      <button
                        onClick={() => setCurrentStep(currentStep + 1)}
                        className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-medium hover:from-orange-700 hover:to-orange-600 shadow-md shadow-orange-500/25 transition-all duration-200"
                      >
                        Next Document →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-stone-300 rounded-2xl hover:border-orange-400 transition-colors">
                    <input
                      type="file"
                      id={`file-${currentStep}`}
                      onChange={(e) => handleFileUpload(requiredDocs[currentStep].type, e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                    <label
                      htmlFor={`file-${currentStep}`}
                      className="cursor-pointer"
                    >
                      {uploading ? (
                        <div className="flex flex-col items-center gap-3">
                          <LoadingSpinner size="lg" />
                          <span className="text-stone-500">Uploading...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-stone-700">Click to upload or drag and drop</p>
                            <p className="text-sm text-stone-500">PDF, JPG, PNG (Max 10MB)</p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                )}

                <div className="mt-6 flex justify-center gap-4">
                  <button
                    onClick={() => navigate('/register/help')}
                    className="text-sm text-stone-500 hover:text-stone-700 flex items-center gap-1 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Need help obtaining this document?
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-stone-200">
            <div className="flex flex-col sm:flex-row gap-3">
              {user?.isDev && (
                <button
                  onClick={handleDevBypass}
                  disabled={bypassing}
                  className="px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium text-sm hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md transition-all duration-200"
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
                className="px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-medium text-sm hover:from-orange-700 hover:to-orange-600 flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Select Compliances
              </button>

              <button
                onClick={() => navigate('/verification-status')}
                className="px-4 py-3 border border-stone-200 text-stone-700 rounded-xl font-medium text-sm hover:bg-stone-50 flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View Status
              </button>

              <button
                onClick={() => navigate('/register/help')}
                className="px-4 py-3 border border-stone-200 text-stone-700 rounded-xl font-medium text-sm hover:bg-stone-50 flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Help Center
              </button>

              <button
                onClick={() => navigate('/contact-support')}
                className="px-4 py-3 border border-stone-200 text-stone-700 rounded-xl font-medium text-sm hover:bg-stone-50 flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Support
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-3 border border-stone-200 text-stone-700 rounded-xl font-medium text-sm hover:bg-stone-50 transition-colors"
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
