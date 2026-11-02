import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useGetSectorPdfsQuery, useGenerateSectorPdfsMutation, useGetProfileQuery } from '../store/api/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { toast } from 'react-hot-toast'

const SECTOR_LABELS = {
  service: 'Service Sector',
  manufacturing: 'Manufacturing Sector',
  trading: 'Trading Sector',
  all: 'All Sectors'
}

const SECTOR_COLORS = {
  service: 'bg-primary-100 text-primary-700 border-blue-300',
  manufacturing: 'bg-red-100 text-red-800 border-red-300',
  trading: 'bg-green-100 text-green-800 border-green-300',
  all: 'bg-slate-100 text-slate-800 border-slate-300'
}

export default function SectorPdfs() {
  const { user, accessToken } = useSelector((state) => state.auth)
  const { data: profileData } = useGetProfileQuery()
  const { data, isLoading } = useGetSectorPdfsQuery()
  const [generatePdfs, { isLoading: generating }] = useGenerateSectorPdfsMutation()
  const [loadingPersonalized, setLoadingPersonalized] = useState(false)

  const isAdmin = user?.role === 'admin' || user?.role === 'developer' || user?.role === 'superadmin'

  const handleGenerate = async () => {
    try {
      const result = await generatePdfs().unwrap()
      toast.success(result.message || 'PDFs generated successfully')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to generate PDFs')
    }
  }

  const formatSize = (bytes) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />

  const pdfs = data?.pdfs || []
  const grouped = {}
  pdfs.forEach((pdf) => {
    if (!grouped[pdf.sector]) grouped[pdf.sector] = []
    grouped[pdf.sector].push(pdf)
  })

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-slate-900 mb-2">Compliance Reference PDFs</h1>
          <p className="text-xl text-slate-600">
            {isAdmin
              ? 'Download sector and industry-specific compliance reference documents'
              : 'View your personalized compliance guide'}
          </p>
        </div>

        {profileData?.organization && (
          <div className="mb-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-3">Your Personalized Compliance Guide</h2>
            <p className="text-base text-slate-600 mb-4">
              Based on your questionnaire answers, here is a customized compliance guide for your organization.
            </p>
            <button
              onClick={async () => {
                setLoadingPersonalized(true)
                try {
                  const res = await fetch('/api/sector-pdfs/personalized', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                  })
                  if (!res.ok) {
                    const err = await res.json()
                    throw new Error(err.message || 'Failed to load PDF')
                  }
                  const blob = await res.blob()
                  const url = URL.createObjectURL(blob)
                  window.open(url, '_blank')
                } catch (err) {
                  toast.error(err.message || 'Failed to load personalized PDF')
                } finally {
                  setLoadingPersonalized(false)
                }
              }}
              disabled={loadingPersonalized}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-base font-semibold hover:from-primary-600 hover:to-primary-700 shadow-md shadow-primary/20 transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {loadingPersonalized ? 'Loading...' : 'View Your Personalized PDF'}
            </button>
          </div>
        )}

        {isAdmin && (
          <>
            <div className="mb-6 flex items-center gap-4">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-base font-semibold hover:from-blue-700 hover:to-blue-600 shadow-md transition-all disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Regenerate All PDFs'}
              </button>
              <span className="text-sm text-slate-500">
                Admin: Click to regenerate all sector/industry PDFs from current compliance data
              </span>
            </div>

            {pdfs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-16 text-center">
                <div className="text-6xl mb-4 text-slate-300">📄</div>
                <p className="text-2xl font-semibold text-slate-500">No reference PDFs available yet</p>
                <p className="text-lg text-slate-400 mt-2">
                  Click &quot;Regenerate All PDFs&quot; to generate reference documents
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(grouped).map(([sector, sectorPdfs]) => (
                  <div key={sector}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${SECTOR_COLORS[sector] || SECTOR_COLORS.all}`}>
                        {SECTOR_LABELS[sector] || sector}
                      </span>
                      <span className="text-sm text-slate-500">{sectorPdfs.length} PDFs</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sectorPdfs.map((pdf) => (
                        <div
                          key={pdf._id}
                          className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-xs text-slate-400">{formatSize(pdf.fileSize)}</span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-lg mb-1">
                            {pdf.industry === 'all'
                              ? `${SECTOR_LABELS[sector] || sector} - All Industries`
                              : pdf.industry.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                            }
                          </h3>
                          <p className="text-sm text-slate-500 mb-3">
                            Generated: {new Date(pdf.generatedAt).toLocaleDateString('en-IN')}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/sector-pdfs/${pdf._id}`, {
                                    headers: { Authorization: `Bearer ${accessToken}` }
                                  })
                                  if (!res.ok) throw new Error((await res.json()).message || 'Failed to load PDF')
                                  const blob = await res.blob()
                                  const url = URL.createObjectURL(blob)
                                  window.open(url, '_blank')
                                } catch (err) {
                                  toast.error(err.message || 'Failed to view PDF')
                                }
                              }}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all text-center cursor-pointer"
                            >
                              View
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/sector-pdfs/${pdf._id}/download`, {
                                    headers: { Authorization: `Bearer ${accessToken}` }
                                  })
                                  if (!res.ok) throw new Error((await res.json()).message || 'Failed to download PDF')
                                  const blob = await res.blob()
                                  const url = URL.createObjectURL(blob)
                                  const a = document.createElement('a')
                                  a.href = url
                                  a.download = `Compliance_${pdf.sector}_${pdf.industry}_Reference.pdf`
                                  a.click()
                                  URL.revokeObjectURL(url)
                                } catch (err) {
                                  toast.error(err.message || 'Failed to download PDF')
                                }
                              }}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-all text-center cursor-pointer"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!isAdmin && (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-16 text-center">
            <div className="text-6xl mb-4 text-slate-300">📋</div>
            <p className="text-2xl font-semibold text-slate-500">Reference PDFs</p>
            <p className="text-lg text-slate-400 mt-2">
              Full reference documents are managed by your organization administrator
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
