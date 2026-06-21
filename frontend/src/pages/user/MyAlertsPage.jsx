import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { FiBell, FiCheck, FiAlertTriangle, FiInfo, FiClock, FiTrash2, FiCalendar } from 'react-icons/fi'
import { GiMedicines, GiHerbsBundle } from 'react-icons/gi'

const TYPE_STYLES = {
  danger:  { bg:'bg-red-50',    border:'border-red-200',    icon:<FiAlertTriangle className="text-red-500 flex-shrink-0" size={18}/>,  text:'text-red-800' },
  warning: { bg:'bg-amber-50',  border:'border-amber-200',  icon:<FiAlertTriangle className="text-amber-500 flex-shrink-0" size={18}/>, text:'text-amber-800' },
  info:    { bg:'bg-blue-50',   border:'border-blue-200',   icon:<FiInfo className="text-blue-500 flex-shrink-0" size={18}/>,           text:'text-blue-800' },
}

const FREQ_LABELS = { 1:'Every day', 2:'Every 2 days', 3:'Every 3 days', 7:'Once a week' }

function formatTime(t) {
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12  = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

export default function MyAlertsPage() {
  const [tab,       setTab]       = useState('reminders')
  const [alerts,    setAlerts]    = useState([])
  const [due,       setDue]       = useState([])
  const [schedules, setSchedules] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/alerts').catch(() => ({ data: [] })),
      api.get('/schedules/due').catch(() => ({ data: [] })),
      api.get('/schedules').catch(() => ({ data: [] })),
    ]).then(([a, d, s]) => {
      setAlerts(a.data || [])
      setDue(d.data || [])
      setSchedules(s.data || [])
    }).finally(() => setLoading(false))
  }, [])

  async function markRead(id) {
    await api.put(`/alerts/${id}`).catch(() => {})
    setAlerts(a => a.filter(x => x.id !== id))
  }

  async function removeSchedule(id) {
    await api.delete(`/schedules/${id}`).catch(() => {})
    setSchedules(s => s.filter(x => x.id !== id))
    setDue(d => d.filter(x => x.schedule_id !== id))
  }

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"/>
    </div>
  )

  const dueNow     = due.filter(d => d.is_due)
  const upcoming   = due.filter(d => !d.is_due)

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-amber-100 text-amber-600 p-3 rounded-2xl"><FiBell size={24}/></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Alerts</h1>
          <p className="text-gray-500 text-sm">Safety alerts and medication reminders</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        {[
          { key: 'reminders', label: 'Medication Reminders', count: due.length },
          { key: 'safety',    label: 'Safety Alerts',        count: alerts.length },
          { key: 'schedules', label: 'My Schedules',         count: schedules.length },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
              tab === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
            {t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                tab === t.key ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-600'
              }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Medication Reminders ── */}
      {tab === 'reminders' && (
        <div className="space-y-4">
          {due.length === 0 ? (
            <div className="card text-center py-16">
              <FiClock className="text-gray-300 mx-auto mb-3" size={40}/>
              <p className="text-gray-500 font-medium">No reminders for today</p>
              <p className="text-gray-400 text-sm mt-1">
                Browse <Link to="/drugs" className="text-primary-600 hover:underline">drugs</Link> or{' '}
                <Link to="/herbs" className="text-primary-600 hover:underline">herbs</Link> and click "Start Taking" to set reminders.
              </p>
            </div>
          ) : (
            <>
              {dueNow.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>
                    Due Now ({dueNow.length})
                  </p>
                  <div className="space-y-2">
                    {dueNow.map((r, i) => (
                      <ReminderCard key={i} r={r} />
                    ))}
                  </div>
                </div>
              )}
              {upcoming.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 mt-4">Upcoming Today</p>
                  <div className="space-y-2">
                    {upcoming.map((r, i) => (
                      <ReminderCard key={i} r={r} muted />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Tab: Safety Alerts ── */}
      {tab === 'safety' && (
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="card text-center py-16">
              <FiBell className="text-gray-300 mx-auto mb-3" size={40}/>
              <p className="text-gray-500 font-medium">No active safety alerts</p>
              <p className="text-gray-400 text-sm mt-1">You're all clear! Check back after browsing drugs.</p>
            </div>
          ) : alerts.map(alert => {
            const s = TYPE_STYLES[alert.alert_type || alert.type] || TYPE_STYLES.info
            return (
              <div key={alert.id} className={`${s.bg} ${s.border} border rounded-xl p-4 flex items-start gap-3`}>
                {s.icon}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${s.text}`}>{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(alert.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => markRead(alert.id)}
                  className="p-1.5 hover:bg-white/60 rounded-lg transition-colors flex-shrink-0" title="Mark as read">
                  <FiCheck size={16} className="text-gray-500"/>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Tab: My Schedules ── */}
      {tab === 'schedules' && (
        <div className="space-y-3">
          {schedules.length === 0 ? (
            <div className="card text-center py-16">
              <FiCalendar className="text-gray-300 mx-auto mb-3" size={40}/>
              <p className="text-gray-500 font-medium">No active schedules</p>
              <p className="text-gray-400 text-sm mt-1">
                Open a <Link to="/drugs" className="text-primary-600 hover:underline">drug</Link> or{' '}
                <Link to="/herbs" className="text-primary-600 hover:underline">herb</Link> page and click "Start Taking".
              </p>
            </div>
          ) : schedules.map(s => (
            <div key={s.id} className="card flex items-start gap-4">
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${s.item_type === 'drug' ? 'bg-primary-100 text-primary-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {s.item_type === 'drug' ? <GiMedicines size={20}/> : <GiHerbsBundle size={20}/>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{s.item_name}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <FiClock size={11}/>
                    {s.reminder_times.map(formatTime).join(', ')}
                  </span>
                  <span className="text-xs text-gray-500">• {FREQ_LABELS[s.frequency_days] || `Every ${s.frequency_days} days`}</span>
                </div>
                {s.notes && <p className="text-xs text-gray-400 mt-1 italic">{s.notes}</p>}
                <p className="text-xs text-gray-400 mt-0.5">
                  From {new Date(s.start_date).toLocaleDateString()}
                  {s.end_date ? ` → ${new Date(s.end_date).toLocaleDateString()}` : ' (no end date)'}
                </p>
              </div>
              <button onClick={() => removeSchedule(s.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                title="Remove schedule">
                <FiTrash2 size={15}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ReminderCard({ r, muted }) {
  return (
    <div className={`border rounded-xl p-4 flex items-center gap-3 ${
      muted ? 'bg-gray-50 border-gray-200' : 'bg-primary-50 border-primary-200'
    }`}>
      <div className={`p-2 rounded-xl flex-shrink-0 ${
        r.item_type === 'drug'
          ? muted ? 'bg-gray-200 text-gray-500' : 'bg-primary-100 text-primary-600'
          : muted ? 'bg-gray-200 text-gray-500' : 'bg-emerald-100 text-emerald-600'
      }`}>
        {r.item_type === 'drug' ? <GiMedicines size={18}/> : <GiHerbsBundle size={18}/>}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm truncate ${muted ? 'text-gray-500' : 'text-gray-900'}`}>
          {r.item_name}
        </p>
        {r.notes && <p className="text-xs text-gray-400 italic truncate">{r.notes}</p>}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <FiClock size={14} className={muted ? 'text-gray-400' : 'text-primary-500'}/>
        <span className={`text-sm font-semibold ${muted ? 'text-gray-400' : 'text-primary-700'}`}>
          {formatTime(r.reminder_time)}
        </span>
      </div>
    </div>
  )
}
