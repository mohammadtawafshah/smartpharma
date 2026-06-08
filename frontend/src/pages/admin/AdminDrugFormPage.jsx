import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import { GiMedicines } from 'react-icons/gi'

const EMPTY = {
  drug_name:'', generic_name:'', brand_names:'', drug_class:'', drug_form:'',
  strength:'', route:'Oral', rx_otc:'OTC', pregnancy_category:'B',
  alcohol_interaction:0, hypertension_risk:0,
  description:'', mechanism_of_action:'', side_effects:'',
  contraindications:'', dosage_info:'', storage_info:'', is_active:1
}

export default function AdminDrugFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id && id !== 'new'
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit) {
      setLoading(true)
      api.get(`/drugs/${id}`).then(r => setForm({ ...EMPTY, ...r.data })).catch(() => {}).finally(() => setLoading(false))
    }
  }, [id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (isEdit) await api.put(`/admin/drugs/${id}`, form)
      else        await api.post('/admin/drugs', form)
      navigate('/admin/drugs')
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"/></div>

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/drugs" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><FiArrowLeft size={18}/></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GiMedicines className="text-primary-600" size={24}/>
            {isEdit ? 'Edit Drug' : 'Add New Drug'}
          </h1>
          <p className="text-gray-400 text-sm">Fill in all required fields</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide text-primary-600">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Drug Name *</label>
              <input required value={form.drug_name} onChange={e => set('drug_name',e.target.value)} className="input" placeholder="e.g. Paracetamol"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name *</label>
              <input required value={form.generic_name} onChange={e => set('generic_name',e.target.value)} className="input" placeholder="e.g. Acetaminophen"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Names</label>
              <input value={form.brand_names} onChange={e => set('brand_names',e.target.value)} className="input" placeholder="e.g. Tylenol, Panadol"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Drug Class *</label>
              <input required value={form.drug_class} onChange={e => set('drug_class',e.target.value)} className="input" placeholder="e.g. Analgesic"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Drug Form</label>
              <select value={form.drug_form} onChange={e => set('drug_form',e.target.value)} className="input">
                {['Tablet','Capsule','Syrup','Injection','Cream','Drops','Suppository','Patch','Inhaler'].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Strength</label>
              <input value={form.strength} onChange={e => set('strength',e.target.value)} className="input" placeholder="e.g. 500mg"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
              <select value={form.route} onChange={e => set('route',e.target.value)} className="input">
                {['Oral','Topical','IV','IM','Subcutaneous','Inhalation','Rectal','Sublingual'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rx / OTC</label>
              <select value={form.rx_otc} onChange={e => set('rx_otc',e.target.value)} className="input">
                <option value="OTC">OTC (Over the Counter)</option>
                <option value="Rx">Rx (Prescription Only)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Safety */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide text-amber-600">Safety Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pregnancy Category</label>
              <select value={form.pregnancy_category} onChange={e => set('pregnancy_category',e.target.value)} className="input">
                {['A','B','C','D','X','N'].map(c => <option key={c} value={c}>Category {c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="alcohol" checked={!!form.alcohol_interaction}
                onChange={e => set('alcohol_interaction', e.target.checked ? 1 : 0)}
                className="w-4 h-4 rounded text-primary-600"/>
              <label htmlFor="alcohol" className="text-sm font-medium text-gray-700">Alcohol Interaction</label>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="htn" checked={!!form.hypertension_risk}
                onChange={e => set('hypertension_risk', e.target.checked ? 1 : 0)}
                className="w-4 h-4 rounded text-primary-600"/>
              <label htmlFor="htn" className="text-sm font-medium text-gray-700">Hypertension Risk</label>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide text-emerald-600">Medical Details</h2>
          <div className="space-y-4">
            {[
              ['description','Description / Indications','Describe what this drug is used for...'],
              ['mechanism_of_action','Mechanism of Action','How does this drug work?'],
              ['side_effects','Side Effects','List common and serious side effects...'],
              ['contraindications','Contraindications','When should this drug NOT be used?'],
              ['dosage_info','Dosage Information','Standard dosage guidelines...'],
              ['storage_info','Storage Instructions','How to store this medication?'],
            ].map(([key,label,placeholder]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <textarea rows={3} value={form[key]||''} onChange={e => set(key,e.target.value)}
                  placeholder={placeholder} className="input resize-none"/>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="card flex items-center gap-3">
          <input type="checkbox" id="active" checked={!!form.is_active}
            onChange={e => set('is_active', e.target.checked ? 1 : 0)}
            className="w-4 h-4 rounded text-primary-600"/>
          <label htmlFor="active" className="text-sm font-medium text-gray-700">Active (visible to users)</label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
            <FiSave size={16}/> {saving ? 'Saving...' : (isEdit ? 'Update Drug' : 'Add Drug')}
          </button>
          <Link to="/admin/drugs" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
