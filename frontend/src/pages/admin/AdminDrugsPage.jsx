import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { GiMedicines } from 'react-icons/gi'

const PREGNANCY_COLORS = { A:'bg-green-100 text-green-700', B:'bg-blue-100 text-blue-700', C:'bg-yellow-100 text-yellow-700', D:'bg-orange-100 text-orange-700', X:'bg-red-100 text-red-700' }

export default function AdminDrugsPage() {
  const navigate = useNavigate()
  const [drugs, setDrugs]   = useState([])
  const [total, setTotal]   = useState(0)
  const [pages, setPages]   = useState(1)
  const [page, setPage]     = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  const load = (p = 1) => {
    setLoading(true)
    api.get(`/admin/drugs?page=${p}`)
      .then(r => { setDrugs(r.data.data); setTotal(r.data.total); setPages(Math.ceil(r.data.total/20)) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(page) }, [page])

  const filtered = drugs.filter(d =>
    d.drug_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.generic_name?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id, name) {
    if (!window.confirm(`Deactivate "${name}"?`)) return
    setDeleting(id)
    await api.delete(`/admin/drugs/${id}`).catch(() => {})
    load(page)
    setDeleting(null)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GiMedicines className="text-primary-600" size={26}/> Drugs Database
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} drugs total</p>
        </div>
        <Link to="/admin/drugs/new" className="btn-primary flex items-center gap-2">
          <FiPlus size={16}/> Add Drug
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name..." className="input pl-9 max-w-sm" />
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Drug Name','Generic Name','Class','Form','Rx/OTC','Pregnancy','Status','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array(5).fill(0).map((_,i) => (
                <tr key={i}><td colSpan={8} className="px-4 py-3">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"/>
                </td></tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400">No drugs found</td></tr>
            ) : filtered.map(drug => (
              <tr key={drug.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-900">{drug.drug_name}</td>
                <td className="px-4 py-3 text-gray-500">{drug.generic_name}</td>
                <td className="px-4 py-3 text-gray-500">{drug.drug_class}</td>
                <td className="px-4 py-3 text-gray-500">{drug.drug_form}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${drug.rx_otc==='OTC' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {drug.rx_otc}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PREGNANCY_COLORS[drug.pregnancy_category] || 'bg-gray-100 text-gray-600'}`}>
                    Cat {drug.pregnancy_category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${drug.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {drug.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/admin/drugs/${drug.id}/edit`)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <FiEdit2 size={15}/>
                    </button>
                    <button onClick={() => handleDelete(drug.id, drug.drug_name)}
                      disabled={deleting === drug.id}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                      <FiTrash2 size={15}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
            <FiChevronLeft size={16}/>
          </button>
          <span className="text-sm text-gray-600">Page {page} of {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages}
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
            <FiChevronRight size={16}/>
          </button>
        </div>
      )}
    </div>
  )
}
