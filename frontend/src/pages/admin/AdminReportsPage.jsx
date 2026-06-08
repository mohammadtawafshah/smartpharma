import { useState, useEffect } from 'react'
import api from '../../services/api'
import { FiTrendingUp, FiUsers, FiSearch, FiHeart } from 'react-icons/fi'
import { GiMedicines, GiHerbsBundle } from 'react-icons/gi'

export default function AdminReportsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/reports').then(r => setData(r.data)).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"/></div>
  if (!data) return <div className="text-center py-24 text-gray-400">Failed to load reports</div>

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiTrendingUp className="text-rose-500" size={24}/> Reports & Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">System overview and usage statistics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label:'Total Drugs',   value:data.total_drugs,        icon:<GiMedicines size={20}/>,  bg:'bg-blue-50',    color:'text-blue-600' },
          { label:'Total Herbs',   value:data.total_herbs,        icon:<GiHerbsBundle size={20}/>,bg:'bg-emerald-50', color:'text-emerald-600' },
          { label:'Users',         value:data.total_users,        icon:<FiUsers size={20}/>,      bg:'bg-purple-50',  color:'text-purple-600' },
          { label:'Interactions',  value:data.total_interactions, icon:<FiTrendingUp size={20}/>, bg:'bg-amber-50',   color:'text-amber-600' },
          { label:'Admins',        value:data.total_admins,       icon:<FiUsers size={20}/>,      bg:'bg-red-50',     color:'text-red-600' },
          { label:'Favorites',     value:data.total_favorites,    icon:<FiHeart size={20}/>,      bg:'bg-rose-50',    color:'text-rose-600' },
          { label:'Total Searches',value:data.total_searches,     icon:<FiSearch size={20}/>,     bg:'bg-indigo-50',  color:'text-indigo-600' },
        ].map((s,i) => (
          <div key={i} className="card">
            <div className={`${s.bg} ${s.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Searches */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FiSearch size={16} className="text-indigo-500"/> Top Searches</h2>
          {data.top_searches?.length === 0 ? <p className="text-gray-400 text-sm">No searches yet</p> :
            <div className="space-y-2">
              {data.top_searches?.map((s,i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{s.keyword}</span>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{s.cnt} times</span>
                </div>
              ))}
            </div>
          }
        </div>

        {/* Drugs by Class */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><GiMedicines size={16} className="text-blue-500"/> Drugs by Class</h2>
          <div className="space-y-2">
            {data.drugs_by_class?.map((d,i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{d.drug_class || 'Uncategorized'}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-blue-200 rounded-full" style={{width: `${Math.min(d.cnt*15,100)}px`}}/>
                  <span className="text-xs text-gray-500 w-4 text-right">{d.cnt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Herbs by Family */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><GiHerbsBundle size={16} className="text-emerald-500"/> Herbs by Family</h2>
          <div className="space-y-2">
            {data.herbs_by_family?.map((h,i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{h.family || 'Unknown'}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-emerald-200 rounded-full" style={{width: `${Math.min(h.cnt*20,100)}px`}}/>
                  <span className="text-xs text-gray-500 w-4 text-right">{h.cnt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users by Month */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FiUsers size={16} className="text-purple-500"/> New Users by Month</h2>
          {data.users_by_month?.length === 0 ? <p className="text-gray-400 text-sm">No data yet</p> :
            <div className="space-y-2">
              {data.users_by_month?.map((u,i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{u.month}</span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{u.cnt} users</span>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  )
}
