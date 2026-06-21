import { useEffect, useRef } from 'react'
import api from '../services/api'

// Key: "scheduleId_HH:MM_YYYY-MM-DD" → prevents sending the same notification twice per day
function buildKey(scheduleId, time) {
  const today = new Date().toISOString().split('T')[0]
  return `sp_notif_${scheduleId}_${time}_${today}`
}

function alreadySent(scheduleId, time) {
  return localStorage.getItem(buildKey(scheduleId, time)) === '1'
}

function markSent(scheduleId, time) {
  localStorage.setItem(buildKey(scheduleId, time), '1')
}

async function requestPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

function sendNotification(itemName, time, notes) {
  const body = notes
    ? `Time: ${time}\n${notes}`
    : `It's time to take your medication. Scheduled at ${time}.`
  const n = new Notification(`💊 Reminder: ${itemName}`, {
    body,
    icon: '/smartpharma/favicon.ico',
    badge: '/smartpharma/favicon.ico',
    tag: `sp-med-${itemName}-${time}`,
    requireInteraction: true,
  })
  n.onclick = () => {
    window.focus()
    window.location.href = '/smartpharma/alerts'
    n.close()
  }
}

async function checkAndNotify() {
  if (Notification.permission !== 'granted') return
  try {
    const res = await api.get('/schedules/due')
    const due = res.data || []
    const nowTime = new Date().toTimeString().slice(0, 5) // "HH:MM"

    due.forEach(r => {
      if (!r.is_due) return
      if (alreadySent(r.schedule_id, r.reminder_time)) return
      // Only fire if the reminder time is within the last 5 minutes
      const [rH, rM] = r.reminder_time.split(':').map(Number)
      const [nH, nM] = nowTime.split(':').map(Number)
      const rMins = rH * 60 + rM
      const nMins = nH * 60 + nM
      if (nMins >= rMins && nMins - rMins <= 5) {
        sendNotification(r.item_name, r.reminder_time, r.notes)
        markSent(r.schedule_id, r.reminder_time)
      }
    })
  } catch {
    // silently fail — user might be logged out
  }
}

export function useMedicationNotifications(user) {
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!user) return

    // Ask for permission once
    requestPermission()

    // Check immediately, then every 60 seconds
    checkAndNotify()
    intervalRef.current = setInterval(checkAndNotify, 60_000)

    return () => clearInterval(intervalRef.current)
  }, [user])
}
