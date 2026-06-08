import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { FiBell, FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiArrowLeft } from 'react-icons/fi'

const CONDITION_OPTIONS = [
  { value: 'pregnancy',    label: 'Pregnancy' },
  { value: 'hypertension', label: 'Hypertension (High BP)' },
  { value: 'diabetes',     label: 'Diabetes' },
  { value: 'liver',        label: 'Liver Disease' },
  { value: 'kidney',       label: 'Kidney Disease' },
  { value: 'alcohol',      label: 'Alcohol Use' },
  { value: 'heart',        label: 'Heart Disease' },
]

const ALERT_TYPE_OPTIONS = ['danger', 'warning', 'info']

const empty = { condition_key: 'pregnancy', alert_type: 'warning', message_template: '', is_active: true }

export default function AdminAlertRulesPage() {
  const [rules,   setRules]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)   // rule id being edited
  const [form,     setForm]     = useState(empty)
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState(null)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function loadRules() {
    setLoading(true)
    api.get('/admin/alert-rules')
      .then(r => setRules(r.data || []))
      .catch(() => setRules([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadRules() }, [])

  function openNew() {
    setEditing(null)
    setForm(empty)
    setShowForm(true)
  }

  function openEdit(rule) {
    setEditing(rule.id)
    setForm({
      condition_key:    rule.condition_key,
      alert_type:       rule.alert_type,
      message_template: rule.message_template,
      is_active:        !!rule.is_active,
    })
    setShowForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.message_template.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/admin/alert-rules/${editing}`, form)
        showToast('Rule updated successfully')
      } else {
        await api.post('/admin/alert-rules', form)
        showToast('Rule created successfully')
      }
      setShowForm(false)
      loadRules()
    } catch {
      showToast('Failed to save rule', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this alert rule?')) return
    await api.delete(`/admin/alert-rules/${id}`).catch(() => {})
    showToast('Rule deleted')
    loadRules()
  }

  async function handleToggle(rule) {
    await api.put(`/admin/alert-rules/${rule.id}`, { ...rule, is_active: !rule.is_active }).catch(() => {})
    loadRules()
  }

  const alertTypeBadge = {
    danger:  'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
    info:    'bg-blue-100 text-blue-700',
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
        }`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <FiArrowLeft size={18} className="text-gray-500"/>
          </Link>
          <div className="bg-amber-100 text-amber-600 p-3 rounded-2xl">
            <FiBell size={22}/>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alert Rules</h1>
            <p className="text-gray-500 text-sm">Manage personalized safety alert triggers</p>
          </div>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus size={16}/> Add Rule
        </button>
      </div>

      {/* How it works */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
        <p className="font-semibold mb-1">How Alert Rules Work</p>
        <p>Each rule matches a user health condition (e.g. "Pregnancy") to an alert type and message. When a logged-in user with that condition views a drug, the matching alert is shown automatically.</p>
        <p className="mt-1">Use <code className="bg-blue-100 px-1 rounded">{'{{drug_name}}'}</code> in the message template — it will be replaced with the actual drug name.</p>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-6 border-primary-200">
          <h2 className="font-bold text-gray-900 mb-4">{editing ? 'Edit Alert Rule' : 'New Alert Rule'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Health Condition</label>
                <select value={form.condition_key}
                  onChange={e => setForm(f => ({ ...f, condition_key: e.target.value }))}
                  className="input text-sm">
                  {CONDITION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Alert Type</label>
                <select value={form.alert_type}
                  onChange={e => setForm(f => ({ ...f, alert_type: e.target.value }))}
                  className="input text-sm">
                  {ALERT_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Message Template</label>
              <textarea
                rows={3}
                value={form.message_template}
                onChange={e => setForm(f => ({ ...f, message_template: e.target.value }))}
                placeholder={`e.g. {{drug_name}} is Category X — CONTRAINDICATED during pregnancy.`}
                className="input text-sm"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Use {'{{drug_name}}'} to insert the drug name dynamically.</p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded accent-primary-600"/>
                <span className="text-sm text-gray-700 font-medium">Active</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary text-sm">
                {saving ? 'Saving…' : editing ? 'Update Rule' : 'Create Rule'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rules table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"/>
        </div>
      ) : rules.length === 0 ? (
        <div className="card text-center py-16">
          <FiBell className="text-gray-300 mx-auto mb-3" size={40}/>
          <p className="text-gray-500 font-medium">No alert rules defined yet.</p>
          <p className="text-gray-400 text-sm mt-1">Click "Add Rule" to create the first safety alert rule.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Condition</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Type</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Message Template</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rules.map(rule => (
                <tr key={rule.id} className={`hover:bg-gray-50 transition-colors ${!rule.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-3 font-medium text-gray-900 capitalize">
                    {CONDITION_OPTIONS.find(o => o.value === rule.condition_key)?.label || rule.condition_key}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${alertTypeBadge[rule.alert_type] || 'bg-gray-100 text-gray-600'}`}>
                      {rule.alert_type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600 max-w-xs truncate">{rule.message_template}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleToggle(rule)} className="flex items-center gap-1.5 text-xs font-medium">
                      {rule.is_active
                        ? <><FiToggleRight className="text-emerald-500" size={18}/><span className="text-emerald-600">Active</span></>
                        : <><FiToggleLeft className="text-gray-400"  size={18}/><span className="text-gray-400">Inactive</span></>
                      }
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(rule)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <FiEdit2 size={15}/>
                      </button>
                      <button onClick={() => handleDelete(rule.id)}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <FiTrash2 size={15}/>
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
  )
}
