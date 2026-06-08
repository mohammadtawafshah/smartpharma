import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiArrowLeft, FiAlertTriangle, FiHeart, FiCheck } from 'react-icons/fi'
import { GiMedicines, GiHerbsBundle } from 'react-icons/gi'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const pregnancyDesc = {
  A: 'Adequate studies show no risk to the fetus.',
  B: 'Animal studies show no risk; no adequate human studies.',
  C: 'Animal studies show adverse effects; benefits may outweigh risks.',
  D: 'Evidence of human fetal risk. Use only if benefits outweigh risks.',
  X: 'Contraindicated in pregnancy. Risks clearly outweigh benefits.',
}

const severityColors = {
  contraindicated: 'border-red-300 bg-red-100',
  high:            'border-red-200 bg-red-50',
  moderate:        'border-amber-200 bg-amber-50',
  low:             'border-green-200 bg-green-50',
}

export default function DrugDetailPage() {
  const { id }   = useParams()
  const { user } = useAuth()

  const [drug,      setDrug]      = useState(null)
  const [alerts,    setAlerts]    = useState([])
  const [fav,       setFav]       = useState(false)
  const [loading,   setLoading]   = useState(true)
  const [notFound,  setNotFound]  = useState(false)

  // Fetch drug
  useEffect(() => {
    setLoading(true)
    api.get(`/drugs/${id}`)
      .then(r => setDrug(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  // Fetch personalized alerts for this drug (only if logged in)
  useEffect(() => {
    if (!user || !id) return
    api.get(`/alerts/drug/${id}`)
      .then(r => setAlerts(r.data || []))
      .catch(() => {})
  }, [user, id])

  // Toggle favorite
  async function toggleFav() {
    if (!user) return
    await api.post('/favorites', { item_type: 'drug', item_id: Number(id) }).catch(() => {})
    setFav(f => !f)
  }

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"/>
    </div>
  )

  if (notFound || !drug) return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center text-gray-400">
      <GiMedicines size={48} className="mx-auto mb-3 opacity-30"/>
      <p className="font-medium text-lg">Drug not found.</p>
      <Link to="/drugs" className="text-primary-600 text-sm mt-2 inline-block">← Back to drugs</Link>
    </div>
  )

  const interactions   = drug.herb_interactions   || []
  const alternatives   = drug.herbal_alternatives || []
  const conditions     = drug.conditions          || []

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/drugs" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-6">
        <FiArrowLeft size={15}/> Back to Drug Directory
      </Link>

      {/* Personalized alerts */}
      {user && alerts.length > 0 && (
        <div className="space-y-2 mb-6">
          {alerts.map((a, i) => (
            <div key={i} className={`rounded-xl p-4 flex items-start gap-3 border ${
              a.alert_type === 'danger'   ? 'bg-red-50 border-red-200' :
              a.alert_type === 'warning'  ? 'bg-amber-50 border-amber-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <FiAlertTriangle className={
                a.alert_type === 'danger' ? 'text-red-500' :
                a.alert_type === 'warning' ? 'text-amber-500' : 'text-blue-500'
              } size={18}/>
              <p className={`text-sm font-medium ${
                a.alert_type === 'danger'  ? 'text-red-800' :
                a.alert_type === 'warning' ? 'text-amber-800' : 'text-blue-800'
              }`}>{a.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Login prompt */}
      {!user && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 text-sm text-blue-800">
          <Link to="/login" className="font-semibold underline">Log in</Link> and fill your health profile to see personalised safety alerts for this drug.
        </div>
      )}

      {/* Drug header */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-primary-100 text-primary-600 p-3 rounded-2xl">
              <GiMedicines size={30}/>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{drug.drug_name}</h1>
              {drug.generic_name  && <p className="text-gray-500 mt-1">{drug.generic_name}</p>}
              {drug.brand_names   && <p className="text-sm text-gray-400 mt-0.5">Also known as: {drug.brand_names}</p>}
            </div>
          </div>
          {user && (
            <button onClick={toggleFav}
              className={`flex items-center gap-2 transition-colors self-start text-sm ${fav ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
              <FiHeart size={20} className={fav ? 'fill-current' : ''}/> {fav ? 'Saved' : 'Save'}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-gray-100">
          {drug.drug_class && <span className="badge-info">{drug.drug_class}</span>}
          {drug.drug_form  && <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">{drug.drug_form}</span>}
          {drug.strength   && <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">{drug.strength}</span>}
          {drug.route      && <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">{drug.route}</span>}
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${drug.rx_otc === 'OTC' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
            {drug.rx_otc}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {drug.indications && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-500 rounded-full"/> Indications
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">{drug.indications}</p>
          </div>
        )}

        {drug.dosage_info && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"/> Dosage Information
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">{drug.dosage_info}</p>
          </div>
        )}

        {drug.side_effects && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full"/> Side Effects
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">{drug.side_effects}</p>
          </div>
        )}

        {drug.contraindications && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"/> Contraindications
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">{drug.contraindications}</p>
          </div>
        )}

        {drug.warnings && (
          <div className="card border-amber-200 bg-amber-50 md:col-span-2">
            <h2 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
              <FiAlertTriangle size={16} className="text-amber-600"/> Warnings
            </h2>
            <p className="text-amber-700 text-sm leading-relaxed">{drug.warnings}</p>
          </div>
        )}

        {drug.pregnancy_category && drug.pregnancy_category !== 'N/A' && (
          <div className={`card md:col-span-2 ${(drug.pregnancy_category === 'D' || drug.pregnancy_category === 'X') ? 'border-red-200 bg-red-50' : 'border-blue-100'}`}>
            <h2 className="font-bold text-gray-900 mb-2">
              Pregnancy Category: <span className="text-primary-600">{drug.pregnancy_category}</span>
            </h2>
            <p className="text-gray-600 text-sm">{pregnancyDesc[drug.pregnancy_category]}</p>
          </div>
        )}

        {/* Medical Conditions */}
        {conditions.length > 0 && (
          <div className="card md:col-span-2">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"/> Related Medical Conditions
            </h2>
            <div className="flex flex-wrap gap-2">
              {conditions.map((c, i) => (
                <span key={i} className="bg-purple-50 text-purple-700 text-xs px-3 py-1.5 rounded-full font-medium" title={c.description}>
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Drug–Herb Interactions */}
      {interactions.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
            <FiAlertTriangle className="text-amber-500"/> Drug–Herb Interactions
          </h2>
          <div className="space-y-3">
            {interactions.map((item, i) => (
              <div key={i} className={`border rounded-xl p-4 ${severityColors[item.severity] || 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-1">
                  <Link to={`/herbs/${item.herb_id}`} className="font-semibold text-gray-900 hover:text-primary-600 text-sm">
                    {item.herb_name || item.common_names}
                  </Link>
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
                    item.severity === 'contraindicated' || item.severity === 'high'
                      ? 'bg-red-200 text-red-800'
                      : item.severity === 'moderate'
                      ? 'bg-amber-200 text-amber-800'
                      : 'bg-green-200 text-green-800'
                  }`}>{item.severity}</span>
                </div>
                <p className="text-sm text-gray-700">{item.description || item.recommendation}</p>
                {item.evidence_level && (
                  <p className="text-xs text-gray-400 mt-1">Evidence: {item.evidence_level}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Herbal Alternatives */}
      {alternatives.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
            <GiHerbsBundle className="text-emerald-600" size={22}/> Possible Herbal Alternatives
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {alternatives.map((alt, i) => (
              <Link key={i} to={`/herbs/${alt.herb_id}`}
                className="card hover:shadow-md hover:border-emerald-200 transition-all flex items-center gap-3">
                <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-xl flex-shrink-0">
                  <GiHerbsBundle size={20}/>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{alt.herb_name}</p>
                  {alt.notes && <p className="text-xs text-gray-500 line-clamp-1">{alt.notes}</p>}
                </div>
              </Link>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">* Herbal alternatives are for educational purposes only. Consult a qualified herbalist or doctor.</p>
        </div>
      )}

      {/* No interactions — reassurance */}
      {interactions.length === 0 && alternatives.length === 0 && (
        <div className="mt-8 card bg-green-50 border-green-200 flex items-center gap-3">
          <FiCheck className="text-green-500 flex-shrink-0" size={20}/>
          <p className="text-green-800 text-sm font-medium">No known drug–herb interactions recorded for this medication.</p>
        </div>
      )}
    </div>
  )
}
