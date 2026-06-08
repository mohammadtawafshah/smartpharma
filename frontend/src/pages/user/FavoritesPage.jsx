import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { FiHeart, FiTrash2 } from 'react-icons/fi'
import { GiMedicines, GiHerbsBundle } from 'react-icons/gi'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    api.get('/favorites').then(r => setFavorites(r.data)).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  async function handleRemove(type, id) {
    await api.post('/favorites', { item_type: type, item_id: id }).catch(()=>{})
    setFavorites(f => f.filter(x => !(x.item_type===type && x.item_id===id)))
  }

  const drugs = favorites.filter(f => f.item_type === 'drug')
  const herbs  = favorites.filter(f => f.item_type === 'herb')

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"/></div>

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-rose-100 text-rose-600 p-3 rounded-2xl"><FiHeart size={24}/></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-500 text-sm">{favorites.length} saved items</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="card text-center py-16">
          <FiHeart className="text-gray-300 mx-auto mb-3" size={40}/>
          <p className="text-gray-500 font-medium">No favorites yet</p>
          <p className="text-gray-400 text-sm mt-1">Browse drugs and herbs and click the heart icon to save them.</p>
          <div className="flex gap-3 justify-center mt-5">
            <Link to="/drugs" className="btn-primary text-sm">Browse Drugs</Link>
            <Link to="/herbs" className="btn-secondary text-sm">Browse Herbs</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {drugs.length > 0 && (
            <div>
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><GiMedicines className="text-primary-500"/> Drugs ({drugs.length})</h2>
              <div className="space-y-2">
                {drugs.map(fav => (
                  <div key={fav.id} className="card flex items-center justify-between py-3">
                    <Link to={`/drugs/${fav.item_id}`} className="font-medium text-gray-900 hover:text-primary-600">{fav.name}</Link>
                    <button onClick={() => handleRemove('drug', fav.item_id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><FiTrash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {herbs.length > 0 && (
            <div>
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><GiHerbsBundle className="text-emerald-500"/> Herbs ({herbs.length})</h2>
              <div className="space-y-2">
                {herbs.map(fav => (
                  <div key={fav.id} className="card flex items-center justify-between py-3">
                    <Link to={`/herbs/${fav.item_id}`} className="font-medium text-gray-900 hover:text-emerald-600">{fav.name}</Link>
                    <button onClick={() => handleRemove('herb', fav.item_id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><FiTrash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
