import { Link } from 'react-router-dom'
import { FiAlertTriangle } from 'react-icons/fi'
import { GiHerbsBundle } from 'react-icons/gi'

export default function HerbCard({ herb }) {
  return (
    <Link to={`/herbs/${herb.id}`} className="card hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex flex-col gap-3 group">
      {/* Header */}
      <div className="flex items-start gap-2">
        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg group-hover:bg-emerald-100 transition-colors flex-shrink-0">
          <GiHerbsBundle size={20}/>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-base leading-tight">{herb.herb_name}</h3>
          {herb.scientific_name && (
            <p className="text-xs text-gray-400 italic">{herb.scientific_name}</p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {herb.family && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{herb.family}</span>
        )}
        {herb.parts_used && (
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">{herb.parts_used}</span>
        )}
        {herb.origin_region && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">{herb.origin_region}</span>
        )}
      </div>

      {/* Benefits preview */}
      {herb.benefits && (
        <p className="text-sm text-gray-600 line-clamp-2">{herb.benefits}</p>
      )}

      {/* Warning flags */}
      <div className="flex gap-2 mt-auto pt-2 border-t border-gray-50">
        {herb.pregnancy_safe === false && (
          <span className="badge-warning text-xs"><FiAlertTriangle size={11}/> Pregnancy Caution</span>
        )}
        {herb.hypertension_risk && (
          <span className="badge-warning text-xs"><FiAlertTriangle size={11}/> BP Risk</span>
        )}
        {herb.pregnancy_safe === true && !herb.hypertension_risk && (
          <span className="badge-success text-xs">Generally Safe</span>
        )}
      </div>
    </Link>
  )
}
