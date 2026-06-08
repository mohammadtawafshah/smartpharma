import { Link } from 'react-router-dom'
import { FiAlertTriangle, FiInfo } from 'react-icons/fi'
import { GiMedicines } from 'react-icons/gi'

const pregnancyColors = {
  A: 'bg-green-100 text-green-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-yellow-100 text-yellow-700',
  D: 'bg-orange-100 text-orange-700',
  X: 'bg-red-100 text-red-700',
}

export default function DrugCard({ drug }) {
  return (
    <Link to={`/drugs/${drug.id}`} className="card hover:shadow-md hover:border-primary-200 transition-all duration-200 flex flex-col gap-3 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-primary-50 text-primary-600 p-2 rounded-lg group-hover:bg-primary-100 transition-colors">
            <GiMedicines size={20}/>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-tight">{drug.drug_name}</h3>
            {drug.generic_name && (
              <p className="text-xs text-gray-500">{drug.generic_name}</p>
            )}
          </div>
        </div>
        {drug.pregnancy_category && drug.pregnancy_category !== 'N/A' && (
          <span className={`text-xs font-bold px-2 py-1 rounded-md flex-shrink-0 ${pregnancyColors[drug.pregnancy_category] || 'bg-gray-100 text-gray-600'}`}>
            Cat. {drug.pregnancy_category}
          </span>
        )}
      </div>

      {/* Class + Form */}
      <div className="flex flex-wrap gap-2">
        {drug.drug_class && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{drug.drug_class}</span>
        )}
        {drug.drug_form && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{drug.drug_form}</span>
        )}
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${drug.rx_otc === 'OTC' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
          {drug.rx_otc}
        </span>
      </div>

      {/* Indications preview */}
      {drug.indications && (
        <p className="text-sm text-gray-600 line-clamp-2">{drug.indications}</p>
      )}

      {/* Warning flags */}
      <div className="flex gap-2 mt-auto pt-2 border-t border-gray-50">
        {drug.alcohol_interaction && (
          <span className="badge-warning text-xs"><FiAlertTriangle size={11}/> Alcohol</span>
        )}
        {drug.hypertension_risk && (
          <span className="badge-warning text-xs"><FiAlertTriangle size={11}/> BP Risk</span>
        )}
        {(drug.pregnancy_category === 'D' || drug.pregnancy_category === 'X') && (
          <span className="badge-danger text-xs"><FiAlertTriangle size={11}/> Pregnancy</span>
        )}
        {!drug.alcohol_interaction && !drug.hypertension_risk && drug.pregnancy_category !== 'D' && drug.pregnancy_category !== 'X' && (
          <span className="badge-success text-xs"><FiInfo size={11}/> View details</span>
        )}
      </div>
    </Link>
  )
}
