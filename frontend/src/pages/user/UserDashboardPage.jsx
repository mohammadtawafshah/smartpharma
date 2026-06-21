import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { FiHeart, FiBell, FiClock, FiUser, FiChevronRight, FiAlertTriangle } from 'react-icons/fi'
import { GiMedicines, GiHerbsBundle } from 'react-icons/gi'

export default function UserDashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"/>
    </div>
  )

  const favoriteCount  = data?.favorite_count  ?? 0
  const alertCount     = data?.alert_count     ?? 0
  const historyCount   = data?.history_count   ?? 0
  const recentSearches = (data?.recent_searches ?? []).filter(s => s && s.length >= 3)
  const recentDrugs    = data?.recent_drugs    ?? []
  const recentHerbs    = data?.recent_herbs    ?? []

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, <span className="text-primary-600">{user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}</span>
        </h1>
        <p className="text-gray-500 mt-1">Here's a summary of your activity on SmartPharma Guide.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Favorites',      value: favoriteCount, icon: <FiHeart className="text-rose-500"    size={20}/>, link: '/favorites',      bg: 'bg-rose-50'    },
          { label: 'Active Alerts',  value: alertCount,    icon: <FiBell className="text-amber-500"   size={20}/>, link: '/alerts',          bg: 'bg-amber-50'   },
          { label: 'Searches',       value: historyCount,  icon: <FiClock className="text-blue-500"   size={20}/>, link: '/history',         bg: 'bg-blue-50'    },
          { label: 'Health Profile', value: 'View',        icon: <FiUser className="text-emerald-500" size={20}/>, link: '/profile/health',  bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <Link key={i} to={stat.link} className="card hover:shadow-md transition-shadow group">
            <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 group-hover:text-primary-600 transition-colors">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Alerts banner */}
      {alertCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiAlertTriangle className="text-amber-600 flex-shrink-0" size={20}/>
            <div>
              <p className="font-semibold text-amber-800 text-sm">You have {alertCount} active safety alert{alertCount > 1 ? 's' : ''}</p>
              <p className="text-amber-600 text-xs">Based on your health profile and recent searches.</p>
            </div>
          </div>
          <Link to="/alerts" className="btn-primary text-sm py-2 px-4 whitespace-nowrap">View Alerts</Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Drugs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <GiMedicines className="text-primary-500" size={18}/>
              Recently Viewed Drugs
            </h2>
            <Link to="/drugs" className="text-primary-600 text-xs hover:underline flex items-center gap-1">
              Browse all <FiChevronRight size={12}/>
            </Link>
          </div>
          {recentDrugs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No recently viewed drugs</p>
          ) : (
            <div className="space-y-3">
              {recentDrugs.map(drug => (
                <Link key={drug.id} to={`/drugs/${drug.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-primary-50 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{drug.brand_name}</p>
                    <p className="text-gray-400 text-xs">{drug.generic_name}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    drug.rx_otc === 'OTC' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>{drug.rx_otc}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Herbs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <GiHerbsBundle className="text-emerald-500" size={18}/>
              Recently Viewed Herbs
            </h2>
            <Link to="/herbs" className="text-primary-600 text-xs hover:underline flex items-center gap-1">
              Browse all <FiChevronRight size={12}/>
            </Link>
          </div>
          {recentHerbs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No recently viewed herbs</p>
          ) : (
            <div className="space-y-3">
              {recentHerbs.map(herb => (
                <Link key={herb.id} to={`/herbs/${herb.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-emerald-50 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{herb.common_name}</p>
                    <p className="text-gray-400 text-xs italic">{herb.scientific_name}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    herb.pregnancy_safe ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                  }`}>{herb.pregnancy_safe ? 'Pregnancy Safe' : 'Avoid in Pregnancy'}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Searches */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <FiClock className="text-blue-500" size={18}/>
              Recent Searches
            </h2>
            <Link to="/history" className="text-primary-600 text-xs hover:underline flex items-center gap-1">
              Full history <FiChevronRight size={12}/>
            </Link>
          </div>
          {recentSearches.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No recent searches</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term, i) => (
                <Link key={i} to={`/search?q=${encodeURIComponent(term)}`}
                  className="bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 text-sm px-3 py-1.5 rounded-full transition-colors">
                  {term}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { to: '/profile/health', label: 'Update Health Profile', desc: 'Add conditions, allergies, medications', icon: <FiUser size={16}/>, color: 'text-emerald-600' },
              { to: '/favorites',      label: 'My Favorites',          desc: 'Drugs and herbs you saved',            icon: <FiHeart size={16}/>, color: 'text-rose-500'    },
              { to: '/alerts',         label: 'Safety Alerts',         desc: 'Personalized safety notifications',    icon: <FiBell size={16}/>, color: 'text-amber-500'   },
            ].map((item, i) => (
              <Link key={i} to={item.to}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <span className={item.color}>{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
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
