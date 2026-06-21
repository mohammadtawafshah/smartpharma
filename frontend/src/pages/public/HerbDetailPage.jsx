import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiArrowLeft, FiAlertTriangle, FiHeart, FiCheck, FiClock } from 'react-icons/fi'
import { GiHerbsBundle } from 'react-icons/gi'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import MedicationScheduleModal from '../../components/common/MedicationScheduleModal'

export default function HerbDetailPage() {
  const { id }   = useParams()
  const { user } = useAuth()

  const [herb,         setHerb]         = useState(null)
  const [fav,          setFav]          = useState(false)
  const [loading,      setLoading]      = useState(true)
  const [notFound,     setNotFound]     = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/herbs/${id}`)
      .then(r => setHerb(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  async function toggleFav() {
    if (!user) return
    await api.post('/favorites', { item_type: 'herb', item_id: Number(id) }).catch(() => {})
    setFav(f => !f)
  }

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"/>
    </div>
  )

  if (notFound || !herb) return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center text-gray-400">
      <GiHerbsBundle size={48} className="mx-auto mb-3 opacity-30"/>
      <p className="font-medium text-lg">Herb not found.</p>
      <Link to="/herbs" className="text-emerald-600 text-sm mt-2 inline-block">← Back to herbs</Link>
    </div>
  )

  const interactions = herb.drug_interactions || []

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/herbs" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-6">
        <FiArrowLeft size={15}/> Back to Herb Encyclopedia
      </Link>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl">
              <GiHerbsBundle size={30}/>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{herb.herb_name}</h1>
              {herb.scientific_name && <p className="text-gray-400 italic mt-1 text-sm">{herb.scientific_name}</p>}
              {herb.common_names    && <p className="text-xs text-gray-400 mt-0.5">Common names: {herb.common_names}</p>}
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-3 flex-shrink-0">
              <button onClick={toggleFav}
                className={`flex items-center gap-2 transition-colors text-sm ${fav ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                <FiHeart size={18} className={fav ? 'fill-current' : ''}/> {fav ? 'Saved' : 'Save'}
              </button>
              <button onClick={() => setShowSchedule(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                <FiClock size={15}/> Start Taking
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-gray-100">
          {herb.family         && <span className="badge-info">{herb.family}</span>}
          {herb.parts_used     && <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">{herb.parts_used}</span>}
          {herb.origin_region  && <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">{herb.origin_region}</span>}
          {herb.evidence_level && <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full">Evidence: {herb.evidence_level}</span>}
          {herb.pregnancy_safe === true  && <span className="badge-success"><FiCheck size={11}/> Pregnancy Safe</span>}
          {herb.pregnancy_safe === false && <span className="badge-warning"><FiAlertTriangle size={11}/> Pregnancy Caution</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {herb.benefits && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"/> Benefits
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">{herb.benefits}</p>
          </div>
        )}

        {(herb.traditional_uses || herb.uses) && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"/> Traditional Uses
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">{herb.traditional_uses || herb.uses}</p>
          </div>
        )}

        {herb.preparation_methods && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-500 rounded-full"/> Preparation Methods
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">{herb.preparation_methods}</p>
          </div>
        )}

        {herb.extraction_methods && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"/> Extraction Methods
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">{herb.extraction_methods}</p>
          </div>
        )}

        {herb.active_compounds && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"/> Active Compounds
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">{herb.active_compounds}</p>
          </div>
        )}

        {herb.dosage_guidelines && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"/> Dosage Guidelines
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">{herb.dosage_guidelines}</p>
          </div>
        )}

        {herb.side_effects && (
          <div className="card border-amber-200 bg-amber-50">
            <h2 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
              <FiAlertTriangle size={15} className="text-amber-600"/> Side Effects
            </h2>
            <p className="text-amber-700 text-sm leading-relaxed">{herb.side_effects}</p>
          </div>
        )}

        {herb.contraindications && (
          <div className="card border-red-200 bg-red-50">
            <h2 className="font-bold text-red-800 mb-3 flex items-center gap-2">
              <FiAlertTriangle size={15} className="text-red-500"/> Contraindications
            </h2>
            <p className="text-red-700 text-sm leading-relaxed">{herb.contraindications}</p>
          </div>
        )}

        {herb.toxicity_level && herb.toxicity_level !== 'none' && (
          <div className="card border-red-100">
            <h2 className="font-bold text-gray-900 mb-2">Toxicity Level</h2>
            <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
              herb.toxicity_level === 'high'   ? 'bg-red-200 text-red-800' :
              herb.toxicity_level === 'medium' ? 'bg-amber-200 text-amber-800' :
              'bg-green-200 text-green-800'
            }`}>{herb.toxicity_level}</span>
          </div>
        )}
      </div>

      {/* Drug–Herb Interactions */}
      {interactions.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
            <FiAlertTriangle className="text-amber-500"/> Known Drug Interactions
          </h2>
          <div className="space-y-3">
            {interactions.map((item, i) => (
              <div key={i} className={`border rounded-xl p-4 ${
                item.severity === 'contraindicated' || item.severity === 'high'
                  ? 'border-red-200 bg-red-50'
                  : item.severity === 'moderate'
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-green-200 bg-green-50'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <Link to={`/drugs/${item.drug_id}`} className="font-semibold text-gray-900 hover:text-primary-600 text-sm">
                    {item.drug_name} {item.generic_name ? `(${item.generic_name})` : ''}
                  </Link>
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
                    item.severity === 'contraindicated' || item.severity === 'high' ? 'bg-red-200 text-red-800' :
                    item.severity === 'moderate' ? 'bg-amber-200 text-amber-800' : 'bg-green-200 text-green-800'
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

      {interactions.length === 0 && (
        <div className="mt-8 card bg-green-50 border-green-200 flex items-center gap-3">
          <FiCheck className="text-green-500 flex-shrink-0" size={20}/>
          <p className="text-green-800 text-sm font-medium">No known drug interactions recorded for this herb.</p>
        </div>
      )}

      {user && (
        <div className="mt-8 card bg-emerald-50 border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-xl flex-shrink-0">
              <FiClock size={20}/>
            </div>
            <div>
              <p className="font-semibold text-emerald-900 text-sm">Set Herb Reminders</p>
              <p className="text-emerald-700 text-xs mt-0.5">Schedule daily reminders to take {herb.herb_name} — we'll notify you in My Alerts.</p>
            </div>
          </div>
          <button onClick={() => setShowSchedule(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors whitespace-nowrap flex-shrink-0">
            <FiClock size={14} className="inline mr-1.5"/> Start Taking
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-6 text-center">
        * Information provided for educational purposes only. Always consult a qualified healthcare professional before using any herbal product.
      </p>

      {showSchedule && herb && (
        <MedicationScheduleModal
          item={herb}
          itemType="herb"
          onClose={() => setShowSchedule(false)}
        />
      )}
    </div>
  )
}
