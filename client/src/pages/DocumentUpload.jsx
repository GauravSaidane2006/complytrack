import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useUploadDocumentMutation, useGetOnboardingRequirementsQuery, useDevBypassMutation } from '../store/api/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function DocumentUpload() {
  const navigate = useNavigate();
  const { user, organization } = useSelector((state) => state.auth);
  const [uploadDocument, { isLoading: uploading }] = useUploadDocumentMutation();
  const [devBypass, { isLoading: bypassing }] = useDevBypassMutation();
  const { data: onboardingData, isLoading: loadingStatus } = useGetOnboardingRequirementsQuery();
  
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [dragOver, setDragOver] = useState(null);
  const fileInputRefs = useRef({});

  const sector = user?.sector || organization?.sector || 'service';
  const industry = organization?.industry || '';
  const requiredDocs = [...(onboardingData?.commonDocs || []), ...(onboardingData?.industryDocs || [])];
  const existingDocs = organization?.documents || [];
  const verificationStatus = onboardingData?.verificationStatus || organization?.verificationStatus;

  if (verificationStatus === 'verified') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md border border-stone-200/60">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Account Verified!</h2>
          <p className="text-stone-500 mb-6">Your account has been verified. You can now access all features.</p>
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

  const handleFileSelect = async (docType, file) => {
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
      const result = await uploadDocument(formData).unwrap();
      setUploadedFiles({ ...uploadedFiles, [docType]: file.name });
      toast.success('Document uploaded successfully!');
    } catch (err) {
      toast.error(err?.data?.message || 'Upload failed');
    }
  };

  const handleDrop = (e, docType) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    handleFileSelect(docType, file);
  };

  const handleDragOver = (e, docType) => {
    e.preventDefault();
    setDragOver(docType);
  };

  const handleDragLeave = () => {
    setDragOver(null);
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

  const getDocStatus = (docType) => {
    const existing = existingDocs.find(d => d.documentType === docType);
    if (uploadedFiles[docType]) return 'uploaded';
    if (existing) return existing.status;
    return 'pending';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'uploaded':
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'uploaded': return 'Uploaded';
      case 'pending': return 'Pending Upload';
      case 'rejected': return 'Rejected';
      default: return 'Not Uploaded';
    }
  };

  const allRequiredUploaded = requiredDocs
    .filter(d => d.required)
    .every(d => getDocStatus(d.type) !== 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 mb-4 shadow-xl shadow-orange-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Upload Documents</h1>
          <p className="text-stone-400 mt-2">Please upload the required documents for verification</p>
          <div className="mt-3 inline-block bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm">
            Sector: {sector.charAt(0).toUpperCase() + sector.slice(1)}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-stone-200/60">
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200/60 rounded-xl">
            <h3 className="font-semibold text-orange-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Document Requirements
            </h3>
            <p className="text-sm text-orange-700 mt-1">
              Upload clear photos or PDF scans of your documents. Accepted formats: PDF, JPG, PNG (Max 10MB each).
            </p>
          </div>

          <div className="space-y-4">
            {requiredDocs.map((doc) => {
              const status = getDocStatus(doc.type);
              return (
                <div
                  key={doc.type}
                  className={`border-2 rounded-2xl p-4 transition-all duration-200 ${
                    dragOver === doc.type ? 'border-orange-500 bg-orange-50/60' : 'border-stone-200'
                  }`}
                  onDrop={(e) => handleDrop(e, doc.type)}
                  onDragOver={(e) => handleDragOver(e, doc.type)}
                  onDragLeave={handleDragLeave}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{doc.icon}</span>
                      <div>
                        <h4 className="font-medium text-stone-900">{doc.name}</h4>
                        {doc.required && (
                          <span className="text-xs text-rose-500 font-medium">Required</span>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(status)}`}>
                      {getStatusText(status)}
                    </span>
                  </div>

                  {status === 'pending' && (
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        ref={(el) => (fileInputRefs.current[doc.type] = el)}
                        onChange={(e) => handleFileSelect(doc.type, e.target.files[0])}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRefs.current[doc.type]?.click()}
                        disabled={uploading}
                        className="flex-1 py-2.5 border-2 border-dashed border-stone-300 rounded-xl text-stone-600 hover:border-orange-400 hover:text-orange-600 transition-colors flex items-center justify-center gap-2"
                      >
                        {uploading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Click to upload or drag and drop
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {status === 'rejected' && (
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        ref={(el) => (fileInputRefs.current[doc.type] = el)}
                        onChange={(e) => handleFileSelect(doc.type, e.target.files[0])}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRefs.current[doc.type]?.click()}
                        disabled={uploading}
                        className="flex-1 py-2.5 border-2 border-dashed border-rose-300 rounded-xl text-rose-600 hover:border-rose-500 transition-colors flex items-center justify-center gap-2"
                      >
                        {uploading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Re-upload document
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => navigate('/register/help')}
                        className="px-4 py-2.5 text-rose-600 hover:text-rose-700 font-medium text-sm"
                      >
                        Get Help
                      </button>
                    </div>
                  )}

                  {(status === 'uploaded' || status === 'approved') && (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-medium">
                        {uploadedFiles[doc.type] || existingDocs.find(d => d.documentType === doc.type)?.originalName || 'Document uploaded'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
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
              onClick={() => navigate('/register/help')}
              className="px-4 py-3 border border-stone-200 text-stone-700 rounded-xl font-medium text-sm hover:bg-stone-50 flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Need Help?
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-3 border border-stone-200 text-stone-700 rounded-xl font-medium text-sm hover:bg-stone-50 transition-colors"
            >
              Skip for now
            </button>

            <button
              onClick={() => navigate('/verification-status')}
              disabled={!allRequiredUploaded}
              className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-medium text-sm hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all duration-200"
            >
              {allRequiredUploaded ? 'Submit for Review' : 'Upload all required documents'}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-stone-400 hover:text-white text-sm transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
