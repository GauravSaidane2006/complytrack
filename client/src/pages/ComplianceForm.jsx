import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCreateComplianceItemMutation, useUpdateComplianceItemMutation, useGetComplianceItemQuery, useGetTemplatesQuery } from '../store/api/api'
import PageHeader from '../components/common/PageHeader'
import LoadingSpinner from '../components/common/LoadingSpinner'
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
    assignedTo: [], isRecurring: false, templateId: ''
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
        templateId: ''
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
      if (isEdit) {
        await updateItem({ id, ...form }).unwrap()
        toast.success('Compliance item updated')
      } else {
        await createItem(form).unwrap()
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
      <PageHeader title={isEdit ? 'Edit Compliance Item' : 'New Compliance Item'} />

      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-3xl">
        {!isEdit && templates?.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <label className="block text-sm font-medium text-blue-800 mb-2">Use a Template</label>
            <select value={form.templateId} onChange={(e) => handleTemplateSelect(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm">
              <option value="">Select a template...</option>
              {templates.map(t => <option key={t._id} value={t._id}>{t.name} - {t.law}</option>)}
            </select>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Law *</label>
              <select value={form.law} onChange={(e) => handleChange('law', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm">
                {LAWS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
              <select value={form.category} onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Regulation</label>
            <input type="text" value={form.regulation} onChange={(e) => handleChange('regulation', e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm" placeholder="e.g., Section 139(1)" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Frequency *</label>
              <select value={form.frequency} onChange={(e) => handleChange('frequency', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm">
                {FREQUENCIES.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select value={form.priority} onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date *</label>
            <input type="date" value={form.dueDate} onChange={(e) => handleChange('dueDate', e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm" />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="recurring" checked={form.isRecurring}
              onChange={(e) => handleChange('isRecurring', e.target.checked)}
              className="rounded border-slate-300" />
            <label htmlFor="recurring" className="text-sm text-slate-700">Recurring (auto-create next item on completion)</label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => navigate('/compliance')}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={creating || updating}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
              {(creating || updating) && <LoadingSpinner size="sm" />}
              {isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
