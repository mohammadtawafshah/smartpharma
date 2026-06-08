import { useState, useEffect } from 'react'
import api from '../../services/api'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from 'react-icons/fi'
import { FiAlertTriangle } from 'react-icons/fi'

const SEV_COLORS = { low:'bg-green-100 text-green-700', moderate:'bg-yellow-100 text-yellow-700', high:'bg-orange-100 text-orange-700', contraindicated:'bg-red-100 text-red-700' }

const EMPTY_FORM = { drug_id:'', herb_id:'', severity:'moderate', description:'', evidence_level:'moderate', recommendation:'' }

export default function AdminInteractionsPage() {
  const [interactions, setInteractions] = useState([])
  const [total, setTotal] = useState(0)
  const [drugs, setDrugs] = useState([])
  const [herbs, setHerbs] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/admin/interactions').then(r => { setInteractions(r.data.data); setTotal(r.data.total) }).catch(()=>{}).finally(()=>setLoading(false))
  }

  useEffect(() => {
    load()
    api.get('/admin/drugs-list').then(r => setDrugs(r.data)).catch(()=>{})
    api.get('/admin/herbs-list').then(r => setHerbs(r.data)).catch(()=>{})
  }, [])

  const openAdd = () => { setForm(EMPTY_FORM); setEditItem(null); setShowForm(true) }
  const openEdit = (item) => { setForm({ drug_id:item.drug_id, herb_id:item.herb_id, severity:item.severity, description:item.description||'', evidence_level:item.evidence_level||'moderate', recommendation:item.recommendation||'' }); setEditItem(item); setShowForm(true) }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true)
    try {
      if (editItem) await api.put(`/admin/interactions/${editItem.id}`, form)
      else          await api.post('/admin/interactions', form)
      setShowForm(false); load()
    } catch(err){ alert(err.response?.data?.error||'Error') }
    finally{ setSaving(false) }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this interaction?')) return
    await api.delete(`/admin/interactions/${id}`).catch(()=>{})
    load()
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiAlertTriangle className="text-amber-500" size={24}/> Drug-Herb Interactions
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} interactions total</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><FiPlus size={16}/> Add Interaction</button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editItem ? 'Edit Interaction' : 'Add New Interaction'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={18}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Drug *</label>
                  <select required value={form.drug_id} onChange={e => setForm(f=>({...f,drug_id:e.target.value}))} className="input">
                    <option value="">Select drug...</option>
                    {drugs.map(d => <option key={d.id} value={d.id}>{d.drug_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Herb *</label>
                  <select required value={form.herb_id} onChange={e => setForm(f=>({...f,herb_id:e.target.value}))} className="input">
                    <option value="">Select herb...</option>
                    {herbs.map(h => <option key={h.id} value={h.id}>{h.herb_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity *</label>
                  <select required value={form.severity} onChange={e => setForm(f=>({...f,severity:e.target.value}))} className="input">
                    <option value="low">Low</option><option value="moderate">Moderate</option>
                    <option value="high">High</option><option value="contraindicated">Contraindicated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Level</label>
                  <select value={form.evidence_level} onChange={e => setForm(f=>({...f,evidence_level:e.target.value}))} className="input">
                    <option value="high">High</option><option value="moderate">Moderate</option><option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea required rows={3} value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} className="input resize-none"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recommendation</label>
                <textarea rows={2} value={form.recommendation} onChange={e => setForm(f=>({...f,recommendation:e.target.value}))} className="input resize-none"/>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                  <FiSave size={15}/> {saving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Drug','Herb','Severity','Description','Actions'].map(h=>(
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={5} className="text-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"/></td></tr>
            : interactions.length===0 ? <tr><td colSpan={5} className="text-center py-12 text-gray-400">No interactions found</td></tr>
            : interactions.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{item.drug_name}</td>
                <td className="px-4 py-3 text-gray-700">{item.herb_name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SEV_COLORS[item.severity]||'bg-gray-100 text-gray-600'}`}>
                    {item.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{item.description}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit2 size={15}/></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 size={15}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
