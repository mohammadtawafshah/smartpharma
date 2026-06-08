import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import { GiHerbsBundle } from 'react-icons/gi'

const EMPTY = {
  herb_name:'', scientific_name:'', common_names:'', family:'', parts_used:'',
  origin:'', description:'', traditional_uses:'', preparation_method:'',
  extraction_method:'', side_effects:'', contraindications:'',
  pregnancy_safe:1, hypertension_risk:0, evidence_level:'traditional',
  toxicity_level:'low', is_active:1
}

export default function AdminHerbFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id && id !== 'new'
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (isEdit) {
      setLoading(true)
      api.get(`/herbs/${id}`).then(r => setForm({ ...EMPTY, ...r.data })).catch(() => {}).finally(() => setLoading(false))
    }
  }, [id])

  const set = (k,v) => setForm(f => ({ ...f, [k]:v }))

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      if (isEdit) await api.put(`/admin/herbs/${id}`, form)
      else        await api.post('/admin/herbs', form)
      navigate('/admin/herbs')
    } catch (err) { setError(err.response?.data?.error || 'Save failed') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"/></div>

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/herbs" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><FiArrowLeft size={18}/></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GiHerbsBundle className="text-emerald-600" size={24}/> {isEdit ? 'Edit Herb' : 'Add New Herb'}
          </h1>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide text-emerald-600">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Herb Name *</label>
              <input required value={form.herb_name} onChange={e => set('herb_name',e.target.value)} className="input" placeholder="e.g. Ginger"/></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Scientific Name</label>
              <input value={form.scientific_name} onChange={e => set('scientific_name',e.target.value)} className="input" placeholder="e.g. Zingiber officinale"/></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Common Names</label>
              <input value={form.common_names} onChange={e => set('common_names',e.target.value)} className="input" placeholder="e.g. Ginger Root, Adrak"/></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Family</label>
              <input value={form.family} onChange={e => set('family',e.target.value)} className="input" placeholder="e.g. Zingiberaceae"/></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Parts Used</label>
              <input value={form.parts_used} onChange={e => set('parts_used',e.target.value)} className="input" placeholder="e.g. Root/Rhizome"/></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
              <input value={form.origin} onChange={e => set('origin',e.target.value)} className="input" placeholder="e.g. South Asia"/></div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide text-amber-600">Safety & Evidence</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Evidence Level</label>
              <select value={form.evidence_level} onChange={e => set('evidence_level',e.target.value)} className="input">
                <option value="high">High</option><option value="moderate">Moderate</option>
                <option value="low">Low</option><option value="traditional">Traditional</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Toxicity Level</label>
              <select value={form.toxicity_level} onChange={e => set('toxicity_level',e.target.value)} className="input">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select></div>
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3 pt-5">
                <input type="checkbox" id="preg" checked={!!form.pregnancy_safe} onChange={e => set('pregnancy_safe',e.target.checked?1:0)} className="w-4 h-4"/>
                <label htmlFor="preg" className="text-sm font-medium text-gray-700">Generally Safe in Pregnancy</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="htn" checked={!!form.hypertension_risk} onChange={e => set('hypertension_risk',e.target.checked?1:0)} className="w-4 h-4"/>
                <label htmlFor="htn" className="text-sm font-medium text-gray-700">Hypertension Risk</label>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide text-primary-600">Details</h2>
          <div className="space-y-4">
            {[
              ['description','Description'],
              ['traditional_uses','Traditional Uses'],
              ['preparation_method','Preparation Method'],
              ['extraction_method','Extraction Method'],
              ['side_effects','Side Effects'],
              ['contraindications','Contraindications'],
            ].map(([key,label]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <textarea rows={3} value={form[key]||''} onChange={e => set(key,e.target.value)} className="input resize-none"/>
              </div>
            ))}
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <input type="checkbox" id="active" checked={!!form.is_active} onChange={e => set('is_active',e.target.checked?1:0)} className="w-4 h-4"/>
          <label htmlFor="active" className="text-sm font-medium text-gray-700">Active (visible to users)</label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
            <FiSave size={16}/> {saving ? 'Saving...' : (isEdit ? 'Update Herb' : 'Add Herb')}
          </button>
          <Link to="/admin/herbs" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
