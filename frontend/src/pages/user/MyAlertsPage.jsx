import { useState, useEffect } from 'react'
import api from '../../services/api'
import { FiBell, FiCheck, FiAlertTriangle, FiInfo } from 'react-icons/fi'

const TYPE_STYLES = {
  danger:  { bg:'bg-red-50',    border:'border-red-200',    icon:<FiAlertTriangle className="text-red-500 flex-shrink-0" size={18}/>,  text:'text-red-800' },
  warning: { bg:'bg-amber-50',  border:'border-amber-200',  icon:<FiAlertTriangle className="text-amber-500 flex-shrink-0" size={18}/>, text:'text-amber-800' },
  info:    { bg:'bg-blue-50',   border:'border-blue-200',   icon:<FiInfo className="text-blue-500 flex-shrink-0" size={18}/>,           text:'text-blue-800' },
}

export default function MyAlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/alerts').then(r => setAlerts(r.data)).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  async function markRead(id) {
    await api.put(`/alerts/${id}`).catch(()=>{})
    setAlerts(a => a.filter(x => x.id !== id))
  }

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"/></div>

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-amber-100 text-amber-600 p-3 rounded-2xl"><FiBell size={24}/></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Safety Alerts</h1>
          <p className="text-gray-500 text-sm">Personalized alerts based on your health profile</p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="card text-center py-16">
          <FiBell className="text-gray-300 mx-auto mb-3" size={40}/>
          <p className="text-gray-500 font-medium">No active alerts</p>
          <p className="text-gray-400 text-sm mt-1">You're all clear! Check back after browsing drugs.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => {
            const s = TYPE_STYLES[alert.alert_type || alert.type] || TYPE_STYLES.info
            return (
              <div key={alert.id} className={`${s.bg} ${s.border} border rounded-xl p-4 flex items-start gap-3`}>
                {s.icon}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${s.text}`}>{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(alert.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => markRead(alert.id)}
                  className="p-1.5 hover:bg-white/60 rounded-lg transition-colors flex-shrink-0"
                  title="Mark as read">
                  <FiCheck size={16} className="text-gray-500"/>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
