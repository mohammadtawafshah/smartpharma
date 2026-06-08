import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { FiSearch, FiLoader } from 'react-icons/fi'
import api from '../../services/api'
import DrugCard from '../../components/common/DrugCard'
import HerbCard from '../../components/common/HerbCard'

export default function SearchResultsPage() {
  const [params]       = useSearchParams()
  const navigate       = useNavigate()
  const q              = params.get('q') || ''

  const [query,    setQuery]   = useState(q)
  const [drugs,    setDrugs]   = useState([])
  const [herbs,    setHerbs]   = useState([])
  const [loading,  setLoading] = useState(false)
  const [searched, setSearched]= useState('')

  // Run search when URL query changes
  useEffect(() => {
    if (q.trim().length < 2) { setDrugs([]); setHerbs([]); return }
    setLoading(true)
    setSearched(q)
    api.get('/search', { params: { q } })
      .then(r => {
        setDrugs(r.data.drugs || [])
        setHerbs(r.data.herbs || [])
      })
      .catch(() => { setDrugs([]); setHerbs([]) })
      .finally(() => setLoading(false))
  }, [q])

  function handleSubmit(e) {
    e.preventDefault()
    if (query.trim().length < 2) return
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const total = drugs.length + herbs.length

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Search bar */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative max-w-2xl">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search drugs, herbs, ingredients..."
            className="input pl-11 pr-4 py-3 text-base rounded-xl shadow-sm w-full"
            autoFocus
          />
          <button type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-1.5 px-4 text-sm">
            Search
          </button>
        </div>
      </form>

      {/* Query heading */}
      {searched && (
        <div className="mb-6">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <FiSearch size={13}/>
            <span>Results for</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">"{searched}"</h1>
          {!loading && <p className="text-gray-500 text-sm mt-1">{total} result{total !== 1 ? 's' : ''} found</p>}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
          <FiLoader className="animate-spin" size={24}/>
          <span className="text-sm">Searching...</span>
        </div>
      )}

      {/* No results */}
      {!loading && searched && total === 0 && (
        <div className="text-center py-20">
          <FiSearch size={48} className="mx-auto mb-3 text-gray-200"/>
          <p className="font-medium text-lg text-gray-500">No results found for "{searched}"</p>
          <p className="text-sm text-gray-400 mt-2">Try different keywords — drug name, brand name, or herb benefit.</p>
          <div className="flex gap-3 justify-center mt-6">
            <Link to="/drugs" className="btn-primary text-sm">Browse All Drugs</Link>
            <Link to="/herbs" className="btn-secondary text-sm">Browse All Herbs</Link>
          </div>
        </div>
      )}

      {/* Empty state — no query yet */}
      {!loading && !searched && (
        <div className="text-center py-20">
          <FiSearch size={48} className="mx-auto mb-3 text-gray-200"/>
          <p className="text-gray-400 text-sm">Enter a keyword above to search drugs and herbs.</p>
        </div>
      )}

      {/* Results */}
      {!loading && total > 0 && (
        <div className="space-y-10">
          {drugs.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                💊 Drugs <span className="text-sm font-normal text-gray-400">({drugs.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {drugs.map(d => <DrugCard key={d.id} drug={d}/>)}
              </div>
            </section>
          )}
          {herbs.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                🌿 Herbs <span className="text-sm font-normal text-gray-400">({herbs.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {herbs.map(h => <HerbCard key={h.id} herb={h}/>)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
