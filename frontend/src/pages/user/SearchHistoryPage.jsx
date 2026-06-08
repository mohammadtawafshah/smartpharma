import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { FiClock, FiTrash2, FiSearch } from 'react-icons/fi'

export default function SearchHistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/history').then(r => setHistory(r.data.data || [])).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  async function clearAll() {
    if (!window.confirm('Clear all search history?')) return
    await api.delete('/history').catch(()=>{})
    setHistory([])
  }

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"/></div>

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl"><FiClock size={24}/></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Search History</h1>
            <p className="text-gray-500 text-sm">{history.length} searches</p>
          </div>
        </div>
        {history.length > 0 && (
          <button onClick={clearAll} className="btn-danger text-sm flex items-center gap-2">
            <FiTrash2 size={14}/> Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="card text-center py-16">
          <FiClock className="text-gray-300 mx-auto mb-3" size={40}/>
          <p className="text-gray-500 font-medium">No search history</p>
          <p className="text-gray-400 text-sm mt-1">Your searches will appear here.</p>
          <Link to="/search" className="btn-primary mt-5 inline-flex items-center gap-2 text-sm"><FiSearch size={14}/> Start Searching</Link>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          {history.map((item, i) => (
            <Link key={i} to={`/search?q=${encodeURIComponent(item.keyword)}`}
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
              <FiSearch className="text-gray-300 flex-shrink-0" size={16}/>
              <span className="flex-1 text-sm text-gray-800">{item.keyword}</span>
              <span className="text-xs text-gray-400">{new Date(item.searched_at).toLocaleDateString()}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
