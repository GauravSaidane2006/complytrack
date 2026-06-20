import { useState } from 'react'
import { useGetRiskAssessmentsQuery, useAssessRiskMutation, useGetRiskSummaryQuery, useUpdateRiskStatusMutation, useGetComplianceItemsQuery } from '../store/api/api'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Modal from '../components/common/Modal'
import { toast } from 'react-hot-toast'

export default function RiskAssessment() {
  const [showAssessModal, setShowAssessModal] = useState(false)
  const [form, setForm] = useState({ complianceItem: '', impact: 'medium', likelihood: 'medium', financialImpact: '', legalConsequence: '', mitigation: '', mitigationDeadline: '' })

  const { data: assessmentsData, isLoading } = useGetRiskAssessmentsQuery()
  const { data: summary } = useGetRiskSummaryQuery()
  const { data: complianceData } = useGetComplianceItemsQuery({ status: 'pending,in-progress,overdue', limit: 100 })
  const [assessRisk] = useAssessRiskMutation()
  const [updateStatus] = useUpdateRiskStatusMutation()

  const assessments = assessmentsData?.assessments || []
  const complianceItems = complianceData?.items || []

  const handleAssess = async (e) => {
    e.preventDefault()
    if (!form.complianceItem) return toast.error('Select a compliance item')
    try {
      await assessRisk(form).unwrap()
      toast.success('Risk assessment created')
      setShowAssessModal(false)
      setForm({ complianceItem: '', impact: 'medium', likelihood: 'medium', financialImpact: '', legalConsequence: '', mitigation: '', mitigationDeadline: '' })
    } catch (err) {
      toast.error(err?.data?.message || 'Assessment failed')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await updateStatus({ id, status }).unwrap()
      toast.success('Risk status updated')
    } catch (err) {
      toast.error('Update failed')
    }
  }

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />

  return (
    <div>
      <PageHeader
        title="Risk Assessment"
        description="Identify and mitigate compliance risks"
        actions={
          <button onClick={() => setShowAssessModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
            + New Assessment
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Total Risks</p>
          <p className="text-xl font-bold text-slate-900">{summary?.total || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4">
          <p className="text-xs text-red-500">Critical</p>
          <p className="text-xl font-bold text-red-600">{summary?.critical || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-orange-200 p-4">
          <p className="text-xs text-orange-500">High</p>
          <p className="text-xl font-bold text-orange-600">{summary?.high || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Avg Risk Score</p>
          <p className="text-xl font-bold text-slate-900">{Math.round(summary?.avgRiskScore || 0)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        {assessments.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-500">No risk assessments yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Compliance Item</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase hidden sm:table-cell">Risk Score</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase hidden md:table-cell">Impact</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase hidden md:table-cell">Likelihood</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {assessments.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">
                      <span className="hidden sm:inline">{a.complianceItem?.title || 'N/A'}</span>
                      <span className="sm:hidden line-clamp-1">{a.complianceItem?.title || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${
                            a.riskScore >= 70 ? 'bg-red-500' : a.riskScore >= 50 ? 'bg-orange-500' : a.riskScore >= 30 ? 'bg-yellow-500' : 'bg-emerald-500'
                          }`} style={{ width: `${a.riskScore}%` }} />
                        </div>
                        <span className="text-xs font-medium">{a.riskScore}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell"><StatusBadge status={a.impact} type="priority" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><StatusBadge status={a.likelihood} type="priority" /></td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} type="priority" /></td>
                    <td className="px-4 py-3 text-right">
                      <select value={a.status} onChange={(e) => handleStatusChange(a._id, e.target.value)}
                        className="text-xs border border-slate-300 rounded px-2 py-1">
                        <option value="identified">Identified</option>
                        <option value="mitigated">Mitigated</option>
                        <option value="accepted">Accepted</option>
                        <option value="monitoring">Monitoring</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showAssessModal} onClose={() => setShowAssessModal(false)} title="New Risk Assessment">
        <form onSubmit={handleAssess} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Compliance Item</label>
            <select value={form.complianceItem} onChange={(e) => setForm({ ...form, complianceItem: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
              <option value="">Select item...</option>
              {complianceItems.map(item => (
                <option key={item._id} value={item._id}>{item.title} - {item.law}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Impact</label>
              <select value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Likelihood</label>
              <select value={form.likelihood} onChange={(e) => setForm({ ...form, likelihood: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <input type="text" value={form.financialImpact} onChange={(e) => setForm({ ...form, financialImpact: e.target.value })}
            placeholder="Financial Impact" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <input type="text" value={form.legalConsequence} onChange={(e) => setForm({ ...form, legalConsequence: e.target.value })}
            placeholder="Legal Consequence" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <textarea value={form.mitigation} onChange={(e) => setForm({ ...form, mitigation: e.target.value })}
            placeholder="Mitigation Plan" rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <input type="date" value={form.mitigationDeadline} onChange={(e) => setForm({ ...form, mitigationDeadline: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowAssessModal(false)}
              className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg">Assess Risk</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
