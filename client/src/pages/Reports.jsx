import { useState } from 'react'
import { useGetReportsQuery, useGenerateReportMutation, useDeleteReportMutation } from '../store/api/api'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Modal from '../components/common/Modal'
import { toast } from 'react-hot-toast'

export default function Reports() {
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [form, setForm] = useState({ type: 'monthly', format: 'pdf', filters: {} })

  const { data: reportsData, isLoading } = useGetReportsQuery()
  const [generateReport, { isLoading: generating }] = useGenerateReportMutation()
  const [deleteReport] = useDeleteReportMutation()

  const handleGenerate = async (e) => {
    e.preventDefault()
    try {
      const result = await generateReport(form).unwrap()
      toast.success('Report generated')
      setShowGenerateModal(false)
    } catch (err) {
      toast.error(err?.data?.message || 'Generation failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this report?')) return
    try {
      await deleteReport(id).unwrap()
      toast.success('Report deleted')
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />

  const reports = reportsData?.reports || []

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate and download compliance reports"
        actions={
          <button onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
            + Generate Report
          </button>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200">
        {reports.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-500">No reports generated yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Format</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Score</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Generated</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{report.title}</td>
                    <td className="px-4 py-3 text-sm capitalize text-slate-600">{report.type}</td>
                    <td className="px-4 py-3"><StatusBadge status={report.format} type="priority" /></td>
                    <td className="px-4 py-3 text-sm">{report.summary?.complianceScore || 0}%</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{new Date(report.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {report.fileUrl && (
                          <a href={report.fileUrl} target="_blank" rel="noreferrer"
                            className="px-3 py-1 text-xs bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100">Download</a>
                        )}
                        <button onClick={() => handleDelete(report._id)}
                          className="p-1 text-slate-400 hover:text-red-600">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showGenerateModal} onClose={() => setShowGenerateModal(false)} title="Generate Report">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
              <option value="custom">Custom</option>
              <option value="risk-assessment">Risk Assessment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Format</label>
            <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowGenerateModal(false)}
              className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
            <button type="submit" disabled={generating}
              className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
              {generating && <LoadingSpinner size="sm" />}
              Generate
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
