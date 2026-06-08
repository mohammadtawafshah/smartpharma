import { FiAlertTriangle, FiXCircle, FiInfo, FiX } from 'react-icons/fi'
import { useState } from 'react'

const config = {
  danger:  { bg: 'bg-red-50 border-red-200',   text: 'text-red-800',   icon: <FiXCircle       className="text-red-500 flex-shrink-0 mt-0.5" size={18}/> },
  warning: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', icon: <FiAlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={18}/> },
  info:    { bg: 'bg-blue-50 border-blue-200',   text: 'text-blue-800',  icon: <FiInfo          className="text-blue-500 flex-shrink-0 mt-0.5" size={18}/> },
}

export default function AlertBanner({ alerts = [] }) {
  const [dismissed, setDismissed] = useState([])
  const visible = alerts.filter((_, i) => !dismissed.includes(i))
  if (!visible.length) return null

  return (
    <div className="space-y-2 mb-6">
      {alerts.map((alert, i) => {
        if (dismissed.includes(i)) return null
        const c = config[alert.severity] || config.info
        return (
          <div key={i} className={`flex items-start gap-3 border rounded-lg px-4 py-3 ${c.bg}`}>
            {c.icon}
            <p className={`text-sm flex-1 ${c.text}`}>{alert.message}</p>
            <button onClick={() => setDismissed(d => [...d, i])} className={`${c.text} opacity-60 hover:opacity-100`}>
              <FiX size={16}/>
            </button>
          </div>
        )
      })}
    </div>
  )
}
