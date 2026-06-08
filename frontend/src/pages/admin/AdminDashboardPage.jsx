import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import {
  FiUsers, FiShield, FiAlertTriangle, FiPlus,
  FiEdit, FiTrendingUp, FiDatabase, FiChevronRight
} from 'react-icons/fi'
import { GiMedicines, GiHerbsBundle } from 'react-icons/gi'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ drugs: 0, herbs: 0, users: 0, drug_herb_interactions: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Total Drugs',        value: stats.drugs,                  icon: <GiMedicines size={22}/>,    bg: 'bg-blue-50',    color: 'text-blue-600',    link: '/admin/drugs' },
    { label: 'Total Herbs',        value: stats.herbs,                  icon: <GiHerbsBundle size={22}/>,  bg: 'bg-emerald-50', color: 'text-emerald-600', link: '/admin/herbs' },
    { label: 'Registered Users',   value: stats.users,                  icon: <FiUsers size={22}/>,        bg: 'bg-purple-50',  color: 'text-purple-600',  link: '/admin/users' },
    { label: 'Drug-Herb Interactions', value: stats.drug_herb_interactions, icon: <FiAlertTriangle size={22}/>, bg: 'bg-amber-50', color: 'text-amber-600', link: '/admin/interactions' },
  ]

  const quickActions = [
    { label: 'Add New Drug',  desc: 'Add a drug to the database',        icon: <GiMedicines size={18}/>,   color: 'text-blue-600',    bg: 'bg-blue-50',    link: '/admin/drugs/new' },
    { label: 'Add New Herb',  desc: 'Add an herb to the encyclopedia',   icon: <GiHerbsBundle size={18}/>, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/admin/herbs/new' },
    { label: 'Manage Users',  desc: 'View and manage user accounts',     icon: <FiUsers size={18}/>,       color: 'text-purple-600',  bg: 'bg-purple-50',  link: '/admin/users' },
    { label: 'View Reports',  desc: 'System reports and analytics',      icon: <FiTrendingUp size={18}/>,  color: 'text-rose-600',    bg: 'bg-rose-50',    link: '/admin/reports' },
    { label: 'Alert Rules',  desc: 'Manage safety alert triggers',      icon: <FiAlertTriangle size={18}/>, color: 'text-amber-600',  bg: 'bg-amber-50',   link: '/admin/alert-rules' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FiShield className="text-purple-600" size={20}/>
            <span className="text-sm font-medium text-purple-600 uppercase tracking-wide">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome, {user?.full_name || user?.email}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/drugs/new" className="btn-primary flex items-center gap-2 text-sm">
            <FiPlus size={16}/> Add Drug
          </Link>
          <Link to="/admin/herbs/new" className="btn-secondary flex items-center gap-2 text-sm">
            <FiPlus size={16}/> Add Herb
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <Link key={i} to={s.link} className="card hover:shadow-md transition-shadow group">
            <div className={`${s.bg} w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              {s.icon}
            </div>
            {loading ? (
              <div className="h-8 w-12 bg-gray-100 rounded animate-pulse mb-1"/>
            ) : (
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            )}
            <p className="text-xs text-gray-500 mt-0.5 group-hover:text-primary-600">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Quick Actions */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiEdit size={16} className="text-primary-500"/> Quick Actions
          </h2>
          <div className="space-y-2">
            {quickActions.map((a, i) => (
              <Link key={i} to={a.link}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className={`${a.bg} ${a.color} w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  {a.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-600">{a.label}</p>
                  <p className="text-xs text-gray-400">{a.desc}</p>
                </div>
                <FiChevronRight className="text-gray-300 group-hover:text-primary-400" size={14}/>
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiDatabase size={16} className="text-primary-500"/> Manage Content
          </h2>
          <div className="space-y-2">
            {[
              { label: 'Drugs Database',     sub: 'Add, edit, delete drugs',            link: '/admin/drugs',        icon: <GiMedicines size={16}/>,   color: 'text-blue-600',    bg: 'bg-blue-50' },
              { label: 'Herbs Encyclopedia', sub: 'Add, edit, delete herbs',            link: '/admin/herbs',        icon: <GiHerbsBundle size={16}/>,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Interactions',       sub: 'Manage drug-herb interactions',      link: '/admin/interactions', icon: <FiAlertTriangle size={16}/>, color: 'text-amber-600',   bg: 'bg-amber-50' },
              { label: 'Users',              sub: 'Manage registered users',            link: '/admin/users',        icon: <FiUsers size={16}/>,         color: 'text-purple-600',  bg: 'bg-purple-50' },
              { label: 'Reports',            sub: 'View analytics and statistics',      link: '/admin/reports',      icon: <FiTrendingUp size={16}/>,    color: 'text-rose-600',    bg: 'bg-rose-50' },
            ].map((item, i) => (
              <Link key={i} to={item.link}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className={`${item.bg} ${item.color} w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-600">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
                <FiChevronRight className="text-gray-300 group-hover:text-primary-400" size={14}/>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
