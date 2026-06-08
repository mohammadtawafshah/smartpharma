import { useState, useEffect } from 'react'
import api from '../../services/api'
import { FiUsers, FiToggleLeft, FiToggleRight, FiSearch } from 'react-icons/fi'

const ROLE_COLORS = { user:'bg-gray-100 text-gray-700', admin:'bg-blue-100 text-blue-700', content_admin:'bg-purple-100 text-purple-700', super_admin:'bg-red-100 text-red-700' }

export default function AdminUsersPage() {
  const [users, setUsers]   = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/admin/users').then(r => setUsers(r.data)).catch(()=>{}).finally(()=>setLoading(false))
  }
  useEffect(() => { load() }, [])

  async function handleToggle(id, name, active) {
    if (!window.confirm(`${active ? 'Deactivate' : 'Activate'} user "${name}"?`)) return
    setToggling(id)
    await api.put(`/admin/users/${id}`).catch(()=>{})
    load(); setToggling(null)
  }

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiUsers className="text-purple-600" size={24}/> Manage Users
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{users.length} registered users</p>
        </div>
      </div>

      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..." className="input pl-9 max-w-sm"/>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['#','Full Name','Email','Role','Status','Joined','Actions'].map(h=>(
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={7} className="text-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"/></td></tr>
            : filtered.length===0 ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">No users found</td></tr>
            : filtered.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{user.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
                      {user.full_name?.[0] || user.email?.[0]}
                    </div>
                    <span className="font-medium text-gray-900">{user.full_name || '—'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[user.role]||'bg-gray-100 text-gray-600'}`}>
                    {user.role?.replace('_',' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{user.created_at?.split('T')[0] || user.created_at?.split(' ')[0]}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggle(user.id, user.full_name||user.email, user.is_active)}
                    disabled={toggling===user.id || ['super_admin','admin'].includes(user.role)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    {user.is_active
                      ? <><FiToggleRight className="text-green-500" size={16}/> Deactivate</>
                      : <><FiToggleLeft className="text-gray-400" size={16}/> Activate</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
