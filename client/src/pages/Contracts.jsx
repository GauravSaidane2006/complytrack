import { useState } from 'react'
import { useGetContractsQuery, useCreateContractMutation, useUpdateContractMutation, useDeleteContractMutation, useGetContractStatsQuery } from '../store/api/api'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Modal from '../components/common/Modal'
import { toast } from 'react-hot-toast'

const emptyForm = { title: '', party: '', type: 'vendor', description: '', value: '', startDate: '', endDate: '', renewalDate: '', status: 'draft', contractNumber: '' }

export default function Contracts() {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const { data: contractsData, isLoading } = useGetContractsQuery()
  const { data: stats } = useGetContractStatsQuery()
  const [createContract] = useCreateContractMutation()
  const [updateContract] = useUpdateContractMutation()
  const [deleteContract] = useDeleteContractMutation()

  const contracts = contractsData?.contracts || []

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.party) return toast.error('Title and party are required')
    try {
      if (editing) {
        await updateContract({ id: editing._id, ...form }).unwrap()
        toast.success('Contract updated')
      } else {
        await createContract(form).unwrap()
        toast.success('Contract created')
      }
      setShowModal(false)
      setEditing(null)
      setForm(emptyForm)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed')
    }
  }

  const handleEdit = (contract) => {
    setEditing(contract)
    setForm({
      title: contract.title, party: contract.party, type: contract.type,
      description: contract.description || '', value: contract.value || '',
      startDate: contract.startDate?.split('T')[0] || '',
      endDate: contract.endDate?.split('T')[0] || '',
      renewalDate: contract.renewalDate?.split('T')[0] || '',
      status: contract.status, contractNumber: contract.contractNumber || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this contract?')) return
    try {
      await deleteContract(id).unwrap()
      toast.success('Contract deleted')
    } catch (err) {
      toast.error('Failed')
    }
  }

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />

  return (
    <div>
      <PageHeader
        title="Contracts"
        description="Manage contracts and lifecycle tracking"
        actions={
          <button onClick={() => { setEditing(null); setForm(emptyForm); setShowModal(true) }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
            + New Contract
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-xl font-bold">{stats?.total || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200 p-4">
          <p className="text-xs text-emerald-500">Active</p>
          <p className="text-xl font-bold text-emerald-600">{stats?.active || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-4">
          <p className="text-xs text-amber-500">Expiring Soon</p>
          <p className="text-xl font-bold text-amber-600">{stats?.expiringSoon?.length || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Total Value</p>
          <p className="text-xl font-bold">₹{(stats?.totalValue || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        {contracts.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-500">No contracts yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Party</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Value</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">End Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {contracts.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{c.title}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{c.party}</td>
                    <td className="px-4 py-3 text-sm capitalize text-slate-600">{c.type}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">₹{(c.value || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {c.endDate ? new Date(c.endDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(c)}
                          className="p-1 text-slate-400 hover:text-blue-600">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(c._id)}
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

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); setForm(emptyForm) }}
        title={editing ? 'Edit Contract' : 'New Contract'} size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Party</label>
            <input type="text" value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
              {['vendor', 'client', 'employee', 'lease', 'service', 'partnership', 'other'].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Value (INR)</label>
            <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Renewal Date</label>
            <input type="date" value={form.renewalDate} onChange={(e) => setForm({ ...form, renewalDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
          <div className="col-span-2">
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description" rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div className="col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setEditing(null); setForm(emptyForm) }}
              className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg">
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
