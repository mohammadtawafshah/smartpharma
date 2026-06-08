import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { GiHerbsBundle } from 'react-icons/gi'

export default function AdminHerbsPage() {
  const navigate = useNavigate()
  const [herbs, setHerbs]   = useState([])
  const [total, setTotal]   = useState(0)
  const [pages, setPages]   = useState(1)
  const [page, setPage]     = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  const load = (p=1) => {
    setLoading(true)
    api.get(`/admin/herbs?page=${p}`)
      .then(r => { setHerbs(r.data.data); setTotal(r.data.total); setPages(Math.ceil(r.data.total/20)) })
      .catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load(page) }, [page])

  const filtered = herbs.filter(h =>
    h.herb_name?.toLowerCase().includes(search.toLowerCase()) ||
    h.scientific_name?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id, name) {
    if (!window.confirm(`Deactivate "${name}"?`)) return
    setDeleting(id)
    await api.delete(`/admin/herbs/${id}`).catch(() => {})
    load(page); setDeleting(null)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GiHerbsBundle className="text-emerald-600" size={26}/> Herbs Encyclopedia
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} herbs total</p>
        </div>
        <Link to="/admin/herbs/new" className="btn-primary flex items-center gap-2">
          <FiPlus size={16}/> Add Herb
        </Link>
      </div>

      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search herbs..." className="input pl-9 max-w-sm"/>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Herb Name','Scientific Name','Family','Pregnancy Safe','Status','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? Array(5).fill(0).map((_,i) => (
              <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"/></td></tr>
            )) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">No herbs found</td></tr>
            ) : filtered.map(herb => (
              <tr key={herb.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-900">{herb.herb_name}</td>
                <td className="px-4 py-3 text-gray-500 italic">{herb.scientific_name}</td>
                <td className="px-4 py-3 text-gray-500">{herb.family}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${herb.pregnancy_safe ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {herb.pregnancy_safe ? 'Safe' : 'Avoid'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${herb.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {herb.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/admin/herbs/${herb.id}/edit`)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <FiEdit2 size={15}/>
                    </button>
                    <button onClick={() => handleDelete(herb.id, herb.herb_name)}
                      disabled={deleting===herb.id}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50">
                      <FiTrash2 size={15}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40"><FiChevronLeft size={16}/></button>
          <span className="text-sm text-gray-600">Page {page} of {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40"><FiChevronRight size={16}/></button>
        </div>
      )}
    </div>
  )
}
