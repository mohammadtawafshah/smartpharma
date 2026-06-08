import { useState, useEffect } from 'react'
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { GiHerbsBundle } from 'react-icons/gi'
import api from '../../services/api'
import HerbCard from '../../components/common/HerbCard'

export default function HerbsPage() {
  const [herbs,       setHerbs]       = useState([])
  const [total,       setTotal]       = useState(0)
  const [pages,       setPages]       = useState(1)
  const [page,        setPage]        = useState(1)
  const [loading,     setLoading]     = useState(true)
  const [query,       setQuery]       = useState('')
  const [safeFilter,  setSafeFilter]  = useState('')

  useEffect(() => {
    setLoading(true)
    const params = { page }
    if (query.trim())  params.q              = query.trim()
    if (safeFilter !== '') params.pregnancy_safe = safeFilter

    api.get('/herbs', { params })
      .then(r => {
        setHerbs(r.data.data  || [])
        setTotal(r.data.total || 0)
        setPages(r.data.pages || 1)
      })
      .catch(() => setHerbs([]))
      .finally(() => setLoading(false))
  }, [page, query, safeFilter])

  function handleQuery(v) { setQuery(v);      setPage(1) }
  function handleSafe(v)  { setSafeFilter(v); setPage(1) }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl">
          <GiHerbsBundle size={26}/>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Herb Encyclopedia</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {loading ? 'Loading...' : `${total} medicinal herbs`}
          </p>
        </div>
      </div>

      <div className="card mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
          <input
            value={query}
            onChange={e => handleQuery(e.target.value)}
            placeholder="Search herbs by name, benefit, scientific name..."
            className="input pl-9 text-sm"
          />
        </div>
        <select value={safeFilter} onChange={e => handleSafe(e.target.value)} className="input sm:w-52 text-sm">
          <option value="">All Herbs</option>
          <option value="1">Pregnancy Safe Only</option>
          <option value="0">Pregnancy Caution</option>
        </select>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"/>
        </div>
      )}

      {!loading && herbs.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <GiHerbsBundle size={48} className="mx-auto mb-3 opacity-30"/>
          <p className="font-medium">No herbs found.</p>
        </div>
      )}

      {!loading && herbs.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-4">{total} result{total !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {herbs.map(herb => <HerbCard key={herb.id} herb={herb}/>)}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <FiChevronLeft size={18}/>
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    page === p ? 'bg-emerald-600 text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}>{p}</button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <FiChevronRight size={18}/>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
