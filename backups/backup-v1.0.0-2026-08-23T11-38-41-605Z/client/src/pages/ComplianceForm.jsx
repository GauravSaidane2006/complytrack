import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCreateComplianceItemMutation, useUpdateComplianceItemMutation, useGetComplianceItemQuery, useGetTemplatesQuery } from '../store/api/api'
import PageHeader from '../components/common/PageHeader'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Button from '../components/common/Button'
import { toast } from 'react-hot-toast'

const LAWS = ['GST Act', 'Companies Act', 'RBI Act', 'Income Tax Act', 'Labour Laws', 'Factory Act', 'ESI Act', 'PF Act', 'Professional Tax', 'Shop & Establishment Act', 'MSME Act', 'Environment Act', 'Custom Act', 'Other']
const CATEGORIES = ['filing', 'registration', 'licence', 'audit', 'payment', 'other']
const FREQUENCIES = ['one-time', 'monthly', 'quarterly', 'half-yearly', 'yearly', 'event-based']

export default function ComplianceForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [createItem, { isLoading: creating }] = useCreateComplianceItemMutation()
  const [updateItem, { isLoading: updating }] = useUpdateComplianceItemMutation()
  const { data: item, isLoading: loadingItem } = useGetComplianceItemQuery(id, { skip: !isEdit })
  const { data: templates } = useGetTemplatesQuery()

  const [form, setForm] = useState({
    title: '', law: 'GST Act', regulation: '', category: 'filing',
    description: '', frequency: 'monthly', dueDate: '',
    applicableFrom: '', applicableTo: '', priority: 'medium',
    assignedTo: [], isRecurring: false, templateId: '', proofRequired: false
  })

  useEffect(() => {
    if (isEdit && item) {
      setForm({
        title: item.title || '',
        law: item.law || 'GST Act',
        regulation: item.regulation || '',
        category: item.category || 'filing',
        description: item.description || '',
        frequency: item.frequency || 'monthly',
        dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
        applicableFrom: item.applicableFrom ? item.applicableFrom.split('T')[0] : '',
        applicableTo: item.applicableTo ? item.applicableTo.split('T')[0] : '',
        priority: item.priority || 'medium',
        assignedTo: item.assignedTo?.map(u => u._id || u) || [],
        isRecurring: item.isRecurring || false,
        templateId: '',
        proofRequired: item.proofRequired || false
      })
    }
  }, [isEdit, item])

  const handleTemplateSelect = (templateId) => {
    if (!templateId) return
    const template = templates?.find(t => t._id === templateId)
    if (template) {
      setForm({
        ...form,
        title: form.title || template.name,
        law: form.law || template.law,
        regulation: form.regulation || template.regulation,
        category: form.category || template.category,
        description: form.description || template.description,
        frequency: form.frequency || template.frequency,
        priority: form.priority || template.defaultPriority,
        templateId
      })
    }
  }

  const handleChange = (field, value) => setForm({ ...form, [field]: value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    if (!form.dueDate) return toast.error('Due date is required')

    try {
      const payload = { ...form }
      if (!payload.applicableFrom) delete payload.applicableFrom
      if (!payload.applicableTo) delete payload.applicableTo
      if (isEdit) {
        await updateItem({ id, ...payload }).unwrap()
        toast.success('Compliance item updated')
      } else {
        await createItem(payload).unwrap()
        toast.success('Compliance item created')
      }
      navigate('/compliance')
    } catch (err) {
      toast.error(err?.data?.message || 'Save failed')
    }
  }

  if (isEdit && loadingItem) return <LoadingSpinner size="lg" className="mt-20" />

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Compliance Item' : 'New Compliance Item'}
        actions={
          <Button variant="secondary" onClick={() => navigate('/compliance')}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Compliance
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 max-w-3xl shadow-sm">
        {!isEdit && templates?.length > 0 && (
          <div className="mb-6 p-4 bg-primary-50 border border-primary-200/60 rounded-xl">
            <label className="block text-sm font-medium text-primary-700 mb-2">Use a Template</label>
            <select value={form.templateId} onChange={(e) => handleTemplateSelect(e.target.value)}
              className="w-full px-4 py-2.5 border border-primary-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all">
              <option value="">Select a template...</option>
              {templates.map(t => <option key={t._id} value={t._id}>{t.name} - {t.law}</option>)}
            </select>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
            <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Law *</label>
              <select value={form.law} onChange={(e) => handleChange('law', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all">
                {LAWS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
              <select value={form.category} onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Regulation</label>
            <input type="text" value={form.regulation} onChange={(e) => handleChange('regulation', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" placeholder="e.g., Section 139(1)" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Frequency *</label>
              <select value={form.frequency} onChange={(e) => handleChange('frequency', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all">
                {FREQUENCIES.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
              <select value={form.priority} onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date *</label>
            <input type="date" value={form.dueDate} onChange={(e) => handleChange('dueDate', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="recurring" checked={form.isRecurring}
              onChange={(e) => handleChange('isRecurring', e.target.checked)}
              className="rounded border-slate-300 text-primary-500 focus:ring-primary-500" />
            <label htmlFor="recurring" className="text-sm text-slate-700">Recurring (auto-create next item on completion)</label>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="proofRequired" checked={form.proofRequired}
              onChange={(e) => handleChange('proofRequired', e.target.checked)}
              className="rounded border-slate-300 text-primary-500 focus:ring-primary-500" />
            <label htmlFor="proofRequired" className="text-sm text-slate-700">Require proof upload before marking as complete</label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/60">
            <Button type="button" variant="secondary" onClick={() => navigate('/compliance')}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating || updating} loading={creating || updating}>
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
