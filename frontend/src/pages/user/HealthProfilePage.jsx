import { useState, useEffect } from 'react'
import api from '../../services/api'
import { FiSave, FiUser } from 'react-icons/fi'

export default function HealthProfilePage() {
  const [form, setForm] = useState({
    is_pregnant:0, is_breastfeeding:0, has_hypertension:0, has_diabetes:0,
    has_liver_disease:0, has_kidney_disease:0, has_high_blood_pressure:0,
    allergies:'', current_medications:'', chronic_conditions:'', age:'', notes:''
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/profile').then(r => { if(r.data) setForm(f => ({...f,...r.data})) }).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  const toggle = k => setForm(f => ({...f, [k]: f[k] ? 0 : 1}))
  const set    = (k,v) => setForm(f => ({...f, [k]:v}))

  async function handleSubmit(e) {
    e.preventDefault(); setSaving(true); setSaved(false)
    await api.post('/profile', form).catch(()=>{})
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"/></div>

  const CheckItem = ({ field, label, desc, color='text-primary-600', bg='bg-primary-50' }) => (
    <button type="button" onClick={() => toggle(field)}
      className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left w-full ${form[field] ? `border-primary-300 ${bg}` : 'border-gray-100 hover:border-gray-200'}`}>
      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${form[field] ? 'bg-primary-600' : 'bg-gray-200'}`}>
        {form[field] && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12"><path d="M10 3L5 8.5 2 5.5l-1 1 4 4 6-7z"/></svg>}
      </div>
      <div>
        <p className={`font-semibold text-sm ${form[field] ? 'text-gray-900' : 'text-gray-600'}`}>{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
    </button>
  )

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl"><FiUser size={24}/></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Profile</h1>
          <p className="text-gray-500 text-sm">Your health info helps us send personalized safety alerts</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Conditions */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Health Conditions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CheckItem field="is_pregnant"          label="Currently Pregnant"        desc="Enables pregnancy safety alerts"/>
            <CheckItem field="is_breastfeeding"     label="Breastfeeding"             desc="Alerts for breastfeeding safety"/>
            <CheckItem field="has_hypertension"     label="High Blood Pressure"       desc="Alerts for BP-affecting medications"/>
            <CheckItem field="has_diabetes"         label="Diabetes"                  desc="Alerts for blood sugar interactions"/>
            <CheckItem field="has_liver_disease"    label="Liver Disease"             desc="Alerts for hepatotoxic drugs"/>
            <CheckItem field="has_kidney_disease"   label="Kidney Disease"            desc="Alerts for nephrotoxic drugs"/>
          </div>
        </div>

        {/* Personal info */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input type="number" min="1" max="120" value={form.age||''} onChange={e=>set('age',e.target.value)} className="input" placeholder="Your age"/>
            </div>
          </div>
        </div>

        {/* Text fields */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900 mb-2">Medical History</h2>
          {[
            ['allergies','Known Allergies','e.g. Penicillin, Aspirin, Pollen...'],
            ['current_medications','Current Medications','Medications you are currently taking...'],
            ['chronic_conditions','Chronic Conditions','Any long-term conditions...'],
            ['notes','Additional Notes','Any other relevant health information...'],
          ].map(([key,label,placeholder]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <textarea rows={3} value={form[key]||''} onChange={e=>set(key,e.target.value)}
                placeholder={placeholder} className="input resize-none"/>
            </div>
          ))}
        </div>

        {saved && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">✅ Health profile saved successfully!</div>}

        <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-3 text-base flex items-center gap-2 disabled:opacity-60">
          <FiSave size={18}/> {saving ? 'Saving...' : 'Save Health Profile'}
        </button>
      </form>
    </div>
  )
}
