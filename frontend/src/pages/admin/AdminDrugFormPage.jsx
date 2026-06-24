import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import { FiArrowLeft, FiSave, FiX } from 'react-icons/fi'
import { GiMedicines, GiHerbsBundle } from 'react-icons/gi'

const EMPTY = {
  drug_name:'', generic_name:'', brand_names:'', drug_class:'', drug_form:'',
  strength:'', route:'Oral', rx_otc:'OTC', pregnancy_category:'B',
  alcohol_interaction:0, hypertension_risk:0,
  indications:'', mechanism_of_action:'', side_effects:'',
  contraindications:'', dosage_info:'', warnings:'', is_active:1
}

export default function AdminDrugFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id && id !== 'new'
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [herbs, setHerbs] = useState([])
  const [selectedHerbs, setSelectedHerbs] = useState([])
  const [herbSearch, setHerbSearch] = useState('')

  useEffect(() => {
    api.get('/admin/herbs-list').then(r => setHerbs(r.data)).catch(() => {})
    if (isEdit) {
      setLoading(true)
      Promise.all([
        api.get(`/drugs/${id}`),
        api.get(`/admin/alternatives/drug/${id}`)
      ]).then(([drugRes, altRes]) => {
        setForm({ ...EMPTY, ...drugRes.data })
        setSelectedHerbs(altRes.data || [])
      }).catch(() => {}).finally(() => setLoading(false))
    }
  }, [id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleHerb = (herbId) => {
    setSelectedHerbs(prev =>
      prev.includes(herbId) ? prev.filter(h => h !== herbId) : [...prev, herbId]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      let drugId = id
      if (isEdit) {
        await api.put(`/admin/drugs/${id}`, form)
      } else {
        const res = await api.post('/admin/drugs', form)
        drugId = res.data.id
      }
      await api.post(`/admin/alternatives/drug/${drugId}`, { herb_ids: selectedHerbs })
      navigate('/admin/drugs')
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed')
    } finally { setSaving(false) }
  }

  const filteredHerbs = herbs.filter(h =>
    h.herb_name.toLowerCase().includes(herbSearch.toLowerCase())
  )

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
              ['indications','Indications / Uses','What is this drug used for?'],
              ['mechanism_of_action','Mechanism of Action','How does this drug work?'],
              ['side_effects','Side Effects','List common and serious side effects...'],
              ['contraindications','Contraindications','When should this drug NOT be used?'],
              ['dosage_info','Dosage Information','Standard dosage guidelines...'],
              ['warnings','Warnings','Important safety warnings...'],
            ].map(([key,label,placeholder]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <textarea rows={3} value={form[key]||''} onChange={e => set(key,e.target.value)}
                  placeholder={placeholder} className="input resize-none"/>
              </div>
            ))}
          </div>
        </div>

        {/* Herbal Alternatives */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-1 text-sm uppercase tracking-wide text-emerald-600 flex items-center gap-2">
            <GiHerbsBundle size={16}/> Possible Herbal Alternatives
          </h2>
          <p className="text-xs text-gray-400 mb-4">Select herbs that can be used as natural alternatives to this drug</p>

          {/* Selected herbs chips */}
          {selectedHerbs.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedHerbs.map(hid => {
                const herb = herbs.find(h => h.id === hid || +h.id === +hid)
                if (!herb) return null
                return (
                  <span key={hid} className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full font-medium">
                    {herb.herb_name}
                    <button type="button" onClick={() => toggleHerb(+hid)} className="hover:text-emerald-900">
                      <FiX size={12}/>
                    </button>
                  </span>
                )
              })}
            </div>
          )}

          {/* Search + list */}
          <input
            type="text"
            placeholder="Search herbs..."
            value={herbSearch}
            onChange={e => setHerbSearch(e.target.value)}
            className="input mb-3 text-sm"
          />
          <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
            {filteredHerbs.length === 0 ? (
              <p className="text-center py-4 text-gray-400 text-sm">No herbs found</p>
            ) : filteredHerbs.map(herb => {
              const selected = selectedHerbs.includes(+herb.id)
              return (
                <label key={herb.id} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${selected ? 'bg-emerald-50' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleHerb(+herb.id)}
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <span className="text-sm text-gray-800">{herb.herb_name}</span>
                </label>
              )
            })}
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
