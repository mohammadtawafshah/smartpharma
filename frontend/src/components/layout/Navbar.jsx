import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import {
  FiSearch, FiMenu, FiX, FiUser, FiLogOut,
  FiHeart, FiBell, FiShield, FiClock
} from 'react-icons/fi'
import { GiMedicines } from 'react-icons/gi'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [query, setQuery]             = useState('')
  const [menuOpen, setMenuOpen]       = useState(false)
  const [dropOpen, setDropOpen]       = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSug, setShowSug]         = useState(false)
  const [history, setHistory]         = useState([])
  const searchRef = useRef(null)

  useEffect(() => { setDropOpen(false); setShowSug(false) }, [location.pathname])

  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest('#user-dropdown')) setDropOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSug(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchHistory() {
    if (!user) return
    if (history.length > 0) return
    try {
      const res = await api.get('/history?page=1')
      const terms = (res.data?.data || []).map(r => r.keyword).filter(k => k && k.length >= 2)
      const unique = [...new Set(terms)].slice(0, 20)
      setHistory(unique)
      setSuggestions(unique.slice(0, 6))
    } catch {}
  }

  function handleFocus() {
    if (!user) return
    fetchHistory()
    setShowSug(true)
    setSuggestions(history.slice(0, 6))
  }

  function handleQueryChange(e) {
    const val = e.target.value
    setQuery(val)
    if (!val.trim()) {
      setSuggestions(history.slice(0, 6))
    } else {
      const filtered = history.filter(h => h.toLowerCase().includes(val.toLowerCase()))
      setSuggestions(filtered.slice(0, 6))
    }
    setShowSug(true)
  }

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim().length < 2) return
    setShowSug(false)
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    setQuery('')
    setMenuOpen(false)
  }

  function pickSuggestion(term) {
    setShowSug(false)
    setQuery('')
    navigate(`/search?q=${encodeURIComponent(term)}`)
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path
    ? 'text-primary-600 font-semibold'
    : 'text-gray-600 hover:text-primary-600'

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-primary-600 text-white p-1.5 rounded-lg">
              <GiMedicines size={22} />
            </div>
            <span className="font-bold text-gray-900 text-lg hidden sm:block">
              Smart<span className="text-primary-600">Pharma</span>
            </span>
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl" ref={searchRef}>
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={query}
                onChange={handleQueryChange}
                onFocus={handleFocus}
                placeholder="Search drugs, herbs, conditions..."
                className="input pl-10 pr-4 py-2 text-sm bg-gray-50"
                autoComplete="off"
              />
              {/* Suggestions dropdown */}
              {showSug && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <p className="px-3 pt-2 pb-1 text-[11px] text-gray-400 font-medium uppercase tracking-wide">Recent Searches</p>
                  {suggestions.map((term, i) => (
                    <button
                      key={i}
                      type="button"
                      onMouseDown={() => pickSuggestion(term)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 text-left transition-colors"
                    >
                      <FiClock size={13} className="text-gray-400 flex-shrink-0"/>
                      {term}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* Nav links — desktop */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/drugs"  className={isActive('/drugs')}>Drugs</Link>
            <Link to="/herbs"  className={isActive('/herbs')}>Herbs</Link>
            <Link to="/about"  className={isActive('/about')}>About</Link>

            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-semibold">
                    <FiShield size={15}/> Admin
                  </Link>
                )}
                <Link to="/favorites" className={`flex items-center gap-1 ${isActive('/favorites')}`}>
                  <FiHeart size={15}/> Favorites
                </Link>
                <Link to="/alerts" className="relative flex items-center gap-1 text-gray-600 hover:text-primary-600">
                  <FiBell size={15}/>
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">!</span>
                </Link>
                <div className="relative" id="user-dropdown">
                  <button onClick={() => setDropOpen(!dropOpen)} className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
                    <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
                      {user.full_name?.[0] || user.email?.[0] || 'U'}
                    </div>
                  </button>
                  {dropOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50">
                      <Link to="/dashboard" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl">
                        <FiUser size={14}/> Dashboard
                      </Link>
                      <Link to="/profile/health" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                        Health Profile
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-xl">
                        <FiLogOut size={14}/> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login"    className="text-gray-600 hover:text-primary-600">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Register</Link>
              </>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600">
            {menuOpen ? <FiX size={22}/> : <FiMenu size={22}/>}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-3">
            <form onSubmit={handleSearch} className="flex">
              <div className="relative w-full">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="input pl-9 py-2 text-sm"
                />
              </div>
            </form>
            <div className="flex flex-col gap-2 text-sm font-medium">
              <Link to="/drugs"  onClick={() => setMenuOpen(false)} className="py-2 text-gray-700">Drugs</Link>
              <Link to="/herbs"  onClick={() => setMenuOpen(false)} className="py-2 text-gray-700">Herbs</Link>
              <Link to="/about"  onClick={() => setMenuOpen(false)} className="py-2 text-gray-700">About</Link>
              {user ? (
                <>
                  <Link to="/dashboard"     onClick={() => setMenuOpen(false)} className="py-2 text-gray-700">Dashboard</Link>
                  <Link to="/profile/health" onClick={() => setMenuOpen(false)} className="py-2 text-gray-700">Health Profile</Link>
                  {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="py-2 text-purple-600 font-semibold">Admin Panel</Link>}
                  <button onClick={handleLogout} className="text-left py-2 text-red-600">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login"    onClick={() => setMenuOpen(false)} className="py-2 text-gray-700">Login</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="py-2 text-primary-600 font-semibold">Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
