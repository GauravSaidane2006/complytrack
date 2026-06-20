import { useState } from 'react'
import { useGetTemplatesQuery, useCreateTemplateMutation, useDeleteTemplateMutation, useSeedTemplatesMutation, useBulkCreateFromTemplateMutation } from '../store/api/api'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Modal from '../components/common/Modal'
import { toast } from 'react-hot-toast'

export default function Templates() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(null)
  const [form, setForm] = useState({ name: '', law: 'GST Act', category: 'filing', frequency: 'monthly', defaultPriority: 'medium', description: '', regulation: '' })
  const [applyForm, setApplyForm] = useState({ dueDates: '', assignedTo: '' })

  const { data: templates, isLoading } = useGetTemplatesQuery()
  const [createTemplate] = useCreateTemplateMutation()
  const [deleteTemplate] = useDeleteTemplateMutation()
  const [seedTemplates] = useSeedTemplatesMutation()
  const [bulkCreate] = useBulkCreateFromTemplateMutation()

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name) return toast.error('Name is required')
    try {
      await createTemplate(form).unwrap()
      toast.success('Template created')
      setShowCreateModal(false)
      setForm({ name: '', law: 'GST Act', category: 'filing', frequency: 'monthly', defaultPriority: 'medium', description: '', regulation: '' })
    } catch (err) {
      toast.error(err?.data?.message || 'Failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return
    try {
      await deleteTemplate(id).unwrap()
      toast.success('Template deleted')
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const handleApply = async () => {
    if (!applyForm.dueDates) return toast.error('Enter due dates')
    const dueDates = applyForm.dueDates.split(',').map(d => d.trim()).filter(Boolean)
    try {
      await bulkCreate({ templateId: showApplyModal._id, dueDates }).unwrap()
      toast.success(`Applied template to ${dueDates.length} items`)
      setShowApplyModal(null)
      setApplyForm({ dueDates: '', assignedTo: '' })
    } catch (err) {
      toast.error('Failed to apply')
    }
  }

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />

  return (
    <div>
      <PageHeader
        title="Compliance Templates"
        description="Pre-defined compliance templates for quick setup"
        actions={
          <div className="flex flex-wrap gap-2">
            <button onClick={() => seedTemplates()}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Seed Templates</button>
            <button onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">+ New Template</button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates?.map((template) => (
          <div key={template._id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <StatusBadge status={template.law} />
              <button onClick={() => handleDelete(template._id)} className="text-slate-300 hover:text-red-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">{template.name}</h3>
            {template.description && <p className="text-xs text-slate-500 mb-3">{template.description}</p>}
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
              <span className="capitalize">{template.frequency}</span>
              <span>|</span>
              <span className="capitalize">{template.category}</span>
            </div>
            <button onClick={() => setShowApplyModal(template)}
              className="w-full py-1.5 text-sm bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 font-medium">
              Apply to Compliance
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Template">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Law</label>
              <select value={form.law} onChange={(e) => setForm({ ...form, law: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                {['GST Act', 'Companies Act', 'RBI Act', 'Income Tax Act', 'Labour Laws', 'PF Act', 'ESI Act'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                {['filing', 'registration', 'licence', 'audit', 'payment', 'other'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
              <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                {['one-time', 'monthly', 'quarterly', 'half-yearly', 'yearly'].map(f => (
                  <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select value={form.defaultPriority} onChange={(e) => setForm({ ...form, defaultPriority: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description" rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <input type="text" value={form.regulation} onChange={(e) => setForm({ ...form, regulation: e.target.value })}
            placeholder="Regulation (optional)" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg">Create</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!showApplyModal} onClose={() => setShowApplyModal(null)} title={`Apply: ${showApplyModal?.name}`}>
        <p className="text-sm text-slate-600 mb-4">Create compliance items from this template. Enter comma-separated due dates.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Due Dates (comma-separated)</label>
            <input type="text" value={applyForm.dueDates} onChange={(e) => setApplyForm({ ...applyForm, dueDates: e.target.value })}
              placeholder="2026-07-15, 2026-08-15, 2026-09-15"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowApplyModal(null)} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
            <button onClick={handleApply} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg">Apply</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
