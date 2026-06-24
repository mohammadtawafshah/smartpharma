import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import { FiArrowLeft, FiSave, FiX } from 'react-icons/fi'
import { GiHerbsBundle, GiMedicines } from 'react-icons/gi'

const EMPTY = {
  herb_name:'', scientific_name:'', common_names:'', family:'', parts_used:'',
  origin_region:'', benefits:'', uses:'', preparation_methods:'',
  extraction_methods:'', side_effects:'', contraindications:'',
  pregnancy_safe:1, hypertension_risk:0, is_active:1
}

export default function AdminHerbFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id && id !== 'new'
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [drugs, setDrugs] = useState([])
  const [selectedDrugs, setSelectedDrugs] = useState([])
  const [drugSearch, setDrugSearch] = useState('')

  useEffect(() => {
    api.get('/admin/drugs-list').then(r => setDrugs(r.data)).catch(() => {})
    if (isEdit) {
      setLoading(true)
      Promise.all([
        api.get(`/herbs/${id}`),
        api.get(`/admin/alternatives/herb/${id}`)
      ]).then(([herbRes, altRes]) => {
        setForm({ ...EMPTY, ...herbRes.data })
        setSelectedDrugs(altRes.data || [])
      }).catch(() => {}).finally(() => setLoading(false))
    }
  }, [id])

  const set = (k,v) => setForm(f => ({ ...f, [k]:v }))

  const toggleDrug = (drugId) => {
    setSelectedDrugs(prev =>
      prev.includes(drugId) ? prev.filter(d => d !== drugId) : [...prev, drugId]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      let herbId = id
      if (isEdit) {
        await api.put(`/admin/herbs/${id}`, form)
      } else {
        const res = await api.post('/admin/herbs', form)
        herbId = res.data.id
      }
      await api.post(`/admin/alternatives/herb/${herbId}`, { drug_ids: selectedDrugs })
      navigate('/admin/herbs')
    } catch (err) { setError(err.response?.data?.error || 'Save failed') }
    finally { setSaving(false) }
  }

  const filteredDrugs = drugs.filter(d =>
    d.drug_name.toLowerCase().includes(drugSearch.toLowerCase())
  )

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
              <input value={form.origin_region} onChange={e => set('origin_region',e.target.value)} className="input" placeholder="e.g. South Asia"/></div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide text-amber-600">Safety</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 pt-1">
              <input type="checkbox" id="preg" checked={!!form.pregnancy_safe} onChange={e => set('pregnancy_safe',e.target.checked?1:0)} className="w-4 h-4"/>
              <label htmlFor="preg" className="text-sm font-medium text-gray-700">Generally Safe in Pregnancy</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="htn" checked={!!form.hypertension_risk} onChange={e => set('hypertension_risk',e.target.checked?1:0)} className="w-4 h-4"/>
              <label htmlFor="htn" className="text-sm font-medium text-gray-700">Hypertension Risk</label>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide text-primary-600">Details</h2>
          <div className="space-y-4">
            {[
              ['benefits','Benefits'],
              ['uses','Traditional Uses / Uses'],
              ['preparation_methods','Preparation Methods'],
              ['extraction_methods','Extraction Methods'],
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

        {/* Drug Alternatives */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-1 text-sm uppercase tracking-wide text-primary-600 flex items-center gap-2">
            <GiMedicines size={16}/> Alternative To (Drugs)
          </h2>
          <p className="text-xs text-gray-400 mb-4">Select drugs that this herb can be used as a natural alternative for</p>

          {selectedDrugs.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedDrugs.map(did => {
                const drug = drugs.find(d => +d.id === +did)
                if (!drug) return null
                return (
                  <span key={did} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                    {drug.drug_name}
                    <button type="button" onClick={() => toggleDrug(+did)} className="hover:text-blue-900">
                      <FiX size={12}/>
                    </button>
                  </span>
                )
              })}
            </div>
          )}

          <input
            type="text"
            placeholder="Search drugs..."
            value={drugSearch}
            onChange={e => setDrugSearch(e.target.value)}
            className="input mb-3 text-sm"
          />
          <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
            {filteredDrugs.length === 0 ? (
              <p className="text-center py-4 text-gray-400 text-sm">No drugs found</p>
            ) : filteredDrugs.map(drug => {
              const selected = selectedDrugs.includes(+drug.id)
              return (
                <label key={drug.id} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${selected ? 'bg-blue-50' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleDrug(+drug.id)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm text-gray-800">{drug.drug_name}</span>
                </label>
              )
            })}
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
