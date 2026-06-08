import { useState, useEffect } from 'react'
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { GiMedicines } from 'react-icons/gi'
import api from '../../services/api'
import DrugCard from '../../components/common/DrugCard'

export default function DrugsPage() {
  const [drugs,       setDrugs]       = useState([])
  const [total,       setTotal]       = useState(0)
  const [pages,       setPages]       = useState(1)
  const [page,        setPage]        = useState(1)
  const [loading,     setLoading]     = useState(true)
  const [query,       setQuery]       = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [rxFilter,    setRxFilter]    = useState('')
  const [classes,     setClasses]     = useState([])

  // Fetch classes once
  useEffect(() => {
    api.get('/drugs/classes').then(r => setClasses(r.data || [])).catch(() => {})
  }, [])

  // Fetch drugs on filter/page change
  useEffect(() => {
    setLoading(true)
    const params = { page }
    if (query.trim())  params.q     = query.trim()
    if (classFilter)   params.class = classFilter
    if (rxFilter)      params.rx    = rxFilter

    api.get('/drugs', { params })
      .then(r => {
        setDrugs(r.data.data  || [])
        setTotal(r.data.total || 0)
        setPages(r.data.pages || 1)
      })
      .catch(() => setDrugs([]))
      .finally(() => setLoading(false))
  }, [page, query, classFilter, rxFilter])

  // Reset page on filter change
  function handleQuery(v)  { setQuery(v);       setPage(1) }
  function handleClass(v)  { setClassFilter(v); setPage(1) }
  function handleRx(v)     { setRxFilter(v);    setPage(1) }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary-100 text-primary-600 p-3 rounded-2xl">
          <GiMedicines size={26}/>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Drug Directory</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {loading ? 'Loading...' : `${total} medications with safety information`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
          <input
            value={query}
            onChange={e => handleQuery(e.target.value)}
            placeholder="Search drugs by name, ingredient, brand..."
            className="input pl-9 text-sm"
          />
        </div>
        <select value={classFilter} onChange={e => handleClass(e.target.value)} className="input sm:w-52 text-sm">
          <option value="">All Classes</option>
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={rxFilter} onChange={e => handleRx(e.target.value)} className="input sm:w-36 text-sm">
          <option value="">Rx / OTC</option>
          <option value="Rx">Rx Only</option>
          <option value="OTC">OTC</option>
          <option value="Both">Both</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"/>
        </div>
      )}

      {/* Empty */}
      {!loading && drugs.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <GiMedicines size={48} className="mx-auto mb-3 opacity-30"/>
          <p className="font-medium">No drugs found for your filters.</p>
        </div>
      )}

      {/* Results */}
      {!loading && drugs.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-4">{total} result{total !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {drugs.map(drug => <DrugCard key={drug.id} drug={drug}/>)}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <FiChevronLeft size={18}/>
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pages || Math.abs(p - page) <= 2)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i-1] > 1) acc.push('...')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) => p === '...'
                  ? <span key={`dots-${i}`} className="px-2 text-gray-400">…</span>
                  : <button key={p} onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        page === p ? 'bg-primary-600 text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}>{p}</button>
                )}
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
