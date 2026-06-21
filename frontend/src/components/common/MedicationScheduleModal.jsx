import { useState } from 'react'
import { FiX, FiClock, FiCalendar, FiPlus, FiMinus, FiCheck } from 'react-icons/fi'
import { GiMedicines, GiHerbsBundle } from 'react-icons/gi'
import api from '../../services/api'

const FREQ_OPTIONS = [
  { value: 1, label: 'Every day' },
  { value: 2, label: 'Every 2 days' },
  { value: 3, label: 'Every 3 days' },
  { value: 7, label: 'Once a week' },
]

export default function MedicationScheduleModal({ item, itemType, onClose }) {
  const today = new Date().toISOString().split('T')[0]

  const [timesPerDay,   setTimesPerDay]   = useState(1)
  const [reminderTimes, setReminderTimes] = useState(['08:00'])
  const [freqDays,      setFreqDays]      = useState(1)
  const [startDate,     setStartDate]     = useState(today)
  const [endDate,       setEndDate]       = useState('')
  const [notes,         setNotes]         = useState('')
  const [saving,        setSaving]        = useState(false)
  const [done,          setDone]          = useState(false)
  const [error,         setError]         = useState('')

  function changeTimesPerDay(n) {
    setTimesPerDay(n)
    setReminderTimes(prev => {
      const arr = [...prev]
      const defaults = ['08:00','13:00','18:00','21:00']
      while (arr.length < n) arr.push(defaults[arr.length] || '08:00')
      return arr.slice(0, n)
    })
  }

  function updateTime(i, val) {
    setReminderTimes(prev => prev.map((t, idx) => idx === i ? val : t))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post('/schedules', {
        item_type:      itemType,
        item_name:      item.drug_name || item.herb_name || item.name,
        drug_id:        itemType === 'drug' ? item.id : null,
        herb_id:        itemType === 'herb' ? item.id : null,
        reminder_times: reminderTimes,
        frequency_days: freqDays,
        start_date:     startDate,
        end_date:       endDate || null,
        notes:          notes,
      })
      setDone(true)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const itemName = item.drug_name || item.herb_name || item.name

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${itemType === 'drug' ? 'bg-primary-100 text-primary-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {itemType === 'drug' ? <GiMedicines size={20}/> : <GiHerbsBundle size={20}/>}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">Schedule Reminders</h2>
              <p className="text-xs text-gray-400 truncate max-w-[200px]">{itemName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <FiX size={20}/>
          </button>
        </div>

        {done ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck size={28} className="text-emerald-600"/>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Reminders Set!</h3>
            <p className="text-gray-500 text-sm mb-6">
              You'll receive {timesPerDay} reminder{timesPerDay > 1 ? 's' : ''} per day for <strong>{itemName}</strong>.
              Check <strong>My Alerts</strong> to see today's schedule.
            </p>
            <button onClick={onClose} className="btn-primary w-full">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="px-6 py-5 space-y-5">

            {/* Times per day */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FiClock size={14} className="inline mr-1.5 text-primary-500"/>
                How many times per day?
              </label>
              <div className="flex gap-2">
                {[1,2,3,4].map(n => (
                  <button
                    key={n} type="button"
                    onClick={() => changeTimesPerDay(n)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      timesPerDay === n
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-500 hover:border-primary-300'
                    }`}
                  >
                    {n}x
                  </button>
                ))}
              </div>
            </div>

            {/* Reminder times */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Reminder Times</label>
              <div className="space-y-2">
                {reminderTimes.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-16">
                      {i === 0 ? 'Morning' : i === 1 ? 'Midday' : i === 2 ? 'Evening' : 'Night'}
                    </span>
                    <input
                      type="time"
                      value={t}
                      onChange={e => updateTime(i, e.target.value)}
                      className="input flex-1 py-2 text-sm"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency</label>
              <div className="grid grid-cols-2 gap-2">
                {FREQ_OPTIONS.map(opt => (
                  <button
                    key={opt.value} type="button"
                    onClick={() => setFreqDays(opt.value)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all text-left ${
                      freqDays === opt.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-500 hover:border-primary-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  <FiCalendar size={12} className="inline mr-1"/>Start Date
                </label>
                <input type="date" value={startDate} min={today}
                  onChange={e => setStartDate(e.target.value)}
                  className="input py-2 text-sm w-full" required/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  End Date <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input type="date" value={endDate} min={startDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="input py-2 text-sm w-full"/>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Notes <span className="text-gray-400 font-normal">(e.g., take with food)</span>
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Take with food, after meals..."
                className="input py-2 text-sm w-full resize-none"
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-60">
                {saving ? 'Saving...' : 'Set Reminders'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
